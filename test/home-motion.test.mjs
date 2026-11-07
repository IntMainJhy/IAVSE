import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {loadHomeScrollRefresh} from './home-refresh-fixture.mjs';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/HomeMotion.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture({reduced=false,savedReduced=false,scrollY=0,artOffset=0,copyOffset=0,layoutKey='en'}={}){
 const hooks=[],timelines=[],mediaInstances=[],frames=new Map(),listeners=new Map(),refreshListeners=new Set(),scrollEndListeners=new Set(),triggers=[],operations=[];let hookCursor=0,pending=[],frameId=0,refreshes=0,currentMedia,fontResolve;
 class Target extends EventTarget{dataset={};style={};addEventListener(name,callback,options){super.addEventListener(name,callback,options);const set=listeners.get(this)||new Set();set.add(name);listeners.set(this,set);}removeEventListener(name,callback){super.removeEventListener(name,callback);listeners.get(this)?.delete(name);}}
 const node=name=>Object.assign(new Target(),{name});
 const stories=['blog','editor','skills','resources'].map((id,index)=>{
  const scene=Object.assign(node(id),{top:1200+index*800,dataset:{homeStory:id}});
  const target=(name,offset)=>Object.assign(node(name),{offset,getBoundingClientRect(){operations.push('read '+name);return{top:scene.top+this.offset-scrollY,left:0,width:600,height:500};}});
  const art=target(id+' art',artOffset),copy=target(id+' copy',copyOffset);
  return Object.assign(scene,{art,copy,getBoundingClientRect:()=>({top:scene.top-scrollY,left:0,width:1200,height:720}),querySelector:selector=>({'.home-story-visual':art,'.home-story-copy':copy}[selector]||null)});
 });
 const closing=Object.assign(node('invitation'),{getBoundingClientRect:()=>({top:4400-scrollY})}),images=[node('first image'),node('second image')];
 const root=Object.assign(node('root'),{isConnected:true,height:5000,getBoundingClientRect(){return{top:-scrollY,left:0,width:1200,height:this.height};},querySelectorAll:selector=>selector==='img'?images:selector.includes('[data-home-story]')?stories:[],querySelector:()=>closing});
 const window=Object.assign(new Target(),{innerHeight:900}),document=Object.assign(new Target(),{hidden:false,documentElement:{hasAttribute:()=>false},fonts:{ready:new Promise(resolve=>fontResolve=resolve)}});
 class ScrollTrigger{
  constructor(animation,owner){this.animation=animation;this.calls=[];this.active=true;triggers.push(this);owner?.contexts[0].data.push(this);}
  kill(revert){this.calls.push(revert);this.active=false;this.animation.kill();}
  static isScrolling(){return false;}
  static create({animation,...options}){assert.ok(animation.steps.length,'populate a timeline before attaching its trigger');animation.options.scrollTrigger=options;return animation.scrollTrigger=new ScrollTrigger(animation,currentMedia);}
  static addEventListener(name,callback){(name==='refresh'?refreshListeners:scrollEndListeners).add(callback);}
  static removeEventListener(name,callback){(name==='refresh'?refreshListeners:scrollEndListeners).delete(callback);}
  static refresh(){refreshes++;for(const callback of refreshListeners)callback();}
 }
 const gsap={registerPlugin(){},fromTo(target,from,to){return this.timeline({scrollTrigger:to.scrollTrigger}).fromTo(target,from,to);},matchMedia(){
  const m={contexts:[{data:[]}],cleanup:null,run(){this.cleanup?.();for(const entry of this.contexts[0].data)entry.kill();this.contexts[0].data=[];if(!reduced){currentMedia=this;this.cleanup=this.callback();currentMedia=null;}},add(query,callback,scope){assert.equal(query,'(prefers-reduced-motion: no-preference)');this.callback=callback;this.scope=scope;this.run();},revert(){this.reverted=true;this.cleanup?.();for(const entry of this.contexts[0].data)entry.kill();this.contexts[0].data=[];},kill(value){this.killMode=value;for(const entry of this.contexts[0].data)entry.kill();this.contexts[0].data=[];}};mediaInstances.push(m);return m;
 },timeline(options){const t={options,steps:[],killed:false,fromTo(target,from,to,at=0){operations.push('write '+target.name);this.steps.push({target,from,to,at});return this;},kill(){this.killed=true;}};timelines.push(t);currentMedia?.contexts[0].data.push(t);if(options.scrollTrigger)t.scrollTrigger=new ScrollTrigger(t,currentMedia);return t;}};
 const requestAnimationFrame=callback=>{frames.set(++frameId,callback);return frameId;},cancelAnimationFrame=id=>frames.delete(id);
 const refreshModule=loadHomeScrollRefresh({window,document,ScrollTrigger,requestAnimationFrame,cancelAnimationFrame});
 const exports={};vm.runInNewContext(source,{exports,window,document,Event,CustomEvent,localStorage:{getItem:()=>savedReduced?'reduce':'full'},requestAnimationFrame,cancelAnimationFrame,require:name=>{
  if(name==='react')return{
   useRef:initial=>hooks[hookCursor++]||=( {current:initial}),
   useEffect:(callback,deps)=>{const index=hookCursor++,previous=hooks[index];if(!previous||deps.some((value,key)=>!Object.is(value,previous.deps[key])))pending.push(()=>{previous?.cleanup?.();hooks[index]={deps,cleanup:callback()};});}
  };
  if(name==='@/lib/home-scroll-refresh')return refreshModule;
  if(name==='gsap')return{gsap};if(name==='gsap/ScrollTrigger')return{ScrollTrigger};if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props})};throw Error('Unexpected dependency '+name);
 }});
 const render=key=>{hookCursor=0;const tree=exports.HomeMotion({layoutKey:key});tree.props.ref.current={closest:()=>root};const queued=pending;pending=[];queued.forEach(callback=>callback());};
 const cleanup=()=>hooks.forEach(hook=>hook.cleanup?.());render(layoutKey);
 return{root,stories,closing,images,window,listeners,timelines,triggers,mediaInstances,frames,refreshListeners,scrollEndListeners,operations,cleanup,layout:render,resolveFont:()=>fontResolve(),get refreshes(){return refreshes;},flush(){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback());},control(value){window.dispatchEvent(new CustomEvent('iavse-scene-control',{detail:{action:'reduced',value}}));},systemReduce(value){reduced=value;mediaInstances.at(-1)?.run();}};
}

