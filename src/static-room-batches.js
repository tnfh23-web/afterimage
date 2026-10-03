import {Mesh} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Only direct architectural meshes are batched. Artwork groups keep their
// transforms, animation and picking identity, and transparent floors stay separate.
export function batchRoomArchitecture(root){
 const batches=new Map();
 for(const child of root.children){
  if(!child.isMesh||Array.isArray(child.material)||child.material.transparent)continue;
  if(!['BoxGeometry','CylinderGeometry'].includes(child.geometry.type))continue;
  const key=`${child.material.uuid}:${child.castShadow}:${child.receiveShadow}`;
  if(!batches.has(key))batches.set(key,[]);
  batches.get(key).push(child);
 }
 for(const children of batches.values()){
  if(children.length<2)continue;
  const transformed=children.map(child=>{child.updateMatrix();return child.geometry.clone().applyMatrix4(child.matrix);});
  const geometry=mergeGeometries(transformed);
  transformed.forEach(part=>part.dispose());
  if(!geometry)continue;
  const combined=new Mesh(geometry,children[0].material);
  combined.castShadow=children[0].castShadow;combined.receiveShadow=children[0].receiveShadow;
  for(const child of children){root.remove(child);child.geometry.dispose();}
  root.add(combined);
 }
}
