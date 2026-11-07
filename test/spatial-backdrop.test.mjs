import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/SpatialBackdrop.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};

function mount({mode='gallery',reduced=false,savedReduced=false,hidden=false,navigationPending=false,deferred=false,viewportWidth=1440,viewportHeight=900,scrollY=0,galleryTop=0}={}){
 let width=viewportWidth,height=viewportHeight,now=1000,id=0;
 class Target extends EventTarget{
  listeners=new Map();attributes=new Set();dataset={};isConnected=true;rectReads=0;
  style={setProperty(name,value){this[name]=value;},removeProperty(name){delete this[name];},getPropertyValue(name){return this[name]||'';}};
  addEventListener(name,fn,options){super.addEventListener(name,fn,options);if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
  removeEventListener(name,fn,options){super.removeEventListener(name,fn,options);this.listeners.get(name)?.delete(fn);if(!this.listeners.get(name)?.size)this.listeners.delete(name);}
  hasAttribute(name){return this.attributes.has(name);}setAttribute(name){this.attributes.add(name);}removeAttribute(name){this.attributes.delete(name);}
  getBoundingClientRect(){this.rectReads++;return{left:0,top:0,right:width,bottom:height,width,height};}
 }
 const root=new Target(),preference=Object.assign(new Target(),{matches:reduced}),host=new Target(),surface=new Target(),canvas=Object.assign(new Target(),{width:300,height:150,parentElement:surface});
 const window=Object.assign(new Target(),{innerWidth:width,innerHeight:height,scrollY,devicePixelRatio:2,matchMedia:()=>preference,localStorage:{getItem:()=>savedReduced?'reduce':null}});
 window.self=window;window.top=window;
 const document=Object.assign(new Target(),{hidden,documentElement:root,body:host,querySelector:()=>host});
 const hostRect=host.getBoundingClientRect.bind(host);host.getBoundingClientRect=()=>{const rect=hostRect(),top=galleryTop-window.scrollY;return{...rect,top,bottom:top+height};};
 surface.parentElement=host;surface.closest=()=>host;canvas.closest=selector=>selector.includes('.spatial-backdrop')?surface:host;
 if(navigationPending)root.setAttribute('data-iavse-transition');
 const frames=new Map(),attempts=[],renders=[],sizes=[],resizes=[],intersections=[],mutations=[],exports={};
 let renderError=false,resizeError=false;
 class Resize{constructor(fn){this.fn=fn;this.targets=new Set();resizes.push(this);}observe(target){this.targets.add(target);}disconnect(){this.disconnected=true;this.targets.clear();}}
 class Intersection{constructor(fn){this.fn=fn;this.targets=new Set();intersections.push(this);}observe(target){this.targets.add(target);}disconnect(){this.disconnected=true;this.targets.clear();}}
 class Mutation{constructor(fn){this.fn=fn;mutations.push(this);}observe(){}disconnect(){this.disconnected=true;}}
 const requestAnimationFrame=fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame=key=>frames.delete(key);
 Object.assign(window,{requestAnimationFrame,cancelAnimationFrame});
 vm.runInNewContext(source,{exports,window,document,AbortController,DOMException,Math,performance:{now:()=>now},ResizeObserver:Resize,IntersectionObserver:Intersection,MutationObserver:Mutation,matchMedia:()=>preference,localStorage:window.localStorage,devicePixelRatio:2,innerWidth:width,innerHeight:height,requestAnimationFrame,cancelAnimationFrame,require:name=>{
  if(name==='react')return{useEffect(){},useRef(){}};
  if(name==='react/jsx-runtime')return{jsx(){},jsxs(){}};
  throw Error('Unexpected dependency '+name);
 }});
 const cleanup=exports.mountSpatialBackdrop(canvas,mode,(input,signal,requestedMode)=>{
  const attempt={canvas:input,signal,mode:requestedMode,renders:[],sizes:[],disposes:0};attempts.push(attempt);
  const scene={resize:(...args)=>{if(resizeError)throw Error('Resize failed');attempt.sizes.push(args);sizes.push(args);},render:frame=>{if(renderError)throw Error('Render failed');const snapshot={...frame};attempt.renders.push(snapshot);renders.push(snapshot);},dispose:()=>attempt.disposes++};
  const pending=new Promise((resolve,reject)=>{attempt.resolve=()=>resolve(scene);attempt.reject=reject;});
  if(!deferred)attempt.resolve();return pending;
 });
 const dispatch=(target,name,values={})=>target.dispatchEvent(Object.assign(new Event(name),values));
 const intersect=visible=>{for(const observer of intersections)observer.fn([...observer.targets].map(target=>({target,isIntersecting:visible,intersectionRatio:visible?1:0})));};
 const resize=(nextWidth=width,nextHeight=height)=>{width=nextWidth;height=nextHeight;window.innerWidth=width;window.innerHeight=height;for(const observer of resizes)observer.fn([...observer.targets].map(target=>({target,contentRect:{width,height}})));};
 const move=(x=width,y=0,pointerType='mouse')=>{for(const target of [window,host,surface,canvas])if(target.listeners.has('pointermove'))dispatch(target,'pointermove',{clientX:x,clientY:y,pointerType});};
 const scroll=value=>{window.scrollY=value;dispatch(window,'scroll');};
 const visibility=value=>{document.hidden=value;dispatch(document,'visibilitychange');};
 const navigation=(pending,{marker=pending}={})=>{if(marker)root.setAttribute('data-iavse-transition');else root.removeAttribute('data-iavse-transition');dispatch(window,'iavse-navigation-pending',{detail:{pending}});};
 const control=(action,value)=>dispatch(window,'iavse-scene-control',{detail:{action,value}});
 const step=(ms=16)=>{now+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));};
 const settle=(max=500)=>{let count=0;while(frames.size&&count++<max)step();assert.equal(frames.size,0,'input must converge to an idle scene');};
 const reads=()=>canvas.rectReads+surface.rectReads+host.rectReads;
 const listenerCount=()=>[window,document,root,host,surface,canvas,preference].reduce((sum,target)=>sum+[...target.listeners.values()].reduce((count,set)=>count+set.size,0),0);
 return{window,document,root,host,surface,canvas,preference,frames,attempts,renders,sizes,resizes,intersections,mutations,intersect,resize,move,scroll,visibility,navigation,control,step,settle,reads,listenerCount,cleanup,dispatch,resolve:(index=attempts.length-1)=>attempts[index].resolve(),reject:(index=attempts.length-1)=>attempts[index].reject(Error('Scene unavailable')),failRender:()=>{renderError=true;},failResize:()=>{resizeError=true;}};
}

