import React,{useEffect,useRef} from 'react';
export default function CinemaPlayer({api,onExit,seated}){
 const time=useRef(null),progress=useRef(null),play=useRef(null),status=useRef(null);
 useEffect(()=>{
  const stamp=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
  const update=()=>{const state=api.current?.film?.state();if(!state)return;if(time.current)time.current.textContent=`${stamp(state.time)} / ${stamp(Math.round(state.duration))}`;if(progress.current&&document.activeElement!==progress.current){progress.current.max=state.duration;progress.current.value=state.time;}if(play.current){play.current.textContent=state.playing?'일시정지':'재생';play.current.setAttribute('aria-label',state.playing?'영상 일시정지':'영상 재생');}if(status.current)status.current.textContent=state.error||(!state.loaded?'영상을 준비하고 있어요.':'');};
  update();const timer=setInterval(update,250);return()=>clearInterval(timer);
 },[api]);
 return <section className="cinema-player" aria-label="상영관 영상 조작"><div className="film-title"><b>여운의 문</b><span>{seated?'좌석에 앉아 감상 중':'오리지널 영상 · 48초 · 반복 상영'}</span></div><div className="film-controls"><output ref={time}>00:00 / 00:48</output><input ref={progress} type="range" min="0" max="48" step=".1" defaultValue="0" aria-label="영상 재생 위치" onChange={e=>api.current?.film?.seek(Number(e.target.value))}/><button ref={play} aria-label="영상 재생" onClick={()=>api.current?.film?.toggle()}>재생</button><button onClick={()=>api.current?.film?.restart()}>처음부터</button><button onClick={()=>seated?api.current?.toggleSeat():api.current?.watchFilm()}>{seated?'일어나기':'좌석에서 보기'}</button><button onClick={onExit}>1층으로</button></div><p ref={status} role="status"/></section>;
}
