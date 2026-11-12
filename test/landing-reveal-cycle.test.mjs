import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/landing/IavseLanding.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const settled=()=>new Promise(resolve=>setImmediate(resolve));
function setup({reduced=false,io=true}={}){
 const nodes=[],animations=[],effects=[],refs=[],events={},rootEvents={},mediaEvents={},frames=new Map(),observers=[];let cursor=0,cleanup,frameId=0;
 const document={activeElement:null};
 class Node{
  constructor(top=100){this.top=top;this.height=100;this.shift=0;this.active=null;nodes.push(this);}
  contains(target){return target===this||target?.parent===this;}
  closest(){return this;}
  getBoundingClientRect(){return{top:this.top+this.shift,bottom:this.top+this.shift+this.height,width:200,height:this.height};}
  animate(keyframes,options){let resolve,reject;const node=this,animation={keyframes,options,cancelled:false,finished:new Promise((yes,no)=>{resolve=yes;reject=no}),finish:()=>resolve(),cancel(){this.cancelled=true;if(node.active===this){node.shift=0;node.active=null;}reject(new Error('cancelled'));}};this.shift=24;this.active=animation;animations.push(animation);return animation;}
 }
 class Observer{constructor(callback,options){Object.assign(this,{callback,options,observed:new Set()});observers.push(this);}observe(node){this.observed.add(node);}disconnect(){this.disconnected=true;this.observed.clear();}}
 const root={querySelectorAll:()=>nodes,addEventListener:(name,fn)=>rootEvents[name]=fn,removeEventListener:name=>delete rootEvents[name]};
 const preference={matches:reduced,addEventListener:(name,fn)=>mediaEvents[name]=fn,removeEventListener:name=>delete mediaEvents[name]};
 const window={innerHeight:1000,...(io?{IntersectionObserver:Observer}:{}),addEventListener:(name,fn)=>events[name]=fn,removeEventListener:name=>delete events[name]};
 const jsx=(type,props)=>({type,props}),React={useRef:value=>refs[cursor++]??=( {current:value}),useState:value=>[value,()=>{}],useEffect:fn=>effects.push(fn)};
 const copy=new Proxy({title:['Title']},{get:(object,key)=>object[key]??''}),modules={react:React,'react/jsx-runtime':{jsx,jsxs:jsx},'next/link':{default:'a'},'next/navigation':{useRouter:()=>({refresh(){}})},'lucide-react':new Proxy({},{get:()=>()=>null}),'@/components/ui/GlassSwitch':{GlassSwitch:()=>null},'@/components/BrandMark':{BrandMark:()=>null},'@/components/FeedAvatar':{FeedAvatar:()=>null},'@/components/LocaleProvider':{useLocale:()=>({locale:'zh'})},'@/lib/landing-copy':{landingCopy:()=>copy},'./IavseFlowBackdrop':{default:()=>null}};
 modules['./LandingResourceShowcase']={LandingResourceShowcase:()=>null};
 modules['./LandingSpaceShowcase']={LandingSpaceShowcase:()=>null};
 const exports={};vm.runInNewContext(source,{exports,require:key=>{assert.ok(Object.hasOwn(modules,key),key);return modules[key]},window,document,HTMLElement:Node,IntersectionObserver:Observer,matchMedia:()=>preference,DOMMatrixReadOnly:class{constructor(value){this.m42=Number(value.split(',').at(-1).replace(')',''));}},getComputedStyle:node=>({transform:node.shift?`matrix(1,0,0,1,0,${node.shift})`:'none'}),requestAnimationFrame:fn=>{const id=++frameId;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)});
 const render=()=>{cursor=0;effects.length=0;exports.IavseLanding({content:{posts:[],works:[],space:null,communityUnavailable:false}});refs[0].current=root;cleanup=effects[0]();};
 return{nodes,animations,events,rootEvents,document,observers,add:top=>new Node(top),mount:render,unmount:()=>cleanup?.(),get observer(){return observers.at(-1)},signal(node,{intersecting=true,ratio=.5}={}){this.observer.callback([{target:node,isIntersecting:intersecting,intersectionRatio:ratio,boundingClientRect:node.getBoundingClientRect()}]);},move(node,top,intersecting=true,ratio=.5){node.top=top;this.signal(node,{intersecting,ratio});},scroll(){events.scroll?.();for(const[id,fn]of frames){frames.delete(id);fn();}},focus(node){document.activeElement=node;rootEvents.focusin({target:node});},blur(node){document.activeElement=null;rootEvents.focusout({target:node,relatedTarget:null});},preference(value){preference.matches=value;mediaEvents.change();},rerender(){cleanup?.();render();}};
}

