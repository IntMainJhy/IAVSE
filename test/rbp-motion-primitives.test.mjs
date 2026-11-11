import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {RBP_MOTION} from '../src/lib/rbp-motion.mjs';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/rbp/ui/motion-primitives.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;

function fixture({reduced=false,reveal='scroll',missingObserver=false,top=950,height=100}={}){
 const hooks=[],effects=[],frames=new Map(),observers=[],calls=[],exports={};let cursor=0,frameId=0,tree;
 class Target{
  listeners=new Map();
  addEventListener(name,callback,options){const list=this.listeners.get(name)||new Map();list.set(callback,options);this.listeners.set(name,list);}
  removeEventListener(name,callback){this.listeners.get(name)?.delete(callback);}
  dispatch(name){for(const callback of this.listeners.get(name)?.keys()||[])callback();}
 }
 const y={value:reduced?0:RBP_MOTION.distance,get(){return this.value;}};
 const node=Object.assign(new Target(),{top,left:100,width:200,height,contains:target=>target===node||target?.parent===node,getBoundingClientRect(){return{top:this.top+y.value,bottom:this.top+y.value+this.height,left:this.left,right:this.left+this.width,width:this.width,height:this.height};}});
 const document={activeElement:null},window=Object.assign(new Target(),{innerWidth:1000,innerHeight:900});
 const controls={set:target=>{calls.push({kind:'set',target});y.value=target.y;},start:target=>{calls.push({kind:'start',target});return Promise.resolve();},stop:()=>calls.push({kind:'stop'})};
 class IntersectionObserver{
  constructor(callback,options){this.callback=callback;this.options=options;this.observations=0;observers.push(this);}
  observe(target){this.target=target;this.observations++;}
  unobserve(target){assert.equal(target,this.target);this.unobserved=true;}
  disconnect(){this.disconnected=true;}
  notify(rootBounds={top:0,left:0,right:window.innerWidth,bottom:window.innerHeight-window.innerWidth*.06}){this.callback([{target:this.target,rootBounds}]);}
 }
 vm.runInNewContext(source,{exports,window,document,IntersectionObserver:missingObserver?undefined:IntersectionObserver,requestAnimationFrame:callback=>{frames.set(++frameId,callback);return frameId;},cancelAnimationFrame:id=>frames.delete(id),require:name=>{
  if(name==='motion/react')return{motion:{div:'motion.div'},useReducedMotion:()=>reduced,useAnimationControls:()=>controls,useMotionValue:()=>y};
  if(name==='react')return{
   useRef:initial=>hooks[cursor++]||=({current:initial}),
   useEffect:(callback,deps)=>{const index=cursor++,previous=hooks[index];if(!previous||deps.some((value,key)=>!Object.is(value,previous.deps[key])))effects.push(()=>{previous?.cleanup?.();hooks[index]={deps,cleanup:callback()};});}
  };
  if(name==='@/lib/rbp-motion.mjs')return{RBP_MOTION};
  if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props})};
  throw Error('Unexpected dependency '+name);
 }});
 function render(){cursor=0;tree=exports.FadeIn({children:'Readable content',reveal,delay:.5,className:'existing-layout'});tree.props.ref.current=node;for(const effect of effects.splice(0))effect();return tree;}
 render();
 return{node,window,document,calls,frames,observers,controls,y,exports,get tree(){return tree;},starts:()=>calls.filter(call=>call.kind==='start'),sets:()=>calls.filter(call=>call.kind==='set'),complete:()=>{y.value=0;},notify:()=>observers.at(-1).notify(),scroll(nextTop){node.top=nextTop;window.dispatch('scroll');this.flush();},flush(){const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback());},reduce(value){reduced=value;render();},cleanup(){for(const hook of hooks)hook.cleanup?.();}};
}

test('scroll FadeIn replays each full exit and reentry without threshold jitter or duplicate restarts',()=>{
 const f=fixture(),observer=f.observers[0];
 assert.equal(f.tree.props['data-rbp-entry'],'scroll');assert.equal(f.tree.props.className,'existing-layout');
 assert.equal(f.tree.type,'motion.div');assert.equal(f.tree.props.initial.y,12);assert.equal(f.tree.props.transition.duration,.8);assert.equal(f.tree.props.transition.delay,.21);
 assert.equal(observer.options.rootMargin,RBP_MOTION.margin);assert.deepEqual(Array.from(observer.options.threshold),[0,.12]);
 f.notify();assert.equal(f.starts().length,0);
 f.scroll(829);assert.equal(f.starts().length,0,'the existing 12% entry threshold still applies');
 f.scroll(828);assert.equal(f.starts().length,1);f.complete();
 for(const top of [835,850,899,828]){f.scroll(top);f.notify();}
 assert.equal(f.starts().length,1,'partially visible content stays visible across the entry threshold and margin');
 assert.equal(f.sets().length,0,'no hidden frame while any part remains in the physical viewport');
 f.scroll(900);assert.equal(f.sets().at(-1).target.opacity,0);
 for(const top of [950,900]){f.scroll(top);f.notify();}assert.equal(f.starts().length,1);
 f.scroll(828);f.notify();f.notify();assert.equal(f.starts().length,2);f.complete();
 f.scroll(-99);assert.equal(f.sets().length,1,'one visible pixel above the viewport does not reset');
 f.scroll(-100);assert.equal(f.sets().length,2);f.notify();assert.equal(f.starts().length,2,'its own translated hidden frame cannot trigger replay');
 f.scroll(-89);assert.equal(f.starts().length,2);
 f.scroll(-88);f.notify();assert.equal(f.starts().length,3,'scrolling back down replays from the same layout threshold');
 f.cleanup();
});

