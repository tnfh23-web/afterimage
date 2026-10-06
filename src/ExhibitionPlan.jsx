import React,{useState} from 'react';
import {rooms} from './data';
import {atrium,passages,ATRIUM_ID} from './building-layout';
import {CINEMA_ID} from './cinema-layout';

const scale=6,point=([x,z])=>[350+x*scale,300+z*scale];
export default function ExhibitionPlan({selected,onSelect,onAtrium,onCinema,className=''}){
 const [floor,setFloor]=useState(selected===CINEMA_ID?2:1);
 const zone=(room,handler)=>{
  const [x,y]=point([room.x,room.z]),chosen=selected===room.id,isHall=room.id===ATRIUM_ID;
  return <g key={room.id} role={handler?'button':undefined} tabIndex={handler?0:undefined} aria-label={handler?isHall?'중앙 채광 홀 이동':`${room.number} ${room.title} 선택`:undefined} aria-pressed={handler?chosen:undefined} onClick={handler?()=>handler(room.id):undefined} onKeyDown={handler?e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handler(room.id);}}:undefined}>
   <rect x={x-room.w*scale/2} y={y-room.d*scale/2} width={room.w*scale} height={room.d*scale} fill={chosen?'#eeeae2':isHall?'#393d37':'#252927'} stroke="#bcb9b1" strokeWidth="1.4"/>
   <text x={x} y={y+(isHall?-4:7)} textAnchor="middle" fill={chosen?'#181a19':'#eeeae2'} style={{fontSize:isHall?14:22}}>{room.number}</text>
   {isHall&&<text x={x} y={y+20} textAnchor="middle" fill={chosen?'#181a19':'#eeeae2'} style={{fontSize:14}}>채광 홀</text>}
  </g>;
 };
 return <div className="plan-levels"><div className="plan-floor-switch" role="group" aria-label="전시 지도 층 선택"><button aria-pressed={floor===1} onClick={()=>setFloor(1)}>1F 전시실</button><button aria-pressed={floor===2} onClick={()=>setFloor(2)}>2F 상영관</button></div>
  <svg className={`exhibition-plan ${className}`} viewBox="0 0 700 620" role={onSelect||onAtrium||onCinema?'group':'img'} aria-label={floor===1?'중앙 채광 홀과 두 순환 동선으로 연결된 10개 전시실':'2층 전체를 사용하는 상영관과 계단 입구'}>
   {floor===1?<>{passages.map(({a,b,points})=><path key={`${a}-${b}`} d={points.map((p,i)=>`${i?'L':'M'}${point(p).join(' ')}`).join(' ')} fill="none" stroke="#787a72" strokeWidth={4*scale} strokeLinejoin="miter"/>)}{rooms.map(r=>zone(r,onSelect))}{zone(atrium,onAtrium)}<g role={onCinema?'button':undefined} tabIndex={onCinema?0:undefined} aria-label={onCinema?'계단으로 연결된 상영관 이동':undefined} onClick={onCinema} onKeyDown={e=>{if(onCinema&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onCinema();}}}><rect x="371" y="240" width="10" height="45" fill="#a28c6f"/><rect x="383" y="240" width="10" height="45" fill="#a28c6f"/><path d="M371 239H393" stroke="#ddb985" strokeWidth="7"/>{[0,1,2,3,4,5,6].map(i=><path key={i} d={`M371 ${244+i*6}h10m2 0h10`} stroke="#eeeae2" strokeWidth="1"/>)}<path d="M393 258h12" stroke="#ddb985"/><text x="410" y="262" fill="#ddb985" style={{fontSize:13}}>계단 · 2F</text></g></>:<>
    <g role={onCinema?'button':undefined} tabIndex={onCinema?0:undefined} aria-label={onCinema?'상영관 선택':undefined} onClick={onCinema} onKeyDown={e=>{if(onCinema&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onCinema();}}}>
     <rect x="130" y="70" width="440" height="480" fill="#252927" stroke="#bcb9b1" strokeWidth="2"/>
     <rect x="165" y="105" width="370" height="16" fill="#ddb985"/><text x="350" y="153" textAnchor="middle" fill="#eeeae2" fontSize="16">SCREEN · 여운의 문</text>
     {[0,1,2,3].map(row=>[0,1,2,3,4,5,6,7].map(col=><rect key={`${row}-${col}`} x={169+col*44+(col>3?14:0)} y={210+row*65} width="32" height="38" rx="3" fill="#4c5048" stroke="#8c8d82"/>))}
     <text x="350" y="513" textAnchor="middle" fill="#eeeae2" fontSize="22">2F 상영관</text>
    </g><path d="M130 322H80V530" stroke="#bcb9b1" fill="none" strokeWidth="18"/><text x="63" y="565" fill="#bcb9b1" fontSize="16">1F 계단</text>
   </>}
  </svg>
 </div>;
}
