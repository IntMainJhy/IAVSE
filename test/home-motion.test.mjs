import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {loadHomeScrollRefresh} from './home-refresh-fixture.mjs';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/HomeMotion.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture({desktop=true,reduced=false,savedReduced=false}={}){
 const effects=[],timelines=[],mediaInstances=[],frames=new Map(),events=[],listeners=new Map(),refreshListeners=new Set(),scrollEndListeners=new Set(),triggers=[],scrollCalls=[];let frameId=0,refreshes=0,conditions={desktop,compact:!desktop,reduce:reduced},currentMedia,fontResolve;
 class Target extends EventTarget{dataset={};style={};attributes={};setAttribute(k,v){this.writes=(this.writes||0)+1;this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];}addEventListener(name,callback,options){super.addEventListener(name,callback,options);const set=listeners.get(this)||new Set();set.add(name);listeners.set(this,set);}removeEventListener(name,callback){super.removeEventListener(name,callback);listeners.get(this)?.delete(name);}}
 const node=name=>Object.assign(new Target(),{name});
 const stories=['blog','editor','skills','resources'].map((id,index)=>{const art=node(id+' art'),copy=node(id+' copy');return Object.assign(node(id),{dataset:{homeStory:id,homeSide:index%2?'right':'left'},art,copy,querySelector:selector=>({'.home-story-visual':art,'.home-story-copy':copy}[selector]||null),querySelectorAll:()=>[art,copy]});});
 const closing=node('invitation'),images=[node('first image'),node('second image')],links=stories.map((s,i)=>{const link=Object.assign(node('link '+i),{hash:'#'+s.dataset.homeStory});link.closest=()=>link;return link;}),track=Object.assign(node('track'),{offsetHeight:5000,getBoundingClientRect:()=>({top:1000})});
 const root=Object.assign(node('root'),{isConnected:true,querySelectorAll:selector=>selector==='img'?images:selector==='.home-scene-nav a'?links:stories,querySelector:selector=>selector==='.home-stories'?track:closing});
 const window=Object.assign(new Target(),{scrollY:240,innerHeight:1000,scrollTo:options=>scrollCalls.push(options),dispatchEvent(event){events.push(event.type);return EventTarget.prototype.dispatchEvent.call(this,event);}});
 const document=Object.assign(new Target(),{hidden:false,documentElement:{hasAttribute:()=>false},fonts:{ready:new Promise(resolve=>fontResolve=resolve)}});
 class ScrollTrigger{
  constructor(animation,owner){this.animation=animation;this.calls=[];this.active=true;this.owner=owner;triggers.push(this);owner?.owned.push(this);}
  setProgress(progress){this.progress=progress;this.animation.options.scrollTrigger.onUpdate?.(this);}
  kill(revert){this.calls.push(revert);this.active=false;this.scrubKilled=true;if(revert!==false)this.reverted=true;this.animation.scrollTrigger=null;this.animation.kill();}
  static getAll(){return triggers.filter(trigger=>trigger.active);}
  static isScrolling(){return false;}
  static addEventListener(name,callback){(name==='refresh'?refreshListeners:scrollEndListeners).add(callback);}
  static removeEventListener(name,callback){(name==='refresh'?refreshListeners:scrollEndListeners).delete(callback);}
  static refresh(){refreshes++;for(const callback of refreshListeners)callback();}
 }
 const ignored=new Set(['duration','ease','immediateRender','clearProps','overwrite','scrollTrigger','stagger']);
 const values=vars=>Object.fromEntries(Object.entries(vars).filter(([key])=>!ignored.has(key)));
 const assign=(style,vars)=>{for(const[key,value]of Object.entries(values(vars))){if(key==='autoAlpha'){style.opacity=value;style.visibility=value===0?'hidden':'inherit';}else style[key]=value;}};
 const initial=(style,key)=>key==='autoAlpha'?(style.opacity??1):(style[key]??(['opacity','scale'].includes(key)?1:0));
 const ease=(ratio,name)=>name==='power1.inOut'?(ratio<.5?2*ratio*ratio:1-2*(1-ratio)**2):ratio;
 const gsap={registerPlugin(){},set(target,to){const original={...target.style};assign(target.style,to);currentMedia?.owned.push({kill(){target.style=original;}});},fromTo(target,from,to){return this.timeline({scrollTrigger:to.scrollTrigger}).fromTo(target,from,to);},matchMedia(){
  const context={data:[]};const media={contexts:[context],get owned(){return context.data;},set owned(value){context.data=value;},reverted:false,callback:null,scope:null,cleanup:null,run(){this.cleanup?.();for(const timeline of this.owned)timeline.kill();this.owned=[];const previous=currentMedia;currentMedia=this;this.cleanup=this.callback({conditions});currentMedia=previous;},add(queries,callback,scope){this.callback=callback;this.scope=scope;this.run();},revert(){if(this.reverted)return;this.reverted=true;this.cleanup?.();for(const timeline of this.owned)timeline.kill();this.owned=[];},kill(revert){this.killMode=revert;for(const entry of this.owned)entry.kill();this.owned=[];}};mediaInstances.push(media);return media;
 },timeline(options){
  const steps=[],original=new Map();let currentTime=0;
  const remember=target=>{target.style??={};if(!original.has(target))original.set(target,{...target.style});};
  const apply=(style,step,time)=>{
   if(time<step.at)return;
   const duration=step.to.duration??0,ratio=duration===0?1:ease(Math.max(0,Math.min(1,(time-step.at)/duration)),step.to.ease??options.defaults?.ease);
   for(const[key,end]of Object.entries(values(step.to))){const start=step.from[key];assign(style,{[key]:typeof start==='number'&&typeof end==='number'?start+(end-start)*ratio:end});}
  };
  // Resolve sequential .to() starts once from preceding timeline output. They
  // must not resample live styles when a reverse or later render is requested.
  const append=(target,from,to,at)=>{
   for(const item of Array.isArray(target)?target:[target]){
    remember(item);const start={...original.get(item)};
    for(const step of steps.filter(step=>step.target===item).sort((a,b)=>a.at-b.at))apply(start,step,at);
    steps.push({target:item,explicitFrom:from!==null,from:Object.fromEntries(Object.keys(values(to)).map(key=>[key,from?.[key]??initial(start,key)])),to:{...to},at});
   }
  };
  const timeline={options,steps,killed:false,time:()=>currentTime,duration:()=>Math.max(0,...steps.map(step=>step.at+(step.to.duration??0))),fromTo(target,from,to,at=0){append(target,from,to,at);return this;},to(target,to,at=0){append(target,null,to,at);return this;},set(target,to,at=0){append(target,null,{...to,duration:0},at);return this;},render(progress){
   currentTime=progress*this.duration();
   for(const[target,style]of original){for(const key of Object.keys(target.style))delete target.style[key];Object.assign(target.style,style);}
   for(const step of [...steps].sort((a,b)=>a.at-b.at))apply(step.target.style,step,currentTime);
   options.onUpdate?.call(this);
  },kill(){this.killed=true;for(const[target,style]of original){for(const key of Object.keys(target.style))delete target.style[key];Object.assign(target.style,style);}}};timelines.push(timeline);currentMedia?.owned.push(timeline);if(options.scrollTrigger)timeline.scrollTrigger=new ScrollTrigger(timeline,currentMedia);return timeline;
 }};
 const requestAnimationFrame=callback=>{frames.set(++frameId,callback);return frameId;},cancelAnimationFrame=id=>frames.delete(id);
 const refreshModule=loadHomeScrollRefresh({window,document,ScrollTrigger,requestAnimationFrame,cancelAnimationFrame});
 const exports={};vm.runInNewContext(source,{exports,window,document,Event,CustomEvent,localStorage:{getItem:()=>savedReduced?'reduce':'full'},requestAnimationFrame,cancelAnimationFrame,require:name=>{
  if(name==='react')return{useEffect:callback=>effects.push(callback),useRef:()=>({current:{closest:()=>root}})};
  if(name==='@/lib/home-scroll-refresh')return refreshModule;
  if(name==='gsap')return{gsap};if(name==='gsap/ScrollTrigger')return{ScrollTrigger};if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props})};throw Error('Unexpected dependency '+name);
 }});
 const output=exports.HomeMotion(),cleanup=effects[0](),flush=()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback());};
 const control=(action,value)=>window.dispatchEvent(new CustomEvent('iavse-scene-control',{detail:{action,value}}));
 const systemReduce=value=>{conditions={...conditions,reduce:value};mediaInstances.at(-1)?.run();};
 const clickLink=index=>{const event=new Event('click',{cancelable:true});Object.defineProperty(event,'target',{value:links[index]});root.dispatchEvent(event);return event;};
 return{output,root,stories,closing,links,track,images,window,events,listeners,timelines,triggers,scrollCalls,clickLink,foreignTrigger:()=>new ScrollTrigger({kill(){}},null),mediaInstances,frames,refreshListeners,scrollEndListeners,control,systemReduce,cleanup,flush,resolveFont:()=>fontResolve(),get refreshes(){return refreshes;}};
}

