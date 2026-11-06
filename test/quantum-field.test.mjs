import test from 'node:test';
import {renderSetup} from './render-setup-fixture.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as three from 'three';
import * as color from 'three/src/math/Color.js';
import * as matrix from 'three/src/math/Matrix4.js';
import * as camera from 'three/src/cameras/PerspectiveCamera.js';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/quantum-field.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function module(failure='',{manual=false,parallel=false,completion=[false,true]}={}){
 const uploads=[],draws=[],sizes=[],released=[],uniforms={},shaders=[],calls=[],frames=new Map(),tasks=new Map();let id=0,contexts=0,options,task=0,scheduleId=0,lost=false,bufferCalls=0,now=0;
 const record=name=>calls.push({name,task});
 const schedule=(queue,callback)=>{const key=++scheduleId;queue.set(key,callback);if(!manual)setImmediate(()=>{const fn=queue.get(key);if(fn){queue.delete(key);task++;fn();}});return key;};
 const flush=async queue=>{const pending=[...queue.values()];queue.clear();for(const fn of pending){task++;fn();}await Promise.resolve();await Promise.resolve();};
 const gl={ARRAY_BUFFER:1,STATIC_DRAW:2,POINTS:3,LINES:4,VERTEX_SHADER:5,FRAGMENT_SHADER:6,COMPILE_STATUS:7,LINK_STATUS:8,
  DEPTH_TEST:9,BLEND:10,SRC_ALPHA:11,ONE_MINUS_SRC_ALPHA:12,ONE:13,COLOR_BUFFER_BIT:14,FLOAT:15,
  createShader:()=>({id:++id}),createProgram:()=>({id:++id}),createBuffer:()=>failure==='buffer'||failure==='second-buffer'&&++bufferCalls===2?null:{id:++id},
  shaderSource:(_,text)=>shaders.push(text),compileShader(){record('compile');},getShaderParameter:()=>{record('shader-status');return failure!=='shader';},
  getExtension:name=>{assert.equal(name,'KHR_parallel_shader_compile');return parallel?{COMPLETION_STATUS_KHR:16}:null;},
  attachShader(){},linkProgram(){record('link');},getProgramParameter:(_,parameter)=>{if(parameter===16){record('completion');return completion.length>1?completion.shift():completion[0];}assert.equal(parameter,8);record('link-status');return !['link','shader'].includes(failure);},useProgram(){},disable(){},enable(){},blendFuncSeparate(){},clearColor(){},
  getUniformLocation:(_,name)=>name,getAttribLocation:(_,name)=>name==='position'?0:1,enableVertexAttribArray(){},
  bindBuffer(){},bufferData:(_,data)=>{record('upload');uploads.push([...data]);},vertexAttribPointer(){},
  uniform1f:(name,value)=>{uniforms[name]=value;},uniform2f:(name,...value)=>{uniforms[name]=value;},uniform3f:(name,...value)=>{uniforms[name]=value;},
  uniformMatrix4fv:(name,_,value)=>{uniforms[name]=[...value];},clear(){},viewport:(...size)=>{record('resize');sizes.push(size);},
  drawArrays:(mode,_,count)=>draws.push({mode,count}),isContextLost:()=>lost,
  deleteBuffer:value=>released.push(value.id),deleteProgram:value=>released.push(value.id),deleteShader:value=>released.push(value.id)};
 const canvas={getContext:(kind,config)=>{record('context');contexts++;assert.equal(kind,'webgl');options=config;return failure==='context'?null:gl;}};
 const exports={};vm.runInNewContext(source,{exports,DOMException,performance:{now:()=>now},requestAnimationFrame:callback=>schedule(frames,callback),cancelAnimationFrame:key=>frames.delete(key),setTimeout:callback=>schedule(tasks,callback),clearTimeout:key=>tasks.delete(key),require:name=>{
  if(name==='./render-setup')return renderSetup({requestAnimationFrame:callback=>schedule(frames,callback),cancelAnimationFrame:key=>frames.delete(key),setTimeout:callback=>schedule(tasks,callback),clearTimeout:key=>tasks.delete(key)});
  if(name==='three/src/math/Color.js')return color;
  if(name==='three/src/math/Matrix4.js')return matrix;
  if(name==='three/src/cameras/PerspectiveCamera.js')return camera;
  throw Error('Unexpected backdrop dependency: '+name);
 }});
 return{...exports,canvas,uploads,draws,sizes,released,uniforms,shaders,calls,frames,tasks,elapse:ms=>{now+=ms;},flushFrame:()=>flush(frames),flushTask:()=>flush(tasks),loseContext:()=>{lost=true;},get allocations(){return id;},get contexts(){return contexts;},get options(){return options;}};
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
  else{field.resize(1440,960,1);m.loseContext();assert.throws(()=>field.render(0,0,0,0,false));}
  field.dispose();assert.equal(m.released.length,m.allocations);
 }
});

