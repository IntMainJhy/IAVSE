import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/QuantumBackdrop.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const flush=async()=>{for(let n=0;n<8;n++)await Promise.resolve();};

function mount({width=1440,systemReduced=false,savedReduced=false,hidden=false,deferred=false,path='/resources',iframe=false,missingHost=false,navigationPending=false}={}){
 class Target extends EventTarget{
  listeners=new Set();
  addEventListener(name,fn,options){super.addEventListener(name,fn,options);this.listeners.add(name);}
  removeEventListener(name,fn){super.removeEventListener(name,fn);this.listeners.delete(name);}
 }
 const makeHost=()=>{const attributes=new Set();return{attributes,isConnected:true,toggleAttribute:(name,value)=>value?attributes.add(name):attributes.delete(name),removeAttribute:name=>attributes.delete(name)};};
 let currentHost=missingHost?null:makeHost(),currentPath=path,mutation,observerDisconnected=false;
 const initialHost=currentHost,canvas=Object.assign(new Target(),{dataset:{},width:300,height:150}),layer={hidden:true};
 const window=Object.assign(new Target(),{scrollY:0});window.self=window;window.top=iframe?{}:window;
 const document=Object.assign(new Target(),{hidden,body:{},querySelector:()=>currentHost,documentElement:Object.assign(new Target(),{hasAttribute:name=>name==='data-iavse-transition'&&navigationPending})}),preference=Object.assign(new Target(),{matches:systemReduced});
 const frames=new Map(),renders=[],sizes=[],exports={},refs=[],effects=[],attempts=[];let id=0,now=1000,disposes=0,signal,createCalls=0,resizeError=false,renderError=false,refIndex=0,effectIndex=0,scheduled=[];
 const jsx=(type,props)=>{if(props.ref)props.ref.current=type==='canvas'?canvas:layer;return{type,props};};
 const sandbox={exports,window,document,innerWidth:width,innerHeight:900,devicePixelRatio:2,AbortController,MutationObserver:class{constructor(fn){mutation=fn;}observe(){}disconnect(){observerDisconnected=true;}},matchMedia:()=>preference,localStorage:{getItem:()=>savedReduced?'reduce':null},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key),require:name=>{
  if(name==='react')return{useEffect:(fn,deps)=>{const index=effectIndex++,previous=effects[index];if(!previous||deps.some((value,i)=>value!==previous.deps[i]))scheduled.push({index,fn,deps});},useRef:value=>refs[refIndex++]??(refs[refIndex-1]={current:value})};
  if(name==='next/navigation')return{usePathname:()=>currentPath};
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};
  if(name==='@/lib/quantum-field')return{createQuantumField:(_canvas,abort,viewport)=>{
   signal=abort;createCalls++;
   const attempt={signal:abort,viewport,renders:0,disposes:0};
   const scene={render:(...args)=>{if(renderError)throw Error('drawing failed');attempt.renders++;renders.push(args);},resize:(...args)=>{if(resizeError)throw Error('resize failed');sizes.push(args);},dispose:()=>{attempt.disposes++;disposes++;}};
   attempt.scene=scene;const created=new Promise((resolve,reject)=>{attempt.resolve=()=>resolve(scene);attempt.reject=reject;});attempts.push(attempt);
   if(!deferred)attempt.resolve();return created;
  }};
  throw Error('Unexpected dependency '+name);
 }};
 vm.runInNewContext(source,sandbox);
 const render=()=>{refIndex=effectIndex=0;scheduled=[];const output=exports.QuantumBackdrop();for(const {index,fn,deps}of scheduled){effects[index]?.cleanup?.();effects[index]={deps,cleanup:fn()};}return output;};
 const output=render(),cleanup=()=>{effects.forEach(effect=>effect?.cleanup?.());};
 const step=(ms=40)=>{now+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));};
 const control=(action,value)=>window.dispatchEvent(Object.assign(new Event('iavse-scene-control'),{detail:{action,value}}));
 const scroll=value=>{window.scrollY=value;window.dispatchEvent(new Event('scroll'));};
 const move=(pointerType='mouse')=>window.dispatchEvent(Object.assign(new Event('pointermove'),{pointerType,clientX:width,clientY:0}));
 const visibility=value=>{document.hidden=value;document.dispatchEvent(new Event('visibilitychange'));};
 const contextLost=()=>{const event=new Event('webglcontextlost',{cancelable:true});canvas.dispatchEvent(event);return event;};
 const replaceHost=()=>{if(currentHost)currentHost.isConnected=false;currentHost=makeHost();return currentHost;};
 const navigate=(next,{host=true}={})=>{currentPath=next;if(host)replaceHost();else{if(currentHost)currentHost.isConnected=false;currentHost=null;}render();};
 const navigation=(pending,{marker=pending}={})=>{navigationPending=marker;window.dispatchEvent(Object.assign(new Event('iavse-navigation-pending'),{detail:{pending}}));};
 return{window,document,preference,canvas,layer,attributes:initialHost?.attributes,frames,renders,sizes,attempts,output,cleanup,step,control,scroll,move,visibility,contextLost,navigate,navigation,replaceHost,mutate:()=>mutation?.(),resize:()=>window.dispatchEvent(new Event('resize')),resolve:(index=attempts.length-1)=>attempts[index].resolve(),reject:(index,error)=>attempts[index].reject(error),failResize:()=>{resizeError=true;},failRender:()=>{renderError=true;},get host(){return currentHost;},get observerDisconnected(){return observerDisconnected;},get disposes(){return disposes;},get signal(){return signal;},get createCalls(){return createCalls;}};
}

