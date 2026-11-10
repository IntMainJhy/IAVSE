import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
import {RBP_MOTION,revealDelay} from '../src/lib/rbp-motion.mjs';
const source=fs.readFileSync(new URL('../src/components/rbp/ui/application-reveal.tsx',import.meta.url),'utf8');
function setup({reduced=false,io=true}={}){
 let effect,observer,changes,cleanup;const events={},mediaEvents={},animations=[],nodes=[];
 const media={matches:reduced,addEventListener:(n,f)=>mediaEvents[n]=f,removeEventListener:()=>{}};
 const document={body:{},querySelectorAll:()=>[{querySelectorAll:()=>nodes}],addEventListener:(n,f)=>events[n]=f,removeEventListener:n=>delete events[n]};
 const exports={};const modules={react:{useEffect:f=>effect=f},'next/navigation':{usePathname:()=>'/community',useSearchParams:()=>new URLSearchParams()},'@/lib/rbp-motion.mjs':{RBP_MOTION,revealDelay}};
 class IO{constructor(cb){this.callback=cb;this.observed=new Set;observer=this;}observe(n){this.observed.add(n)}unobserve(n){this.observed.delete(n)}disconnect(){this.observed.clear()}}
 const context={document,exports,require:k=>modules[k],matchMedia:()=>media,window:io?{IntersectionObserver:IO}:{},IntersectionObserver:IO,MutationObserver:class{constructor(cb){changes=cb}observe(){}disconnect(){}},requestAnimationFrame:f=>{f();return 1},cancelAnimationFrame:()=>{}};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 const add=()=>{const n={dataset:{},closest:()=>null,getBoundingClientRect:()=>({width:200,height:100}),removeAttribute:k=>{if(k==='data-rbp-reveal')delete n.dataset.rbpReveal;},animate:(frames,options)=>{let resolve;const a={frames,options,cancelled:false,finished:new Promise(r=>resolve=r),finish:()=>resolve(),cancel(){this.cancelled=true}};animations.push(a);return a;}};nodes.push(n);return n;};
 return {add,nodes,animations,media,mediaEvents,events,get observer(){return observer},mount(){exports.ApplicationReveal();cleanup=effect()},unmount(){cleanup?.()},enter(list=nodes){observer.callback(list.map((target,i)=>({target,isIntersecting:true,boundingClientRect:{top:100,left:i*200}})))},mutate(){changes([{addedNodes:[{}]}])}};
}
test('reveal waits for viewport entry, staggers a group within a bounded delay and releases animation styles',async()=>{
 const s=setup();for(let i=0;i<8;i++)s.add();s.mount();assert.equal(s.animations.length,0);assert.ok(s.nodes.every(n=>n.dataset.rbpReveal==='pending'));s.enter();assert.equal(s.animations.length,8);assert.ok(s.animations.every(a=>a.options.delay<=210));assert.ok(s.animations[1].options.delay>s.animations[0].options.delay);for(const a of s.animations)a.finish();await new Promise(r=>setImmediate(r));assert.ok(s.nodes.every(n=>!n.dataset.rbpReveal));assert.ok(s.animations.every(a=>a.cancelled));s.unmount();
});
test('keyboard focus and a live reduced-motion preference immediately expose pending content',()=>{
 const s=setup();const a=s.add(),b=s.add();s.mount();s.events.focusin({target:{closest:()=>a}});assert.equal(a.dataset.rbpReveal,undefined);s.media.matches=true;s.mediaEvents.change();assert.equal(b.dataset.rbpReveal,undefined);assert.equal(s.animations.length,0);s.unmount();
});
test('route cleanup restores pending content and dynamic results are observed once',()=>{
 const s=setup();s.add();s.mount();const next=s.add();s.mutate();assert.ok(s.observer.observed.has(next));s.enter([next]);s.mutate();assert.equal(s.animations.length,1);s.unmount();assert.ok(s.nodes.every(n=>!n.dataset.rbpReveal));assert.ok(s.animations.every(a=>a.cancelled));
});
test('reduced motion and browsers without observers keep content visible without scheduling motion',()=>{
 for(const options of [{reduced:true},{io:false}]){const s=setup(options);s.add();s.mount();assert.equal(s.nodes[0].dataset.rbpReveal,undefined);assert.equal(s.animations.length,0);s.unmount();}
});
