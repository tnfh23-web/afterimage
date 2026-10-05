import {PointLight,SpotLight,Vector3} from 'three';

// Keep the shader's light/shadow counts constant across every room. The
// fixtures retain each room's colour, intensity and world-space placement.
export function lightingRig(scene,groups,corridors){
 scene.updateMatrixWorld(true);
 const describe=light=>({light,position:light.getWorldPosition(new Vector3()),target:light.isSpotLight?light.target.getWorldPosition(new Vector3()):null});
 const fixtures=groups.map(group=>{const lights=[];group.traverse(o=>{if(o.isLight)lights.push(describe(o));});return lights;});
 const passages=corridors.map(c=>({...c,...describe(c.light)}));
 const maxPoints=Math.max(...fixtures.map(items=>items.filter(f=>f.light.isPointLight).length));
 const neighbors=groups.map((_,id)=>passages.filter(c=>c.a===id||c.b===id).map(c=>c.a===id?c.b:c.a));
 const maxNeighborLights=Math.max(...neighbors.map((ids,id)=>ids.reduce((n,neighbor)=>n+fixtures[neighbor].filter(f=>f.light.isPointLight&&f.light.userData.peek).length,0)+passages.filter(c=>c.a===id||c.b===id).length));
 const points=Array.from({length:maxPoints+maxNeighborLights},()=>new PointLight(0xffffff,0,1,2));
 const spots=[new SpotLight(),new SpotLight()];
 spots[0].castShadow=true;spots[0].shadow.mapSize.set(2048,2048);spots[0].shadow.bias=-.0002;spots[0].shadow.normalBias=.025;
 fixtures.flat().forEach(({light})=>{light.removeFromParent();if(light.isSpotLight)light.target.removeFromParent();});
 passages.forEach(({light})=>light.removeFromParent());
 points.forEach(light=>scene.add(light));spots.forEach(light=>scene.add(light,light.target));
 const copy=(destination,fixture)=>{
  const source=fixture.light;destination.position.copy(fixture.position);destination.color.copy(source.color);destination.intensity=source.intensity;destination.distance=source.distance;destination.decay=source.decay;
  if(destination.isSpotLight){destination.angle=source.angle;destination.penumbra=source.penumbra;destination.target.position.copy(fixture.target);destination.target.updateMatrixWorld();}
 };
 return {shadowSpot:spots[0],activate(id){
  groups.forEach((group,index)=>{group.visible=index===id||neighbors[id].includes(index);});
  const active=fixtures[id].filter(f=>f.light.isPointLight);
  for(const neighbor of neighbors[id])active.push(...fixtures[neighbor].filter(f=>f.light.isPointLight&&f.light.userData.peek));
  active.push(...passages.filter(c=>c.a===id||c.b===id));
  points.forEach((light,index)=>{if(active[index])copy(light,active[index]);else light.intensity=0;});
  fixtures[id].filter(f=>f.light.isSpotLight).forEach((fixture,index)=>copy(spots[index],fixture));
 }};
}
