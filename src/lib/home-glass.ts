import {ACESFilmicToneMapping,BackSide,Box3,BufferGeometry,Color,DataTexture,Float32BufferAttribute,FrontSide,Frustum,Group,LinearFilter,LinearSRGBColorSpace,MathUtils,Matrix4,Mesh,MeshBasicMaterial,MeshPhysicalMaterial,NoToneMapping,PerspectiveCamera,PlaneGeometry,PMREMGenerator,Points,REVISION,RGBAFormat,Scene,ShaderChunk,ShaderMaterial,SphereGeometry,Vector2,Vector3,WebGLRenderer,WebGLRenderTarget} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {homePixelBudget} from './home-render-budget';

export type GlassReveal={left:number;top:number;width:number;height:number;progress:number;variant?:string};
export type HomeJourneyChapter={id:string;start:number;end:number;side:number};
export type HomeGlassScene={animated?:boolean;interactive?:boolean;resize:(width:number,height:number,dpr:number)=>void;setReveals?:(panels:GlassReveal[])=>void;setJourney?:(chapters:HomeJourneyChapter[])=>void;render:(x:number,y:number,dark:boolean,scroll:number,reduced:boolean,activeSeconds?:number)=>void;dispose:()=>void};
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
 const extraGeometry:BufferGeometry[]=[],extraMaterials:(ShaderMaterial|MeshBasicMaterial)[]=[];
 const dispose=()=>{if(disposed)return;disposed=true;signal.removeEventListener('abort',dispose);disposeModel(model);environment?.dispose();extraGeometry.forEach(value=>value.dispose());extraMaterials.forEach(value=>value.dispose());renderer.dispose();};
 try{
  // First-use debug queries can synchronously drain the GPU queue while scrolling.
  // Production validates links after asynchronous warmup instead; development keeps diagnostics.
  if(process.env.NODE_ENV==='production')renderer.debug.checkShaderErrors=false;
  renderer.outputColorSpace='srgb';renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  const scene=new Scene(),camera=new PerspectiveCamera(40,1,.1,100),surface=new Group();surface.name='iavse-optical-field';camera.position.z=8.2;surface.add(model);scene.add(surface);
  const modelBounds=new Box3().setFromObject(model),visibleBounds=new Box3(),frustum=new Frustum(),viewProjection=new Matrix4();
  const sunDirection=(mobile?new Vector3(-.20019,.88476,.42085):new Vector3(.23379,.79313,.56239)).normalize();
  const opticalTime={value:0},opticalFade={value:1},opticalLeft={value:-.73},opticalSunX={value:mobile?.36:.78},opticalSunDirection={value:new Vector3()};
  const nativeMaterials=new Set<MeshPhysicalMaterial>();
  model.traverse(node=>{if(!(node instanceof Mesh))return;for(const material of Array.isArray(node.material)?node.material:[node.material]){
   if(!(material instanceof MeshPhysicalMaterial))continue;
   nativeMaterials.add(material);const edge=material.name.includes('PolishedRolledEdge');material.side=FrontSide;material.color.set('#ffffff');material.toneMapped=false;material.transmission=1;material.ior=edge?1.5:1.46;material.thickness=edge?.42:.58;material.roughness=edge?.010:.014;material.dispersion=edge?.8:.26;material.metalness=0;material.opacity=1;material.attenuationColor.set('#e9f4ff');material.attenuationDistance=24;material.iridescence=0;material.clearcoat=0;
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
  const wallMaterial=new ShaderMaterial({depthWrite:false,toneMapped:false,uniforms:{uScroll:{value:0},uTime:{value:0},uBrightness:{value:1},uJourney:{value:0},uLensPosition:{value:new Vector2(.8,.5)},uBlueTop:{value:new Color('#0b1936')},uBlueMiddle:{value:new Color('#204d91')},uBlueBottom:{value:new Color('#a0b8d5')},uIce:{value:new Color('#f4f7fb')}},vertexShader:`
   varying vec4 vReceiverClip;
   void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);vReceiverClip=gl_Position;}
  `,fragmentShader:`
   varying vec4 vReceiverClip;uniform float uScroll;uniform float uTime;uniform float uBrightness;uniform float uJourney;uniform vec2 uLensPosition;uniform vec3 uBlueTop;uniform vec3 uBlueMiddle;uniform vec3 uBlueBottom;uniform vec3 uIce;
   float softField(vec2 p,vec2 center,vec2 radius){vec2 d=(p-center)/radius;return exp(-dot(d,d));}
   void main(){
    vec2 uv=vReceiverClip.xy/vReceiverClip.w*.5+.5;float documentY=max(0.,1.-uv.y+uScroll);
    vec3 color=mix(uBlueTop,uBlueMiddle,smoothstep(0.,.70,documentY));
    color=mix(color,uBlueBottom,smoothstep(.62,1.06,documentY));
    color=mix(color,uIce,smoothstep(.82,1.20,documentY));
    vec2 field=vec2(uv.x,documentY);float breathing=sin(uTime*.23)*.018;
    float silver=softField(field,vec2(-.04,.96+breathing),vec2(.34,.26))+softField(field,vec2(1.07,.98-breathing),vec2(.38,.28));
    color=mix(color,uIce,clamp(silver*.38,0.,.54)*(1.-smoothstep(1.,1.2,documentY)));
    float blueDepth=softField(field,vec2(.58,.49),vec2(.56,.25));
    color=mix(color,uBlueMiddle,blueDepth*.20*(1.-smoothstep(.8,1.1,documentY)));
    float galleryDepth=softField(uv,uLensPosition,vec2(.78,.60));
    float galleryEdge=softField(uv,vec2(.08+sin(uTime*.10)*.08,.14),vec2(.40,.52));
    vec3 gallery=mix(uIce,uBlueBottom,galleryDepth*.28+galleryEdge*.12);
    color=mix(color,gallery,uJourney);
    color*=uBrightness;gl_FragColor=vec4(color,1.);
    #include <colorspace_fragment>
   }
  `});extraMaterials.push(wallMaterial);const wall=new Mesh(wallGeometry,wallMaterial);wall.name='iavse-refraction-receiver';wall.position.z=-7;wall.renderOrder=-10;scene.add(wall);
  // Two interleaved optical veils share one GPU draw. Dense micro-points
  // reveal the folds instead of isolated dots; no per-frame buffer uploads.
  const fieldGeometry=new BufferGeometry(),fieldPositions:number[]=[],columns=mobile?42:72,rows=mobile?24:42,layers=2;
  for(let layer=0;layer<layers;layer++)for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
   fieldPositions.push(column/(columns-1)*2-1,row/(rows-1),layer);
  }
  fieldGeometry.setAttribute('position',new Float32BufferAttribute(fieldPositions,3));extraGeometry.push(fieldGeometry);
  const fieldMaterial=new ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uTime:opticalTime,uOpacity:{value:0},uDensity:{value:1},uStage:{value:0},uAspect:{value:1},uPointer:{value:new Vector2()},uTravel:{value:0}},vertexShader:`
   uniform float uTime;uniform float uDensity;uniform float uStage;uniform float uAspect;uniform vec2 uPointer;uniform float uTravel;
   varying float vDepth;varying float vHighlight;varying vec2 vScreen;
   void main(){
    float layer=position.z;float z=position.y*13.-7.-layer*1.4;float phase=uStage*.72+layer*1.8;
    float wave=sin(position.x*3.5+z*.48+uTime*.28+phase)*(.70+layer*.12);
    wave+=cos(z*.67-uTime*.19+phase)*.25;
    vec3 p=vec3(position.x*(7.5+uAspect*1.7),-2.65+layer*1.75+wave,z);
    // Each chapter changes the fold and the camera's relationship to its depth.
    p.x+=sin(position.y*3.1+phase)*.48;
    p.y+=sin(position.x*2.2-phase)*.24+uTravel*.12;
    vec2 delta=p.xy-vec2(uPointer.x*5.,uPointer.y*3.);
    float influence=exp(-dot(delta,delta)*.35);
    p.xy+=delta*influence*.16;p.z+=influence*.65;
    vec4 view=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*view;
    vScreen=gl_Position.xy/gl_Position.w*.5+.5;
    vDepth=1.-smoothstep(5.,17.,-view.z);
    vHighlight=pow(.5+.5*sin(position.x*2.6+z*.66+phase-uTime*.42),3.);
    gl_PointSize=clamp(20./max(1.,-view.z),1.25,3.)*uDensity;
   }
  `,fragmentShader:`
   uniform float uOpacity;varying float vDepth;varying float vHighlight;varying vec2 vScreen;
   void main(){
    float radius=length(gl_PointCoord-.5);float circle=1.-smoothstep(.28,.5,radius);
    // Keep the optical field at the bottom/perimeter, outside the reading area.
    float perimeter=max(1.-smoothstep(.16,.50,vScreen.y),smoothstep(.42,.93,abs(vScreen.x-.5)*2.));
    float alpha=circle*uOpacity*perimeter*(.42+vDepth*.32+vHighlight*.26);
    if(alpha<.008)discard;
    vec3 ink=mix(vec3(.08,.17,.33),vec3(.29,.48,.73),vHighlight);
    gl_FragColor=vec4(ink,alpha);
    #include <colorspace_fragment>
   }
  `});extraMaterials.push(fieldMaterial);
  const field=new Points(fieldGeometry,fieldMaterial);field.name='iavse-journey-depth';field.frustumCulled=false;field.visible=false;scene.add(field);
  type JourneyKey=HomeJourneyChapter&{index:number;center:number;x:number;camera:number};
  let chapters:JourneyKey[]=[],resourceDock=false,width=1,height=1,readingMode=false,heroDensity=1,readingDensity=1,qualityRatio=1,pixelBudget=1,appliedDensity=0;
  const setJourney=(input:HomeJourneyChapter[])=>{
   chapters=input.filter(chapter=>Number.isFinite(chapter.start)&&Number.isFinite(chapter.end)&&chapter.end>chapter.start).sort((a,b)=>a.start-b.start).map((chapter,index)=>({
    ...chapter,index,center:Math.max(.95,(chapter.start+chapter.end)*.5-.5),
    x:chapter.id==='invitation'?0:-Math.sign(chapter.side||1)*.98,
    camera:chapter.id==='editor'?7.5:chapter.id==='skills'?8.5:chapter.id==='resources'?8.45:chapter.id==='invitation'?9.4:8.15
   }));
  };
  const diagnostic=(name:string,value:string)=>{if(canvas.dataset[name]!==value)canvas.dataset[name]=value;};
  const applyDensity=(density:number,force=false)=>{
   const next=Math.min(density*qualityRatio,pixelBudget);
   if(!force&&Math.abs(appliedDensity-next)<.005)return;
   appliedDensity=next;renderer.setDrawingBufferSize(width,height,next);
   fieldMaterial.uniforms.uDensity.value=Math.min(next,1.5);
   diagnostic('glassDensity',next.toFixed(2));
  };
  let lastDiagnosticTime=-1;
  canvas.dataset.glassFilter=transmission?'linear-mip-r187':'three-default';canvas.dataset.glassModel=mobile?'mobile':'desktop';canvas.dataset.glassDesign='sunlit-meniscus-4';
  signal.addEventListener('abort',dispose,{once:true});if(signal.aborted){dispose();throw new DOMException('Aborted','AbortError');}
  // Shader compilation is asynchronous where supported; semantic HTML never
  // waits for this promise. Warm the fade variant as well, then restore the
  // accepted first-frame sorting before the scene is handed to the controller.
  if(typeof renderer.compileAsync==='function'){
   const compile=async(input:Scene|Group=scene)=>{
    if(signal.aborted||disposed)throw new DOMException('Aborted','AbortError');
    let abort=()=>{};
    try{
     await Promise.race([renderer.compileAsync(input,camera),new Promise<never>((_,reject)=>{
      abort=()=>reject(new DOMException('Aborted','AbortError'));signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();
     })]);
    }finally{signal.removeEventListener('abort',abort);}
    if(signal.aborted||disposed)throw new DOMException('Aborted','AbortError');
    const gl=renderer.getContext();
    for(const program of renderer.info.programs||[])if(!gl.getProgramParameter(program.program as WebGLProgram,gl.LINK_STATUS))throw new Error('Optical shader unavailable');
   };
   field.visible=true;
   try{await compile();}finally{field.visible=false;}
   const initial=Array.from(nativeMaterials,material=>({material,transparent:material.transparent,depthWrite:material.depthWrite,opacity:material.opacity}));
   try{
    for(const {material} of initial){material.transparent=true;material.depthWrite=false;material.opacity=.92;material.needsUpdate=true;}
    await compile();
   }finally{
    for(const {material,transparent,depthWrite,opacity} of initial){material.transparent=transparent;material.depthWrite=depthWrite;material.opacity=opacity;material.needsUpdate=true;}
   }
   // Three's transmission capture uses a linear target. Its receiver is a
   // distinct program from the sRGB screen receiver, even with the same material.
   const receiver=new Group().add(wall.clone()),target=new WebGLRenderTarget(1,1),previousTarget=renderer.getRenderTarget(),previousTone=renderer.toneMapping;
   target.texture.colorSpace=LinearSRGBColorSpace;
   try{renderer.setRenderTarget(target);renderer.toneMapping=NoToneMapping;await compile(receiver);}
   finally{renderer.setRenderTarget(previousTarget);renderer.toneMapping=previousTone;target.dispose();}
  }
  if(signal.aborted||disposed){dispose();throw new DOMException('Aborted','AbortError');}
  onProgress?.(1);
  return{
   get animated(){return !disposed&&(surface.visible||field.visible);},
   get interactive(){return !disposed&&(surface.visible||field.visible);},
   // The new optical field leaves semantic HTML undistorted; no extra sheets over content.
   setReveals(){},
   setJourney,
   resize(nextWidth,nextHeight,dpr){
    if(disposed)return;width=Math.max(1,nextWidth);height=Math.max(1,nextHeight);const mobile=width<768;
    pixelBudget=Math.sqrt(homePixelBudget(width)/(width*height));
    const displayDpr=typeof window!=='undefined'?Math.min(window.devicePixelRatio||1,2,pixelBudget):Math.max(1,dpr);qualityRatio=Math.min(1,dpr/Math.max(.1,displayDpr));
    heroDensity=Math.min(displayDpr,mobile?1.5:2);readingDensity=Math.min(displayDpr,mobile?1:1.25);
    applyDensity(readingMode?readingDensity:heroDensity,true);fieldMaterial.uniforms.uAspect.value=width/height;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.transmissionResolutionScale=readingMode?(mobile?.35:.5):(mobile?.5:.55);
   },
   render(x,y,dark,scroll,reduced,activeSeconds=0){
    if(disposed)return;
    const time=reduced?0:Math.max(0,Number.isFinite(activeSeconds)?activeSeconds:0),spatial=reduced?0:MathUtils.smootherstep(scroll,0,1.3),sweep=reduced?0:MathUtils.smootherstep(scroll,0,.95),intro=reduced?1:MathUtils.smootherstep(time,0,2.4),drift=reduced?0:Math.cos(time*.22)*.06;
    const first=chapters[0],last=chapters[chapters.length-1],journeyMix=!reduced&&first?MathUtils.smootherstep(scroll,.65,Math.max(1.15,first.center)):0;
    let a=first,b=first,linear=0,blend=0;
    if(first){
     a=b=last;
     for(let index=1;index<chapters.length;index++)if(scroll<chapters[index].center){a=chapters[index-1];b=chapters[index];linear=MathUtils.clamp((scroll-a.center)/Math.max(.01,b.center-a.center),0,1);blend=linear*linear*(3-2*linear);break;}
     if(scroll<=first.center)a=b=first;
    }
    const chapter=linear<.5?a:b,travel=a&&a!==b?Math.sin(linear*Math.PI):0;
    // Chapter bounds are document positions: the viewport reaches a section's
    // bottom at end - 1. Retire before that reachable endpoint, including when
    // the final invitation is shorter than a viewport, and reverse on scroll up.
    const journeyEnd=last?Math.max(.95,last.end-1):0;
    const journeyEnvelope=last?1-MathUtils.smoothstep(scroll,Math.max(.65,journeyEnd-.55),journeyEnd):0;
    const heroOpacity=1-MathUtils.smoothstep(scroll,.78,1.38);
    const opacity=heroOpacity;
    camera.position.set(0,0,8.2+(1-intro)*.65+spatial*.35);camera.rotation.set(0,0,0);
    const viewHeight=2*Math.tan(MathUtils.degToRad(camera.fov/2))*8.2;
    surface.scale.set(viewHeight*(width<768?Math.max(camera.aspect,.9):camera.aspect)*.5,viewHeight*.5,viewHeight*.32);
    surface.position.set(reduced?0:x*.04,(reduced?0:y*.022)+drift-spatial*.24,0);
    surface.rotation.set(reduced?0:y*.025,reduced?0:-x*.045+Math.sin(time*.2+.9)*.075+sweep*.055,reduced?0:drift*.45+sweep*.018);
    resourceDock=false;
    if(journeyMix>.0001&&a&&b){
     const mix=(start:number,end:number)=>MathUtils.lerp(start,end,blend),positionX=mix(a.x,b.x);
     // The approved lens belongs only to the opening shot. Its exit reveals
     // the spatial point sheet; it never becomes a giant object behind text.
     resourceDock=chapter.id==='resources'&&journeyMix>.95;
     camera.position.x=positionX*.12*journeyMix;camera.position.y=travel*.08*journeyMix;
     camera.position.z=MathUtils.lerp(camera.position.z,mix(a.camera,b.camera)-travel*.45,journeyMix);
     camera.rotation.y=Math.sin(linear*Math.PI)*.025*Math.sign(b.x-a.x)*journeyMix;
     fieldMaterial.uniforms.uStage.value=mix(a.index,b.index);
     diagnostic('journeyChapter',chapter.id);diagnostic('journeyPhase',MathUtils.clamp((scroll-chapter.start+.8)/Math.max(.01,chapter.end-chapter.start+1.3),0,1).toFixed(2));
    }else{surface.position.z=0;diagnostic('journeyChapter','hero');diagnostic('journeyPhase',MathUtils.clamp(scroll/1.3,0,1).toFixed(2));}
    const nextReadingMode=journeyMix>.35;
    if(nextReadingMode!==readingMode){readingMode=nextReadingMode;applyDensity(readingMode?readingDensity:heroDensity);}
    camera.updateMatrixWorld();surface.updateMatrixWorld(true);
    frustum.setFromProjectionMatrix(viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));visibleBounds.copy(modelBounds).applyMatrix4(surface.matrixWorld);
    surface.visible=opacity>.001&&frustum.intersectsBox(visibleBounds);
    scene.environmentRotation.set(.08+journeyMix*.08,.15+sweep*.34+(reduced?0:Math.sin(time*.23+.4)*.38)+journeyMix*(scroll*.12),0);scene.environmentIntensity=1;
    wallMaterial.uniforms.uScroll.value=scroll;wallMaterial.uniforms.uTime.value=time;wallMaterial.uniforms.uBrightness.value=dark?.99:1;
    wallMaterial.uniforms.uJourney.value=journeyMix*journeyEnvelope;wallMaterial.uniforms.uLensPosition.value.set(.5+surface.position.x/(viewHeight*camera.aspect),.5+surface.position.y/viewHeight);
    fieldMaterial.uniforms.uOpacity.value=journeyMix*journeyEnvelope*.72;
    field.visible=fieldMaterial.uniforms.uOpacity.value>.001&&!reduced;
    fieldMaterial.uniforms.uPointer.value.set(reduced?0:x,reduced?0:y);fieldMaterial.uniforms.uTravel.value=travel;
    diagnostic('journeyFieldVisible',field.visible?'true':'false');diagnostic('journeyFieldCount',String(columns*rows*layers));
    opticalTime.value=time;opticalFade.value=opacity;opticalLeft.value=width<768?-.35:-.73;
    opticalSunX.value=(width<768?.36:.78)+(scene.environmentRotation.y-.487)*(width<768?.30:.37);opticalSunDirection.value.copy(sunDirection).applyEuler(scene.environmentRotation).transformDirection(camera.matrixWorldInverse);
    for(const material of nativeMaterials){material.envMapRotation.copy(scene.environmentRotation);material.opacity=opacity;const alpha=opacity<.999;if(material.transparent!==alpha){material.transparent=alpha;material.depthWrite=!alpha;material.needsUpdate=true;}}
    renderer.transmissionResolutionScale=surface.visible?(readingMode?(resourceDock?.28:width<768?.35:.5):(width<768?.5:.55)):.12;
    diagnostic('glassHeroVisible',surface.visible?'true':'false');diagnostic('glassDispersion','.26');diagnostic('journeyDocked',resourceDock?'true':'false');
    if(reduced||time<lastDiagnosticTime||time-lastDiagnosticTime>=.099){lastDiagnosticTime=time;diagnostic('glassTime',time.toFixed(1));diagnostic('glassLightPhase',sweep.toFixed(3));diagnostic('glassReading',spatial.toFixed(3));}
    renderer.render(scene,camera);
   },dispose
  };
 }catch(error){dispose();throw error;}
}
