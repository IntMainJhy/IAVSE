import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/NavigationIntent.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function mount({header=false}={}){
 const listeners=new Map(),windowListeners=new Map(),timers=new Map(),idleCallbacks=new Map(),calls=[],previews=[],connection={},exports={},location=new URL('https://site.example/workspace/blog');let effect,time=1000,fail=false,id=0;
 class Element{
  constructor(href,options={}){this.href=new URL(href,location.href).href;this.target='';this.main=true;this.kind='legacyDesktop';this.download=false;Object.assign(this,options);}
  closest(){return this;}
  matches(selector){const owned={legacyDesktop:'.organic-header .organic-desktop-nav>a',legacyMobile:'.organic-header .organic-mobile-menu>nav>a',desktop:'[data-iavse-header] .iavse-header__nav a[href]',brand:'[data-iavse-header] a.iavse-header__brand',dock:'.iavse-mobile-dock a.iavse-mobile-dock__tab',catalog:'.resource-hub-tabs .glass-switch__item[href]'};return this.main&&selector.split(',').includes(owned[this.kind]);}
  hasAttribute(name){return name==='download'&&this.download;}
 }
 const document={hidden:false,readyState:'complete',querySelector:()=>header?{}:null,addEventListener:(name,handler)=>listeners.set(name,handler),removeEventListener:name=>listeners.delete(name)};
 const window={requestIdleCallback:fn=>{idleCallbacks.set(++id,fn);return id;},cancelIdleCallback:key=>idleCallbacks.delete(key),addEventListener:(name,handler)=>windowListeners.set(name,handler),removeEventListener:name=>windowListeners.delete(name)};
 const advance=ms=>{time+=ms;for(const [key,timer] of [...timers])if(timer.at<=time){timers.delete(key);timer.fn();}};
 vm.runInNewContext(source,{exports,document,window,location,navigator:{connection},Element,URL,Date:{now:()=>time},setTimeout:(fn,delay)=>{timers.set(++id,{at:time+delay,fn});return id;},clearTimeout:key=>timers.delete(key),require:name=>{
  if(name==='react')return{useEffect:callback=>{effect=callback;}};
  if(name==='next/navigation')return{useRouter:()=>({prefetch:href=>{if(fail)throw Error('Prefetch unavailable');calls.push(href);}})};
  if(name.includes('LocaleProvider'))return{useLocale:()=>({locale:'en'})};
  if(name==='./RouteClients')return{preloadCommunity:()=>{previews.push('community');return Promise.resolve();}};
  throw new Error('Unexpected dependency: '+name);
 }});
 assert.equal(exports.NavigationIntent(),null);const cleanup=effect();
 function intent(name,href,options={},extra={}){const event={type:name,target:new Element(href,options),defaultPrevented:false,...extra};listeners.get(name)(event);return event;}
 return{listeners,windowListeners,timers,idleCallbacks,calls,previews,connection,location,document,cleanup,intent,advance,idle:()=>{const work=[...idleCallbacks.values()];idleCallbacks.clear();work.forEach(fn=>fn());},failing:value=>{fail=value;}};
}

test('public main navigation warms on pointer, keyboard and touch intent without handling clicks',()=>{
 const f=mount();
 const pointer=f.intent('pointerover','/community');assert.deepEqual(f.calls,[]);f.advance(120);f.intent('focusin','/blogs');f.intent('touchstart','/resources');f.intent('focusin','/');
 assert.deepEqual(f.calls,['/community','/blogs','/resources','/']);assert.equal(f.listeners.has('click'),false);assert.equal(pointer.defaultPrevented,false);f.cleanup();assert.equal(f.listeners.size,0);
 assert.deepEqual(f.previews,['community'],'the critical community chunk is prepared without requesting gallery documents');
});

test('repeated intent is deduplicated for thirty seconds and remains limited to five destinations',()=>{
 const f=mount();for(let i=0;i<40;i++)for(const href of ['/','/community','/blogs','/resources','/about'])f.intent(i%2?'focusin':'pointerover',href);
 assert.equal(f.calls.length,5);f.advance(29999);f.intent('touchstart','/resources');assert.equal(f.calls.length,5);f.advance(1);f.intent('pointerover','/resources');f.advance(120);assert.equal(f.calls.length,6);f.cleanup();
});

test('footer, account, preview, modified, download and hash links never trigger intent prefetch',()=>{
 const f=mount();
 for(const href of ['/workspace/account','/workspace/blog','/admin','/login','/blog/lin','/blogs/showcase/lin','/api/auth/me','/download/file','/resources?compose=1','/resources#tools','https://elsewhere.example/community'])f.intent('pointerover',href);
 for(const options of [{main:false},{target:'_blank'},{target:'preview-frame'},{download:true}])f.intent('pointerover','/blogs',options);
 for(const extra of [{defaultPrevented:true},{metaKey:true},{ctrlKey:true},{shiftKey:true},{altKey:true}])f.intent('focusin','/community',{},extra);
 f.location.pathname='/resources';f.location.search='';f.intent('touchstart','/resources');f.advance(120);assert.deepEqual(f.calls,[]);f.cleanup();
});

