import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {loadHomeScrollRefresh} from './home-refresh-fixture.mjs';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/HomeCinema.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function mount({savedReduced=false,systemReduced=false,scrollY=0}={}){
 const effects=[],calls=[],media=[],frames=new Map(),triggers=[],scrollEndListeners=new Set();let frameId=0,refreshes=0,resolveFont;
 const heading=[{}, {}, {}],copy={},intro={},showcase={getBoundingClientRect:()=>({top:1100-scrollY})},stage={},image=new EventTarget();
 const hero={isConnected:true,getBoundingClientRect:()=>({top:0,left:0,width:1200,height:2000}),querySelector:selector=>({'.v2-hero-copy':copy,'.v2-hero-intro':intro,'.v2-hero-showcase':showcase,'.v2-stage,.v2-hero-empty':stage}[selector]||null),querySelectorAll:selector=>selector==='img'?[image]:[]};
 const host={querySelector:selector=>selector==='.v2-hero-scene'?hero:null};
 let currentMedia;
 class ScrollTrigger{
  constructor(animation){this.animation=animation;this.calls=[];this.active=true;triggers.push(this);currentMedia?.contexts[0].data.push(this);}
  kill(revert){this.calls.push(revert);this.active=false;this.scrubKilled=true;if(revert!==false)this.reverted=true;this.animation.kill();}
  static refresh(){refreshes++;}
  static isScrolling(){return false;}
  static addEventListener(name,callback){assert.equal(name,'scrollEnd');scrollEndListeners.add(callback);}
  static removeEventListener(name,callback){assert.equal(name,'scrollEnd');scrollEndListeners.delete(callback);}
 }
 const own=(target,from,to,intro=false)=>{
  calls.push({target,from,to,intro});
  const animation={killed:false,kill(){this.killed=true;}};currentMedia?.contexts[0].data.push(animation);
  if(to.scrollTrigger)animation.scrollTrigger=new ScrollTrigger(animation);return animation;
 };
 const gsap={registerPlugin(){},timeline(){throw Error('The hero must not create a timed text entrance');},to(target,to){return own(target,undefined,to);},fromTo(target,from,to){return own(target,from,to);},matchMedia(){const m={contexts:[{data:[]}],add(query,callback,scope){this.scope=scope;if(!systemReduced){currentMedia=this;callback();currentMedia=undefined;}},revert(){this.reverted=true;for(const entry of this.contexts[0].data)entry.kill();this.contexts[0].data=[];},kill(revert){this.killMode=revert;for(const entry of this.contexts[0].data)entry.kill();this.contexts[0].data=[];}};media.push(m);return m;}};
 const window=Object.assign(new EventTarget(),{scrollY,innerHeight:900}),document=Object.assign(new EventTarget(),{hidden:false,documentElement:{hasAttribute:()=>false},fonts:{ready:new Promise(resolve=>resolveFont=resolve)}});
 const requestAnimationFrame=callback=>{frames.set(++frameId,callback);return frameId;},cancelAnimationFrame=id=>frames.delete(id);
 const refreshModule=loadHomeScrollRefresh({window,document,ScrollTrigger,requestAnimationFrame,cancelAnimationFrame});
 const exports={};vm.runInNewContext(source,{exports,window,document,localStorage:{getItem:()=>savedReduced?'reduce':'full'},requestAnimationFrame,cancelAnimationFrame,require:name=>{
  if(name==='react')return{useEffect:callback=>effects.push(callback),useRef:()=>({current:{closest:()=>host}}),useState:value=>[value,()=>{}]};
  if(name==='@/lib/home-scroll-refresh')return refreshModule;
  if(name==='gsap')return{gsap};if(name==='gsap/ScrollTrigger')return{ScrollTrigger};if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};throw Error(name);
 }});
 const tree=exports.HomeCinema({locale:'en'}),cleanups=effects.map(fn=>fn());
 return{tree,heading,copy,intro,showcase,stage,hero,image,calls,media,triggers,frames,scrollEndListeners,resolveFont:()=>resolveFont(),get refreshes(){return refreshes;},cleanup(){cleanups.forEach(fn=>fn?.());},flush(){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());}};
}

