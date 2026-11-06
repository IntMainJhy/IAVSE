import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/HomeMotion.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture({desktop=true,reduced=false,savedReduced=false}={}){
 const effects=[],timelines=[],mediaInstances=[],frames=new Map(),events=[],listeners=new Map(),refreshListeners=new Set(),triggers=[];let frameId=0,refreshes=0,conditions={desktop,compact:!desktop,reduce:reduced},currentMedia,fontResolve;
 class Target extends EventTarget{dataset={};style={};attributes={};setAttribute(k,v){this.writes=(this.writes||0)+1;this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];}addEventListener(name,callback,options){super.addEventListener(name,callback,options);const set=listeners.get(this)||new Set();set.add(name);listeners.set(this,set);}removeEventListener(name,callback){super.removeEventListener(name,callback);listeners.get(this)?.delete(name);}}
 const node=name=>Object.assign(new Target(),{name});
 const stories=['blog','editor','skills','resources'].map((id,index)=>{const art=node(id+' art'),copy=node(id+' copy');return Object.assign(node(id),{dataset:{homeStory:id,homeSide:index%2?'right':'left'},art,copy,querySelector:selector=>({'.home-story-visual':art,'.home-story-copy':copy}[selector]||null),querySelectorAll:()=>[art,copy]});});
 const closing=node('invitation'),images=[node('first image'),node('second image')],links=stories.map((s,i)=>Object.assign(node('link '+i),{hash:'#'+s.dataset.homeStory})),track=Object.assign(node('track'),{offsetHeight:5000,getBoundingClientRect:()=>({top:1000})});
 const root=Object.assign(node('root'),{isConnected:true,querySelectorAll:selector=>selector==='img'?images:selector==='.home-scene-nav a'?links:stories,querySelector:selector=>selector==='.home-stories'?track:closing});
 const window=Object.assign(new Target(),{dispatchEvent(event){events.push(event.type);return EventTarget.prototype.dispatchEvent.call(this,event);}});
 const document={fonts:{ready:new Promise(resolve=>fontResolve=resolve)}};
 class ScrollTrigger{
  constructor(animation,owner){this.animation=animation;this.calls=[];this.active=true;this.owner=owner;triggers.push(this);owner?.owned.push(this);}
  kill(revert){this.calls.push(revert);this.active=false;this.scrubKilled=true;if(revert!==false)this.reverted=true;this.animation.scrollTrigger=null;this.animation.kill();}
  static getAll(){return triggers.filter(trigger=>trigger.active);}
  static addEventListener(name,callback){refreshListeners.add(callback);}
  static removeEventListener(name,callback){refreshListeners.delete(callback);}
  static refresh(){refreshes++;for(const callback of refreshListeners)callback();}
 }
 const ignored=new Set(['duration','ease','immediateRender','clearProps','overwrite']);
 const gsap={registerPlugin(){},set(target,to){const original={...target.style};Object.assign(target.style,to);currentMedia?.owned.push({kill(){target.style=original;}});},fromTo(target,from,to){return this.timeline({scrollTrigger:to.scrollTrigger}).fromTo(target,from,to);},matchMedia(){
  const context={data:[]};const media={contexts:[context],get owned(){return context.data;},set owned(value){context.data=value;},reverted:false,callback:null,scope:null,cleanup:null,run(){this.cleanup?.();for(const timeline of this.owned)timeline.kill();this.owned=[];const previous=currentMedia;currentMedia=this;this.cleanup=this.callback({conditions});currentMedia=previous;},add(queries,callback,scope){this.callback=callback;this.scope=scope;this.run();},revert(){if(this.reverted)return;this.reverted=true;this.cleanup?.();for(const timeline of this.owned)timeline.kill();this.owned=[];},kill(revert){this.killMode=revert;for(const entry of this.owned)entry.kill();this.owned=[];}};mediaInstances.push(media);return media;
 },timeline(options){
  const steps=[],original=new Map();
  const remember=target=>{target.style??={};if(!original.has(target))original.set(target,{...target.style});};
  const timeline={options,steps,killed:false,fromTo(target,from,to,at=0){for(const item of Array.isArray(target)?target:[target]){remember(item);steps.push({target:item,from,to,at});}return this;},to(target,to,at=0){remember(target);steps.push({target,from:null,to,at});return this;},render(progress){
   for(const[target,style]of original){for(const key of Object.keys(target.style))delete target.style[key];Object.assign(target.style,style);}
   const duration=Math.max(...steps.map(step=>step.at+(step.to.duration||0)),1),time=progress*duration;
   for(const step of steps){if(time<step.at)continue;const ratio=Math.max(0,Math.min(1,(time-step.at)/(step.to.duration||1))),from=step.from||{...step.target.style};for(const[key,value]of Object.entries({...from,...step.to})){if(ignored.has(key))continue;const start=from[key]??(key==='opacity'||key==='scale'?1:0),end=step.to[key]??value;step.target.style[key]=typeof start==='number'&&typeof end==='number'?start+(end-start)*ratio:end;}}
  },kill(){this.killed=true;for(const[target,style]of original){for(const key of Object.keys(target.style))delete target.style[key];Object.assign(target.style,style);}}};timelines.push(timeline);currentMedia?.owned.push(timeline);if(options.scrollTrigger)timeline.scrollTrigger=new ScrollTrigger(timeline,currentMedia);return timeline;
 }};
 const exports={};vm.runInNewContext(source,{exports,window,document,Event,CustomEvent,localStorage:{getItem:()=>savedReduced?'reduce':'full'},requestAnimationFrame:callback=>{frames.set(++frameId,callback);return frameId;},cancelAnimationFrame:id=>frames.delete(id),require:name=>{
  if(name==='react')return{useEffect:callback=>effects.push(callback),useRef:()=>({current:{closest:()=>root}})};
  if(name==='gsap')return{gsap};if(name==='gsap/ScrollTrigger')return{ScrollTrigger};if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props})};throw Error('Unexpected dependency '+name);
 }});
 const output=exports.HomeMotion(),cleanup=effects[0](),flush=()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback());};
 const control=(action,value)=>window.dispatchEvent(new CustomEvent('iavse-scene-control',{detail:{action,value}}));
 const systemReduce=value=>{conditions={...conditions,reduce:value};mediaInstances.at(-1)?.run();};
 return{output,root,stories,closing,links,track,images,window,events,listeners,timelines,triggers,foreignTrigger:()=>new ScrollTrigger({kill(){}},null),mediaInstances,frames,refreshListeners,control,systemReduce,cleanup,flush,resolveFont:()=>fontResolve(),get refreshes(){return refreshes;}};
}

