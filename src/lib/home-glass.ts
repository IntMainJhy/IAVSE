import {ACESFilmicToneMapping,BackSide,Color,DataTexture,FrontSide,Group,LinearFilter,MathUtils,Mesh,MeshBasicMaterial,MeshPhysicalMaterial,PerspectiveCamera,PlaneGeometry,PMREMGenerator,REVISION,RGBAFormat,Scene,ShaderChunk,ShaderMaterial,SphereGeometry,Vector3,WebGLRenderer} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export type GlassReveal={left:number;top:number;width:number;height:number;progress:number;variant?:string};
export type HomeGlassScene={animated?:boolean;interactive?:boolean;resize:(width:number,height:number,dpr:number)=>void;setReveals?:(panels:GlassReveal[])=>void;render:(x:number,y:number,dark:boolean,scroll:number,reduced:boolean,activeSeconds?:number)=>void;dispose:()=>void};
type GlassOptions={onProgress?:(progress:number)=>void};
const MODEL_URL='/models/iavse-optical-surface.glb',MOBILE_MODEL_URL='/models/iavse-optical-surface-mobile.glb';
const originalChunk=ShaderChunk.transmission_pars_fragment,sample='return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );';
const transmission=REVISION==='187'&&originalChunk.split(sample).length===2?originalChunk.replace(sample,'return textureLod( transmissionSamplerMap, fragCoord.xy, lod );'):null;

function disposeModel(model:Group){
 const geometries=new Set<Mesh['geometry']>(),materials=new Set<MeshPhysicalMaterial>();
 model.traverse(node=>{if(node instanceof Mesh){geometries.add(node.geometry);for(const material of Array.isArray(node.material)?node.material:[node.material])materials.add(material);}});
 geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());
}