test('each background loads only when visible and uses one scene for its destination mode',async()=>{
 for(const mode of ['gallery','community']){
  const s=mount({mode});await flush();s.move();s.scroll(300);s.resize();await flush();
  assert.equal(s.attempts.length,0);assert.equal(s.frames.size,0,'offscreen inputs cannot initialize GPU work');
  s.intersect(true);await flush();s.step();assert.equal(s.attempts.length,1);assert.equal(s.attempts[0].canvas,s.canvas);assert.equal(s.attempts[0].mode,mode);assert.ok(s.sizes.length>0);assert.ok(s.renders.length>0);
  s.intersect(true);await flush();assert.equal(s.attempts.length,1,'observer wakeups retain the prepared scene');s.cleanup();
 }
});

test('a gallery keeps its clock while visible and coalesces pointer and resize work into display frames',async()=>{
 const s=mount();s.intersect(true);await flush();s.step();const first=s.renders.at(-1).time;
 s.step(1000/144);s.step(1000/144);assert.ok(s.renders.at(-1).time>first);assert.equal(s.frames.size,1);
 const reads=s.reads(),draws=s.renders.length;
 for(let i=0;i<30;i++)s.move(700+i*20,100+i*5);
 assert.equal(s.reads(),reads,'pointer handlers do not measure the scene');assert.equal(s.renders.length,draws);assert.equal(s.frames.size,1);
 s.step();assert.ok(s.renders.length>draws);assert.ok(Math.abs(s.renders.at(-1).x)<=1&&Math.abs(s.renders.at(-1).y)<=1);
 const sizes=s.sizes.length,before=s.reads(),painted=s.renders.length;for(let i=0;i<20;i++)s.resize(1200,780);
 assert.equal(s.reads(),before,'resize observer callbacks defer layout reads');assert.equal(s.sizes.length,sizes);assert.equal(s.renders.length,painted);
 s.step();assert.equal(s.sizes.length,sizes+1);assert.deepEqual(s.sizes.at(-1).slice(0,2),[1200,780]);assert.equal(s.frames.size,1);s.cleanup();
});

test('community movement and scroll settle to idle without a permanent animation loop',async()=>{
 const s=mount({mode:'community'});s.intersect(true);await flush();s.settle();const initial=s.renders.length,reads=s.reads();
 s.move(1200,120,'touch');assert.equal(s.frames.size,0,'touch gestures remain owned by native page scrolling');
 for(let i=0;i<20;i++)s.move(1200,120);assert.equal(s.reads(),reads);assert.equal(s.frames.size,1);s.settle();assert.ok(s.renders.length>initial);
 const count=s.renders.length,time=s.renders.at(-1).time;s.step(60000);assert.equal(s.renders.length,count,'a still community submits no GPU frames');
 s.scroll(1800);assert.equal(s.frames.size,1);s.step();assert.ok(s.renders.at(-1).time-time<.1,'idle wall time is not replayed');s.settle();assert.ok(s.renders.length>count);s.cleanup();
});

