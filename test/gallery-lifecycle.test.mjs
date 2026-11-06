import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as geometry from '../src/lib/blog-gallery-space.mjs';

const compile=file=>ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const source=compile('../src/components/BlogSpaceGallery.tsx'),scheduler=compile('../src/lib/gallery-scheduler.ts');
const walk=node=>node&&typeof node==='object'?[node,...[node.props?.children].flat().flatMap(walk)]:[];

function fixture({pending=false,reduced=false,count=6}={}){
 class Target{
  listeners=new Map();attrs=new Set();style={setProperty(key,value){this[key]=value;}};dataset={};
  addEventListener(key,fn){let listeners=this.listeners.get(key);if(!listeners)this.listeners.set(key,listeners=new Set());listeners.add(fn);}
  removeEventListener(key,fn){this.listeners.get(key)?.delete(fn);if(!this.listeners.get(key)?.size)this.listeners.delete(key);}
  emit(type,detail){for(const fn of [...this.listeners.get(type)||[]])fn({type,detail});}
  setAttribute(name){this.attrs.add(name);}removeAttribute(name){this.attrs.delete(name);}hasAttribute(name){return this.attrs.has(name);}
  toggleAttribute(name,value){if(value)this.attrs.add(name);else this.attrs.delete(name);}
  getBoundingClientRect(){return{left:0,top:0,width:this.clientWidth||1280,height:this.clientHeight||720};}
 }
 const root=new Target(),stage=Object.assign(new Target(),{clientWidth:1280,clientHeight:720}),world=new Target(),panes=Array.from({length:count},()=>new Target());
 root.querySelector=selector=>selector==='.blog-gallery-exhibits'?stage:selector==='.blog-gallery-world'?world:null;
 root.querySelectorAll=()=>panes;
 const html=new Target();if(pending)html.attrs.add('data-iavse-transition');
 const document=Object.assign(new Target(),{documentElement:html,hidden:false}),window=new Target(),preference=Object.assign(new Target(),{matches:reduced});
 const frames=new Map(),timers=new Map(),intersections=[],resizes=[],contexts=[],tweens=[],hooks=[];let serial=0,cursor=0,dirty=false,effects=[],tree,disposed=false;
 const setTimeout=(fn,delay)=>{timers.set(++serial,{fn,delay});return serial;},clearTimeout=id=>timers.delete(id);
 const requestAnimationFrame=fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame=id=>frames.delete(id);
 const same=(a,b)=>a&&b&&a.length===b.length&&a.every((value,index)=>Object.is(value,b[index]));
 const react={
  memo:fn=>{fn.memoized=true;return fn;},
  useRef(value){const i=cursor++;return hooks[i]||=( {current:value});},
  useState(value){const i=cursor++;const state=hooks[i]||=( {value:typeof value==='function'?value():value});return[state.value,next=>{next=typeof next==='function'?next(state.value):next;if(!Object.is(next,state.value)){state.value=next;dirty=true;}}];},
  useMemo(fn,deps){const i=cursor++;if(!same(hooks[i]?.deps,deps))hooks[i]={deps,value:fn()};return hooks[i].value;},
  useCallback(fn,deps){return react.useMemo(()=>fn,deps);},
  useEffect(fn,deps){const i=cursor++,previous=hooks[i];if(!same(previous?.deps,deps)){hooks[i]={deps,cleanup:previous?.cleanup};effects.push(()=>{previous?.cleanup?.();hooks[i].cleanup=fn();});}},
 };
 class ResizeObserver{constructor(fn){this.fn=fn;this.targets=[];resizes.push(this);}observe(target){this.targets.push(target);}disconnect(){this.disconnected=true;}}
 class IntersectionObserver{constructor(fn){this.fn=fn;intersections.push(this);}observe(){}disconnect(){this.disconnected=true;}}
 const gsap={context(fn){fn();const context={add:callback=>callback(),revert(){context.reverted=true;tweens.forEach(tween=>tween.kill());}};contexts.push(context);return context;},to(progress,vars){const tween={vars,paused:false,killed:false,kill(){this.killed=true;},pause(){this.paused=true;},resume(){this.paused=false;},isActive(){return!this.paused&&!this.killed;},finish(){progress.value=1;vars.onUpdate?.();this.killed=true;vars.onComplete?.();}};tweens.push(tween);return tween;}};
 const jsx=(type,props)=>{if(type==='section'&&props.ref)props.ref.current=root;return{type,props};};
 const shared={document,window,setTimeout,clearTimeout,requestAnimationFrame,cancelAnimationFrame,matchMedia:q=>q.includes('prefers-reduced-motion')?preference:{matches:true},localStorage:{getItem:()=>null},ResizeObserver,IntersectionObserver,Element:Target,CSS:{escape:value=>value}};
 const jobs={};vm.runInNewContext(scheduler,{...shared,exports:jobs});
 const exports={};vm.runInNewContext(source,{...shared,exports,require:name=>{
  if(name==='react')return react;if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};if(name==='next/link')return{default:'Link'};if(name==='gsap')return{gsap};
  if(name.includes('blog-gallery-space'))return geometry;if(name.includes('gallery-scheduler'))return jobs;if(name.includes('LocaleProvider'))return{useLocale:()=>({locale:'en'})};return{};
 }});
 const spaces=Array.from({length:count},(_,i)=>({handle:'person-'+i,name:'Person '+i,href:'/blog/person-'+i})),props={spaces,labels:{loading:'Preparing',directory:'Spaces'}};
 const component=exports.BlogSpaceGallery(props).type;
 const render=()=>{cursor=0;dirty=false;tree=component(props);};
 const flush=()=>{for(let n=0;n<30&&(dirty||effects.length);n++){if(dirty)render();const work=effects;effects=[];work.forEach(fn=>fn());}assert.equal(dirty||effects.length>0,false,'hooks should settle');};
 render();flush();
 const paint=()=>{const work=[...frames.values()];frames.clear();work.forEach(fn=>fn());};
 const tasks=()=>{const work=[...timers].filter(([,timer])=>timer.delay===0);work.forEach(([id,timer])=>{timers.delete(id);timer.fn();});flush();};
 const step=()=>{paint();tasks();};
 const panelProps=()=>walk(tree).filter(node=>node.type?.memoized).map(node=>node.props);
 const mounted=()=>panelProps().filter(panel=>panel.mounted).map(panel=>panel.space.handle);
 const ready=handle=>{panelProps().find(panel=>panel.space.handle===handle).onReady(handle);flush();};
 const intersect=visible=>{intersections[0].fn([{isIntersecting:visible}]);flush();};
 const navigation=(value,{marker=value,flushNow=true}={})=>{html.toggleAttribute('data-iavse-transition',marker);window.emit('iavse-navigation-pending',{pending:value});if(flushNow)flush();};
 const hidden=(value,{flushNow=true}={})=>{document.hidden=value;document.emit('visibilitychange');if(flushNow)flush();};
 const unmount=()=>{if(disposed)return;disposed=true;for(const hook of hooks)hook?.cleanup?.();};
 return{root,stage,world,panes,document,window,html,preference,frames,timers,resizes,contexts,tweens,paint,tasks,step,flush,panelProps,mounted,ready,intersect,navigation,hidden,unmount,get tree(){return tree;},props};
}