test('one continuous film shares the scroll range and exposes only the active chapter to interaction',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');
 assert.equal(f.root.dataset.journeyMotion,'cinema');assert.ok(film);assert.equal(film.options.scrollTrigger.scrub,.5);assert.equal(film.duration(),4);assert.equal(f.mediaInstances[0].scope,f.root);
 assert.equal(film.options.scrollTrigger.onUpdate,undefined,'only the actual film playhead may activate a chapter');
 assert.notEqual(film.options.scrollTrigger.invalidateOnRefresh,true,'layout refresh must preserve fixed fade endpoints instead of recapturing the current midfade');
 for(const [progress,index] of [[.1,0],[.35,1],[.6,2],[.85,3],[.35,1]]){
  film.render(progress);
  for(const [i,scene] of f.stories.entries()){assert.equal(scene.inert,i!==index);assert.equal(scene.attributes['aria-hidden'],String(i!==index));assert.equal(scene.dataset.journeyActive,String(i===index));}
  assert.equal(f.links[index].attributes['aria-current'],'step');assert.equal(f.links.filter(a=>a.attributes['aria-current']).length,1);
 }
 f.cleanup();
});

test('every chapter settles fully, with complementary art fades and sequential copy handoffs',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');
 for(const [index,scene]of f.stories.entries()){
  film.render((index+.35)/4);assert.equal(scene.art.style.opacity,1);assert.equal(scene.copy.style.opacity,1);
  const held={art:{...scene.art.style},copy:{...scene.copy.style}};
  film.render((index+.7)/4);assert.deepEqual(scene.art.style,held.art);assert.deepEqual(scene.copy.style,held.copy);
  film.render((index+.35)/4);assert.deepEqual(scene.art.style,held.art);assert.deepEqual(scene.copy.style,held.copy);
 }
 for(let boundary=1;boundary<4;boundary++){
  const outgoing=film.steps.find(s=>s.target===f.stories[boundary-1].art&&s.to.opacity===0),incoming=film.steps.find(s=>s.target===f.stories[boundary].art&&s.to.opacity===1);
  assert.ok(Math.abs(outgoing.at-(boundary-.22))<1e-10);assert.ok(Math.abs(incoming.at-outgoing.at)<1e-10);
  assert.equal(outgoing.to.duration,.44);assert.equal(incoming.to.duration,.44);assert.equal(outgoing.from.opacity,1);assert.equal(incoming.from.opacity,0);
  assert.equal(outgoing.explicitFrom,true,'outgoing artwork always starts from its settled state');
  if(!['editor','resources'].includes(f.stories[boundary-1].dataset.homeStory))for(const[key,value]of Object.entries({y:0,z:0,scale:1}))assert.equal(outgoing.from[key],value);
  const copyOut=film.steps.find(s=>s.target===f.stories[boundary-1].copy&&s.to.opacity===0),copyIn=film.steps.find(s=>s.target===f.stories[boundary].copy&&s.to.opacity===1);
  assert.ok(Math.abs(copyOut.at-(boundary-.12))<1e-10);assert.equal(copyOut.to.duration,.12);assert.equal(copyOut.from.opacity,1);assert.equal(copyOut.from.y,0);assert.equal(copyOut.to.y,-12);
  assert.equal(copyIn.at,boundary);assert.equal(copyIn.to.duration,.16);assert.equal(copyIn.from.opacity,0);assert.equal(copyIn.from.y,12);assert.equal(copyIn.to.y,0);
  assert.ok(Math.abs(copyOut.at+copyOut.to.duration-copyIn.at)<1e-10,'outgoing text finishes before incoming text begins');
 }
 assert.equal(f.timelines.filter(t=>t.options.scrollTrigger?.trigger===f.track).length,1,'one film owns the first scene as the stage enters');
 f.cleanup();
});

