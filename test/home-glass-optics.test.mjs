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
 let scene,camera,environment,releases=0,dpr,transmissionSize;
 class Renderer{setPixelRatio(value){dpr=value;}setSize(){}dispose(){releases++;}render(s,c){scene=s;camera=c;scene.updateMatrixWorld(true);camera.updateMatrixWorld();}set transmissionResolutionScale(value){transmissionSize=value;}}
 class PMREM{fromScene(value){environment=value;return{texture:new three.Texture(),dispose(){}};}dispose(){}}
 const exports={};vm.runInNewContext(source,{exports,AbortController,DOMException,Math,Uint8Array,fetch:fetcher||(async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)})),require:name=>{
  if(name==='three')return{...three,...overrides,WebGLRenderer:Renderer,PMREMGenerator:PMREM};if(name==='three/addons/loaders/GLTFLoader.js')return{GLTFLoader};throw Error('Unexpected dependency '+name);
 }});
 const controller=new AbortController(),canvas={dataset:{}},progress=[];
 const adapter=await exports.createHomeGlass(canvas,signal||controller.signal,{onProgress:value=>progress.push(value)});adapter.resize(1440,900,2);adapter.render(0,0,false,0,false,2);
 const surface=scene.getObjectByName('iavse-optical-field'),wall=scene.getObjectByName('iavse-refraction-receiver'),meshes=[];surface.traverse(node=>{if(node.isMesh)meshes.push(node);});meshes.sort((a,b)=>Number(a.material.name.includes('PolishedRolledEdge'))-Number(b.material.name.includes('PolishedRolledEdge')));
 return{adapter,controller,canvas,surface,wall,meshes,progress,get scene(){return scene;},get camera(){return camera;},get environment(){return environment;},get releases(){return releases;},get dpr(){return dpr;},get transmissionSize(){return transmissionSize;}};
}

for(const variant of['','-mobile'])test('Blender optical surface'+variant+' is a closed finite volume within its delivery budget',async()=>{
 const file=fs.readFileSync(new URL('../public/models/iavse-optical-surface'+variant+'.glb',import.meta.url));assert.ok(file.byteLength<500000);
 const gltf=await new GLTFLoader().parseAsync(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),'');const meshes=[];gltf.scene.traverse(node=>{if(node.isMesh)meshes.push(node);});assert.equal(meshes.length,2,'one closed surface is partitioned into clear faces and its authored bevel');
 const edges=new Map(),bounds=new three.Box3();let triangles=0;
 for(const mesh of meshes){const geometry=mesh.geometry,position=geometry.attributes.position,index=geometry.index,points=[];triangles+=index.count/3;
 for(let i=0;i<position.count;i++){const p=[position.getX(i),position.getY(i),position.getZ(i)];assert.ok(p.every(Number.isFinite));points.push(p.map(value=>Math.round(value*1e6)).join(','));}
 for(let i=0;i<index.count;i+=3)for(const[a,b]of[[0,1],[1,2],[2,0]]){const key=[points[index.getX(i+a)],points[index.getX(i+b)]].sort().join('|');edges.set(key,(edges.get(key)||0)+1);}
 geometry.computeBoundingBox();bounds.union(geometry.boundingBox);
 }
 assert.ok(triangles<(variant?18000:45000));assert.ok([...edges.values()].every(count=>count===2),'material-partitioned welded boundaries have two incident triangles across the rolled edge');
 const size=bounds.getSize(new three.Vector3());assert.ok(size.z>.04&&size.z<.3,'nonzero authored optical depth stays thin');assert.ok(size.x>3&&size.y>2,'surface is authored beyond the eventual viewport edges');
 for(const mesh of meshes){mesh.geometry.dispose();mesh.material.dispose();}

});

test('surface inherits bounded studio reflections and keeps the content-facing volume almost clear',async()=>{
 const s=await studio();assert.equal(s.meshes.length,2);const edge=s.meshes.find(mesh=>mesh.material.name.includes('PolishedRolledEdge')).material;assert.ok(edge.ior>=1.35&&edge.ior<=1.5&&edge.envMapIntensity>1&&edge.transmission===1,'only real bevel faces carry the stronger grazing reflection');const material=s.meshes[0].material;
 assert.ok(material instanceof three.MeshPhysicalMaterial);assert.equal(material.transmission,1);assert.equal(material.side,three.FrontSide);assert.equal(material.color.getHexString(),'ffffff');assert.ok(material.ior>1&&material.ior<1.2);assert.ok(material.thickness>0&&material.thickness<.08);assert.ok(material.dispersion>0&&material.dispersion<.3);assert.equal(material.iridescence,0);assert.equal(material.clearcoat,0);assert.ok(material.attenuationDistance>=30);assert.equal(material.toneMapped,false);
 assert.equal(s.surface.children.length,1);assert.ok(s.scene.environmentIntensity>0&&s.scene.environmentIntensity<1);
 for(const panel of s.environment.children){assert.equal(panel.geometry.type,'PlaneGeometry');assert.ok(Math.min(panel.scale.x,panel.scale.y)>=3);assert.ok(!s.scene.children.includes(panel),'environment softboxes never become visible page objects');}
 const fixtures=[];s.scene.traverse(node=>{if(node.isMesh&&['TubeGeometry','TorusGeometry'].includes(node.geometry.type))fixtures.push(node);});assert.equal(fixtures.length,0,'the scene has no luminous ring or light tube');assert.ok(!/stripe|caustic|halo/i.test(s.wall.material.fragmentShader));assert.equal(s.canvas.dataset.glassDispersion,'.22');s.adapter.dispose();
});

