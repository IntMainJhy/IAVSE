import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/HomeMotion.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture({desktop=true,reduced=false,savedReduced=false}={}){
 const effects=[],timelines=[],mediaInstances=[],frames=new Map(),events=[],listeners=new Map(),refreshListeners=new Set();let frameId=0,refreshes=0,conditions={desktop,compact:!desktop,reduce:reduced},currentMedia,fontResolve;
 class Target extends EventTarget{dataset={};style={};addEventListener(name,callback,options){super.addEventListener(name,callback,options);const set=listeners.get(this)||new Set();set.add(name);listeners.set(this,set);}removeEventListener(name,callback){super.removeEventListener(name,callback);listeners.get(this)?.delete(name);}}
 const node=name=>Object.assign(new Target(),{name});
 const stories=['blog','editor','skills','resources'].map((id,index)=>{const art=node(id+' art'),copy=node(id+' copy');return Object.assign(node(id),{dataset:{homeStory:id,homeSide:index%2?'right':'left'},art,copy,querySelector:selector=>({'.home-story-visual':art,'.home-story-copy':copy}[selector]||null)});});
 const title=node('closing title'),actions=node('closing actions'),closing=Object.assign(node('invitation'),{dataset:{homeScene:'invitation'},querySelector:selector=>({h2:title,':scope > div':actions}[selector]||null)}),images=[node('first image'),node('second image')];
 const root=Object.assign(node('root'),{querySelectorAll:selector=>selector==='img'?images:stories,querySelector:()=>closing});
 const window=Object.assign(new Target(),{dispatchEvent(event){events.push(event.type);return EventTarget.prototype.dispatchEvent.call(this,event);}});
 const document={fonts:{ready:new Promise(resolve=>fontResolve=resolve)}};
 const ScrollTrigger={addEventListener:(name,callback)=>refreshListeners.add(callback),removeEventListener:(name,callback)=>refreshListeners.delete(callback),refresh(){refreshes++;for(const callback of refreshListeners)callback();}};
 const ignored=new Set(['duration','ease','immediateRender','clearProps','overwrite']);
 const gsap={registerPlugin(){},matchMedia(){
  const media={reverted:false,callback:null,scope:null,cleanup:null,owned:[],run(){this.cleanup?.();for(const timeline of this.owned)timeline.kill();this.owned=[];const previous=currentMedia;currentMedia=this;this.cleanup=this.callback({conditions});currentMedia=previous;},add(queries,callback,scope){this.callback=callback;this.scope=scope;this.run();},revert(){if(this.reverted)return;this.reverted=true;this.cleanup?.();for(const timeline of this.owned)timeline.kill();this.owned=[];}};mediaInstances.push(media);return media;
 },timeline(options){
  const steps=[],original=new Map();
  const remember=target=>{if(!original.has(target))original.set(target,{...target.style});};
  const timeline={options,steps,killed:false,fromTo(target,from,to,at=0){remember(target);steps.push({target,from,to,at});return this;},to(target,to,at=0){remember(target);steps.push({target,from:null,to,at});return this;},render(progress){
   for(const[target,style]of original){for(const key of Object.keys(target.style))delete target.style[key];Object.assign(target.style,style);}
   const duration=Math.max(...steps.map(step=>step.at+(step.to.duration||0)),1),time=progress*duration;
   for(const step of steps){if(time<step.at)continue;const ratio=Math.max(0,Math.min(1,(time-step.at)/(step.to.duration||1))),from=step.from||{...step.target.style};for(const[key,value]of Object.entries({...from,...step.to})){if(ignored.has(key))continue;const start=from[key]??(key==='opacity'||key==='scale'?1:0),end=step.to[key]??value;step.target.style[key]=typeof start==='number'&&typeof end==='number'?start+(end-start)*ratio:end;}}
  },kill(){this.killed=true;for(const[target,style]of original){for(const key of Object.keys(target.style))delete target.style[key];Object.assign(target.style,style);}}};timelines.push(timeline);currentMedia?.owned.push(timeline);return timeline;
 }};
 const exports={};vm.runInNewContext(source,{exports,window,document,Event,CustomEvent,localStorage:{getItem:()=>savedReduced?'reduce':'full'},requestAnimationFrame:callback=>{frames.set(++frameId,callback);return frameId;},cancelAnimationFrame:id=>frames.delete(id),require:name=>{
  if(name==='react')return{useEffect:callback=>effects.push(callback),useRef:()=>({current:{closest:()=>root}})};
  if(name==='gsap')return{gsap};if(name==='gsap/ScrollTrigger')return{ScrollTrigger};if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props})};throw Error('Unexpected dependency '+name);
 }});
 const output=exports.HomeMotion(),cleanup=effects[0](),flush=()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback());};
 const control=(action,value)=>window.dispatchEvent(new CustomEvent('iavse-scene-control',{detail:{action,value}}));
 const systemReduce=value=>{conditions={...conditions,reduce:value};mediaInstances.at(-1)?.run();};
 return{output,root,stories,title,actions,images,window,events,listeners,timelines,mediaInstances,frames,refreshListeners,control,systemReduce,cleanup,flush,resolveFont:()=>fontResolve(),get refreshes(){return refreshes;}};
}

