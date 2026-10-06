import * as T from 'three';

const bumpNormal=`
vec3 flowNormal(vec3 position,vec3 normal,vec2 gradient,float face){
 vec3 dx=dFdx(position),dy=dFdy(position);
 vec3 rx=cross(dy,normal),ry=cross(normal,dx);
 float determinant=dot(dx,rx)*face;
 return normalize(abs(determinant)*normal-sign(determinant)*(gradient.x*rx+gradient.y*ry));
}`;

// Original water geometry. Shared time drives normals, jet flow and ballistic drops.
// Physical reflections use the existing environment; no transmission capture pass.
export function createLobbyFountain(root,mats,obstacles){
 const group=new T.Group();group.name='lobby-flowing-fountain';root.add(group);
 const stone=mats.ceramic.clone();stone.color.set(0xded7c9);stone.roughness=.72;
 const add=(geometry,material,y=0)=>{const mesh=new T.Mesh(geometry,material);mesh.position.y=y;mesh.receiveShadow=true;mesh.castShadow=true;group.add(mesh);return mesh;};
 const lathe=points=>new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),64);
 add(lathe([[0,.04],[2.03,.04],[2.14,.12],[2.14,.52],[2.08,.58],[1.88,.58],[1.82,.5],[1.82,.2],[0,.2]]),stone);
 add(new T.CylinderGeometry(.26,.35,.57,32),stone,.7);
 add(lathe([[0,.83],[.82,.83],[1.04,.92],[1.04,1.05],[.97,1.05],[.93,1.0],[.91,.94],[0,.94]]),stone);
 const time={value:0};
 const waterMaterial=kind=>{
  const material=new T.MeshPhysicalMaterial({color:0x28433d,roughness:kind===2?.15:.09,metalness:0,ior:1.333,clearcoat:.65,clearcoatRoughness:.11,envMapIntensity:1.25,transparent:true,opacity:kind===2?.13:.42,depthWrite:false,side:T.DoubleSide});
  material.name=kind===2?'Falling clear water':'Reflective rippling water';
  material.userData.flowTime=time;
  material.customProgramCacheKey=()=>`fountain-physical-water-v2-${kind===2?'fall':'surface'}`;
  material.onBeforeCompile=shader=>{
   shader.uniforms.uFlowTime=time;shader.uniforms.uBasin={value:kind};
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vWaterCoord;');
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nvWaterCoord=${kind===2?'uv':'position.xy'};`);
   const field=kind===2?`
    float waterHeight(vec2 p){
     float y=p.y+uFlowTime*1.7;
     return .0012*sin(p.x*197.0+sin(y*13.0)*.3)+.0006*sin(p.x*347.0-y*37.0)+.0004*sin(p.x*91.0+y*21.0);
    }`:`
    float waterHeight(vec2 p){
     float t=uFlowTime;float h=.004*sin(p.x*8.3+p.y*5.2-t*1.6)+.0025*sin(p.x*-7.1+p.y*12.4+t*2.1);
     h+=.0017*sin(p.x*21.0+p.y*16.0-t*3.0);
     if(uBasin<.5){float d=abs(length(p)-1.09);h+=.003*sin(d*39.0-t*6.4)*exp(-d*4.5);}
     else{for(int i=0;i<6;i++){float a=float(i)*1.04719755;vec2 hit=.74*vec2(cos(a),sin(a));float d=length(p-hit);h+=.0015*sin(d*43.0-t*7.0+float(i))*exp(-d*6.0);}}
     return h;
    }`;
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nuniform float uFlowTime;uniform float uBasin;varying vec2 vWaterCoord;\n${field}\n${bumpNormal}`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    float waterH=waterHeight(vWaterCoord);
    normal=flowNormal(-vViewPosition,normal,vec2(dFdx(waterH),dFdy(waterH)),faceDirection);
    nonPerturbedNormal=normal;
    float grazing=pow(1.0-abs(dot(normal,normalize(vViewPosition))),3.0);
    diffuseColor.a=${kind===2?'.23+grazing*.22':'.76+grazing*.2'};
   `);
  };
  return material;
 };
 for(const [radius,y,kind] of [[1.82,.46,0],[1.045,1.053,1]]){
  const mesh=add(new T.CircleGeometry(radius,96),waterMaterial(kind),y);mesh.rotation.x=-Math.PI/2;mesh.castShadow=false;mesh.renderOrder=2;
 }
 const falling=add(new T.CylinderGeometry(1.048,1.08,.59,96,10,true),waterMaterial(2),.755);falling.castShadow=false;falling.renderOrder=3;
 const nozzle=add(new T.CylinderGeometry(.13,.14,.085,24),mats.edge,1.06);nozzle.name='six-jet-nozzle';
 for(let i=0;i<6;i++){
  const angle=i*Math.PI/3,points=[];
  for(let j=0;j<=32;j++){const t=j/32,r=.1+t*.64;points.push(new T.Vector3(Math.cos(angle)*r,1.055+1.8*t*(1-t),Math.sin(angle)*r));}
  const material=new T.MeshPhysicalMaterial({color:0x496e66,roughness:.075,metalness:0,ior:1.333,clearcoat:.8,clearcoatRoughness:.08,envMapIntensity:1.3,transparent:true,opacity:.62,depthWrite:false});
  material.name='Moving clear jet';material.userData.flowTime=time;
  material.customProgramCacheKey=()=> 'fountain-moving-jet-v2';
  material.onBeforeCompile=shader=>{
   shader.uniforms.uFlowTime=time;shader.uniforms.uJetAngle={value:angle};
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uFlowTime;uniform float uJetAngle;varying vec2 vFlowUv;');
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vFlowUv=uv;
    float pulse=sin(uv.x*88.0-uFlowTime*18.0+uJetAngle);
    transformed+=normal*pulse*.002;
    transformed.xz+=vec2(cos(uJetAngle),sin(uJetAngle))*.008*sin(uFlowTime*3.1+uv.x*6.0+uJetAngle)*uv.x*uv.x;
   `);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uFlowTime;varying vec2 vFlowUv;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float flow=sin(vFlowUv.x*73.0-uFlowTime*17.0+sin(vFlowUv.x*19.0-uFlowTime*6.0));
    diffuseColor.a*=.65+.35*flow;
   `);
  };
  const stream=add(new T.TubeGeometry(new T.CatmullRomCurve3(points),48,.01,7,false),material);stream.castShadow=false;stream.renderOrder=4;
 }
 // Visible droplets travel through each upper arc, then break up on the descent.
 // Additional droplets fall from the rim under gravity and briefly splash.
 const count=6*72+168,positions=new Float32Array(count*3),seeds=new Float32Array(count),angles=new Float32Array(count),kinds=new Float32Array(count);
 for(let i=0;i<count;i++){seeds[i]=((i%72)+.5)/72;angles[i]=i<432?Math.floor(i/72)*Math.PI/3:i*2.39996;kinds[i]=i<432?0:1;}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('aSeed',new T.BufferAttribute(seeds,1));geometry.setAttribute('aAngle',new T.BufferAttribute(angles,1));geometry.setAttribute('aKind',new T.BufferAttribute(kinds,1));
 const droplets=new T.Points(geometry,new T.ShaderMaterial({uniforms:{uFlowTime:time},transparent:true,depthWrite:false,
  vertexShader:`uniform float uFlowTime;attribute float aSeed;attribute float aAngle;attribute float aKind;varying float vFade;varying float vStretch;
   void main(){float t=fract(aSeed+uFlowTime*(aKind<.5?1.35:1.9));vec3 p;float r;
    if(aKind<.5){r=.1+t*.64;p.y=1.055+1.8*t*(1.0-t);r+=.008*sin(uFlowTime*3.1+t*6.0+aAngle)*t*t;vFade=.3+.6*smoothstep(.35,.9,t);vStretch=1.0;}
    else{r=1.048+.048*t+.004*sin(aAngle*8.0+t*14.0);p.y=1.053-.59*t*t;vFade=sin(t*3.14159)*.45;vStretch=.5;}
    p.x=r*cos(aAngle);p.z=r*sin(aAngle);vec4 view=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*view;
    gl_PointSize=clamp((aKind<.5?8.0:6.0)/-view.z,1.1,3.3);
   }`,
  fragmentShader:`varying float vFade;varying float vStretch;void main(){vec2 p=gl_PointCoord-.5;p.x/=vStretch;float alpha=1.0-smoothstep(.06,.5,length(p));vec3 shade=mix(vec3(.16,.26,.23),vec3(.92,.97,.94),smoothstep(-.3,.2,p.x));gl_FragColor=vec4(shade,alpha*vFade);
   #include <colorspace_fragment>
  }`,
 }));droplets.name='ballistic-moving-water-drops';droplets.frustumCulled=false;droplets.renderOrder=5;group.add(droplets);
 obstacles.push({x:0,z:0,w:4.32,d:4.32,minY:0,maxY:1.6});
 return {group,update(elapsed,moving){time.value=moving?elapsed:0;}};
}