test('forward and reverse sampling keeps artwork visible without overlapping copy layers',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');
 const visibleOpacity=(scene,part)=>scene.style.visibility==='hidden'?0:scene.style.opacity*scene[part].style.opacity;
 const samples=Array.from({length:801},(_,index)=>index/200);
 for(const times of [samples,[...samples].reverse()])for(const time of times){
  film.render(time/film.duration());
  const artOpacities=f.stories.map(scene=>visibleOpacity(scene,'art')),copyOpacities=f.stories.map(scene=>visibleOpacity(scene,'copy'));
  assert.ok(artOpacities.some(opacity=>opacity>=.49),`art remains visible at film time ${time}`);
  assert.ok(Math.abs(artOpacities.reduce((sum,opacity)=>sum+opacity,0)-1)<1e-9,`art fades remain complementary at film time ${time}`);
  assert.ok(copyOpacities.filter(opacity=>opacity>1e-9).length<=1,`only one text layer is visible at film time ${time}`);
  const current=Math.min(3,Math.floor(time));
  assert.deepEqual(f.stories.map(scene=>scene.inert),f.stories.map((_,index)=>index!==current));
 }
 for(const time of [1,2,3]){
  film.render(time/4);
  assert.ok(Math.abs(visibleOpacity(f.stories[time-1],'art')-.5)<1e-9);assert.ok(Math.abs(visibleOpacity(f.stories[time],'art')-.5)<1e-9);
  assert.ok(f.stories.every(scene=>visibleOpacity(scene,'copy')<1e-9),'the exact chapter boundary leaves text clear while art remains visible');
 }
 f.cleanup();
});

