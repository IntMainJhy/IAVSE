import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
import {RBP_MOTION,revealDelay} from '../src/lib/rbp-motion.mjs';
const source=fs.readFileSync(new URL('../src/components/rbp/ui/application-reveal.tsx',import.meta.url),'utf8');
function setup({reduced=false,io=true,width=1200,height=800}={}){
 let effect,changes,cleanup,path='/community',query='';const events={},windowEvents={},mediaEvents={},animations=[],nodes=[],observers=[],frames=new Map();let frameId=0;
 const media={matches:reduced,addEventListener:(n,f)=>mediaEvents[n]=f,removeEventListener:n=>delete mediaEvents[n]};
 class Element{
  constructor({parent=null,scope=false,group=false,item=false,automatic=false,match='',excluded=false,width=200,height=100,top=100,left=0,animate=true}={}){Object.assign(this,{parentElement:parent,scope,group,item,automatic,match,excluded,width,height,top,left});this.dataset={};this.children=[];parent?.children.push(this);if(!animate)this.animate=undefined;}
  matches(selector){if(selector==='[data-rbp-reveal-scope]')return this.scope;if(selector==='[data-rbp-reveal-group]')return this.group;if(selector==='[data-rbp-reveal-item]')return this.item;if(selector==='[data-rbp-reveal]')return !!this.dataset.rbpReveal;if(selector.startsWith('.space-root'))return this.excluded;return this.automatic||!!this.match&&selector.split(',').includes(this.match);}
  closest(selector){for(let node=this;node;node=node.parentElement)if(node.matches(selector))return node;return null;}
  querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}
  contains(node){return !!node&&(node===this||this.children.some(child=>child.contains(node)));}
  getBoundingClientRect(){this.rectReads=(this.rectReads||0)+1;const y=animations.findLast(a=>a.node===this&&!a.cancelled)?.translationY||0;return{width:this.width,height:this.height,top:this.top+y,bottom:this.top+this.height+y,left:this.left,right:this.left+this.width};}
  removeAttribute(name){if(name==='data-rbp-reveal')delete this.dataset.rbpReveal;}
  animate(keyframes,options){let resolve,reject;const animation={node:this,frames:keyframes,options,cancelled:false,translationY:RBP_MOTION.distance,finished:new Promise((yes,no)=>{resolve=yes;reject=no}),finish(){this.translationY=0;resolve()},cancel(){this.cancelled=true;reject(new Error('cancelled'));}};animations.push(animation);return animation;}
 }
 const application=new Element(),body=new Element();body.children.push(application);application.parentElement=body;
 const document={body,activeElement:null,querySelectorAll:selector=>selector==='.rbp-application'?[application]:body.querySelectorAll(selector),addEventListener:(n,f)=>events[n]=f,removeEventListener:n=>delete events[n]};
 const exports={};const modules={react:{useEffect:f=>effect=f},'next/navigation':{usePathname:()=>path,useSearchParams:()=>new URLSearchParams(query)},'@/lib/rbp-motion.mjs':{RBP_MOTION,revealDelay}};
 class IO{constructor(callback,options){Object.assign(this,{callback,options,observed:new Set});observers.push(this);}observe(n){this.observed.add(n)}unobserve(n){this.observed.delete(n)}disconnect(){this.observed.clear();this.disconnected=true;}}
 let mutationsDisconnected=false;
 const context={document,exports,require:k=>modules[k],matchMedia:()=>media,window:{...(io?{IntersectionObserver:IO}:{}),innerHeight:height,innerWidth:width,addEventListener:(n,f)=>windowEvents[n]=f,removeEventListener:n=>delete windowEvents[n]},IntersectionObserver:IO,getComputedStyle:node=>({transform:`matrix(1, 0, 0, 1, 0, ${animations.findLast(a=>a.node===node&&!a.cancelled)?.translationY||0})`}),DOMMatrixReadOnly:class{constructor(transform){const values=transform.match(/matrix\((.*)\)/)[1].split(',').map(Number);this.m41=values[4];this.m42=values[5];}},MutationObserver:class{constructor(cb){changes=cb}observe(){}disconnect(){mutationsDisconnected=true}},requestAnimationFrame:f=>{const id=++frameId;frames.set(id,f);return id},cancelAnimationFrame:id=>frames.delete(id)};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 const node=options=>new Element(options),add=(options={})=>{const n=node({parent:application,automatic:true,...options});nodes.push(n);return n;};
 const mount=()=>{exports.ApplicationReveal();cleanup=effect();};
 const flush=()=>{for(const [id,callback]of frames){frames.delete(id);callback();}};
 const mutate=()=>{changes([{addedNodes:[{}]}]);flush();};
 const entryObserver=()=>observers.filter(o=>o.options.threshold===RBP_MOTION.threshold).at(-1),viewportObserver=()=>observers.filter(o=>o.options.threshold===0).at(-1);
 const deliver=(observer,list,isIntersecting,intersectionRatio)=>observer.callback(list.map(target=>({target,isIntersecting,intersectionRatio,boundingClientRect:target.getBoundingClientRect()})));
 return{add,node,body,document,application,nodes,animations,media,mediaEvents,events,windowEvents,observers,mount,mutate,flush,scroll(){windowEvents.scroll?.()},resize(){windowEvents.resize?.()},get queuedFrames(){return frames.size},get observer(){return entryObserver()},get viewport(){return viewportObserver()},get mutationsDisconnected(){return mutationsDisconnected},unmount(){cleanup?.()},route(to){cleanup?.();const url=new URL(to,'https://iavse.test');path=url.pathname;query=url.search.slice(1);mount();},move(list,position){for(const n of list)Object.assign(n,position)},enter(list=nodes,observer=entryObserver()){deliver(observer,list,true,1)},leave(list=nodes,observer=entryObserver()){deliver(observer,list,false,0)},viewportChange(list=nodes,isIntersecting=false,observer=viewportObserver()){deliver(observer,list,isIntersecting,isIntersecting?1:0)},focus(target){document.activeElement=target;events.focusin({target})},blur(target,relatedTarget=null){document.activeElement=relatedTarget;events.focusout({target,relatedTarget});if(relatedTarget)events.focusin({target:relatedTarget})},preference(reduce){media.matches=reduce;mediaEvents.change();}};
}
const settled=()=>new Promise(resolve=>setImmediate(resolve));

