import {assetUrl} from './asset-url';
import * as T from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {rooms,paintingUrl} from './data';
import {ATRIUM_ID,atrium,passages,doorOpenings} from './building-layout';
import {CINEMA_ID,cinema,cinemaGround} from './cinema-layout';
import {createCinema,cinemaStairs} from './cinema';
import {galleryFloor,galleryPassages,atriumShell} from './building-architecture';
import {detailMaterials,hallDetails,roomDetails} from './gallery-details';
import {materials} from './materials';
import {createSculpture,extrudePortal} from './sculptures';
import {angularMotion} from './angular-motion';
import {roomShell,particleProjection} from './room-architecture';
import {sceneEffects} from './scene-effects';
import {batchRoomArchitecture} from './static-room-batches';
import {prepareRooms} from './room-preparation';
import {lightingRig} from './lighting-rig';
import {roomLighting} from './room-lighting';
import {preparationFrame} from './preparation-scheduler';

export async function createExhibition(host,events,{signal}={}){
 await preparationFrame();if(signal?.aborted)return null;
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6,Math.sqrt((host.clientWidth<700?950000:1800000)/(host.clientWidth*host.clientHeight))));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;host.appendChild(renderer.domElement);
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','3D 전시. W A S D 이동, 화면 드래그로 시선, Space 점프, E 작품 선택.');
 renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 const zones=[...rooms,atrium,cinema];
 const scene=new T.Scene();scene.background=new T.Color(0xece5d8);scene.fog=new T.Fog(0xece5d8,35,100);
 await preparationFrame();
 const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;scene.environmentIntensity=.48;
 const camera=new T.PerspectiveCamera(50,host.clientWidth/host.clientHeight,.06,100);camera.rotation.order='YXZ';
 const mats=Object.assign(materials(),detailMaterials()),selectable=[],animations=[],floorRects=[],obstacles=[],groups=[],roomFloors=[],spots=[],keys=new Set(),ray=new T.Raycaster(),mouse=new T.Vector2();
 let prepared=false,current=ATRIUM_ID,enabled=false,presentationVisible=false,motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,disposed=false,frame,drag=null,touch=null,nearest=null,oldHint='',inspect=null,rotate=false,transition=null,elapsed=0,lastScan=0,lastTime=performance.now();
 let jumpHeight=0,jumpVelocity=0,groundHeight=0;
 const eyeHeight=1.75,gravity=13,jumpSpeed=4.6;
 const cinemaSeatZ=()=>host.clientWidth<700?6.4:14.2;
 const defaultPosition=id=>id===CINEMA_ID?new T.Vector3(20,cinemaGround(20,cinemaSeatZ())+eyeHeight,cinemaSeatZ()):id===ATRIUM_ID?new T.Vector3(0,1.75,15):new T.Vector3(rooms[id].x+(id===0||id>=6?-5.2:id===2?-.8:-3.5),1.75,rooms[id].z+rooms[id].d/2-1.5);
 const defaultTarget=id=>id===CINEMA_ID?new T.Vector3(20,cinema.y+(host.clientWidth<700?4.3:2.7),-10.56):id===ATRIUM_ID?new T.Vector3(0,2.6,-8):new T.Vector3(rooms[id].x+(id===0||id>=6?-1.7:id===1?.5:1),1.92,rooms[id].z-.8);
 camera.position.copy(defaultPosition(ATRIUM_ID));camera.lookAt(defaultTarget(ATRIUM_ID));
 const look=angularMotion(camera.rotation.y,camera.rotation.x,-1.1,1.1);
 const orbit=angularMotion(0,.05,-.2,.55);let rotationSpeed=0,stepDistance=0,shadowTime=0,renderScale=1,perfTime=0,perfFrames=0,perfNext=performance.now()+3500;
 const hemi=new T.HemisphereLight(0xb9c5ce,0x3a3025,.9);scene.add(hemi);
 let lightMood=roomLighting[ATRIUM_ID];const moodSky=new T.Color(lightMood.sky),moodGround=new T.Color(lightMood.ground);
 const blendLighting=dt=>{const blend=prepared&&motion?1-Math.exp(-dt*6):1;hemi.color.lerp(moodSky,blend);hemi.groundColor.lerp(moodGround,blend);hemi.intensity=T.MathUtils.lerp(hemi.intensity,lightMood.ambient,blend);scene.environmentIntensity=T.MathUtils.lerp(scene.environmentIntensity,lightMood.environment,blend);};
 const cube=(parent,w,h,d,x,y,z,mat)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;parent.add(m);return m;};
 const doors=doorOpenings(zones);
 function label(text,w=1.2,h=.8,color='#34302a'){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.clearRect(0,0,512,256);ctx.fillStyle=color;let size=70;ctx.font=`400 ${size}px Pretendard, sans-serif`;while(ctx.measureText(text).width>440&&size>20){size-=2;ctx.font=`400 ${size}px Pretendard, sans-serif`;}ctx.fillText(text,35,105);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));return m;}
 const pendingPaintings=[];
 const placeholder=document.createElement('canvas');placeholder.width=placeholder.height=1;const placeholderContext=placeholder.getContext('2d');placeholderContext.fillStyle='#bcb9b1';placeholderContext.fillRect(0,0,1,1);
 let buildingDone=false,assetBatchDone=false,preparing=false;
 const manager=new T.LoadingManager();manager.onStart=()=>{assetBatchDone=false;};manager.onProgress=(_url,loaded,total)=>events.progress?.(10+loaded/total*30,'빛과 질감 준비');manager.onLoad=()=>{assetBatchDone=true;if(buildingDone)prepare();};manager.onError=url=>{console.error('Exhibition asset missing:',url);events.error();};const artLoader=new T.TextureLoader(manager);
 async function prepare(){
  if(preparing||disposed)return;preparing=true;
  try{
   events.progress?.(40,'열 장면의 색을 불러오는 중');
   let loadedCount=0;
   await Promise.all(pendingPaintings.map(async item=>{
    const loaded=await new T.TextureLoader().loadAsync(item.url);
    if(disposed){loaded.dispose();return;}
    item.texture.dispose();item.texture.image=loaded.image;item.texture.needsUpdate=true;loaded.dispose();
    events.progress?.(40+(++loadedCount)/pendingPaintings.length*20,'회화의 색과 질감 준비');
   }));
   if(disposed)return;
   const textures=new Set();scene.traverse(object=>{(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>{if(material)Object.values(material).forEach(value=>{if(value?.isTexture)textures.add(value);});});});
   for(const texture of textures){if(disposed)return;renderer.initTexture(texture);await new Promise(resolve=>requestAnimationFrame(resolve));}
   events.progress?.(65,'전시의 빛을 켜는 중');
   await prepareRooms({renderer,scene,camera,rooms:zones,initialZone:ATRIUM_ID,spots,activate:activateLighting,position:defaultPosition,target:defaultTarget,progress:(...args)=>events.progress?.(...args),isDisposed:()=>disposed});
   if(disposed)return;
   // Allocate postprocessing targets and their shaders before revealing the scene.
   await effects.prepare();if(disposed)return;await preparationFrame();effects.render();prepared=true;lastTime=performance.now();perfNext=lastTime+500;events.progress?.(100,'열 개의 장면이 준비됐어요');events.ready();
  }catch(error){if(!disposed){console.error('Exhibition preparation failed',error);events.error();}}
 }
 const surface=(url,repeat)=>{const t=artLoader.load(assetUrl(url));t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=8;return t;};const slate=surface('/art/limestone-clean.webp',[4,4]),limestone=surface('/art/limestone-match.webp',[1,2]),patina=surface('/art/bronze-match.webp',[1,1]),rock=surface('/art/rock-match.webp',[2,2]);mats.wall.color.set(0xece5d8);mats.wall.roughness=.94;mats.ceiling.color.set(0xf1ece3);mats.floor.map=mats.floor.bumpMap=slate;mats.floor.color.set(0xeee7dc);mats.floor.bumpScale=.0015;mats.floor.roughness=.7;mats.floor.metalness=0;mats.grout=new T.MeshStandardMaterial({color:0xc7c0b4,roughness:.95});mats.bench=new T.MeshStandardMaterial({color:0x382b22,roughness:.7});mats.plinth.map=mats.plinth.bumpMap=patina;mats.plinth.color.set(0x424440);mats.plinth.roughness=.42;mats.stone.map=mats.stone.bumpMap=rock;mats.stone.color.set(0xaaa89e);mats.stone.bumpScale=.028;mats.ivory.map=mats.ivory.bumpMap=limestone;mats.ivory.color.set(0xd4ccb9);mats.ivory.bumpScale=.007;mats.ivory.roughness=.72;mats.bronze.map=mats.bronze.bumpMap=patina;mats.bronze.color.set(0x8c8379);mats.bronze.metalness=.78;mats.bronze.roughness=.48;mats.bronze.bumpScale=.015;mats.blue.map=mats.blue.bumpMap=limestone;mats.blue.bumpScale=.012;mats.blue.roughness=.4;mats.blue.color.set(0x577caf);mats.leaf=new T.MeshStandardMaterial({color:0xc9c1a6,metalness:.72,roughness:.33,side:T.DoubleSide,map:limestone});
 for(const r of rooms){
  const lighting=roomLighting[r.id],stripMaterial=new T.MeshBasicMaterial({color:lighting.strip});
  const root=new T.Group();root.position.set(r.x,0,r.z);scene.add(root);groups.push(root);floorRects.push({x:r.x,z:r.z,w:r.w,d:r.d});
  roomFloors.push(galleryFloor(root,r,mats,cube));
  obstacles.push(...roomShell(root,r,doors[r.id],mats,cube));
  for(let x of [-3.5,3.5]){cube(root,.06,.07,r.d-2,x,r.h-.12,0,mats.black);cube(root,r.id===4?.32:.025,.014,r.id===4?r.d-4:3.5,x,r.h-.17,0,stripMaterial);for(let z of [-4,0,4]){const fixture=new T.Mesh(new T.CylinderGeometry(.065,.085,.19,10),mats.black);fixture.position.set(x,r.h-.25,z);fixture.rotation.z=.25;root.add(fixture);}}
  const sculpture=createSculpture(r.id,mats);sculpture.group.position.set(1,.02,-.6);sculpture.group.userData.id=r.id;root.add(sculpture.group);selectable.push(sculpture.group);animations.push({id:r.id,updates:sculpture.animated});obstacles.push({x:r.x+1,z:r.z-.6,w:r.id===2?6.5:r.id===4?6.5:5.2,d:r.id===2?3.2:3.6});
  const spot=new T.SpotLight(lighting.key.color,lighting.key.power,24,lighting.key.angle,lighting.key.softness,2);spot.position.set(...lighting.key.position);spot.position.y=Math.min(r.h-.3,spot.position.y);spot.target.position.set(1,1.7,-.6);spot.castShadow=r.id===0;spot.shadow.mapSize.set(2048,2048);spot.shadow.bias=-.0002;spot.shadow.normalBias=.025;root.add(spot,spot.target);spots.push(spot);
  const ceilingFill=new T.PointLight(lighting.ceiling.color,lighting.ceiling.power,18,2);ceilingFill.position.set(-1,3.5,-2);root.add(ceilingFill);
  const fill=new T.PointLight(lighting.fill.color,lighting.fill.power,12,2);fill.position.set(...lighting.fill.position);fill.userData.peek=true;root.add(fill);
  const wallLight=new T.SpotLight(lighting.wash.color,lighting.wash.power,15,.8,.7,2);wallLight.position.set(r.id===3?2.4:-4,Math.min(r.h-.3,4.8),-r.d/2+3.6);wallLight.target.position.set(r.id===3?4.8:r.id===0?-5:-4.75,2.6,-r.d/2+.4);root.add(wallLight,wallLight.target);
  const texture=r.id===0?artLoader.load(paintingUrl(r.id)):new T.Texture(placeholder);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());if(r.id!==0){texture.needsUpdate=true;pendingPaintings.push({id:r.id,url:paintingUrl(r.id),texture});}
  const painting=new T.Group();painting.position.set(r.id===0?-.8:r.id===3?4.8:r.id===5?-4.45:-2.7,r.id===5?2.5:2.45,-r.d/2+.4);if(r.id!==3){painting.position.set(r.id===0?-5:-4.75,2.6,-r.d/2+.4);}painting.userData={id:r.id,kind:'painting'};const pw=r.id===2?3.35:r.id===3?1.5:r.id===5?2.8:4.6,ph=r.id===2?4.3:r.id===3?2.1:r.id===5?2.1:3.05;cube(painting,pw+.15,ph+.15,.12,0,0,0,mats.black);cube(painting,pw+.075,.035,.14,0,ph/2+.025,.02,mats.bronze);cube(painting,pw+.075,.035,.14,0,-ph/2-.025,.02,mats.bronze);cube(painting,.035,ph,.14,-pw/2-.025,0,.02,mats.bronze);cube(painting,.035,ph,.14,pw/2+.025,0,.02,mats.bronze);const pm=new T.Mesh(new T.PlaneGeometry(pw,ph),new T.MeshStandardMaterial({map:texture,roughness:.92,emissiveMap:texture,emissive:0xffffff,emissiveIntensity:.045}));pm.position.z=.085;painting.add(pm);root.add(painting);selectable.push(painting);
  const n=label(r.number,.8,.5);n.position.set(6.3,2.1,-r.d/2+.37);root.add(n);const placard=label(r.painting,Math.min(pw,2.5),.5);placard.position.set(painting.position.x,2.6-ph/2-.2,-r.d/2+.37);root.add(placard);
  roomDetails(root,r,mats,cube,obstacles);
  if(r.id===3)particleProjection(root,animations,r.d);
  if(r.id===5){const glow=new T.PointLight(0xffdfaa,12,6,2);glow.position.set(1,2.2,-.1);root.add(glow);}

  await preparationFrame();if(signal?.aborted){scene.traverse(object=>{object.geometry?.dispose();(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>material?.dispose());});env.dispose();pmrem.dispose();renderer.dispose();canvas.remove();return null;}
 }
 const hall=new T.Group();scene.add(hall);groups.push(hall);floorRects.push({x:atrium.x,z:atrium.z,w:atrium.w,d:atrium.d});
 roomFloors.push(galleryFloor(hall,atrium,mats,cube));obstacles.push(...atriumShell(hall,atrium,doors[ATRIUM_ID],mats,cube,label));hallDetails(hall,atrium,mats,cube,obstacles);
 const stairs=cinemaStairs(hall,mats,cube,obstacles,floorRects,label);
 const theatre=createCinema(scene,mats,cube,label,artLoader,floorRects,obstacles);groups.push(theatre.root);
 const corridorLights=galleryPassages(scene,passages,mats,cube,floorRects,obstacles);
 const bridgeLamp=new T.PointLight(0xffd6a1,10,10,2);bridgeLamp.position.set(10,10.1,-1.7);scene.add(bridgeLamp);corridorLights.push({a:ATRIUM_ID,b:CINEMA_ID,light:bridgeLamp});
 // One low-resolution planar reflection across the connected building, blended beneath tile material.
 const roomXs=rooms.map(r=>r.x),roomZs=rooms.map(r=>r.z),minX=Math.min(...roomXs),maxX=Math.max(...roomXs),minZ=Math.min(...roomZs),maxZ=Math.max(...roomZs);
 let reflectionDirty=true,reflectionNext=0,reflector=null;if(host.clientWidth>700){reflector=new Reflector(new T.PlaneGeometry(maxX-minX+22,maxZ-minZ+18),{clipBias:.002,textureWidth:640,textureHeight:480,multisample:0,color:0x9a9d96});reflector.position.set((minX+maxX)/2,-.012,(minZ+maxZ)/2);reflector.rotation.x=-Math.PI/2;const reflect=reflector.onBeforeRender;reflector.onBeforeRender=function(renderer,scene,...args){if(!scene.overrideMaterial&&(reflectionDirty||performance.now()>=reflectionNext)){reflectionDirty=false;reflectionNext=performance.now()+32;reflect.call(this,renderer,scene,...args);}};reflector.material.fragmentShader=reflector.material.fragmentShader.replace('vec4 base = texture2DProj( tDiffuse, vUv );','vec4 base = texture2DProj( tDiffuse, vUv ) * .4; base += texture2DProj( tDiffuse, vUv + vec4(.004*vUv.w,0.,0.,0.) ) * .15; base += texture2DProj( tDiffuse, vUv - vec4(.004*vUv.w,0.,0.,0.) ) * .15; base += texture2DProj( tDiffuse, vUv + vec4(0.,.004*vUv.w,0.,0.) ) * .15; base += texture2DProj( tDiffuse, vUv - vec4(0.,.004*vUv.w,0.,0.) ) * .15;');reflector.material.fragmentShader=reflector.material.fragmentShader.replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );','gl_FragColor = vec4(mix(vec3(dot(base.rgb,vec3(.2126,.7152,.0722))),base.rgb,.65)*color,1.0);');scene.add(reflector);roomFloors.forEach(f=>{f.material.transparent=true;f.material.opacity=.95;f.material.depthWrite=false;});}
 // Logo emblem and letterforms are actual extruded solid geometry on the entrance wall.
 const sign=new T.Group();sign.position.set(-7.65,4.4,4);sign.rotation.y=Math.PI/2;groups[0].add(sign);for(let i=0;i<2;i++){const m=extrudePortal(mats.black,.32,.59,.045,.045,true);m.position.set(i*.18,-i*.11,0);sign.add(m);}new FontLoader(manager).load(assetUrl('/fonts/helvetiker_bold.typeface.json'),font=>{const geo=new TextGeometry('AFTERIMAGE',{font,size:.23,depth:.025,curveSegments:5,bevelEnabled:false});const word=new T.Mesh(geo,mats.black);word.position.set(.72,.17,.02);word.scale.x=.72;sign.add(word);const hallSign=sign.clone(true);hallSign.position.set(-2.3,3.2,-16.62);hallSign.rotation.y=0;hallSign.scale.setScalar(2.2);hall.add(hallSign);});
 function updateFov(){camera.fov=current===CINEMA_ID?T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(27))/camera.aspect)):(host.clientWidth<600?72:50);camera.updateProjectionMatrix();}
 function activateLighting(id){rig.activate(id);if(reflector)reflector.visible=host.clientWidth>700&&id!==CINEMA_ID;lightMood=roomLighting[id];moodSky.set(lightMood.sky).lerp(new T.Color(0xfff7ec),id===CINEMA_ID?0:.48);moodGround.set(lightMood.ground).lerp(new T.Color(0xc8b8a4),id===CINEMA_ID?0:.35);if(!prepared||!motion)blendLighting(0);host.dataset.lighting=lightMood.name;scene.background.set(id===CINEMA_ID?0x101014:0xece5d8);scene.fog.color.copy(scene.background);updateFov();theatre.film.enter(prepared&&id===CINEMA_ID);}
 groups.forEach(batchRoomArchitecture);
 scene.traverse(object=>{if(object.isMesh&&!object.geometry.boundingBox)object.geometry.computeBoundingBox();});
 // The interaction selects an entire artwork, so a padded artwork bound is
 // sufficient. Walls still raycast normally and occlude artwork behind them.
 scene.updateMatrixWorld(true);
 selectable.filter(object=>object.userData.kind==='sculpture').forEach(object=>{
  const bounds=new T.Box3().setFromObject(object).expandByScalar(.12),point=new T.Vector3();
  object.raycast=(caster,hits)=>{if(caster.ray.intersectBox(bounds,point)){const distance=caster.ray.origin.distanceTo(point);if(distance>=caster.near&&distance<=caster.far)hits.push({distance,point:point.clone(),object});}return false;};
 });
 const rig=lightingRig(scene,groups,corridorLights);activateLighting(ATRIUM_ID);
 const effects=sceneEffects(renderer,scene,camera,host.clientWidth,host.clientHeight);
 function updateRoom(id){if(current===id)return;current=id;reflectionDirty=true;activateLighting(id);events.room(id);renderer.shadowMap.needsUpdate=true;}
 function heightAt(x,z,from=groundHeight){
  const ramp=stairs.heightAt(x,z);
  if(ramp!==null)return Math.abs(ramp-from)<.5?ramp:null;
  const candidates=floorRects.filter(r=>Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2).map(r=>r.heightAt?r.heightAt(x,z):(r.y||0)).filter(y=>Math.abs(y-from)<.5);
  return candidates.length?candidates.sort((a,b)=>Math.abs(a-from)-Math.abs(b-from))[0]:null;
 }
 function allowed(x,z){const radius=.22,y=heightAt(x,z);if(y===null)return false;const inside=[[-radius,-radius],[-radius,radius],[radius,-radius],[radius,radius]].every(([dx,dz])=>heightAt(x+dx,z+dz)!==null);return inside&&!obstacles.some(r=>y+.12<(r.maxY??((r.y||0)+2.2))&&y+eyeHeight>(r.minY??(r.y||0))&&Math.abs(x-r.x)<r.w/2+radius&&Math.abs(z-r.z)<r.d/2+radius);}
 function go(id){groundHeight=id===CINEMA_ID?defaultPosition(id).y-eyeHeight:0;jumpHeight=jumpVelocity=0;stepDistance=0;inspect=null;rotate=false;rotationSpeed=0;transition=null;camera.position.copy(defaultPosition(id));camera.lookAt(defaultTarget(id));look.sync(camera.rotation.y,camera.rotation.x);orbit.sync(0,.05);updateRoom(id);clear();setHint('');}
 function setHint(h){if(h!==oldHint){oldHint=h;events.hint(h);}}
 function objectAt(ndc){ray.setFromCamera(ndc,camera);const hits=ray.intersectObjects(scene.children.filter(object=>object.visible),true).filter(h=>h.object!==reflector&&!(h.object.material?.transparent&&h.object.material?.opacity<.2));if(!hits.length)return null;let obj=hits[0].object;while(obj&&!obj.userData.kind)obj=obj.parent;return obj;}
 function showArt(obj){if(obj)events.pick(obj.userData.id,obj.userData.kind);}
 function scan(){if(current===CINEMA_ID){nearest=null;setHint('');return;}const obj=objectAt(new T.Vector2(0,0));nearest=obj&&obj.userData.id===current&&camera.position.distanceTo(obj.getWorldPosition(new T.Vector3()))<10?obj:null;setHint(nearest?rooms[current][nearest.userData.kind==='painting'?'painting':'sculpture']:'');}
 function inspectArt(data){if(!data){if(inspect){camera.position.copy(inspect.savedPosition);camera.quaternion.copy(inspect.savedQuaternion);}inspect=null;rotate=false;rotationSpeed=0;transition=null;clear();look.sync(camera.rotation.y,camera.rotation.x);setHint('');return;}if(inspect)inspectArt(null);const savedPosition=camera.position.clone();savedPosition.y=eyeHeight;const savedQuaternion=camera.quaternion.clone(),sameRoom=current===data.id;go(data.id);const target=new T.Vector3(rooms[data.id].x+(data.kind==='sculpture'?1:data.id===3?4.8:data.id===0?-5:-4.75),data.kind==='sculpture'?2.05:2.6,rooms[data.id].z+(data.kind==='sculpture'?-.6:-rooms[data.id].d/2+.4));inspect={...data,target,savedPosition:sameRoom?savedPosition:camera.position.clone(),savedQuaternion:sameRoom?savedQuaternion:camera.quaternion.clone(),angle:0,tilt:.05,distance:data.kind==='sculpture'?6.7:5};orbit.sync(0,.05);updateInspect();}
 function resetInspect(){if(!inspect)return;rotate=false;rotationSpeed=0;drag=null;orbit.reset(motion);if(!motion){inspect.angle=orbit.state.x;inspect.tilt=orbit.state.y;updateInspect();}}
 function updateInspect(){const {target,angle,tilt,distance,kind}=inspect;const yaw=angle;camera.position.set(target.x+Math.sin(yaw)*distance,target.y+Math.sin(tilt)*distance,target.z+Math.cos(yaw)*distance);if(host.clientWidth>700)camera.lookAt(target.clone().add(new T.Vector3(1.1,0,0)));else camera.lookAt(target.clone().add(new T.Vector3(0,-.45,0)));}
 function pointerDown(e){if((!enabled&&!inspect)||drag||e.button!==0)return;e.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,travel:0,moved:false};(inspect?orbit:look).begin(performance.now());rotationSpeed=0;}
 function pointerMove(e){if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;drag.travel+=Math.hypot(dx,dy);if(drag.travel>6)drag.moved=true;const now=performance.now();if(inspect&&inspect.kind==='sculpture'){orbit.move(-dx*.006,dy*.004,now,motion);}else if(enabled){transition=null;look.move(-dx*.004,-dy*.003,now,motion);}}
 function pointerUp(e){if(!drag||drag.id!==e.pointerId)return;const clicked=!drag.moved;drag=null;(inspect?orbit:look).release(performance.now(),motion);if(clicked&&enabled){const rect=canvas.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);showArt(objectAt(mouse));}}
 function jump(){if(!enabled||inspect||document.hidden||jumpHeight>0||jumpVelocity>0)return;transition=null;jumpVelocity=jumpSpeed;stepDistance=0;}
 function keydown(e){if(!enabled||e.target.closest?.('button,a,input,textarea,select,[contenteditable="true"]'))return;if(e.code==='Space'){e.preventDefault();if(!e.repeat)jump();return;}if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}if(e.code==='KeyE'){e.preventDefault();showArt(nearest);}}
 function keyup(e){keys.delete(e.code);}
 function clear(){keys.clear();touch=null;drag=null;if(jumpHeight>0&&!inspect)camera.position.y=eyeHeight+groundHeight;jumpHeight=jumpVelocity=stepDistance=0;look.sync();orbit.sync();rotationSpeed=0;}
 function setRenderResolution(){const w=host.clientWidth,h=host.clientHeight;const budget=w<700?950000:1800000;const ratio=Math.min(devicePixelRatio,1.6,Math.sqrt(budget/(w*h)))*renderScale;renderer.setPixelRatio(ratio);renderer.setSize(w,h);effects.resize(w,h,ratio);host.dataset.renderScale=renderScale.toFixed(2);}
 function resize(){const w=host.clientWidth,h=host.clientHeight;setRenderResolution();if(reflector){reflector.visible=w>700&&current!==CINEMA_ID;roomFloors.forEach(floor=>{floor.material.opacity=w>700?.95:1;});}camera.aspect=w/h;updateFov();if(inspect)updateInspect();}
 const observer=new ResizeObserver(resize);observer.observe(host);canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',clear);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
 function tick(){if(disposed)return;frame=requestAnimationFrame(tick);const now=performance.now(),lastFrameTime=lastTime,dt=Math.min((now-lastTime)/1000,.04);lastTime=now;if(prepared&&!document.hidden&&presentationVisible){if(motion)elapsed+=dt;if(enabled){look.tick(dt,motion);camera.rotation.y=look.state.x;camera.rotation.x=look.state.y;let f=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),s=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);f+=touch?.forward||0;s+=touch?.side||0;if(f||s){const norm=Math.hypot(f,s),run=T.MathUtils.clamp((Math.hypot(touch?.forward||0,touch?.side||0)-.75)/.25,0,1),speed=dt*Math.min(1,norm)*(keys.has('ShiftLeft')||keys.has('ShiftRight')?5:T.MathUtils.lerp(2.8,5,run)),a=camera.rotation.y,oldX=camera.position.x,oldZ=camera.position.z;const dx=(-Math.sin(a)*f+Math.cos(a)*s)/norm*speed,dz=(-Math.cos(a)*f-Math.sin(a)*s)/norm*speed;if(allowed(camera.position.x+dx,camera.position.z)){camera.position.x+=dx;groundHeight=heightAt(camera.position.x,camera.position.z)??groundHeight;}if(allowed(camera.position.x,camera.position.z+dz)){camera.position.z+=dz;groundHeight=heightAt(camera.position.x,camera.position.z)??groundHeight;}if(jumpHeight===0&&jumpVelocity===0){stepDistance+=Math.hypot(camera.position.x-oldX,camera.position.z-oldZ);if(stepDistance>1.35){stepDistance=0;events.step?.();}}transition=null;}
 if(jumpHeight>0||jumpVelocity>0){jumpHeight+=jumpVelocity*dt-.5*gravity*dt*dt;jumpVelocity-=gravity*dt;if(jumpHeight<=0){jumpHeight=jumpVelocity=0;stepDistance=0;events.step?.();}camera.position.y=eyeHeight+groundHeight+jumpHeight;}
 camera.position.y=eyeHeight+groundHeight+jumpHeight;const occupied=zones.find(r=>groundHeight>=(r.y||0)-.1&&groundHeight<(r.y||0)+r.h&&Math.abs(camera.position.x-r.x)<r.w/2-.05&&Math.abs(camera.position.z-r.z)<r.d/2-.05);if(occupied)updateRoom(occupied.id);else if(groundHeight>=8&&camera.position.x<12.05&&camera.position.x>5.3&&camera.position.z>-2.65&&camera.position.z<-.75)updateRoom(ATRIUM_ID);lastScan+=dt;if(lastScan>.18){scan();lastScan=0;}}
 if(inspect&&inspect.kind==='sculpture'){const desired=rotate&&!orbit.state.held ? .24:0;rotationSpeed=motion?T.MathUtils.damp(rotationSpeed,desired,5,dt):desired;orbit.tick(dt,motion,rotationSpeed);inspect.angle=orbit.state.x;inspect.tilt=orbit.state.y;updateInspect();}
 if(transition){transition.t=Math.min(1,transition.t+dt/1.2);const t=1-Math.pow(1-transition.t,3);camera.position.lerpVectors(transition.from,transition.to,t);if(transition.t===1)transition=null;}
 animations.forEach(({id,updates})=>{if(groups[id].visible&&Math.abs(rooms[id].x-camera.position.x)<26&&Math.abs(rooms[id].z-camera.position.z)<26)updates.forEach(fn=>fn(elapsed));});shadowTime+=dt;if(motion&&shadowTime>.12&&animations.some(a=>a.id===current&&a.updates.length)){renderer.shadowMap.needsUpdate=true;shadowTime=0;}blendLighting(dt);effects.render();if(now>perfNext){perfTime+=now-lastFrameTime;perfFrames++;if(perfTime>=900){if(perfTime/perfFrames>19.5&&renderScale>.71){renderScale=Math.max(.7,renderScale*.9);setRenderResolution();}perfTime=perfFrames=0;perfNext=now+1200;}}host.dataset.position=`${camera.position.x.toFixed(2)},${camera.position.z.toFixed(2)}`;host.dataset.height=camera.position.y.toFixed(3);host.dataset.floor=groundHeight.toFixed(3);host.dataset.jumping=String(jumpHeight>0||jumpVelocity>0);host.dataset.view=`${camera.rotation.y.toFixed(3)},${camera.rotation.x.toFixed(3)}`;}}
 buildingDone=true;resize();tick();if(assetBatchDone)prepare();
 return {go,jump,film:theatre.film,watchFilm(){go(CINEMA_ID);canvas.focus({preventScroll:true});},enter(){if(motion)transition={from:camera.position.clone(),to:camera.position.clone().add(new T.Vector3(.3,0,-.4)),t:0};canvas.focus({preventScroll:true});},setEnabled(v){enabled=v;if(!v)clear();else canvas.focus({preventScroll:true});},setMotion(v){motion=v;clear();},setPresentationVisible(v){presentationVisible=v;theatre.film.visible(v);},inspect:inspectArt,rotate:v=>{rotate=v;orbit.state.vx=orbit.state.vy=0;},resetInspect,pickNearest:()=>showArt(nearest),setTouchVector(side,forward){if(enabled)touch={side:T.MathUtils.clamp(side,-1,1),forward:T.MathUtils.clamp(forward,-1,1)};},stopTouch(){touch=null;},dispose(){disposed=true;theatre.film.dispose();cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',clear);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{materials.add(m);if(o.customDepthMaterial)materials.add(o.customDepthMaterial);Object.values(m).forEach(t=>{if(t?.isTexture)textures.add(t);});});});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());reflector?.getRenderTarget().dispose();rig.shadowSpot.shadow.map?.dispose();env.dispose();pmrem.dispose();effects.dispose();renderer.dispose();canvas.remove();}};
}













