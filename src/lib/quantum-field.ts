import {BufferGeometry,Color,Float32BufferAttribute,MathUtils,PerspectiveCamera,Points,Scene,ShaderMaterial,SRGBColorSpace,Vector2,WebGLRenderer} from 'three';

export type QuantumField={resize:(width:number,height:number,dpr:number)=>void;render:(time:number,x:number,y:number,scroll:number,reduced:boolean)=>void;dispose:()=>void};
export const quantumQuality=(width:number,height:number,dpr:number)=>({
 mobile:width<768,
 ratio:Math.min(Math.max(.5,dpr||1),1.5,Math.sqrt((width<768?650000:1400000)/(Math.max(1,width)*Math.max(1,height)))),
});

/** Both quality levels cover the same volume; the phone uses fewer points. */
export function quantumLattice(mobile=false){
 const columns=mobile?28:72,rows=mobile?44:48,positions=new Float32Array(columns*rows*3),seeds=new Float32Array(columns*rows);
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
  const index=row*columns+column,x=column/(columns-1)*2-1,y=row/(rows-1)*2-1;
  positions[index*3]=x;positions[index*3+1]=y;positions[index*3+2]=Math.sin(x*2.8)*1.8+Math.cos(y*3.2)*1.15;
  seeds[index]=(Math.sin(index*127.1+31.7)*43758.5453)%1;
 }
 return{positions,seeds,count:columns*rows};
}

const vertexShader=`
 uniform float uTime,uRatio,uReduced;uniform vec2 uBounds,uPointer;
 attribute float aSeed;varying float vAlpha,vSilver;
 void main(){
  vec3 p=position;p.xy*=uBounds;
  float t=uTime*(1.-uReduced);
  // Broad bends make the ordered rows read as a continuous spatial sheet.
  p.x+=sin(position.y*2.2+position.x*.65)*.65;
  p.y+=sin(position.x*2.4)*.5;
  float wave=sin(p.x*.42+t*.24)*.85+cos(p.y*.54-t*.19)*.55;
  p.z+=wave;
  vec2 delta=p.xy-uPointer*uBounds*.78;
  float influence=exp(-dot(delta,delta)*.16)*(1.-uReduced);
  p.z+=influence*(.58+sin(length(delta)*1.5-t*.7)*.16);
  vec4 view=modelViewMatrix*vec4(p,1.);vec4 clip=projectionMatrix*view;
  vec2 screen=clip.xy/clip.w;
  float edges=smoothstep(.05,.78,abs(screen.x));
  float distanceFade=clamp(20./-view.z,.65,1.2);
  vAlpha=(.14+edges*.30+influence*.12)*distanceFade;
  vSilver=clamp(abs(aSeed),0.,1.);
  gl_Position=clip;
  gl_PointSize=clamp((1.45+edges*.55+influence*.35)*uRatio*distanceFade,1.,3.8);
 }
`;
const fragmentShader=`
 uniform vec3 uBlue,uSilver;varying float vAlpha,vSilver;
 void main(){
  float radius=length(gl_PointCoord-.5);
  float coverage=1.-smoothstep(.26,.5,radius);
  if(coverage<.01)discard;
  gl_FragColor=vec4(mix(uBlue,uSilver,vSilver*.55),vAlpha*coverage);
  #include <colorspace_fragment>
 }
`;

/** A single transparent points pass. No model, texture, lighting or post stack. */
export async function createQuantumField(canvas:HTMLCanvasElement,signal:AbortSignal):Promise<QuantumField>{
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 let renderer:WebGLRenderer|undefined,material:ShaderMaterial|undefined,disposed=false;
 const geometries:BufferGeometry[]=[];
 const dispose=()=>{
  if(disposed)return;disposed=true;signal.removeEventListener('abort',dispose);
  geometries.forEach(geometry=>geometry.dispose());material?.dispose();renderer?.dispose();
 };
 try{
  renderer=new WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power',premultipliedAlpha:true});
  renderer.outputColorSpace=SRGBColorSpace;renderer.setClearColor(0x000000,0);
  const scene=new Scene(),camera=new PerspectiveCamera(46,1,.1,60);camera.position.z=18;
  for(const mobile of [false,true]){
   const lattice=quantumLattice(mobile),geometry=new BufferGeometry();
   geometry.setAttribute('position',new Float32BufferAttribute(lattice.positions,3));
   geometry.setAttribute('aSeed',new Float32BufferAttribute(lattice.seeds,1));geometries.push(geometry);
  }
  material=new ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,toneMapped:false,
   uniforms:{uTime:{value:0},uRatio:{value:1},uReduced:{value:0},uBounds:{value:new Vector2(12,9)},uPointer:{value:new Vector2()},uBlue:{value:new Color('#53729d')},uSilver:{value:new Color('#8c9eb4')}},vertexShader,fragmentShader});
  const points=new Points(geometries[0],material);points.frustumCulled=false;points.rotation.set(.42,-.2,.035);scene.add(points);
  let width=0,height=0,ratio=0,mobile=false;
  signal.addEventListener('abort',dispose,{once:true});
  return{
   resize(nextWidth,nextHeight,dpr){
    if(disposed||!renderer||!material)return;
    const w=Math.max(1,nextWidth),h=Math.max(1,nextHeight),quality=quantumQuality(w,h,dpr);
    if(width===w&&height===h&&ratio===quality.ratio)return;
    width=w;height=h;ratio=quality.ratio;mobile=quality.mobile;
    points.geometry=geometries[mobile?1:0];
    renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();
    const viewHeight=2*Math.tan(MathUtils.degToRad(camera.fov/2))*18;
    material.uniforms.uBounds.value.set(viewHeight*camera.aspect*.69,viewHeight*.68);
    material.uniforms.uRatio.value=ratio;
   },
   render(time,x,y,scroll,reduced){
    if(disposed||!renderer||!material)return;
    const px=reduced?0:MathUtils.clamp(x,-1,1),py=reduced?0:MathUtils.clamp(y,-1,1);
    material.uniforms.uTime.value=Number.isFinite(time)?time:0;material.uniforms.uReduced.value=Number(reduced);
    material.uniforms.uPointer.value.set(px,py);
    camera.position.set(px*(mobile?.12:.4),py*.22,18+(reduced?0:Math.min(Math.max(scroll,0),8)*.035));
    camera.lookAt(0,0,0);renderer.render(scene,camera);
   },dispose,
  };
 }catch(error){dispose();throw error;}
}
