import * as T from 'three';
import {batchRoomArchitecture} from './static-room-batches';
import {benchSeats} from './seating';

const palettes=[0x92745a,0x71816b,0x977868,0x9e8765,0x718c94,0xb49f7d,0xa38b64,0x858874,0x87979a,0xa48b7e];
const materialSets=new WeakMap();
function decorMaterials(mats,index){
 if(!materialSets.has(mats))materialSets.set(mats,new Map());
 const cache=materialSets.get(mats),id=index%10;
 if(!cache.has(id))cache.set(id,{
  accent:new T.MeshStandardMaterial({color:palettes[id],roughness:.82}),
  textile:new T.MeshStandardMaterial({color:id===4||id===8?0xaeb9b6:0xc7bbab,roughness:1}),
  leaf:new T.MeshStandardMaterial({color:id===1?0x52754b:id===4||id===8?0x566d62:0x607149,roughness:.95,side:T.DoubleSide}),
  paleLeaf:new T.MeshStandardMaterial({color:0x8a9570,roughness:.96,side:T.DoubleSide}),
 });
 return cache.get(id);
}
function groupAt(root,x,y,z,angle=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=angle;root.add(g);return g;}
function cylinder(root,r1,r2,h,x,y,z,material,segments=16){
 const mesh=new T.Mesh(new T.CylinderGeometry(r1,r2,h,segments),material);mesh.position.set(x,y,z);mesh.receiveShadow=true;root.add(mesh);return mesh;
}
function rod(root,a,b,r,material){
 const A=new T.Vector3(...a),B=new T.Vector3(...b),mesh=cylinder(root,r,r*.85,A.distanceTo(B),0,0,0,material,6);
 mesh.position.copy(A).add(B).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.sub(A).normalize());return mesh;
}
function obstacle(obstacles,room,x,z,w,d){obstacles.push({x:room.x+x,z:room.z+z,w,d});}

