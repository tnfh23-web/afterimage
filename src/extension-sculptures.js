import * as T from 'three';
import {batchSculpture} from './sculpture-batches';

const mesh=(root,geometry,material,x=0,y=0,z=0)=>{
 const object=new T.Mesh(geometry,material);object.position.set(x,y,z);object.castShadow=object.receiveShadow=true;root.add(object);return object;
};

// A closed, thickened parametric sheet: front/back, edges and end caps are
// actual geometry, so the work remains solid when inspected from any angle.
function sheet(point,thickness=.08,steps=96,across=10){
 const positions=[],uvs=[],indices=[],row=across+1,count=(steps+1)*row;
 for(const side of [1,-1])for(let i=0;i<=steps;i++)for(let j=0;j<=across;j++){
  const u=i/steps,v=j/across*2-1,p=point(u,v),epsilon=.0001;
  const tangent=point(Math.min(1,u+epsilon),v).sub(point(Math.max(0,u-epsilon),v));
  const width=point(u,Math.min(1,v+epsilon)).sub(point(u,Math.max(-1,v-epsilon)));
  const normal=new T.Vector3().crossVectors(width,tangent).normalize();p.addScaledVector(normal,side*thickness/2);
  positions.push(p.x,p.y,p.z);uvs.push(j/across,i/steps);
 }
 const quad=(a,b,c,d)=>indices.push(a,b,c,a,c,d);
 for(let i=0;i<steps;i++)for(let j=0;j<across;j++){
  const a=i*row+j,b=a+1,c=a+row+1,d=a+row;
  quad(a,b,c,d);quad(a+count,d+count,c+count,b+count);
 }
 for(let i=0;i<steps;i++)for(const j of [0,across]){
  const a=i*row+j,b=a+row;if(j===0)quad(a,b,b+count,a+count);else quad(b,a,a+count,b+count);
 }
 for(let j=0;j<across;j++)for(const i of [0,steps]){
  const a=i*row+j,b=a+1;if(i===0)quad(b,a,a+count,b+count);else quad(a,b,b+count,a+count);
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

function bowedSlab(height){
 const shape=new T.Shape();shape.moveTo(-.21,0);shape.bezierCurveTo(.32,height*.28,.34,height*.67,-.05,height);shape.lineTo(.25,height-.09);shape.bezierCurveTo(.69,height*.6,.52,height*.25,.17,0);shape.closePath();
 const geometry=new T.ExtrudeGeometry(shape,{depth:.48,bevelEnabled:true,bevelThickness:.035,bevelSize:.025,bevelSegments:3,curveSegments:32});geometry.translate(0,0,-.24);return geometry;
}

export function buildExtension(id,mats){
 const group=new T.Group(),animated=[],{ivory,bronze,plinth}=mats;
 if(id===6){
  mesh(group,new T.BoxGeometry(4.2,.3,2.45),plinth,0,.15,0);
  const fold=(u,v)=>{const angle=-.72+u*Math.PI*1.45,widthAngle=.95*Math.sin(u*Math.PI*2);return new T.Vector3(Math.sin(angle)*.78+v*1.08*Math.cos(widthAngle),.34+u*3.55,Math.cos(angle)*.6+v*1.08*Math.sin(widthAngle));};
  mesh(group,sheet(fold,.09),ivory);
 }
 if(id===7){
  mesh(group,new T.CylinderGeometry(2.1,2.1,.3,64),plinth,0,.15,0);
  mesh(group,new T.CylinderGeometry(.038,.045,3.95,16),bronze,0,2.275,0);
  const levels=[{y:3.64,x:-1.48,z:0,h:1.55,w:.7,angle:.02},{y:2.85,x:1.48,z:.05,h:1.48,w:.72,angle:.25},{y:1.82,x:.66,z:.24,h:.94,w:.72,angle:-.2}];
  levels.forEach((r,i)=>{
   const arm=new T.Group();arm.position.set(0,r.y,0);group.add(arm);
   mesh(arm,new T.CylinderGeometry(.075,.075,.14,24),bronze);
   const beam=mesh(arm,new T.CylinderGeometry(.022,.022,Math.abs(r.x)+.35,12),bronze,r.x/2,0,0);beam.rotation.z=Math.PI/2;
   const wireLength=.15+i*.03;mesh(arm,new T.CylinderGeometry(.006,.006,wireLength,6),bronze,r.x,-wireLength/2,0);
   const disc=mesh(arm,new T.CylinderGeometry(1,1,.055,64),ivory,r.x,-wireLength-r.h/2,0);disc.rotation.x=Math.PI/2;disc.scale.set(r.w/2,1,r.h/2);
   const counter=mesh(arm,new T.SphereGeometry(.065,16,12),bronze,-Math.sign(r.x)*.18,0,0);
   batchSculpture(arm,true);
   animated.push(time=>{arm.rotation.y=r.angle+Math.sin(time*.18+i*1.6)*.07;});
  });
 }
 if(id===8){
  mesh(group,new T.BoxGeometry(4.55,.3,1.75),plinth,0,.15,0);
  const heights=[1.42,2.1,2.87,3.7,2.94,2.11,1.42];
  heights.forEach((height,i)=>{const slab=mesh(group,bowedSlab(height),ivory,(i-3)*.59,.34,0);slab.rotation.y=(i-3)*.095;});
 }
 if(id===9){
  mesh(group,new T.CylinderGeometry(1.76,1.76,.3,80),plinth,0,.15,0);
  const spiral=(u,v)=>{const angle=-.6+u*Math.PI*4;return new T.Vector3(Math.cos(angle)*1.17,.76+u*3.12+v*.4,Math.sin(angle)*1.17);};
  mesh(group,sheet(spiral,.075,160,8),ivory);
  for(const v of [-1,1]){
   const points=Array.from({length:161},(_,i)=>spiral(i/160,v));
   mesh(group,new T.TubeGeometry(new T.CatmullRomCurve3(points),160,.023,6,false),bronze);
  }
 }
 batchSculpture(group);group.userData.kind='sculpture';return {group,animated};
}
