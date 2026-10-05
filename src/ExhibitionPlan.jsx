import React from 'react';
import {rooms} from './data';
import {atrium,passages,ATRIUM_ID} from './building-layout';

const scale=6,point=([x,z])=>[350+x*scale,300+z*scale];
export default function ExhibitionPlan({selected,onSelect,onAtrium,className=''}){
 const zone=(room,handler)=>{
  const [x,y]=point([room.x,room.z]),chosen=selected===room.id,isHall=room.id===ATRIUM_ID;
  return <g key={room.id} role={handler?'button':undefined} tabIndex={handler?0:undefined} aria-label={handler?isHall?'중앙 채광 홀 이동':`${room.number} ${room.title} 선택`:undefined} aria-pressed={handler?chosen:undefined} onClick={handler?()=>handler(room.id):undefined} onKeyDown={handler?e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handler(room.id);}}:undefined}>
   <rect x={x-room.w*scale/2} y={y-room.d*scale/2} width={room.w*scale} height={room.d*scale} fill={chosen?'#eeeae2':isHall?'#393d37':'#252927'} stroke="#bcb9b1" strokeWidth="1.4"/>
   <text x={x} y={y+(isHall?-4:7)} textAnchor="middle" fill={chosen?'#181a19':'#eeeae2'} style={{fontSize:isHall?14:22}}>{room.number}</text>
   {isHall&&<text x={x} y={y+20} textAnchor="middle" fill={chosen?'#181a19':'#eeeae2'} style={{fontSize:14}}>채광 홀</text>}
  </g>;
 };
 return <svg className={`exhibition-plan ${className}`} viewBox="0 0 700 620" role={onSelect||onAtrium?'group':'img'} aria-label="중앙 채광 홀과 두 순환 동선으로 연결된 10개 전시실">
  {passages.map(({a,b,points})=><path key={`${a}-${b}`} d={points.map((p,i)=>`${i?'L':'M'}${point(p).join(' ')}`).join(' ')} fill="none" stroke="#787a72" strokeWidth={4*scale} strokeLinejoin="miter"/>)}
  {rooms.map(r=>zone(r,onSelect))}{zone(atrium,onAtrium)}
 </svg>;
}