// Opaque shaped leaves avoid alpha sorting, texture downloads and extra lights.
// The whole crown is a pair of instanced meshes, including the small plants.
function foliage(root,style,height,radius,mats,decor,seed){
 const shape=new T.Shape();shape.moveTo(0,0);
 if(style==='reed'){shape.bezierCurveTo(-.09,.35,-.09,.7,0,1);shape.bezierCurveTo(.13,.66,.14,.32,0,0);}
 else{shape.bezierCurveTo(-.34,.2,-.36,.63,0,1);shape.bezierCurveTo(.35,.67,.29,.22,0,0);}
 const geometry=new T.ShapeGeometry(shape,3),count=style==='reed'?48:style==='fern'?64:112;
 const leaves=[new T.InstancedMesh(geometry,decor.leaf,Math.ceil(count/2)),new T.InstancedMesh(geometry,decor.paleLeaf,Math.floor(count/2))],dummy=new T.Object3D();
 const indices=[0,0];
 for(let i=0;i<count;i++){
  const angle=i*2.39996+seed*.4,t=(i%28)/27;
  if(style==='reed'||style==='fern'){
   const spread=radius*Math.sqrt((i%19)/18),length=height*(.56+(i%7)/15);
   dummy.position.set(Math.cos(angle)*spread*.32,.02,Math.sin(angle)*spread*.32);
   dummy.rotation.set(style==='fern'?.55+t*.9:.08+t*.46,angle,Math.sin(angle)*.35);
   dummy.scale.set(style==='reed'?.22:.33,length,1);
  }else{
   const y=height*(.44+.53*t),spread=radius*Math.sqrt(Math.max(.08,1-Math.pow((t-.54)*1.7,2)))*(i%4===0?.52:1);
   dummy.position.set(Math.cos(angle)*spread,y,Math.sin(angle)*spread);
   dummy.rotation.set(Math.sin(angle)*.55,angle+.7,-.65+((i+seed)%9)/9*1.3);
   dummy.scale.set(style==='olive'?.18:.37,style==='olive'?.34:.57,1);
  }
  dummy.updateMatrix();const variant=i%2;leaves[variant].setMatrixAt(indices[variant]++,dummy.matrix);
 }
 leaves.forEach(mesh=>{mesh.receiveShadow=true;mesh.frustumCulled=false;root.add(mesh);});
 if(style==='olive'||style==='ficus'){
  rod(root,[0,0,0],[.025,height*.83,.025],.035,mats.edge);
  for(let i=0;i<7;i++){const a=i*2.39996+seed,y=height*(.38+i*.075);rod(root,[0,y*.8,0],[Math.cos(a)*radius*.76,y,Math.sin(a)*radius*.76],.013,mats.edge);}
 }
}
function planter(root,x,z,style,mats,decor,cube,{scale=1,seed=0}={}){
 const g=groupAt(root,x,0,z);g.name=`${style}-planter`;
 const height=style==='fern'?.34:.66,radius=style==='fern'?.36:.4;
 cylinder(g,radius,radius*.8,height,0,height/2,0,mats.ceramic);
 cylinder(g,radius+.015,radius+.015,.045,0,height-.015,0,decor.accent);
 cylinder(g,radius*.91,radius*.91,.018,0,height+.006,0,mats.soil);
 const crown=groupAt(g,0,height+.02,0);
 foliage(crown,style,style==='olive'?2.05:style==='ficus'?1.65:style==='reed'?1.13:.53,style==='olive'?.69:style==='ficus'?.72:.45,mats,decor,seed);
 g.scale.setScalar(scale);batchRoomArchitecture(g);batchRoomArchitecture(crown);
 return {group:g,width:(radius*2+.07)*scale,depth:(radius*2+.07)*scale};
}
function vase(root,x,y,z,size,material,mats,variant=0){
 const profiles=[[[0,0],[.22,0],[.25,.12],[.2,.34],[.085,.46],[.09,.57]],[[0,0],[.13,0],[.18,.12],[.17,.33],[.14,.44]],[[0,0],[.2,0],[.27,.1],[.28,.16],[.18,.23]]];
 const g=groupAt(root,x,y,z),points=profiles[variant%3].map(([r,h])=>new T.Vector2(r*size,h*size));
 const mesh=new T.Mesh(new T.LatheGeometry(points,20),material);mesh.receiveShadow=true;g.add(mesh);
 const [r,h]=profiles[variant%3].at(-1);cylinder(g,r*size*.8,r*size*.8,.009,0,h*size-.015,0,mats.soil);
 return {group:g,height:h*size};
}
function books(root,x,y,z,cube,mats,decor,angle=0){
 const g=groupAt(root,x,y,z,angle);
 for(let i=0;i<3;i++){
  const a=(i-1)*.12,cx=i*.025,cz=i*.016;
  const part=(w,h,d,px,py,pz,mat)=>{const mesh=cube(g,w,h,d,cx+Math.cos(a)*px+Math.sin(a)*pz,i*.043+py,cz-Math.sin(a)*px+Math.cos(a)*pz,mat);mesh.rotation.y=a;};
  part(.52,.035,.36,0,.018,0,mats.paper);
  part(.54,.006,.38,0,.002,0,i===1?decor.accent:mats.edge);
  part(.54,.006,.38,0,.038,0,i===1?decor.accent:mats.edge);
  part(.012,.012,.24,-.16,.045,0,mats.paper);
 }
 batchRoomArchitecture(g);
}
function readingCorner(root,room,mats,decor,cube,obstacles){
 const x=-1.55,z=2.6;
 const rug=cube(root,4.65,.012,2.05,-4.35,.007,2.05,decor.textile);rug.castShadow=false;
 for(const offset of [-.88,.88]){const border=cube(root,4.5,.002,.018,-4.35,.014,2.05+offset,mats.edge);border.castShadow=false;}
 cylinder(root,.5,.5,.055,x,.61,z,mats.oak);cylinder(root,.055,.085,.57,x,.305,z,mats.edge);cylinder(root,.27,.27,.035,x,.025,z,mats.edge);
 obstacle(obstacles,room,x,z,1.05,1.05);
 books(root,x-.1,.64,z+.04,cube,mats,decor,.22);
 // A small fixture glows through a basic material; it is not a GPU light.
 const lamp=groupAt(root,x+.18,.64,z-.18);cylinder(lamp,.11,.11,.035,0,.018,0,mats.edge);
 rod(lamp,[0,.03,0],[0,.48,0],.013,mats.edge);rod(lamp,[0,.48,0],[-.14,.56,0],.013,mats.edge);
 const shade=cylinder(lamp,.09,.16,.14,-.14,.54,0,mats.edge);shade.rotation.z=-.28;
 cylinder(lamp,.13,.13,.009,-.14,.468,0,mats.light);
 batchRoomArchitecture(lamp);
}
function cabinet(root,room,mats,decor,cube,obstacles){
 const side=![2,4,7,9].includes(room.id),x=side?room.w/2-.87:room.w/2-2.35,z=side?-4.45:room.d/2-.84,angle=side?Math.PI/2:0;
 const g=groupAt(root,x,0,z,angle);g.name='material-and-catalogue-console';
 const length=room.id%3===1?2.7:2.35,top=room.id%3===2?.84:1.02;
 if(room.id%3===0){
  cube(g,length,.14,.64,0,top-.07,0,mats.oak);
  for(const px of [-length/2+.12,length/2-.12])cube(g,.07,top-.14,.52,px,(top-.14)/2,0,mats.edge);
  cube(g,length-.18,.07,.53,0,.24,0,mats.oak);
 }else if(room.id%3===1){
  cube(g,length,top,.66,0,top/2,0,mats.ceramic);cube(g,length+.08,.055,.72,0,top+.025,0,mats.oak);
  for(let i=0;i<18;i++)cube(g,.042,top-.14,.025,-length/2+.1+i*(length-.2)/17,top/2,.348,mats.oak);
 }else{
  for(const px of [-length/2+.22,length/2-.22])cube(g,.32,top-.12,.54,px,(top-.12)/2,0,mats.ceramic);
  cube(g,length,.12,.68,0,top-.06,0,mats.ceramic);
 }
 books(g,-length*.27,top+.055,.01,cube,mats,decor,-.15);
 const tall=vase(g,length*.19,top+.055,-.03,.85,decor.accent,mats,room.id%3);
 vase(g,length*.36,top+.055,.03,.6,mats.ceramic,mats,(room.id+1)%3);
 if(room.id%2===0){
  const stem=groupAt(tall.group,0,tall.height,0);rod(stem,[0,0,0],[.1,.66,0],.007,mats.edge);rod(stem,[.05,.28,0],[-.15,.5,.035],.006,mats.edge);
  batchRoomArchitecture(stem);
 }else{
  const sample=cube(g,.38,.075,.32,.1,top+.1,.06,mats.stone);sample.rotation.y=.25;
 }
 batchRoomArchitecture(g);
 obstacle(obstacles,room,x,z,side?.76:length+.08,side?length+.08:.76);
}

