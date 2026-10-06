import {Group,Mesh,PlaneGeometry,MeshBasicMaterial,DoubleSide} from 'three';
import {batchRoomArchitecture} from './static-room-batches';

export function buildingEnvelope(scene,mats,cube,obstacles){
 // Permanent structural core: room visibility may cull artwork, but the
 // stairwell, enclosed bridge and the structure supporting 2F never vanish.
 const root=new Group();root.name='continuous-building-envelope';scene.add(root);
 cube(root,16,2.8,18,20,6.6,-14,mats.wall);
 cube(root,16,1.6,18,20,7.2,14,mats.wall);
 cube(root,16,8,10,20,4,0,mats.wall);
 // Stairwell rises above the lobby roof, with enough headroom at its landing.
 cube(root,5.3,.25,10.95,5.5,11.65,-6.15,mats.ceiling);
 cube(root,.25,3.55,10.7,3.05,9.83,-6.15,mats.wall);
 cube(root,5.05,3.55,.25,5.5,9.83,-11.5,mats.wall);
 cube(root,5.05,3.55,.25,5.5,9.83,-.8,mats.wall);
 cube(root,.25,3.55,8.75,8,9.83,-7.225,mats.wall);
 // Above the door to the bridge, then an enclosed short passage to the hall.
 cube(root,.25,.55,1.8,8,11.33,-1.7,mats.wall);
 cube(root,4.65,.25,2.05,10.2,11.65,-1.7,mats.ceiling);
 for(const z of [-2.68,-.72]){
  cube(root,4.65,1.05,.18,10.2,8.725,z,mats.wall);
  cube(root,4.65,.25,.18,10.2,11.43,z,mats.wall);
  for(const x of [8,10.2,12.4])cube(root,.065,2.25,.18,x,10.3,z,mats.edge);
  const glass=new Mesh(new PlaneGeometry(4.3,2.1),new MeshBasicMaterial({color:0x8cacae,transparent:true,opacity:.2,side:DoubleSide,depthWrite:false}));glass.position.set(10.2,10.3,z);root.add(glass);
  obstacles.push({x:10.2,z,w:4.65,d:.18,minY:8.2,maxY:11.8});
 }
 cube(root,4.3,.018,.04,10.2,11.48,-1.7,mats.light);
 // Physical roof around the raised skylight, visible from the upper landing.
 for(const x of [-3,3])cube(root,.18,.2,20.2,x,8.72,0,mats.edge);
 for(const z of [-10,10])cube(root,6.2,.2,.18,0,8.72,z,mats.edge);
 batchRoomArchitecture(root);
 return root;
}
