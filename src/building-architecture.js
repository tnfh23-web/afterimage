import * as T from 'three';
import {batchRoomArchitecture} from './static-room-batches';

export function galleryFloor(root,room,mats,cube){
 const floor=cube(root,room.w,.15,room.d,0,-.085,0,mats.floor);
 floor.castShadow=false;floor.material=mats.floor.clone();
 for(let x=-room.w/2+2;x<room.w/2;x+=2){const seam=cube(root,.006,.003,room.d,x,-.008,0,mats.grout);seam.castShadow=false;}
 for(let z=-room.d/2+2;z<room.d/2;z+=2){const seam=cube(root,room.w,.003,.006,0,-.008,z,mats.grout);seam.castShadow=false;}
 return floor;
}

export function galleryWalls(root,room,openings,mats,cube){
 const obstacles=[],doorWidth=4,doorHeight=3.9;
 for(const side of ['north','south','east','west']){
  const alongX=side==='north'||side==='south',length=alongX?room.w:room.d;
  const edge=(side==='north'||side==='west'?-1:1)*(alongX?room.d:room.w)/2;
  const wall=(span,height,y,along)=>{
   if(span<=0||height<=0)return;
   if(y-height/2<1.75)obstacles.push({x:room.x+(alongX?along:edge),z:room.z+(alongX?edge:along),w:alongX?span:.65,d:alongX?.65:span,maxY:room.h});
   if(y-height/2<.1){
    const inside=edge-Math.sign(edge)*.34;
    if(alongX)cube(root,span,.065,.025,along,.033,inside,mats.grout);
    else cube(root,.025,.065,span,inside,.033,along,mats.grout);
   }
   return alongX?cube(root,span,height,.65,along,y,edge,mats.wall):cube(root,.65,height,span,edge,y,along,mats.wall);
  };
  let cursor=-length/2;
  for(const offset of [...openings[side]].sort((a,b)=>a-b)){
   const start=offset-doorWidth/2,end=offset+doorWidth/2;
   wall(start-cursor,room.h,room.h/2,(start+cursor)/2);
   wall(doorWidth,room.h-doorHeight,doorHeight+(room.h-doorHeight)/2,offset);
   // The reveal has real depth but stays outside the clear walking aperture.
   if(alongX){cube(root,.18,doorHeight,.95,start-.09,doorHeight/2,edge,mats.wall);cube(root,.18,doorHeight,.95,end+.09,doorHeight/2,edge,mats.wall);cube(root,4.36,.18,.95,offset,doorHeight+.09,edge,mats.wall);}
   else{cube(root,.95,doorHeight,.18,edge,doorHeight/2,start-.09,mats.wall);cube(root,.95,doorHeight,.18,edge,doorHeight/2,end+.09,mats.wall);cube(root,.95,.18,4.36,edge,doorHeight+.09,offset,mats.wall);}
   cursor=end;
  }
  wall(length/2-cursor,room.h,room.h/2,(length/2+cursor)/2);
 }
 return obstacles;
}

