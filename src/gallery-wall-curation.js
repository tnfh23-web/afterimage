import * as T from 'three';
import {assetUrl} from './asset-url';
import {batchRoomArchitecture} from './static-room-batches';

const themes=[
 {color:0x9b7350,ink:'#6c4d30',word:'경계',line:'다른 곳을 향하는 두 개의 문'},
 {color:0x79836b,ink:'#536145',word:'생장',line:'멈춘 정원에 남아 있는 움직임'},
 {color:0x9c7767,ink:'#715347',word:'존재',line:'표정이 지워진 자리의 서로 다른 자세'},
 {color:0x998365,ink:'#6d583f',word:'공전',line:'돌아오지만 같은 순간은 아닌 시간'},
 {color:0x718c9a,ink:'#486875',word:'파동',line:'물결이 사라진 자리에 남은 형태'},
 {color:0xb49c75,ink:'#7f6745',word:'빛',line:'깨어나기 직전, 이름 없는 장면'},
 {color:0xa58b62,ink:'#76603c',word:'접힘',line:'같은 면에서 달라지는 밝음과 그늘'},
 {color:0x8a8b75,ink:'#5e624c',word:'균형',line:'서로의 간격과 무게를 조율하는 형태'},
 {color:0x7d9298,ink:'#526b72',word:'여백',line:'빈틈이 열리고 닫히는 일곱 개의 층'},
 {color:0xa18b81,ink:'#785e53',word:'호흡',line:'천천히 돌아오는 하나의 흐름'},
];

function textTexture(room,theme){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1184;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#f0ece3';ctx.fillRect(0,0,1024,1184);
 ctx.fillStyle=theme.ink;ctx.fillRect(0,0,1024,18);
 const text=(value,size,y,weight=400,color='#292b28',x=84,maxWidth=856)=>{
  ctx.fillStyle=color;ctx.font=`${weight} ${size}px Pretendard, sans-serif`;
  while(ctx.measureText(value).width>maxWidth&&size>26){size--;ctx.font=`${weight} ${size}px Pretendard, sans-serif`;}
  ctx.fillText(value,x,y);
 };
 text(`전시실 ${room.number}  /  ${theme.word}`,36,108,500,theme.ink);
 ctx.fillStyle=theme.ink;ctx.fillRect(84,171,54,5);
 const titleWords=room.title.split(' '),lines=[];let line='';ctx.font='600 88px Pretendard, sans-serif';
 for(const word of titleWords){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>856&&line){lines.push(line);line=word;}else line=next;}lines.push(line);
 lines.forEach((value,index)=>text(value,88,300+index*108,600));
 text(room.en,31,lines.length>1?478:397,500,theme.ink);
 text(theme.line,37,617,500,'#383b33');
 ctx.fillStyle='#c9c5bb';ctx.fillRect(84,681,856,2);
 text('조각',32,754,600,theme.ink);text(room.sculpture,46,813,500);
 text('회화',32,894,600,theme.ink);text(room.painting,46,953,500);
 text(room.artist,40,1083,500);text('AFTERIMAGE · 2026',27,1083,400,'#77786f',560,380);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 return texture;
}

function wallGroup(root,x,y,z,angle,name){
 const group=new T.Group();group.position.set(x,y,z);group.rotation.y=angle;group.name=name;root.add(group);return group;
}

function disc(root,x,y,r,material,depth=.08,scaleY=1){
 const mesh=new T.Mesh(new T.CylinderGeometry(r,r,depth,24),material);
 mesh.rotation.x=Math.PI/2;mesh.scale.z=scaleY;mesh.position.set(x,y,.11);
 mesh.castShadow=false;mesh.receiveShadow=true;root.add(mesh);return mesh;
}

function stroke(root,points,material,depth=.07,radius=.025){
 const curve=new T.CatmullRomCurve3(points.map(([x,y])=>new T.Vector3(x,y,depth)));
 const mesh=new T.Mesh(new T.TubeGeometry(curve,32,radius,5,false),material);mesh.receiveShadow=true;root.add(mesh);return mesh;
}

