import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as three from 'three';
import * as color from 'three/src/math/Color.js';
import * as matrix from 'three/src/math/Matrix4.js';
import * as camera from 'three/src/cameras/PerspectiveCamera.js';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/quantum-field.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function module(failure=''){
 const uploads=[],draws=[],sizes=[],released=[],uniforms={},shaders=[];let id=0,contexts=0,options;
 const gl={ARRAY_BUFFER:1,STATIC_DRAW:2,POINTS:3,LINES:4,VERTEX_SHADER:5,FRAGMENT_SHADER:6,COMPILE_STATUS:7,LINK_STATUS:8,
  DEPTH_TEST:9,BLEND:10,SRC_ALPHA:11,ONE_MINUS_SRC_ALPHA:12,ONE:13,COLOR_BUFFER_BIT:14,FLOAT:15,
  createShader:()=>({id:++id}),createProgram:()=>({id:++id}),createBuffer:()=>failure==='buffer'?null:{id:++id},
  shaderSource:(_,text)=>shaders.push(text),compileShader(){},getShaderParameter:()=>failure!=='shader',
  attachShader(){},linkProgram(){},getProgramParameter:()=>failure!=='link',useProgram(){},disable(){},enable(){},blendFuncSeparate(){},clearColor(){},
  getUniformLocation:(_,name)=>name,getAttribLocation:(_,name)=>name==='position'?0:1,enableVertexAttribArray(){},
  bindBuffer(){},bufferData:(_,data)=>uploads.push([...data]),vertexAttribPointer(){},
  uniform1f:(name,value)=>{uniforms[name]=value;},uniform2f:(name,...value)=>{uniforms[name]=value;},uniform3f:(name,...value)=>{uniforms[name]=value;},
  uniformMatrix4fv:(name,_,value)=>{uniforms[name]=[...value];},clear(){},viewport:(...size)=>sizes.push(size),
  drawArrays:(mode,_,count)=>draws.push({mode,count}),isContextLost:()=>failure==='lost',
  deleteBuffer:value=>released.push(value.id),deleteProgram:value=>released.push(value.id),deleteShader:value=>released.push(value.id)};
 const canvas={getContext:(kind,config)=>{contexts++;assert.equal(kind,'webgl');options=config;return failure==='context'?null:gl;}};
 const exports={};vm.runInNewContext(source,{exports,DOMException,require:name=>{
  if(name==='three/src/math/Color.js')return color;
  if(name==='three/src/math/Matrix4.js')return matrix;
  if(name==='three/src/cameras/PerspectiveCamera.js')return camera;
  throw Error('Unexpected backdrop dependency: '+name);
 }});
 return{...exports,canvas,uploads,draws,sizes,released,uniforms,shaders,get allocations(){return id;},get contexts(){return contexts;},get options(){return options;}};
}

test('both quality levels cover the same three currents with continuous wire topology and bounded sampling',()=>{
 const m=module();
 for(const mobile of [false,true]){
  const lattice=m.quantumCurrents(mobile);
  assert.equal(lattice.count,mobile?3600:10368);assert.equal(lattice.positions.length,lattice.count*3);
  assert.ok(lattice.positions.every(Number.isFinite)&&lattice.seeds.every(Number.isFinite));
  const bands=new Set(Array.from({length:lattice.count},(_,i)=>lattice.positions[i*3+2]));assert.deepEqual([...bands],[-1,0,1]);
  assert.ok(lattice.seeds.every(value=>value>=0&&value<=1));
  assert.equal(lattice.lines.length,lattice.lineCount*3);assert.equal(lattice.lineCount,mobile?1536:4032);
  for(let i=0;i<lattice.lineCount;i+=2){assert.ok(lattice.lines[(i+1)*3]>lattice.lines[i*3]);assert.equal(lattice.lines[(i+1)*3+1],lattice.lines[i*3+1]);assert.equal(lattice.lines[(i+1)*3+2],lattice.lines[i*3+2]);}
 }
 for(const [w,h,dpr,budget] of [[1920,1080,3,1400000],[390,844,3,650000],[3840,2160,2,1400000]]){
  const q=m.quantumQuality(w,h,dpr);assert.ok(q.ratio<=1.5);assert.ok(w*h*q.ratio*q.ratio<=budget+1);
 }
});