test('scroll moves the camera and actual volume continuously, reverses, then lets product HTML take focus',async()=>{
 const s=await studio(),capture=()=>({camera:s.camera.position.toArray(),pose:s.surface.rotation.toArray(),position:s.surface.position.toArray(),light:s.scene.environmentRotation.toArray(),opacity:s.meshes[0].material.opacity});
 const opening=capture();s.adapter.render(.3,-.2,false,.5,false,2);assert.notDeepEqual(capture(),opening);s.adapter.render(0,0,false,0,false,2);assert.deepEqual(capture(),opening,'reversing the scroll restores the same spatial state');
 s.adapter.render(0,0,false,1.1,false,2);assert.ok(s.meshes[0].material.opacity>0&&s.meshes[0].material.opacity<1);
 s.adapter.render(0,0,false,1.4,false,2);assert.equal(s.surface.visible,false);assert.equal(s.adapter.animated,false);assert.equal(s.adapter.interactive,false);assert.equal(s.transmissionSize,.12);assert.equal(s.canvas.dataset.glassHeroVisible,'false');
 s.adapter.setReveals([{left:100,top:100,width:800,height:300,progress:.5}]);s.adapter.render(0,0,false,1.4,false,2);assert.equal(s.surface.visible,false,'content reveals do not create more refractive objects over the interface');assert.equal(s.scene.children.filter(node=>node.isMesh).length,1);s.adapter.dispose();
});

test('receiver and quality controls preserve the approved navy-blue-silver progression',async()=>{
 const s=await studio();assert.deepEqual(['uBlueTop','uBlueMiddle','uBlueBottom','uIce'].map(key=>s.wall.material.uniforms[key].value.getHexString()),['17234e','376eb5','a7c8e8','f4f7fb']);assert.ok(s.wall.material.fragmentShader.includes('smoothstep(.70,1.04,documentY)'),'the first viewport approaches the silver product floor');
 for(const dark of[false,true])for(const scroll of[0,.5,1.4,4]){s.adapter.render(0,0,dark,scroll,false,2);assert.equal(s.wall.material.uniforms.uScroll.value,scroll);assert.ok(s.wall.material.uniforms.uBrightness.value>=.99);assert.equal(s.wall.material.transparent,false);}
 s.adapter.resize(1440,900,3);assert.equal(s.dpr,1.75);s.adapter.render(0,0,false,0,false,2);assert.equal(s.transmissionSize,.6);s.adapter.resize(390,844,3);assert.equal(s.dpr,1.35);s.adapter.render(0,0,false,0,false,2);assert.equal(s.transmissionSize,.45);assert.ok(s.surface.scale.x<s.surface.scale.y,'responsive framing preserves the oblique curved edge on narrow screens');s.adapter.dispose();
});

test('reduced motion freezes optical poses, frame animation does not rebuild geometry, and cleanup is idempotent',async()=>{
 const s=await studio(),geometry=s.meshes[0].geometry,version=geometry.attributes.position.version;
 s.adapter.render(0,0,false,0,true,10);const pose=s.surface.quaternion.clone(),camera=s.camera.position.clone(),position=s.surface.position.clone(),light=s.scene.environmentRotation.clone();s.adapter.render(1,-1,false,.6,true,50);
 assert.ok(s.surface.quaternion.angleTo(pose)<1e-8);assert.ok(s.camera.position.distanceTo(camera)<1e-10);assert.ok(s.surface.position.distanceTo(position)<1e-10);assert.deepEqual(s.scene.environmentRotation.toArray(),light.toArray());assert.equal(s.canvas.dataset.glassTime,'0.0');assert.equal(geometry.attributes.position.version,version);
 let geometries=0,materials=0;geometry.addEventListener('dispose',()=>geometries++);s.meshes[0].material.addEventListener('dispose',()=>materials++);s.controller.abort();s.adapter.dispose();s.adapter.render(0,0,false,0,false,1);assert.equal(geometries,1);assert.equal(materials,1);assert.equal(s.releases,1);
});

test('shader optimization is local, guarded, and unsupported revisions retain native physical transmission',async()=>{
 const s=await studio(),shader={fragmentShader:three.ShaderLib.physical.fragmentShader};s.meshes[0].material.onBeforeCompile(shader,{});assert.ok(shader.fragmentShader.includes('return textureLod( transmissionSamplerMap, fragCoord.xy, lod );'));assert.equal(three.ShaderChunk.transmission_pars_fragment,originalChunk);assert.equal(s.canvas.dataset.glassFilter,'linear-mip-r187');s.adapter.dispose();
 const fallback=await studio({overrides:{REVISION:'188'}}),native={fragmentShader:three.ShaderLib.physical.fragmentShader};fallback.meshes[0].material.onBeforeCompile(native,{});assert.equal(native.fragmentShader,three.ShaderLib.physical.fragmentShader);assert.equal(fallback.canvas.dataset.glassFilter,'three-default');fallback.adapter.dispose();
});

test('resource progress reports actual completion and aborted model loads fail without constructing a renderer',async()=>{
 const s=await studio();assert.deepEqual(Array.from(s.progress),[.9,1]);s.adapter.dispose();const controller=new AbortController();controller.abort();await assert.rejects(studio({signal:controller.signal}),error=>error.name==='AbortError');await assert.rejects(studio({fetcher:async()=>({ok:false})}),/unavailable/);
});
