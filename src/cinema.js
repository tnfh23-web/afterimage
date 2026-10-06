import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {assetUrl} from './asset-url';
import {batchRoomArchitecture} from './static-room-batches';
import {CINEMA_ID,cinema,cinemaGround} from './cinema-layout';
import {theatreSeats} from './seating';

export function cinemaStairs(root,mats,cube,obstacles,floorRects,label){
 const stone=mats.ceramic,rail=mats.edge,glow=mats.light;
 const flights=[{x:4.3,sign:-1,base:0},{x:6.25,sign:1,base:4.1}];
 for(const flight of flights){
  for(let i=0;i<20;i++){
   const z=flight.sign<0?-2.6-(i+.5)*.37:-10+(i+.5)*.37,height=flight.base+(i+1)*.205;
   cube(root,1.65,height,.37,flight.x,height/2,z,stone);
   cube(root,1.62,.014,.025,flight.x,height+.008,z-flight.sign*.17,glow);
  }
  for(const x of [flight.x-.82,flight.x+.82]){
   const mesh=cube(root,.045,Math.hypot(7.4,4.1),.045,x,flight.base+3.08,-6.3,rail);mesh.rotation.x=flight.sign*Math.atan2(7.4,4.1);
   for(let i=0;i<8;i++){const z=flight.sign<0?-2.6-i*.99:-10+i*.99,y=flight.base+i/7*4.1;cube(root,.027,1.04,.027,x,y+.52,z,rail);}
   obstacles.push({x,z:-6.3,w:.08,d:7.4,minY:0,maxY:10});
  }
 }
 cube(root,3.6,.2,1.5,5.28,4,-10.75,stone);
 cube(root,7.05,.2,1.8,8.925,8.1,-1.7,stone);
 for(const z of [-2.6,-.8]){
  cube(root,4.5,.045,.045,9.7,9.2,z,rail);
  for(let i=0;i<7;i++)cube(root,.035,1,.035,7.55+i*.7,8.7,z,rail);
  obstacles.push({x:9.7,z,w:4.5,d:.09,minY:8.2,maxY:10});
 }
 const sign=label('2F  상영관',1.6,.55);sign.position.set(4.3,1.5,-2.55);root.add(sign);
 floorRects.push({x:8.925,z:-1.7,w:7.05,d:1.8,y:8.2});
 floorRects.push({x:5.28,z:-10.75,w:3.6,d:1.5,y:4.1});
 return {
  heightAt(x,z){
   if(z>=-10&&z<=-2.6){
    if(Math.abs(x-4.3)<.825)return (-z-2.6)/7.4*4.1;
    if(Math.abs(x-6.25)<.825)return 4.1+(z+10)/7.4*4.1;
   }
   return null;
  },
 };
}

