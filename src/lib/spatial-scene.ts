import {
 ACESFilmicToneMapping,BufferGeometry,Color,DirectionalLight,DynamicDrawUsage,
 Euler,Float32BufferAttribute,Fog,HemisphereLight,InstancedMesh,Matrix4,Mesh,
 MeshPhysicalMaterial,MeshStandardMaterial,PerspectiveCamera,PMREMGenerator,Quaternion,Scene,
 SRGBColorSpace,Vector3,WebGLRenderer,
} from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {yieldRenderSetup} from './render-setup';

export type SpatialMode='gallery'|'community';
export type SpatialFrame={time:number;x:number;y:number;scroll:number;reduced:boolean};
export type SpatialScene={
 resize(width:number,height:number,dpr:number):void;
 render(frame:SpatialFrame):void;
 dispose():void;
};

const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const finite=(value:number,fallback=0)=>Number.isFinite(value)?value:fallback;
const smooth=(value:number)=>{const t=clamp(value,0,1);return t*t*(3-2*t);};
const abortError=()=>new DOMException('Aborted','AbortError');

/** An actual folded surface: its valleys, silhouette and highlights share geometry. */
function foldedLandscape(quiet:boolean){
 const columns=80,rows=64,vertices=(columns+1)*(rows+1);
 const positions=new Float32Array(vertices*3),colors=new Float32Array(vertices*3);
 const indices=new Uint16Array(columns*rows*6);
 const pearl=new Color('#f4f2e9'),silver=new Color('#adbfc6'),sage=new Color('#c7d0c4');
 const color=new Color();let vertex=0,index=0;
 for(let row=0;row<=rows;row++){
  const z=-23+row/rows*37;
  for(let column=0;column<=columns;column++){
   const x=-23+column/columns*46,side=Math.sign(x),distance=Math.abs(x);
   const firstCenter=7.7+Math.sin(z*.17+side*.8)*1.35;
   const secondCenter=14+Math.cos(z*.13-side*.6)*2;
   const first=Math.exp(-Math.pow((distance-firstCenter)/2.65,2));
   const second=Math.exp(-Math.pow((distance-secondCenter)/3.05,2));
   const edge=smooth((distance-3.2)/6);
   const fold=first*(3.4+Math.sin(z*.19+side)*.9)+second*5.1;
   const y=-4.65+fold*(quiet?.79:1)+Math.sin(z*.36+distance*.49)*edge*.26;
   positions[vertex*3]=x;positions[vertex*3+1]=y;positions[vertex*3+2]=z;
   // Pigment sits in the outer folds; directional lighting describes their form.
   color.copy(pearl).lerp(silver,first*.18+second*.21).lerp(sage,second*.09);
   colors[vertex*3]=color.r;colors[vertex*3+1]=color.g;colors[vertex*3+2]=color.b;
   vertex++;
  }
 }
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
  const a=row*(columns+1)+column,b=a+1,c=a+columns+1,d=c+1;
  indices[index++]=a;indices[index++]=c;indices[index++]=b;
  indices[index++]=b;indices[index++]=c;indices[index++]=d;
 }
 const geometry=new BufferGeometry();
 geometry.setAttribute('position',new Float32BufferAttribute(positions,3));
 geometry.setAttribute('color',new Float32BufferAttribute(colors,3));
 geometry.setIndex(Array.from(indices));geometry.computeVertexNormals();geometry.computeBoundingSphere();
 return geometry;
}

type Island={x:number;y:number;z:number;w:number;h:number;d:number;rx:number;ry:number;rz:number;phase:number};

