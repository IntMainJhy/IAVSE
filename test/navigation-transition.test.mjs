import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const compile=file=>ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const source=compile('../src/components/NavigationTransition.tsx'),helper=compile('../src/lib/navigation-motion.ts');

function fixture({reduced=false,iframe=false,hidden=false,throws=false,animationThrows=false,path='/',supported=false,scrollY=0}={}){
 const exports={},effects=[],events=new Map(),microtasks=[],timers=new Map(),pushes=[],timelines=[],contexts=[],pending=[],location=new URL(path,'http://localhost:3010');
 const headerSelectors={desktop:'.organic-header .organic-desktop-nav>a',mobile:'.organic-header .organic-mobile-menu>nav>a',brand:'.organic-header a.organic-brand'};
 class Element{
  constructor(classes='',children=[]){this.classes=classes.split(' ');this.children=children;this.style={};this.dataset={};this.attrs=new Map();this.handlers=new Set();this.rect={top:50,bottom:150};for(const node of children)node.parent=this;}
  contains(node){return this===node||this.children.some(child=>child.contains(node));}
  matches(selector){return selector.split(',').some(part=>part===headerSelectors[this.kind]||part.startsWith('.')&&this.classes.includes(part.slice(1)));}
  closest(){return this.href?this:this.parent?.closest()||null;}
  querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}
  getBoundingClientRect(){return this.rect;}
  setAttribute(name,value){this.attrs.set(name,value);}
  removeAttribute(name){this.attrs.delete(name);}
  hasAttribute(name){return this.attrs.has(name);}
  addEventListener(name,fn){assert.equal(name,'click');this.handlers.add(fn);}
  removeEventListener(name,fn){assert.equal(name,'click');this.handlers.delete(fn);}
  cloneNode(){throw Error('A transition must not duplicate the live page');}
 }
 const node=(classes='',children=[])=>new Element(classes,children),scene=(classes='v2-hero-copy')=>node('page-content',[node(classes)]);
 let current=scene(),currentContext;
 const old=current,layer=node('iavse-route-veil');old.dataset.motionRoute=location.pathname+location.search;layer.hidden=true;
 const document={hidden,body:node(),documentElement:node(),querySelector:()=>current,addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name)};
 if(supported)document.startViewTransition=()=>{throw Error('Native snapshots must not be requested');};
 const preference={matches:reduced,addEventListener:(_,fn)=>events.set('preference',fn),removeEventListener:()=>events.delete('preference')};
 const window={addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name),dispatchEvent:event=>{if(event.type==='iavse-navigation-pending')pending.push(event.detail.pending);events.get(event.type)?.(event);}};window.self=window;window.top=iframe?{}:window;
 const styleKeys=value=>Object.keys(value||{}).filter(key=>!['duration','ease','overwrite','stagger','clearProps'].includes(key));
 const gsap={
  context(fn,scope){
   const saved=new Map(),context={scope,reverted:false,reverts:0,add(callback){const before=currentContext;currentContext=context;try{return callback();}finally{currentContext=before;}},remember(target,values){let keys=saved.get(target);if(!keys){keys=new Map();saved.set(target,keys);}for(const key of styleKeys(values))if(!keys.has(key))keys.set(key,target.style[key]);},revert(){context.reverted=true;context.reverts++;for(const [target,keys]of saved)for(const[key,value]of keys){if(value===undefined)delete target.style[key];else target.style[key]=value;}}};
   contexts.push(context);context.add(fn);return context;
  },
  timeline(options){
   if(animationThrows)throw Error('Cannot initialize the visual handoff');
   const context=currentContext,operations=[];
   const add=(target,from,to,at)=>{const targets=Array.isArray(target)?target:[target];for(const item of targets){context.remember(item,from);context.remember(item,to);for(const key of styleKeys(from||to))item.style[key]=(from||to)[key];}operations.push({targets,from,to,at});return timeline;};
   const timeline={options,context,operations,to:(target,to,at)=>add(target,null,to,at),fromTo:(target,from,to,at)=>add(target,from,to,at),complete(){if(!context.reverted)for(const operation of operations)for(const target of operation.targets)for(const key of styleKeys(operation.to))target.style[key]=operation.to[key];options.onComplete?.();}};
   timelines.push(timeline);return timeline;
  }
 };
 const sandbox={window,document,Element,URL,location,scrollY,innerHeight:900,matchMedia:()=>preference,CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail;}},queueMicrotask:fn=>microtasks.push(fn),requestAnimationFrame:()=>{throw Error('Navigation cannot wait for a display frame');},setTimeout:(fn,delay)=>{const id=Symbol();timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id)};
 const helpers={};vm.runInNewContext(helper,{...sandbox,exports:helpers});
 vm.runInNewContext(source,{...sandbox,exports,require:name=>{
  if(name==='react')return{useEffect:fn=>effects.push(fn),useRef:()=>({current:null})};
  if(name==='react/jsx-runtime')return{jsx:(_,props)=>{props.ref.current=layer;return{props};}};
  if(name==='next/navigation')return{useRouter:()=>({push:to=>{pushes.push(to);if(throws)throw Error('Router unavailable');}})};
  if(name==='gsap')return{gsap};if(name==='@/lib/navigation-motion')return helpers;throw Error(name);
 }});
 const output=exports.NavigationTransition(),cleanup=effects[0]()||(()=>{}),link=node();Object.assign(link,{href:new URL('/resources',location).href,target:'',kind:'desktop'});
 function capture(overrides={}){const event={target:link,button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...overrides};events.get('click')?.(event);return event;}
 const checkpoint=()=>{for(const fn of microtasks.splice(0))fn();};
 const target=event=>{for(const fn of [...link.handlers]){link.handlers.delete(fn);fn(event);}checkpoint();};
 const click=(overrides={})=>{const event=capture(overrides);target(event);return event;};
 const commit=(route,root=scene('catalog-page-heading'))=>{current=root;root.dataset.motionRoute=route;location.href=new URL(route,location).href;events.get('iavse-route-commit')?.({detail:{route,root}});return root;};
 const expire=(delay=4000)=>{for(const [id,timer]of [...timers])if(timer.delay===delay){timers.delete(id);timer.fn();}};
 const emit=name=>events.get(name)?.();
 return{link,document,layer,old,events,timers,pushes,timelines,contexts,pending,capture,target,click,commit,expire,cleanup,preference,checkpoint,emit,node,scene,helpers,output,location};
}