test('restored gallery scrolling uses its actual first composition and mobile rendering stays within its budget',async()=>{
 const restored=mount({scrollY:2700,galleryTop:1800});restored.intersect(true);await flush();restored.step();assert.equal(restored.renders[0].scroll,1,'the first visible frame starts at the restored chapter position');restored.cleanup();
 const resumed=mount({mode:'community'});resumed.intersect(true);await flush();resumed.settle();const reads=resumed.reads();
 resumed.visibility(true);resumed.scroll(2700);resumed.visibility(false);resumed.settle();assert.ok(Math.abs(resumed.renders.at(-1).scroll-3)<.002,'a prepared scene refreshes scroll input after a hidden jump without another scroll event');assert.equal(resumed.reads(),reads,'resuming input does not measure layout');resumed.cleanup();
 const mobile=mount({viewportWidth:390,viewportHeight:844});mobile.intersect(true);await flush();mobile.step();const [width,height,dpr]=mobile.sizes[0];
 assert.equal(width,390);assert.equal(height,844);assert.ok(dpr>0&&dpr<=1.5);assert.ok(width*height*dpr**2<=550001,'the full viewport cannot exceed the mobile framebuffer budget');
 const first=mobile.renders.length;for(let i=0;i<120;i++)mobile.step(1000/120);const draws=mobile.renders.length-first;assert.ok(draws>=25&&draws<=32,'a high-refresh phone keeps the intended 30fps scene cadence');assert.equal(mobile.frames.size,1);mobile.cleanup();
});

test('hidden, offscreen, print and navigation suspension retain a ready scene without rendering or advancing its clock',async()=>{
 const s=mount();s.intersect(true);await flush();s.step();
 for(const [pause,resume]of[
  [()=>s.visibility(true),()=>s.visibility(false)],
  [()=>s.intersect(false),()=>s.intersect(true)],
  [()=>s.dispatch(s.window,'beforeprint'),()=>s.dispatch(s.window,'afterprint')],
  [()=>s.navigation(true),()=>s.navigation(false)]
 ]){
  const count=s.renders.length,time=s.renders.at(-1).time,sizes=s.sizes.length,reads=s.reads();pause();assert.equal(s.frames.size,0);
  s.move();s.scroll(1000);s.resize(1280,800);s.step(60000);assert.equal(s.renders.length,count);assert.equal(s.sizes.length,sizes);assert.equal(s.reads(),reads);
  resume();await flush();s.step();assert.ok(s.renders.length>count);assert.ok(s.renders.at(-1).time-time<.1);assert.equal(s.attempts.length,1);assert.equal(s.attempts[0].disposes,0);
 }
 s.cleanup();
});

test('an existing navigation handoff defers creation and stale releases cannot resume it',async()=>{
 const s=mount({navigationPending:true});s.intersect(true);await flush();assert.equal(s.attempts.length,0);
 s.navigation(false,{marker:true});s.move();s.resize();await flush();assert.equal(s.attempts.length,0);assert.equal(s.frames.size,0);
 s.navigation(false);await flush();s.step();assert.equal(s.attempts.length,1);assert.ok(s.renders.length>0);s.cleanup();
});

test('suspending unfinished setup aborts it and disposes late scenes before a replacement can draw',async()=>{
 for(const [pause,resume]of[
  [s=>s.visibility(true),s=>s.visibility(false)],
  [s=>s.navigation(true),s=>s.navigation(false)],
  [s=>s.dispatch(s.window,'beforeprint'),s=>s.dispatch(s.window,'afterprint')]
 ]){
  const s=mount({deferred:true});s.intersect(true);await flush();assert.equal(s.attempts.length,1);pause(s);assert.equal(s.attempts[0].signal.aborted,true);assert.equal(s.frames.size,0);
  s.resolve(0);await flush();assert.equal(s.attempts[0].disposes,1);assert.equal(s.sizes.length+s.renders.length,0);
  resume(s);await flush();assert.equal(s.attempts.length,2);s.resolve(1);await flush();s.step();assert.ok(s.attempts[1].renders.length>0);assert.equal(s.attempts[0].renders.length,0);s.cleanup();
 }
});

