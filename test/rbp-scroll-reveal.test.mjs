import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
import {RBP_MOTION,revealDelay} from '../src/lib/rbp-motion.mjs';
const source=fs.readFileSync(new URL('../src/components/rbp/ui/application-reveal.tsx',import.meta.url),'utf8');
function setup({reduced=false,io=true}={}){
 let effect,changes,cleanup,path='/community',query='';const events={},mediaEvents={},animations=[],nodes=[],observers=[],frames=new Map();let frameId=0;
 const media={matches:reduced,addEventListener:(n,f)=>mediaEvents[n]=f,removeEventListener:n=>delete mediaEvents[n]};
 class Element{
  constructor({parent=null,scope=false,group=false,item=false,automatic=false,excluded=false,width=200,height=100,top=100,left=0,animate=true}={}){Object.assign(this,{parentElement:parent,scope,group,item,automatic,excluded,width,height,top,left});this.dataset={};this.children=[];parent?.children.push(this);if(!animate)this.animate=undefined;}
  matches(selector){if(selector==='[data-rbp-reveal-scope]')return this.scope;if(selector==='[data-rbp-reveal-group]')return this.group;if(selector==='[data-rbp-reveal-item]')return this.item;if(selector==='[data-rbp-reveal]')return !!this.dataset.rbpReveal;if(selector.startsWith('.space-root'))return this.excluded;return this.automatic;}
  closest(selector){for(let node=this;node;node=node.parentElement)if(node.matches(selector))return node;return null;}
  querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}
  contains(node){return !!node&&(node===this||this.children.some(child=>child.contains(node)));}
  getBoundingClientRect(){return{width:this.width,height:this.height,top:this.top,left:this.left};}
  removeAttribute(name){if(name==='data-rbp-reveal')delete this.dataset.rbpReveal;}
  animate(keyframes,options){let resolve,reject;const animation={node:this,frames:keyframes,options,cancelled:false,finished:new Promise((yes,no)=>{resolve=yes;reject=no}),finish:()=>resolve(),cancel(){this.cancelled=true;reject(new Error('cancelled'));}};animations.push(animation);return animation;}
 }
 const application=new Element(),body=new Element();body.children.push(application);application.parentElement=body;
 const document={body,activeElement:null,querySelectorAll:selector=>selector==='.rbp-application'?[application]:body.querySelectorAll(selector),addEventListener:(n,f)=>events[n]=f,removeEventListener:n=>delete events[n]};
 const exports={};const modules={react:{useEffect:f=>effect=f},'next/navigation':{usePathname:()=>path,useSearchParams:()=>new URLSearchParams(query)},'@/lib/rbp-motion.mjs':{RBP_MOTION,revealDelay}};
 class IO{constructor(callback,options){Object.assign(this,{callback,options,observed:new Set});observers.push(this);}observe(n){this.observed.add(n)}unobserve(n){this.observed.delete(n)}disconnect(){this.observed.clear();this.disconnected=true;}}
 let mutationsDisconnected=false;
 const context={document,exports,require:k=>modules[k],matchMedia:()=>media,window:io?{IntersectionObserver:IO}:{},IntersectionObserver:IO,MutationObserver:class{constructor(cb){changes=cb}observe(){}disconnect(){mutationsDisconnected=true}},requestAnimationFrame:f=>{const id=++frameId;frames.set(id,f);return id},cancelAnimationFrame:id=>frames.delete(id)};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 const node=options=>new Element(options),add=(options={})=>{const n=node({parent:application,automatic:true,...options});nodes.push(n);return n;};
 const mount=()=>{exports.ApplicationReveal();cleanup=effect();};
 const mutate=()=>{changes([{addedNodes:[{}]}]);for(const [id,callback]of frames){frames.delete(id);callback();}};
 return{add,node,body,document,application,nodes,animations,media,mediaEvents,events,observers,mount,mutate,get observer(){return observers.at(-1)},get mutationsDisconnected(){return mutationsDisconnected},unmount(){cleanup?.()},route(to){cleanup?.();const url=new URL(to,'https://iavse.test');path=url.pathname;query=url.search.slice(1);mount();},enter(list=nodes,observer=observers.at(-1)){observer.callback(list.map(target=>({target,isIntersecting:true,boundingClientRect:target.getBoundingClientRect()})))},focus(target){events.focusin({target})},preference(reduce){media.matches=reduce;mediaEvents.change();}};
}
const settled=()=>new Promise(resolve=>setImmediate(resolve));

test('reveal waits for viewport entry, staggers a group within a bounded delay and releases animation styles',async()=>{
 const s=setup();for(let i=0;i<8;i++)s.add({left:i*200});s.mount();assert.equal(s.animations.length,0);assert.ok(s.nodes.every(n=>n.dataset.rbpReveal==='pending'));s.enter();assert.equal(s.animations.length,8);assert.ok(s.animations.every(a=>a.options.delay<=210));assert.ok(s.animations[1].options.delay>s.animations[0].options.delay);for(const a of s.animations)a.finish();await settled();assert.ok(s.nodes.every(n=>!n.dataset.rbpReveal));assert.ok(s.animations.every(a=>a.cancelled));s.enter();assert.equal(s.animations.length,8,'late observer entries cannot replay completed reveals');s.unmount();
});