test('sections stay in native flow with one-time reveals and no scroll or interaction takeover',()=>{
 const f=fixture();assert.equal(f.root.dataset.journeyMotion,'flow');assert.equal(f.timelines.length,9);
 assert.ok(!f.listeners.get(f.root)?.has('click'));assert.ok(!f.listeners.get(f.window)?.has('wheel'));assert.ok(!f.listeners.get(f.window)?.has('touchmove'));
 for(const timeline of f.timelines){const trigger=timeline.options.scrollTrigger;assert.equal(trigger.once,true);assert.equal(trigger.pin,undefined);assert.equal(trigger.scrub,undefined);assert.equal(trigger.snap,undefined);for(const step of timeline.steps){assert.ok(step.from.opacity>=.6,'content is readable even before the entrance finishes');assert.equal(step.to.opacity,1);assert.ok(step.to.clearProps);}}
 assert.ok(f.stories.every(scene=>scene.inert!==true));f.cleanup();
});

test('art and copy use their own viewport edges with limited travel and fast-scroll completion',()=>{
 const f=fixture({artOffset:240});for(const scene of f.stories){
  for(const target of [scene.art,scene.copy]){const timeline=f.timelines.find(t=>t.options.scrollTrigger.trigger===target);assert.equal(timeline.steps.length,1);assert.equal(timeline.steps[0].target,target);assert.equal(timeline.options.defaults.duration,.9);assert.equal(timeline.options.defaults.ease,'power2.out');assert.equal(timeline.options.scrollTrigger.start,'top bottom');assert.equal(timeline.options.scrollTrigger.fastScrollEnd,true);}
  const art=f.timelines.find(t=>t.options.scrollTrigger.trigger===scene.art).steps[0],copy=f.timelines.find(t=>t.options.scrollTrigger.trigger===scene.copy).steps[0];assert.equal(art.from.opacity,copy.from.opacity);assert.ok(copy.from.y<=10);assert.ok((art.from.y||0)<=14);if(['editor','resources'].includes(scene.dataset.homeStory))for(const key of ['x','y','z','scale','rotation','clipPath']){assert.equal(art.from[key],undefined);assert.equal(art.to[key],undefined);}
 }
 const firstWrite=f.operations.findIndex(operation=>operation.startsWith('write '));assert.equal(f.operations.slice(0,firstWrite).filter(operation=>operation.startsWith('read ')).length,8);assert.ok(f.operations.slice(firstWrite).every(operation=>operation.startsWith('write ')),'all product visibility reads precede GSAP start writes');
 f.cleanup();
});