test('data-saving and slow-network preferences suppress optional loading and can change while mounted',()=>{
 const f=mount();f.connection.saveData=true;f.intent('pointerover','/community');f.connection.saveData=false;
 for(const effectiveType of ['slow-2g','2g','3g']){f.connection.effectiveType=effectiveType;f.intent('focusin','/blogs');}
 assert.deepEqual(f.calls,[]);assert.deepEqual(f.previews,[],'optional document warming also respects the data preference');f.connection.effectiveType='4g';f.intent('touchstart','/resources');assert.deepEqual(f.calls,['/resources']);f.cleanup();
});

test('an unavailable prefetch never cancels navigation or prevents a later retry',()=>{
 const f=mount();f.failing(true);assert.doesNotThrow(()=>{f.intent('pointerover','/blogs');f.advance(120);});assert.deepEqual(f.calls,[]);f.failing(false);f.intent('focusin','/blogs');assert.deepEqual(f.calls,['/blogs']);f.cleanup();
});

test('sweeping past destinations does not launch full route requests and an intentional dwell still warms once',()=>{
 const f=mount();for(const href of ['/community','/blogs','/resources']){f.intent('pointerover',href);f.advance(40);f.listeners.get('pointerout')({relatedTarget:null});}f.advance(200);assert.deepEqual(f.calls,[]);
 const hover=f.intent('pointerover','/blogs');f.advance(119);assert.deepEqual(f.calls,[]);f.listeners.get('pointerout')({relatedTarget:hover.target});f.advance(1);assert.deepEqual(f.calls,['/blogs']);f.cleanup();
});

test('click initiation, navigation and cleanup discard queued hover work without blocking native input',()=>{
 for(const release of ['pointerdown','navigation','cleanup']){
  const f=mount();f.intent('pointerover','/community');f.advance(50);
  if(release==='pointerdown')f.listeners.get('pointerdown')();else if(release==='navigation')f.windowListeners.get('iavse-navigation-pending')({detail:{pending:true}});else f.cleanup();
  f.advance(200);assert.deepEqual(f.calls,[]);assert.equal(f.timers.size,0);if(release!=='cleanup')f.cleanup();assert.equal(f.windowListeners.size,0);
 }
});


test('the current desktop header, logo and mobile dock warm their actual destinations',()=>{
 for(const kind of ['desktop','brand','dock','legacyDesktop','legacyMobile']){
  const f=mount();f.intent('pointerover','/resources',{kind});f.advance(120);f.intent('focusin','/about',{kind});
  assert.deepEqual(f.calls,['/resources','/about'],kind+' must match the navigation that is rendered');f.cleanup();
 }
 const header=fs.readFileSync(new URL('../src/components/IavseHeader.tsx',import.meta.url),'utf8'),dock=fs.readFileSync(new URL('../src/components/IavseMobileDock.tsx',import.meta.url),'utf8');
 assert.match(header,/prefetch=\{false\}/,'main links load on intent instead of prefetching every visible destination');
 assert.match(dock,/key=\{href\} href=\{href\} prefetch=\{false\}/);
});


test('an idle page prepares public destinations in spaced jobs and releases every queued callback',()=>{
 const f=mount({header:true});assert.deepEqual(f.calls,[]);f.advance(899);assert.equal(f.idleCallbacks.size,0);f.advance(1);assert.equal(f.idleCallbacks.size,1);f.idle();assert.deepEqual(f.calls,['/resources']);
 f.advance(1199);assert.equal(f.idleCallbacks.size,0);f.advance(1);f.idle();assert.deepEqual(f.calls,['/resources','/community']);assert.deepEqual(f.previews,['community']);
 f.advance(1200);assert.equal(f.idleCallbacks.size,1);f.cleanup();assert.equal(f.idleCallbacks.size,0);assert.equal(f.timers.size,0);
});

test('backgrounding, data saving and active navigation suspend optional idle work',()=>{
 const f=mount({header:true});f.document.hidden=true;f.listeners.get('visibilitychange')();f.advance(5000);f.idle();assert.deepEqual(f.calls,[]);
 f.document.hidden=false;f.listeners.get('visibilitychange')();f.windowListeners.get('iavse-navigation-pending')({detail:{pending:true}});f.advance(5000);f.idle();assert.deepEqual(f.calls,[]);
 f.windowListeners.get('iavse-navigation-pending')({detail:{pending:false}});f.connection.saveData=true;f.advance(1200);f.idle();assert.deepEqual(f.calls,[]);f.cleanup();
});

test('only real resource tabs may prepare bounded category URLs; account and arbitrary queries remain excluded',()=>{
 const f=mount();for(const href of ['/resources?type=skills','/resources?type=docs&q=React','/resources/legal-consultation'])f.intent('focusin',href,{kind:'catalog'});
 assert.deepEqual(f.calls,['/resources?type=skills','/resources?type=docs&q=React','/resources/legal-consultation']);
 for(const href of ['/resources?compose=1','/resources?type=unknown','/workspace/account','/resources?type=skills&edit=secret'])f.intent('focusin',href,{kind:'catalog'});
 assert.equal(f.calls.length,3);f.cleanup();
});
