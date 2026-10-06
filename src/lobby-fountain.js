import * as T from 'three';

const bumpNormal=`
vec3 flowNormal(vec3 position,vec3 normal,vec2 gradient,float face){
 vec3 dx=dFdx(position),dy=dFdy(position);
 vec3 rx=cross(dy,normal),ry=cross(normal,dx);
 float determinant=dot(dx,rx)*face;
 return normalize(abs(determinant)*normal-sign(determinant)*(gradient.x*rx+gradient.y*ry));
}`;

// Original water geometry. Shared time drives ripples, a central aerated plume and ballistic spray.
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
     else{float d=length(p);h+=.003*sin(d*47.0-t*9.0)*exp(-d*3.8);h+=.002*sin(p.x*57.0+p.y*63.0+t*11.0)*exp(-d*4.0);}
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

 // A single aerated vertical plume: a turbulent liquid core surrounded by
 // rising drops, a broken crest, falling spray and surface splash particles.
 const nozzle=add(new T.CylinderGeometry(.1,.12,.055,24),mats.edge,1.066);nozzle.name='central-aerated-nozzle';
 const plumeMaterial=new T.MeshPhysicalMaterial({color:0x68857f,roughness:.18,metalness:0,ior:1.333,clearcoat:.8,clearcoatRoughness:.12,envMapIntensity:.5,transparent:true,opacity:.18,depthWrite:false,side:T.DoubleSide});
 plumeMaterial.name='Turbulent aerated water core';plumeMaterial.userData.flowTime=time;
 plumeMaterial.customProgramCacheKey=()=> 'fountain-aerated-plume-v3';
 plumeMaterial.onBeforeCompile=shader=>{
  shader.uniforms.uFlowTime=time;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uFlowTime;varying vec3 vPlumeCoord;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float height=clamp((position.y-1.05)/1.25,0.0,1.0);
   float surge=sin(position.y*27.0-uFlowTime*18.0+position.x*13.0)*sin(position.z*21.0+position.y*17.0-uFlowTime*11.0);
   transformed+=normal*(.006+.023*height)*surge;
   transformed.xz+=height*height*.026*vec2(sin(uFlowTime*2.7+height*9.0),cos(uFlowTime*3.1+height*7.0));
   vPlumeCoord=transformed;
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nuniform float uFlowTime;varying vec3 vPlumeCoord;\n${bumpNormal}`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float crest=smoothstep(1.6,2.2,vPlumeCoord.y);
   float turbulence=sin(vPlumeCoord.y*83.0-uFlowTime*24.0+sin(vPlumeCoord.x*61.0+vPlumeCoord.z*49.0))*sin(vPlumeCoord.x*71.0-vPlumeCoord.z*57.0+uFlowTime*9.0);
   float detail=.0015*turbulence;
   normal=flowNormal(-vViewPosition,normal,vec2(dFdx(detail),dFdy(detail)),faceDirection);
   nonPerturbedNormal=normal;
   diffuseColor.a=(.08+.1*(turbulence*.5+.5))*(1.0-crest*.7);
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.63,.71,.69),crest*.45);
  `);
 };
 const core=add(lathe([[.065,1.055],[.07,1.2],[.065,1.42],[.075,1.62],[.08,1.82],[.095,2.02],[.11,2.14],[.09,2.23],[.05,2.28],[0,2.3]]),plumeMaterial);core.name='central-turbulent-plume';core.castShadow=false;core.renderOrder=4;
 const count=5600,positions=new Float32Array(count*3),params=new Float32Array(count*4),kinds=new Float32Array(count),sizes=new Float32Array(count);
 const random=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
 for(let i=0;i<count;i++){
  params.set([random(i*4),random(i*4+1)*Math.PI*2,random(i*4+2),random(i*4+3)],i*4);
  kinds[i]=i<2800?0:i<4400?1:i<5000?2:i<5400?3:4;
  sizes[i]=.01+random(i+19000)*.018;
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('aParams',new T.BufferAttribute(params,4));geometry.setAttribute('aKind',new T.BufferAttribute(kinds,1));geometry.setAttribute('aSize',new T.BufferAttribute(sizes,1));
 const droplets=new T.Points(geometry,new T.ShaderMaterial({uniforms:{uFlowTime:time},transparent:true,depthWrite:false,
  vertexShader:`uniform float uFlowTime;attribute vec4 aParams;attribute float aKind;attribute float aSize;varying float vFade;varying float vFoam;
   void main(){float angle=aParams.y;float spread=aParams.z;float variety=aParams.w;float rate=aKind<.5?.94:aKind<1.5?1.6:aKind<2.5?1.5:aKind<3.5?3.05:1.9;
    float t=fract(aParams.x+uFlowTime*rate);float r;vec3 p;vFoam=0.0;
    if(aKind<.5){float age=t*1.03;float speed=4.85+variety*.3;r=.015+(.1+spread*.36)*age*.8;p.y=1.055+speed*age-4.9*age*age;vFade=.68+.3*sin(t*3.14159);vFoam=smoothstep(1.6,2.15,p.y);}
    else if(aKind<1.5){r=.14+spread*.54*t+.035*sin(t*9.0+angle);p.y=1.055+(1.09+variety*.16)*(1.0-t*t);vFade=.75*sin(t*3.14159);vFoam=.65;}
    else if(aKind<2.5){float age=t*.6;r=.08+(.35+spread*.75)*age;p.y=2.18+variety*.14+(1.0+spread*.2)*age-4.9*age*age;vFade=.7*sin(t*3.14159);vFoam=1.0;}
    else if(aKind<3.5){float age=t*.328;r=.15+spread*.54+age*(.3+variety*.3);p.y=1.055+1.6*age-4.9*age*age;vFade=.62*sin(t*3.14159);vFoam=.9;}
    else{r=1.048+.048*t;p.y=1.053-.59*t*t;vFade=.32*sin(t*3.14159);vFoam=.15;}
    p.x=r*cos(angle);p.z=r*sin(angle);
    p.xz+=.015*sin(uFlowTime*2.1+p.y*8.0+angle)*vec2(cos(angle*3.0),sin(angle*2.0));
    if(aKind<3.5&&p.y<1.054)vFade=0.0;
    vec4 view=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*view;
    gl_PointSize=clamp(aSize*650.0/max(.1,-view.z),1.0,6.0);
   }`,
  fragmentShader:`varying float vFade;varying float vFoam;void main(){vec2 p=gl_PointCoord*2.0-1.0;float radius=length(p);if(radius>1.0)discard;
   float dome=sqrt(max(0.0,1.0-radius*radius));vec3 normal=vec3(p,dome);
   float highlight=pow(max(0.0,dot(normal,normalize(vec3(-.4,.7,.6)))),14.0);
   vec3 shade=mix(vec3(.035,.07,.063),vec3(.46,.59,.56),dome*.6)+highlight*.8;
   shade=mix(shade,vec3(.85,.9,.87),vFoam*.18);
   gl_FragColor=vec4(shade,(1.0-smoothstep(.65,1.0,radius))*vFade);
   #include <colorspace_fragment>
  }`,
 }));droplets.name='aerated-plume-and-splash-drops';droplets.frustumCulled=false;droplets.renderOrder=5;group.add(droplets);
 obstacles.push({x:0,z:0,w:4.32,d:4.32,minY:0,maxY:1.6});
 return {group,update(elapsed,moving){time.value=moving?elapsed:0;}};
}
