// One physical plan drives geometry, collision, wayfinding and the SVG map.
export const ATRIUM_ID=10;
export const atrium={id:ATRIUM_ID,number:'LOBBY',title:'채광 홀',x:0,z:0,w:16,d:34,h:8};
export const galleryLayout=[
 {x:-20,z:14,w:16,d:16,h:5.4},
 {x:-42,z:14,w:18,d:16,h:4.8},
 {x:-42,z:-8,w:18,d:20,h:6.6},
 {x:-42,z:-32,w:18,d:16,h:5.7},
 {x:-20,z:-14,w:16,d:20,h:5},
 {x:20,z:-14,w:16,d:18,h:5.2},
 {x:42,z:-14,w:18,d:16,h:6.2},
 {x:42,z:8,w:18,d:20,h:5.6},
 {x:42,z:32,w:18,d:16,h:4.8},
 {x:20,z:14,w:16,d:18,h:6.4},
];
// Coordinates are wall anchors, including the bends in the return passages.
export const passages=[
 {a:10,b:0,points:[[-8,14],[-12,14]]},
 {a:0,b:1,points:[[-28,14],[-33,14]]},
 {a:1,b:2,points:[[-42,6],[-42,2]]},
 {a:2,b:3,points:[[-42,-18],[-42,-24]]},
 {a:3,b:4,points:[[-33,-32],[-20,-32],[-20,-24]]},
 {a:4,b:10,points:[[-12,-14],[-8,-14]]},
 {a:10,b:5,points:[[8,-14],[12,-14]]},
 {a:5,b:6,points:[[28,-14],[33,-14]]},
 {a:6,b:7,points:[[42,-6],[42,-2]]},
 {a:7,b:8,points:[[42,18],[42,24]]},
 {a:8,b:9,points:[[33,32],[20,32],[20,23]]},
 {a:9,b:10,points:[[12,14],[8,14]]},
];
export const connections=passages.map(({a,b})=>[a,b]);
export function doorOpenings(zones){
 const openings=zones.map(()=>({north:[],south:[],east:[],west:[]}));
 const add=(id,[x,z])=>{
  const r=zones[id],dx=x-r.x,dz=z-r.z;
  const side=Math.abs(Math.abs(dx)-r.w/2)<.01?(dx<0?'west':'east'):(dz<0?'north':'south');
  openings[id][side].push(side==='east'||side==='west'?dz:dx);
 };
 passages.forEach(p=>{add(p.a,p.points[0]);add(p.b,p.points.at(-1));});
 return openings;
}