test('explicit product chunks outside application layouts reveal in reading order with an independent bounded stagger per group',async()=>{
 const s=setup(),scope=s.node({parent:s.body,scope:true}),intro=s.node({parent:scope,group:true}),roles=s.node({parent:scope,group:true});
 const title=s.node({parent:intro,item:true,top:100}),copy=s.node({parent:intro,item:true,top:180}),cards=Array.from({length:6},(_,index)=>s.node({parent:roles,item:true,top:260,left:index*100}));
 const gallery=s.node({parent:s.body,automatic:true}),diagram=s.node({parent:scope}),nested=s.node({parent:cards[0],item:true}),authored=s.node({parent:scope,excluded:true}),authoredText=s.node({parent:authored,item:true});
 s.mount();const targets=[title,copy,...cards];assert.deepEqual([...s.observer.observed],targets);assert.ok([scope,intro,roles,gallery,diagram,nested,authoredText].every(node=>!node.dataset.rbpReveal));
 assert.equal(s.observer.options.threshold,RBP_MOTION.threshold,'short chunks retain the established mobile-friendly viewport threshold');
 s.enter([...targets].reverse());assert.deepEqual(s.animations.map(a=>a.node),targets);assert.deepEqual(s.animations.map(a=>a.options.delay),[0,70,0,70,140,210,210,210]);
 for(const a of s.animations){assert.equal(a.frames[0].opacity,0);assert.equal(a.frames[0].transform,'translateY(12px)');a.finish();}await settled();s.mutate();s.enter(targets);assert.equal(s.animations.length,targets.length,'mutations and repeated crossings do not replay product chunks');s.unmount();
});

test('keyboard focus and a live reduced-motion preference immediately expose pending and running content',async()=>{
 const s=setup(),a=s.add(),b=s.add(),c=s.add(),link=s.node({parent:a});s.mount();s.focus(link);assert.equal(a.dataset.rbpReveal,undefined);assert.ok(!s.observer.observed.has(a));s.enter([a,b]);assert.equal(s.animations.length,1,'a queued intersection cannot hide the focused control again');
 s.preference(true);assert.equal(b.dataset.rbpReveal,undefined);assert.equal(c.dataset.rbpReveal,undefined);assert.ok(s.animations.every(a=>a.cancelled));s.preference(false);s.mutate();s.enter([a,b,c]);assert.equal(s.animations.length,1,'re-enabling motion does not replay exposed content');await settled();s.unmount();
});

test('already-focused, unmeasurable and unsupported-animation chunks stay readable while streamed chunks are discovered once',()=>{
 const s=setup(),focused=s.add(),hidden=s.add({height:0}),unsupported=s.add({animate:false});s.document.activeElement=s.node({parent:focused});s.mount();assert.equal(s.observer.observed.size,0);assert.ok([focused,hidden,unsupported].every(n=>!n.dataset.rbpReveal));
 hidden.height=100;const scope=s.node({parent:s.body,scope:true}),next=s.node({parent:scope,item:true});s.mutate();assert.deepEqual([...s.observer.observed],[hidden,next]);s.enter([next]);s.mutate();s.enter([next]);assert.equal(s.animations.length,1);s.unmount();assert.ok(!hidden.dataset.rbpReveal&&!next.dataset.rbpReveal);
});

test('route interruption restores pending content and stale animation completion cannot clear the new route reveal',async()=>{
 const s=setup(),active=s.add(),pending=s.add();s.mount();const previous=s.observer;s.enter([active]);const old=s.animations[0];s.route('/blogs');assert.equal(previous.disconnected,true);assert.equal(old.cancelled,true);assert.ok(active.dataset.rbpReveal==='pending'&&pending.dataset.rbpReveal==='pending');await settled();assert.equal(active.dataset.rbpReveal,'pending','cancelled old-route promises cannot erase a new reveal owner');
 s.enter([active],previous);assert.equal(s.animations.length,1,'disconnected observer deliveries cannot animate after cleanup');s.enter([active]);assert.equal(s.animations.length,2);s.unmount();assert.ok([active,pending].every(n=>!n.dataset.rbpReveal));assert.ok(s.animations.every(a=>a.cancelled));assert.equal(s.mutationsDisconnected,true);assert.deepEqual(Object.keys(s.events),[]);assert.deepEqual(Object.keys(s.mediaEvents),[]);
});

test('reduced motion and browsers without observers keep content visible without scheduling motion',()=>{
 for(const options of [{reduced:true},{io:false}]){const s=setup(options),automatic=s.add(),scope=s.node({parent:s.body,scope:true}),chunk=s.node({parent:scope,item:true});s.mount();assert.ok([automatic,chunk].every(node=>!node.dataset.rbpReveal));assert.equal(s.animations.length,0);s.unmount();}
});
