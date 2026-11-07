import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {chapterFixture} from './home-chapter-fixture.mjs';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/HomeResourceSculpture.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function atlas({reduced=false,savedReduced=false,inactive=false,locale='en'}={}){
 const hooks=[],observers=[],events=new Map(),systemEvents=new Set(),exports={},frames=new Map(),styles=new Map();let frameId=0;
 const add=(type,fn)=>{const set=events.get(type)||new Set();set.add(fn);events.set(type,set);},remove=(type,fn)=>events.get(type)?.delete(fn);
 const preference={matches:reduced,addEventListener:(type,fn)=>systemEvents.add(fn),removeEventListener:(type,fn)=>systemEvents.delete(fn)};
 const window={addEventListener:add,removeEventListener:remove},document={hidden:false,addEventListener:add,removeEventListener:remove};
 let cursor=0,dirty=true,pending=[],tree;
 const React={
  useRef:initial=>{const index=cursor++;return(hooks[index]||={kind:'ref',value:{current:initial}}).value;},
  useState:initial=>{const index=cursor++,state=hooks[index]||={kind:'state',value:initial};return[state.value,next=>{const value=typeof next==='function'?next(state.value):next;if(!Object.is(value,state.value)){state.value=value;dirty=true;}}];},
  useEffect:(callback,deps)=>{const index=cursor++,effect=hooks[index]||={kind:'effect'};if(!effect.deps||deps.some((value,index)=>!Object.is(value,effect.deps[index])))pending.push(()=>{effect.cleanup?.();effect.deps=deps;effect.cleanup=callback();});}
 };
 let boundsReads=0;
 const bounds={left:0,top:0,width:640,height:340};
 const chapter=chapterFixture(React,{inactive}),host={...chapter.host,style:{setProperty:(key,value)=>styles.set(key,value)},getBoundingClientRect:()=>{boundsReads++;return bounds;}};
 class IntersectionObserver{constructor(callback,options){this.callback=callback;this.options=options;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
 vm.runInNewContext(source,{exports,window,document,localStorage:{getItem:()=>savedReduced?'reduce':null},matchMedia:()=>preference,IntersectionObserver,requestAnimationFrame:callback=>{frames.set(++frameId,callback);return frameId;},cancelAnimationFrame:id=>frames.delete(id),require:name=>{
  if(name==='react')return React;if(name==='next/link')return {__esModule:true,default:'a'};if(name==='./Icons')return {Icon:()=>null};if(name==='./LocaleProvider')return {useLocale:()=>({locale})};if(name==='./useHomeChapterActive')return chapter.module;if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};throw Error('Unexpected eager dependency '+name);
 }});
 const nodes=(type,node=tree)=>!node||typeof node!=='object'?[]:[...(node.type===type?[node]:[]),...[node.props?.children].flat(Infinity).flatMap(child=>child?nodes(type,child):[])];
 function flush(){for(let count=0;dirty&&count<12;count++){dirty=false;cursor=0;pending=[];tree=exports.HomeResourceSculpture({posterSrc:'/poster.webp',label:'Interactive resource atlas',pauseLabel:'Pause demo',playLabel:'Resume demo'});for(const node of nodes('div'))if(node.props.ref)node.props.ref.current=host;for(const effect of pending)effect();}assert.equal(dirty,false);}
 const emit=(name,event={})=>{for(const callback of events.get(name)||[])callback(event);flush();};flush();
 const buttons=()=>nodes('button');
 return {nodes,buttons,frames,styles,observers,events,systemEvents,chapter,bounds,get boundsReads(){return boundsReads;},get tree(){return tree;},
  category:index=>{buttons()[index].props.onClick();flush();},select:index=>{buttons()[4+index].props.onClick();flush();},toggle:()=>{buttons()[3].props.onClick();flush();},
  active:value=>{chapter.activate(value);flush();},visible:value=>{observers[0].callback([{isIntersecting:value}]);flush();},hidden:value=>{document.hidden=value;emit('visibilitychange');},
  system:value=>{preference.matches=value;for(const callback of systemEvents)callback({matches:value});flush();},control:(action,value)=>emit('iavse-scene-control',{detail:{action,value}}),printing:value=>emit(value?'beforeprint':'afterprint'),
  move:(clientX=620,clientY=20)=>{nodes('div').find(node=>node.props.className==='atlas-workspace').props.onPointerMove({pointerType:'mouse',currentTarget:host,clientX,clientY});},
  step:()=>{const queued=[...frames.values()];frames.clear();queued.forEach(callback=>callback());},
  unmount:()=>{for(const hook of hooks)if(hook.kind==='effect')hook.cleanup?.();}
 };
}

test('the resource atlas exposes existing destinations and switches its selected live link',()=>{
 const s=atlas();assert.equal(s.nodes('a')[0].props.href,'/docs/getting-started');s.select(1);assert.equal(s.nodes('a')[0].props.href,'/docs/showcase');
 s.category(1);assert.equal(s.nodes('a')[0].props.href,'/skills/gsap');assert.equal(s.buttons()[1].props['aria-pressed'],true);s.select(2);assert.equal(s.nodes('a')[0].props.href,'/skills/react-best-practices');
 s.category(2);assert.equal(s.nodes('a')[0].props.href,'/resources?type=resources');s.select(1);assert.equal(s.nodes('a')[0].props.href,'/resources/legal-consultation');s.select(2);assert.equal(s.nodes('a')[0].props.href,'/community');
 assert.equal(s.nodes('canvas').length,0,'the index needs no second WebGL canvas, model or texture download');s.unmount();
});

test('the community destination describes creator discoveries in every supported language',()=>{
 for(const [locale,title,description] of [['zh','社区发现','探索创作者分享的作品与发现。'],['en','Community discoveries','Explore work and discoveries shared by creators.'],['ja','コミュニティの発見','クリエイターが共有する作品や発見を探す。']]){
  const s=atlas({locale});s.category(2);s.select(2);assert.equal(s.nodes('a')[0].props.href,'/community');assert.equal(s.nodes('strong').at(-1).props.children,title);assert.equal(s.nodes('p')[0].props.children,description);s.unmount();
 }
});

test('chapter visibility, local pause, global pause, hidden tabs and print suspend the atlas',()=>{
 const s=atlas({inactive:true});s.visible(true);assert.equal(s.tree.props['data-running'],false);s.active(true);assert.equal(s.tree.props['data-running'],true);
 s.toggle();assert.equal(s.tree.props['data-running'],false);s.control('paused',true);s.control('paused',false);assert.equal(s.tree.props['data-running'],false,'global resume retains the local pause');
 s.toggle();assert.equal(s.tree.props['data-running'],true);s.hidden(true);assert.equal(s.tree.props['data-running'],false);s.hidden(false);assert.equal(s.tree.props['data-running'],true);
 s.printing(true);assert.equal(s.tree.props['data-running'],false);s.printing(false);s.active(false);assert.equal(s.tree.props['data-running'],false);s.active(true);assert.equal(s.tree.props['data-running'],true);
 s.unmount();assert.ok(s.observers.every(observer=>observer.disconnected));assert.ok([...s.events.values()].every(set=>set.size===0));assert.equal(s.systemEvents.size,0);assert.ok(s.chapter.observers.every(observer=>observer.disconnected));
});

test('reduced motion keeps the real index usable and replay resets selection without overriding pause',()=>{
 const s=atlas({savedReduced:true});s.visible(true);assert.equal(s.tree.props['data-quiet'],true);assert.equal(s.tree.props['data-running'],false);s.category(1);s.select(1);assert.equal(s.nodes('a')[0].props.href,'/skills/impeccable');
 s.control('reduced',false);assert.equal(s.tree.props['data-running'],true);s.system(true);s.control('reduced',false);assert.equal(s.tree.props['data-running'],false,'manual motion cannot erase the OS preference');s.system(false);
 s.toggle();s.control('replay');assert.equal(s.tree.props['data-running'],false);assert.equal(s.nodes('a')[0].props.href,'/docs/getting-started');s.unmount();
});

test('pointer smoothing schedules only while moving and is cancelled on leaving the chapter',()=>{
 const s=atlas();s.visible(true);assert.equal(s.frames.size,0,'an idle atlas has no continuous JavaScript frame loop');s.move();assert.equal(s.frames.size,1);s.move();assert.equal(s.frames.size,1,'pointer events coalesce');
 s.active(false);assert.equal(s.frames.size,0);assert.equal(s.styles.get('--atlas-x'),'0');s.active(true);s.move();s.unmount();assert.equal(s.frames.size,0,'unmount releases the pending motion frame');
});

test('pointer frames measure only fresh input and use its latest coordinates with current bounds',()=>{
 const s=atlas();s.visible(true);assert.equal(s.boundsReads,0);s.move(0,0);s.move(960,340);assert.equal(s.frames.size,1);assert.equal(s.boundsReads,0,'pointer events do not read layout');
 s.bounds.left=320;s.bounds.top=170;s.step();assert.equal(s.boundsReads,1,'one frame measures the latest input once');assert.equal(s.styles.get('--atlas-x'),'0.160');assert.equal(s.styles.get('--atlas-y'),'0.000');
 s.step();assert.equal(s.boundsReads,1,'interpolation without new input does not measure bounds');s.move(320,170);s.move(960,340);s.step();assert.equal(s.boundsReads,2,'new input during interpolation receives one new measurement');
 for(let count=0;s.frames.size&&count<100;count++)s.step();assert.equal(s.frames.size,0,'settling retains the existing finite frame loop');assert.equal(s.boundsReads,2,'settling frames reuse their measured target');s.unmount();
});
