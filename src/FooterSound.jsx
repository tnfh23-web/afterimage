import React from 'react';
export default function FooterSound({sound}){
 return <div className="footer-sound">
  <button className={`sound-toggle ${sound.enabled?'playing':''}`} aria-label={sound.enabled?'소리 끄기':'소리 켜기'} aria-pressed={sound.enabled} onClick={sound.toggle}>
   <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4M8 6v12M12 3v18M16 6v12M20 10v4"/></svg><span>{sound.enabled?'소리 켜짐':'소리 꺼짐'}</span>
  </button>
  <button className="volume-toggle" popoverTarget="exhibition-volume" aria-label="음량 조절">음량</button>
  <div id="exhibition-volume" className="footer-volume" popover="auto" aria-label="전시 음량 조절">
   <div className="volume-heading"><label htmlFor="exhibition-volume-range">전체 음량</label><output htmlFor="exhibition-volume-range">{Math.round(sound.volume*100)}%</output><button popoverTarget="exhibition-volume" popoverTargetAction="hide" aria-label="음량 조절 닫기">닫기</button></div>
   <input id="exhibition-volume-range" aria-label="전체 음량" type="range" min="0" max="1" step=".01" value={sound.volume} onChange={e=>sound.changeVolume(Number(e.target.value))}/>
   <p>배경음 · 영상 · 발소리 · 물소리{!sound.enabled?' · 소리 꺼짐':''}</p>
  </div>
 </div>;
}
