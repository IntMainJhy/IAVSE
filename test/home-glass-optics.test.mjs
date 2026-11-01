import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as three from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/home-glass.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const originalChunk=three.ShaderChunk.transmission_pars_fragment;
const bytes=fs.readFileSync(new URL('../public/models/iavse-optical-surface.glb',import.meta.url));
async function studio({overrides={},signal,fetcher}={}){
 let scene,camera,environment,releases=0,environmentReleases=0,dpr,transmissionSize;
 class Renderer{setPixelRatio(value){dpr=value;}setSize(){}dispose(){releases++;}render(s,c){scene=s;camera=c;scene.updateMatrixWorld(true);camera.updateMatrixWorld();}set transmissionResolutionScale(value){transmissionSize=value;}}
 class PMREM{fromScene(value){environment=value;return{texture:new three.Texture(),dispose(){environmentReleases++;}};}dispose(){}}
 const exports={};vm.runInNewContext(source,{exports,AbortController,DOMException,Math,Uint8Array,fetch:fetcher||(async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)})),require:name=>{
  if(name==='three')return{...three,...overrides,WebGLRenderer:Renderer,PMREMGenerator:PMREM};if(name==='three/addons/loaders/GLTFLoader.js')return{GLTFLoader};throw Error('Unexpected dependency '+name);
 }});
 const controller=new AbortController(),canvas={dataset:{}},progress=[];
 const adapter=await exports.createHomeGlass(canvas,signal||controller.signal,{onProgress:value=>progress.push(value)});adapter.resize(1440,900,2);adapter.render(0,0,false,0,false,2);
 const surface=scene.getObjectByName('iavse-optical-field'),wall=scene.getObjectByName('iavse-refraction-receiver'),meshes=[];surface.traverse(node=>{if(node.isMesh)meshes.push(node);});meshes.sort((a,b)=>Number(a.material.name.includes('PolishedRolledEdge'))-Number(b.material.name.includes('PolishedRolledEdge')));
 return{adapter,controller,canvas,surface,wall,meshes,progress,get scene(){return scene;},get camera(){return camera;},get environment(){return environment;},get releases(){return releases;},get environmentReleases(){return environmentReleases;},get dpr(){return dpr;},get transmissionSize(){return transmissionSize;}};
}

// Project the exported vertices through the real object/camera matrices. This
// catches a camera move that is numerically present but cancelled by model scale.
function projectedBounds(s){
 const bounds=new three.Box2(),point=new three.Vector3();
 for(const mesh of s.meshes){const positions=mesh.geometry.attributes.position;for(let i=0;i<positions.count;i++){
  point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld).project(s.camera);
  assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));bounds.expandByPoint(new three.Vector2(point.x,point.y));
 }}
 return bounds;
}

