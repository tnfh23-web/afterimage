import {WebGLRenderTarget} from 'three';
import {compileVariants,preparationFrame} from './preparation-scheduler';

// A tiny offscreen draw allocates geometry and shadow resources before a room
// is visited. Parallel shader compilation finishes before we ask the GPU to draw.
export async function prepareRooms({renderer,scene,camera,rooms,initialZone=0,activate,position,target,progress,isDisposed}){
 const warmTarget=new WebGLRenderTarget(64,64,{depthBuffer:true});
 const savedPosition=camera.position.clone(),savedQuaternion=camera.quaternion.clone();
 const oldTarget=renderer.getRenderTarget();
 const yieldFrame=preparationFrame;
 try{
  // Compile for the linear offscreen target used by the composer/reflector.
  // Compiling with the canvas target selected warmed the wrong tone-map variants.
  renderer.setRenderTarget(warmTarget);
  await compileVariants(renderer,scene,camera,isDisposed);
  renderer.setRenderTarget(oldTarget);
  for(const room of rooms){
   if(isDisposed())return;
   activate(room.id);
   camera.position.copy(position(room.id));camera.lookAt(target(room.id));scene.updateMatrixWorld(true);
   await yieldFrame();
   renderer.shadowMap.needsUpdate=true;
   renderer.setRenderTarget(warmTarget);renderer.render(scene,camera);renderer.setRenderTarget(oldTarget);
   progress(65+(room.id+1)/rooms.length*30,`${room.number} ${room.title} 준비`);
   await yieldFrame();
  }
 }finally{
  if(!isDisposed()){
   renderer.setRenderTarget(oldTarget);camera.position.copy(savedPosition);camera.quaternion.copy(savedQuaternion);
   activate(initialZone);
   renderer.shadowMap.needsUpdate=true;
  }
  warmTarget.dispose();
 }
}
