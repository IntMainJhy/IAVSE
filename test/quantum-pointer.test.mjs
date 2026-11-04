import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/QuantumPointer.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function mount({reduced=false,embedded=false}={}){
 const window=new EventTarget(),document=Object.assign(new EventTarget(),{hidden:false,documentElement:Object.assign(new EventTarget(),{dataset:{}})});
 window.self=window;window.top=embedded?{}:window;
 const fine=Object.assign(new EventTarget(),{matches:true}),preference=Object.assign(new EventTarget(),{matches:reduced});
 class Element{constructor(actionable=false){this.actionable=actionable;this.disabled=false;}closest(selector){return selector.startsWith('.v2-landing')?null:this.actionable?this:null;}matches(){return this.disabled;}getBoundingClientRect(){return{left:100,top:200,width:80,height:40};}}
 const surfaces=[0,1].map(()=>{const context={arcs:[],scale(){},clearRect(){this.arcs=[];},beginPath(){},arc(...args){this.arcs.push(args);},fill(){}};return{style:{},width:0,height:0,getContext:()=>context,context};});
 const effects=[],exports={},frames=new Map();let now=100,id=0,ref=0;
 vm.runInNewContext(source,{exports,window,document,Element,devicePixelRatio:2,matchMedia:q=>q.includes('any-hover')?fine:preference,localStorage:{getItem:()=>null},performance:{now:()=>now},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),require:name=>{
  if(name==='react')return{useEffect:fn=>effects.push(fn),useRef:()=>({current:surfaces[ref++]})};
  if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};throw Error(name);
 }});
 exports.QuantumPointer();const cleanup=effects[0]();
 const step=(ms=16)=>{now+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));};
 const dispatch=(target,type,values)=>target.dispatchEvent(Object.assign(new Event(type),values));
 const move=(x=600,y=400,type='mouse')=>dispatch(window,'pointermove',{clientX:x,clientY:y,pointerType:type,targetElement:null});
 // Event.target is supplied by native EventTarget; use a document listener target that has no actionable ancestor for movement.
 const button=new Element(true);
 const click=(detail=1,target=button)=>{const event=new Event('click');Object.defineProperty(event,'target',{value:target});Object.assign(event,{button:0,detail,clientX:300,clientY:320});document.dispatchEvent(event);};
 return{window,document,fine,preference,frames,surfaces,step,move,click,button,cleanup};
}

test('all mouse movement paints a bounded field, batches events, and stops at rest',()=>{
 const s=mount();assert.equal(s.frames.size,0);
 for(let i=0;i<20;i++)s.move(500+i,300);
 assert.equal(s.frames.size,1);s.step();assert.ok(s.surfaces[0].context.arcs.length>50,'ordinary document space also receives the point field');
 assert.equal(s.surfaces[0].width,360,'DPR is bounded to 1.5');
 for(let i=0;i<120&&s.frames.size;i++)s.step();assert.equal(s.frames.size,0);assert.equal(s.surfaces[0].context.arcs.length,0);
 s.cleanup();assert.equal(s.surfaces[0].width,0);assert.equal(s.surfaces[1].width,0);
});

test('click wave extends outwards from its own origin while the cursor moves away',()=>{
 const s=mount();s.click();s.step();const origin=s.surfaces[1].style.transform;
 const extent=()=>Math.max(...s.surfaces[1].context.arcs.map(([x,y])=>Math.hypot(x-320,y-320)));
 const first=extent();s.move(1000,700);s.step(270);assert.equal(s.surfaces[1].style.transform,origin);assert.ok(extent()>first+100);
 s.click();s.step();assert.ok(extent()<first+40,'a later click replaces the wave without unbounded particles');
 for(let i=0;i<120&&s.frames.size;i++)s.step();assert.equal(s.frames.size,0);s.cleanup();
});

test('keyboard and reduced-motion feedback stay local, disabled controls and touch movement stay quiet',()=>{
 const s=mount({reduced:true});s.move();assert.equal(s.frames.size,0);s.click(0);s.step();assert.equal(s.surfaces[1].style.transform,'translate3d(-180px,-100px,0)');
 assert.ok(s.surfaces[1].context.arcs.length>0);assert.ok(s.surfaces[1].context.arcs.every(([x,y])=>Math.hypot(x-320,y-320)<65));
 s.step(200);assert.equal(s.frames.size,0);s.button.disabled=true;s.click();assert.equal(s.frames.size,0);s.cleanup();
 const touch=mount();touch.move(300,400,'touch');assert.equal(touch.frames.size,0);touch.cleanup();
});

test('hidden documents cancel work and embedded previews do not allocate a field',()=>{
 const s=mount();s.move();s.step();s.document.hidden=true;s.document.dispatchEvent(new Event('visibilitychange'));assert.equal(s.frames.size,0);
 s.document.hidden=false;s.document.dispatchEvent(new Event('visibilitychange'));assert.equal(s.frames.size,0);s.cleanup();s.move();assert.equal(s.frames.size,0);
 const embedded=mount({embedded:true});embedded.move();embedded.click();assert.equal(embedded.frames.size,0);assert.equal(embedded.surfaces[0].width,0);
});