for(const variant of['','-mobile'])test('Blender optical surface'+variant+' is a closed finite volume within its delivery budget',async()=>{
 const file=fs.readFileSync(new URL('../public/models/iavse-optical-surface'+variant+'.glb',import.meta.url));assert.ok(file.byteLength<(variant?400000:1000000));
 const gltf=await new GLTFLoader().parseAsync(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),'');const meshes=[];gltf.scene.traverse(node=>{if(node.isMesh)meshes.push(node);});assert.equal(meshes.length,2,'one closed surface is partitioned into clear faces and its authored bevel');
 const edges=new Map(),bounds=new three.Box3(),depths=new Map(),frontSlopes=[];let triangles=0,volume=0;
 const a=new three.Vector3(),b=new three.Vector3(),c=new three.Vector3(),face=new three.Vector3(),ab=new three.Vector3(),ac=new three.Vector3(),shading=new three.Vector3();
 for(const mesh of meshes){const geometry=mesh.geometry,position=geometry.attributes.position,index=geometry.index,points=[];triangles+=index.count/3;
 const normal=geometry.attributes.normal;assert.ok(normal,'authored smooth normals are exported');
 for(let i=0;i<position.count;i++){
  const p=[position.getX(i),position.getY(i),position.getZ(i)];assert.ok(p.every(Number.isFinite));points.push(p.map(value=>Math.round(value*1e6)).join(','));
  const n=[normal.getX(i),normal.getY(i),normal.getZ(i)];assert.ok(n.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...n)-1)<.002,'normals stay unit length');
  if(!mesh.material.name.includes('PolishedRolledEdge')){
   const key=p.slice(0,2).map(value=>Math.round(value*1e5)).join(','),range=depths.get(key)||[Infinity,-Infinity];range[0]=Math.min(range[0],p[2]);range[1]=Math.max(range[1],p[2]);depths.set(key,range);
   if(Math.abs(p[0])<.8&&p[1]>-1.6&&p[1]<.35&&n[2]>.25)frontSlopes.push(n[1]);
  }
 }
 for(let i=0;i<index.count;i+=3){
  for(const[u,v]of[[0,1],[1,2],[2,0]]){const key=[points[index.getX(i+u)],points[index.getX(i+v)]].sort().join('|');edges.set(key,(edges.get(key)||0)+1);}
  a.fromBufferAttribute(position,index.getX(i));b.fromBufferAttribute(position,index.getX(i+1));c.fromBufferAttribute(position,index.getX(i+2));volume+=a.dot(face.crossVectors(b,c))/6;
  face.crossVectors(ab.subVectors(b,a),ac.subVectors(c,a));assert.ok(face.lengthSq()>1e-20,'no degenerate optical faces');face.normalize();
  shading.fromBufferAttribute(normal,index.getX(i)).add(new three.Vector3().fromBufferAttribute(normal,index.getX(i+1))).add(new three.Vector3().fromBufferAttribute(normal,index.getX(i+2))).normalize();assert.ok(face.dot(shading)>0,'shading normals agree with triangle winding');
 }
 geometry.computeBoundingBox();bounds.union(geometry.boundingBox);
 }
 assert.ok(triangles<(variant?20000:60000));assert.ok([...edges.values()].every(count=>count===2),'material-partitioned welded boundaries have two incident triangles across the rolled edge');assert.ok(volume>0,'the closed lens has outward-facing winding');
 const size=bounds.getSize(new three.Vector3());assert.ok(size.z>.3&&size.z<2,'the exported volume carries actual optical depth');assert.ok(size.x>3&&size.y>2,'surface is authored beyond the eventual viewport edges');
 const thicknesses=[...depths.values()].map(([min,max])=>max-min).filter(value=>value>.01);assert.ok(thicknesses.length>100);
 assert.ok(Math.max(...thicknesses)>Math.min(...thicknesses)*3,'the lens deepens from its boundary rather than remaining a constant-thickness sheet');
 assert.ok(frontSlopes.length>100&&Math.max(...frontSlopes)-Math.min(...frontSlopes)>.35,'interior face normals vary across real curvature, beyond the bevel');
 for(const mesh of meshes){mesh.geometry.dispose();mesh.material.dispose();}

});

test('the real transparent volume receives studio reflections on its curved face and authored edge',async()=>{
 const s=await studio();assert.equal(s.meshes.length,2);const material=s.meshes[0].material;
 assert.ok(material instanceof three.MeshPhysicalMaterial);assert.ok(material.transmission>=.95&&material.transmission<=1);assert.equal(material.side,three.FrontSide);
 assert.ok(material.ior>=1.4&&material.ior<1.6);assert.ok(((material.ior-1)/(material.ior+1))**2>.025,'the main face has a useful physical Fresnel response');assert.ok(material.thickness>=.2&&material.thickness<=1);
 for(const mesh of s.meshes){const value=mesh.material;assert.ok(value.transmission>=.95&&value.envMap);assert.ok(value.envMapIntensity>.1&&value.envMapIntensity<8);assert.ok(value.roughness>0&&value.roughness<.25);assert.ok(value.dispersion>=0&&value.dispersion<1);assert.ok(value.attenuationDistance>1);}
 assert.equal(s.surface.children.length,1);assert.ok(s.scene.environmentIntensity>0&&s.scene.environmentIntensity<=3);assert.ok(s.environment.children.length>=2);
 const sky=s.environment.getObjectByName('iavse-offscreen-daylight-sky');assert.ok(sky?.material instanceof three.ShaderMaterial);assert.equal(sky.material.side,three.BackSide);assert.ok(Math.abs(sky.material.uniforms.uSkySun.value.length()-1)<1e-6,'daylight has a normalized direction');
 for(const fixture of s.environment.children)assert.ok(!s.scene.children.includes(fixture),'the sky and softboxes are captured offscreen, not drawn as floating page objects');
 const fixtures=[];s.scene.traverse(node=>{if(node.isMesh&&['TubeGeometry','TorusGeometry'].includes(node.geometry.type))fixtures.push(node);});assert.equal(fixtures.length,0,'the scene has no luminous ring or light tube');s.adapter.dispose();
});