for(const viewport of [{width:1440,height:1000},{width:390,height:844}])test(`public catalog, reading and account chunks share repeat entry at ${viewport.width}px`,async()=>{
 const s=setup(viewport),selectors=['.shared-card','.product-download-option','.learning-section-heading','.document-prose h2','.skill-detail-body>section>h2','.community-policy-text>h2','.legal-contact','.community-member-card','.workspace-post-row','.workspace-notification'];
 const chunks=selectors.map(match=>s.node({parent:s.application,match}));
 const nestedTitle=s.node({parent:chunks[0],match:'h1'}),document=s.node({parent:s.application,match:'.document-prose',height:5000}),preview=s.node({parent:s.application,match:'.template-preview-section'}),authored=s.node({parent:s.application,excluded:true}),authoredCard=s.node({parent:authored,match:'.shared-card'});
 s.mount();assert.deepEqual([...s.observer.observed],chunks,'platform short blocks are enrolled without hiding a full document, preview, authored card or nested heading');
 for(let cycle=0;cycle<3;cycle++){
  s.enter(chunks);const active=s.animations.slice(cycle*chunks.length);assert.equal(active.length,chunks.length);assert.ok(active.every(a=>a.options.duration===550&&a.frames[0].transform==='translateY(12px)'));
  for(const animation of active)animation.finish();await settled();s.enter(chunks);assert.equal(s.animations.length,(cycle+1)*chunks.length,'still-visible content does not restart');
  if(cycle<2){s.move(chunks,{top:cycle===0?-101:viewport.height});s.viewportChange(chunks);assert.ok(chunks.every(node=>node.dataset.rbpReveal==='pending'));s.move(chunks,{top:100});}
 }
 assert.ok([nestedTitle,document,preview,authoredCard].every(node=>!node.dataset.rbpReveal));
 const streamed=s.node({parent:s.application,match:'.shared-card'});s.mutate();s.enter([streamed]);s.mutate();s.enter([streamed]);assert.equal(s.animations.filter(animation=>animation.node===streamed).length,1,'streamed catalog cards join the same owner only once');
 s.unmount();assert.ok([...chunks,streamed].every(node=>!node.dataset.rbpReveal));
});

