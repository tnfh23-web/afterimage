import {assetUrl} from './asset-url';
import React,{useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export default function LogoStudy(){const host=useRef(null),[failed,setFailed]=useState(false);useEffect(()=>{
 let renderer,frame,disposed=false,model,visible=false,held=false,resumeAt=0,lastTime=0,speed=0;
 const el=host.current;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch{setFailed(true);return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','AFTERIMAGE 입체 로고. 드래그하거나 방향키로 회전');renderer.domElement.tabIndex=0;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.01,100);scene.add(new T.HemisphereLight(0xffffff,0x756b55,2));const key=new T.DirectionalLight(0xffffff,4);key.position.set(3,6,5);scene.add(key);const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=true;controls.dampingFactor=.07;controls.minPolarAngle=.7;controls.maxPolarAngle=2.1;
 const pref=matchMedia('(prefers-reduced-motion: reduce)');
 const draw=()=>{if(!disposed&&visible&&!document.hidden)renderer.render(scene,camera);};
 const tick=time=>{frame=null;if(disposed||!visible||document.hidden||pref.matches)return;const delta=lastTime?Math.min((time-lastTime)/1000,.05):1/60;lastTime=time;const target=!held&&time>=resumeAt?1.55:0;speed=T.MathUtils.damp(speed,target,2.8,delta);controls.autoRotate=!held&&time>=resumeAt;controls.autoRotateSpeed=speed;controls.dampingFactor=1-Math.exp(-7*delta);controls.update(delta);draw();frame=requestAnimationFrame(tick);};
 const schedule=()=>{cancelAnimationFrame(frame);frame=null;lastTime=0;controls.enableDamping=!pref.matches;controls.autoRotate=false;if(pref.matches)speed=0;draw();if(visible&&!document.hidden&&!pref.matches)frame=requestAnimationFrame(tick);};
 const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();draw();};
 const ro=new ResizeObserver(resize);ro.observe(el);const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{root:el.closest('.case-study')});io.observe(el);
 const disposeObject=object=>object.traverse(o=>{o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose());});
 new GLTFLoader().load(assetUrl('/logo.glb'),gltf=>{if(disposed){disposeObject(gltf.scene);return;}const artwork=gltf.scene;artwork.traverse(o=>{if(o.isMesh){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose());o.material=new T.MeshStandardMaterial({color:0x625749,roughness:.5,metalness:.25});}});const box=new T.Box3().setFromObject(artwork),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());artwork.position.sub(center);model=new T.Group();model.add(artwork);scene.add(model);camera.position.set(size.x*.12,size.y*.6,Math.max(size.x,size.y)*1.85);camera.lookAt(0,0,0);controls.target.set(0,0,0);controls.update();resize();},undefined,()=>{if(!disposed)setFailed(true);});
 const start=()=>{held=true;speed=0;controls.autoRotate=false;};const end=()=>{held=false;resumeAt=performance.now()+1800;};
 const change=()=>{if(pref.matches)draw();};controls.addEventListener('start',start);controls.addEventListener('end',end);controls.addEventListener('change',change);
 const keydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||!model)return;e.preventDefault();speed=0;resumeAt=performance.now()+1800;if(e.key==='ArrowLeft')model.rotation.y-=.1;if(e.key==='ArrowRight')model.rotation.y+=.1;if(e.key==='ArrowUp')model.rotation.x-=.1;if(e.key==='ArrowDown')model.rotation.x+=.1;draw();};renderer.domElement.addEventListener('keydown',keydown);
 pref.addEventListener('change',schedule);document.addEventListener('visibilitychange',schedule);schedule();
 return()=>{disposed=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();controls.removeEventListener('start',start);controls.removeEventListener('end',end);controls.removeEventListener('change',change);controls.dispose();pref.removeEventListener('change',schedule);document.removeEventListener('visibilitychange',schedule);renderer.domElement.removeEventListener('keydown',keydown);disposeObject(scene);renderer.dispose();renderer.domElement.remove();};
 },[]);return <div ref={host} className="logo-study">{failed&&<img src={assetUrl('/mark.svg')} alt="입체 로고와 동일한 두 문틀 마크"/>}</div>;}

