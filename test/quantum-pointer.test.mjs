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
 const context={arcs:[],totalArcs:0,scale(){},clearRect(){this.arcs=[];},beginPath(){},arc(...args){this.arcs.push(args);this.totalArcs++;},fill(){}};
 const canvas={style:{},width:0,height:0,getContext:()=>context,context};
 const wave={style:{},animations:[],animate(keyframes,options){const animation={keyframes,options,cancelled:false,cancel(){this.cancelled=true;}};this.animations.push(animation);return animation;}};
 const surfaces=[canvas,wave],effects=[],exports={},frames=new Map();let now=100,id=0,ref=0;
 vm.runInNewContext(source,{exports,window,document,Element,devicePixelRatio:2,matchMedia:q=>q.includes('any-hover')?fine:preference,localStorage:{getItem:()=>null},performance:{now:()=>now},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),require:name=>{
  if(name==='react')return{useEffect:fn=>effects.push(fn),useRef:()=>({current:surfaces[ref++]})};
  if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};throw Error(name);
 }});
 exports.QuantumPointer();const cleanup=effects[0]();
 const step=(ms=16)=>{now+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));};
 const dispatch=(target,type,values)=>target.dispatchEvent(Object.assign(new Event(type),values));
 const move=(x=600,y=400,type='mouse')=>dispatch(window,'pointermove',{clientX:x,clientY:y,pointerType:type});
 const button=new Element(true);
 const click=(detail=1,target=button)=>{const event=new Event('click');Object.defineProperty(event,'target',{value:target});Object.assign(event,{button:0,detail,clientX:300,clientY:320});document.dispatchEvent(event);};
 const navigation=pending=>dispatch(window,'iavse-navigation-pending',{detail:{pending}});
 return{window,document,fine,preference,frames,canvas,wave,step,move,click,button,navigation,cleanup};
}

test('all mouse movement retains the small bounded field, batches events, and stops at rest',()=>{
 const s=mount();assert.equal(s.frames.size,0);
 for(let i=0;i<20;i++)s.move(500+i,300);
 assert.equal(s.frames.size,1);s.step();assert.ok(s.canvas.context.arcs.length>50,'ordinary document space also receives the point field');
 assert.equal(s.canvas.width,360,'original 240px field with DPR bounded to 1.5');
 for(let i=0;i<120&&s.frames.size;i++)s.step();assert.equal(s.frames.size,0);assert.equal(s.canvas.context.arcs.length,0);
 s.cleanup();assert.equal(s.canvas.width,0);
});

test('click feedback expands from its own origin with zero JS animation frames or canvas draws',()=>{
 const s=mount();s.click();const first=s.wave.animations[0];
 assert.equal(s.frames.size,0);assert.equal(s.canvas.context.totalArcs,0);
 assert.equal(first.keyframes[0].transform,'translate3d(-20px,0px,0) scale(0.08)');
 assert.equal(first.keyframes.at(-1).transform,'translate3d(-20px,0px,0) scale(1)');
 assert.equal(first.keyframes.at(-1).opacity,0);assert.equal(first.options.duration,620);
 for(let i=0;i<100;i++)s.step(1000/120);
 assert.equal(s.frames.size,0);assert.equal(s.canvas.context.totalArcs,0,'high-refresh displays do not multiply click work');
 s.move(1000,700);s.step();assert.equal(first.keyframes[0].transform,'translate3d(-20px,0px,0) scale(0.08)');
 s.click();assert.equal(first.cancelled,true,'a later click replaces the wave instead of stacking layers');
 assert.equal(s.wave.animations.length,2);s.cleanup();assert.equal(s.wave.animations.at(-1).cancelled,true);
});

test('keyboard and reduced-motion feedback stay local, disabled controls and touch movement stay quiet',()=>{
 const s=mount({reduced:true});s.move();assert.equal(s.frames.size,0);s.click(0);
 const animation=s.wave.animations[0];assert.equal(animation.keyframes[0].transform,'translate3d(-180px,-100px,0) scale(0.12)');
 assert.equal(animation.keyframes.at(-1).transform,animation.keyframes[0].transform,'reduced motion fades without spatial expansion');
 assert.equal(animation.options.duration,180);assert.equal(s.frames.size,0);
 s.button.disabled=true;s.click();assert.equal(s.wave.animations.length,1);s.cleanup();
 const touch=mount();touch.move(300,400,'touch');assert.equal(touch.frames.size,0);touch.cleanup();
});

test('navigation suspends pointer work while keeping compositor feedback, and cancellation permits new movement',()=>{
 const s=mount();s.move();s.step();s.navigation(true);assert.equal(s.frames.size,0);assert.equal(s.canvas.context.arcs.length,0);
 s.move();s.click();assert.equal(s.frames.size,0);assert.equal(s.wave.animations.length,1);
 s.navigation(false);assert.equal(s.frames.size,0,'arrival does not resume an idle pointer');
 s.move();assert.equal(s.frames.size,1);s.step();assert.ok(s.canvas.context.arcs.length>50);s.cleanup();
});

test('hidden documents cancel both effects and embedded previews allocate neither field nor wave',()=>{
 const s=mount();s.move();s.click();s.step();s.document.hidden=true;s.document.dispatchEvent(new Event('visibilitychange'));assert.equal(s.frames.size,0);assert.equal(s.wave.animations[0].cancelled,true);
 s.document.hidden=false;s.document.dispatchEvent(new Event('visibilitychange'));assert.equal(s.frames.size,0);s.cleanup();s.move();s.click();assert.equal(s.frames.size,0);assert.equal(s.wave.animations.length,1);
 const embedded=mount({embedded:true});embedded.move();embedded.click();assert.equal(embedded.frames.size,0);assert.equal(embedded.canvas.width,0);assert.equal(embedded.wave.animations.length,0);
});
