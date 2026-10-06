import * as T from 'three';

// Original geometry and GPU water motion; no video, external model or reflection pass.
export function createLobbyFountain(root,mats,obstacles){
 const group=new T.Group();group.name='lobby-flowing-fountain';root.add(group);
 const stone=mats.ceramic.clone();stone.color.set(0xded7c9);stone.roughness=.72;
 const add=(geometry,material,y=0)=>{const mesh=new T.Mesh(geometry,material);mesh.position.y=y;mesh.receiveShadow=true;mesh.castShadow=true;group.add(mesh);return mesh;};
 const lathe=points=>new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),64);
 add(lathe([[0,.04],[2.03,.04],[2.14,.12],[2.14,.52],[2.08,.58],[1.88,.58],[1.82,.5],[1.82,.2],[0,.2]]),stone);
 add(new T.CylinderGeometry(.26,.35,.57,32),stone,.7);
 add(lathe([[0,.83],[.82,.83],[1.04,.92],[1.04,1.05],[.97,1.05],[.93,1.0],[.91,.94],[0,.94]]),stone);
 const time={value:0};
 const water=(curtain=false)=>new T.ShaderMaterial({
  uniforms:{uTime:time,uCurtain:{value:curtain?1:0}},transparent:curtain,depthWrite:!curtain,side:T.DoubleSide,
  vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform float uTime;uniform float uCurtain;varying vec2 vUv;
   void main(){float wave,shine;vec3 color;
    if(uCurtain>0.5){float line=sin(vUv.x*360.0+sin(vUv.y*22.0-uTime*5.0));
     wave=sin(vUv.y*58.0+uTime*9.0+vUv.x*32.0);shine=pow(max(0.0,line*0.5+0.5),12.0);
     color=mix(vec3(.22,.36,.38),vec3(.78,.88,.85),shine*.7+wave*.06);
    }else{vec2 p=vUv-.5;float r=length(p);wave=sin(r*96.0-uTime*3.0+sin(p.x*29.0+p.y*24.0+uTime)*.6);
     shine=pow(max(0.0,wave),12.0);float light=pow(max(0.0,1.0-length((p-vec2(-.16,.13))*vec2(1.4,4.0))),4.0);
     color=mix(vec3(.12,.22,.24),vec3(.4,.54,.53),.35+wave*.09)+vec3(.43,.45,.4)*(shine*.2+light*.52);
    }
    gl_FragColor=vec4(color,uCurtain>0.5?.57+shine*.25:1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`,
 });
 const surface=water(),curtain=water(true);
 for(const [radius,y] of [[1.82,.46],[1.045,1.053]]){const mesh=add(new T.CircleGeometry(radius,64),surface,y);mesh.rotation.x=-Math.PI/2;mesh.castShadow=false;}
 const falling=add(new T.CylinderGeometry(1.048,1.08,.59,64,8,true),curtain,.755);falling.castShadow=false;falling.renderOrder=2;
 const streamMaterial=new T.MeshPhysicalMaterial({color:0xaac9c8,roughness:.15,metalness:.16,transparent:true,opacity:.76,depthWrite:false});
 for(let i=0;i<6;i++){
  const angle=i*Math.PI/3,points=[];
  for(let j=0;j<=20;j++){const t=j/20,r=.1+t*.64;points.push(new T.Vector3(Math.cos(angle)*r,1.055+Math.sin(t*Math.PI)*.47,Math.sin(angle)*r));}
  const stream=add(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.012,5,false),streamMaterial);stream.castShadow=false;
 }
 add(new T.CylinderGeometry(.13,.16,.13,24),mats.edge,1.055);
 const positions=new Float32Array(84*3),seeds=new Float32Array(84);
 for(let i=0;i<84;i++){const angle=i*2.39996;positions[i*3]=Math.cos(angle);positions[i*3+2]=Math.sin(angle);seeds[i]=(i*.61803398875)%1;}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('aSeed',new T.BufferAttribute(seeds,1));
 const spray=new T.Points(geometry,new T.ShaderMaterial({uniforms:{uTime:time},transparent:true,depthWrite:false,
  vertexShader:`uniform float uTime;attribute float aSeed;varying float vFade;void main(){float t=fract(aSeed+uTime*.9);vec3 p=position;float r=1.048+t*.12;p.xz*=r;p.y=1.05-.59*t*t;vec4 view=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*view;gl_PointSize=clamp(26.0/-view.z,1.0,4.0);vFade=sin(t*3.14159)*.65;}`,
  fragmentShader:`varying float vFade;void main(){float r=length(gl_PointCoord-.5);gl_FragColor=vec4(.72,.85,.84,(1.0-smoothstep(.12,.5,r))*vFade);#include <colorspace_fragment>}`.replace(';#include',';\n#include'),
 }));spray.frustumCulled=false;group.add(spray);
 obstacles.push({x:0,z:0,w:4.32,d:4.32,minY:0,maxY:1.6});
 return {group,update(elapsed,moving){time.value=moving?elapsed:0;}};
}