test('restored sections keep their existing presentation and only future sections get fully populated triggers',async()=>{
 const bottom=fixture({scrollY:4800});assert.equal(bottom.timelines.length,0);bottom.images.forEach(image=>image.dispatchEvent(new Event('load')));bottom.resolveFont();await Promise.resolve();bottom.flush();assert.equal(bottom.refreshes,0,'no entrance means no global refresh or scroll restoration writes');bottom.cleanup();
 const middle=fixture({scrollY:1800});assert.deepEqual(middle.timelines.map(t=>t.options.scrollTrigger.trigger.name),['skills art','skills copy','resources art','resources copy','invitation']);assert.ok(middle.timelines.slice(0,-1).every(t=>t.options.paused===true));middle.cleanup();
 const stacked=fixture({scrollY:500,artOffset:240});assert.ok(stacked.timelines.some(t=>t.options.scrollTrigger.trigger===stacked.stories[0].art),'a future visual retains its own entrance even when its section is already visible');assert.ok(!stacked.timelines.some(t=>t.options.scrollTrigger.trigger===stacked.stories[0].copy),'restored visible copy is never dimmed or moved again');stacked.cleanup();
});

test('manual and system reduced motion leave all sections readable and restore entrances safely',()=>{
 for(const options of [{reduced:true},{savedReduced:true}]){const f=fixture(options);assert.equal(f.timelines.length,0);assert.equal(f.root.dataset.journeyMotion,undefined);assert.ok(f.stories.every(s=>s.inert!==true));f.layout('ja');assert.equal(f.frames.size,0,'locale commits do not introduce animation or refresh work in quiet mode');f.cleanup();}
 const f=fixture(),first=[...f.timelines];f.control(true);assert.ok(first.every(t=>t.killed));assert.equal(f.root.dataset.journeyMotion,undefined);f.control(false);assert.equal(f.root.dataset.journeyMotion,'flow');f.systemReduce(true);assert.equal(f.root.dataset.journeyMotion,undefined);f.systemReduce(false);assert.equal(f.root.dataset.journeyMotion,'flow');f.cleanup();
});

test('server locale layout commits share refresh work without rebuilding or replaying entrances',async()=>{
 const f=fixture();f.flush();assert.equal(f.refreshes,1);const initialTimelines=[...f.timelines],initialMedia=[...f.mediaInstances];
 f.stories[1].copy.offset+=60;f.layout('zh');f.layout('ja');f.images[0].dispatchEvent(new Event('load'));f.resolveFont();await Promise.resolve();assert.equal(f.frames.size,1,'server locale, media and font notifications share the existing refresh queue');f.flush();assert.equal(f.refreshes,2,'text can move a target inside an unchanged fixed-height section');
 assert.deepEqual(f.timelines,initialTimelines);assert.deepEqual(f.mediaInstances,initialMedia);assert.ok(initialTimelines.every(timeline=>!timeline.killed),'locale commits retain existing entrance progress');f.layout('ja');assert.equal(f.frames.size,0,'unchanged locale keys do not request another refresh');
 f.images[0].dispatchEvent(new Event('load'));f.flush();assert.equal(f.refreshes,2,'ordinary stable media notifications retain geometry deduplication');f.layout('en');assert.equal(f.frames.size,1);f.cleanup();assert.equal(f.frames.size,0,'cleanup cancels a queued locale refresh');
});

test('font and image refreshes coalesce, and cleanup cancels late work without changing other animations',async()=>{
 const f=fixture();f.images.forEach(image=>image.dispatchEvent(new Event('load')));f.resolveFont();await Promise.resolve();assert.equal(f.frames.size,1);f.flush();assert.equal(f.refreshes,1);assert.equal(f.frames.size,0);f.cleanup();assert.ok(f.mediaInstances.every(m=>m.reverted));assert.ok(f.timelines.every(t=>t.killed));assert.equal(f.refreshListeners.size,0);assert.equal(f.scrollEndListeners.size,0);assert.ok([...f.listeners.values()].every(set=>set.size===0));
 const late=fixture();late.cleanup();late.resolveFont();await Promise.resolve();late.images[0].dispatchEvent(new Event('load'));assert.equal(late.frames.size,0);
 const detached=fixture();detached.root.isConnected=false;detached.cleanup();assert.ok(detached.mediaInstances.every(m=>m.killMode===false&&!m.reverted));assert.ok(detached.triggers.every(t=>t.calls.length===1&&t.calls[0]===false));assert.ok(detached.timelines.every(t=>t.killed));
});
