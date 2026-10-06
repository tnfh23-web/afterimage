import {Box3,Vector3} from 'three';

// Furniture emits the same positions used for drawing; there is no separate
// map of guessed chair locations in the interaction controller.
export function benchSeats(seats,room,x,z,length,angle,target){
 for(const offset of [-length*.28,0,length*.28]){
  const sx=room.x+x+Math.cos(angle)*offset,sz=room.z+z-Math.sin(angle)*offset;
  seats.push({id:`bench-${room.id}-${x}-${offset}`,zone:room.id,name:'벤치',x:sx,z:sz,floor:0,eye:1.28,target:new Vector3(...target),bounds:new Box3(new Vector3(sx-.4,.35,sz-.4),new Vector3(sx+.4,.65,sz+.4))});
 }
}
export function theatreSeats(seats,room,placements){
 placements.forEach((p,index)=>{
  const x=room.x+p.x,z=room.z+p.z,floor=room.y+p.y;
  seats.push({id:`cinema-${index}`,zone:room.id,name:`${Math.floor(index/8)+1}열 좌석`,x,z,floor,eye:1.25,target:new Vector3(room.x,room.y+4.75,room.z-12.56),stand:new Vector3(x,floor+1.75,z-1.05),bounds:new Box3(new Vector3(x-.7,floor+.1,z-.65),new Vector3(x+.7,floor+1.4,z+.65))});
 });
}