test('main navigation pushes immediately without snapshots, display frames or departure completion',()=>{
 for(const supported of[false,true]){
  const s=fixture({supported}),event=s.click();assert.equal(event.defaultPrevented,true);assert.deepEqual(s.pushes,['/resources']);assert.equal(s.timelines.length,1);
  assert.equal(s.document.documentElement.attrs.get('data-iavse-transition'),'/resources');assert.deepEqual(s.pending,[true]);assert.equal(s.old.hasAttribute('aria-busy'),true);
  assert.equal(s.layer.hidden,false);assert.equal(s.layer.dataset.surface,'landing');assert.equal(s.output.props['aria-hidden'],'true');s.cleanup();
 }
});

test('only the matching committed route starts one GSAP arrival and completion restores styles',()=>{
 const s=fixture();s.click();s.commit('/');assert.equal(s.timelines.length,1,'old-route hydration cannot consume the arrival');
 const root=s.commit('/resources');assert.equal(s.timelines.length,2);assert.equal(s.contexts[0].reverted,true);assert.equal(s.old.hasAttribute('aria-busy'),false);
 assert.equal(root.children[0].style.opacity,.72);s.commit('/resources',root);assert.equal(s.timelines.length,2,'duplicate layout commits do not restart the transition');
 s.timelines[1].complete();assert.deepEqual(root.children[0].style,{});assert.deepEqual(s.old.children[0].style,{});assert.equal(s.layer.hidden,true);assert.equal(s.document.documentElement.attrs.size,0);
 assert.deepEqual(s.pending,[true,false]);assert.equal(s.timers.size,0);s.cleanup();assert.equal(s.events.size,0);
});

test('draft guards run before target interception and between-listener microtasks preserve navigation',()=>{
 const s=fixture(),event=s.capture();assert.equal(event.defaultPrevented,false);s.checkpoint();assert.equal(s.link.handlers.size,1,'native event microtask checkpoints must not discard the target handler');
 event.preventDefault();s.target(event);assert.equal(s.pushes.length,0);assert.equal(s.timelines.length,0);assert.equal(s.pending.length,0);
 const blocked=s.capture();blocked.preventDefault();s.checkpoint();assert.equal(s.link.handlers.size,1);s.expire(0);assert.equal(s.link.handlers.size,0,'a stopped capture cannot leave a stale target listener');
 s.click();assert.deepEqual(s.pushes,['/resources']);s.cleanup();
});

