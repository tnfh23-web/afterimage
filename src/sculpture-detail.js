import * as T from 'three';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {SimplexNoise} from 'three/addons/math/SimplexNoise.js';

let seed=18437;
const simplex=new SimplexNoise({random:()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}});
const noise=(x,y,z)=>simplex.noise3d(x,y,z);
export function mineralRock(radius=1,detail=32){
 const source=new T.IcosahedronGeometry(radius,detail);source.deleteAttribute('normal');source.deleteAttribute('uv');
 const geometry=mergeVertices(source);source.dispose();const positions=geometry.attributes.position,uv=[];
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i)/radius,y=positions.getY(i)/radius,z=positions.getZ(i)/radius;
  const displacement=1+.16*noise(x*1.4+4,y*1.4,z*1.4)+.047*noise(x*4.7,y*4.7+2,z*4.7)+.012*noise(x*13,y*13,z*13)+.003*noise(x*32,y*32,z*32);
  positions.setXYZ(i,x*radius*displacement,y*radius*displacement,z*radius*displacement);
  uv.push(Math.atan2(z,x)/(Math.PI*2)+.5,Math.acos(Math.max(-1,Math.min(1,y)))/Math.PI);
 }
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();return geometry;
}
function surface(rows,columns,point){
 const positions=[],uv=[],indices=[];
 for(let row=0;row<=rows;row++)for(let column=0;column<=columns;column++){const u=column/columns,v=row/rows;positions.push(...point(u,v));uv.push(u,v);}
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){const a=row*(columns+1)+column,b=a+columns+1;indices.push(a,b,a+1,a+1,b,b+1);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();return geometry;
}
export function curvedLeaf(){return surface(12,28,(u,v)=>{const across=v*2-1,width=.185*Math.pow(Math.sin(u*Math.PI),.85)*(1-.2*u);return [across*width,u,.12*Math.sin(u*Math.PI)+.045*across*across*Math.sin(u*Math.PI)-.035*u*u];});}
function mesh(parent,geometry,material,position=[0,0,0]){const object=new T.Mesh(geometry,material);object.position.set(...position);object.castShadow=object.receiveShadow=true;parent.add(object);return object;}
export function veiledBust(mats){
 const group=new T.Group();
 const copper=mats.bronze.clone();copper.color.set(0xcbab82);copper.roughness=.43;copper.envMapIntensity=1.35;
 const profile=y=>{
  const shoulder=Math.exp(-Math.pow((y-1.29)/.23,2)),neck=Math.exp(-Math.pow((y-1.68)/.2,2));
  const taper=.29+.23*Math.sin(Math.min(1,y/1.25)*Math.PI*.5);
  return [taper+.35*shoulder-.28*neck,.215+.105*Math.sin(Math.min(1,y/1.25)*Math.PI*.5)-.09*neck];
 };
 const body=surface(56,96,(u,v)=>{
  const a=u*Math.PI*2,y=.03+1.73*v,[rx,rz]=profile(y),front=Math.max(0,Math.cos(a));
  const rough=.012*noise(Math.sin(a)*9,y*12,Math.cos(a)*9)+.004*noise(a*17,y*28,0);
  const chest=.024*Math.sin(a*3)*Math.exp(-Math.pow((y-.98)/.4,2))*front;
  return [Math.sin(a)*(rx+rough),y+.027*Math.sin(a*5)*Math.pow(1-v,8),Math.cos(a)*(rz+rough+chest)];
 });mesh(group,body,copper);
 const headRadius=y=>{
  const latitude=Math.max(-1,Math.min(1,(y-2.14)/.6)),ring=Math.sqrt(Math.max(0,1-latitude*latitude));
  return [.365*ring*(latitude<-.15?.82+(.15+latitude)*.12:1),.32*ring];
 };
 const head=surface(64,96,(u,v)=>{
  const a=u*Math.PI*2,p=v*Math.PI,y=2.14+.6*Math.cos(p),[rx,rz]=headRadius(y),front=Math.max(0,Math.cos(a));
  const nose=.044*Math.exp(-Math.pow((y-2.1)/.14,2))*Math.pow(front,20),chin=.015*Math.exp(-Math.pow((y-1.78)/.07,2))*Math.pow(front,10);
  const fold=.006*Math.sin(a*11+y*8)*Math.sin(p)+.003*noise(a*8,y*16,0);
  return [Math.sin(a)*(rx+fold)-.025*(y-2.14),y,Math.cos(a)*(rz+fold)+nose+chin+.02];
 });mesh(group,head,mats.ivory);
 // One continuous hood follows the head, neck and shoulders. Its open edge
 // exposes the face without disconnecting the cloth from the bust.
 const hood=surface(72,112,(u,v)=>{
  const a=.67+u*(Math.PI*2-1.34),bottom=.28+1.2*Math.pow(Math.max(0,Math.sin(a)),3)+.18*Math.pow(Math.max(0,Math.cos(a)),3)+.05*Math.sin(a*3),y=bottom+(2.735-bottom)*v;
  let [rx,rz]=y>1.75?headRadius(y):profile(y);
  if(y>1.48&&y<1.9){const neck=.17+.19*Math.max(0,(y-1.68)/.22);rx=Math.max(rx,neck);rz=Math.max(rz,.18);}
  const weight=Math.min(1,Math.max(0,(2.73-y)/.55));
  const pleat=(.027*Math.sin(a*13+y*4)+.011*Math.sin(a*23-y*7))*weight;
  const crease=.026*Math.pow(.5+.5*Math.sin(a*9-y*5),4)*weight;
  const edge=.018*(Math.pow(u,18)+Math.pow(1-u,18))*weight;
  return [Math.sin(a)*(rx+.026+pleat+crease+edge)-.025*Math.max(0,y-2.14),y,Math.cos(a)*(rz+.028+pleat+crease+edge)+.01];
 });mesh(group,hood,mats.ivory);
 const drape=(start,end,low,high,phase,offset)=>surface(56,112,(u,v)=>{
  const a=start+(end-start)*u,bottom=low(a),top=high(a),y=bottom+(top-bottom)*v,[rx,rz]=profile(Math.max(.05,Math.min(1.76,y)));
  const flow=(y+.23*Math.sin(a+.4))*16+a*1.2+phase;
  const crease=.039*Math.pow(.5+.5*Math.sin(flow),3)-.012;
  const fine=.009*Math.sin(flow*2.9+a*3)+.004*noise(a*9,y*19,phase);
  const edge=.015*(Math.pow(v,16)+Math.pow(1-v,16))+.014*(Math.pow(u,18)+Math.pow(1-u,18));
  return [Math.sin(a)*(rx+offset+crease+fine+edge),y,Math.cos(a)*(rz+offset+crease+fine+edge)+.013];
 });
 // Broad overlapping diagonal folds leave the lower right copper visible.
 mesh(group,drape(-1.68,.48,a=>.38-.16*Math.sin(a),a=>1.38-.27*Math.sin(a+.25),.4,.055),mats.ivory);
 mesh(group,drape(-1.53,.65,a=>1.04-.25*Math.sin(a+.35),a=>1.51-.18*Math.sin(a+.35),2.2,.086),mats.ivory);
 mesh(group,drape(-1.65,2.35,a=>1.37+.085*Math.sin(a),a=>1.56+.06*Math.sin(a),4.4,.038),mats.ivory);
 group.rotation.y=-.14;return group;
}