export function galleryPassages(scene,passages,mats,cube,floorRects,obstacles){
 const lights=[];
 for(const passage of passages){
  const root=new T.Group();scene.add(root);
  const wall=(w,d,x,z)=>{cube(root,w,3.9,d,x,1.95,z,mats.wall);obstacles.push({x,z,w,d});};
  let longest=0,lightPoint;
  for(let i=0;i<passage.points.length-1;i++){
   const A=passage.points[i],B=passage.points[i+1],horizontal=A[1]===B[1],length=Math.hypot(B[0]-A[0],B[1]-A[1]);
   const x=(A[0]+B[0])/2,z=(A[1]+B[1])/2,w=horizontal?length+.35:4,d=horizontal?4:length+.35;
   floorRects.push({x,z,w,d});cube(root,w,.15,d,x,-.085,z,mats.floor);cube(root,w,.18,d,x,3.99,z,mats.ceiling);
   // Stop long walls two metres before an elbow, leaving the perpendicular leg open.
   const trimStart=i>0?2:0,trimEnd=i<passage.points.length-2?2:0;
   const wallLength=length-trimStart-trimEnd,sign=horizontal?Math.sign(B[0]-A[0]):Math.sign(B[1]-A[1]);
   const center=(trimStart-trimEnd)*sign/2;
   if(horizontal){wall(wallLength,.25,x+center,z-2);wall(wallLength,.25,x+center,z+2);cube(root,Math.max(.3,length-.8),.02,.035,x,3.86,z-1.7,mats.light);}
   else{wall(.25,wallLength,x-2,z+center);wall(.25,wallLength,x+2,z+center);cube(root,.035,.02,Math.max(.3,length-.8),x-1.7,3.86,z,mats.light);}
   if(length>longest){longest=length;lightPoint=[x,z];}
  }
  for(let i=1;i<passage.points.length-1;i++){
   const [x,z]=passage.points[i],before=passage.points[i-1],after=passage.points[i+1];
   const direction=p=>p[0]!==x?(p[0]<x?'west':'east'):(p[1]<z?'north':'south');
   const open=new Set([direction(before),direction(after)]);
   floorRects.push({x,z,w:4,d:4});cube(root,4,.15,4,x,-.085,z,mats.floor);cube(root,4,.18,4,x,3.99,z,mats.ceiling);
   for(const side of ['north','south','east','west'])if(!open.has(side)){
    if(side==='north'||side==='south')wall(4,.25,x,z+(side==='north'?-2:2));
    else wall(.25,4,x+(side==='west'?-2:2),z);
   }
  }
  const light=new T.PointLight(0xfff0db,42,25,2);light.position.set(lightPoint[0],3.35,lightPoint[1]);root.add(light);lights.push({...passage,light});
  batchRoomArchitecture(root);
 }
 return lights;
}

export function atriumShell(root,room,openings,mats,cube,label){
 const obstacles=galleryWalls(root,room,openings,mats,cube);
 // Four roof pieces frame a real aperture rather than a flat white ceiling.
 cube(root,5,.22,34,-5.5,8,0,mats.ceiling);cube(root,5,.22,5.5,5.5,8,-14.25,mats.ceiling);cube(root,5,.22,17.8,5.5,8,8.1,mats.ceiling);
 cube(root,6,.22,7,0,8,-13.5,mats.ceiling);cube(root,6,.22,7,0,8,13.5,mats.ceiling);
 const sky=new T.Mesh(new T.PlaneGeometry(6,20),new T.MeshBasicMaterial({color:0xcce1ed,side:T.DoubleSide}));sky.rotation.x=Math.PI/2;sky.position.y=8.65;root.add(sky);
 const white=mats.wall.clone();white.color.set(0xf7f2e8);
 cube(root,.16,.65,20,-3,8.25,0,white);cube(root,.16,.65,20,3,8.25,0,white);
 for(const z of [-10,-6,-2,2,6,10])cube(root,6,.14,.12,0,8.25,z,mats.black);
 for(const x of [-5.5,5.5])obstacles.push({x,z:0,w:.85,d:5});
 for(const [text,x,z,angle] of [['01 — 05',-7.63,-8,Math.PI/2],['06 — 10',7.63,-8,-Math.PI/2]]){
  const plaque=label(text,3.5,1.4);plaque.position.set(x,2.3,z);plaque.rotation.y=angle;root.add(plaque);
 }
 for(const z of [-10,0,10]){const fill=new T.PointLight(0xfff5e5,40,24,2);fill.position.set(0,6.8,z);fill.userData.peek=true;root.add(fill);}
 const sun=new T.SpotLight(0xfff2dc,2100,60,.95,.6,2);sun.position.set(-2,11,-4);sun.target.position.set(2,.1,5);root.add(sun,sun.target);
 const fill=new T.SpotLight(0xf1f5ff,140,40,1,.9,2);fill.position.set(2,7.7,8);fill.target.position.set(-2,.1,0);root.add(fill,fill.target);
 return obstacles;
}