test('the opening camera changes actual projected size and animated reflections reach every physical material',async()=>{
 const s=await studio();s.adapter.render(0,0,false,0,false,0);const distant=projectedBounds(s).getSize(new three.Vector2()),initialScale=s.surface.scale.clone();
 s.adapter.render(0,0,false,0,false,3);const arrived=projectedBounds(s).getSize(new three.Vector2());assert.ok(arrived.x/distant.x>1.035,'camera approach remains visible instead of being cancelled by model rescaling');assert.ok(s.surface.scale.distanceTo(initialScale)<1e-8,'intro framing uses a stable model scale');
 const light=s.scene.environmentRotation.clone(),first=projectedBounds(s).getCenter(new three.Vector2());
 for(const time of[3,8,16]){s.adapter.render(0,0,false,0,false,time);for(const mesh of s.meshes)assert.deepEqual(mesh.material.envMapRotation.toArray(),s.scene.environmentRotation.toArray(),'explicit env maps follow the moving studio, including the polished edge');}
 const change=new three.Quaternion().setFromEuler(light).angleTo(new three.Quaternion().setFromEuler(s.scene.environmentRotation));assert.ok(change>.08,'autoplay sweeps the studio by a perceptible angle');assert.ok(projectedBounds(s).getCenter(new three.Vector2()).distanceTo(first)>.004,'autoplay also moves the actual lens, beyond a static gradient');assert.ok(s.wall.material.uniforms.uTime.value>=16);s.adapter.dispose();
});

test('scroll moves the camera and actual volume continuously, reverses, then lets product HTML take focus',async()=>{
 const s=await studio(),capture=()=>({camera:s.camera.position.toArray(),pose:s.surface.rotation.toArray(),position:s.surface.position.toArray(),light:s.scene.environmentRotation.toArray(),opacity:s.meshes[0].material.opacity});
 const opening=capture();s.adapter.render(.3,-.2,false,.5,false,2);assert.notDeepEqual(capture(),opening);s.adapter.render(0,0,false,0,false,2);assert.deepEqual(capture(),opening,'reversing the scroll restores the same spatial state');
 s.adapter.render(0,0,false,1.1,false,2);assert.ok(s.meshes[0].material.opacity>0&&s.meshes[0].material.opacity<1);
 s.adapter.render(0,0,false,1.4,false,2);assert.equal(s.surface.visible,false);assert.equal(s.adapter.animated,false);assert.equal(s.adapter.interactive,false);assert.ok(s.transmissionSize<=.2);assert.equal(s.canvas.dataset.glassHeroVisible,'false');
 s.adapter.setReveals([{left:100,top:100,width:800,height:300,progress:.5}]);s.adapter.render(0,0,false,1.4,false,2);assert.equal(s.surface.visible,false,'content reveals do not create more refractive objects over the interface');assert.equal(s.scene.children.filter(node=>node.isMesh).length,1);s.adapter.dispose();
});

test('the opaque receiver retains a dark-to-silver field while device quality stays bounded',async()=>{
 const s=await studio(),colors=['uBlueTop','uBlueMiddle','uBlueBottom','uIce'].map(key=>s.wall.material.uniforms[key].value);
 const luminance=value=>value.r*.2126+value.g*.7152+value.b*.0722;assert.ok(luminance(colors[0])<.08&&luminance(colors[3])>.8);assert.ok(colors.every((value,index)=>index===0||luminance(value)>luminance(colors[index-1])),'the refractable receiver progresses from deep navy to silver');
 for(const dark of[false,true])for(const scroll of[0,.5,1.4,4]){s.adapter.render(0,0,dark,scroll,false,2);assert.equal(s.wall.material.uniforms.uScroll.value,scroll);assert.ok(s.wall.material.uniforms.uBrightness.value>=.99);assert.equal(s.wall.material.transparent,false);}
 for(const[width,height,budget]of[[1440,900,8000000],[3840,2160,8000000],[390,844,3000000]]){s.adapter.resize(width,height,3);assert.ok(s.dpr>0&&width*height*s.dpr*s.dpr<=budget+1,'GPU pixel count remains bounded');s.adapter.render(0,0,false,0,false,2);assert.ok(s.transmissionSize>=.3&&s.transmissionSize<=1,'the visible volume keeps usable refraction resolution');}
 assert.ok(s.surface.scale.x<s.surface.scale.y,'responsive framing preserves the oblique curved edge on narrow screens');s.adapter.dispose();
});