test('reveal repeats after each full viewport exit, keeps a bounded stagger and ignores duplicate entry deliveries',async()=>{
 const s=setup();for(let i=0;i<8;i++)s.add({left:i*100});s.mount();
 assert.equal(s.animations.length,0);assert.ok(s.nodes.every(n=>n.dataset.rbpReveal==='pending'));
 assert.equal(s.observer.options.threshold,RBP_MOTION.threshold);assert.equal(s.observer.options.rootMargin,RBP_MOTION.margin);
 assert.equal(s.viewport.options.threshold,0);assert.equal(s.viewport.options.rootMargin,'0px');
 for(let cycle=0;cycle<3;cycle++){
  s.enter();const current=s.animations.slice(cycle*8);assert.equal(current.length,8);
  assert.deepEqual(current.map(a=>a.options.delay),[0,70,140,210,210,210,210,210]);assert.ok(current.every(a=>a.options.duration===550));
  s.enter();s.mutate();s.enter();assert.equal(s.animations.length,(cycle+1)*8,'duplicate entries and scans do not restart a running cycle');
  for(const a of current)a.finish();await settled();assert.ok(s.nodes.every(n=>!n.dataset.rbpReveal));assert.ok(current.every(a=>a.cancelled));
  s.enter();assert.equal(s.animations.length,(cycle+1)*8,'visible completed chunks stay exposed');
  assert.equal(s.observer.observed.size,8);assert.equal(s.viewport.observed.size,8,'completed chunks remain observed for later exits');
  if(cycle<2){s.move(s.nodes,{top:-101});s.viewportChange();assert.ok(s.nodes.every(n=>n.dataset.rbpReveal==='pending'));s.move(s.nodes,{top:100});}
 }
 s.unmount();
});

test('explicit product chunks outside application layouts reveal in reading order with an independent bounded stagger per group',async()=>{
 const s=setup(),scope=s.node({parent:s.body,scope:true}),intro=s.node({parent:scope,group:true}),roles=s.node({parent:scope,group:true});
 const title=s.node({parent:intro,item:true,top:100}),copy=s.node({parent:intro,item:true,top:180}),cards=Array.from({length:6},(_,index)=>s.node({parent:roles,item:true,top:260,left:index*100}));
 const gallery=s.node({parent:s.body,automatic:true}),diagram=s.node({parent:scope}),nested=s.node({parent:cards[0],item:true}),authored=s.node({parent:scope,excluded:true}),authoredText=s.node({parent:authored,item:true});
 s.mount();const targets=[title,copy,...cards];assert.deepEqual([...s.observer.observed],targets);assert.ok([scope,intro,roles,gallery,diagram,nested,authoredText].every(node=>!node.dataset.rbpReveal));
 assert.equal(s.observer.options.threshold,RBP_MOTION.threshold,'short chunks retain the established mobile-friendly viewport threshold');
 s.enter([...targets].reverse());assert.deepEqual(s.animations.map(a=>a.node),targets);assert.deepEqual(s.animations.map(a=>a.options.delay),[0,70,0,70,140,210,210,210]);
 for(const a of s.animations){assert.equal(a.frames[0].opacity,0);assert.equal(a.frames[0].transform,'translateY(12px)');a.finish();}await settled();s.mutate();s.enter(targets);assert.equal(s.animations.length,targets.length,'mutations and duplicate entry deliveries do not restart visible chunks');
 s.move(targets,{top:800});s.viewportChange(targets);assert.ok(targets.every(node=>node.dataset.rbpReveal==='pending'));s.move(targets,{top:100});s.enter(targets);assert.equal(s.animations.length,targets.length*2);assert.deepEqual(s.animations.slice(targets.length).map(a=>a.options.delay),[0,70,0,70,140,210,210,210]);s.unmount();
});

test('entry threshold, inset-root and clipped-ancestor leaves cannot reset a still-visible chunk',async()=>{
 const s=setup(),a=s.add();s.mount();s.enter();const animation=s.animations[0];
 s.move([a],{top:770});s.leave();s.viewportChange([a]);assert.equal(animation.cancelled,false,'an inset-root or clipped-ancestor leave is not a physical viewport exit');assert.equal(a.dataset.rbpReveal,'running');
 s.enter();assert.equal(s.animations.length,1);animation.finish();await settled();
 for(const position of [{top:790},{top:-99},{top:100,left:-199},{left:1199}]){s.move([a],position);s.leave();s.viewportChange([a]);assert.equal(a.dataset.rbpReveal,undefined,'even one visible pixel keeps the completed chunk exposed');s.enter();assert.equal(s.animations.length,1);}
 s.move([a],{top:100,left:1200});s.viewportChange([a]);assert.equal(a.dataset.rbpReveal,'pending');s.move([a],{left:0});s.enter();assert.equal(s.animations.length,2);s.unmount();
});

test('the reveal translation cannot masquerade as a full layout exit for a short edge chunk',async()=>{
 const s=setup(),a=s.add({height:4,top:795});s.mount();s.enter();const animation=s.animations[0];assert.equal(a.getBoundingClientRect().top,807,'the animation itself moves this short chunk outside');
 s.viewportChange([a]);s.leave([a]);assert.equal(animation.cancelled,false);assert.equal(a.dataset.rbpReveal,'running');assert.equal(s.animations.length,1);
 s.enter([a]);assert.equal(s.animations.length,1,'the animation-created boundary crossing does not begin a second cycle');animation.finish();await settled();assert.equal(a.dataset.rbpReveal,undefined);s.unmount();
});

