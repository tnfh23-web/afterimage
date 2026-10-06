import React,{useEffect,useRef} from 'react';
import {createExhibition} from './scene';
export default function Gallery({api,onReady,onProgress,onError,onRoom,onPick,onHint,onStep,onSeat,onWater}){
 const host=useRef(null),callbacks=useRef({onReady,onProgress,onError,onRoom,onPick,onHint,onStep,onSeat,onWater});callbacks.current={onReady,onProgress,onError,onRoom,onPick,onHint,onStep,onSeat,onWater};
 useEffect(()=>{let engine;const controller=new AbortController();createExhibition(host.current,{ready:()=>callbacks.current.onReady(),progress:(...args)=>callbacks.current.onProgress?.(...args),error:()=>callbacks.current.onError(),room:r=>callbacks.current.onRoom(r),pick:(...a)=>callbacks.current.onPick(...a),hint:h=>callbacks.current.onHint(h),step:()=>callbacks.current.onStep?.(),water:(...args)=>callbacks.current.onWater?.(...args),seat:s=>callbacks.current.onSeat?.(s)},{signal:controller.signal}).then(result=>{if(controller.signal.aborted){result?.dispose();return;}engine=result;api.current=result;}).catch(e=>{if(!controller.signal.aborted){console.error('Gallery initialization failed',e);callbacks.current.onError();}});return()=>{controller.abort();engine?.dispose();api.current=null;};},[]);
 return <div className="gallery" ref={host} aria-label="걸어서 관람하는 3D 전시 공간"/>;
}

