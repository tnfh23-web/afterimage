// Return control to painting/compositing between construction and upload tasks.
export const preparationFrame=()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));

export async function compileVariants(renderer,scene,camera,isDisposed){
 const {Mesh,Points,Group,MeshDepthMaterial,FrontSide,BackSide,RGBADepthPacking}=await import('three');
 const variants=new Map(),depths=new Map();
 scene.traverse(object=>{
  if(!object.isMesh&&!object.isPoints)return;
  const materials=Array.isArray(object.material)?object.material:[object.material];
  for(const material of materials){
   const attributes=Object.keys(object.geometry.attributes).sort().join(',');
   const add=(m,shadow)=>{const key=`${m.uuid}:${object.isPoints}:${shadow}:${attributes}`;if(!variants.has(key)){const clone=object.isPoints?new Points(object.geometry,m):new Mesh(object.geometry,m);clone.receiveShadow=shadow;variants.set(key,clone);}};
   add(material,object.receiveShadow);
   if(object.castShadow){
    const side=material.shadowSide??(material.side===FrontSide?BackSide:material.side===BackSide?FrontSide:material.side);
    const key=`${side}:${material.map?.uuid||''}:${material.alphaMap?.uuid||''}:${material.alphaTest}`;
    if(!depths.has(key)){const depth=new MeshDepthMaterial({depthPacking:RGBADepthPacking,side,map:material.map,alphaMap:material.alphaMap,alphaTest:material.alphaTest});depths.set(key,depth);}
    object.customDepthMaterial=depths.get(key);add(object.customDepthMaterial,false);
   }
  }
 });
 const root=new Group();
 for(const object of variants.values()){
  if(isDisposed())return;
  root.add(object);
  await renderer.compileAsync(root,camera,scene);
  root.remove(object);
  await preparationFrame();
 }
}
