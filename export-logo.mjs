import fs from 'node:fs';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import * as T from 'three';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {extrudePortal} from './src/sculptures.js';
const font=new FontLoader().parse(JSON.parse(fs.readFileSync('public/fonts/helvetiker_bold.typeface.json','utf8')));
const shapes=font.generateShapes('AFTERIMAGE',105);
const paths=shapes.map(shape=>{const contour=shape.getPoints(14),holes=shape.holes.map(h=>h.getPoints(14));return [contour,...holes].map(points=>'M'+points.map(p=>`${p.x.toFixed(2)},${(-p.y).toFixed(2)}`).join(' L')+' Z').join(' ');});
const mark='M6 4H46V46H40V10H12V66H26V72H6Z M26 18H66V74H60V24H32V78H46V84H26Z';
fs.writeFileSync('public/logo.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 210" role="img" aria-label="AFTERIMAGE"><g fill="#eeeae2"><path transform="translate(20,10) scale(2)" d="${mark}"/><g transform="translate(205,137) scale(.88,1)">${paths.map(d=>`<path fill-rule="evenodd" d="${d}"/>`).join('')}</g></g></svg>`);
console.log('Exported all-path vector logo, matching the physical entrance letterforms.');
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result=`data:${blob.type};base64,${Buffer.from(result).toString('base64')}`;this.onloadend?.();});}};
const group=new T.Group();group.name='AFTERIMAGE_Original_Logo';const material=new T.MeshStandardMaterial({color:0xeeeae2,metalness:.45,roughness:.3});
for(let i=0;i<2;i++){const m=extrudePortal(material,.32,.59,.045,.045,true);m.name=`Offset_portal_${i+1}`;m.position.set(i*.18,-i*.11,0);group.add(m);}
const word=new T.Mesh(new TextGeometry('AFTERIMAGE',{font,size:.23,depth:.025,curveSegments:8,bevelEnabled:false}),material);word.name='Extruded_wordmark';word.position.set(.72,.17,.02);word.scale.x=.72;group.add(word);
const binary=await new GLTFExporter().parseAsync(group,{binary:true});fs.writeFileSync('public/logo.glb',Buffer.from(binary));console.log('Exported solid 3D emblem and extruded wordmark as logo.glb.');
