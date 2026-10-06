import * as T from 'three';
import {benchSeats} from './seating';
import {curateRoomWalls} from './gallery-wall-curation';
import {furnishRoom} from './spatial-furnishings';

// All details are static. Shared materials, merged timber and instanced leaves
// add spatial texture without extra lights, animation or downloaded assets.
export function detailMaterials(){
 return {
  oak:new T.MeshStandardMaterial({color:0x9a7651,roughness:.8}),
  edge:new T.MeshStandardMaterial({color:0x52493d,roughness:.72}),
  ceramic:new T.MeshStandardMaterial({color:0xd1c5b2,roughness:.86}),
  soil:new T.MeshStandardMaterial({color:0x433f31,roughness:1}),
  foliage:new T.MeshStandardMaterial({color:0x68734b,roughness:.95,side:T.DoubleSide}),
  paper:new T.MeshStandardMaterial({color:0xf6efe2,roughness:.95}),
 };
}

function typography(root,lines,w,h,x,y,z,angle=0){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=Math.round(768*h/w);
 const ctx=canvas.getContext('2d');ctx.scale(.5,.5);ctx.fillStyle='#393a32';
 for(const line of lines){
  let size=line.size;ctx.font=`${line.weight||400} ${size}px Pretendard, sans-serif`;
  while(ctx.measureText(line.text).width>1420&&size>20){size-=2;ctx.font=`${line.weight||400} ${size}px Pretendard, sans-serif`;}
  ctx.fillStyle=line.color||'#393a32';ctx.fillText(line.text,40,line.y);
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
 mesh.position.set(x,y,z);mesh.rotation.y=angle;mesh.raycast=()=>{};root.add(mesh);return mesh;
}

export function timberBench(root,x,z,length,angle,mats,cube){
 // Individual slats are placed on the room root so the architecture batcher
 // folds them into the existing draw calls. No invisible centre block remains.
 const place=(w,h,d,dx,y,dz,mat)=>{
  const mesh=cube(root,w,h,d,x+Math.cos(angle)*dx+Math.sin(angle)*dz,y,z-Math.sin(angle)*dx+Math.cos(angle)*dz,mat);
  mesh.rotation.y=angle;
 };
 for(let i=0;i<5;i++)place(length,.105,.115,0,.49,(i-2)*.14,mats.oak);
 for(const dx of [-length*.34,length*.34])place(.14,.43,.57,dx,.215,0,mats.edge);
 place(length-.25,.06,.4,0,.395,0,mats.edge);
}

function olive(root,x,z,mats,cube,obstacles){
 const pot=new T.Mesh(new T.CylinderGeometry(.42,.31,.64,16),mats.ceramic);pot.position.set(x,.32,z);pot.receiveShadow=true;pot.castShadow=true;root.add(pot);
 const soil=new T.Mesh(new T.CylinderGeometry(.37,.37,.015,16),mats.soil);soil.position.set(x,.64,z);root.add(soil);
 cube(root,.035,1.62,.035,x,1.43,z,mats.edge);
 for(let i=0;i<6;i++){
  const angle=i*2.39996,branch=new T.Mesh(new T.CylinderGeometry(.008,.018,.65,5),mats.edge);
  branch.position.set(x+Math.cos(angle)*.18,1.58+i*.13,z+Math.sin(angle)*.18);
  branch.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(Math.cos(angle)*.6,.65,Math.sin(angle)*.6).normalize());root.add(branch);
 }
 const shape=new T.Shape();shape.moveTo(0,-.5);shape.quadraticCurveTo(.2,0,0,.5);shape.quadraticCurveTo(-.2,0,0,-.5);
 const geometry=new T.ShapeGeometry(shape,3),leaves=new T.InstancedMesh(geometry,mats.foliage,108),dummy=new T.Object3D();
 for(let i=0;i<108;i++){
  const t=i*2.39996,r=.18+.38*Math.sqrt((i%27)/26),height=1.38+(i%36)/35*1.18;
  dummy.position.set(x+Math.cos(t)*r,height,z+Math.sin(t)*r);
  dummy.rotation.set(Math.sin(t)*.55,t,Math.cos(t)*.7);dummy.scale.set(.62,.24+(i%5)*.02,1);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);
 }
 leaves.receiveShadow=true;root.add(leaves);obstacles.push({x,z,w:.9,d:.9});
}

export function hallDetails(root,room,mats,cube,obstacles,seats){
 // Stay well away from the four door apertures at z +/-14 and keep the
 // central six-metre axis clear, including the default entrance position.
 for(const side of [-1,1]){
  timberBench(root,side*5.5,0,5,Math.PI/2,mats,cube);
  benchSeats(seats,room,side*5.5,0,5,Math.PI/2,[0,2.1,-4]);
  for(const z of side===1?[9.5,4.3]:[-7.5,4.3])olive(root,side*6.15,z,mats,cube,obstacles);
  for(let i=0;i<36;i++)cube(root,.09,4.8,.075,side*7.61,2.8,-4.3+i*.245,mats.oak);
  cube(root,.035,.02,9,side*7.5,.25,0,mats.light);
 }
 // Low information desk with a stone cap and a small stack of catalogues.
 cube(root,2.4,.89,.95,-4.4,.445,6.5,mats.oak);
 cube(root,2.56,.07,1.08,-4.4,.925,6.5,mats.ceramic);
 for(let i=0;i<4;i++)cube(root,.46,.025,.32,-3.8,.974+i*.027,6.62,mats.paper);
 typography(root,[{text:'AFTERIMAGE',size:125,weight:600,y:200},{text:'EXHIBITION GUIDE  /  2026',size:58,y:335}],2.0,.66,-4.4,.49,6.984);
 obstacles.push({x:-4.4,z:6.5,w:2.6,d:1.1});
 // A freestanding directory balances the desk without closing the entrance.
 cube(root,1.36,1.75,.16,4.9,.875,6.5,mats.ceramic);
 cube(root,1.6,.055,.55,4.9,.028,6.5,mats.edge);
 typography(root,[{text:'TEN SCENES',size:138,weight:500,y:240},{text:'열 개의 장면, 두 개의 동선',size:83,y:415},{text:'WEST WING    01 — 05',size:76,y:750},{text:'EAST WING     06 — 10',size:76,y:920},{text:'조각과 회화 · 20점',size:80,y:1450}],1.18,1.57,4.9,.94,6.59);
 obstacles.push({x:4.9,z:6.5,w:1.6,d:.55});
 // Entry-wall composition: the actual extruded logo remains above this text.
 typography(root,[{text:'눈을 감은 뒤에도 남는 장면',size:86,y:130},{text:'열 개의 방을 걸으며, 각자의 잔상을 발견합니다.',size:57,y:250},{text:'DIGITAL ART & SCULPTURE EXHIBITION   /   2026',size:39,y:390}],5.2,1.55,-.2,1.8,-16.63);
 // Simple oak reveals make the height of the hall readable from the entrance.
 for(const x of [-6.7,6.7])cube(root,.13,6.4,.1,x,3.2,-16.61,mats.oak);
}

export function roomDetails(root,room,mats,cube,obstacles,seats){
 timberBench(root,-4,2,3.5,0,mats,cube);
 benchSeats(seats,room,-4,2,3.5,0,[room.x+1,2,room.z-.6]);
 obstacles.push({x:room.x-4,z:room.z+2,w:3.5,d:.7});
 curateRoomWalls(root,room,mats,cube);
 furnishRoom(root,room,mats,cube,obstacles);
}
