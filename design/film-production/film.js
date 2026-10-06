export const DURATION=48;
export function drawFilm(canvas,time){
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,t=time%48,phase=t/48*Math.PI*2;
 c.fillStyle='#0b0d10';c.fillRect(0,0,W,H);
 const horizon=H*.49,camX=Math.sin(phase)*1.1,camZ=1.4-Math.cos(phase)*1.4,f=W*.76;
 const project=(x,y,z)=>{const d=z-camZ;return [W*.5+(x-camX)*f/d,horizon+(1.5-y)*f/d,d];};
 const mist=c.createRadialGradient(W*.58,H*.34,0,W*.5,H*.45,W*.64);mist.addColorStop(0,'#403d383d');mist.addColorStop(.6,'#29282d12');mist.addColorStop(1,'#080a0d00');c.fillStyle=mist;c.fillRect(0,0,W,H);
 const floor=c.createLinearGradient(0,horizon,0,H);floor.addColorStop(0,'#27242500');floor.addColorStop(.11,'#272425');floor.addColorStop(1,'#090c10');c.fillStyle=floor;c.fillRect(0,horizon-30,W,H-horizon+30);
 // Slow, fine contours across the dark reflective ground.
 c.save();c.globalCompositeOperation='screen';
 for(let i=0;i<85;i++){
  const depth=3.8+i*.3;c.beginPath();
  for(let j=0;j<=85;j++){
   const x=-12+j*.3,z=depth+.14*Math.sin(x*.8+phase+i*.16),p=project(x,0,z);
   const wave=Math.sin(x*.85+phase*2+i*.17);const y=p[1]+wave*(1+i*.045);
   j?c.lineTo(p[0],y):c.moveTo(p[0],y);
  }
  c.strokeStyle=`rgba(202,155,96,${.03+.055*Math.pow(Math.sin(i*.21+phase),6)})`;c.lineWidth=.65;c.stroke();
 }
 const portals=[[-4,16,1.6,3.8,.17],[-1.7,12,1.5,3.2,-.14],[1.8,10.7,1.65,4.05,.12],[4.8,19,1.65,3.1,-.18],[.4,24,1.7,3.7,-.12]];
 for(const [x,z,w,h,angle] of portals){
  const points=[[-w/2,0],[ -w/2,h],[w/2,h],[w/2,0]].map(([dx,y])=>project(x+dx*Math.cos(angle),y,z+dx*Math.sin(angle)));
  const trace=(mirror=false)=>{c.beginPath();points.forEach((p,i)=>{const py=mirror?2*project(0,0,z)[1]-p[1]:p[1];i?c.lineTo(p[0],py):c.moveTo(p[0],py);});};
  c.save();const brightness=.86+.12*Math.sin(phase+z*.25);
  for(const [width,alpha,blur] of [[9,.12,25],[3,.38,9],[1.2,.96,3]]){
   trace();c.lineWidth=width;c.strokeStyle=`rgba(255,210,145,${alpha*brightness})`;c.shadowColor='#ffc47b';c.shadowBlur=blur;c.stroke();
  }
  c.save();c.beginPath();c.rect(0,project(0,0,z)[1],W,H);c.clip();trace(true);c.lineWidth=3;c.strokeStyle='#ffd19a35';c.shadowBlur=12;c.stroke();c.restore();
  const [gx,gy]=project(x,0,z),glow=c.createRadialGradient(gx,gy,0,gx,gy,W*.13);glow.addColorStop(0,'#fbd6a828');glow.addColorStop(1,'#e4ad6000');c.fillStyle=glow;c.fillRect(gx-W*.13,gy-W*.13,W*.26,W*.26);
  c.restore();
 }
 for(let i=0;i<500;i++){
  const seed=Math.sin(i*178.39)*43758.5453,rand=seed-Math.floor(seed),x=(i*127.3%W)+Math.sin(phase+i)*7,y=(i*91.7%H)+Math.cos(phase+i*.6)*5;
  c.fillStyle=`rgba(242,214,167,${(.06+rand*.48)*(.65+.35*Math.sin(phase+i))})`;c.beginPath();c.arc(x,y,.35+rand*.55,0,Math.PI*2);c.fill();
 }
 c.restore();
 const vignette=c.createRadialGradient(W*.5,H*.46,W*.12,W*.5,H*.5,W*.64);vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#000b');c.fillStyle=vignette;c.fillRect(0,0,W,H);
}