test('a gallery mounted during main navigation waits for release, then admits one document per paint with two outstanding',()=>{
 const s=fixture({pending:true});s.intersect(true);assert.deepEqual(s.mounted(),[]);assert.equal(s.frames.size,0);assert.equal(s.root.hasAttribute('data-gallery-running'),false);
 s.navigation(false,{marker:true});assert.equal(s.frames.size,0,'stale old-page release cannot bypass the root marker');
 s.navigation(false);assert.equal(s.frames.size,1);assert.deepEqual(s.mounted(),[]);s.paint();assert.deepEqual(s.mounted(),[],'layout/parse starts after paint');s.tasks();assert.equal(s.mounted().length,1);
 s.step();assert.equal(s.mounted().length,2);assert.equal(s.frames.size,0,'a third outstanding document is not admitted');
 s.ready(s.mounted()[0]);assert.equal(s.mounted().length,2,'ready callbacks do not synchronously mount the next document');s.step();assert.equal(s.mounted().length,3);assert.equal(s.frames.size,0);s.unmount();
});

test('visibility, offscreen exit, navigation and unmount cancel queued admissions and resume without duplicates',()=>{
 for(const pause of['hidden','offscreen','navigation']){
  const s=fixture();s.intersect(true);s.paint();assert.ok([...s.timers.values()].some(timer=>timer.delay===0));
  if(pause==='hidden')s.hidden(true);else if(pause==='offscreen')s.intersect(false);else s.navigation(true);
  s.tasks();assert.deepEqual(s.mounted(),[],pause);assert.equal(s.frames.size,0);
  if(pause==='hidden')s.hidden(false);else if(pause==='offscreen')s.intersect(true);else s.navigation(false);
  s.step();assert.equal(s.mounted().length,1);s.navigation(true);const count=s.mounted().length;s.navigation(false);s.step();assert.equal(new Set(s.mounted()).size,s.mounted().length);assert.equal(s.mounted().length,count+1);s.unmount();assert.equal(s.frames.size+s.timers.size,0);assert.equal(s.window.listeners.size+s.document.listeners.size+s.stage.listeners.size,0);
 }
 const s=fixture();s.intersect(true);s.paint();s.unmount();s.tasks();assert.deepEqual(s.mounted(),[]);assert.ok(s.contexts.every(context=>context.reverted));assert.ok(s.resizes.every(observer=>observer.disconnected));
});

