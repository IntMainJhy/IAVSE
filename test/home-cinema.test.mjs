import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/HomeCinema.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function mount({savedReduced=false,systemReduced=false,scrollY=0}={}){
 const effects=[],calls=[],media=[],frames=new Map();let frameId=0,refreshes=0,resolveFont;
 const heading=[{}, {}, {}],copy={},intro={},showcase={},stage={},image=new EventTarget();
 const hero={querySelector:selector=>({'.v2-hero-copy':copy,'.v2-hero-intro':intro,'.v2-hero-showcase':showcase,'.v2-stage,.v2-hero-empty':stage}[selector]||null),querySelectorAll:selector=>selector==='img'?[image]:heading};
 const host={querySelector:selector=>selector==='.v2-hero-scene'?hero:null};
 const gsap={registerPlugin(){},timeline(){return{fromTo(target,from,to){calls.push({target,from,to,intro:true});return this;}};},to(target,to){calls.push({target,to});},fromTo(target,from,to){calls.push({target,from,to});},matchMedia(){const m={add(query,callback,scope){this.scope=scope;if(!systemReduced)callback();},revert(){this.reverted=true;}};media.push(m);return m;}};
 const exports={};vm.runInNewContext(source,{exports,window:{scrollY},document:{fonts:{ready:new Promise(resolve=>resolveFont=resolve)}},localStorage:{getItem:()=>savedReduced?'reduce':'full'},requestAnimationFrame:callback=>{frames.set(++frameId,callback);return frameId;},cancelAnimationFrame:id=>frames.delete(id),require:name=>{
  if(name==='react')return{useEffect:callback=>effects.push(callback),useRef:()=>({current:{closest:()=>host}}),useState:value=>[value,()=>{}]};
  if(name==='gsap')return{gsap};if(name==='gsap/ScrollTrigger')return{ScrollTrigger:{refresh(){refreshes++;}}};if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};throw Error(name);
 }});
 const tree=exports.HomeCinema({locale:'en'}),cleanups=effects.map(fn=>fn());
 return{tree,heading,copy,intro,showcase,stage,hero,image,calls,media,frames,resolveFont:()=>resolveFont(),get refreshes(){return refreshes;},cleanup(){cleanups.forEach(fn=>fn?.());},flush(){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());}};
}

test('the product enters on its own viewport crossing after the brand scene, not during initial load',()=>{
 const f=mount(),reveal=f.calls.find(call=>call.target===f.stage),departure=f.calls.find(call=>call.target===f.copy);
 assert.equal(reveal.to.scrollTrigger.trigger,f.showcase);assert.notEqual(reveal.to.scrollTrigger.trigger,departure.to.scrollTrigger.trigger);
 assert.ok(reveal.from.autoAlpha===0&&reveal.to.autoAlpha===1);assert.ok(reveal.from.y>50&&reveal.to.y===0);assert.ok(reveal.from.rotationX>0&&reveal.to.rotationX===0);
 assert.ok(reveal.to.scrollTrigger.scrub>0);assert.equal(reveal.to.scrollTrigger.toggleActions,undefined,'a scrubbed reveal stays reversible without a conflicting play/reset trigger');
 assert.equal(departure.to.scrollTrigger.trigger,f.intro);assert.equal(f.media[0].scope,f.hero);f.cleanup();
});
test('restored scroll positions skip the timed intro and reduced motion leaves native content readable',()=>{
 const resumed=mount({scrollY:500});assert.ok(!resumed.calls.some(call=>call.intro));assert.ok(resumed.calls.some(call=>call.target===resumed.stage));resumed.cleanup();
 for(const options of [{savedReduced:true},{systemReduced:true}]){const f=mount(options);assert.equal(f.calls.length,0);f.cleanup();}
});
test('late images and fonts coalesce layout refreshes and teardown cancels queued refresh work',async()=>{
 const f=mount();assert.equal(f.frames.size,1);f.image.dispatchEvent(new Event('load'));f.resolveFont();await Promise.resolve();assert.equal(f.frames.size,1);f.flush();assert.equal(f.refreshes,1);
 f.cleanup();assert.ok(f.media.every(m=>m.reverted));assert.equal(f.frames.size,0);f.image.dispatchEvent(new Event('load'));assert.equal(f.frames.size,0);
 const late=mount();late.cleanup();late.resolveFont();await Promise.resolve();assert.equal(late.frames.size,0);assert.equal(late.refreshes,0);
});
