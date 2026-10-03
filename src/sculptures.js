import * as T from 'three';
import {buildSculpture} from './sculpture-models';
export function portalShape(width=1.7,height=3.5,stroke=.22,open=false){
 if(open==='arch'){const s=new T.Shape();s.moveTo(0,0);s.lineTo(stroke,0);s.lineTo(stroke,height-stroke);s.lineTo(width-stroke,height-stroke);s.lineTo(width-stroke,0);s.lineTo(width,0);s.lineTo(width,height);s.lineTo(0,height);s.closePath();return s;}
 const s=new T.Shape();if(open){s.moveTo(0,0);s.lineTo(width*.36,0);s.lineTo(width*.36,stroke);s.lineTo(stroke,stroke);s.lineTo(stroke,height-stroke);s.lineTo(width-stroke,height-stroke);s.lineTo(width-stroke,height*.17);s.lineTo(width,height*.17);s.lineTo(width,height);s.lineTo(0,height);s.closePath();}else{s.moveTo(0,0);s.lineTo(width,0);s.lineTo(width,height);s.lineTo(0,height);s.closePath();const h=new T.Path();h.moveTo(stroke,stroke);h.lineTo(stroke,height-stroke);h.lineTo(width-stroke,height-stroke);h.lineTo(width-stroke,stroke);h.closePath();s.holes.push(h);}return s;
}
export function extrudePortal(mat,w,h,stroke,depth,open=false){const m=new T.Mesh(new T.ExtrudeGeometry(portalShape(w,h,stroke,open),{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.012}),mat);m.castShadow=true;m.receiveShadow=true;return m;}

export function createSculpture(id,mats){return buildSculpture(id,mats,extrudePortal);}