test('scrub lag keeps interaction attached to the visible playhead in both scroll directions',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');
 film.render(.35);film.scrollTrigger.setProgress(.85);
 assert.equal(film.time(),1.4);assert.equal(f.stories[1].dataset.journeyActive,'true');assert.equal(f.stories[3].inert,true);
 film.render(.51);assert.equal(f.stories[2].dataset.journeyActive,'true');
 film.render(.85);film.scrollTrigger.setProgress(.1);assert.equal(f.stories[3].dataset.journeyActive,'true');assert.equal(f.stories[0].inert,true);
 film.render(.49);assert.equal(f.stories[1].dataset.journeyActive,'true');
 f.cleanup();
});

test('interactive editor and resource artwork keeps stable geometry throughout the film',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film'),geometry=['x','y','z','xPercent','yPercent','scale','scaleX','scaleY','rotation','rotationX','rotationY','transform','clipPath'];
 for(const id of ['editor','resources']){
  const scene=f.stories.find(scene=>scene.dataset.homeStory===id);
  for(const step of film.steps.filter(step=>step.target===scene.art||step.target===scene))for(const key of geometry){assert.equal(step.from[key],undefined);assert.equal(step.to[key],undefined);}
  for(const progress of [0,.2,.25,.3,.5,.7,.75,.8,1,.75,.25,0]){
   film.render(progress);
   for(const key of geometry){assert.equal(scene.art.style[key],undefined,`${id} artwork has no ${key} at ${progress}`);assert.equal(scene.style[key],undefined);}
  }
 }
 f.cleanup();
});

test('chapter navigation lands inside a fully visible reading interval',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');
 for(const [index,scene]of f.stories.entries()){
  assert.equal(f.clickLink(index).defaultPrevented,true);
  const target=f.scrollCalls.at(-1),start=f.track.getBoundingClientRect().top+f.window.scrollY,length=f.track.offsetHeight-f.window.innerHeight;
  assert.equal(target.behavior,'smooth');assert.equal(target.top,start+length*(index+.42)/4);
  film.render((target.top-start)/length);
  assert.equal(scene.dataset.journeyActive,'true');assert.equal(scene.style.visibility,'inherit');assert.equal(scene.art.style.opacity,1);assert.equal(scene.copy.style.opacity,1);
  assert.equal(f.stories.filter(scene=>!scene.inert).length,1);
 }
 f.cleanup();
});

