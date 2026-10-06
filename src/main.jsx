import {assetUrl} from './asset-url';
import React,{Suspense,lazy,useState,useRef,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {rooms,artInfo,paintingUrl} from './data';
import {ATRIUM_ID} from './building-layout';
import {CINEMA_ID} from './cinema-layout';
import CinemaPlayer from './CinemaPlayer';
import FooterSound from './FooterSound';
import './cinema.css';
import TouchControls from './TouchControls';
import ExhibitionPlan from './ExhibitionPlan';
import Introduction from './Introduction';
import ExhibitionLoader from './ExhibitionLoader';
import {useSound} from './use-sound';
import './style.css';
import './touch-controls.css';
import './gallery-chrome.css';
const Gallery=lazy(()=>import('./Gallery'));

function Dialog({title,onClose,children,className=''}){
 const ref=useRef(null);
 useEffect(()=>{const before=document.activeElement;const el=ref.current;el.querySelector('button')?.focus();const handle=e=>{if(e.key==='Escape'){e.preventDefault();onClose();}if(e.key==='Tab'){const focus=[...el.querySelectorAll('button,a,input,[tabindex="0"]')].filter(x=>!x.disabled);const first=focus[0],last=focus.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};el.addEventListener('keydown',handle);return()=>{el.removeEventListener('keydown',handle);before?.focus();};},[]);
 return <div className={`modal-layer ${className}`} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={ref} role="dialog" aria-modal="true" aria-label={title} className="dialog"><div className="dialog-heading"><h2>{title}</h2><button className="close" onClick={onClose} aria-label="닫기"><svg viewBox="0 0 24 24"><path d="m5 5 14 14M19 5 5 19"/></svg></button></div>{children}</section></div>
}

function Map({current,onGo,onArt,onClose}){
 return <Dialog title="전시 지도" onClose={onClose} className="map-modal"><p className="dialog-intro">1층의 두 전시 동과 2층 상영관. 원하는 곳부터 둘러보세요.</p><div className="floorplan"><ExhibitionPlan selected={current} onSelect={onGo} onAtrium={()=>onGo(ATRIUM_ID)} onCinema={()=>onGo(CINEMA_ID)}/></div><div className="room-list">{rooms.map(r=><div key={r.id} className={`room-row ${current===r.id?'current':''}`}><button className="room-go" onClick={()=>onGo(r.id)} aria-label={`${r.number} ${r.title} 이동`}><span>{r.number}</span><span>{r.title}<small>{r.en}</small></span><span className="room-status">{current===r.id?'현재 위치':'입장'}</span></button><button className="catalog" onClick={()=>onArt(r.id,'sculpture')}>조각 감상</button><button className="catalog" onClick={()=>onArt(r.id,'painting')}>회화 감상</button></div>)}</div><button className="cinema-map-link" onClick={()=>onGo(CINEMA_ID)} aria-label="2F 상영관 이동"><b>2F</b><span>상영관<small>여운의 문 · 48초 오리지널 영상</small></span><span>입장</span></button></Dialog>
}
function Guide({onClose,motion,onMotion,sound}){return <Dialog title="관람 안내" onClose={onClose}><p className="dialog-intro">서두르지 않고, 원하는 방향으로.</p><dl className="guide"><div><dt>걷기</dt><dd><kbd>W A S D</kbd> 또는 방향키<br/>빠르게 걷기 <kbd>Shift</kbd><br/>점프 <kbd>Space</kbd> / 모바일 점프 버튼</dd></div><div><dt>둘러보기</dt><dd>화면을 드래그해서 시선을 돌려요.<br/>모바일은 왼쪽 조이스틱, 오른쪽 화면 드래그.<br/>조금 밀면 걷기, 끝까지 밀면 달리기.</dd></div><div><dt>작품 감상</dt><dd>조각이나 회화를 클릭해요.<br/>가까운 작품은 <kbd>E</kbd>로도 선택할 수 있어요.</dd></div><div><dt>앉기</dt><dd>벤치나 의자 가까이에서 앉기 버튼 또는 <kbd>E</kbd>를 눌러요.<br/>이동·점프 입력이나 일어나기 버튼으로 다시 서요.<br/>상영관의 좌석에서 보기로도 앉을 수 있어요.</dd></div><div><dt>다른 방</dt><dd>문을 지나 복도로 이동하거나<br/>전시 지도에서 방을 선택해요.</dd></div><div><dt>상영관</dt><dd>채광 홀의 계단을 올라 2층으로 이동해요.<br/>전시 지도에서도 바로 입장할 수 있어요.<br/>영상의 재생·일시정지·탐색과 처음부터 보기가 가능해요.</dd></div><div><dt>움직임</dt><dd><button className="catalog" onClick={onMotion}>{motion?'작품 움직임 멈추기':'작품 움직임 재생'}</button></dd></div><div><dt>소리</dt><dd><button className="catalog" aria-pressed={sound.enabled} onClick={sound.toggle}>{sound.enabled?'소리 끄기':'소리 켜기'}</button><label className="volume-control" htmlFor="sound-volume">전체 음량 <output>{Math.round(sound.volume*100)}%</output><input id="sound-volume" type="range" min="0" max="1" step=".01" value={sound.volume} onChange={e=>sound.changeVolume(Number(e.target.value))}/></label><span className="sound-description">따뜻한 피아노 선율과 또렷한 발소리.<br/>로비 분수 가까이에서는 물소리가 들려요.<br/>다른 탭에서는 소리가 잠시 쉬어갑니다.</span>{sound.error&&<p className="sound-error" role="status">{sound.error}</p>}</dd></div></dl><p className="guide-note">모든 작품과 작가는 이 전시를 위해 만든 가상의 창작물입니다. 배경음은 이 전시를 위해 만든 피아노 계열의 선율입니다.</p></Dialog>}
function Zoom({art,onClose}){const ref=useRef(null);useEffect(()=>{const before=document.activeElement;ref.current?.focus();const key=e=>{if(e.key==='Escape'){e.stopPropagation();onClose();}if(e.key==='Tab'){e.preventDefault();ref.current?.focus();}};document.addEventListener('keydown',key,true);return()=>{document.removeEventListener('keydown',key,true);before?.focus();};},[]);return <div className="zoom" role="dialog" aria-modal="true" aria-label="회화 확대"><button ref={ref} onClick={onClose}>확대 닫기</button><img src={paintingUrl(art.id)} alt={art.name}/></div>}
function App(){
 const [entered,setEntered]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[room,setRoom]=useState(ATRIUM_ID),[modal,setModal]=useState(()=>location.hash==='#about'?'about':null),[art,setArt]=useState(null),[rotating,setRotating]=useState(false),[hint,setHint]=useState(''),[motion,setMotion]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [progress,setProgress]=useState({value:5,label:'전시 공간을 여는 중'}),[loadingShown,setLoadingShown]=useState(true),[visualReady,setVisualReady]=useState(false);
 const onProgress=(value,label)=>setProgress(previous=>({value:Math.max(previous.value,value),label}));
 const sound=useSound(room===ATRIUM_ID?0:room);
 const api=useRef(null);
 const [seat,setSeat]=useState({seated:false,available:false,name:''});
 const clearAboutRoute=()=>{if(location.hash==='#about')history.replaceState(null,'',location.pathname+location.search);};
 const close=()=>{clearAboutRoute();setModal(null);setArt(null);setRotating(false);api.current?.inspect(null);};
 const openMenu=type=>{setArt(null);setRotating(false);api.current?.inspect(null);if(type==='about'){if(location.hash!=='#about')history.pushState(null,'','#about');}else clearAboutRoute();setModal(type);};
 const pick=(id,kind)=>{clearAboutRoute();sound.cue();setEntered(true);setModal(null);setArt(artInfo(id,kind));setRotating(false);api.current?.inspect({id,kind});};
 const go=id=>{sound.cue();setEntered(true);close();api.current?.go(id);};
 const enter=()=>{close();sound.cue();setEntered(true);api.current?.enter();};
 useEffect(()=>{const change=()=>{api.current?.inspect(null);setArt(null);setRotating(false);setModal(location.hash==='#about'?'about':null);};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
 useEffect(()=>{api.current?.setEnabled(entered&&!loadingShown&&!modal&&!art);api.current?.setPresentationVisible(!loadingShown&&!['about','map','guide','zoom'].includes(modal));},[entered,modal,art,ready,loadingShown]);
 useEffect(()=>{api.current?.setMotion(motion);},[motion,ready]);
 useEffect(()=>{if(ready)sound.attachFilm(api.current?.film);},[ready]);
 useEffect(()=>{api.current?.film?.sound(sound.enabled,sound.volume);},[sound.enabled,sound.volume,ready,room]);
 useEffect(()=>{const pref=matchMedia('(prefers-reduced-motion: reduce)'),handle=()=>setMotion(!pref.matches);pref.addEventListener('change',handle);return()=>pref.removeEventListener('change',handle);},[]);
 return <main className={`app ${entered?'entered':''} ${modal==='about'?'showing-about':''}`} data-room={room===ATRIUM_ID?0:room===CINEMA_ID?'cinema':room+1} data-zone={room===ATRIUM_ID?'atrium':room===CINEMA_ID?'cinema':'gallery'} data-ready={ready} data-sound={sound.state}>
  <Suspense fallback={null}>{visualReady&&<Gallery api={api} onReady={()=>setReady(true)} onProgress={onProgress} onError={()=>setFailed(true)} onRoom={setRoom} onPick={pick} onHint={setHint} onStep={sound.step} onWater={sound.water} onSeat={setSeat}/>}</Suspense>
  {loadingShown&&<ExhibitionLoader progress={progress} ready={ready} failed={failed} onVisualReady={()=>setVisualReady(true)} onReveal={()=>{if(!failed&&modal!=='about')setEntered(true);}} onComplete={()=>{setLoadingShown(false);if(!failed&&modal!=='about'){setEntered(true);api.current?.enter();}}}/>}
  <header inert={loadingShown}><a className="brand" href="#" aria-label="AFTERIMAGE 잔상 처음으로" onClick={e=>{e.preventDefault();close();setEntered(false);api.current?.go(ATRIUM_ID);}}><img src={assetUrl('/mark.svg')} alt=""/><span>AFTERIMAGE</span></a><nav aria-label="전시 메뉴"><button onClick={()=>openMenu('about')}>전시 소개</button><button onClick={()=>openMenu('map')}>전시 지도</button><button onClick={()=>openMenu('guide')}>관람 안내</button></nav></header>
  {!entered&&<section className="intro" inert={loadingShown}><h1>잔상</h1><p>눈을 감은 뒤에도 남는<br className="mobile-break"/> 열 개의 장면.</p><button className="entry" disabled={!ready||failed} onClick={enter}>{failed?'3D 실행 불가':ready?'전시 입장':'공간 준비 중'}</button><button className="intro-about text-action" onClick={()=>openMenu('about')}>전시 소개</button></section>}
  {failed&&<div className="fallback"><h2>3D 공간을 열 수 없어요.</h2><p>브라우저의 하드웨어 가속을 켜고 새로고침해 주세요. 전시 지도에서 회화와 작품 설명을 감상할 수 있어요.</p><button className="entry" onClick={()=>setModal('map')}>작품 보기</button></div>}
  {entered&&!modal&&!art&&room!==CINEMA_ID&&<><div className={`art-hint ${hint?'visible':''}`}><span>{hint}</span><button onClick={()=>api.current?.pickNearest()}>감상하기</button></div><div className="reticle" aria-hidden="true"/><TouchControls api={api}/></>}
  {entered&&!modal&&!art&&room===ATRIUM_ID&&<button className="cinema-access" onClick={()=>go(CINEMA_ID)}>2F 상영관</button>}
  {entered&&!modal&&!art&&room===CINEMA_ID&&<><TouchControls api={api}/><CinemaPlayer api={api} seated={seat.seated} onExit={()=>go(ATRIUM_ID)}/></>}
  {entered&&!modal&&!art&&(seat.available||seat.seated)&&(room!==CINEMA_ID||!seat.seated)&&<div className="seat-action" role="group" aria-label="좌석 조작"><span>{seat.seated?`${seat.name}에 앉아 있어요`:seat.name}</span><button onClick={()=>api.current?.toggleSeat()}>{seat.seated?'일어나기':'앉기'}<kbd>E</kbd></button></div>}
  <footer inert={loadingShown}><div className={`room-label ${room===ATRIUM_ID||room===CINEMA_ID?'lobby-label':''}`} aria-live="polite">{room===ATRIUM_ID?<><b>LOBBY</b><strong>채광 홀</strong></>:room===CINEMA_ID?<><b>2F</b><strong>상영관</strong></>:<><b>{rooms[room].number}</b><span>/ {String(rooms.length).padStart(2,'0')}</span><strong>{rooms[room].title}</strong></>}</div><span className="desktop-help">W A S D 이동 · Space 점프 · 드래그 시선</span><FooterSound sound={sound}/><button className="motion" aria-label={`작품 움직임 ${motion?'끄기':'켜기'}`} onClick={()=>setMotion(!motion)} title="작품 움직임">{motion?'움직임 켜짐':'움직임 멈춤'}</button></footer>
  {modal==='map'&&<Map current={room} onGo={go} onArt={pick} onClose={close}/>}{modal==='guide'&&<Guide onClose={close} motion={motion} onMotion={()=>setMotion(!motion)} sound={sound}/>}
  {modal==='about'&&<Introduction onClose={close} onEnter={enter} onGo={go} ready={ready} failed={failed} sound={sound}/>}
  {art&&<Dialog title={art.name} onClose={close} className="art-modal"><p className="art-meta">{art.artist}<span>{art.medium}</span></p>{art.kind==='painting'?<button className="art-image" aria-label="회화 확대" onClick={()=>setModal(modal==='zoom'?null:'zoom')}><img src={paintingUrl(art.id)} alt={art.name}/></button>:<div className="sculpture-note">화면의 작품을 드래그해 다른 각도에서 감상하세요.</div>}<p className="art-note">{art.note}</p>{art.kind==='sculpture'&&<div className="art-actions"><button onClick={()=>{setRotating(!rotating);api.current?.rotate(!rotating);}}>{rotating?'회전 멈추기':'작품 회전'}</button><button onClick={()=>{setRotating(false);api.current?.resetInspect();}}>시선 초기화</button></div>}<p className="art-room">{art.number} / {art.title}</p></Dialog>}
  {modal==='zoom'&&art&&<Zoom art={art} onClose={()=>setModal(null)}/>}
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);