export function createCinema(scene,mats,cube,label,loader,floorRects,obstacles,seats){
 const root=new T.Group();root.position.set(cinema.x,cinema.y,cinema.z);scene.add(root);
 const dark=new T.MeshStandardMaterial({color:0x141313,roughness:.93}),wood=new T.MeshStandardMaterial({color:0x513823,roughness:.9}),seat=new T.MeshStandardMaterial({color:0x37332e,roughness:.94}),warm=new T.MeshBasicMaterial({color:0xc08c50,toneMapped:false});
 cube(root,16,.2,26,0,-.1,0,dark);cube(root,16,.22,26,0,9.2,0,dark);
 cube(root,16,9.2,.3,0,4.6,-13,dark);cube(root,16,9.2,.3,0,4.6,13,dark);
 // The west side aperture aligns with the upper bridge at world z -1.7.
 cube(root,.3,9.2,8.3,-8,4.6,-8.85,dark);cube(root,.3,9.2,15.7,-8,4.6,5.15,dark);cube(root,.3,6.4,2,-8,6,-3.7,dark);
 cube(root,.3,9.2,26,8,4.6,0,dark);
 for(const x of [-7.75,7.75]){
  for(let i=0;i<65;i++){const z=-12.5+i*.39;if(x<0&&Math.abs(z+3.7)<1.12)continue;cube(root,.09,7.9,.09,x,4.05,z,wood);}
  cube(root,.035,.025,24,x,.14,0,warm);
 }
 for(let i=0;i<4;i++){const z=.4+i*3.6,height=(i+1)*.24;cube(root,15.5,height,13-z,0,height/2,(z+13)/2,dark);cube(root,2.25,.018,.03,0,height+.01,z,warm);}
 for(const z of [-10,-3,4,11]){cube(root,14,.08,.12,0,9.1,z,mats.black);for(const x of [-6.8,6.8])cube(root,.04,.015,.2,x,9.04,z,warm);}
 const placements=[];for(let row=0;row<4;row++)for(const side of [-1,1])for(let col=0;col<4;col++)placements.push({x:side*(1.8+col*1.58),z:1.6+row*3.6,y:(row+1)*.24});
 const part=(w,h,d,dy,dz,arm=false)=>{
  const mesh=new T.InstancedMesh(new RoundedBoxGeometry(w,h,d,2,.055),seat,placements.length*(arm?2:1)),dummy=new T.Object3D();let index=0;
  for(const p of placements){for(const dx of arm?[-.64,.64]:[0]){dummy.position.set(p.x+dx,p.y+dy,p.z+dz);dummy.updateMatrix();mesh.setMatrixAt(index++,dummy.matrix);}}
  mesh.receiveShadow=true;root.add(mesh);
 };
 part(1.18,.22,1,.4,0);part(1.21,1.04,.24,.86,.5);part(1.12,.34,.86,.18,0);part(.16,.38,.94,.57,0,true);
 theatreSeats(seats,cinema,placements);
 placements.forEach(p=>obstacles.push({x:cinema.x+p.x,z:cinema.z+p.z,w:1.38,d:1.3,y:cinema.y+p.y}));
 for(const [x,z,w,d] of [[0,-13,16,.3],[0,13,16,.3],[8,0,.3,26],[-8,-8.85,.3,8.3],[-8,5.15,.3,15.7]])obstacles.push({x:cinema.x+x,z:cinema.z+z,w,d,y:cinema.y,maxY:cinema.y+9.2});
 floorRects.push({x:cinema.x,z:cinema.z,w:16,d:26,y:cinema.y,heightAt:cinemaGround});
 cube(root,14.15,8.1,.19,0,4.67,-12.7,mats.black);
 const poster=loader.load(assetUrl('/media/afterglow-poster.jpg'));poster.colorSpace=T.SRGBColorSpace;
 const screenMaterial=new T.MeshBasicMaterial({map:poster,toneMapped:false});
 const screen=new T.Mesh(new T.PlaneGeometry(13.4,7.5375),screenMaterial);screen.position.set(0,4.75,-12.56);root.add(screen);
 const exit=label('1F  채광 홀',1.4,.5,'#eeeae2');exit.position.set(-7.72,2.1,-3.7);exit.rotation.y=Math.PI/2;root.add(exit);
 const pool=new T.PointLight(0xe7b981,25,23,2);pool.position.set(0,4,-10);root.add(pool);
 for(const [x,z] of [[-6.5,6],[6.5,6]]){const fill=new T.PointLight(0xb98550,18,16,2);fill.position.set(x,2,z);root.add(fill);}
 const key=new T.SpotLight(0xffdca1,12,30,1,.9,2);key.position.set(0,8,8);key.target.position.set(0,0,0);root.add(key,key.target);
 const wash=new T.SpotLight(0xf6b86c,8,25,1,1,2);wash.position.set(0,8,-8);wash.target.position.set(0,0,-4);root.add(wash,wash.target);
 batchRoomArchitecture(root);
 const video=document.createElement('video');video.preload='none';video.playsInline=true;video.loop=true;video.muted=true;video.setAttribute('playsinline','');video.poster=assetUrl('/media/afterglow-poster.jpg');
 video.id='cinema-film-media';video.hidden=true;video.setAttribute('aria-hidden','true');document.body.appendChild(video);
 let texture,loaded=false,inside=false,visible=true,wantsPlay=true,soundEnabled=true,volume=.35,error='';
 const revealVideo=()=>{if(!texture){texture=new T.VideoTexture(video);texture.colorSpace=T.SRGBColorSpace;screenMaterial.map=texture;screenMaterial.needsUpdate=true;}};video.addEventListener('loadeddata',revealVideo);
 const play=()=>{if(!inside||!visible||!wantsPlay||document.hidden)return;video.play().then(()=>{error='';}).catch(()=>{video.muted=true;video.play().catch(()=>{error='재생 버튼을 눌러 영상을 시작해 주세요.';});});};
 const refresh=()=>{if(inside&&visible&&wantsPlay&&!document.hidden)play();else video.pause();};
 const visibility=()=>refresh();document.addEventListener('visibilitychange',visibility);
 const gesture=()=>{if(inside&&soundEnabled){video.muted=false;play();}};window.addEventListener('pointerdown',gesture,{passive:true});
 const film={
  video,
  enter(value){inside=value;if(value&&!loaded){loaded=true;video.src=assetUrl('/media/afterglow.mp4');}if(value){video.muted=!soundEnabled;video.volume=volume;}refresh();},
  visible(value){visible=value;refresh();},
  sound(enabled,nextVolume){soundEnabled=enabled;volume=nextVolume;video.muted=!enabled;video.volume=volume;},
  toggle(){if(video.error){error='';video.load();wantsPlay=true;}else wantsPlay=!wantsPlay;refresh();},
  restart(){video.currentTime=0;wantsPlay=true;refresh();},
  seek(time){video.currentTime=Math.max(0,Math.min(video.duration||48,time));},
  state(){return {time:video.currentTime,duration:Number.isFinite(video.duration)?video.duration:48,playing:inside&&!video.paused,loaded:video.readyState>=2,error:error|| (video.error?'영상을 불러오지 못했어요. 다시 재생해 주세요.':'')};},
  dispose(){window.removeEventListener('pointerdown',gesture);document.removeEventListener('visibilitychange',visibility);video.removeEventListener('loadeddata',revealVideo);video.pause();video.removeAttribute('src');video.load();video.remove();texture?.dispose();poster.dispose();},
 };
 return {root,film};
}
