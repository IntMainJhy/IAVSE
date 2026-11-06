import test from 'node:test';
import assert from 'node:assert/strict';
import {loadHomeScrollRefresh} from './home-refresh-fixture.mjs';

function fixture({marker=false,hidden=false,scrolling=false}={}){
 const listeners=new Set(),frames=new Map(),scrollEndListeners=new Set();let id=0,refreshes=0;
 class Target extends EventTarget{
  addEventListener(type,callback){super.addEventListener(type,callback);listeners.add(callback);}
  removeEventListener(type,callback){super.removeEventListener(type,callback);listeners.delete(callback);}
 }
 const window=new Target(),document=Object.assign(new Target(),{hidden,documentElement:{hasAttribute:()=>marker}});
 const module=loadHomeScrollRefresh({window,document,ScrollTrigger:{refresh(){refreshes++;},isScrolling:()=>scrolling,addEventListener(event,callback){assert.equal(event,'scrollEnd');scrollEndListeners.add(callback);},removeEventListener(event,callback){assert.equal(event,'scrollEnd');scrollEndListeners.delete(callback);}},requestAnimationFrame:callback=>{frames.set(++id,callback);return id;},cancelAnimationFrame:key=>frames.delete(key)});
 return{
  frames,listeners,document,scrollEndListeners,
  owner(){const root={isConnected:true};return{root,...module.homeScrollRefresh(root)};},
  navigate(pending){window.dispatchEvent(new CustomEvent('iavse-navigation-pending',{detail:{pending}}));},
  marker(value){marker=value;},
  visibility(value){document.hidden=value;document.dispatchEvent(new Event('visibilitychange'));},
  scrollStart(){scrolling=true;},
  scrollEnd(){scrolling=false;for(const callback of scrollEndListeners)callback();},
  flush(){const queued=[...frames.values()];frames.clear();queued.forEach(callback=>callback());},
  get refreshes(){return refreshes;}
 };
}

test('two home owners and repeated image/font requests share one global refresh',()=>{
 const f=fixture(),story=f.owner(),hero=f.owner();
 assert.equal(f.listeners.size,2,'one navigation and one visibility listener serve both owners');
 assert.equal(f.scrollEndListeners.size,1,'one scroll-end listener serves both owners');
 story.request();hero.request();story.request();hero.request();assert.equal(f.frames.size,1);
 f.flush();assert.equal(f.refreshes,1);assert.equal(f.frames.size,0);
 story.dispose();assert.equal(f.scrollEndListeners.size,1);hero.dispose();assert.equal(f.listeners.size,0);assert.equal(f.scrollEndListeners.size,0);
});

test('active scrolling keeps repeated image and font requests dirty without a frame loop',()=>{
 const f=fixture({scrolling:true}),story=f.owner(),hero=f.owner();
 for(let i=0;i<10;i++){story.request();hero.request();f.flush();}
 assert.equal(f.frames.size,0);assert.equal(f.refreshes,0);
 f.scrollEnd();f.scrollEnd();assert.equal(f.frames.size,1);
 f.flush();assert.equal(f.refreshes,1);assert.equal(f.frames.size,0);
 f.scrollEnd();assert.equal(f.frames.size,0,'clean owners do not schedule extra refreshes');story.dispose();hero.dispose();
});

test('scrolling that starts after a refresh was queued defers the same dirty work',()=>{
 const f=fixture(),owner=f.owner();owner.request();assert.equal(f.frames.size,1);
 f.scrollStart();f.flush();assert.equal(f.refreshes,0);assert.equal(f.frames.size,0);
 f.scrollEnd();assert.equal(f.frames.size,1);
 f.scrollStart();f.flush();assert.equal(f.refreshes,0);assert.equal(f.frames.size,0,'a second scroll resumes without polling');
 f.scrollEnd();f.flush();assert.equal(f.refreshes,1);owner.dispose();
});

test('scroll end cannot bypass navigation, transition markers or hidden-page gates',()=>{
 for(const mode of ['navigation','marker','hidden']){
  const f=fixture({scrolling:true}),owner=f.owner();owner.request();
  if(mode==='navigation')f.navigate(true);else if(mode==='marker')f.marker(true);else f.visibility(true);
  f.scrollEnd();assert.equal(f.frames.size,0);assert.equal(f.refreshes,0);
  if(mode==='navigation')f.navigate(false);else if(mode==='marker'){f.marker(false);f.navigate(false);}else f.visibility(false);
  assert.equal(f.frames.size,1);f.flush();assert.equal(f.refreshes,1);owner.dispose();
 }
});

