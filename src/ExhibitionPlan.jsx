import React from 'react';
import {rooms,connections} from './data';

const xs=rooms.map(r=>r.x),zs=rooms.map(r=>r.z);
const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
const point=r=>({x:65+(r.x-minX)/(maxX-minX||1)*570,y:65+(maxZ-r.z)/(maxZ-minZ||1)*130});

export default function ExhibitionPlan({selected,onSelect,className=''}){
 return <svg className={className} viewBox="0 0 700 260" role={onSelect?'group':'img'} aria-label={`${rooms.length}개 전시실과 연결 복도`}>
  {connections.map(([a,b])=>{const A=point(rooms[a]),B=point(rooms[b]);return <path key={`${a}-${b}`} d={`M${A.x} ${A.y}L${B.x} ${B.y}`} fill="none" stroke="#787a72" strokeOpacity=".5" strokeWidth="16"/>;})}
  {rooms.map(r=>{const p=point(r),chosen=selected===r.id;return <g key={r.id} role={onSelect?'button':undefined} tabIndex={onSelect?0:undefined} aria-label={onSelect?`${r.number} ${r.title} 미리 보기`:undefined} aria-pressed={onSelect?chosen:undefined} onClick={onSelect?()=>onSelect(r.id):undefined} onKeyDown={onSelect?e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(r.id);}}:undefined}>
   <rect x={p.x-46} y={p.y-37} width="92" height="74" fill={chosen?'#eeeae2':'#252927'} stroke="#bcb9b1"/>
   <text x={p.x} y={p.y+7} textAnchor="middle" fill={chosen?'#181a19':'#eeeae2'}>{r.number}</text>
  </g>;})}
 </svg>;
}
