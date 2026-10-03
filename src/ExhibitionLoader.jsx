import {assetUrl} from './asset-url';
import React,{useEffect,useRef,useState} from 'react';
import './exhibition-loader.css';

const JOURNEY_MS=8000,REVEAL_MS=1800;

export default function ExhibitionLoader({progress,ready,failed,onComplete,onVisualReady,onReveal}){
 const host=useRef(null),callback=useRef({onComplete,onVisualReady,onReveal});callback.current={onComplete,onVisualReady,onReveal};
 const journeyStarted=useRef(0),skipJourney=useRef(null);
 const [visible,setVisible]=useState(false),[leaving,setLeaving]=useState(false);
 const value=ready?100:Math.round(progress.value);
 useEffect(()=>{
  let cancelled=false,first,second;
  const image=host.current.querySelector('.loader-backplate');
  Promise.allSettled([image.decode(),document.fonts.ready]).then(()=>{
   if(cancelled)return;journeyStarted.current=performance.now();setVisible(true);
   first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>{if(!cancelled)callback.current.onVisualReady?.();});});
  });
  return()=>{cancelled=true;cancelAnimationFrame(first);cancelAnimationFrame(second);};
 },[]);
 useEffect(()=>{
  if(!ready&&!failed)return;
  let departureTimer,completeTimer;
  const reveal=duration=>{
   host.current.style.setProperty('--reveal-duration',`${duration}ms`);
   callback.current.onReveal?.();
   setLeaving(true);
   completeTimer=setTimeout(()=>callback.current.onComplete?.(),duration);
  };
  skipJourney.current=()=>{clearTimeout(departureTimer);reveal(650);};
  if(failed||matchMedia('(prefers-reduced-motion: reduce)').matches)reveal(80);
  else{
   // Readiness changes the UI, never the camera speed. Let the same gentle
   // approach continue through the reveal, including on a cached visit.
   const elapsed=performance.now()-journeyStarted.current;
   departureTimer=setTimeout(()=>reveal(REVEAL_MS),Math.max(0,JOURNEY_MS-REVEAL_MS-elapsed));
  }
  return()=>{clearTimeout(departureTimer);clearTimeout(completeTimer);skipJourney.current=null;};
 },[ready,failed]);
 return <section ref={host} className={`exhibition-loader ${visible?'art-ready':''} ${leaving?'is-leaving':''}`} aria-label="전시 로딩" aria-busy={!ready&&!failed} style={{'--journey-duration':`${JOURNEY_MS}ms`}}>
  <div className="loader-camera" aria-hidden="true"><img className="loader-backplate" src={assetUrl('/loading/tunnel.webp')} alt="" fetchPriority="high"/></div>
  <div className="loader-top"><svg className="loader-mark" viewBox="0 0 48 64" role="img" aria-label="AFTERIMAGE"><path d="M4 61V13L31 3V54"/><path d="M14 63V22L46 11V62"/></svg><div><b>잔상</b><span>3D EXHIBITION</span></div></div>
  <h1 className="loader-wordmark">AFTERIMAGE</h1>
  <div className="loader-bottom"><div className="loader-information"><p>여섯 개의 장면을 깨우는 중</p><div className="loader-rail" role="progressbar" aria-label="전시 준비 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>{Array.from({length:6},(_,i)=><span key={i}><i style={{transform:`scaleX(${Math.max(0,Math.min(1,value/100*6-i))})`}}/></span>)}</div><div className="loader-status"><span className="loader-phase" role="status">{failed?'전시 공간을 열 수 없어요':ready?'전시로 들어가는 중':progress.label}</span>{ready&&!leaving&&<button className="loader-skip" onClick={()=>skipJourney.current?.()}>전시 바로 보기</button>}</div></div><div className="loader-number" aria-hidden="true">{String(value).padStart(2,'0')}<small>%</small></div></div>
 </section>;
}