test('scroll catches an active layout exit when translation already made the observer non-intersecting',async()=>{
 const s=setup(),a=s.add({height:4,top:795}),idle=s.add({top:300});s.mount();s.enter([a]);const old=s.animations[0];
 s.viewportChange([a]);assert.equal(old.cancelled,false,'translation alone does not arm a new cycle');const idleReads=idle.rectReads;
 s.move([a],{top:801});s.scroll();s.resize();s.scroll();assert.equal(s.queuedFrames,1,'scroll and resize checks share one frame');assert.equal(old.cancelled,false);
 s.flush();assert.equal(old.cancelled,true);assert.equal(a.dataset.rbpReveal,'pending','the real layout exit is caught without another IO delivery');assert.equal(idle.rectReads,idleReads,'idle registered chunks are not measured by active-exit checks');
 s.move([a],{top:700});s.enter([a]);const fresh=s.animations[1];assert.equal(s.animations.length,2,'a fast return immediately replays the reveal');await settled();assert.equal(fresh.cancelled,false);assert.equal(a.dataset.rbpReveal,'running');
 fresh.finish();await settled();s.scroll();assert.equal(s.queuedFrames,0,'scroll does not schedule work without active animations');s.enter([idle]);s.scroll();assert.equal(s.queuedFrames,1);s.unmount();assert.equal(s.queuedFrames,0);assert.deepEqual(Object.keys(s.windowEvents),[]);s.flush();
});

test('a full exit cancels active motion and an old completion cannot clear the next cycle',async()=>{
 const s=setup(),a=s.add();s.mount();s.enter();const old=s.animations[0];
 s.move([a],{top:-101});s.viewportChange([a]);assert.equal(old.cancelled,true);assert.equal(a.dataset.rbpReveal,'pending');
 s.move([a],{top:100});s.enter();const fresh=s.animations[1];assert.equal(a.dataset.rbpReveal,'running');await settled();assert.equal(fresh.cancelled,false);assert.equal(a.dataset.rbpReveal,'running','the cancelled cycle promise has no ownership of its replacement');
 s.enter();s.viewportChange([a],true);assert.equal(s.animations.length,2);fresh.finish();await settled();assert.equal(a.dataset.rbpReveal,undefined);s.unmount();
});

test('completion outside the viewport prepares the next cycle even if no exit delivery arrived',async()=>{
 const s=setup(),a=s.add();s.mount();s.enter();s.move([a],{top:800});s.animations[0].finish();await settled();assert.equal(a.dataset.rbpReveal,'pending');
 s.enter();assert.equal(s.animations.length,1,'a stale entry cannot animate a physically offscreen chunk');s.move([a],{top:100});s.enter();assert.equal(s.animations.length,2);s.unmount();
});

test('focused controls remain visible through exits and only resume after blur and a full exit',async()=>{
 const s=setup(),a=s.add(),b=s.add(),link=s.node({parent:a}),other=s.node({parent:a});s.mount();s.focus(link);assert.equal(a.dataset.rbpReveal,undefined);assert.ok(s.observer.observed.has(a));s.enter([a,b]);assert.equal(s.animations.length,1,'a queued intersection cannot hide a focused control');
 s.move([a],{top:-101});s.viewportChange([a]);assert.equal(a.dataset.rbpReveal,undefined);s.blur(link,other);assert.equal(a.dataset.rbpReveal,undefined,'moving focus inside the same chunk keeps it exposed');
 s.move([a],{top:100});s.blur(other);s.enter([a]);assert.equal(s.animations.length,1,'blur while visible does not rearm the chunk');s.move([a],{top:-101});s.viewportChange([a]);assert.equal(a.dataset.rbpReveal,'pending');
 s.move([a],{top:100});s.enter([a]);const active=s.animations[1];s.focus(link);assert.equal(active.cancelled,true);assert.equal(a.dataset.rbpReveal,undefined,'focus immediately releases active animation styles');
 s.move([a],{top:-101});s.viewportChange([a]);assert.equal(a.dataset.rbpReveal,undefined);s.blur(link);assert.equal(a.dataset.rbpReveal,'pending','blur after an offscreen focus exit can arm the next entrance');
 s.move([a],{top:100});s.enter([a]);assert.equal(s.animations.length,3);await settled();assert.equal(a.dataset.rbpReveal,'running');s.unmount();
});