test('navigation and visibility releases keep refresh deferred until scrolling stops',()=>{
 const f=fixture({scrolling:true}),owner=f.owner();owner.request();
 f.navigate(true);f.visibility(true);f.navigate(false);f.visibility(false);
 assert.equal(f.frames.size,0);assert.equal(f.refreshes,0);
 f.scrollEnd();f.flush();assert.equal(f.refreshes,1);owner.dispose();
});

test('scroll-end work disappears with detached or disposed owners and all subscriptions are released',()=>{
 const f=fixture({scrolling:true}),detached=f.owner(),disposed=f.owner();detached.request();disposed.request();
 detached.root.isConnected=false;disposed.dispose();f.scrollEnd();assert.equal(f.frames.size,0);assert.equal(f.refreshes,0);
 detached.dispose();assert.equal(f.scrollEndListeners.size,0);assert.equal(f.listeners.size,0);
 f.scrollEnd();disposed.request();assert.equal(f.frames.size,0);
 const next=f.owner();assert.equal(f.scrollEndListeners.size,1);f.scrollStart();next.request();next.dispose();f.scrollEnd();
 assert.equal(f.scrollEndListeners.size,0);assert.equal(f.frames.size,0);assert.equal(f.refreshes,0);
});

test('navigation cancels queued refresh, retains dirty work, and ignores a stale release',()=>{
 const f=fixture(),owner=f.owner();owner.request();
 f.marker(true);f.navigate(true);assert.equal(f.frames.size,0);
 owner.request();f.navigate(false);assert.equal(f.frames.size,0,'another page cannot release the persistent transition marker');
 f.marker(false);f.navigate(false);assert.equal(f.frames.size,1);
 f.flush();assert.equal(f.refreshes,1);owner.dispose();
});

test('an owner mounted during navigation defers even before receiving a pending event',()=>{
 const f=fixture({marker:true}),owner=f.owner();owner.request();assert.equal(f.frames.size,0);
 f.marker(false);f.navigate(false);f.flush();assert.equal(f.refreshes,1);owner.dispose();
});

test('a queued frame rechecks route marker and page visibility before touching layout',()=>{
 for(const mode of ['navigation','hidden']){
  const f=fixture(),owner=f.owner();owner.request();
  if(mode==='navigation')f.marker(true);else f.document.hidden=true;
  f.flush();assert.equal(f.refreshes,0);assert.equal(f.frames.size,0);
  if(mode==='navigation'){f.marker(false);f.navigate(false);}else f.visibility(false);
  f.flush();assert.equal(f.refreshes,1);owner.dispose();
 }
});

test('hidden pages retain one dirty refresh until visible and navigation is finished',()=>{
 const f=fixture(),owner=f.owner();owner.request();f.visibility(true);assert.equal(f.frames.size,0);
 f.navigate(true);owner.request();f.visibility(false);assert.equal(f.frames.size,0);
 f.navigate(false);f.flush();assert.equal(f.refreshes,1);owner.dispose();
});

test('disposing one owner preserves another owner request and disposing all prevents late work',()=>{
 const f=fixture(),first=f.owner(),second=f.owner();first.request();second.request();first.dispose();
 assert.equal(f.frames.size,1);f.flush();assert.equal(f.refreshes,1);
 second.request();second.dispose();assert.equal(f.frames.size,0);assert.equal(f.listeners.size,0);
 first.request();second.request();f.navigate(false);f.visibility(false);assert.equal(f.frames.size,0);
});

test('detached owners cannot refresh after a cancelled route or leave a ticking loop',()=>{
 const f=fixture(),owner=f.owner();owner.request();f.navigate(true);owner.root.isConnected=false;
 f.navigate(false);assert.equal(f.frames.size,0);assert.equal(f.refreshes,0);
 owner.request();assert.equal(f.frames.size,0);owner.dispose();assert.equal(f.listeners.size,0);
 const next=f.owner();next.request();f.flush();assert.equal(f.refreshes,1,'a new route does not inherit the old pending flag');next.dispose();
});

test('a root detached after scheduling is dropped at execution time',()=>{
 const f=fixture(),owner=f.owner();owner.request();owner.root.isConnected=false;f.flush();
 assert.equal(f.refreshes,0);assert.equal(f.frames.size,0);owner.dispose();
});
