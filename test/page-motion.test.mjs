import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function fixture({reduced=false,owned=false}={}){
 const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/PageMotion.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 const effects=[],layouts=[],calls=[],contexts=[],observers=[],media=[],events=new Map(),changes=new Set(),timers=new Map(),menus=[{open:true}],dispatches=[],exports={};
 class Element{constructor(rect={left:100,top:100,width:160,height:44}){this.rect=rect;this.dataset={};this.scrollTop=0;this.nodes={};}getBoundingClientRect(){return this.rect;}querySelector(selector){return this.hero&&selector.split(',').includes('.v2-hero-copy')?this.hero:this.nodes[selector]||null;}querySelectorAll(){return this.links||[];}closest(){return this;}contains(){return true;}focus(){this.focused=true;}setAttribute(name,value){this[name]=value;}removeAttribute(name){delete this[name];}hasAttribute(){return false;}}
 let root=new Element(),path='/community',query='',refs=[],refIndex=0;
 const preference={matches:reduced,addEventListener:(_,fn)=>changes.add(fn),removeEventListener:(_,fn)=>changes.delete(fn)};
 const document={documentElement:{hasAttribute:()=>owned},querySelectorAll:()=>menus,addEventListener:(key,fn)=>events.set(key,fn),removeEventListener:(key)=>events.delete(key)};
 const window={matchMedia:q=>q.includes('reduced-motion')?preference:{matches:true},addEventListener:(key,fn)=>events.set(key,fn),removeEventListener:key=>events.delete(key),dispatchEvent:event=>{dispatches.push(event);events.get(event.type)?.(event);return true;}};
 const gsap={to:(node,to)=>calls.push({node,to}),fromTo:(node,from,to)=>calls.push({node,from,to}),set:(node,to)=>calls.push({node,to}),killTweensOf:node=>calls.push({node,kill:true}),context:fn=>{const cleanup=fn();const ctx={reverted:false,add:callback=>callback(),revert(){this.reverted=true;cleanup?.();}};contexts.push(ctx);return ctx;},matchMedia:()=>{const m={reverted:false,add:(_,fn)=>{if(!preference.matches)fn();},revert(){this.reverted=true;}};media.push(m);return m;}};
 class ResizeObserver{constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
 vm.runInNewContext(source,{exports,document,window,CustomEvent,ResizeObserver,setTimeout:fn=>{const id=timers.size+1;timers.set(id,fn);return id},clearTimeout:id=>timers.delete(id),location:new URL('http://localhost:3010/community'),URL,Element,require:name=>{
  if(name==='react')return{useEffect:fn=>effects.push(fn),useLayoutEffect:fn=>layouts.push(fn),useRef:initial=>{const i=refIndex++;if(i===0)return refs[0]={current:root};return refs[i]||=( {current:initial});}};
  if(name==='gsap')return{gsap};
  if(name==='@/lib/navigation-motion')return{mainNavigationDestination:link=>link.mainNavigation?new URL(link.href).pathname:null};
  if(name==='next/navigation')return{usePathname:()=>path,useSearchParams:()=>new URLSearchParams(query)};
  if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props})};
  if(name.endsWith('.css'))return{};
  throw new Error('Unexpected dependency '+name);
 }});
 function page(to,left=100,key='feed',{publicPage=false,remount=false,reuseEvents=false}={}){
  const url=new URL(to,'http://localhost:3010');path=url.pathname;query=url.search.slice(1);root=new Element();root.dataset.motionRoute=to;refIndex=0;if(remount)refs=[];
  const nav=new Element({left,top:100,width:160,height:476}),active=new Element({left,top:key==='feed'?248:296,width:120,height:44}),indicator=new Element(active.rect),content=new Element({left:left+192,top:100,width:768,height:700});
  active.dataset.navKey=key;nav.nodes['[data-nav-key][aria-current="page"]']=active;nav.nodes['.feed-active-indicator']=indicator;
  root.nodes=publicPage?{'[data-resource-panel],.catalog-page,.skills-page,.product-download-page,.document-reader,.shared-reading-layout,.legal-consultation,.community-auth-form,.community-report,.community-policy-document,.community-receipt':content}:{'.community-navigation-shell':new Element(),'.feed-nav-links':nav,'.community-route-content,.space-workspace-main':content};root.links=[active];
  const children={title:'Visible server content'},output=exports.PageMotion({children});
  assert.equal(output.props.children,children);assert.equal(output.props.style,undefined);
  const close=effects.at(-2)();assert.equal(close,undefined);assert.ok(menus.every(menu=>!menu.open));
  const eventsCleanup=reuseEvents?undefined:effects.at(-1)(),motionCleanup=layouts.at(-1)();
  return{root,nav,content,active,indicator,cleanup:()=>{eventsCleanup?.();motionCleanup?.();}};
 }
 function click(to,key='members',keyboard=false,overrides={},linkOptions={}){const link=new Element();link.href=new URL(to,'http://localhost:3010').href;link.target='';link.dataset.navKey=key;Object.assign(link,linkOptions);const target=new Element();target.closest=()=>link;const event={target,button:0,detail:keyboard?0:1,...overrides};events.get('click')(event);return event;}
 return{page,click,calls,contexts,observers,events,preference,changes,media,timers,dispatches};
}