/** The first pieces define the composition; the remaining islands extend it into depth. */
function islandLayout(quiet:boolean):Island[]{
 const items:Island[]=[
  {x:-7.6,y:-.8,z:3.3,w:3.8,h:.05,d:1.75,rx:.46,ry:-.47,rz:-.18,phase:.2},
  {x:8.2,y:1.1,z:1.4,w:2.9,h:.047,d:1.45,rx:.65,ry:.49,rz:.18,phase:2.7},
  {x:-8.3,y:3.8,z:-4.2,w:2.4,h:.044,d:1.15,rx:.61,ry:-.3,rz:.16,phase:4.6},
  {x:7.5,y:-2.4,z:5.7,w:3.4,h:.052,d:1.7,rx:.31,ry:.37,rz:-.16,phase:1.5},
  {x:-5.4,y:-3.8,z:7.5,w:3,h:.049,d:1.35,rx:.27,ry:-.2,rz:.12,phase:3.9},
  {x:5.8,y:-3.9,z:4.3,w:2.4,h:.045,d:1.15,rx:.37,ry:.63,rz:-.11,phase:5.8},
 ];
 const count=quiet?12:24;
 for(let i=items.length;i<count;i++){
  const side=i%2===0?-1:1,seed=i*2.399963229728653;
  const depth=(i-6)/(count-6);
  items.push({
   x:side*(6.8+(Math.sin(seed)*.5+.5)*5.1),
   y:-2+(Math.cos(seed*1.47)*.5+.5)*6.4,
   z:1.5-depth*18+(Math.sin(seed*1.2)*.5+.5)*2.2,
   w:1.15+(Math.sin(seed*2.1)*.5+.5)*1.55,h:.039+(i%3)*.004,
   d:.55+(Math.cos(seed*1.6)*.5+.5)*.75,
   rx:.19+(Math.sin(seed*.7)*.5+.5)*.6,
   ry:side*(.22+Math.cos(seed*.91)*.48),rz:Math.sin(seed)*.22,phase:seed,
  });
 }
 if(quiet)for(const item of items){item.x=Math.sign(item.x)*Math.max(7.3,Math.abs(item.x))*1.13;item.w*=.62;item.d*=.7;item.y-=.6;}
 return items;
}