test('ready previews reveal together after a paint, keep stable callbacks and retain spatial transforms',()=>{
 const s=fixture({count:3});s.intersect(true);const choose=s.panelProps()[0].onSelect,onReady=s.panelProps()[0].onReady;
 s.step();s.ready(s.mounted()[0]);s.step();s.ready(s.mounted()[1]);s.step();s.ready(s.mounted()[2]);
 assert.equal(s.tree.props['data-gallery-prepared'],false);s.step();assert.equal(s.tree.props['data-gallery-prepared'],true);
 const world=walk(s.tree).find(node=>node.props?.className==='blog-gallery-world');assert.equal(world.props.inert,false);assert.equal(world.props['aria-hidden'],false);
 for(const props of s.panelProps()){assert.equal(props.onSelect,choose);assert.equal(props.onReady,onReady);}
 assert.match(s.world.style.transform,/translate3d\(.+rotateX\(.+rotateY/);assert.ok(s.panes.every(pane=>pane.style.transform.includes('translate3d(')));assert.equal(s.world.style.opacity,undefined,'no opacity on the preserve-3d world');
 assert.equal(s.resizes.length,1);assert.deepEqual(s.resizes[0].targets,[s.stage]);assert.equal(s.stage.style['--gallery-scale'],String(Math.round(geometry.gallerySceneMetrics(1280).cardWidth-2)/1200));
 s.unmount();
});

test('floating starts only after the scene arrival, and navigation pauses selection without replacing geometry',()=>{
 const s=fixture({count:1});s.intersect(true);s.step();s.ready(s.mounted()[0]);s.step();assert.equal(s.tree.props['data-gallery-floating'],false);
 const stage=()=>walk(s.tree).find(node=>node.props?.className==='blog-gallery-exhibits');const target={};stage().props.onAnimationEnd({target:{},currentTarget:target,animationName:'gallery-arrive'});s.flush();assert.equal(s.tree.props['data-gallery-floating'],false,'nested animation events are ignored');
 stage().props.onAnimationEnd({target,currentTarget:target,animationName:'gallery-suspend'});s.flush();assert.equal(s.tree.props['data-gallery-floating'],false);
 stage().props.onAnimationEnd({target,currentTarget:target,animationName:'gallery-arrive'});s.flush();assert.equal(s.tree.props['data-gallery-floating'],true);
 s.panelProps()[0].onSelect(0);s.flush();assert.equal(s.tree.props['data-focused'],true);const tween=s.tweens.at(-1);assert.equal(tween.vars.duration,1.2);s.navigation(true);assert.equal(tween.paused,true);s.navigation(false);assert.equal(tween.paused,false);tween.finish();s.unmount();
});

test('reduced motion keeps complete previews and spatial placement without selection tweens or float animation',()=>{
 const s=fixture({reduced:true,count:1});s.intersect(true);s.step();s.ready(s.mounted()[0]);s.step();assert.equal(s.tree.props['data-gallery-prepared'],true);assert.equal(s.root.hasAttribute('data-gallery-reduced'),true);
 s.panelProps()[0].onSelect(0);s.flush();assert.equal(s.tweens.length,0);assert.ok(s.panes[0].style.transform.includes('translate3d('));
 const css=fs.readFileSync(new URL('../src/app/iavse-blogs.css',import.meta.url),'utf8');assert.match(css,/\[data-gallery-floating=true\]:not\(\[data-gallery-reduced\]\)/);assert.match(css,/\.blog-gallery\[data-gallery-reduced\] \.blog-gallery-float[^}]+animation:none!important/);assert.match(css,/\.blog-gallery-world\{[^}]*transform-style:preserve-3d/);s.unmount();
});


test('a queued admission cannot race ahead of React cleanup when navigation or hiding starts',()=>{
 for(const reason of['navigation','hidden']){
  const s=fixture();s.intersect(true);s.paint();assert.ok([...s.timers.values()].some(timer=>timer.delay===0));
  if(reason==='navigation')s.navigation(true,{flushNow:false});else s.hidden(true,{flushNow:false});
  s.tasks();assert.deepEqual(s.mounted(),[],reason+' updates the work gate before passive-effect cleanup');
  if(reason==='navigation')s.navigation(false);else s.hidden(false);s.step();assert.equal(s.mounted().length,1);s.unmount();
 }
});

test('a queued complete-scene reveal also waits when a new navigation wins the task race',()=>{
 const s=fixture({count:1});s.intersect(true);s.step();s.ready(s.mounted()[0]);s.paint();
 s.navigation(true,{flushNow:false});s.tasks();assert.equal(s.tree.props['data-gallery-prepared'],false);
 s.navigation(false);s.step();assert.equal(s.tree.props['data-gallery-prepared'],true);s.unmount();
});