test('one continuous film shares the scroll range and exposes only the active chapter to interaction',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');
 assert.equal(f.root.dataset.journeyMotion,'cinema');assert.ok(film);assert.equal(film.options.scrollTrigger.scrub,.65);assert.equal(f.mediaInstances[0].scope,f.root);
 for(const [progress,index] of [[.1,0],[.35,1],[.6,2],[.85,3],[.35,1]]){
  film.render(progress);film.options.scrollTrigger.onUpdate({progress});
  for(const [i,scene] of f.stories.entries()){assert.equal(scene.inert,i!==index);assert.equal(scene.attributes['aria-hidden'],String(i!==index));assert.equal(scene.dataset.journeyActive,String(i===index));}
  assert.equal(f.links[index].attributes['aria-current'],'step');assert.equal(f.links.filter(a=>a.attributes['aria-current']).length,1);
 }
 f.cleanup();
});

test('each product has an entry, settled reading interval and exit, while canvas coordinates stay unchanged',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');
 film.render(.35);const art=f.stories[1].art;assert.equal(art.style.opacity,1);assert.equal(art.style.clipPath,'inset(0% 0 0% 0 round 24px)');
 const held={...art.style};film.render(.42);assert.deepEqual(art.style,held);film.render(.49);assert.ok(art.style.opacity<1);film.render(.35);assert.deepEqual(art.style,held);
 for(const id of ['editor','resources'])for(const step of film.steps.filter(s=>s.target===f.stories.find(s=>s.dataset.homeStory===id).art))for(const key of ['x','y','z','scale','rotationY']){assert.equal(step.from?.[key],undefined);assert.equal(step.to[key],undefined);}
 const first=f.timelines.find(t=>t.options.scrollTrigger?.trigger===f.track&&t!==film);assert.equal(first.options.scrollTrigger.start,'top 88%','the first scene enters before the stage pins');
 f.cleanup();
});

