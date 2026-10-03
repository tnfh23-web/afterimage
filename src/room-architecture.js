import * as T from 'three';

export function roomShell(root,room,doors,mats,cube){
 const obstacles=[];
 if(room.id===1){
  cube(root,16,.18,5.4,0,5.1,-5.3,mats.ceiling);cube(root,16,.18,5.4,0,5.1,5.3,mats.ceiling);
  cube(root,5.5,.18,5.2,-5.25,5.1,0,mats.ceiling);cube(root,5.5,.18,5.2,5.25,5.1,0,mats.ceiling);
  const liner=mats.wall.clone();liner.color.set(0x9ea4a6);
  cube(root,5,.16,5.2,0,6.45,0,liner);cube(root,.14,1.4,5.2,-2.5,5.7,0,liner);cube(root,.14,1.4,5.2,2.5,5.7,0,liner);
  cube(root,5,1.4,.14,0,5.7,-2.6,liner);cube(root,5,1.4,.14,0,5.7,2.6,liner);
  const daylight=new T.PointLight(0xcbd9e1,24,11,2);daylight.position.set(0,5.65,0);root.add(daylight);
 }else cube(root,16,.18,16,0,5.1,0,mats.ceiling);
 for(const side of ['north','south','east','west']){
  const alongX=side==='north'||side==='south',edge=side==='north'||side==='west'?-8:8,opening=doors.has(side);
  const wall=(length,height,y,along)=>{if(y-height/2<1.75)obstacles.push({x:room.x+(alongX?along:edge),z:room.z+(alongX?edge:along),w:alongX?length:.65,d:alongX?.65:length});return alongX?cube(root,length,height,.65,along,y,edge,mats.wall):cube(root,.65,height,length,edge,y,along,mats.wall);};
  if(room.id===5&&side==='north'){
   wall(6.25,5,2.5,-4.875);wall(7.25,5,2.5,4.375);
   const pale=mats.wall.clone();pale.color.set(0xc1c3bb);pale.roughness=.9;
   cube(root,2.5,.14,4.6,-.5,-.015,-10.3,mats.floor);cube(root,.18,5,4.6,-1.75,2.5,-10.3,pale);cube(root,.18,5,4.6,.75,2.5,-10.3,pale);
   const horizon=new T.Mesh(new T.PlaneGeometry(2.5,5),new T.MeshBasicMaterial({color:0xead8b7}));horizon.position.set(-.5,2.5,-12.6);root.add(horizon);
   const wash=new T.PointLight(0xffe1ac,52,12,2);wash.position.set(-.5,3.8,-9.6);root.add(wash);
  }else if(opening){
   wall(6,5,2.5,-5);wall(6,5,2.5,5);wall(4,1.4,4.3,0);
   if(alongX){cube(root,.25,3.6,.92,-2.13,1.8,edge,mats.wall);cube(root,.25,3.6,.92,2.13,1.8,edge,mats.wall);cube(root,4.5,.22,.92,0,3.7,edge,mats.wall);}
   else{cube(root,.92,3.6,.25,edge,1.8,-2.13,mats.wall);cube(root,.92,3.6,.25,edge,1.8,2.13,mats.wall);cube(root,.92,.22,4.5,edge,3.7,0,mats.wall);}
  }else wall(16,5,2.5,0);
 }
 if(room.id===0){cube(root,2,5,.4,-6.7,2.5,4.6,mats.wall);obstacles.push({x:room.x-6.7,z:room.z+4.6,w:2,d:.4});}
 for(const x of [-6.8,6.8]){
  cube(root,.16,.015,1.8,x,.12,-7.62,mats.light);
  const uplight=new T.PointLight(room.color,6.5,5,2);uplight.position.set(x,.35,-7.3);root.add(uplight);
 }
 if(room.id===3||room.id===5){
  cube(root,11,.025,.055,1,4.9,-7.53,mats.light);
  for(const x of [-3,2,6]){const wash=new T.PointLight(room.color,8,7,2);wash.position.set(x,4.5,-7.2);root.add(wash);}
 }
 return obstacles;
}

export function particleProjection(root,animations){
 const positions=[];let seed=27931;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<19000;i++){
  const x=(random()-.5)*5.45,y=(random()-.5)*3.65,ellipse=x*x/(.79*.79)+y*y/(.97*.97);
  if(ellipse<1)continue;
  const flow=.12*Math.sin(x*3.5+y*4)+.1*Math.cos(y*7-x*1.8);
  positions.push(x,y+flow,.015*Math.sin(x*7+y*5));
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 const points=new T.Points(geometry,new T.PointsMaterial({color:0xf1bd78,size:.012,transparent:true,opacity:.72,depthWrite:false}));points.position.set(-3.05,2.68,-7.64);root.add(points);
 animations.push({id:3,updates:[time=>{points.rotation.z=Math.sin(time*.06)*.018;}]});
}

