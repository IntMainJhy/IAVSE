import {BufferGeometry,Color,Float32BufferAttribute,LineSegments,MathUtils,PerspectiveCamera,Points,Scene,ShaderMaterial,SRGBColorSpace,Vector2,WebGLRenderer} from 'three';

export type QuantumField={resize:(width:number,height:number,dpr:number)=>void;render:(time:number,x:number,y:number,scroll:number,reduced:boolean)=>void;dispose:()=>void};
export const quantumQuality=(width:number,height:number,dpr:number)=>({
 mobile:width<768,
 ratio:Math.min(Math.max(.5,dpr||1),1.5,Math.sqrt((width<768?650000:1400000)/(Math.max(1,width)*Math.max(1,height)))),
});

/** Parametric strands rather than a flat grid. Both resolutions follow the same three currents. */
export function quantumCurrents(mobile=false){
 const strands=mobile?12:18,samples=mobile?100:192,bands=3,count=strands*samples*bands;
 const positions=new Float32Array(count*3),seeds=new Float32Array(count);
 let index=0;
 for(let band=0;band<bands;band++)for(let strand=0;strand<strands;strand++)for(let sample=0;sample<samples;sample++){
  positions[index*3]=(sample+strand*.31)/(samples-1);
  positions[index*3+1]=strand/(strands-1)*2-1;
  positions[index*3+2]=band-1;
  const noise=Math.sin(index*127.1+31.7)*43758.5453;
  seeds[index]=noise-Math.floor(noise);index++;
 }
 const lineStrands=mobile?4:7,lineSamples=mobile?64:96,lineCount=bands*lineStrands*lineSamples*2;
 const lines=new Float32Array(lineCount*3),lineSeeds=new Float32Array(lineCount);index=0;
 for(let band=0;band<bands;band++)for(let strand=0;strand<lineStrands;strand++)for(let sample=0;sample<lineSamples;sample++)for(let end=0;end<2;end++){
  lines[index*3]=(sample+end)/lineSamples;
  lines[index*3+1]=strand/(lineStrands-1)*2-1;
  lines[index*3+2]=band-1;lineSeeds[index]=strand/lineStrands;index++;
 }
 return{positions,seeds,count,lines,lineSeeds,lineCount};
}

const vertexShader=`
 uniform float uTime,uRatio,uReduced,uLine;uniform vec2 uBounds,uPointer;
 attribute float aSeed;varying float vAlpha,vSilver;
 void main(){
  float t=uTime*(1.-uReduced),band=position.z,strand=position.y;
  // The point phase travels along the same continuous curves as the fine wires.
  float phase=mix(fract(position.x+t*(.012+band*.002)),position.x,uLine);
  float along=phase*2.8-1.4;
  float bend=sin(along*2.05+band*.72+t*.075);
  float breadth=.065+.075*(.5+.5*cos(along*2.4+band));
  vec3 p=vec3(along,
   along*.37+bend*.27+band*.64+strand*breadth,
   sin(along*1.8+band*1.6)*2.2+cos(strand*1.7+along)*.6+band*.75);
  p.y+=sin(along*3.1-strand*.45+t*.12)*.045;
  p.xy*=uBounds;
  vec2 delta=p.xy-uPointer*uBounds*.82;
  float influence=exp(-dot(delta,delta)*.09)*(1.-uReduced);
  p.z+=influence*(.75+sin(length(delta)*.8-t*.5)*.15);
  vec4 view=modelViewMatrix*vec4(p,1.);vec4 clip=projectionMatrix*view;
  vec2 screen=clip.xy/clip.w;
  float edges=smoothstep(.12,.86,abs(screen.x));
  float depth=clamp(19./-view.z,.65,1.35);
  float endFade=smoothstep(0.,.12,phase)*smoothstep(0.,.12,1.-phase);
  float clarity=mix(.26,.78,edges)*endFade;
  vAlpha=clarity*depth*mix(.78+.22*aSeed,.32,uLine);
  vSilver=clamp((p.z+3.)*.13+aSeed*.2,0.,1.);
  gl_Position=clip;
  gl_PointSize=clamp((1.35+aSeed*.65+influence*.5)*uRatio*depth,1.,4.1);
 }
`;
const fragmentShader=`
 uniform vec3 uBlue,uSilver;uniform float uLine;varying float vAlpha,vSilver;
 void main(){
  float coverage=1.;
  if(uLine<.5){float radius=length(gl_PointCoord-.5);coverage=1.-smoothstep(.2,.5,radius);if(coverage<.01)discard;}
  gl_FragColor=vec4(mix(uBlue,uSilver,vSilver*.65),vAlpha*coverage);
  #include <colorspace_fragment>
 }
`;