test('native passes preserve the original camera, colors and buffer reuse across quality changes',async()=>{
 const m=module(),controller=new AbortController(),field=await m.createQuantumField(m.canvas,controller.signal);
 assert.equal(m.options.alpha,true);assert.equal(m.options.antialias,false);assert.equal(m.options.powerPreference,'low-power');
 field.resize(1440,960,2);field.render(3,.4,-.3,2,false);
 assert.deepEqual(m.draws,[{mode:3,count:10368},{mode:4,count:4032}]);assert.equal(m.uploads.length,4,'only the active quality allocates buffers');
 const expectedCamera=new three.PerspectiveCamera(46,1440/960,.1,60);expectedCamera.position.set(.2,-.09,18.14);expectedCamera.lookAt(0,0,0);expectedCamera.updateMatrixWorld();
 const object=new three.Object3D();object.rotation.set(.16,-.13,-.04);object.updateMatrixWorld();
 const expected=new three.Matrix4().multiplyMatrices(expectedCamera.matrixWorldInverse,object.matrixWorld);
 for(let i=0;i<16;i++){assert.ok(Math.abs(m.uniforms.modelViewMatrix[i]-expected.elements[i])<1e-10);assert.equal(m.uniforms.projectionMatrix[i],expectedCamera.projectionMatrix.elements[i]);}
 const blue=new three.Color('#426997');assert.deepEqual(m.uniforms.uBlue,[blue.r,blue.g,blue.b]);
 const calls=m.sizes.length;field.resize(1440,960,2);assert.equal(m.sizes.length,calls);
 for(let i=0;i<10;i++)field.render(i/30,.2,.1,.5,false);
 assert.equal(m.uploads.length,4,'motion only changes uniforms');
 field.resize(390,844,2);field.render(4,0,0,0,false);assert.equal(m.uploads.length,8);assert.deepEqual(m.draws.slice(-2),[{mode:3,count:3600},{mode:4,count:1536}]);
 field.resize(1440,960,2);assert.equal(m.uploads.length,8,'previous quality is reused');
 field.render(8,5,-5,6,true);assert.equal(m.uniforms.uReduced,1);assert.deepEqual(m.uniforms.uPointer,[0,0]);assert.equal(m.uniforms.uTime,8);
 field.dispose();
});

test('abort releases buffers, shaders and program exactly once and ignores late work',async()=>{
 const m=module(),controller=new AbortController(),field=await m.createQuantumField(m.canvas,controller.signal);
 field.resize(1440,960,1);field.resize(390,844,1);field.render(0,0,0,0,false);
 const draws=m.draws.length,resizes=m.sizes.length,allocations=m.allocations;controller.abort();field.dispose();
 assert.equal(m.released.length,allocations);assert.equal(new Set(m.released).size,allocations);
 field.resize(300,500,1);field.render(50,0,0,0,false);assert.equal(m.draws.length,draws);assert.equal(m.sizes.length,resizes);
 const aborted=new AbortController();aborted.abort();await assert.rejects(m.createQuantumField(m.canvas,aborted.signal),{name:'AbortError'});assert.equal(m.contexts,1);
});

test('initialization failures clean up partial allocations and context loss fails visibly',async()=>{
 for(const failure of ['context','shader','link']){
  const m=module(failure);await assert.rejects(m.createQuantumField(m.canvas,new AbortController().signal));
  assert.equal(m.released.length,m.allocations);assert.equal(new Set(m.released).size,m.allocations);
 }
 for(const failure of ['buffer','lost']){
  const m=module(failure),field=await m.createQuantumField(m.canvas,new AbortController().signal);
  if(failure==='buffer')assert.throws(()=>field.resize(1440,960,1));
  else{field.resize(1440,960,1);assert.throws(()=>field.render(0,0,0,0,false));}
  field.dispose();assert.equal(m.released.length,m.allocations);
 }
});