/** Closed Blender-authored optical surface. The visible boundary is its actual rolled edge. */
export async function createHomeGlass(canvas:HTMLCanvasElement,signal:AbortSignal,{onProgress}:GlassOptions={}):Promise<HomeGlassScene>{
 const mobile=typeof window!=='undefined'&&window.innerWidth<768;
 const response=await fetch(mobile?MOBILE_MODEL_URL:MODEL_URL,{signal});
 if(!response.ok)throw Error('Optical surface unavailable');
 let buffer:ArrayBuffer;
 const length=Number(response.headers?.get('content-length')||0);
 if(response.body&&length>0){
  const reader=response.body.getReader(),chunks:Uint8Array[]=[];let received=0;
  try{while(true){const item=await reader.read();if(item.done)break;chunks.push(item.value);received+=item.value.byteLength;onProgress?.(Math.min(.9,received/length*.9));}const bytes=new Uint8Array(received);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}buffer=bytes.buffer;}
  finally{reader.releaseLock();}
 }else{buffer=await response.arrayBuffer();onProgress?.(.9);}
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 const gltf=await new GLTFLoader().parseAsync(buffer,''),model=gltf.scene;
 if(signal.aborted){disposeModel(model);throw new DOMException('Aborted','AbortError');}
 let renderer:WebGLRenderer;
 try{renderer=new WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});}catch(error){disposeModel(model);throw error;}
 let environment:ReturnType<PMREMGenerator['fromScene']>|undefined,disposed=false;
 const extraGeometry:PlaneGeometry[]=[],extraMaterials:(ShaderMaterial|MeshBasicMaterial)[]=[];
 const dispose=()=>{if(disposed)return;disposed=true;signal.removeEventListener('abort',dispose);disposeModel(model);environment?.dispose();extraGeometry.forEach(value=>value.dispose());extraMaterials.forEach(value=>value.dispose());renderer.dispose();};
 try{
  renderer.outputColorSpace='srgb';renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  const scene=new Scene(),camera=new PerspectiveCamera(40,1,.1,100),surface=new Group();surface.name='iavse-optical-field';camera.position.z=8.2;surface.add(model);scene.add(surface);
  const sunDirection=(mobile?new Vector3(-.20019,.88476,.42085):new Vector3(.23379,.79313,.56239)).normalize();
  const opticalTime={value:0},opticalFade={value:1},opticalLeft={value:-.73},opticalSunX={value:mobile?.36:.78},opticalSunDirection={value:new Vector3()};
  const nativeMaterials=new Set<MeshPhysicalMaterial>();
  model.traverse(node=>{if(!(node instanceof Mesh))return;for(const material of Array.isArray(node.material)?node.material:[node.material]){
   if(!(material instanceof MeshPhysicalMaterial))continue;
   nativeMaterials.add(material);const edge=material.name.includes('PolishedRolledEdge');material.side=FrontSide;material.color.set('#ffffff');material.toneMapped=false;material.transmission=1;material.ior=edge?1.5:1.46;material.thickness=edge?.42:.58;material.roughness=edge?.012:.018;material.dispersion=edge?.8:.26;material.metalness=0;material.opacity=1;material.attenuationColor.set('#e9f4ff');material.attenuationDistance=24;material.iridescence=0;material.clearcoat=0;
   if(transmission){material.onBeforeCompile=shader=>{
    const include='#include <transmission_pars_fragment>';if(shader.fragmentShader.split(include).length===2)shader.fragmentShader=shader.fragmentShader.replace(include,transmission);
    // A restrained optical coating is shaded on the actual lens surface. Its
    // grazing highlight follows local geometry, view normals and the live clock.
    shader.uniforms.uOpticalTime=opticalTime;shader.uniforms.uOpticalFade=opticalFade;shader.uniforms.uOpticalLeft=opticalLeft;shader.uniforms.uOpticalSunX=opticalSunX;shader.uniforms.uOpticalSunDirection=opticalSunDirection;
    shader.vertexShader='varying vec3 vOpticalPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvOpticalPosition=position;');
    shader.fragmentShader='varying vec3 vOpticalPosition;uniform float uOpticalTime;uniform float uOpticalFade;uniform float uOpticalLeft;uniform float uOpticalSunX;uniform vec3 uOpticalSunDirection;float iavseGaussian(float x){return exp(-x*x);}\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <tonemapping_fragment>',`
     float lensX=vOpticalPosition.x;
     float lensTop=.76-.405*(lensX-.66)*(lensX-.66);
     float lensDistance=(lensTop-vOpticalPosition.y)/sqrt(1.+.6561*(lensX-.66)*(lensX-.66));
     float lensAA=max(fwidth(lensDistance),.0005);
     float lensEdge=iavseGaussian((lensDistance-.006)/max(.0045,lensAA*1.3));
     float lensShoulder=iavseGaussian(lensDistance/.035);
     float lensGlint=iavseGaussian((lensX-uOpticalLeft+sin(uOpticalTime*.26)*.18)/.24)+.7*iavseGaussian((lensX-1.03-sin(uOpticalTime*.23)*.20)/.32);
     float lensFresnel=pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),3.);
     float prismWidth=max(.004,lensAA*.95),prismSpread=max(.0045,lensAA*.7);
     vec3 lensSpectrum=vec3(iavseGaussian((lensDistance-.010-prismSpread)/prismWidth),iavseGaussian((lensDistance-.010)/prismWidth),iavseGaussian((lensDistance-.010+prismSpread)/prismWidth));
     vec3 lensSilver=mix(vec3(.29,.57,.94),vec3(.88,.94,1.),clamp(lensGlint,0.,1.));
     vec3 lensCoating=lensSilver*lensEdge*(.07+lensGlint*.30)+lensSpectrum*lensGlint*.52+vec3(.2,.42,.73)*lensFresnel*.035;
     vec3 lensReflection=reflect(-normalize(vViewPosition),normal);
     vec3 lensWindow=normalize(vec3(.28+sin(uOpticalTime*.22)*.10,.74,.61));
     float lensSky=pow(max(dot(lensReflection,lensWindow),0.),20.);
     lensCoating+=vec3(.45,.68,1.)*lensSky*.028*smoothstep(.008,.045,lensDistance);
     float sunAlignment=max(dot(lensReflection,uOpticalSunDirection),0.);
     float sunPatch=iavseGaussian((lensX-uOpticalSunX)/.12)*(1.-smoothstep(.010,.060,abs(lensDistance)));
     vec3 sunlight=vec3(1.,.97,.89)*(pow(sunAlignment,256.)*1.15+pow(sunAlignment,48.)*.12)*sunPatch;
     lensCoating+=sunlight+lensSpectrum*sunPatch*.65;
     float polishedLip=iavseGaussian((lensDistance-.028)/.012)*(1.+lensFresnel)*.10;
     gl_FragColor.rgb*=1.-polishedLip*uOpticalFade;
     gl_FragColor.rgb+=lensCoating*uOpticalFade;
     #include <tonemapping_fragment>
    `);
   };material.customProgramCacheKey=()=> 'iavse-sunlit-meniscus-r187';}
  }});
  // Large feathered softboxes are captured once, never drawn in the visible scene.
  const studio=new Scene();studio.background=new Color('#243f6b');studio.name='iavse-offscreen-studio';
  // The daylight sky is captured into the reflection map, never drawn behind UI.
  const skyGeometry=new SphereGeometry(25,48,24),skyMaterial=new ShaderMaterial({side:BackSide,depthWrite:false,toneMapped:false,uniforms:{uSkySun:{value:sunDirection}},vertexShader:`
   varying vec3 vSkyDirection;void main(){vSkyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
  `,fragmentShader:`
   varying vec3 vSkyDirection;uniform vec3 uSkySun;
   void main(){
    vec3 d=normalize(vSkyDirection);float height=clamp(d.y*.5+.5,0.,1.);
    vec3 sky=mix(vec3(.28,.39,.55),vec3(.025,.065,.16),smoothstep(.35,1.,height));
    float cloud=sin(d.x*9.+d.z*5.)*sin(d.z*7.-d.y*4.)*.5+.5;
    sky+=vec3(.14,.19,.25)*smoothstep(.50,.87,cloud)*smoothstep(-.2,.6,d.y);
    float alignment=max(dot(d,uSkySun),0.);
    float disk=smoothstep(.99875,.9998,alignment);
    sky+=vec3(1.,.94,.80)*(disk*40.+pow(alignment,160.)*.8);
    gl_FragColor=vec4(sky,1.);
   }
  `});const sky=new Mesh(skyGeometry,skyMaterial);sky.name='iavse-offscreen-daylight-sky';studio.add(sky);
  const panelGeometry=new PlaneGeometry(),panelMaterials:MeshBasicMaterial[]=[];
  const pixels=new Uint8Array(64*64*4);
  for(let row=0;row<64;row++)for(let column=0;column<64;column++){
   const x=(column+.5)/32-1,y=(row+.5)/32-1,l=Math.round(255*Math.pow(Math.max(0,1-x*x-y*y),2));pixels.set([255,255,255,l],(row*64+column)*4);
  }
  const diffuser=new DataTexture(pixels,64,64,RGBAFormat);diffuser.minFilter=diffuser.magFilter=LinearFilter;diffuser.needsUpdate=true;
  const panel=(name:string,position:number[],scale:number[],color:string,power:number)=>{const material=new MeshBasicMaterial({color:new Color(color).multiplyScalar(power),map:diffuser,toneMapped:false,transparent:true,depthWrite:false});panelMaterials.push(material);const mesh=new Mesh(panelGeometry,material);mesh.name=name;mesh.position.fromArray(position);mesh.scale.fromArray(scale);mesh.lookAt(0,0,0);studio.add(mesh);};
  panel('soft-silver-window',[2.5,3.5,6],[4,3,1],'#e8f3ff',5);
  panel('front-sky-window',[.8,1.6,7],[5,3,1],'#dcecff',1.8);
  panel('blue-bounce',[-4,-1,5],[7,6,1],'#6aacf4',1.6);
  panel('left-grazing-window',[-6,2,-3],[5,4,1],'#d3e6ff',10);
  panel('upper-soft-fill',[-1,7,-2],[10,6,1],'#ffffff',8);
  const pmrem=new PMREMGenerator(renderer);
  try{environment=pmrem.fromScene(studio,.025);scene.environment=environment.texture;for(const material of nativeMaterials){material.envMap=environment.texture;material.envMapIntensity=material.name.includes('PolishedRolledEdge')?1.65:.65;}}
  finally{skyGeometry.dispose();skyMaterial.dispose();panelGeometry.dispose();panelMaterials.forEach(value=>value.dispose());diffuser.dispose();pmrem.dispose();}
  const wallGeometry=new PlaneGeometry(80,52);extraGeometry.push(wallGeometry);
  const wallMaterial=new ShaderMaterial({depthWrite:false,toneMapped:false,uniforms:{uScroll:{value:0},uTime:{value:0},uBrightness:{value:1},uBlueTop:{value:new Color('#102651')},uBlueMiddle:{value:new Color('#2c68b7')},uBlueBottom:{value:new Color('#b7cfe7')},uIce:{value:new Color('#f4f7fb')}},vertexShader:`
   varying vec2 vScreen;
   void main(){vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);vScreen=p.xy/p.w*.5+.5;gl_Position=p;}
  `,fragmentShader:`
   varying vec2 vScreen;uniform float uScroll;uniform float uTime;uniform float uBrightness;uniform vec3 uBlueTop;uniform vec3 uBlueMiddle;uniform vec3 uBlueBottom;uniform vec3 uIce;
   float softField(vec2 p,vec2 center,vec2 radius){vec2 d=(p-center)/radius;return exp(-dot(d,d));}
   void main(){
    vec2 uv=vScreen;float documentY=max(0.,1.-uv.y+uScroll);
    vec3 color=mix(uBlueTop,uBlueMiddle,smoothstep(0.,.66,documentY));
    color=mix(color,uBlueBottom,smoothstep(.50,.94,documentY));
    color=mix(color,uIce,smoothstep(.66,1.03,documentY));
    vec2 field=vec2(uv.x,documentY);float breathing=sin(uTime*.23)*.018;
    float silver=softField(field,vec2(-.04,.81+breathing),vec2(.36,.26))+softField(field,vec2(1.07,.84-breathing),vec2(.40,.30));
    color=mix(color,uIce,clamp(silver*.62,0.,.76)*(1.-smoothstep(1.,1.2,documentY)));
    float blueDepth=softField(field,vec2(.58,.49),vec2(.56,.25));
    color=mix(color,uBlueMiddle,blueDepth*.13*(1.-smoothstep(.8,1.1,documentY)));
    color*=uBrightness;gl_FragColor=vec4(color,1.);
    #include <colorspace_fragment>
   }
  `});extraMaterials.push(wallMaterial);const wall=new Mesh(wallGeometry,wallMaterial);wall.name='iavse-refraction-receiver';wall.position.z=-7;wall.renderOrder=-10;scene.add(wall);
  let width=1,height=1;
  canvas.dataset.glassFilter=transmission?'linear-mip-r187':'three-default';canvas.dataset.glassModel=mobile?'mobile':'desktop';canvas.dataset.glassDesign='sunlit-meniscus-3';
  signal.addEventListener('abort',dispose,{once:true});if(signal.aborted){dispose();throw new DOMException('Aborted','AbortError');}
  onProgress?.(1);
  return{
   get animated(){return !disposed&&surface.visible;},
   get interactive(){return !disposed&&surface.visible;},
   // The new optical field leaves semantic HTML undistorted; no extra sheets over content.
   setReveals(){},
   resize(nextWidth,nextHeight,dpr){
    if(disposed)return;width=Math.max(1,nextWidth);height=Math.max(1,nextHeight);const mobile=width<768;
    const pixelBudget=Math.sqrt((mobile?3000000:8000000)/(width*height));
    const displayDpr=typeof window!=='undefined'?Math.min(window.devicePixelRatio||1,2,pixelBudget):Math.max(1,dpr),quality=Math.min(1,dpr/Math.max(.1,displayDpr));
    const density=mobile?Math.min(displayDpr,1.35):Math.min(Math.max(displayDpr,1.5),1.75);
    renderer.setPixelRatio(Math.min(density*quality,pixelBudget));renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.transmissionResolutionScale=mobile?.65:.8;
   },
   render(x,y,dark,scroll,reduced,activeSeconds=0){
    if(disposed)return;
    const time=reduced?0:Math.max(0,Number.isFinite(activeSeconds)?activeSeconds:0),spatial=reduced?0:MathUtils.smootherstep(scroll,0,1.3),sweep=reduced?0:MathUtils.smootherstep(scroll,0,.95),intro=reduced?1:MathUtils.smootherstep(time,0,2.4),drift=reduced?0:Math.cos(time*.22)*.06;
    const opacity=1-MathUtils.smoothstep(scroll,.78,1.38);surface.visible=opacity>.001;
    camera.position.set(0,0,8.2+(1-intro)*.65+spatial*.35);camera.rotation.set(0,0,0);
    const viewHeight=2*Math.tan(MathUtils.degToRad(camera.fov/2))*8.2;
    surface.scale.set(viewHeight*(width<768?Math.max(camera.aspect,.9):camera.aspect)*.5,viewHeight*.5,viewHeight*.32);
    surface.position.set(reduced?0:x*.04,(reduced?0:y*.022)+drift-spatial*.24,0);
    surface.rotation.set(reduced?0:y*.025,reduced?0:-x*.045+Math.sin(time*.2+.9)*.075+sweep*.055,reduced?0:drift*.45+sweep*.018);
    scene.environmentRotation.set(.08,.15+sweep*.34+(reduced?0:Math.sin(time*.23+.4)*.38),0);scene.environmentIntensity=1;
    wallMaterial.uniforms.uScroll.value=scroll;wallMaterial.uniforms.uTime.value=time;wallMaterial.uniforms.uBrightness.value=dark?.99:1;
    opticalTime.value=time;opticalFade.value=opacity;opticalLeft.value=width<768?-.35:-.73;
    opticalSunX.value=(width<768?.36:.78)+(scene.environmentRotation.y-.487)*(width<768?.30:.37);opticalSunDirection.value.copy(sunDirection).applyEuler(scene.environmentRotation);
    for(const material of nativeMaterials){material.envMapRotation.copy(scene.environmentRotation);material.opacity=opacity;const alpha=opacity<.999;if(material.transparent!==alpha){material.transparent=alpha;material.depthWrite=!alpha;material.needsUpdate=true;}}
    renderer.transmissionResolutionScale=surface.visible?(width<768?.65:.8):.12;
    canvas.dataset.glassTime=time.toFixed(1);canvas.dataset.glassLightPhase=sweep.toFixed(3);canvas.dataset.glassReading=spatial.toFixed(3);canvas.dataset.glassDispersion='.26';canvas.dataset.glassHeroVisible=surface.visible?'true':'false';
    renderer.render(scene,camera);
   },dispose
  };
 }catch(error){dispose();throw error;}
}
