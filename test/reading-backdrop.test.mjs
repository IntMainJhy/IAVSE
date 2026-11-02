import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/ReadingBackdrop.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;

function mount({capable=true,savedReduced=false}={}){
 class Target extends EventTarget{
  listeners=new Set();
  addEventListener(name,fn,options){super.addEventListener(name,fn,options);this.listeners.add(name);}
  removeEventListener(name,fn){super.removeEventListener(name,fn);this.listeners.delete(name);}
 }
 const window=new Target(),document=Object.assign(new Target(),{hidden:false}),preference=Object.assign(new Target(),{matches:capable});
 const arcs=[],clears=[],contexts=[],frames=new Map(),effects=[],exports={};
 let now=0,id=0;
 const context={beginPath(){},arc:(...args)=>arcs.push(args),fill(){},clearRect:(...args)=>clears.push(args)};
 const canvas={dataset:{state:'idle'},width:0,height:0,getContext:kind=>{contexts.push(kind);return context;}};
 vm.runInNewContext(source,{exports,window,document,innerWidth:1280,innerHeight:800,performance:{now:()=>now},matchMedia:()=>preference,localStorage:{getItem:()=>savedReduced?'reduce':null},
  requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key),require:name=>{
   if(name==='react')return{useEffect:fn=>effects.push(fn),useRef:()=>({current:canvas})};
   if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
   throw Error('Unexpected dependency '+name);
  }});
 const output=exports.ReadingBackdrop(),cleanup=effects[0]();
 const step=(ms=40)=>{now+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));};
 const move=(pointerType='mouse')=>window.dispatchEvent(Object.assign(new Event('pointermove'),{clientX:500,clientY:350,pointerType}));
 const control=value=>window.dispatchEvent(Object.assign(new Event('iavse-scene-control'),{detail:{action:'reduced',value}}));
 return{window,document,preference,canvas,arcs,clears,contexts,frames,output,step,move,control,cleanup};
}

test('pointer feedback draws locally, coalesces input and leaves no idle animation work',()=>{
 const s=mount();
 assert.equal(s.output.props['aria-hidden'],'true');
 assert.equal(s.frames.size,0,'the reading page starts without an animation ticker');
 assert.equal(s.contexts.length,0,'an unused background does not allocate a drawing context');
 for(let i=0;i<12;i++)s.move();
 assert.equal(s.frames.size,1,'pointer bursts share one pending display frame');
 s.step();
 assert.equal(s.canvas.dataset.state,'active');assert.ok(s.arcs.length>0&&s.arcs.length<100,'the pointer affects a small neighbourhood');
 assert.ok(s.arcs.every(([x,y])=>Math.hypot(x-500,y-350)<140),'points remain near the interaction rather than filling the viewport');
 for(let i=0;i<100&&s.frames.size;i++)s.step();
 assert.equal(s.frames.size,0,'the effect sleeps after the pointer stops');assert.equal(s.canvas.dataset.state,'idle');
 const painted=s.arcs.length;s.step(60000);assert.equal(s.arcs.length,painted,'waiting cannot restart the effect');
 s.cleanup();
});

test('touch, system reduction and a saved reduction never start decorative animation',()=>{
 for(const settings of [{capable:false},{savedReduced:true}]){
  const s=mount(settings);s.move();s.step();assert.equal(s.frames.size,0);assert.equal(s.arcs.length,0);assert.equal(s.contexts.length,0);s.cleanup();
 }
 const touch=mount();touch.move('touch');touch.step();assert.equal(touch.frames.size,0);assert.equal(touch.arcs.length,0);touch.cleanup();
});

test('visibility and live motion preferences interrupt work without resuming an idle ticker',()=>{
 const s=mount();s.move();s.step();assert.ok(s.frames.size);
 s.document.hidden=true;s.document.dispatchEvent(new Event('visibilitychange'));
 assert.equal(s.frames.size,0);assert.equal(s.canvas.dataset.state,'idle');
 s.document.hidden=false;s.document.dispatchEvent(new Event('visibilitychange'));assert.equal(s.frames.size,0);
 s.move();s.step();s.control(true);assert.equal(s.frames.size,0);s.move();assert.equal(s.frames.size,0);
 s.control(false);assert.equal(s.frames.size,0);s.move();assert.equal(s.frames.size,1);
 s.preference.matches=false;s.preference.dispatchEvent(new Event('change'));assert.equal(s.frames.size,0);s.cleanup();
});

test('unmount cancels pending work, unregisters listeners and releases the canvas backing store',()=>{
 const s=mount();s.move();s.step();assert.ok(s.frames.size);
 assert.ok(s.window.listeners.size+s.document.listeners.size+s.preference.listeners.size>0);
 s.cleanup();
 assert.equal(s.frames.size,0);assert.equal(s.canvas.width,0);assert.equal(s.canvas.height,0);
 assert.equal(s.window.listeners.size+s.document.listeners.size+s.preference.listeners.size,0);
 const painted=s.arcs.length;s.move();s.window.dispatchEvent(new Event('resize'));s.step();assert.equal(s.arcs.length,painted);assert.equal(s.frames.size,0);
});