test('first render preserves server attributes until streamed navigation children hydrate',()=>{
 const f=fixture(),p=f.page('/community');assert.equal(f.calls.length,0);assert.equal(p.nav.dataset.motionReady,undefined);assert.equal(f.observers.length,0);p.cleanup();assert.equal(f.events.size,0);
});

test('the persistent GSAP handoff owns arrival without stacking a local animation',()=>{
 const f=fixture({owned:true}),a=f.page('/',100,'feed',{publicPage:true});f.click('/resources');a.cleanup();const count=f.calls.length;
 const b=f.page('/resources',100,'feed',{publicPage:true,remount:true});assert.equal(f.calls.length,count);assert.equal(f.dispatches.filter(event=>event.type==='iavse-navigation-pending').at(-1).detail.pending,false);b.cleanup();
});
test('equal-width routes move the active indicator without moving either rail or hiding text',()=>{
 const f=fixture(),a=f.page('/community');f.click('/community/members','members',true);a.cleanup();const start=f.calls.length,b=f.page('/community/members',100,'members'),calls=f.calls.slice(start);
 assert.ok(!calls.some(call=>call.node===b.nav));assert.ok(calls.some(call=>call.node===b.content&&call.from.opacity===.9&&call.to.opacity===1));assert.ok(calls.some(call=>call.node===b.indicator&&call.from&&call.from.y!==call.to.y));assert.equal(b.active.focused,true);b.cleanup();
});
test('switching into the wider workspace bridges the rail positions and cleans up when interrupted',()=>{
 const f=fixture(),a=f.page('/community');f.click('/workspace/library','library');a.cleanup();const start=f.calls.length,b=f.page('/workspace/library',20,'library');assert.ok(f.calls.slice(start).some(call=>call.node===b.nav&&call.from.x===80&&call.to.x===0));assert.ok(f.calls.slice(start).some(call=>call.node===b.content&&call.from.x===80&&call.to.x===0));f.preference.matches=true;for(const change of f.changes)change();assert.ok(f.contexts.at(-1).reverted);assert.equal(b.nav.dataset.motionReady,undefined);b.cleanup();
});
test('reduced motion preserves navigation and content without creating any GSAP tweens',()=>{
 const f=fixture({reduced:true}),a=f.page('/community');f.click('/workspace/notifications','notifications');a.cleanup();const b=f.page('/workspace/notifications',100,'notifications');assert.equal(f.calls.length,0);assert.equal(b.nav.dataset.motionReady,undefined);b.cleanup();
});

test('resizing or translating a navigation label remeasures the indicator and disconnects on cleanup',()=>{
 const f=fixture(),first=f.page('/community');f.click('/community/members');first.cleanup();const p=f.page('/community/members',100,'members'),observer=f.observers[0];p.active.rect={...p.active.rect,width:148};observer.callback();assert.ok(f.calls.some(call=>call.node===p.indicator&&call.to?.width===148));p.cleanup();assert.equal(observer.disconnected,true);const count=f.calls.length;observer.callback();assert.equal(f.calls.length,count);
});

test('public header links bridge remounted frames without delaying or cancelling native navigation',()=>{
 const f=fixture(),a=f.page('/resources',100,'feed',{publicPage:true});assert.equal(f.calls.length,0);
 const event=f.click('/downloads');assert.equal(event.defaultPrevented,undefined);assert.equal(event.preventDefault,undefined);a.cleanup();
 const b=f.page('/downloads',100,'feed',{publicPage:true,remount:true});
 assert.ok(f.calls.some(call=>call.node===b.content&&call.from?.y===8&&call.to.opacity===1&&call.to.clearProps==='transform,opacity'));
 b.cleanup();assert.ok(f.media.every(media=>media.reverted));
});