test('physical exit uses layout coordinates while the entry translation is still running',()=>{
 const f=fixture({top:100});f.notify();assert.equal(f.starts().length,1);
 f.y.value=8;f.scroll(895);assert.equal(f.sets().length,0,'a translated bounding rect outside the bottom does not hide visible layout');
 f.scroll(900);assert.equal(f.sets().length,1);
 f.scroll(100);assert.equal(f.starts().length,2);f.y.value=8;
 f.scroll(-99);assert.equal(f.sets().length,1);f.scroll(-100);assert.equal(f.sets().length,2,'the translation does not postpone the full top exit');
 f.cleanup();
});

test('keyboard focus immediately reveals delayed content and keeps it readable while focused',()=>{
 const f=fixture(),child={parent:f.node};f.document.activeElement=child;f.node.dispatch('focusin');
 assert.equal(f.sets().at(-1).target.opacity,1);assert.equal(f.y.value,0);assert.equal(f.starts().length,0);
 f.notify();f.scroll(-200);assert.equal(f.sets().at(-1).target.opacity,1);
 f.document.activeElement=null;f.node.dispatch('focusout');f.flush();assert.equal(f.sets().at(-1).target.opacity,0);
 f.scroll(100);assert.equal(f.starts().length,1);f.document.activeElement=child;f.node.dispatch('focusin');assert.equal(f.sets().at(-1).target.opacity,1,'focusing during an active entrance completes it immediately');
 f.cleanup();
});

test('reduced motion and missing observers keep content visible with no scroll lifecycle',()=>{
 for(const options of [{reduced:true},{missingObserver:true}]){
  const f=fixture(options);assert.equal(f.observers.length,0);assert.equal(f.starts().length,0);assert.equal(f.sets().at(-1).target.opacity,1);assert.equal(f.y.value,0);
  assert.equal(f.window.listeners.size,0);if(options.reduced){assert.equal(f.tree.props.initial,false);assert.equal(f.tree.props.transition.duration,0);assert.equal(f.tree.props.transition.delay,0);}f.cleanup();
 }
 const f=fixture({top:100});f.notify();const first=f.observers[0];f.reduce(true);
 assert.equal(first.disconnected,true);assert.equal(f.sets().at(-1).target.opacity,1);assert.equal(f.y.value,0);
 f.reduce(false);assert.equal(f.observers.length,2);f.notify();assert.equal(f.starts().length,2);f.cleanup();
});

test('mount-only FadeIn and ScaleUnblur retain mount semantics',()=>{
 const f=fixture({reveal:'mount'}),tree=f.tree;
 assert.equal(f.observers.length,0);assert.equal(f.calls.length,0);assert.equal(tree.props.animate.opacity,1);assert.equal(tree.props.animate.y,0);
 assert.equal(tree.props.style,undefined);assert.equal(tree.props['data-rbp-entry'],'mount');assert.equal(tree.props.initial.opacity,0);
 const scale=f.exports.ScaleUnblur({children:'Hero art'});
 assert.equal(scale.props['data-rbp-entry'],'mount');assert.equal(scale.props.initial.scale,.7);assert.equal(scale.props.animate.scale,1);assert.equal(scale.props.initial.filter,'blur(20px)');assert.equal(scale.props.transition.duration,1);
 f.cleanup();
});

test('resize refreshes native entry bounds and cleanup cancels frames, observers and focus listeners',()=>{
 const f=fixture({top:100}),observer=f.observers[0];f.notify();f.complete();
 const scrollOptions=[...f.window.listeners.get('scroll').values()][0];assert.equal(scrollOptions.passive,true);
 f.window.innerHeight=50;f.window.dispatch('resize');assert.equal(observer.unobserved,true);assert.equal(observer.observations,2);f.notify();f.flush();assert.equal(f.sets().at(-1).target.opacity,0);
 f.window.dispatch('scroll');f.window.dispatch('scroll');assert.equal(f.frames.size,1,'scroll reads share one animation frame');
 f.cleanup();assert.equal(f.frames.size,0);assert.equal(observer.disconnected,true);
 assert.ok([...f.window.listeners.values(),...f.node.listeners.values()].every(list=>list.size===0));
 const count=f.calls.length;observer.notify();f.node.dispatch('focusin');f.window.dispatch('scroll');assert.equal(f.calls.length,count,'late callbacks cannot mutate an unmounted entry');
});