/** Owns GPU resources only. Its caller owns animation, visibility, input and scrolling. */
export async function createSpatialScene(canvas:HTMLCanvasElement,signal:AbortSignal,mode:SpatialMode):Promise<SpatialScene>{
 await yieldRenderSetup(signal);
 if(signal.aborted)throw abortError();
 const quiet=mode==='community';
 const renderer=new WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',stencil:false});
 const scene=new Scene(),camera=new PerspectiveCamera(42,1,.1,85);
 const geometries:BufferGeometry[]=[],materials:(MeshStandardMaterial|MeshPhysicalMaterial)[]=[];
 let islands:InstancedMesh|undefined,disposed=false;
 let environment:ReturnType<PMREMGenerator['fromScene']>|undefined;
 let lightRoom:RoomEnvironment|undefined,pmrem:PMREMGenerator|undefined;
 const disposeStudio=()=>{
  lightRoom?.traverse(object=>{if(object instanceof InstancedMesh)object.dispose();});
  lightRoom?.dispose();lightRoom=undefined;pmrem?.dispose();pmrem=undefined;
 };
 const dispose=()=>{
  if(disposed)return;disposed=true;signal.removeEventListener('abort',dispose);
  islands?.dispose();geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());
  scene.environment=null;environment?.dispose();environment=undefined;disposeStudio();
  scene.clear();renderer.renderLists.dispose();renderer.dispose();
 };
 signal.addEventListener('abort',dispose,{once:true});
 const assertActive=()=>{if(signal.aborted||disposed)throw abortError();};
 try{
  renderer.outputColorSpace=SRGBColorSpace;renderer.toneMapping=ACESFilmicToneMapping;
  renderer.toneMappingExposure=.84;renderer.setClearColor('#f8f8f3',0);
  renderer.setDrawingBufferSize(1,1,1);
  if(process.env.NODE_ENV==='production')renderer.debug.checkShaderErrors=false;
  scene.fog=new Fog('#f5f6f1',22,49);
  scene.add(new HemisphereLight('#f4f7ff','#9ca99a',1.05));
  const sun=new DirectionalLight('#fff3db',2.3);sun.position.set(-7,11,8);scene.add(sun);
  const rim=new DirectionalLight('#b7cee4',.95);rim.position.set(8,4,-9);scene.add(rim);

  // Capture an actual procedural light studio once. Its boxes are never part of
  // the live scene; only the small prefiltered reflection texture is retained.
  await yieldRenderSetup(signal);assertActive();
  pmrem=new PMREMGenerator(renderer);lightRoom=new RoomEnvironment();
  try{environment=pmrem.fromScene(lightRoom,.025,.1,100,{size:256});}
  finally{disposeStudio();}
  scene.environment=environment.texture;scene.environmentIntensity=.58;

  await yieldRenderSetup(signal);assertActive();
  const terrainGeometry=foldedLandscape(quiet);geometries.push(terrainGeometry);
  const terrainMaterial=new MeshStandardMaterial({vertexColors:true,roughness:.64,metalness:.045,envMapIntensity:.48});materials.push(terrainMaterial);
  const terrain=new Mesh(terrainGeometry,terrainMaterial);terrain.name='folded-porcelain-landscape';
  terrain.matrixAutoUpdate=false;scene.add(terrain);

  const sheetThickness=.045;
  const tileGeometry=new RoundedBoxGeometry(1,sheetThickness,1,4,.018);geometries.push(tileGeometry);
  const vertices=tileGeometry.getAttribute('position'),normals=tileGeometry.getAttribute('normal'),tileColors=new Float32Array(vertices.count*3);
  const normal=new Vector3();
  const top=new Color('#ffffff'),edge=new Color('#a3b7bf'),color=new Color();
  for(let i=0;i<vertices.count;i++){
   const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i);
   const face=smooth((y+.012)/.033);color.copy(edge).lerp(top,.48+face*.52);
   tileColors[i*3]=color.r;tileColors[i*3+1]=color.g;tileColors[i*3+2]=color.b;
   // Bend the complete closed sheet, including its rolled edge. Transform its
   // normals with the inverse-transpose of the same deformation Jacobian.
   vertices.setY(i,y+.52*x*x+.22*x*z+.045*Math.sin(Math.PI*z));
   const nx=normals.getX(i),ny=normals.getY(i),nz=normals.getZ(i);
   normal.set(nx-(1.04*x+.22*z)*ny,ny,nz-(.22*x+.045*Math.PI*Math.cos(Math.PI*z))*ny).normalize();
   normals.setXYZ(i,normal.x,normal.y,normal.z);
  }
  vertices.needsUpdate=true;normals.needsUpdate=true;tileGeometry.computeBoundingSphere();
  tileGeometry.setAttribute('color',new Float32BufferAttribute(tileColors,3));
  const tileMaterial=new MeshPhysicalMaterial({vertexColors:true,roughness:.25,metalness:.26,clearcoat:.58,clearcoatRoughness:.25,envMapIntensity:1.1});materials.push(tileMaterial);
  const layout=islandLayout(quiet),tiles=new InstancedMesh(tileGeometry,tileMaterial,layout.length);islands=tiles;
  tiles.name='floating-canvas-islands';tiles.instanceMatrix.setUsage(DynamicDrawUsage);
  // Placements are bounded and always peripheral; one shared bound avoids per-frame scans.
  tiles.frustumCulled=false;scene.add(tiles);
  const palette=['#f5f5f0','#e5eceb','#dce7ec','#f1eee5','#cbdcd5','#d3e1ef'];
  for(let i=0;i<layout.length;i++){color.set(palette[i%palette.length]);tiles.setColorAt(i,color);}
  if(tiles.instanceColor)tiles.instanceColor.needsUpdate=true;

  const position=new Vector3(),scale=new Vector3(),projected=new Vector3(),target=new Vector3();
  const rotation=new Euler(),quaternion=new Quaternion(),matrix=new Matrix4();
  let width=1,height=1,ratio=1,spread=.625,small=false,lastDiagnostic=-Infinity,lastReduced:boolean|undefined;
  const place=(time:number,px:number,py:number,scroll:number,reduced:boolean)=>{
   // A fixed composition in reduced mode is independent of both input and elapsed time.
   const drift=reduced?0:Math.sin(time*.13),travel=reduced?0:Math.tanh(scroll*.19);
   const strength=quiet?.62:1;
   camera.position.set(px*.62*strength+Math.sin(travel*1.8)*.52,4.15+py*.34*strength+travel*.5,18-travel*1.6);
   target.set(px*.1,.2+travel*.22,-3.6-travel*.85);camera.lookAt(target);camera.updateMatrixWorld();
   terrain.scale.set(spread,1,1);terrain.rotation.y=travel*.028;terrain.updateMatrix();
   for(let i=0;i<tiles.count;i++){
    const tile=layout[i],wave=reduced?0:Math.sin(time*.22+tile.phase);
    const x=tile.x*spread,y=tile.y+wave*.16*strength,z=tile.z+travel*(i%2===0?.8:-.55);
    projected.set(x,y,z).project(camera);
    const dx=(projected.x-px)*camera.aspect,dy=projected.y-py,distanceSquared=dx*dx+dy*dy;
    const influence=reduced?0:Math.exp(-distanceSquared*5.5)*strength;
    const inverseDistance=1/Math.sqrt(distanceSquared+.015);
    position.set(x+dx*inverseDistance*influence*.48,y+dy*inverseDistance*influence*.36,z+influence*.38);
    scale.set(tile.w*Math.max(.62,spread),tile.h/sheetThickness,tile.d);
    rotation.set(tile.rx+wave*.025+dy*influence*.28,tile.ry+drift*.025+travel*.09,tile.rz-dx*influence*.16);
    quaternion.setFromEuler(rotation);matrix.compose(position,quaternion,scale);tiles.setMatrixAt(i,matrix);
   }
   tiles.instanceMatrix.needsUpdate=true;
  };
  place(0,0,0,0,true);
  canvas.dataset.spatialDesign='curved-porcelain-sheets';canvas.dataset.spatialMode=mode;
  canvas.dataset.spatialLighting='procedural-studio-pmrem';
  canvas.dataset.spatialInstances=String(tiles.count);

  await yieldRenderSetup(signal);assertActive();
  let abortCompile=()=>{};
  try{
   await Promise.race([
    renderer.compileAsync(scene,camera),
    new Promise<never>((_,reject)=>{abortCompile=()=>reject(abortError());signal.addEventListener('abort',abortCompile,{once:true});if(signal.aborted)abortCompile();}),
   ]);
  }finally{signal.removeEventListener('abort',abortCompile);}
  assertActive();
  const gl=renderer.getContext();
  for(const entry of renderer.info.programs||[]){
   if(!gl.getProgramParameter(entry.program as WebGLProgram,gl.LINK_STATUS))throw new Error('Spatial shader unavailable');
  }

  return{
   resize(nextWidth,nextHeight,dpr){
    if(disposed)return;
    const w=Math.max(1,finite(nextWidth,1)),h=Math.max(1,finite(nextHeight,1)),density=clamp(finite(dpr,1),.25,3);
    if(width===w&&height===h&&ratio===density)return;
    width=w;height=h;ratio=density;small=width<850;spread=clamp(width/height/1.6,.36,1.5);
    camera.aspect=width/height;camera.updateProjectionMatrix();
    renderer.setDrawingBufferSize(width,height,ratio);
    tiles.count=small?(quiet?10:18):layout.length;
    canvas.dataset.spatialInstances=String(tiles.count);canvas.dataset.spatialDensity=ratio.toFixed(2);
   },
   render(frame){
    if(disposed)return;
    if(renderer.getContext().isContextLost())throw new Error('Spatial context lost');
    const reduced=frame.reduced,time=reduced?0:Math.max(0,finite(frame.time));
    const px=reduced?0:clamp(finite(frame.x),-1,1),py=reduced?0:clamp(finite(frame.y),-1,1);
    const scroll=reduced?0:clamp(finite(frame.scroll),-1,16);
    place(time,px,py,scroll,reduced);renderer.render(scene,camera);
    // Useful browser diagnostics without stringifying input on every frame.
    if(lastReduced!==reduced||Math.abs(time-lastDiagnostic)>.4){
     lastReduced=reduced;lastDiagnostic=time;
     canvas.dataset.spatialDraws=String(renderer.info.render.calls);
     canvas.dataset.spatialTriangles=String(renderer.info.render.triangles);
     canvas.dataset.spatialTime=time.toFixed(2);canvas.dataset.spatialPointer=px.toFixed(2)+','+py.toFixed(2);
     canvas.dataset.spatialScroll=scroll.toFixed(2);canvas.dataset.spatialReduced=String(reduced);
    }
   },dispose,
  };
 }catch(error){dispose();throw error;}
}