test('a live reduced-motion preference exposes content and normal motion resumes on future offscreen cycles',async()=>{
 const s=setup(),a=s.add(),b=s.add(),c=s.add({animate:false});s.mount();s.enter([a]);s.preference(true);assert.ok([a,b,c].every(n=>!n.dataset.rbpReveal));assert.equal(s.animations[0].cancelled,true);
 s.preference(false);s.mutate();s.enter();assert.equal(s.animations.length,1,'enabling normal motion cannot hide or replay content that is still visible');
 s.move([a,b,c],{top:800});s.viewportChange();assert.equal(a.dataset.rbpReveal,'pending');assert.equal(b.dataset.rbpReveal,'pending');assert.equal(c.dataset.rbpReveal,undefined,'unsupported native animation stays readable on every cycle');
 s.preference(true);assert.ok([a,b,c].every(n=>!n.dataset.rbpReveal));s.preference(false);assert.equal(a.dataset.rbpReveal,'pending','already-offscreen content can resume after normal motion is enabled');
 s.move([a,b,c],{top:100});s.enter();assert.equal(s.animations.length,3);await settled();assert.ok([a,b].every(n=>n.dataset.rbpReveal==='running'));s.unmount();
});

test('already-focused, unmeasurable and unsupported-animation chunks stay readable while streamed chunks are discovered once',()=>{
 const s=setup(),focused=s.add(),hidden=s.add({height:0}),unsupported=s.add({animate:false});s.document.activeElement=s.node({parent:focused});s.mount();assert.deepEqual([...s.observer.observed],[focused,unsupported]);assert.ok([focused,hidden,unsupported].every(n=>!n.dataset.rbpReveal));
 hidden.height=100;const scope=s.node({parent:s.body,scope:true}),next=s.node({parent:scope,item:true});s.mutate();assert.deepEqual([...s.observer.observed],[focused,unsupported,hidden,next]);s.enter([next]);s.mutate();s.enter([next]);assert.equal(s.animations.length,1);s.unmount();assert.ok(!hidden.dataset.rbpReveal&&!next.dataset.rbpReveal);
});

test('route interruption restores pending content and stale animation completion cannot clear the new route reveal',async()=>{
 const s=setup(),active=s.add(),pending=s.add();s.mount();const previous=s.observer,previousViewport=s.viewport;s.enter([active]);const old=s.animations[0];s.route('/blogs');assert.equal(previous.disconnected,true);assert.equal(previousViewport.disconnected,true);assert.equal(old.cancelled,true);assert.ok(active.dataset.rbpReveal==='pending'&&pending.dataset.rbpReveal==='pending');await settled();assert.equal(active.dataset.rbpReveal,'pending','cancelled old-route promises cannot erase a new reveal owner');
 s.enter([active],previous);assert.equal(s.animations.length,1,'disconnected observer deliveries cannot animate after cleanup');s.enter([active]);assert.equal(s.animations.length,2);s.move([active],{top:-101});s.viewportChange([active],false,previousViewport);assert.equal(active.dataset.rbpReveal,'running','a disconnected viewport observer cannot reset the new owner');s.move([active],{top:100});s.unmount();assert.ok([active,pending].every(n=>!n.dataset.rbpReveal));assert.ok(s.animations.every(a=>a.cancelled));assert.equal(s.mutationsDisconnected,true);assert.deepEqual(Object.keys(s.events),[]);assert.deepEqual(Object.keys(s.windowEvents),[]);assert.deepEqual(Object.keys(s.mediaEvents),[]);
});

test('reduced motion and browsers without observers keep content visible without scheduling motion',()=>{
 for(const options of [{reduced:true},{io:false}]){const s=setup(options),automatic=s.add(),scope=s.node({parent:s.body,scope:true}),chunk=s.node({parent:scope,item:true});s.mount();assert.ok([automatic,chunk].every(node=>!node.dataset.rbpReveal));assert.equal(s.animations.length,0);if(options.reduced){s.preference(false);s.enter([automatic,chunk]);assert.equal(s.animations.length,0);s.move([automatic,chunk],{top:800});s.viewportChange([automatic,chunk]);s.move([automatic,chunk],{top:100});s.enter([automatic,chunk]);assert.equal(s.animations.length,2);}else assert.equal(s.observers.length,0);s.unmount();}
});

test('registered parents keep automatic nested targets out of later scans after their styles are released',async()=>{
 const s=setup(),parent=s.add(),nested=s.node({parent,automatic:true});s.mount();s.enter([parent]);s.animations[0].finish();await settled();s.mutate();assert.deepEqual([...s.observer.observed],[parent]);assert.equal(nested.dataset.rbpReveal,undefined);s.unmount();
});