test('reduced motion freezes optical poses, frame animation does not rebuild geometry, and cleanup is idempotent',async()=>{
 const s=await studio(),geometry=s.meshes[0].geometry,version=geometry.attributes.position.version;
 s.adapter.render(0,0,false,0,true,10);const pose=s.surface.quaternion.clone(),camera=s.camera.position.clone(),position=s.surface.position.clone(),light=s.scene.environmentRotation.clone();s.adapter.render(1,-1,false,.6,true,50);
 assert.ok(s.surface.quaternion.angleTo(pose)<1e-8);assert.ok(s.camera.position.distanceTo(camera)<1e-10);assert.ok(s.surface.position.distanceTo(position)<1e-10);assert.deepEqual(s.scene.environmentRotation.toArray(),light.toArray());assert.equal(s.canvas.dataset.glassTime,'0.0');assert.equal(geometry.attributes.position.version,version);
 const geometries=new Set(s.meshes.map(mesh=>mesh.geometry).concat(s.wall.geometry)),materials=new Set(s.meshes.map(mesh=>mesh.material).concat(s.wall.material));let disposedGeometry=0,disposedMaterial=0;
 geometries.forEach(value=>value.addEventListener('dispose',()=>disposedGeometry++));materials.forEach(value=>value.addEventListener('dispose',()=>disposedMaterial++));s.controller.abort();s.adapter.dispose();s.adapter.render(0,0,false,0,false,1);assert.equal(disposedGeometry,geometries.size);assert.equal(disposedMaterial,materials.size);assert.equal(s.releases,1);assert.equal(s.environmentReleases,1);
});

test('shader optimization is local, guarded, and unsupported revisions retain native physical transmission',async()=>{
 const s=await studio(),shader={vertexShader:three.ShaderLib.physical.vertexShader,fragmentShader:three.ShaderLib.physical.fragmentShader,uniforms:{}};s.meshes[0].material.onBeforeCompile(shader,{});assert.ok(shader.fragmentShader.includes('return textureLod( transmissionSamplerMap, fragCoord.xy, lod );'));assert.equal(three.ShaderChunk.transmission_pars_fragment,originalChunk);assert.equal(s.canvas.dataset.glassFilter,'linear-mip-r187');
 assert.ok(shader.vertexShader.includes('vOpticalPosition=position'),'coating follows real model geometry');assert.ok(shader.fragmentShader.includes('dot(normal,normalize(vViewPosition))'),'grazing reflection depends on the surface and view');
 s.adapter.render(0,0,false,0,false,8);assert.equal(shader.uniforms.uOpticalTime.value,8);
 const sun=s.environment.getObjectByName('iavse-offscreen-daylight-sky').material.uniforms.uSkySun.value;assert.ok(shader.uniforms.uOpticalSunDirection.value.distanceTo(sun.clone().applyEuler(s.scene.environmentRotation))<1e-8,'the sharp sunlight follows the same direction as the reflected daylight sky');
 assert.ok(shader.fragmentShader.includes('lensDistance-.010-prismSpread')&&shader.fragmentShader.includes('lensDistance-.010+prismSpread'),'local RGB peaks separate across the actual optical boundary');
 s.adapter.render(0,0,false,0,true,80);assert.equal(shader.uniforms.uOpticalTime.value,0,'reduced motion also stops the surface coating');s.adapter.render(0,0,false,1.4,false,8);assert.equal(shader.uniforms.uOpticalFade.value,0,'coating fades with the volume');s.adapter.dispose();
 const fallback=await studio({overrides:{REVISION:'188'}}),native={fragmentShader:three.ShaderLib.physical.fragmentShader};fallback.meshes[0].material.onBeforeCompile(native,{});assert.equal(native.fragmentShader,three.ShaderLib.physical.fragmentShader);assert.equal(fallback.canvas.dataset.glassFilter,'three-default');fallback.adapter.dispose();
});

test('resource progress reports actual completion and aborted model loads fail without constructing a renderer',async()=>{
 const s=await studio();assert.deepEqual(Array.from(s.progress),[.9,1]);s.adapter.dispose();const controller=new AbortController();controller.abort();await assert.rejects(studio({signal:controller.signal}),error=>error.name==='AbortError');await assert.rejects(studio({fetcher:async()=>({ok:false})}),/unavailable/);
});
