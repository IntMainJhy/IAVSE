import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/landing/LandingScene.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function mount({paused=false}={}){
 const effects=[],frames=new Map(),timers=new Map(),observers=[],exports={};let id=0,contexts=0,clears=0;
 const context={setTransform(){},clearRect(){clears++;},beginPath(){},arc(){},fill(){}};
 const element={style:{},getBoundingClientRect:()=>({width:390,height:844}),addEventListener(){},removeEventListener(){}};
 const canvas={...element,getContext(){contexts++;return context;}};
 const jsx=(tag,props)=>{if(props.ref)props.ref.current=tag==='canvas'?canvas:element;return props;};
 class Observer{constructor(){observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
 vm.runInNewContext(source,{exports,document:{hidden:false,addEventListener(){},removeEventListener(){}},window:{addEventListener(){},removeEventListener(){}},devicePixelRatio:2,performance:{now:()=>100},ResizeObserver:Observer,IntersectionObserver:Observer,requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key),setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:key=>timers.delete(key),require:name=>{
  if(name==='react')return{useRef:value=>({current:value}),useState:value=>[value,()=>{}],useEffect:fn=>effects.push(fn)};
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};
  throw Error('Unexpected eager scene dependency '+name);
 }});
 exports.LandingScene({style:'anime',paused,opened:false,dusk:false});const cleanups=effects.map(fn=>fn());
 return {frames,timers,observers,get contexts(){return contexts;},get clears(){return clears;},paint(){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(100));},tasks(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());},unmount(){cleanups.forEach(fn=>fn?.());}};
}

test('the new destination gets a paint before any scene context or animation is allocated',()=>{
 const s=mount();assert.equal(s.contexts,0);assert.equal(s.frames.size,1);s.paint();assert.equal(s.contexts,0);assert.equal(s.timers.size,1);s.tasks();assert.equal(s.contexts,1);assert.equal(s.clears,1);s.unmount();assert.equal(s.frames.size,0);assert.ok(s.observers.every(o=>o.disconnected));
});
test('leaving before startup cancels work, and even an already-delivered task cannot allocate a stale scene',()=>{
 const early=mount();early.unmount();assert.equal(early.frames.size,0);assert.equal(early.contexts,0);
 const late=mount();late.paint();const stale=[...late.timers.values()][0];late.unmount();assert.equal(late.timers.size,0);stale();assert.equal(late.contexts,0);assert.equal(late.frames.size,0);
});
test('reduced motion still paints one static frame without starting a continuous scene loop',()=>{
 const s=mount({paused:true});s.paint();s.tasks();assert.equal(s.contexts,1);assert.equal(s.clears,1);assert.equal(s.frames.size,0);s.unmount();
});
