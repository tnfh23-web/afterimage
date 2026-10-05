import * as T from 'three';
import {mineralRock,curvedLeaf,veiledBust} from './sculpture-detail';
import {batchSculpture} from './sculpture-batches';
import {buildExtension} from './extension-sculptures';
const mesh=(parent,geometry,material,x=0,y=0,z=0)=>{const object=new T.Mesh(geometry,material);object.position.set(x,y,z);object.castShadow=object.receiveShadow=true;parent.add(object);return object;};
function band(radius,width){const shape=new T.Shape();shape.absarc(0,0,radius,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,radius-width,0,Math.PI*2,true);shape.holes.push(hole);return new T.ExtrudeGeometry(shape,{depth:.05,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,curveSegments:96});}
function rib(height){
 const curve=new T.CatmullRomCurve3([new T.Vector3(-1.12,0,0),new T.Vector3(-.98,height*.48,0),new T.Vector3(-.62,height*.91,0),new T.Vector3(-.1,height,0),new T.Vector3(.62,height*.8,0),new T.Vector3(1.08,0,0)]),points=curve.getPoints(72),shape=new T.Shape(),outer=[],inner=[];
 points.forEach((point,index)=>{const tangent=curve.getTangent(index/72),normal=new T.Vector2(-tangent.y,tangent.x).multiplyScalar(.065);outer.push([point.x+normal.x,point.y+normal.y]);inner.push([point.x-normal.x,point.y-normal.y]);});
 shape.moveTo(...outer[0]);outer.slice(1).forEach(point=>shape.lineTo(...point));inner.reverse().forEach(point=>shape.lineTo(...point));shape.closePath();
 return new T.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:2,steps:1});
}
export function buildSculpture(id,mats,extrudePortal){
 if(id>=6)return buildExtension(id,mats);
 const group=new T.Group(),animated=[],{ivory,bronze,plinth,blue,stone}=mats;
 if(id===0){
  mesh(group,new T.BoxGeometry(5.1,.3,2.5),plinth,0,.15,0);
  const rear=extrudePortal(ivory,1.85,4.05,.31,.48,'arch');rear.position.set(-1.18,.31,-.4);group.add(rear);
  const front=extrudePortal(ivory,1.7,3.48,.31,.48,'arch');front.position.set(-.05,.31,.32);group.add(front);
 }
 if(id===1){
  const rock=mesh(group,mineralRock(1.2),stone);rock.scale.set(1.42,.77,1.08);rock.geometry.computeBoundingBox();rock.position.y=-rock.geometry.boundingBox.min.y*.77+.005;rock.rotation.y=.35;
  const canopy=new T.Group();group.add(canopy);const leafGeometry=curvedLeaf();
  for(let i=0;i<8;i++){
   const phase=i*2.39996,radius=1.2+(i%3)*.38,top=3.65+(i%4)*.25;
   const curve=new T.CatmullRomCurve3([new T.Vector3(Math.sin(phase)*.3,1.85,Math.cos(phase)*.3),new T.Vector3(Math.sin(phase+.45)*radius,2.25,Math.cos(phase+.45)*radius),new T.Vector3(Math.sin(phase+1)*radius,3.08,Math.cos(phase+1)*radius),new T.Vector3(Math.sin(phase+.6)*radius*.72,top,Math.cos(phase+.6)*radius*.72)]);
   mesh(canopy,new T.TubeGeometry(curve,72,.012,8,false),bronze);
   const anchor=curve.getPoint(.92),wire=new T.CatmullRomCurve3([anchor,new T.Vector3(anchor.x,4.96,anchor.z)]);mesh(group,new T.TubeGeometry(wire,1,.0035,4,false),bronze);
   for(let j=0;j<3;j++){
    const fraction=.35+j*.24,position=curve.getPoint(fraction),leaf=mesh(canopy,leafGeometry,mats.leaf||ivory,position.x,position.y,position.z),direction=new T.Vector3(Math.sin(phase+j*.7)*.8,.25,Math.cos(phase+j*.7)*.8).normalize();
    leaf.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction);leaf.rotateY((i%2?1:-1)*.5);leaf.scale.setScalar(.54+((i+j)%4)*.12);
    const vein=new T.CatmullRomCurve3([new T.Vector3(0,0,.009),new T.Vector3(0,.5,.13),new T.Vector3(0,1,.095)]);mesh(leaf,new T.TubeGeometry(vein,20,.003,4,false),bronze);
   }
  }
  const posts=[[-2,-1.5],[2,-1.5],[2,1.5],[-2,1.5]].map(([x,z])=>new T.Vector3(x,0,z));
  posts.forEach(p=>mesh(group,new T.CylinderGeometry(.008,.008,.48,6),bronze,p.x,.24,p.z));
  const boundary=new T.CatmullRomCurve3([...posts.map(p=>new T.Vector3(p.x,.48,p.z)),new T.Vector3(posts[0].x,.48,posts[0].z)],false,'catmullrom',0);mesh(group,new T.TubeGeometry(boundary,4,.004,4,false),bronze);
  batchSculpture(canopy,true);
  animated.push(time=>{canopy.rotation.y=Math.sin(time*.13)*.025;canopy.rotation.z=Math.sin(time*.2)*.008;});
 }
 if(id===2){
  const bustTemplate=veiledBust(mats);
  for(let i=0;i<3;i++){
   const x=(i-1)*1.8,z=i===1?.55:-1.1,scale=i===1?1:.7,baseHeight=i===1?1.05:.82;
   mesh(group,new T.CylinderGeometry(i===1?.7:.53,i===1?.7:.53,baseHeight,96),bronze,x,baseHeight/2,z);
   const bust=bustTemplate.clone(true);bust.position.set(x,baseHeight,z);bust.scale.setScalar(scale);bust.rotation.y=(i-1)*.38;group.add(bust);
  }
 }
 if(id===3){
  mesh(group,new T.CylinderGeometry(2.65,2.65,.28,120),plinth,0,.14,0);
  const orbit=new T.Group();orbit.position.y=1.85;group.add(orbit);
  const sphere=mesh(orbit,new T.SphereGeometry(1.04,80,56),ivory);sphere.rotation.y=.4;
  const a=mesh(orbit,band(2.22,.17),bronze);a.rotation.set(1.05,.22,-.5);
  const b=mesh(orbit,band(1.86,.085),bronze);b.rotation.set(.15,1.07,.23);
  const c=mesh(orbit,band(1.79,.09),bronze);c.rotation.set(Math.PI/2,.08,.04);c.scale.y=.85;
  for(const x of [-.74,.74])for(const z of [-.56,.56])mesh(group,new T.CylinderGeometry(.012,.012,1.24,8),bronze,x,.89,z);
  for(let i=0;i<3;i++){
   const pendulum=new T.Group();pendulum.position.set((i-1)*1.4,4.98,-2.05);group.add(pendulum);const length=2.5+(i===1?.2:-i*.08);
   mesh(pendulum,new T.CylinderGeometry(.0045,.0045,length,6),bronze,0,-length/2,0);
   mesh(pendulum,new T.BoxGeometry(.16,1.25,.055),bronze,0,-1.3-i*.1,0);
   const bob=mesh(pendulum,new T.CylinderGeometry(.115,.115,.035,48),bronze,0,-length,0);bob.rotation.x=Math.PI/2;
   mesh(group,new T.CylinderGeometry(.09,.09,.025,24),bronze,(i-1)*1.4,4.98,-2.05);
   batchSculpture(pendulum,true);
   animated.push(time=>{pendulum.rotation.z=Math.sin(time*.55+i)*.045;});
  }
  a.userData.moving=b.userData.moving=c.userData.moving=true;
  animated.push(time=>{a.rotation.y=.22+time*.025;b.rotation.z=.23-time*.023;c.rotation.y=.08+time*.018;});
 }
 if(id===4){
  mesh(group,new T.BoxGeometry(5.65,.28,2.65),plinth,0,.14,0);const wave=new T.Group();group.add(wave);
  for(let i=0;i<32;i++){const t=i/31,height=1.45+.44*Math.cos(t*Math.PI*2)+1.35*t*t,strip=mesh(wave,rib(height),blue,-2.34+i*.15,.33,0);strip.rotation.y=Math.PI/2;}
  mesh(group,new T.BoxGeometry(1.05,.78,1.05),plinth,-3.2,.39,1.2);
  const rockMaterial=ivory.clone();rockMaterial.color.set(0xc4c2b6);rockMaterial.bumpScale=.03;
  const rock=mesh(group,mineralRock(.57,24),rockMaterial,-3.2,1.52,1.2);rock.rotation.set(.13,.45,.18);rock.scale.set(1,.83,.85);
  rock.userData.moving=true;batchSculpture(wave,true);
  animated.push(time=>{rock.position.y=1.52+Math.sin(time*.65)*.035;rock.rotation.y=.45+time*.025;});
 }
 if(id===5){
  mesh(group,new T.BoxGeometry(4.15,.3,2.15),plinth,0,.15,0);
  const portal=extrudePortal(ivory,1.85,4.05,.33,.5,'arch');portal.position.set(-.98,.31,0);portal.rotation.z=-.095;group.add(portal);
  const glow=new T.MeshStandardMaterial({color:0xffe7bd,emissive:0xffdca4,emissiveIntensity:2.6});
  mesh(portal,new T.BoxGeometry(.025,3.63,.035),glow,.342,1.83,.51);mesh(portal,new T.BoxGeometry(.025,3.63,.035),glow,1.508,1.83,.51);mesh(portal,new T.BoxGeometry(1.19,.025,.035),glow,.925,3.71,.51);
 }
 batchSculpture(group,id===0||id===2||id===5);
 group.userData.kind='sculpture';return {group,animated};
}
