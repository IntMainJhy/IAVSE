import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as three from 'three';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/quantum-field.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function module(){
 let frame,calls=0,released=0,allocations=0,options,ratio=1;
 const sizes=[];
 class Renderer{
  constructor(config){options=config;allocations++;}
  setClearColor(){}setPixelRatio(value){ratio=value;}setSize(w,h){sizes.push({w,h,ratio});}
  render(scene,camera){calls++;frame={scene,camera,points:scene.children[0]};}
  dispose(){released++;}
 }
 const exports={};vm.runInNewContext(source,{exports,DOMException,require:name=>{
  assert.equal(name,'three');return{...three,WebGLRenderer:Renderer};
 }});
 return{...exports,sizes,get frame(){return frame;},get calls(){return calls;},get released(){return released;},get allocations(){return allocations;},get options(){return options;}};
}

test('both quantum quality levels preserve a complete lattice volume with bounded sampling',()=>{
 const m=module();
 for(const mobile of [false,true]){
  const lattice=m.quantumLattice(mobile);
  assert.equal(lattice.count,mobile?1232:3456);assert.equal(lattice.positions.length,lattice.count*3);
  assert.ok(lattice.positions.every(Number.isFinite)&&lattice.seeds.every(Number.isFinite));
  for(const axis of [0,1]){const values=Array.from({length:lattice.count},(_,i)=>lattice.positions[i*3+axis]);assert.equal(Math.min(...values),-1);assert.equal(Math.max(...values),1);}
  const depth=Array.from({length:lattice.count},(_,i)=>lattice.positions[i*3+2]);assert.ok(Math.max(...depth)-Math.min(...depth)>5,'the continuous sheet has visible spatial depth before animated displacement');
 }
 for(const [w,h,dpr,budget] of [[1920,1080,3,1400000],[390,844,3,650000],[3840,2160,2,1400000]]){
  const q=m.quantumQuality(w,h,dpr);assert.ok(q.ratio<=1.5);assert.ok(w*h*q.ratio*q.ratio<=budget+1);
 }
});

test('the point pass reuses geometry during motion and scales quality without reallocating on every frame',async()=>{
 const m=module(),controller=new AbortController(),field=await m.createQuantumField({},controller.signal);
 assert.equal(m.options.alpha,true);assert.equal(m.options.antialias,false);assert.equal(m.options.powerPreference,'low-power');
 field.resize(1440,960,2);field.render(3,.4,-.3,2,false);
 const {points,camera}=m.frame,geometry=points.geometry,material=points.material;
 assert.ok(camera instanceof three.PerspectiveCamera&&points instanceof three.Points);
 assert.equal(geometry.attributes.position.count,3456);assert.equal(material.uniforms.uTime.value,3);
 assert.equal(material.transparent,true);assert.equal(material.depthWrite,false);
 const calls=m.sizes.length;field.resize(1440,960,2);assert.equal(m.sizes.length,calls);
 for(let i=0;i<10;i++)field.render(i/30,.2,.1,.5,false);
 assert.equal(m.frame.points.geometry,geometry);assert.equal(geometry.attributes.position.version,0,'motion changes uniforms rather than uploading position buffers');
 field.resize(390,844,2);field.render(4,0,0,0,false);assert.equal(m.frame.points.geometry.attributes.position.count,1232);
 field.render(8,5,-5,6,true);assert.equal(material.uniforms.uReduced.value,1);assert.equal(material.uniforms.uPointer.value.length(),0);assert.equal(camera.position.z,18);
 field.dispose();
});

test('abort disposes both quality levels, shader and renderer once and ignores late work',async()=>{
 const m=module(),controller=new AbortController(),field=await m.createQuantumField({},controller.signal);
 field.resize(1440,960,1);field.render(0,0,0,0,false);
 const desktop=m.frame.points.geometry,material=m.frame.points.material;let geometryReleases=0,materialReleases=0;
 desktop.addEventListener('dispose',()=>geometryReleases++);material.addEventListener('dispose',()=>materialReleases++);
 field.resize(390,844,1);field.render(0,0,0,0,false);m.frame.points.geometry.addEventListener('dispose',()=>geometryReleases++);
 const draws=m.calls,resizes=m.sizes.length;controller.abort();field.dispose();
 assert.equal(geometryReleases,2);assert.equal(materialReleases,1);assert.equal(m.released,1);
 field.resize(300,500,1);field.render(50,0,0,0,false);assert.equal(m.calls,draws);assert.equal(m.sizes.length,resizes);
 const aborted=new AbortController();aborted.abort();await assert.rejects(m.createQuantumField({},aborted.signal),{name:'AbortError'});assert.equal(m.allocations,1);
});