test('landing reveals replay on each full leave and reentry without restarting visible chunks',async()=>{
 const s=setup(),node=s.add();s.mount();assert.equal(s.animations.length,0);assert.deepEqual(Array.from(s.observer.options.threshold),[0,.1]);
 for(let cycle=0;cycle<3;cycle++){
  s.move(node,100);assert.equal(s.animations.length,cycle+1);s.signal(node);assert.equal(s.animations.length,cycle+1);
  s.animations.at(-1).finish();await settled();s.signal(node);assert.equal(s.animations.length,cycle+1);
  s.move(node,cycle%2?-100:1000,false,0);
 }
 assert.equal(s.observer.observed.size,1,'completed entrances stay observed');s.unmount();
});

test('partial threshold exits and the entrance translation itself do not reset a cycle',()=>{
 const s=setup(),node=s.add(990);s.mount();s.signal(node,{ratio:.1});s.signal(node,{intersecting:false,ratio:0});assert.equal(s.animations[0].cancelled,false,'24px visual movement cannot masquerade as leaving the viewport');
 s.move(node,995,true,.05);s.move(node,900);assert.equal(s.animations.length,1,'a partly visible chunk does not replay at a threshold boundary');s.unmount();
});

test('real scroll during an animated exit cancels and rearms even if IO cannot deliver another exit',async()=>{
 const s=setup(),node=s.add(990);s.mount();s.signal(node,{ratio:.1});s.signal(node,{intersecting:false,ratio:0});node.top=1010;s.scroll();assert.equal(s.animations[0].cancelled,true);
 s.move(node,900);assert.equal(s.animations.length,2);await settled();assert.equal(s.animations[1].cancelled,false,'an old cancelled completion cannot clear the new animation');s.unmount();s.signal(node);assert.equal(s.animations.length,2);assert.deepEqual(Object.keys(s.events),[]);assert.deepEqual(Object.keys(s.rootEvents),[]);
});

test('focus and reduced motion expose content, then future offscreen cycles can resume normally',()=>{
 const s=setup(),node=s.add();s.mount();s.focus(node);s.signal(node);assert.equal(s.animations.length,0);s.move(node,-100,false,0);s.blur(node);s.move(node,100);assert.equal(s.animations.length,1);
 s.preference(true);assert.equal(s.animations[0].cancelled,true);s.preference(false);s.signal(node);assert.equal(s.animations.length,1,'a preference change does not restart visible content');s.move(node,1000,false,0);s.move(node,100);assert.equal(s.animations.length,2);s.unmount();
 for(const options of [{reduced:true},{io:false}]){const fallback=setup(options),n=fallback.add();fallback.mount();if(fallback.observer)fallback.signal(n);assert.equal(fallback.animations.length,0);fallback.unmount();}
});

test('filter/content rerenders preserve the visible cycle and a later full exit still permits replay',async()=>{
 const s=setup(),node=s.add();s.mount();s.signal(node);s.animations[0].finish();await settled();s.rerender();s.signal(node);assert.equal(s.animations.length,1);s.move(node,-100,false,0);s.move(node,100);assert.equal(s.animations.length,2);s.unmount();
});
