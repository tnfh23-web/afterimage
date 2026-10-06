import {useLayoutEffect,useRef} from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// The exhibition stays outside this scroll container.
export function useCaseScroll(ref){
 const smooth=useRef(null);
 useLayoutEffect(()=>{
  const root=ref.current;
  if(!root)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let lenis;
  const configure=()=>{lenis?.destroy();lenis=null;smooth.current=null;if(reduced.matches)return;
  lenis=new Lenis({wrapper:root,content:root,autoRaf:true,lerp:.095,syncTouch:false,
   prevent:node=>node.classList?.contains('logo-study')||node.tagName==='INPUT'});
  smooth.current=lenis;};
  configure();reduced.addEventListener('change',configure);
  const resize=()=>lenis?.resize();
  const observer=new ResizeObserver(resize);
  observer.observe(root.querySelector('.case-content'));
  root.addEventListener('load',resize,true);
  return()=>{observer.disconnect();root.removeEventListener('load',resize,true);reduced.removeEventListener('change',configure);lenis?.destroy();smooth.current=null;};
 },[ref]);
 return smooth;
}
