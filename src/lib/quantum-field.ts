// Keep the reading backdrop independent of Three.js's full renderer and shader library.
import {Color} from 'three/src/math/Color.js';
import {Matrix4} from 'three/src/math/Matrix4.js';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera.js';

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
  // Same linear-to-sRGB transfer as the original Three.js shader.
 gl_FragColor.rgb=mix(pow(gl_FragColor.rgb,vec3(.41666))*1.055-vec3(.055),gl_FragColor.rgb*12.92,vec3(lessThanEqual(gl_FragColor.rgb,vec3(.0031308))));
 }
`;

/** The same two passes, buffers and camera, without a general-purpose scene renderer. */
export async function createQuantumField(canvas:HTMLCanvasElement,signal:AbortSignal):Promise<QuantumField>{
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power',premultipliedAlpha:true});
 if(!gl)throw new Error('WebGL is unavailable');
 const buffers:WebGLBuffer[]=[],shaders:WebGLShader[]=[];
 let program:WebGLProgram|null=null,disposed=false;
 const dispose=()=>{
  if(disposed)return;disposed=true;signal.removeEventListener('abort',dispose);
  buffers.forEach(buffer=>gl.deleteBuffer(buffer));shaders.forEach(shader=>gl.deleteShader(shader));if(program)gl.deleteProgram(program);
 };
 signal.addEventListener('abort',dispose,{once:true});
 try{
  const compile=(type:number,source:string)=>{
   const shader=gl.createShader(type);if(!shader)throw new Error('Cannot allocate background shader');shaders.push(shader);
   gl.shaderSource(shader,'precision highp float;\n'+source);gl.compileShader(shader);
   if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Cannot compile background shader');return shader;
  };
  program=gl.createProgram();if(!program)throw new Error('Cannot allocate background program');
  gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec3 position;uniform mat4 modelViewMatrix,projectionMatrix;\n'+vertexShader));
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentShader));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Cannot link background program');
  gl.useProgram(program);gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  const names=['uTime','uRatio','uReduced','uLine','uBounds','uPointer','uBlue','uSilver','modelViewMatrix','projectionMatrix'];
  const uniform=Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(program!,name)]));
  const position=gl.getAttribLocation(program,'position'),seed=gl.getAttribLocation(program,'aSeed');
  gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(seed);
  for(const [name,hex] of [['uBlue','#426997'],['uSilver','#a4b5c9']]){const color=new Color(hex);gl.uniform3f(uniform[name],color.r,color.g,color.b);}
  type Pass={position:WebGLBuffer;seed:WebGLBuffer;count:number};
  const qualityBuffers=new Map<boolean,Pass[]>();
  const upload=(data:Float32Array)=>{const buffer=gl.createBuffer();if(!buffer)throw new Error('Cannot allocate background buffer');buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return buffer;};
  const geometry=(mobile:boolean)=>{
   let passes=qualityBuffers.get(mobile);if(passes)return passes;
   const current=quantumCurrents(mobile);
   passes=[{position:upload(current.positions),seed:upload(current.seeds),count:current.count},{position:upload(current.lines),seed:upload(current.lineSeeds),count:current.lineCount}];
   qualityBuffers.set(mobile,passes);return passes;
  };
  const camera=new PerspectiveCamera(46,1,.1,60),modelView=new Matrix4();
  const rotation=new Matrix4().makeRotationX(.16).multiply(new Matrix4().makeRotationY(-.13)).multiply(new Matrix4().makeRotationZ(-.04));
  let width=0,height=0,ratio=0,mobile=false,passes:Pass[]=[];
  return{
   resize(nextWidth,nextHeight,dpr){
    if(disposed)return;
    const w=Math.max(1,nextWidth),h=Math.max(1,nextHeight),quality=quantumQuality(w,h,dpr);
    if(width===w&&height===h&&ratio===quality.ratio)return;
    width=w;height=h;ratio=quality.ratio;mobile=quality.mobile;passes=geometry(mobile);
    canvas.width=Math.floor(width*ratio);canvas.height=Math.floor(height*ratio);gl.viewport(0,0,canvas.width,canvas.height);
    camera.aspect=width/height;camera.updateProjectionMatrix();
    const viewHeight=2*Math.tan(camera.fov*Math.PI/360)*18;
    gl.uniformMatrix4fv(uniform.projectionMatrix,false,camera.projectionMatrix.elements);
    gl.uniform2f(uniform.uBounds,viewHeight*camera.aspect*.62,viewHeight*.68);gl.uniform1f(uniform.uRatio,ratio);
   },
   render(time,x,y,scroll,reduced){
    if(disposed||!passes.length)return;
    if(gl.isContextLost())throw new Error('Background context lost');
    const px=reduced?0:Math.max(-1,Math.min(1,x)),py=reduced?0:Math.max(-1,Math.min(1,y));
    gl.uniform1f(uniform.uTime,Number.isFinite(time)?time:0);gl.uniform1f(uniform.uReduced,Number(reduced));gl.uniform2f(uniform.uPointer,px,py);
    camera.position.set(px*(mobile?.18:.5),py*.3,18+(reduced?0:Math.min(Math.max(scroll,0),8)*.07));
    camera.lookAt(0,0,0);camera.updateMatrixWorld();modelView.multiplyMatrices(camera.matrixWorldInverse,rotation);
    gl.uniformMatrix4fv(uniform.modelViewMatrix,false,modelView.elements);gl.clear(gl.COLOR_BUFFER_BIT);
    passes.forEach((pass,line)=>{
     gl.uniform1f(uniform.uLine,line);gl.bindBuffer(gl.ARRAY_BUFFER,pass.position);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
     gl.bindBuffer(gl.ARRAY_BUFFER,pass.seed);gl.vertexAttribPointer(seed,1,gl.FLOAT,false,0,0);gl.drawArrays(line?gl.LINES:gl.POINTS,0,pass.count);
    });
   },dispose,
  };
 }catch(error){dispose();throw error;}
}