/** Two transparent passes: traveling points and continuous filaments. No textures or post stack. */
export async function createQuantumField(canvas:HTMLCanvasElement,signal:AbortSignal):Promise<QuantumField>{
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 let renderer:WebGLRenderer|undefined,disposed=false;
 const geometries:BufferGeometry[]=[],materials:ShaderMaterial[]=[];
 const dispose=()=>{
  if(disposed)return;disposed=true;signal.removeEventListener('abort',dispose);
  geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());renderer?.dispose();
 };
 try{
  renderer=new WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power',premultipliedAlpha:true});
  renderer.outputColorSpace=SRGBColorSpace;renderer.setClearColor(0x000000,0);
  const scene=new Scene(),camera=new PerspectiveCamera(46,1,.1,60);camera.position.z=18;
  for(const mobile of [false,true]){
   const current=quantumCurrents(mobile);
   for(const [positions,seeds] of [[current.positions,current.seeds],[current.lines,current.lineSeeds]]){
    const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));
    geometry.setAttribute('aSeed',new Float32BufferAttribute(seeds,1));geometries.push(geometry);
   }
  }
  for(const line of [0,1])materials.push(new ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,toneMapped:false,
   uniforms:{uTime:{value:0},uRatio:{value:1},uReduced:{value:0},uLine:{value:line},uBounds:{value:new Vector2(12,9)},uPointer:{value:new Vector2()},uBlue:{value:new Color('#426997')},uSilver:{value:new Color('#a4b5c9')}},vertexShader,fragmentShader}));
  const points=new Points(geometries[0],materials[0]),filaments=new LineSegments(geometries[1],materials[1]);
  for(const object of[points,filaments]){object.frustumCulled=false;object.rotation.set(.16,-.13,-.04);scene.add(object);}
  let width=0,height=0,ratio=0,mobile=false;
  signal.addEventListener('abort',dispose,{once:true});
  return{
   resize(nextWidth,nextHeight,dpr){
    if(disposed||!renderer)return;
    const w=Math.max(1,nextWidth),h=Math.max(1,nextHeight),quality=quantumQuality(w,h,dpr);
    if(width===w&&height===h&&ratio===quality.ratio)return;
    width=w;height=h;ratio=quality.ratio;mobile=quality.mobile;
    points.geometry=geometries[mobile?2:0];filaments.geometry=geometries[mobile?3:1];
    renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();
    const viewHeight=2*Math.tan(MathUtils.degToRad(camera.fov/2))*18;
    for(const material of materials){material.uniforms.uBounds.value.set(viewHeight*camera.aspect*.62,viewHeight*.68);material.uniforms.uRatio.value=ratio;}
   },
   render(time,x,y,scroll,reduced){
    if(disposed||!renderer)return;
    const px=reduced?0:MathUtils.clamp(x,-1,1),py=reduced?0:MathUtils.clamp(y,-1,1);
    for(const material of materials){material.uniforms.uTime.value=Number.isFinite(time)?time:0;material.uniforms.uReduced.value=Number(reduced);material.uniforms.uPointer.value.set(px,py);}
    camera.position.set(px*(mobile?.18:.5),py*.3,18+(reduced?0:Math.min(Math.max(scroll,0),8)*.07));
    camera.lookAt(0,0,0);renderer.render(scene,camera);
   },dispose,
  };
 }catch(error){dispose();throw error;}
}