export function furnishRoom(root,room,mats,cube,obstacles){
 const decor=decorMaterials(mats,room.id),styles=['olive','reed','olive','ficus','olive','ficus','olive','ficus','reed','olive'];
 readingCorner(root,room,mats,decor,cube,obstacles);
 cabinet(root,room,mats,decor,cube,obstacles);
 const hasNorthDoor=[1,2,4,7,8].includes(room.id);
 const x=hasNorthDoor?room.w/2-1.3:-.35,z=-room.d/2+1.55;
 const tall=planter(root,x,z,styles[room.id],mats,decor,cube,{scale:room.id===3?.86:1,seed:room.id});
 obstacle(obstacles,room,x,z,tall.width,tall.depth);
 const backX=-room.w/2+1.15,backZ=room.d/2-1.1;
 const low=planter(root,backX,backZ,room.id%3===1?'reed':'fern',mats,decor,cube,{scale:room.id%3===1?.65:.95,seed:room.id+9});
 obstacle(obstacles,room,backX,backZ,low.width,low.depth);
}

function passageRelief(root,x,z,alongX,length,side,index,mats,decor,cube){
 const angle=alongX?(side===1?Math.PI:0):(side===1?-Math.PI/2:Math.PI/2);
 const g=groupAt(root,x,1.98,z,angle);g.name='passage-material-study';
 const width=Math.min(2.45,length-.65);
 cube(g,width,1.42,.075,0,0,0,mats.edge);cube(g,width-.08,1.34,.055,0,0,.06,mats.paper);
 for(let i=0;i<5;i++){
  const h=.72+Math.sin(i*.8+index)*.26,bar=cube(g,.17,h,.065,(i-2)*width/7,Math.cos(i*.6+index)*.09,.13,i%2?mats.ceramic:decor.accent);bar.rotation.z=(i-2)*.045;
 }
 cube(g,width+.08,.065,.23,0,-.91,.08,mats.oak);
 vase(g,-width*.26,-.875,.12,.47,mats.ceramic,mats,index%3);
 vase(g,width*.22,-.875,.12,.6,decor.accent,mats,(index+1)%3);
 batchRoomArchitecture(g);
}