test('reduced motion, iframe, hidden pages and modified input preserve ordinary link behavior',()=>{
 for(const options of[{reduced:true},{iframe:true},{hidden:true}]){const s=fixture(options);assert.equal(s.click().defaultPrevented,false);assert.equal(s.pushes.length,0);assert.equal(s.timelines.length,0);s.cleanup();}
 for(const overrides of[{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{defaultPrevented:true},{target:{}}]){const s=fixture();s.click(overrides);assert.equal(s.pushes.length,0);assert.equal(s.timelines.length,0);s.cleanup();}
});

test('the shared eligibility rule includes only plain same-origin main navigation',()=>{
 for(const kind of['desktop','mobile','brand'])for(const href of['/community','/blogs','/resources']){
  const s=fixture();s.link.kind=kind;s.link.href=new URL(href,s.location).href;assert.equal(s.helpers.mainNavigationDestination(s.link),href);s.click();assert.deepEqual(s.pushes,[href]);s.cleanup();
 }
 for(const href of['/','/resources?type=docs','/resources#grid','/workspace/account','/community/topic/one','https://example.com/resources','mailto:hello@example.com']){const s=fixture();s.link.href=new URL(href,s.location).href;assert.equal(s.helpers.mainNavigationDestination(s.link),null);assert.equal(s.click().defaultPrevented,false);s.cleanup();}
 for(const mutate of[link=>link.kind='footer',link=>link.target='_blank',link=>link.setAttribute('download','')]){const s=fixture();mutate(s.link);assert.equal(s.helpers.mainNavigationDestination(s.link),null);assert.equal(s.click().defaultPrevented,false);s.cleanup();}
 const s=fixture({path:'/blogs'});s.link.kind='brand';s.link.href=new URL('/',s.location).href;s.link.target='_self';assert.equal(s.helpers.mainNavigationDestination(s.link),'/');s.click();assert.deepEqual(s.pushes,['/']);s.cleanup();
});

test('rapid navigation kills previous work and stale completions cannot release the latest handoff',()=>{
 const s=fixture();s.click();s.commit('/resources');const stale=s.timelines[1];
 s.link.href=new URL('/blogs',s.location).href;s.click();assert.deepEqual(s.pushes,['/resources','/blogs']);assert.equal(stale.context.reverted,true);
 stale.options.onComplete();assert.equal(s.document.documentElement.attrs.get('data-iavse-transition'),'/blogs');assert.equal(s.pending.at(-1),true);assert.equal(s.timers.size,1);
 s.commit('/resources');assert.equal(s.timelines.length,3);s.commit('/blogs');assert.equal(s.timelines.length,4);s.timelines[3].complete();
 assert.equal(s.document.documentElement.attrs.size,0);assert.equal(s.pending.at(-1),false);assert.equal(s.timers.size,0);s.cleanup();
});

test('slow responses and router failures release styles without issuing a second navigation',()=>{
 for(const committed of[false,true]){
  const s=fixture();s.click();if(committed)s.commit('/resources');s.expire();assert.deepEqual(s.pushes,['/resources']);assert.equal(s.layer.hidden,true);assert.equal(s.document.documentElement.attrs.size,0);assert.equal(s.timers.size,0);assert.equal(s.pending.at(-1),false);
  s.commit('/resources');assert.equal(s.timelines.length,committed?2:1,'late commits after timeout cannot resurrect an animation');s.cleanup();
 }
 const s=fixture({throws:true});s.click();assert.deepEqual(s.pushes,['/resources']);assert.equal(s.layer.hidden,true);assert.equal(s.document.documentElement.attrs.size,0);assert.equal(s.timers.size,0);s.cleanup();
});

test('a redirect or another committed destination supersedes the pending handoff immediately',()=>{
 for(const route of['/community','/resources?type=docs','/login']){
  const s=fixture();s.click();s.commit(route);assert.equal(s.timelines.length,1);assert.equal(s.layer.hidden,true);assert.equal(s.document.documentElement.attrs.size,0);assert.equal(s.pending.at(-1),false);assert.equal(s.timers.size,0);
  s.commit('/resources');assert.equal(s.timelines.length,1,'late original response cannot take over the new destination');s.cleanup();
 }
});

test('an animation setup failure never blocks the route request or leaves renderers suspended',()=>{
 const s=fixture({animationThrows:true});assert.doesNotThrow(()=>s.click());assert.deepEqual(s.pushes,['/resources']);assert.equal(s.document.documentElement.attrs.size,0);assert.equal(s.old.hasAttribute('aria-busy'),false);assert.equal(s.layer.hidden,true);assert.deepEqual(s.pending,[true,false]);assert.equal(s.timers.size,0);s.cleanup();
});

test('back, cancellation, preference changes, hiding and unmount clean every pending resource',()=>{
 for(const reason of['popstate','iavse-navigation-cancel','preference','visibilitychange','unmount']){
  const s=fixture();s.click();const root=s.commit('/resources');if(reason==='unmount')s.cleanup();else{if(reason==='visibilitychange')s.document.hidden=true;s.emit(reason);}
  assert.equal(s.layer.hidden,true,reason);assert.equal(s.document.documentElement.attrs.size,0,reason);assert.deepEqual(root.children[0].style,{},reason);assert.equal(s.pending.at(-1),false,reason);assert.equal(s.timers.size,0,reason);s.cleanup();assert.equal(s.events.size,0);
 }
 const s=fixture();s.capture();assert.equal(s.link.handlers.size,1);s.cleanup();assert.equal(s.link.handlers.size,0);assert.equal(s.timers.size,0,'unmount also discards capture-only handlers');
});

test('same-surface and empty-shell arrivals remain bounded without flashing a cover',()=>{
 const s=fixture({path:'/community'});s.click();assert.equal(s.layer.hidden,true);const root=s.scene('no-motion-receiver');s.commit('/resources',root);
 const arrival=s.timelines[1];assert.equal(arrival.operations.length,1);assert.equal(arrival.operations[0].to.duration,.16);assert.equal(s.layer.hidden,true);
 arrival.complete();assert.equal(s.pending.at(-1),false);assert.equal(s.timers.size,0);s.cleanup();
 const scrolled=fixture({scrollY:1200});scrolled.click();assert.equal(scrolled.layer.dataset.surface,'reading');scrolled.cleanup();
});

test('receivers are visible, non-nested and bounded; fixed rails, canvas and the 3D world are excluded',()=>{
 const s=fixture(),nested=s.node('catalog-page-heading'),parent=s.node('community-route-content',[nested]);
 const above=s.node('resource-overview-group');above.rect={top:-200,bottom:0};const below=s.node('catalog-search');below.rect={top:900,bottom:1000};
 const visible=Array.from({length:6},()=>s.node('resource-overview-group'));
 const forbidden=[s.node('blog-gallery-world'),s.node('v2-atmosphere'),s.node('organic-header'),s.node('feed-nav-links')];
 const root=s.node('page-content',[parent,above,below,...visible,...forbidden]),receivers=Array.from(s.helpers.navigationReceivers(root));
 assert.deepEqual(receivers,[parent,...visible.slice(0,3)]);assert.equal(receivers.includes(nested),false);assert.ok(forbidden.every(node=>!receivers.includes(node)));s.cleanup();
});

test('arrival receivers survive the previous scroll offset before Next restores the destination scroll',()=>{
 const s=fixture({scrollY:2400}),nested=s.node('catalog-search'),heading=s.node('catalog-page-heading',[nested]);heading.rect={top:-2400,bottom:-2240};nested.rect={top:-2360,bottom:-2300};
 const groups=Array.from({length:6},()=>{const node=s.node('resource-overview-group');node.rect={top:-1800,bottom:-1500};return node;});
 const world=s.node('blog-gallery-world'),root=s.node('page-content',[heading,...groups,world]);
 assert.deepEqual(Array.from(s.helpers.navigationReceivers(root)),[],'offscreen outgoing elements are still excluded');
 assert.deepEqual(Array.from(s.helpers.navigationReceivers(root,true)),[heading,...groups.slice(0,3)],'incoming receivers remain non-nested and bounded to four');
 s.click();s.commit('/resources',root);const arrival=s.timelines[1],content=arrival.operations.find(operation=>operation.targets.includes(heading));
 assert.ok(content,'the real controller must request entering receivers before scroll restoration');assert.equal(content.targets.length,4);assert.equal(content.targets.includes(nested),false);assert.equal(content.targets.includes(world),false);
 arrival.complete();assert.deepEqual(heading.style,{});assert.equal(s.pending.at(-1),false);s.cleanup();
});

test('the visual bridge is opacity-only, non-interactive and below the independent click wave',()=>{
 const s=fixture();s.click();s.commit('/resources');
 for(const operation of s.timelines.flatMap(timeline=>timeline.operations).filter(operation=>operation.targets.includes(s.layer))){
  for(const values of[operation.from,operation.to].filter(Boolean))assert.ok(Object.keys(values).every(key=>['opacity','duration'].includes(key)),'the bridge cannot animate transforms, filters or layout');
 }
 const css=fs.readFileSync(new URL('../src/app/navigation-transition.css',import.meta.url),'utf8'),wave=fs.readFileSync(new URL('../src/app/quantum-pointer.css',import.meta.url),'utf8');
 const veilRule=css.match(/\.iavse-route-veil\{([^}]+)\}/)[1];assert.match(veilRule,/pointer-events:none/);assert.match(veilRule,/position:fixed/);assert.match(veilRule,/contain:strict/);
 assert.ok(Number(veilRule.match(/z-index:(\d+)/)[1])<Number(wave.match(/z-index:(\d+)/)[1]));assert.doesNotMatch(css,/backdrop-filter|::view-transition|view-transition-name/);s.cleanup();
});