test('query routes keep public content in place and modified or external clicks cannot create a handoff',()=>{
 const f=fixture(),a=f.page('/resources',100,'feed',{publicPage:true});f.click('/resources?type=skills');a.cleanup();
 const b=f.page('/resources?type=skills',100,'feed',{publicPage:true,remount:true});assert.ok(f.calls.some(call=>call.node===b.content&&call.from?.y===0&&call.to.duration===.22));b.cleanup();
 for(const [to,overrides] of [['/downloads',{ctrlKey:true}],['https://example.com/downloads',{}],['/downloads',{defaultPrevented:true}],['/downloads',{button:1}]]){
  const p=f.page('/resources',100,'feed',{publicPage:true,remount:true});f.click(to,'members',false,overrides);p.cleanup();const start=f.calls.length,q=f.page('/downloads',100,'feed',{publicPage:true,remount:true});assert.equal(f.calls.length,start);q.cleanup();
 }
});

test('reduced motion public transitions retain the native content and query navigation',()=>{
 const f=fixture({reduced:true}),a=f.page('/resources',100,'feed',{publicPage:true});f.click('/resources?type=skills');a.cleanup();const b=f.page('/resources?type=skills',100,'feed',{publicPage:true,remount:true});assert.equal(f.calls.length,0);b.cleanup();
});


test('resource navigation gives immediate departure feedback and a directional arrival across frame remounts',()=>{
 const f=fixture(),a=f.page('/resources',100,'feed',{publicPage:true});
 const event=f.click('/resources?type=skills');assert.equal(event.defaultPrevented,undefined,'navigation never waits for animation');
 assert.ok(f.calls.some(call=>call.node===a.content&&call.to.opacity>=.85&&call.to.x===-6));
 assert.equal(a.root['aria-busy'],'true');a.cleanup();
 const b=f.page('/resources?type=skills',100,'feed',{publicPage:true,remount:true});
 assert.ok(f.calls.some(call=>call.node===b.content&&call.from?.opacity>=.85&&call.from.x===8&&call.to.x===0));
 b.cleanup();assert.equal(f.timers.size,0);
});

test('rapid resource clicks keep the latest destination and cancelled requests recover readable content',()=>{
 const f=fixture(),a=f.page('/resources?type=skills',100,'feed',{publicPage:true});
 f.click('/resources?type=resources');f.click('/resources?type=docs');assert.equal(f.timers.size,1,'one bounded recovery timer');
 assert.ok(f.calls.some(call=>call.node===a.content&&call.to.x===6),'earlier tabs depart in the opposite direction');
 a.cleanup();const b=f.page('/resources?type=docs',100,'feed',{publicPage:true,remount:true});
 assert.ok(f.calls.some(call=>call.node===b.content&&call.from?.x===-8));
 f.click('/resources?type=skills');for(const recover of [...f.timers.values()])recover();
 assert.equal(b.root['aria-busy'],undefined);b.cleanup();
});

test('returning to the currently shown tab cancels outgoing feedback and pending handoffs',()=>{
 const f=fixture(),a=f.page('/resources',100,'feed',{publicPage:true});
 f.click('/resources?type=skills');f.click('/resources');assert.equal(a.root['aria-busy'],undefined);assert.equal(f.timers.size,0);
 a.cleanup();const start=f.calls.length,b=f.page('/resources?type=skills',100,'feed',{publicPage:true,remount:true});
 assert.equal(f.calls.length,start,'a cancelled destination cannot create a later arrival');b.cleanup();
});


test('a declined unsaved navigation immediately restores content and clears the pending arrival',()=>{
 const f=fixture(),a=f.page('/resources',100,'feed',{publicPage:true});f.click('/resources?type=skills');
 assert.equal(a.root['aria-busy'],'true');assert.equal(f.timers.size,1);
 f.events.get('iavse-navigation-cancel')();assert.equal(a.root['aria-busy'],undefined);assert.equal(f.timers.size,0);
 a.cleanup();const start=f.calls.length,b=f.page('/resources?type=skills',100,'feed',{publicPage:true,remount:true});
 assert.equal(f.calls.length,start,'a declined navigation must not replay a stale arrival later');b.cleanup();
});