test('late success or rejection from an abandoned setup cannot replace or fail the current scene',async()=>{
 for(const outcome of ['success','error']){
  const s=mount({deferred:true});s.intersect(true);await flush();s.navigation(true);s.navigation(false);await flush();assert.equal(s.attempts.length,2);assert.equal(s.attempts[0].signal.aborted,true);
  s.resolve(1);await flush();s.step();const count=s.attempts[1].renders.length;
  if(outcome==='success')s.resolve(0);else s.reject(0);await flush();s.step();
  assert.equal(s.attempts[0].renders.length,0);assert.equal(s.attempts[0].disposes,outcome==='success'?1:0);assert.ok(s.attempts[1].renders.length>count);assert.notEqual(s.canvas.dataset.spatial,'fallback');assert.equal(s.attempts.length,2);s.cleanup();
 }
});

test('reduced motion renders a static composition with zero time, pointer and scroll',async()=>{
 for(const options of [{reduced:true},{savedReduced:true}]){
  const s=mount(options);s.intersect(true);await flush();s.settle();assert.equal(s.renders.at(-1).reduced,true);
  s.move();s.scroll(1800);s.resize(1000,700);s.settle();const frame=s.renders.at(-1);
  assert.equal(frame.time,0);assert.equal(frame.x,0);assert.equal(frame.y,0);assert.equal(frame.scroll,0);assert.equal(frame.reduced,true);s.cleanup();
 }
 const s=mount();s.intersect(true);await flush();s.step();s.control('reduced',true);s.settle();assert.equal(s.renders.at(-1).reduced,true);
 s.preference.matches=true;s.dispatch(s.preference,'change',{matches:true});s.control('reduced',false);s.settle();assert.equal(s.renders.at(-1).reduced,true,'manual full motion cannot override a system preference');
 s.preference.matches=false;s.dispatch(s.preference,'change',{matches:false});s.step();assert.equal(s.renders.at(-1).reduced,false);assert.equal(s.frames.size,1);s.cleanup();
});

test('manual pause preserves the clock across input and lifecycle wakeups until explicitly resumed',async()=>{
 const s=mount();s.intersect(true);await flush();s.step();s.control('paused',true);s.settle();const time=s.renders.at(-1).time;
 s.move();s.scroll(500);s.resize();s.settle();assert.equal(s.renders.at(-1).time,time);s.navigation(true);s.step(60000);s.navigation(false);await flush();s.settle();assert.equal(s.renders.at(-1).time,time);
 s.control('paused',false);s.step();assert.ok(s.renders.at(-1).time>time);assert.equal(s.attempts.length,1);s.cleanup();
});

test('load, resize, render and context failures stop work and release scene ownership',async()=>{
 for(const failure of ['load','resize','render','context']){
  const s=mount({deferred:failure==='load'});s.intersect(true);await flush();
  if(failure==='load')s.reject();else{
   s.step();if(failure==='resize'){s.failResize();s.resize(1000,700);s.step();}
   if(failure==='render'){s.failRender();s.step();}
   if(failure==='context'){const lost=new Event('webglcontextlost',{cancelable:true});s.canvas.dispatchEvent(lost);assert.equal(lost.defaultPrevented,true);}
  }
  await flush();assert.equal(s.frames.size,0);assert.equal(s.canvas.dataset.spatial,'fallback');if(failure!=='load')assert.equal(s.attempts[0].disposes,1);
  const count=s.renders.length;s.move();s.scroll(300);s.resize();s.intersect(true);s.visibility(true);s.visibility(false);s.step();await flush();assert.equal(s.renders.length,count);assert.equal(s.attempts.length,1,'failed scenes do not recreate themselves on input');
  s.cleanup();if(failure!=='load')assert.equal(s.attempts[0].disposes,1);
 }
});

test('unmount removes listeners, observers and pending work, including scenes that finish loading late',async()=>{
 for(const deferred of [false,true]){
  const s=mount({deferred});s.intersect(true);await flush();if(!deferred){s.step();s.resize(1000,700);s.move();}
  s.cleanup();assert.equal(s.frames.size,0);assert.equal(s.listenerCount(),0);if(deferred)assert.equal(s.attempts[0].signal.aborted,true);
  assert.ok(s.resizes.every(observer=>observer.disconnected));assert.ok(s.intersections.every(observer=>observer.disconnected));
  if(deferred){s.resolve();await flush();}
  assert.equal(s.attempts[0].disposes,1);const reads=s.reads(),count=s.renders.length;
  s.move();s.scroll(300);s.resize();s.intersect(true);s.navigation(false);s.visibility(false);s.control('paused',false);s.dispatch(s.window,'afterprint');s.step();await flush();
  assert.equal(s.reads(),reads);assert.equal(s.renders.length,count);assert.equal(s.frames.size,0);assert.equal(s.attempts.length,1);
 }
});