test('compact screens use independent entrances and reduced motion restores readable native flow',()=>{
 const compact=fixture({desktop:false});assert.equal(compact.root.dataset.journeyMotion,'flow');assert.equal(compact.timelines.length,5);assert.ok(compact.timelines.every(t=>!t.options.scrollTrigger.scrub));compact.cleanup();
 for(const options of [{reduced:true},{savedReduced:true}]){const f=fixture(options);assert.equal(f.timelines.length,0);assert.equal(f.root.dataset.journeyMotion,undefined);assert.ok(f.stories.every(s=>!s.inert));f.cleanup();}
 const f=fixture(),first=[...f.timelines],film=first.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');film.render(.6);
 f.control('paused',true);assert.equal(f.root.dataset.journeyMotion,'cinema');f.control('reduced',true);assert.ok(first.every(t=>t.killed));assert.equal(f.root.dataset.journeyMotion,undefined);assert.ok(f.stories.every(s=>!s.inert&&!s.attributes['aria-hidden']));
 film.options.onUpdate.call(film);assert.equal(f.stories[2].dataset.journeyActive,undefined,'stale callbacks cannot hide native flow');
 f.control('reduced',false);assert.equal(f.root.dataset.journeyMotion,'cinema');f.systemReduce(true);assert.equal(f.root.dataset.journeyMotion,undefined);f.systemReduce(false);assert.equal(f.root.dataset.journeyMotion,'cinema');f.cleanup();
});

test('layout refreshes coalesce and notify the shared scene without a continuous DOM frame loop',async()=>{
 const f=fixture();assert.equal(f.frames.size,1);f.images[0].dispatchEvent(new Event('load'));f.images[1].dispatchEvent(new Event('load'));f.resolveFont();await Promise.resolve();assert.equal(f.frames.size,1);f.flush();assert.equal(f.refreshes,1);assert.equal(f.frames.size,0);assert.ok(f.events.includes('iavse-journey-layout'));f.cleanup();
});

test('unmount releases all animations, handlers, accessibility states and late font work',async()=>{
 const f=fixture();f.cleanup();assert.ok(f.mediaInstances.every(m=>m.reverted));assert.ok(f.timelines.every(t=>t.killed));assert.equal(f.frames.size,0);assert.equal(f.refreshListeners.size,0);assert.equal(f.scrollEndListeners.size,0);assert.equal(f.root.dataset.journeyMotion,undefined);assert.ok([...f.listeners.values()].every(set=>set.size===0));
 const count=f.timelines.length;f.control('reduced',false);f.resolveFont();await Promise.resolve();assert.equal(f.timelines.length,count);assert.equal(f.frames.size,0);assert.ok(f.stories.every(s=>!s.inert&&!s.attributes['aria-hidden']));
});

 test('scrolling inside one chapter leaves its accessibility and activation DOM untouched',()=>{
 const f=fixture(),film=f.timelines.find(t=>t.options.scrollTrigger?.id==='iavse-story-film');
 const writes=()=>[...f.stories,...f.links].reduce((sum,node)=>sum+(node.writes||0),0);
 film.render(.3);const count=writes();
 for(const progress of [.31,.32,.34,.35,.4])film.render(progress);
 assert.equal(writes(),count);assert.equal(f.stories[1].dataset.journeyActive,'true');
 f.stories[1].dataset.journeyActive='false';film.render(.4);assert.equal(f.stories[1].dataset.journeyActive,'true','layout restoration must reconcile the actual DOM state');
 film.render(.6);assert.ok(writes()>count);assert.equal(f.stories[2].dataset.journeyActive,'true');f.cleanup();
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
 film.render(.6);assert.ok(f.stories.some(s=>s.inert));
 f.cleanup();assert.ok(f.mediaInstances.every(m=>m.reverted&&m.killMode===undefined));
 assert.ok(f.stories.every(s=>!s.inert&&!s.attributes['aria-hidden']));assert.equal(f.root.dataset.journeyMotion,undefined);
});
