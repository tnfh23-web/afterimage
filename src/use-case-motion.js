import {useLayoutEffect} from 'react';

const groups = {
 title: '.case-cover h1,.case-heading>span,.case-heading>h2,.case-cover>h2',
 copy: '.case-tagline,.case-cover>.case-lead,.case-metadata,.case-two>p,.case-note,.case-downloads,.case-concept-pair>p,.case-flow-note,.case-validation>span,.case-validation>p,.case-end>p,.case-end>button',
 image: '.case-wide,.case-concept-pair>img,.case-room-preview>figure,.case-identity>div,.case-interaction-screens>figure',
 row: '.case-decisions>div,.case-palette>div,.case-type>div,.case-flow>li,.case-component-study,.case-plan,.case-room-tabs,.case-sound-study>div,.case-sound-study>button,.case-sound-study>label',
};

export function useCaseMotion(ref) {
 useLayoutEffect(()=>{
  const root=ref.current,pref=matchMedia('(prefers-reduced-motion: reduce)'),items=new Map(),playing=new Map(),shown=new Set();
  let observer,frame,disposed=false;
  Object.entries(groups).forEach(([type,selector])=>root.querySelectorAll(selector).forEach(el=>{
   if(!items.has(el))items.set(el,type);
  }));
  const stop=el=>{playing.get(el)?.cancel();playing.delete(el);};
  const reveal=el=>{
   if(disposed||pref.matches||el.dataset.caseState!=='pending')return;
   const type=items.get(el),siblings=[...el.parentElement.children].filter(node=>items.has(node)),delay=Math.min(siblings.indexOf(el),4)*65;
   el.dataset.caseState='entering';shown.add(el);
   const interactive=el.matches('button,a,label')||el.querySelector('button,input,canvas')||el.classList.contains('case-logo-study');
   const from={opacity:0,transform:`translate3d(0,${type==='image'?36:type==='title'?34:24}px,0)`};
   const to={opacity:1,transform:'translate3d(0,0,0)'};
   if(type==='title'){from.clipPath='inset(0 0 100% 0)';to.clipPath='inset(0 0 0% 0)';}
   if(type==='image'){from.transform+=' scale(1.025)';to.transform+=' scale(1)';from.clipPath='inset(6% 0 0 0)';to.clipPath='inset(0 0 0 0)';}
   if(interactive){from.transform=to.transform='none';delete from.clipPath;delete to.clipPath;}
   const animation=el.animate([from,to],{duration:type==='image'?1000:type==='title'?850:700,delay,easing:'cubic-bezier(.22,.8,.24,1)',fill:'both'});
   playing.set(el,animation);
   animation.finished.then(()=>{
    if(playing.get(el)!==animation)return;
    el.dataset.caseState='visible';playing.delete(el);animation.cancel();
   }).catch(()=>{});
  };
  const rearm=()=>{
   frame=null;if(pref.matches)return;
   const bounds=root.getBoundingClientRect();
   shown.forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.bottom<bounds.top-96||r.top>bounds.bottom+96){stop(el);el.dataset.caseState='pending';shown.delete(el);}
   });
  };
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(rearm);};
  const setup=()=>{
   observer?.disconnect();playing.forEach(animation=>animation.cancel());playing.clear();shown.clear();
   root.dataset.caseMotion=pref.matches?'off':'on';
   items.forEach((type,el)=>{el.dataset.caseReveal=type;el.dataset.caseState=pref.matches?'visible':'pending';});
   if(pref.matches)return;
   observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)reveal(entry.target);}),{root,rootMargin:'0px 0px -5% 0px',threshold:0});
   items.forEach((_,el)=>observer.observe(el));
  };
  const focus=e=>{
   if(!e.target.matches(':focus-visible'))return;
   const el=e.target.closest('[data-case-reveal]');if(!el)return;
   stop(el);el.dataset.caseState='visible';shown.add(el);
  };
  setup();pref.addEventListener('change',setup);root.addEventListener('scroll',scroll,{passive:true});root.addEventListener('focusin',focus);
  return()=>{
   disposed=true;observer?.disconnect();cancelAnimationFrame(frame);playing.forEach(animation=>animation.cancel());
   pref.removeEventListener('change',setup);root.removeEventListener('scroll',scroll);root.removeEventListener('focusin',focus);
   delete root.dataset.caseMotion;items.forEach((_,el)=>{delete el.dataset.caseReveal;delete el.dataset.caseState;});
  };
 },[ref]);
}
