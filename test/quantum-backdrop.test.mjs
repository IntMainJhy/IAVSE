import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/QuantumBackdrop.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const flush=async()=>{for(let n=0;n<8;n++)await Promise.resolve();};

function mount({width=1440,systemReduced=false,savedReduced=false,hidden=false,deferred=false}={}){
 class Target extends EventTarget{
  listeners=new Set();
  addEventListener(name,fn,options){super.addEventListener(name,fn,options);this.listeners.add(name);}
  removeEventListener(name,fn){super.removeEventListener(name,fn);this.listeners.delete(name);}
 }
 const attributes=new Set(),host={toggleAttribute:(name,value)=>value?attributes.add(name):attributes.delete(name),removeAttribute:name=>attributes.delete(name)};
 const canvas=Object.assign(new Target(),{dataset:{},width:300,height:150,closest:()=>host});
 const window=Object.assign(new Target(),{scrollY:0}),document=Object.assign(new Target(),{hidden,documentElement:new Target()}),preference=Object.assign(new Target(),{matches:systemReduced});
 const frames=new Map(),effects=[],renders=[],sizes=[],exports={};let id=0,now=1000,disposes=0,signal,createCalls=0,resizeError=false,renderError=false,resolveScene;
 const scene={render:(...args)=>{if(renderError)throw Error('drawing failed');renders.push(args);},resize:(...args)=>{if(resizeError)throw Error('resize failed');sizes.push(args);},dispose:()=>{disposes++;}};
 const created=deferred?new Promise(resolve=>{resolveScene=resolve;}):Promise.resolve(scene);
 const sandbox={exports,window,document,innerWidth:width,innerHeight:900,devicePixelRatio:2,AbortController,matchMedia:()=>preference,localStorage:{getItem:()=>savedReduced?'reduce':null},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key),require:name=>{
  if(name==='react')return{useEffect:fn=>effects.push(fn),useRef:()=>({current:canvas})};
  if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
  if(name==='@/lib/quantum-field')return{createQuantumField:(_canvas,abort)=>{signal=abort;createCalls++;return created;}};
  throw Error('Unexpected dependency '+name);
 }};
 vm.runInNewContext(source,sandbox);const output=exports.QuantumBackdrop(),cleanup=effects[0]();
 const step=(ms=40)=>{now+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));};
 const control=(action,value)=>window.dispatchEvent(Object.assign(new Event('iavse-scene-control'),{detail:{action,value}}));
 const scroll=value=>{window.scrollY=value;window.dispatchEvent(new Event('scroll'));};
 const move=(pointerType='mouse')=>window.dispatchEvent(Object.assign(new Event('pointermove'),{pointerType,clientX:width,clientY:0}));
 const visibility=value=>{document.hidden=value;document.dispatchEvent(new Event('visibilitychange'));};
 const contextLost=()=>{const event=new Event('webglcontextlost',{cancelable:true});canvas.dispatchEvent(event);return event;};
 return{window,document,preference,canvas,attributes,frames,renders,sizes,output,cleanup,step,control,scroll,move,visibility,contextLost,resize:()=>window.dispatchEvent(new Event('resize')),resolve:()=>resolveScene(scene),failResize:()=>{resizeError=true;},failRender:()=>{renderError=true;},get disposes(){return disposes;},get signal(){return signal;},get createCalls(){return createCalls;}};
}

test('one field starts after loading, coalesces pointer input and respects desktop and mobile cadence',async()=>{
 for(const width of[1440,390]){
  const s=mount({width});assert.equal(s.output.props['aria-hidden'],'true');assert.equal(s.frames.size,0);
  await flush();assert.equal(s.createCalls,1);assert.deepEqual(s.sizes[0],[width,900,2]);assert.equal(s.frames.size,1);
  s.step(1);assert.equal(s.renders.length,1);
  for(let i=0;i<20;i++)s.move();assert.equal(s.frames.size,1,'pointer bursts cannot create extra frame loops');
  s.step(16);assert.equal(s.renders.length,1,'sub-cadence display frames do not issue GPU renders');
  s.step(width<768?28:18);assert.equal(s.renders.length,2);assert.ok(s.renders.at(-1)[1]>0&&s.renders.at(-1)[2]>0);
  s.cleanup();
 }
});

test('system and saved reduced motion render a static scene without a continuous ticker',async()=>{
 for(const settings of[{systemReduced:true},{savedReduced:true}]){
  const s=mount(settings);await flush();s.step();assert.equal(s.renders.length,1);assert.equal(s.renders[0][4],true);assert.equal(s.frames.size,0);
  s.move();s.step();assert.equal(s.renders.length,1,'pointer input cannot animate reduced motion');
  s.scroll(180);assert.ok(s.attributes.has('data-glass-scrolled'));s.step();assert.equal(s.renders.length,2,'native scroll can redraw its static composition once');assert.equal(s.frames.size,0);
  s.cleanup();
 }
});

test('visibility and pause stop work and hidden wall time does not fast-forward the animation',async()=>{
 const s=mount();await flush();s.step();const before=s.renders.at(-1)[0];
 s.visibility(true);assert.equal(s.frames.size,0);s.step(60000);assert.equal(s.renders.length,1);
 s.visibility(false);s.step();assert.ok(s.renders.at(-1)[0]-before<.1,'resuming uses display delta, not elapsed hidden time');
 s.control('paused',true);s.step();assert.equal(s.canvas.dataset.field,'paused');assert.equal(s.frames.size,0);
 s.control('paused',false);s.step();assert.equal(s.canvas.dataset.field,'running');assert.equal(s.frames.size,1);
 s.preference.matches=true;s.preference.dispatchEvent(new Event('change'));s.step();assert.equal(s.frames.size,0);assert.equal(s.renders.at(-1)[4],true);
 s.cleanup();
});

test('context loss and renderer failures switch to fallback and release GPU ownership',async()=>{
 for(const failure of['context','resize','render']){
  const s=mount();await flush();s.step();
  if(failure==='context')assert.equal(s.contextLost().defaultPrevented,true);
  if(failure==='resize'){s.failResize();s.resize();}
  if(failure==='render'){s.failRender();s.step();}
  assert.equal(s.canvas.dataset.field,'fallback');assert.equal(s.signal.aborted,true);assert.equal(s.disposes,1);assert.equal(s.frames.size,0);
  s.move();s.scroll(240);s.step();assert.equal(s.frames.size,0,'failed contexts cannot restart a render loop');s.cleanup();
 }
});

test('late scenes after unmount or context failure are disposed without being attached',async()=>{
 for(const failure of['unmount','context']){
  const s=mount({deferred:true});await flush();assert.equal(s.createCalls,1);
  if(failure==='unmount')s.cleanup();else s.contextLost();
  s.resolve();await flush();assert.equal(s.signal.aborted,true);assert.equal(s.disposes,1);assert.equal(s.sizes.length,0);assert.equal(s.frames.size,0);
  if(failure==='context')s.cleanup();
 }
});

test('unmount unregisters listeners, cancels pending work and releases canvas memory',async()=>{
 const s=mount();await flush();s.step();assert.ok(s.frames.size);
 s.cleanup();assert.equal(s.signal.aborted,true);assert.equal(s.disposes,1);assert.equal(s.frames.size,0);assert.equal(s.canvas.width,0);assert.equal(s.canvas.height,0);assert.equal(s.attributes.size,0);
 assert.equal(s.window.listeners.size+s.document.listeners.size+s.document.documentElement.listeners.size+s.preference.listeners.size+s.canvas.listeners.size,0);
 s.move();s.scroll(300);s.resize();s.step();assert.equal(s.frames.size,0);
});
