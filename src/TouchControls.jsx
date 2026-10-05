import React,{useEffect,useRef} from 'react';

export default function TouchControls({api}){
 const stick=useRef(null),handle=useRef(null),pointer=useRef(null),jumpPointer=useRef(null),jumpButton=useRef(null);
 const move=e=>{
  const bounds=stick.current.getBoundingClientRect(),radius=bounds.width*.3;
  const dx=e.clientX-bounds.left-bounds.width/2,dy=e.clientY-bounds.top-bounds.height/2;
  const length=Math.hypot(dx,dy),clamp=length>radius?radius/length:1;
  handle.current.style.transform=`translate(${dx*clamp}px,${dy*clamp}px)`;
  const amount=Math.max(0,Math.min(1,(length/radius-.12)/.88));
  api.current?.setTouchVector(length?dx/length*amount:0,length?-dy/length*amount:0);
 };
 const reset=()=>{pointer.current=null;api.current?.stopTouch();if(handle.current)handle.current.style.transform='translate(0,0)';if(stick.current)stick.current.dataset.active='false';};
 useEffect(()=>{
  const blur=()=>{reset();jumpPointer.current=null;if(jumpButton.current)jumpButton.current.dataset.active='false';};
  const visibility=()=>{if(document.hidden)blur();};
  window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);api.current?.stopTouch();};
 },[]);
 const prevent=e=>e.preventDefault();
 return <div className="touch-controls" onContextMenu={prevent}>
  <div className="touch-movement"><div ref={stick} className="joystick" role="group" aria-label="이동 조이스틱" data-active="false"
   onPointerDown={e=>{if(pointer.current!==null||e.button!==0)return;e.preventDefault();pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.dataset.active='true';move(e);}}
   onPointerMove={e=>{if(e.pointerId===pointer.current){e.preventDefault();move(e);}}}
   onPointerUp={e=>{if(e.pointerId===pointer.current){e.preventDefault();reset();}}}
   onPointerCancel={e=>{if(e.pointerId===pointer.current)reset();}}
   onLostPointerCapture={e=>{if(e.pointerId===pointer.current)reset();}}>
   <div className="joystick-track" aria-hidden="true"/><div ref={handle} className="joystick-handle" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16m-11-5 3-3 3 3m-6 10 3 3 3-3M7 9l-3 3 3 3m10-6 3 3-3 3"/></svg></div>
  </div><span>이동</span></div>
  <div className="touch-actions"><span className="touch-look-hint">화면을 드래그해 둘러보기</span><button ref={jumpButton} className="touch-jump" aria-label="점프"
   onPointerDown={e=>{if(jumpPointer.current!==null||e.button!==0)return;e.preventDefault();jumpPointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.dataset.active='true';api.current?.jump();}}
   onPointerUp={e=>{if(e.pointerId===jumpPointer.current){e.preventDefault();jumpPointer.current=null;e.currentTarget.dataset.active='false';}}}
   onPointerCancel={e=>{if(e.pointerId===jumpPointer.current){jumpPointer.current=null;e.currentTarget.dataset.active='false';}}}
   onLostPointerCapture={e=>{if(e.pointerId===jumpPointer.current){jumpPointer.current=null;e.currentTarget.dataset.active='false';}}}
   onClick={e=>{if(e.detail===0)api.current?.jump();}}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5-5 5 5M12 4v12M5 20h14"/></svg><span>점프</span></button></div>
 </div>;
}