function relief(root,room,mats,cube,theme){
 const accent=new T.MeshStandardMaterial({color:theme.color,roughness:.79,metalness:.08});
 const dark=mats.edge,plaster=mats.paper;
 // The west aperture is central where present; this panel stays entirely in
 // the northern solid wall segment. Other rooms have an uninterrupted side.
 const group=wallGroup(root,-room.w/2+.39,2.55,-4.65,Math.PI/2,`wall-relief-${room.number}`);
 cube(group,4.55,2.92,.10,0,0,0,mats.ceramic);
 cube(group,4.42,2.79,.06,0,0,.075,plaster);
 const box=(w,h,x,y,material=accent,z=.15,angle=0)=>{const m=cube(group,w,h,.065,x,y,z,material);m.rotation.z=angle;m.castShadow=false;return m;};
 switch(room.id){
  case 0:
   for(const [x,y,w,h] of [[-.58,-.08,1.5,1.95],[.57,.17,1.36,1.62]]){box(.15,h,x-w/2,y);box(.15,h,x+w/2,y);box(w+.15,.15,x,y+h/2);}
   box(3.2,.022,0,-1.12,dark);break;
  case 1:
   for(let i=0;i<5;i++){const x=-1.3+i*.62;box(.025,1.45,x,-.05,dark,.13,-.16+i*.07);for(let j=0;j<3;j++){const leaf=disc(group,x+(j%2?-.14:.14),-.42+j*.45,.18,accent,.055,.43);leaf.rotation.z=(j%2?1:-1)*.5;}}
   break;
  case 2:
   for(const [x,y,r] of [[-1,.08,.7],[0,.25,.84],[1,-.12,.64]]){disc(group,x,y,r,accent,.1);disc(group,x-.08,y+.08,r*.68,plaster,.12);}
   break;
  case 3:
   for(let i=0;i<3;i++){const points=Array.from({length:33},(_,j)=>{const a=j/32*Math.PI*1.72;return [Math.cos(a)*(1.6-i*.35),Math.sin(a)*(.92-i*.2)];});stroke(group,points,i===1?dark:accent,.13+i*.04,.035);}
   disc(group,.1,-.05,.19,dark);break;
  case 4:
   for(let i=0;i<7;i++)stroke(group,Array.from({length:20},(_,j)=>{const x=-1.75+j/19*3.5;return [x,-.87+i*.27+Math.sin(x*2+i*.25)*.17];}),accent,.12+i*.01,.035);
   break;
  case 5:
   disc(group,.27,.18,.93,accent,.08);disc(group,-.17,.15,.81,plaster,.13);
   for(let i=0;i<5;i++)box(2.5-i*.27,.025,-.35,-.48-i*.13,accent);
   break;
  case 6:
   for(let i=0;i<5;i++)box(.63,1.8,-1.28+i*.64,Math.sin(i*.7)*.18,i%2?mats.ceramic:accent,.13+i*.02,(i-2)*.09);
   break;
  case 7:
   box(3.35,.028,0,.65,dark);box(.028,.35,0,.83,dark);
   for(const [x,y,r] of [[-1.2,-.37,.48],[.02,-.1,.55],[1.27,-.38,.41]]){box(.022,.65,x,.3,dark);disc(group,x,y,r,accent,.07,.72);}
   break;
  case 8:
   for(let i=0;i<7;i++)box(.34,1.35+Math.sin(i*.7)*.54,-1.47+i*.49,Math.cos(i*.8)*.12,i%2?mats.ceramic:accent,.13+i%3*.025);
   break;
  case 9:
   for(let i=0;i<4;i++)stroke(group,Array.from({length:32},(_,j)=>{const a=-Math.PI*.15+j/31*Math.PI*1.4;return [Math.cos(a)*(1.54-i*.29),Math.sin(a)*(.97-i*.17)-.14];}),accent,.13+i*.025,.036);
   break;
 }
 batchRoomArchitecture(group);
 // A separate vertical material rhythm balances the panel without filling
 // the room with new floor obstacles, lights or continuously rendered effects.
 const ribs=wallGroup(root,room.w/2-.39,2.7,-4.9,-Math.PI/2,`wall-ribs-${room.number}`);
 for(let i=0;i<9;i++){const h=2.1+Math.sin(i*.45+room.id*.4)*.65;cube(ribs,.065,h,.075,(i-4)*.19,0,0,i%3?mats.oak:accent);}
 batchRoomArchitecture(ribs);
}

export function curateRoomWalls(root,room,mats,cube){
 const theme=themes[room.id];
 const group=wallGroup(root,room.w/2-.42,2.4,4.7,-Math.PI/2,`room-guide-${room.number}`);
 cube(group,2.91,3.27,.075,0,0,0,mats.edge);
 cube(group,2.79,3.15,.08,0,0,.057,mats.ceramic);
 const face=new T.Mesh(new T.PlaneGeometry(2.7,3.12),new T.MeshBasicMaterial({map:textTexture(room,theme)}));face.position.z=.104;face.raycast=()=>{};group.add(face);
 for(const y of [-1.51,1.51])cube(group,2.7,.025,.018,0,y,.12,mats.oak);
 batchRoomArchitecture(group);
 relief(root,room,mats,cube,theme);
}

export function lobbyWallArtwork(root,mats,cube,loader){
 const texture=loader.load(assetUrl('/art/lobby-afterimage.webp'));texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 // South lobby wall was previously blank. Facing inward, below the skylight.
 const group=wallGroup(root,0,3.85,16.57,Math.PI,'lobby-feature-artwork');
 cube(group,8.04,5.38,.14,0,0,0,mats.edge);
 cube(group,7.94,5.28,.16,0,0,.055,mats.bronze);
 const face=new T.Mesh(new T.PlaneGeometry(7.8,5.2),new T.MeshStandardMaterial({map:texture,roughness:.95,emissiveMap:texture,emissive:0xffffff,emissiveIntensity:.08}));face.position.z=.15;group.add(face);
 batchRoomArchitecture(group);
}