test('the current blog heading receives feedback while the 3D gallery root stays in its own coordinates',()=>{
 const f=fixture(),a=f.page('/blogs',100,'feed',{publicPage:true});
 const heading=a.content;a.root.nodes={'.community-route-content,.creator-directory-intro':heading};
 f.click('/community');assert.ok(f.calls.some(call=>call.node===heading&&call.to.opacity>=.85));assert.ok(f.calls.every(call=>call.node!==a.root),'the spatial stage does not inherit a page transform');
 a.cleanup();const b=f.page('/blogs',100,'feed',{publicPage:true,remount:true});b.cleanup();
});

test('navigation suspension clears on draft cancellation, timeout, arrival and unmount',()=>{
 for(const release of ['cancel','timeout','arrival','unmount']){
  const f=fixture(),a=f.page('/',100,'feed',{publicPage:true});f.click('/resources');f.click('/blogs');
  const states=()=>f.dispatches.filter(event=>event.type==='iavse-navigation-pending').map(event=>event.detail.pending);
  assert.deepEqual(states(),[true],'rapid clicks retain one pending interval');assert.equal(f.timers.size,1);
  let b;if(release==='cancel')f.events.get('iavse-navigation-cancel')();else if(release==='timeout')for(const recover of [...f.timers.values()])recover();else if(release==='arrival')b=f.page('/blogs',100,'feed',{publicPage:true,reuseEvents:true});else a.cleanup();
  assert.deepEqual(states(),[true,false],release+' releases the temporary suspension');assert.equal(f.timers.size,0);b?.cleanup();a.cleanup();
 }
});

test('same-document hashes, downloads, other targets and modified links never suspend a renderer',()=>{
 const f=fixture(),a=f.page('/',100,'feed',{publicPage:true});
 for(const href of ['/#creators','/download/file','/api/auth/me','https://example.org/resources'])f.click(href);
 for(const options of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{defaultPrevented:true}])f.click('/resources','members',false,options);
 f.click('/resources','members',false,{}, {target:'_blank'});f.click('/resources','members',false,{}, {hasAttribute:key=>key==='download'});
 assert.equal(f.dispatches.filter(event=>event.type==='iavse-navigation-pending').length,0);assert.equal(f.timers.size,0);a.cleanup();
});

test('suspension recovery also covers reduced-motion or temporarily missing content receivers',()=>{
 for(const reduced of [false,true]){
  const f=fixture({reduced}),a=f.page('/',100,'feed',{publicPage:true});a.root.nodes={};f.click('/community');
  assert.equal(f.timers.size,1);assert.equal(f.dispatches.at(-1).detail.pending,true);
  f.preference.matches=true;for(const change of f.changes)change();assert.equal(f.dispatches.at(-1).detail.pending,true,'motion changes do not release an outstanding navigation');
  for(const recover of [...f.timers.values()])recover();assert.equal(f.dispatches.at(-1).detail.pending,false);a.cleanup();
 }
});


test('main-header navigation leaves departure and suspension to the persistent GSAP owner',()=>{
 const f=fixture(),a=f.page('/',100,'feed',{publicPage:true});
 f.click('/resources','members',false,{}, {mainNavigation:true});
 assert.equal(f.calls.length,0);assert.equal(f.timers.size,0);
 assert.equal(f.dispatches.filter(event=>event.type==='iavse-navigation-pending').length,0);
 const commit=f.dispatches.find(event=>event.type==='iavse-route-commit');
 assert.equal(commit.detail.route,'/');assert.equal(commit.detail.root,a.root);
 a.cleanup();assert.equal(f.dispatches.filter(event=>event.type==='iavse-navigation-pending').length,0);
});


test('local return to home skips both heading translation and whole-page fallback animation',()=>{
 const f=fixture(),source=f.page('/resources',100,'feed',{publicPage:true});f.click('/');source.cleanup();const before=f.calls.length,home=f.page('/',100,'feed',{publicPage:true});assert.equal(f.calls.length,before);assert.ok(f.dispatches.some(event=>event.type==='iavse-route-commit'&&event.detail.route==='/'));home.cleanup();
});


test('ordinary links leaving home do not translate or fade the hero copy',()=>{
 const f=fixture(),home=f.page('/',100,'feed',{publicPage:true});home.root.nodes={};home.root.hero=home.content;const before=f.calls.length;f.click('/downloads');assert.equal(f.calls.length,before);home.cleanup();
});
