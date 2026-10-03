import {Mesh,Matrix4} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Preserve the animated parent while combining its fixed parts by material.
// Moving meshes are explicitly excluded; picking identity stays on the artwork.
export function batchSculpture(root,recursive=false){
 root.updateWorldMatrix(true,true);
 const inverse=new Matrix4().copy(root.matrixWorld).invert(),buckets=new Map();
 const collect=mesh=>{
  if(!mesh.isMesh||Array.isArray(mesh.material)||mesh.userData.moving||(!recursive&&mesh.children.length))return;
  const attributes=Object.entries(mesh.geometry.attributes).map(([name,a])=>`${name}:${a.itemSize}`).sort().join(',');
  const key=`${mesh.material.uuid}:${!!mesh.geometry.index}:${attributes}:${mesh.castShadow}:${mesh.receiveShadow}`;
  if(!buckets.has(key))buckets.set(key,[]);
  buckets.get(key).push(mesh);
 };
 if(recursive)root.traverse(collect);else root.children.forEach(collect);
 const disposed=new Set();
 for(const parts of buckets.values()){
  if(parts.length<2&&!recursive)continue;
  const geometries=parts.map(part=>part.geometry.clone().applyMatrix4(new Matrix4().multiplyMatrices(inverse,part.matrixWorld)));
  const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());
  if(!geometry)continue;
  geometry.computeBoundingBox();geometry.computeBoundingSphere();
  const combined=new Mesh(geometry,parts[0].material);combined.castShadow=parts[0].castShadow;combined.receiveShadow=parts[0].receiveShadow;
  parts.forEach(part=>{part.removeFromParent();disposed.add(part.geometry);});root.add(combined);
 }
 // Shared geometries can still belong to an unmerged bucket.
 const retained=new Set();root.traverse(o=>{if(o.geometry)retained.add(o.geometry);});
 disposed.forEach(g=>{if(!retained.has(g))g.dispose();});
}
