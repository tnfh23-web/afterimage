import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {ParametricGeometry} from 'three/addons/geometries/ParametricGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

export const DURATION=48;
const ease=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);
export function createFilm(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(1280,720,false);renderer.setPixelRatio(1);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene();scene.background=new T.Color(0x080e14);scene.fog=new T.FogExp2(0x080e14,.028);
 const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromScene(new RoomEnvironment(),.04);scene.environment=environment.texture;scene.environmentIntensity=.65;
 const camera=new T.PerspectiveCamera(45,16/9,.1,120);
 scene.add(new T.HemisphereLight(0xb5d3e6,0x191014,.8));
 for(const [x,y,z,color,power] of [[-5,6,5,0xffdb9d,18],[5,4,-4,0x8ac5ef,24],[0,8,0,0xffeccf,16]]){const light=new T.PointLight(color,power,24,2);light.position.set(x,y,z);scene.add(light);}
 const floor=new Reflector(new T.PlaneGeometry(80,80),{textureWidth:768,textureHeight:432,color:0x6f7c87,multisample:0,clipBias:.003});floor.rotation.x=-Math.PI/2;floor.position.y=-.015;scene.add(floor);
 const glassFloor=new T.Mesh(new T.PlaneGeometry(80,80),new T.MeshStandardMaterial({color:0x0e1921,roughness:.3,metalness:.8,transparent:true,opacity:.42,depthWrite:false}));glassFloor.rotation.x=-Math.PI/2;scene.add(glassFloor);
 const gold=new T.MeshStandardMaterial({color:0xdab578,metalness:.92,roughness:.32,transparent:true});
 const portalMat=new T.MeshStandardMaterial({color:0xd5b98a,emissive:0xffc076,emissiveIntensity:1.2,metalness:.7,roughness:.24,transparent:true});
 const portals=new T.Group();scene.add(portals);
 for(let i=0;i<9;i++){
  const frame=new T.Group();frame.position.set(Math.sin(i*.48)*1.1,0,-i*4);frame.rotation.y=Math.sin(i*.4)*.18;portals.add(frame);
  for(const [w,h,d,x,y] of [[.065,5.2,.08,-2.3,2.6],[.065,5.2,.08,2.3,2.6],[4.66,.065,.08,0,5.2]]){const m=new T.Mesh(new T.BoxGeometry(w,h,d),portalMat);m.position.set(x,y,0);frame.add(m);}
 }
 const sculpture=new T.Group();sculpture.position.y=2.95;scene.add(sculpture);
 const ribbons=[];
 for(let j=0;j<6;j++){
  const geometry=new ParametricGeometry((u,v,target)=>{
   const a=u*Math.PI*2,twist=a*1.5+j*Math.PI/3,w=(v-.5)*.72,r=1.72+.42*Math.sin(3*a)+w*Math.cos(twist);
   target.set(r*Math.cos(a),.68*Math.sin(3*a)+w*Math.sin(twist),r*Math.sin(a));
  },128,18);
  const mat=gold.clone();mat.side=T.DoubleSide;mat.color.setHSL(.095+j*.012,.5,.32+j*.012);
  const ribbon=new T.Mesh(geometry,mat);ribbon.rotation.set(j*.42,j*.8,j*.32);sculpture.add(ribbon);ribbons.push(ribbon);
 }
 // A fine orbit of fragments turns into an expanding constellation in act III.
 const fragmentMat=new T.MeshStandardMaterial({color:0xe8cd9c,metalness:.7,roughness:.3,emissive:0x7b5028,emissiveIntensity:.6,transparent:true});
 const fragments=new T.InstancedMesh(new T.OctahedronGeometry(.025,0),fragmentMat,900),dummy=new T.Object3D();scene.add(fragments);
 const dustGeometry=new T.BufferGeometry(),dustPositions=new Float32Array(1200*3);
 for(let i=0;i<1200;i++){dustPositions[i*3]=(Math.sin(i*34.41)*.5+.5)*34-17;dustPositions[i*3+1]=(Math.sin(i*13.81)*.5+.5)*11;dustPositions[i*3+2]=(Math.cos(i*64.71)*.5+.5)*50-35;}
 dustGeometry.setAttribute('position',new T.BufferAttribute(dustPositions,3));const dust=new T.Points(dustGeometry,new T.PointsMaterial({color:0xdbcab4,size:.018,transparent:true,opacity:.45,depthWrite:false}));scene.add(dust);
 // Thin floor rings make distance and movement readable, and catch reflections.
 const ringMat=new T.MeshBasicMaterial({color:0x95724b,transparent:true,opacity:.16,side:T.DoubleSide});
 for(let i=0;i<24;i++){const ring=new T.Mesh(new T.RingGeometry(3+i*.65,3.008+i*.65,128),ringMat);ring.rotation.x=-Math.PI/2;ring.position.y=.012;scene.add(ring);}
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new T.Vector2(1280,720),.18,.6,1.5));composer.addPass(new OutputPass());
 function draw(time){
  const t=Math.max(0,Math.min(48,time)),reveal=ease(10,18,t),dissolve=ease(32,42,t),returning=ease(43,48,t);
  const presence=reveal*(1-dissolve);
  portals.visible=reveal<.98||returning>.01;portalMat.opacity=(1-reveal)*(1-returning)+returning;portalMat.emissiveIntensity=1+.18*Math.sin(t*.4);
  sculpture.scale.setScalar(.5+reveal*.5);sculpture.rotation.set(.14*Math.sin(t*.18),t*.105,.11*Math.sin(t*.23));
  ribbons.forEach((r,i)=>{r.material.opacity=presence;r.rotation.x=i*.42+Math.sin(t*.28+i)*.21; r.position.y=Math.sin(t*.35+i)*.13+(.5-reveal)*i*.45;});sculpture.visible=presence>.002;
  fragmentMat.opacity=reveal*(.2+dissolve*.8)*(1-returning);
  for(let i=0;i<900;i++){
   const a=i*2.399963+t*.035,r=1.8+(i%29)/29*.85+dissolve*(2+(i%53)/53*6),v=1-i/450;
   dummy.position.set(Math.cos(a)*Math.sqrt(1-v*v)*r,2.95+v*r+Math.sin(t*.3+i)*.1,Math.sin(a)*Math.sqrt(1-v*v)*r);
   dummy.rotation.set(a+t*.2,a*.6,t*.1);dummy.scale.setScalar(.5+(i%7)*.16+dissolve*.45);dummy.updateMatrix();fragments.setMatrixAt(i,dummy.matrix);
  }fragments.instanceMatrix.needsUpdate=true;fragments.visible=fragmentMat.opacity>.002;
  dust.rotation.y=t*.004;
  const orbit=ease(17,40,t),angle=.25+orbit*1.8,radius=8.4-dissolve*.4;
  const start=new T.Vector3(Math.sin(t*.11)*.5,2.65,16-ease(0,16,t)*7.6),around=new T.Vector3(Math.sin(angle)*radius,3.1+Math.sin(t*.1)*.45,Math.cos(angle)*radius);
  camera.position.copy(start.lerp(around,reveal)).lerp(new T.Vector3(0,2.65,16),returning);camera.lookAt(0,2.6+reveal*.2,0);
  composer.render();
  return t<12?'01 — 경계를 지나':t<33?'02 — 접힌 빛':t<43?'03 — 남겨진 여운':'다시, 문 앞에서';
 }
 draw(0);return {draw};
}