test('context, compilation, result checks, initial geometry and resize each yield a paint opportunity',async()=>{
 const m=module('',{manual:true}),controller=new AbortController();
 const promise=m.createQuantumField(m.canvas,controller.signal,{width:1440,height:960,dpr:2});
 assert.equal(m.contexts,0,'loading a cached module must not acquire a context in the route callback');
 const expected=['context','link','link-status','upload','resize'];
 for(const phase of expected){
  assert.equal(m.frames.size,1);assert.equal(m.tasks.size,0);
  const before=m.calls.length;await m.flushFrame();
  assert.equal(m.calls.length,before,'RAF only schedules work; the browser can paint before the task');
  assert.equal(m.tasks.size,1);await m.flushTask();
  assert.equal(m.calls.at(-1).name,phase);
 }
 const field=await promise,times=expected.map(name=>m.calls.find(call=>call.name===name).task);
 assert.equal(new Set(times).size,expected.length,'driver and geometry work must not stack in one task');
 assert.equal(m.calls.filter(call=>call.name==='shader-status').length,0,'successful linking needs no blocking per-shader checks');
 assert.equal(m.frames.size+m.tasks.size,0);
 const geometry=m.quantumCurrents(false);
 assert.deepEqual(m.uploads,[...['positions','seeds','lines','lineSeeds'].map(key=>[...geometry[key]])]);
 const uploads=m.uploads.length;field.resize(1440,960,2);assert.equal(m.uploads.length,uploads,'first consumer resize reuses prepared geometry');
 field.render(0,0,0,0,false);assert.deepEqual(m.draws,[{mode:3,count:10368},{mode:4,count:4032}]);field.dispose();
});

test('parallel shader completion polls across frames before reading link status',async()=>{
 const m=module('',{parallel:true,completion:[false,false,true]}),field=await m.createQuantumField(m.canvas,new AbortController().signal);
 const polls=m.calls.filter(call=>call.name==='completion'),linked=m.calls.find(call=>call.name==='link'),status=m.calls.find(call=>call.name==='link-status');
 assert.equal(polls.length,3);assert.equal(new Set(polls.map(call=>call.task)).size,3);
 assert.ok(polls.every(call=>call.task>linked.task));assert.ok(status.task>=polls.at(-1).task);
 assert.equal(m.calls.filter(call=>call.name==='shader-status').length,0);
 field.dispose();assert.equal(m.released.length,m.allocations);
});

test('aborting any setup phase cancels frame or task work and frees partial allocations once',async()=>{
 for(let phase=0;phase<5;phase++)for(const queuedTask of[false,true]){
  const m=module('',{manual:true}),controller=new AbortController();
  const promise=m.createQuantumField(m.canvas,controller.signal,{width:1440,height:960,dpr:1});
  for(let i=0;i<phase;i++){await m.flushFrame();await m.flushTask();}
  if(queuedTask)await m.flushFrame();
  const allocated=m.allocations,uploaded=m.uploads.length,resized=m.sizes.length;
  const rejection=assert.rejects(promise,{name:'AbortError'});controller.abort();await rejection;
  assert.equal(m.frames.size+m.tasks.size,0);assert.equal(m.released.length,allocated);assert.equal(new Set(m.released).size,allocated);
  await m.flushFrame();await m.flushTask();
  assert.equal(m.allocations,allocated);assert.equal(m.uploads.length,uploaded);assert.equal(m.sizes.length,resized);
 }
});

test('abort and context loss during parallel compilation stop polling and clean shader resources',async()=>{
 for(const reason of['abort','lost']){
  const m=module('',{manual:true,parallel:true,completion:[false]}),controller=new AbortController();
  const promise=m.createQuantumField(m.canvas,controller.signal);
  for(let i=0;i<3;i++){await m.flushFrame();await m.flushTask();}
  assert.equal(m.calls.filter(call=>call.name==='completion').length,1);
  const rejection=assert.rejects(promise,reason==='abort'?{name:'AbortError'}:/Background context lost/);
  if(reason==='abort')controller.abort();else{m.loseContext();await m.flushFrame();await m.flushTask();}
  await rejection;assert.equal(m.frames.size+m.tasks.size,0);assert.equal(m.released.length,m.allocations);
  assert.equal(m.calls.filter(call=>call.name==='link-status').length,0);
 }
});

test('a driver that never completes is bounded to eight seconds and abort still takes priority',async()=>{
 for(const abort of[false,true]){
  const m=module('',{manual:true,parallel:true,completion:[false]}),controller=new AbortController();
  const promise=m.createQuantumField(m.canvas,controller.signal);
  for(let i=0;i<3;i++){await m.flushFrame();await m.flushTask();}
  m.elapse(7999);await m.flushFrame();await m.flushTask();assert.equal(m.frames.size,1);
  m.elapse(1);
  const rejection=assert.rejects(promise,abort?{name:'AbortError'}:/Background shader compilation timed out/);
  if(abort)controller.abort();else{await m.flushFrame();await m.flushTask();}
  await rejection;assert.equal(m.frames.size+m.tasks.size,0);assert.equal(m.released.length,m.allocations);
  assert.equal(m.calls.filter(call=>call.name==='link-status').length,0,'a never-completed program cannot trigger a blocking status read');
 }
});

test('link failures check shader errors only afterwards and failed prewarming releases uploaded buffers',async()=>{
 for(const parallel of[false,true])for(const failure of['shader','link']){
  const m=module(failure,{parallel,completion:[true]});
  await assert.rejects(m.createQuantumField(m.canvas,new AbortController().signal),failure==='shader'?/Cannot compile background shader/:/Cannot link background program/);
  const names=m.calls.map(call=>call.name);assert.ok(names.indexOf('shader-status')>names.indexOf('link-status'));
  assert.equal(m.released.length,m.allocations);assert.equal(new Set(m.released).size,m.allocations);
 }
 const m=module('second-buffer');
 await assert.rejects(m.createQuantumField(m.canvas,new AbortController().signal,{width:390,height:844,dpr:2}),/Cannot allocate background buffer/);
 assert.equal(m.uploads.length,1);assert.equal(m.released.length,m.allocations);assert.equal(new Set(m.released).size,m.allocations);
});