test('one field starts after loading, coalesces pointer input and respects desktop and mobile cadence',async()=>{
 for(const width of[1440,390]){
  const s=mount({width});assert.equal(s.output.props['aria-hidden'],'true');assert.equal(s.frames.size,0);
  await flush();assert.equal(s.createCalls,1);assert.deepEqual(s.sizes[0],[width,900,2]);assert.equal(s.frames.size,1);
  assert.deepEqual({...s.attempts[0].viewport},{width,height:900,dpr:2},'initial geometry uses the actual destination viewport');
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


test('reading routes share one field across new shells and return without recompiling',async()=>{
 const s=mount();await flush();s.step();const canvas=s.canvas,previous=s.host;
 s.scroll(160);s.navigate('/community');await flush();s.step();
 assert.equal(s.createCalls,1);assert.equal(s.disposes,0);assert.equal(s.canvas,canvas);assert.equal(s.layer.hidden,false);
 assert.equal(previous.attributes.size,0);assert.ok(s.host.attributes.has('data-quantum-host'));assert.ok(s.host.attributes.has('data-glass-scrolled'));
 const before=s.renders.at(-1)[0];s.navigate('/');assert.equal(s.layer.hidden,true);assert.equal(s.frames.size,0);s.step(60000);
 s.navigate('/blogs');await flush();s.step();assert.equal(s.createCalls,1);assert.equal(s.disposes,0);assert.equal(s.layer.hidden,false);
 assert.ok(s.renders.at(-1)[0]-before<.1,'inactive route time cannot fast-forward the field');s.cleanup();
});

test('home, author pages, showcase previews and embedded frames never initialize a field',async()=>{
 for(const path of ['/','/downloads','/workspace/blog','/blog/alice','/blog/alice/preview','/blogs/showcase/lin-studio','/blogs/showcase/lin-studio/preview']){
  const s=mount({path});await flush();assert.equal(s.createCalls,0,path);assert.equal(s.layer.hidden,true,path);assert.equal(s.frames.size,0);s.move();s.scroll(200);s.resize();assert.equal(s.frames.size,0);s.cleanup();
 }
 const frame=mount({iframe:true});await flush();assert.equal(frame.createCalls,0);assert.equal(frame.layer.hidden,true);frame.cleanup();
 const s=mount({path:'/'});await flush();s.navigate('/resources');await flush();assert.equal(s.createCalls,1);s.cleanup();
});

test('a shell arriving after pathname commit attaches without replacing the field',async()=>{
 const s=mount({missingHost:true});await flush();assert.equal(s.createCalls,0);assert.equal(s.layer.hidden,true);
 s.replaceHost();s.mutate();await flush();s.step();assert.equal(s.createCalls,1);assert.equal(s.layer.hidden,false);
 const previous=s.host;s.replaceHost();s.mutate();await flush();s.step();assert.equal(s.createCalls,1);assert.equal(previous.attributes.size,0);assert.ok(s.host.attributes.has('data-quantum-host'));
 s.cleanup();assert.equal(s.observerDisconnected,true);
});

test('leaving a route cancels unfinished setup and a late result is disposed before retry',async()=>{
 const s=mount({deferred:true});await flush();assert.equal(s.createCalls,1);s.navigate('/');s.resolve();await flush();
 assert.equal(s.attempts[0].signal.aborted,true);assert.equal(s.disposes,1);assert.equal(s.sizes.length,0);assert.equal(s.frames.size,0);
 s.navigate('/docs/connect');await flush();assert.equal(s.createCalls,2);s.resolve();await flush();s.step();assert.equal(s.renders.length,1);assert.equal(s.attempts[0].renders,0);s.cleanup();
});


test('an initially hidden reading route defers GPU initialization until it is visible',async()=>{
 const s=mount({hidden:true});await flush();assert.equal(s.createCalls,0);assert.equal(s.frames.size,0);
 s.visibility(false);await flush();s.step();assert.equal(s.createCalls,1);assert.equal(s.renders.length,1);s.cleanup();
});


test('temporary home pause controls cannot freeze a later reading route',async()=>{
 const s=mount({path:'/'});s.control('paused',true);s.navigate('/resources');await flush();s.step();
 assert.equal(s.canvas.dataset.field,'running');assert.equal(s.createCalls,1);
 s.control('paused',true);s.step();assert.equal(s.canvas.dataset.field,'paused');
 s.navigate('/');s.control('paused',true);s.navigate('/community');await flush();s.step();
 assert.equal(s.canvas.dataset.field,'running');assert.equal(s.createCalls,1);s.cleanup();
});

test('a handoff already active at mount defers shaders until the visible destination settles',async()=>{
 const s=mount({navigationPending:true});await flush();assert.equal(s.createCalls,0);assert.equal(s.layer.hidden,false,'the lightweight paper remains visible');
 s.move();s.scroll(180);s.resize();s.control('reduced',true);s.visibility(true);s.visibility(false);await flush();
 assert.equal(s.createCalls,0);assert.equal(s.frames.size,0,'input and visibility cannot restart GPU work during arrival');
 s.navigation(false);await flush();s.step();assert.equal(s.createCalls,1);assert.equal(s.renders.length,1);assert.equal(s.renders[0][4],true);assert.equal(s.frames.size,0);
 s.cleanup();
});

test('navigation suspends and retains the field across shell replacements and stale releases',async()=>{
 const s=mount();await flush();s.step();const time=s.renders.at(-1)[0],sizes=s.sizes.length;
 s.navigation(true);assert.equal(s.frames.size,0);s.navigate('/community');s.navigation(false,{marker:true});
 s.scroll(300);s.resize();s.move();s.step(60000);await flush();
 assert.equal(s.createCalls,1);assert.equal(s.disposes,0);assert.equal(s.sizes.length,sizes);assert.equal(s.renders.length,1);assert.equal(s.frames.size,0);
 s.navigation(false);s.step();assert.equal(s.createCalls,1);assert.equal(s.renders.length,2);assert.ok(s.renders.at(-1)[0]-time<.1,'handoff duration cannot advance the background clock');
 s.cleanup();
});

test('rapid retargeting to home and hidden destinations never starts an unused renderer',async()=>{
 const s=mount({path:'/'});s.navigation(true);s.navigate('/blogs');await flush();assert.equal(s.createCalls,0);
 s.navigate('/');s.navigation(false);await flush();assert.equal(s.createCalls,0);assert.equal(s.layer.hidden,true);
 s.navigation(true);s.navigate('/resources');s.visibility(true);s.navigation(false);await flush();assert.equal(s.createCalls,0);
 s.visibility(false);await flush();s.step();assert.equal(s.createCalls,1);assert.equal(s.renders.length,1);s.cleanup();
});

test('a chunk requested before navigation cannot compile during the handoff',async()=>{
 const s=mount();s.navigation(true);await flush();assert.equal(s.createCalls,0,'recheck suspension after the chunk resolves');
 s.navigation(false);await flush();s.step();assert.equal(s.createCalls,1);assert.equal(s.renders.length,1);s.cleanup();
});

test('navigation cancels unfinished setup but release can immediately start a fresh attempt',async()=>{
 const s=mount({deferred:true});await flush();assert.equal(s.createCalls,1);s.navigation(true);s.resolve();await flush();
 assert.equal(s.attempts[0].signal.aborted,true);assert.equal(s.disposes,1);assert.equal(s.sizes.length,0);assert.equal(s.frames.size,0);
 s.navigation(false);await flush();assert.equal(s.createCalls,2);s.resolve();await flush();s.step();assert.equal(s.renders.length,1);s.cleanup();
});

test('hidden setup is aborted and stale success or rejection cannot replace or fail its successor',async()=>{
 for(const outcome of['success','abort','error']){
  const s=mount({deferred:true});await flush();s.visibility(true);
  assert.equal(s.attempts[0].signal.aborted,true);s.visibility(false);await flush();assert.equal(s.createCalls,2);
  if(outcome==='success')s.resolve(0);else s.reject(0,outcome==='abort'?new DOMException('Aborted','AbortError'):new Error('stale driver failure'));
  await flush();assert.notEqual(s.canvas.dataset.field,'fallback');assert.equal(s.attempts[1].signal.aborted,false);
  s.resize();s.navigation(false);await flush();assert.equal(s.createCalls,2,'late failure must not clear the newer loading attempt');
  s.resolve(1);await flush();s.step();assert.equal(s.renders.length,1);assert.equal(s.attempts[0].renders,0);assert.equal(s.attempts[1].renders,1);s.cleanup();
 }
});

test('a late success cannot overwrite a fully initialized replacement',async()=>{
 const s=mount({deferred:true});await flush();s.navigation(true);s.navigation(false);await flush();
 s.resolve(1);await flush();s.step();assert.equal(s.attempts[1].renders,1);
 s.resolve(0);await flush();s.step();assert.equal(s.attempts[0].disposes,1);assert.equal(s.attempts[0].renders,0);assert.equal(s.attempts[1].renders,2);assert.equal(s.attempts[1].signal.aborted,false);s.cleanup();
});

test('active AbortError is retryable while genuine setup failure enters the fallback',async()=>{
 const s=mount({deferred:true});await flush();s.reject(0,new DOMException('Aborted','AbortError'));await flush();
 assert.notEqual(s.canvas.dataset.field,'fallback');s.visibility(true);s.visibility(false);await flush();assert.equal(s.createCalls,2);
 s.reject(1,new Error('shader link failed'));await flush();assert.equal(s.canvas.dataset.field,'fallback');assert.equal(s.attempts[1].signal.aborted,true);
 s.visibility(true);s.visibility(false);s.navigation(true);s.navigation(false);await flush();assert.equal(s.createCalls,2);s.cleanup();
});

test('a ready field retains its controller across navigation, hiding and home round trips',async()=>{
 const s=mount();await flush();const ready=s.signal;s.step();
 s.navigation(true);s.visibility(true);s.navigate('/');assert.equal(ready.aborted,false);assert.equal(s.disposes,0);
 s.navigate('/blogs');s.navigation(false);s.visibility(false);await flush();s.step();
 assert.equal(s.createCalls,1);assert.equal(ready.aborted,false);assert.equal(s.disposes,0);s.cleanup();assert.equal(ready.aborted,true);assert.equal(s.disposes,1);
});
