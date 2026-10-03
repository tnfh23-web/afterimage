import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';
import {Mesh,PlaneGeometry,Scene,OrthographicCamera,WebGLRenderTarget} from 'three';
import {preparationFrame} from './preparation-scheduler';

export function sceneEffects(renderer,scene,camera,width,height){
 const composer=new EffectComposer(renderer),render=new RenderPass(scene,camera),ao=new GTAOPass(scene,camera,Math.round(width*.5),Math.round(height*.5),undefined,{radius:.38,thickness:1.5,distanceExponent:1.2,scale:1,samples:8},{radius:3,rings:2,samples:6}),output=new OutputPass();
 const antialias=new ShaderPass(FXAAShader);
 ao.blendIntensity=.6;composer.addPass(render);composer.addPass(ao);composer.addPass(output);composer.addPass(antialias);
 const resize=(w,h,ratio=renderer.getPixelRatio())=>{composer.setPixelRatio(ratio);composer.setSize(w,h);ao.setSize(Math.max(1,Math.round(w*ratio*.45)),Math.max(1,Math.round(h*ratio*.45)));antialias.uniforms.resolution.value.set(1/Math.max(1,Math.floor(w*ratio)),1/Math.max(1,Math.floor(h*ratio)));};
 resize(width,height);
 const prepare=async()=>{
  const preview=new Scene(),view=new OrthographicCamera(-1,1,1,-1,0,2),geometry=new PlaneGeometry(2,2),target=new WebGLRenderTarget(16,16),saved=renderer.getRenderTarget();
  renderer.setRenderTarget(target);
  try{
   for(const material of [ao.normalMaterial,ao.gtaoMaterial,ao.pdMaterial,ao.blendMaterial,antialias.material]){
    const quad=new Mesh(geometry,material);preview.add(quad);await renderer.compileAsync(preview,view);preview.remove(quad);await preparationFrame();
   }
   // OutputPass establishes its colour/tone-map defines on its first draw.
   output.render(renderer,target,composer.readBuffer);await preparationFrame();
  }finally{renderer.setRenderTarget(saved);geometry.dispose();target.dispose();}
 };
 return {resize,prepare,render:()=>composer.render(),dispose(){render.dispose();ao.dispose();ao.gtaoMaterial.dispose();ao.blendMaterial.dispose();output.dispose();antialias.dispose();composer.dispose();}};
}

