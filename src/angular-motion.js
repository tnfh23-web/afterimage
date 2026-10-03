// Angles stay unwrapped: a complete turn never causes a jump across ±π.
// Exponential decay makes the same gesture feel alike at different frame rates.
export function angularMotion(x, y, minY, maxY) {
 const state = {x, y, targetX:x, targetY:y, vx:0, vy:0, held:false, lastInput:0};
 const clamp = value => Math.max(minY, Math.min(maxY, value));
 function sync(nextX=state.x, nextY=state.y) {
  Object.assign(state, {x:nextX, y:nextY, targetX:nextX, targetY:nextY, vx:0, vy:0, held:false, lastInput:0});
 }
 return {
  state, sync,
  begin(now) {sync(); state.held=true; state.lastInput=now;},
  move(dx,dy,now,smooth) {
   const seconds=Math.max((now-state.lastInput)/1000, 1/120);
   state.lastInput=now;
   state.targetX+=dx; state.targetY=clamp(state.targetY+dy);
   state.vx=state.vx*.35+Math.max(-3.2,Math.min(3.2,dx/seconds))*.65;
   state.vy=state.vy*.35+Math.max(-1.4,Math.min(1.4,dy/seconds))*.65;
   if(!smooth){state.x=state.targetX;state.y=state.targetY;state.vx=state.vy=0;}
  },
  release(now,smooth) {
   state.held=false;
   // Holding still before release is a deliberate stop, not a fling.
   const age=now-state.lastInput;
   if(!smooth||age>220) state.vx=state.vy=0;
   else {const freshness=Math.exp(-Math.max(0,age-50)/120);state.vx*=freshness;state.vy*=freshness;}
  },
  reset(smooth) {
   state.x=Math.atan2(Math.sin(state.x),Math.cos(state.x));
   state.targetX=0; state.targetY=.05; state.vx=state.vy=0; state.held=false;
   if(!smooth){state.x=0;state.y=.05;}
  },
  tick(dt,smooth,automatic=0) {
   if(!state.held&&smooth){
    const decay=Math.exp(-dt*9),integral=(1-decay)/9;
    state.targetX+=state.vx*integral;
    state.targetY=clamp(state.targetY+state.vy*integral);
    state.vx*=decay;state.vy*=decay;
    if(state.targetY===minY||state.targetY===maxY)state.vy=0;
    if(Math.abs(state.vx)<.001)state.vx=0;
    if(Math.abs(state.vy)<.001)state.vy=0;
   }
   state.targetX+=automatic*dt;
   const follow=smooth?1-Math.exp(-dt*(state.held?22:14)):1;
   state.x+=(state.targetX-state.x)*follow;
   state.y+=(state.targetY-state.y)*follow;
   if(Math.abs(state.targetX-state.x)<.00001)state.x=state.targetX;
   if(Math.abs(state.targetY-state.y)<.00001)state.y=state.targetY;
  }
 };
}
