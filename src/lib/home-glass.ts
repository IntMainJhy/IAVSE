import {ACESFilmicToneMapping,Color,DataTexture,DirectionalLight,FrontSide,Group,LinearFilter,MathUtils,Mesh,MeshBasicMaterial,MeshPhysicalMaterial,PerspectiveCamera,PlaneGeometry,PMREMGenerator,REVISION,RGBAFormat,Scene,ShaderChunk,ShaderMaterial,WebGLRenderer} from 'three';
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
  const nativeMaterials=new Set<MeshPhysicalMaterial>();
  model.traverse(node=>{if(!(node instanceof Mesh))return;for(const material of Array.isArray(node.material)?node.material:[node.material]){
   if(!(material instanceof MeshPhysicalMaterial))continue;
   nativeMaterials.add(material);const edge=material.name.includes('PolishedRolledEdge');material.side=FrontSide;material.color.set('#ffffff');material.toneMapped=false;material.transmission=1;material.ior=edge?1.46:1.18;material.thickness=.045;material.roughness=edge?.075:.025;material.dispersion=edge?.65:.22;material.metalness=0;material.opacity=1;material.attenuationColor.set('#f8fbff');material.attenuationDistance=40;material.iridescence=edge?.10:0;material.iridescenceIOR=1.35;material.clearcoat=0;
   if(transmission){material.onBeforeCompile=shader=>{const include='#include <transmission_pars_fragment>';if(shader.fragmentShader.split(include).length===2)shader.fragmentShader=shader.fragmentShader.replace(include,transmission);};material.customProgramCacheKey=()=> 'iavse-thin-optical-r187';}
  }});
  // Large feathered softboxes are captured once, never drawn in the visible scene.
  const studio=new Scene();studio.background=new Color('#7997c0');studio.name='iavse-offscreen-studio';
  const panelGeometry=new PlaneGeometry(),panelMaterials:MeshBasicMaterial[]=[];
  const pixels=new Uint8Array(64*64*4);
  for(let row=0;row<64;row++)for(let column=0;column<64;column++){
   const x=(column+.5)/32-1,y=(row+.5)/32-1,l=Math.round(255*Math.pow(Math.max(0,1-x*x-y*y),2));pixels.set([l,l,l,255],(row*64+column)*4);
  }
  const diffuser=new DataTexture(pixels,64,64,RGBAFormat);diffuser.minFilter=diffuser.magFilter=LinearFilter;diffuser.needsUpdate=true;
  const panel=(name:string,position:number[],scale:number[],color:string,power:number)=>{const material=new MeshBasicMaterial({color:new Color(color).multiplyScalar(power),map:diffuser,toneMapped:false});panelMaterials.push(material);const mesh=new Mesh(panelGeometry,material);mesh.name=name;mesh.position.fromArray(position);mesh.scale.fromArray(scale);mesh.lookAt(0,0,0);studio.add(mesh);};
  panel('soft-silver-window',[4,5,4],[5,4,1],'#f2f7ff',12);
  panel('blue-bounce',[-5,0,3],[6,5,1],'#85b5ed',.6);
  panel('left-grazing-window',[-5,4,-4],[4,3,1],'#d3e6ff',12);
  panel('upper-soft-fill',[-1,6,-3],[7,4,1],'#ffffff',.45);
  const pmrem=new PMREMGenerator(renderer);
  try{environment=pmrem.fromScene(studio,.032);scene.environment=environment.texture;for(const material of nativeMaterials)if(material.name.includes('PolishedRolledEdge')){material.envMap=environment.texture;material.envMapIntensity=2.4;}}
  finally{panelGeometry.dispose();panelMaterials.forEach(value=>value.dispose());diffuser.dispose();pmrem.dispose();}
  const key=new DirectionalLight('#f3f7ff',.06);key.position.set(4,5,7);scene.add(key);
  const wallGeometry=new PlaneGeometry(80,52);extraGeometry.push(wallGeometry);
  const wallMaterial=new ShaderMaterial({depthWrite:false,toneMapped:false,uniforms:{uScroll:{value:0},uBrightness:{value:1},uBlueTop:{value:new Color('#17234e')},uBlueMiddle:{value:new Color('#376eb5')},uBlueBottom:{value:new Color('#a7c8e8')},uIce:{value:new Color('#f4f7fb')}},vertexShader:`
   varying vec2 vScreen;
   void main(){vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);vScreen=p.xy/p.w*.5+.5;gl_Position=p;}
  `,fragmentShader:`
   varying vec2 vScreen;uniform float uScroll;uniform float uBrightness;uniform vec3 uBlueTop;uniform vec3 uBlueMiddle;uniform vec3 uBlueBottom;uniform vec3 uIce;
   void main(){
    vec2 uv=vScreen;float documentY=max(0.,1.-uv.y+uScroll);
    vec3 color=mix(uBlueTop,uBlueMiddle,smoothstep(0.,.56,documentY));
    color=mix(color,uBlueBottom,smoothstep(.45,.78,documentY));
    color=mix(color,uIce,smoothstep(.70,1.04,documentY));
    float edge=pow(abs(uv.x-.5)*2.,2.);
    color*=1.-edge*.055*(1.-smoothstep(.45,1.1,documentY));
    color*=uBrightness;gl_FragColor=vec4(color,1.);
    #include <colorspace_fragment>
   }
  `});extraMaterials.push(wallMaterial);const wall=new Mesh(wallGeometry,wallMaterial);wall.name='iavse-refraction-receiver';wall.position.z=-7;wall.renderOrder=-10;scene.add(wall);
  let width=1,height=1;
  canvas.dataset.glassFilter=transmission?'linear-mip-r187':'three-default';canvas.dataset.glassModel=mobile?'mobile':'desktop';
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
    renderer.setPixelRatio(Math.min(density*quality,pixelBudget));renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.transmissionResolutionScale=mobile?.45:.6;
   },
   render(x,y,dark,scroll,reduced,activeSeconds=0){
    if(disposed)return;
    const time=reduced?0:Math.max(0,Number.isFinite(activeSeconds)?activeSeconds:0),spatial=reduced?0:MathUtils.smootherstep(scroll,0,1.3),sweep=reduced?0:MathUtils.smootherstep(scroll,0,.95),intro=reduced?1:MathUtils.smootherstep(time,0,1.5),drift=reduced?0:Math.sin(time*.22)*.007;
    const opacity=1-MathUtils.smoothstep(scroll,.78,1.38);surface.visible=opacity>.001;
    camera.position.set(0,0,8.2+(1-intro)*.18+spatial*.22);camera.rotation.set(0,0,0);
    const viewHeight=2*Math.tan(MathUtils.degToRad(camera.fov/2))*camera.position.z;
    surface.scale.set(viewHeight*camera.aspect*.5,viewHeight*.5,1);
    surface.position.set(reduced?0:x*.014,(reduced?0:y*.008)+drift-spatial*.24,0);
    surface.rotation.set(reduced?0:y*.008,reduced?0:-x*.012+sweep*.035,reduced?0:drift*.35+sweep*.018);
    scene.environmentRotation.set(.12,.18+sweep*.34+(reduced?0:Math.sin(time*.22)*.045),0);scene.environmentIntensity=.78;
    wallMaterial.uniforms.uScroll.value=scroll;wallMaterial.uniforms.uBrightness.value=dark?.99:1;
    for(const material of nativeMaterials){material.opacity=opacity;const alpha=opacity<.999;if(material.transparent!==alpha){material.transparent=alpha;material.depthWrite=!alpha;material.needsUpdate=true;}}
    renderer.transmissionResolutionScale=surface.visible?(width<768?.45:.6):.12;
    canvas.dataset.glassTime=time.toFixed(1);canvas.dataset.glassLightPhase=sweep.toFixed(3);canvas.dataset.glassReading=spatial.toFixed(3);canvas.dataset.glassDispersion='.22';canvas.dataset.glassHeroVisible=surface.visible?'true':'false';
    renderer.render(scene,camera);
   },dispose
  };
 }catch(error){dispose();throw error;}
}