test('compact screens use independent entrances and reduced motion restores readable native flow',()=>{
 const compact=fixture({desktop:false});assert.equal(compact.root.dataset.journeyMotion,'flow');assert.equal(compact.timelines.length,5);assert.ok(compact.timelines.every(t=>!t.options.scrollTrigger.scrub));compact.cleanup();
 for(const options of [{reduced:true},{savedReduced:true}]){const f=fixture(options);assert.equal(f.timelines.length,0);assert.equal(f.root.dataset.journeyMotion,undefined);assert.ok(f.stories.every(s=>!s.inert));f.cleanup();}
 const f=fixture(),first=[...f.timelines],film=first.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');film.options.scrollTrigger.onUpdate({progress:.6});
 f.control('paused',true);assert.equal(f.root.dataset.journeyMotion,'cinema');f.control('reduced',true);assert.ok(first.every(t=>t.killed));assert.equal(f.root.dataset.journeyMotion,undefined);assert.ok(f.stories.every(s=>!s.inert&&!s.attributes['aria-hidden']));
 film.options.scrollTrigger.onUpdate({progress:.6});assert.equal(f.stories[2].dataset.journeyActive,undefined,'stale callbacks cannot hide native flow');
 f.control('reduced',false);assert.equal(f.root.dataset.journeyMotion,'cinema');f.systemReduce(true);assert.equal(f.root.dataset.journeyMotion,undefined);f.systemReduce(false);assert.equal(f.root.dataset.journeyMotion,'cinema');f.cleanup();
});

test('layout refreshes coalesce and notify the shared scene without a continuous DOM frame loop',async()=>{
 const f=fixture();assert.equal(f.frames.size,1);f.images[0].dispatchEvent(new Event('load'));f.images[1].dispatchEvent(new Event('load'));f.resolveFont();await Promise.resolve();assert.equal(f.frames.size,1);f.flush();assert.equal(f.refreshes,1);assert.equal(f.frames.size,0);assert.ok(f.events.includes('iavse-journey-layout'));f.cleanup();
});

test('unmount releases all animations, handlers, accessibility states and late font work',async()=>{
 const f=fixture();f.cleanup();assert.ok(f.mediaInstances.every(m=>m.reverted));assert.ok(f.timelines.every(t=>t.killed));assert.equal(f.frames.size,0);assert.equal(f.refreshListeners.size,0);assert.equal(f.root.dataset.journeyMotion,undefined);assert.ok([...f.listeners.values()].every(set=>set.size===0));
 const count=f.timelines.length;f.control('reduced',false);f.resolveFont();await Promise.resolve();assert.equal(f.timelines.length,count);assert.equal(f.frames.size,0);assert.ok(f.stories.every(s=>!s.inert&&!s.attributes['aria-hidden']));
});

 test('scrolling inside one chapter leaves its accessibility and activation DOM untouched',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');
 const writes=()=>[...f.stories,...f.links].reduce((sum,node)=>sum+(node.writes||0),0);
 film.options.scrollTrigger.onUpdate({progress:.3});const count=writes();
 for(const progress of [.31,.32,.34,.35,.4])film.options.scrollTrigger.onUpdate({progress});
 assert.equal(writes(),count);assert.equal(f.stories[1].dataset.journeyActive,'true');
 f.stories[1].dataset.journeyActive='false';film.options.scrollTrigger.onUpdate({progress:.4});assert.equal(f.stories[1].dataset.journeyActive,'true','layout restoration must reconcile the actual DOM state');
 film.options.scrollTrigger.onUpdate({progress:.6});assert.ok(writes()>count);assert.equal(f.stories[2].dataset.journeyActive,'true');f.cleanup();
 });


test('detached cleanup kills only owned triggers without replaying dormant startAt tweens',async()=>{
 const f=fixture(),before=[...f.triggers],unrelated=f.foreignTrigger();
 // Context.kill(false) calls entry.kill() without forwarding false. Leaving a
 // trigger in context.data would therefore repeat its default, reverting kill.
 f.root.isConnected=false;f.cleanup();
 assert.ok(f.mediaInstances.every(m=>m.killMode===false&&!m.reverted));
 assert.ok(before.length>0);assert.ok(before.every(t=>t.calls.length===1&&t.calls[0]===false&&!t.reverted&&t.scrubKilled&&!t.active));
 assert.ok(f.timelines.every(t=>t.killed));assert.ok(f.mediaInstances.every(m=>m.contexts.every(c=>c.data.length===0)));
 assert.equal(unrelated.calls.length,0);assert.equal(unrelated.active,true);assert.equal(f.frames.size,0);assert.equal(f.refreshListeners.size,0);
 assert.ok([...f.listeners.values()].every(set=>set.size===0));
 f.resolveFont();await Promise.resolve();assert.equal(f.frames.size,0);
});

test('a connected StrictMode cleanup retains full style and accessibility restoration',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');
 film.render(.6);film.options.scrollTrigger.onUpdate({progress:.6});assert.ok(f.stories.some(s=>s.inert));
 f.cleanup();assert.ok(f.mediaInstances.every(m=>m.reverted&&m.killMode===undefined));
 assert.ok(f.stories.every(s=>!s.inert&&!s.attributes['aria-hidden']));assert.equal(f.root.dataset.journeyMotion,undefined);
});
