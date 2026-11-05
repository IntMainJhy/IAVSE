import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/NavigationTransition.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture({supported=true,reduced=false,throws=false}={}){
 const exports={},effects=[],events=new Map(),microtasks=[],timers=new Map(),pushes=[],transitions=[],observers=[],attrs=new Set();let committed='/';
 class Element{constructor(href='/resources'){this.href=new URL(href,'http://localhost:3010').href;this.target='';this.handlers=new Set();}closest(){return this;}matches(){return true;}hasAttribute(){return false;}addEventListener(_,fn){this.handlers.add(fn);}removeEventListener(_,fn){this.handlers.delete(fn);}}
 const document={hidden:false,body:{},documentElement:{setAttribute:n=>attrs.add(n),removeAttribute:n=>attrs.delete(n)},querySelector:()=>({dataset:{motionRoute:committed}}),addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name)};
 if(supported)document.startViewTransition=update=>{
  if(throws)throw Error('native capture unavailable');
  let finish,ready;const t={update,ready:new Promise(r=>{ready=r;}),finished:new Promise(r=>{finish=r;}),skipTransition(){this.skipped=true;},async run(){await update();ready();},finish(){finish();}};transitions.push(t);return t;
 };
 class MutationObserver{constructor(fn){this.fn=fn;observers.push(this);}observe(){this.connected=true;}disconnect(){this.connected=false;}}
 const preference={matches:reduced,addEventListener:(name,fn)=>events.set('preference',fn),removeEventListener:()=>events.delete('preference')};
 const window={addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name)};window.top=window.self=window;
 vm.runInNewContext(source,{exports,window,document,Element,MutationObserver,URL,location:new URL('http://localhost:3010/'),matchMedia:()=>preference,queueMicrotask:fn=>microtasks.push(fn),setTimeout:fn=>{const id=Symbol();timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),require:name=>{
  if(name==='react')return{useEffect:fn=>effects.push(fn)};if(name==='next/navigation')return{useRouter:()=>({push:to=>pushes.push(to)})};throw Error(name);
 }});
 exports.NavigationTransition();const cleanup=effects[0]();
 const link=new Element();
 function capture(overrides={}){const event={target:link,button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...overrides};events.get('click')?.(event);return event;}
 const target=event=>{for(const fn of [...link.handlers]){link.handlers.delete(fn);fn(event);}for(const fn of microtasks.splice(0))fn();};
 const click=(overrides={})=>{const e=capture(overrides);target(e);return e;};
 const commit=to=>{committed=to;for(const o of observers)if(o.connected)o.fn();};
 const expire=()=>{for(const fn of [...timers.values()])fn();};
 return{link,attrs,events,timers,pushes,transitions,observers,capture,target,click,commit,expire,cleanup,preference,microtasks};
}

test('native transition waits for destination DOM, then releases its single observer and marker',async()=>{
 const s=fixture(),event=s.click();assert.equal(event.defaultPrevented,true);assert.equal(s.transitions.length,1);assert.equal(s.attrs.size,1);assert.deepEqual(s.pushes,[],'old scene is captured before route replacement');
 let updated=false;const update=s.transitions[0].run().then(()=>{updated=true;});assert.deepEqual(s.pushes,['/resources']);s.commit('/community');await Promise.resolve();assert.equal(updated,false,'unrelated/old DOM does not resolve the capture');
 s.commit('/resources');await update;assert.equal(updated,true);assert.ok(s.observers.every(o=>!o.connected));s.transitions[0].finish();await Promise.resolve();assert.equal(s.attrs.size,0);assert.equal(s.timers.size,0);s.cleanup();assert.equal(s.events.size,0);
});

test('draft guards run before the target handler and cannot be bypassed by native navigation',()=>{
 const s=fixture();const event=s.capture();assert.equal(event.defaultPrevented,false,'capture leaves the event available to every dirty-form guard');event.preventDefault();s.target(event);assert.equal(s.transitions.length,0);assert.equal(s.pushes.length,0);
 const blocked=s.capture();blocked.preventDefault();for(const fn of s.microtasks.splice(0))fn();assert.equal(s.link.handlers.size,1,'a native between-listener microtask checkpoint must not remove the target handler');s.expire();assert.equal(s.link.handlers.size,0,'stopPropagation before target leaves no stale once handler');s.cleanup();
});

test('unavailable/reduced APIs, modified links and non-header destinations retain native Next Link behavior',()=>{
 for(const options of [{supported:false},{reduced:true}]){const s=fixture(options);assert.equal(s.click().defaultPrevented,false);assert.equal(s.transitions.length,0);s.cleanup?.();}
 for(const overrides of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{defaultPrevented:true}]){const s=fixture();s.click(overrides);assert.equal(s.transitions.length,0);s.cleanup();}
 for(const href of ['/','/resources?type=docs','/resources#grid','/workspace/account','https://example.com/resources']){const s=fixture();s.link.href=new URL(href,'http://localhost:3010').href;assert.equal(s.click().defaultPrevented,false);s.cleanup();}
 for(const mutate of [link=>link.target='_blank',link=>link.hasAttribute=()=>true,link=>link.matches=()=>false]){const s=fixture();mutate(s.link);assert.equal(s.click().defaultPrevented,false);s.cleanup();}
});

test('rapid navigation skips stale captures and only the latest deferred callback can route',async()=>{
 const s=fixture();s.click();s.link.href='http://localhost:3010/blogs';s.click();assert.equal(s.transitions[0].skipped,true);await s.transitions[0].run();assert.deepEqual(s.pushes,[],'a cancelled update cannot push an obsolete destination');
 const update=s.transitions[1].run();assert.deepEqual(s.pushes,['/blogs']);s.commit('/blogs');await update;s.transitions[0].finish();await Promise.resolve();assert.equal(s.attrs.size,1,'old completion must not erase the current marker');s.transitions[1].finish();await Promise.resolve();assert.equal(s.attrs.size,0);s.cleanup();
});

test('timeouts release frozen captures while routing once, even before the first native update',async()=>{
 for(const runFirst of [false,true]){const s=fixture();s.click();const update=runFirst?s.transitions[0].run():undefined;s.expire();assert.equal(s.transitions[0].skipped,true);assert.equal(s.attrs.size,0);assert.equal(s.timers.size,0);await (update||s.transitions[0].run());assert.deepEqual(s.pushes,['/resources']);s.cleanup();}
 const s=fixture({throws:true});s.click();assert.deepEqual(s.pushes,['/resources']);assert.equal(s.attrs.size,0);assert.equal(s.timers.size,0);s.cleanup();
});

test('back navigation, draft cancellation, preference changes and unmount release pending snapshots',async()=>{
 for(const reason of ['popstate','iavse-navigation-cancel','preference','unmount']){const s=fixture();s.click();const update=s.transitions[0].run();if(reason==='unmount')s.cleanup();else s.events.get(reason)();await update;assert.equal(s.transitions[0].skipped,true);assert.equal(s.attrs.size,0);assert.equal(s.timers.size,0);s.cleanup();}
});