test('the product enters on its own viewport crossing after the brand scene, not during initial load',()=>{
 const f=mount(),reveal=f.calls.find(call=>call.target===f.stage);
 assert.equal(reveal.to.scrollTrigger.trigger,f.showcase);
 assert.equal(reveal.from.opacity,.78);assert.equal(reveal.to.opacity,1);assert.ok(reveal.from.y<=14&&reveal.to.y===0);assert.equal(reveal.from.rotationX,undefined);assert.equal(reveal.from.scale,undefined);
 assert.equal(reveal.to.scrollTrigger.scrub,undefined);assert.equal(reveal.to.scrollTrigger.once,true);assert.equal(reveal.to.scrollTrigger.fastScrollEnd,true);assert.equal(reveal.to.scrollTrigger.invalidateOnRefresh,undefined);assert.equal(reveal.to.clearProps,'transform,opacity');
 assert.equal(f.calls.some(call=>call.target===f.copy),false);assert.equal(f.media[0].scope,f.hero);f.cleanup();
});
test('initial and restored views never animate the headline or its parent, and reduced motion stays readable',()=>{
 for(const scrollY of [0,500]){const f=mount({scrollY});assert.equal(f.calls.length,scrollY?0:1);assert.ok(!f.calls.some(call=>call.target===f.copy||call.target===f.heading||f.heading.includes(call.target)));f.cleanup();}
 for(const options of [{savedReduced:true},{systemReduced:true}]){const f=mount(options);assert.equal(f.calls.length,0);f.cleanup();}
});
test('restoring a visible or passed product never reapplies its start values or schedules a refresh',async()=>{
 for(const scrollY of[500,4800]){const f=mount({scrollY});assert.equal(f.calls.length,0);f.image.dispatchEvent(new Event('load'));f.resolveFont();await Promise.resolve();f.flush();assert.equal(f.refreshes,0);f.cleanup();}
});
test('late images and fonts coalesce layout refreshes and teardown cancels queued refresh work',async()=>{
 const f=mount();assert.equal(f.frames.size,1);f.image.dispatchEvent(new Event('load'));f.resolveFont();await Promise.resolve();assert.equal(f.frames.size,1);f.flush();assert.equal(f.refreshes,1);
 f.cleanup();assert.ok(f.media.every(m=>m.reverted));assert.equal(f.frames.size,0);assert.equal(f.scrollEndListeners.size,0);f.image.dispatchEvent(new Event('load'));assert.equal(f.frames.size,0);
 const late=mount();late.cleanup();late.resolveFont();await Promise.resolve();assert.equal(late.frames.size,0);assert.equal(late.refreshes,0);
});


test('detached cinema cleanup avoids reverting dormant hero animations and kills scrub work once',async()=>{
 const f=mount(),owned=[...f.triggers];f.hero.isConnected=false;f.cleanup();
 assert.ok(f.media.every(m=>m.killMode===false&&!m.reverted));assert.equal(owned.length,1);
 assert.ok(owned.every(t=>t.calls.length===1&&t.calls[0]===false&&!t.reverted&&!t.active&&t.scrubKilled));
 assert.ok(f.media.every(m=>m.contexts.every(c=>c.data.length===0)));assert.equal(f.frames.size,0);
 f.resolveFont();await Promise.resolve();f.image.dispatchEvent(new Event('load'));assert.equal(f.frames.size,0);
});

test('connected cinema cleanup keeps normal revert for dependency changes and StrictMode',()=>{
 const f=mount();f.cleanup();assert.ok(f.media.every(m=>m.reverted&&m.killMode===undefined));
});


test('the product stage has one entrance owner instead of a competing timed CSS animation',()=>{
 const css=fs.readFileSync(new URL('../src/app/iavse-system.css',import.meta.url),'utf8');assert.doesNotMatch(css,/v2-stage-arrive/);
 const f=mount();assert.equal(f.calls.length,1);assert.equal(f.calls[0].target,f.stage);assert.equal(f.calls[0].to.scrollTrigger.once,true);f.cleanup();
});