export function furnishPassage(root,passage,mats,cube,obstacles,seats,index){
 const decor=decorMaterials(mats,index),decoration=new T.Group();decoration.name=`passage-furnishings-${passage.a}-${passage.b}`;root.add(decoration);
 let longest;
 for(let i=0;i<passage.points.length-1;i++){
  const A=passage.points[i],B=passage.points[i+1],alongX=A[1]===B[1],length=Math.hypot(B[0]-A[0],B[1]-A[1]),trimStart=i?2:0,trimEnd=i<passage.points.length-2?2:0,span=length-trimStart-trimEnd;
  const sign=alongX?Math.sign(B[0]-A[0]):Math.sign(B[1]-A[1]),offset=(trimStart-trimEnd)*sign/2;
  const x=(A[0]+B[0])/2+(alongX?offset:0),z=(A[1]+B[1])/2+(alongX?0:offset),side=index%2?1:-1;
  // Work only within the solid wall segment; no objects at either elbow.
  for(const s of [-1,1]){
   if(alongX)cube(decoration,span-.35,1.02,.035,x,.52,z+s*1.84,mats.ceramic);
   else cube(decoration,.035,1.02,span-.35,x+s*1.84,.52,z,mats.ceramic);
   if(alongX)cube(decoration,span-.35,.035,.045,x,1.045,z+s*1.81,mats.oak);
   else cube(decoration,.045,.035,span-.35,x+s*1.81,1.045,z,mats.oak);
  }
  passageRelief(decoration,x+(alongX?0:side*1.82),z+(alongX?side*1.82:0),alongX,span,side,index+i,mats,decor,cube);
  if(!longest||span>longest.span)longest={x,z,alongX,span,side};
 }
 const {x,z,alongX,span,side}=longest;
 const px=x+(alongX?Math.min(span*.25,1.8):-side*1.37),pz=z+(alongX?-side*1.37:Math.min(span*.25,1.8));
 const plant=planter(decoration,px,pz,index%3===0?'ficus':'reed',mats,decor,cube,{scale:.65,seed:index+20});
 obstacles.push({x:px,z:pz,w:plant.width,d:plant.depth});
 if(span>=7){
  // A shallow resting bench leaves more than three metres of clear width.
  const bx=x+(alongX?-span*.23:side*1.49),bz=z+(alongX?side*1.49:-span*.23),angle=alongX?0:Math.PI/2,g=groupAt(decoration,bx,0,bz,angle);
  for(const lx of [-.72,.72])cube(g,.12,.42,.42,lx,.21,0,mats.edge);
  cube(g,1.9,.105,.48,0,.47,0,mats.oak);batchRoomArchitecture(g);
  obstacles.push({x:bx,z:bz,w:alongX?1.9:.48,d:alongX?.48:1.9});
  const start=seats.length,zone={id:passage.a,x:0,z:0};benchSeats(seats,zone,bx,bz,1.9,angle,[x,1.8,z]);seats.slice(start).forEach(seat=>{seat.zones=[passage.a,passage.b];});
 }
 batchRoomArchitecture(decoration);
 return decoration;
}
