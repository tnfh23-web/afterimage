import * as T from 'three';
import {roomLighting} from './room-lighting';
import {galleryWalls} from './building-architecture';

export function roomShell(root,room,doors,mats,cube){
 const obstacles=galleryWalls(root,room,doors,mats,cube);
 const lighting=roomLighting[room.id],strip=new T.MeshBasicMaterial({color:lighting.strip});
 if(room.id===1){
  const half=room.w/2,depth=room.d;
  cube(root,room.w,.18,(depth-5.2)/2,0,room.h,-(depth+5.2)/4,mats.ceiling);
  cube(root,room.w,.18,(depth-5.2)/2,0,room.h,(depth+5.2)/4,mats.ceiling);
  cube(root,(room.w-5)/2,.18,5.2,-(half+2.5)/2,room.h,0,mats.ceiling);
  cube(root,(room.w-5)/2,.18,5.2,(half+2.5)/2,room.h,0,mats.ceiling);
  const liner=mats.wall.clone();liner.color.set(0xe2e6df);
  cube(root,5,.16,5.2,0,room.h+1.35,0,liner);
  cube(root,.14,1.4,5.2,-2.5,room.h+.6,0,liner);cube(root,.14,1.4,5.2,2.5,room.h+.6,0,liner);
  cube(root,5,1.4,.14,0,room.h+.6,-2.6,liner);cube(root,5,1.4,.14,0,room.h+.6,2.6,liner);
  const daylight=new T.PointLight(lighting.sky,24,11,2);daylight.position.set(0,room.h+.55,0);root.add(daylight);
 }else cube(root,room.w,.18,room.d,0,room.h,0,mats.ceiling);
 for(const x of [-room.w/2+1.2,room.w/2-1.2]){
  cube(root,.16,.015,1.8,x,.12,-room.d/2+.38,strip);
  const uplight=new T.PointLight(lighting.fill.color,6.5,5,2);uplight.position.set(x,.35,-room.d/2+.7);root.add(uplight);
 }
 if(room.id===3||room.id===5){
  cube(root,room.w-5,.025,.055,1,room.h-.1,-room.d/2+.47,strip);
  for(const x of [-3,2,6]){const wash=new T.PointLight(lighting.ceiling.color,8,7,2);wash.position.set(x,room.h-.5,-room.d/2+.8);root.add(wash);}
 }
 return obstacles;
}

export function particleProjection(root,animations,depth=16){
 const positions=[];let seed=27931;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<19000;i++){
  const x=(random()-.5)*5.45,y=(random()-.5)*3.65,ellipse=x*x/(.79*.79)+y*y/(.97*.97);
  if(ellipse<1)continue;
  const flow=.12*Math.sin(x*3.5+y*4)+.1*Math.cos(y*7-x*1.8);
  positions.push(x,y+flow,.015*Math.sin(x*7+y*5));
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 const points=new T.Points(geometry,new T.PointsMaterial({color:0xf1bd78,size:.012,transparent:true,opacity:.72,depthWrite:false}));points.position.set(-3.05,2.68,-depth/2+.36);root.add(points);
 animations.push({id:3,updates:[time=>{points.rotation.z=Math.sin(time*.06)*.018;}]});
}