test('the native-scroll edit approaches, holds an operable middle, leaves, and reverses with the scroll',()=>{
 const f=fixture();assert.equal(f.output.type,'span');assert.equal(f.output.props.hidden,true);assert.equal(f.root.dataset.journeyMotion,'full');assert.equal(f.timelines.length,5);assert.equal(f.mediaInstances[0].scope,f.root);
 for(const timeline of f.timelines){assert.ok(timeline.options.scrollTrigger.scrub>0);assert.equal(timeline.options.scrollTrigger.pin,undefined,'the page keeps its native document flow');assert.equal(timeline.options.scrollTrigger.toggleActions,undefined);assert.equal(timeline.options.defaults.ease,'none');}
 const blog=f.timelines.find(t=>t.options.scrollTrigger.id==='iavse-story-blog'),art=f.stories[0].art;
 assert.deepEqual(art.style,{},'SSR content is not pre-hidden before scroll sampling');blog.render(.08);assert.ok(art.style.rotationY>0&&art.style.x<0);assert.ok(art.style.opacity>=.8);
 blog.render(.4);const settled={...art.style};assert.equal(settled.rotationY,0);assert.equal(settled.scale,1);assert.equal(settled.opacity,1);
 blog.render(.7);assert.deepEqual(art.style,settled,'the central reading interval has no continuing DOM drift');blog.render(.95);assert.ok(art.style.y<0&&art.style.rotationY<0);
 blog.render(.5);assert.deepEqual(art.style,settled,'reverse scrolling restores the same product-facing composition');f.cleanup();
});

test('editing and WebGL card coordinates stay exact while their copy and optical edge can move',()=>{
 const f=fixture();for(const id of['editor','resources']){const scene=f.stories.find(row=>row.dataset.homeStory===id),timeline=f.timelines.find(t=>t.options.scrollTrigger.id==='iavse-story-'+id);for(const progress of[.1,.5,.95]){timeline.render(progress);assert.ok(scene.art.style.opacity>=.9);assert.equal(scene.art.style.x,undefined);assert.equal(scene.art.style.y,undefined);assert.equal(scene.art.style.scale,undefined);assert.equal(scene.art.style.rotationY,undefined);assert.ok('--journey-focus' in scene.art.style);}}
 const left=f.timelines.find(t=>t.options.scrollTrigger.id==='iavse-story-blog'),right=f.timelines.find(t=>t.options.scrollTrigger.id==='iavse-story-editor');left.render(.1);right.render(.1);assert.ok(f.stories[0].copy.style.x>0);assert.ok(f.stories[1].copy.style.x<0,'alternating stories approach from opposite sides');f.cleanup();
 const compact=fixture({desktop:false});for(const timeline of compact.timelines){timeline.render(.1);for(const step of timeline.steps){if(step.target.name.endsWith(' art'))assert.equal(step.target.style.rotationY??0,0);}}compact.cleanup();
});

test('saved and system reduction remove the long stages and every timeline, and manual restoration rebuilds once',()=>{
 for(const options of[{reduced:true},{savedReduced:true}]){const f=fixture(options);assert.equal(f.timelines.length,0);assert.equal(f.root.dataset.journeyMotion,undefined);f.cleanup();}
 const f=fixture();const first=[...f.timelines];first[0].render(.1);first[0].options.scrollTrigger.onToggle({isActive:true});assert.equal(f.stories[0].dataset.journeyActive,'true');
 f.control('paused',true);assert.equal(f.timelines.length,5,'background pause does not disable native-scroll choreography');f.control('reduced',true);assert.ok(first.every(t=>t.killed));assert.equal(f.root.dataset.journeyMotion,undefined);assert.equal(f.stories[0].dataset.journeyActive,undefined);assert.deepEqual(f.stories[0].art.style,{});
 first[0].options.scrollTrigger.onToggle({isActive:true});assert.equal(f.stories[0].dataset.journeyActive,undefined,'stale callbacks cannot re-promote a released layer');
 f.control('reduced',false);assert.equal(f.timelines.length,10);assert.equal(f.root.dataset.journeyMotion,'full');f.systemReduce(true);assert.ok(f.timelines.every(t=>t.killed));assert.equal(f.root.dataset.journeyMotion,undefined);f.systemReduce(false);assert.equal(f.timelines.length,15);assert.equal(f.root.dataset.journeyMotion,'full');f.cleanup();
});

test('layout refreshes coalesce and notify the shared scene without adding a continuous frame loop',async()=>{
 const f=fixture();assert.equal(f.frames.size,1);f.images[0].dispatchEvent(new Event('load'));f.images[1].dispatchEvent(new Event('load'));f.resolveFont();await Promise.resolve();assert.equal(f.frames.size,1,'fonts and images share one layout refresh');f.flush();assert.equal(f.refreshes,1);assert.equal(f.frames.size,0,'idle DOM stories have no animation frame loop');assert.ok(f.events.filter(name=>name==='iavse-journey-layout').length>=2);f.cleanup();
});

test('cleanup releases timelines, promoted layers, image listeners, refresh callbacks and late font work',async()=>{
 const f=fixture();f.timelines[0].options.scrollTrigger.onToggle({isActive:true});f.timelines[0].render(.1);f.cleanup();assert.ok(f.mediaInstances.every(media=>media.reverted));assert.ok(f.timelines.every(t=>t.killed));assert.equal(f.frames.size,0);assert.equal(f.refreshListeners.size,0);assert.equal(f.root.dataset.journeyMotion,undefined);assert.equal(f.stories[0].dataset.journeyActive,undefined);assert.ok([...f.listeners.values()].every(set=>set.size===0));
 const count=f.timelines.length;f.control('reduced',false);f.resolveFont();await Promise.resolve();assert.equal(f.timelines.length,count);assert.equal(f.frames.size,0);assert.deepEqual(f.stories[0].art.style,{});
});
