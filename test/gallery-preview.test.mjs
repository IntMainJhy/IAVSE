import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as geometry from '../src/lib/blog-gallery-space.mjs';
const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/gallery-preview.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const schedulerSource=ts.transpileModule(fs.readFileSync(new URL('../src/lib/gallery-scheduler.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const url=i=>'/blogs/showcase/person-'+i+'?embed=gallery';
function fixture(){
 const exports={},requests=[],frames=new Map(),timers=new Map(),parsed=[];let time=1000,active=0,maxActive=0,scriptsRemoved=0,serial=0,marker=false;
 const events=()=>{const listeners=new Map();return{listeners,addEventListener(name,callback){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(callback);},removeEventListener(name,callback){listeners.get(name)?.delete(callback);},dispatch(name,event={}){for(const callback of [...listeners.get(name)||[]])callback(event);},get listenerCount(){return[...listeners.values()].reduce((n,set)=>n+set.size,0);}};};
 const window=events(),document={...events(),hidden:false,documentElement:{hasAttribute:()=>marker}};
 const timing={requestAnimationFrame:callback=>{frames.set(++serial,callback);return serial;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:callback=>{timers.set(++serial,callback);return serial;},clearTimeout:id=>timers.delete(id)};
 const scheduler={};vm.runInNewContext(schedulerSource,{exports:scheduler,...timing});
 class DOMParser{parseFromString(html){parsed.push(html);if(html==='throw')throw Error('Parse failed');return{querySelector:selector=>selector==='.blog-gallery-embed'?(html==='missing'?null:{}):null,querySelectorAll:selector=>selector.startsWith('script')?[{remove(){scriptsRemoved++;}}]:[{getAttribute:()=> '/_next/static/shared.css'}],documentElement:{outerHTML:'<html><body><div class="blog-gallery-embed">'+html+'</div></body></html>'}};}}
 const fetch=(href,options)=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});const doc=href!=='/_next/static/shared.css'&&!href.endsWith('shared.css')&&href!=='/api/blog-gallery';if(doc){active++;maxActive=Math.max(active,maxActive);}requests.push({href,options,respond(body='theme',status=200,type='text/html'){if(doc)active--;resolve({ok:status===200,headers:{get:()=>type},text:async()=>body,json:async()=>body});},reject(){if(doc)active--;reject(Error('network'));}});return promise;};
 vm.runInNewContext(source,{exports,fetch,DOMParser,AbortSignal,URL,window,document,location:new URL('https://site.example/'),Date:{now:()=>time},require:name=>{if(name.includes('blog-gallery-space'))return geometry;if(name.includes('gallery-scheduler'))return scheduler;throw Error(name);}});
 const flush=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
 const paint=()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());};
 const task=()=>{const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());};
 const flushWork=async()=>{await flush();for(let i=0;frames.size+timers.size&&i<30;i++){paint();task();await flush();}assert.equal(frames.size+timers.size,0,'processing should drain with one document per paint');};
 return{...exports,requests,flush,flushWork,paint,task,frames,timers,parsed,document,window,setMarker:value=>{marker=value;},navigation:pending=>window.dispatch('iavse-navigation-pending',{detail:{pending}}),hidden:value=>{document.hidden=value;document.dispatch('visibilitychange');},advance:ms=>{time+=ms;},get maxActive(){return maxActive;},get scriptsRemoved(){return scriptsRemoved;},get listenerCount(){return window.listenerCount+[...document.listeners.values()].reduce((n,set)=>n+set.size,0);}};
}

test('actual preview requests deduplicate, remain at two workers, and foreground requests move ahead',async()=>{
 const s=fixture(),a=s.loadGalleryPreview(url(0),'en'),b=s.loadGalleryPreview(url(1),'en'),c=s.loadGalleryPreview(url(2),'en'),d=s.loadGalleryPreview(url(3),'en');
 assert.equal(s.requests.length,2);assert.equal(s.loadGalleryPreview(url(0),'en'),a);s.loadGalleryPreview(url(3),'en',true);s.requests[0].respond();await s.flush();assert.equal(s.requests.findLast(r=>r.href.includes('person')).href,url(3));
 s.requests[1].respond();await s.flush();s.requests.filter(r=>r.href.includes('person')).slice(2).forEach(r=>r.respond());await s.flushWork();await Promise.all([a,b,c,d]);assert.equal(s.maxActive,2);assert.equal(s.scriptsRemoved,4);assert.equal(s.requests.filter(r=>r.href.endsWith('shared.css')).length,1,'shared style warmed once');assert.match(s.cachedGalleryPreview(url(0),'en'),/blog-gallery-embed/);assert.equal(s.cachedGalleryPreview(url(0),'zh'),undefined);assert.equal(s.listenerCount,0);
 const count=s.requests.length;await s.loadGalleryPreview(url(0),'en');assert.equal(s.requests.length,count);s.advance(30000);assert.equal(s.cachedGalleryPreview(url(0),'en'),undefined);const fresh=s.loadGalleryPreview(url(0),'en');assert.equal(s.requests.length,count+1);s.requests.at(-1).respond('updated');await s.flushWork();assert.match(await fresh,/updated/);
});

test('failed, oversized and non-preview responses leave no stale HTML and do not stall other authors',async()=>{
 for(const [body,status,type] of [['',503,'text/html'],['missing',200,'text/html'],['throw',200,'text/html'],['x'.repeat(350001),200,'text/html'],['{}',200,'application/json']]){
  const s=fixture(),failed=s.loadGalleryPreview(url(0),'en');s.requests[0].respond(body,status,type);await s.flushWork();assert.equal(await failed,null);assert.equal(s.cachedGalleryPreview(url(0),'en'),undefined);assert.equal(s.listenerCount,0);const retry=s.loadGalleryPreview(url(0),'en');assert.equal(s.requests.length,2);s.requests[1].respond();await s.flushWork();assert.ok(await retry);
 }
 const s=fixture();for(const path of ['/blog/static?embed=gallery','https://evil.example/blog/a/preview','//evil.example/blog/a/preview','/api/auth/me','/blog/a/preview?draft=1'])assert.equal(await s.loadGalleryPreview(path,'en'),null);assert.equal(s.requests.length,0);
});

test('slow queued work remains deduplicated beyond the completed-document TTL',async()=>{
 const s=fixture(),a=s.loadGalleryPreview(url(0),'en'),b=s.loadGalleryPreview(url(1),'en'),queued=s.loadGalleryPreview(url(2),'en');s.advance(30001);assert.equal(s.loadGalleryPreview(url(2),'en',true),queued);
 s.requests[0].respond();s.requests[1].respond();await s.flush();s.requests.find(r=>r.href===url(2)).respond();await s.flushWork();await Promise.all([a,b,queued]);assert.equal(s.maxActive,2);
});

test('manifest warming uses the same spatial priority and is deduplicated without creating frames',async()=>{
 const s=fixture(),promise=s.warmGalleryPreviews('en');assert.equal(s.warmGalleryPreviews('en'),promise);assert.equal(s.requests[0].href,'/api/blog-gallery');s.requests[0].respond({previews:[url(0),null,url(2),url(3)]});await promise;assert.deepEqual(s.requests.slice(1).map(r=>r.href),[url(0),url(3)]);s.requests[1].respond();s.requests[2].respond();await s.flush();assert.equal(s.requests.findLast(r=>r.href.includes('person')).href,url(2));s.requests.findLast(r=>r.href.includes('person')).respond();await s.flushWork();assert.equal(s.maxActive,2);
});

test('a new language gets its own document and the in-memory cache evicts beyond twenty-four entries',async()=>{
 const s=fixture();for(let i=0;i<25;i++){const promise=s.loadGalleryPreview(url(i),'en');s.requests.findLast(r=>r.href===url(i)).respond();await s.flushWork();await promise;}
 assert.equal(s.cachedGalleryPreview(url(0),'en'),undefined);assert.ok(s.cachedGalleryPreview(url(24),'en'));const localized=s.loadGalleryPreview(url(24),'zh');s.requests.at(-1).respond('中文');await s.flushWork();assert.match(await localized,/中文/);assert.doesNotMatch(s.cachedGalleryPreview(url(24),'en'),/中文/);
});

test('downloads continue during navigation, while parsing waits for the marker and yields once per paint',async()=>{
 const s=fixture();s.setMarker(true);
 const promises=[0,1,2].map(i=>s.loadGalleryPreview(url(i),'en'));
 s.requests[0].respond('first');s.requests[1].respond('second');await s.flush();
 assert.equal(s.requests.length,3,'parsing does not hold network workers');s.requests[2].respond('third');await s.flush();
 assert.equal(s.parsed.length,0);assert.equal(s.frames.size+s.timers.size,0);assert.equal(s.listenerCount,2);
 s.navigation(false);assert.equal(s.frames.size,0,'a stale release cannot override the transition marker');
 s.setMarker(false);s.navigation(false);assert.equal(s.frames.size,1);
 s.paint();assert.equal(s.parsed.length,0,'RAF only schedules a later task');s.task();await s.flush();assert.deepEqual(s.parsed,['first']);
 s.task();assert.equal(s.parsed.length,1,'microtasks and repeated tasks cannot drain the raw document queue');
 await s.flushWork();await Promise.all(promises);assert.deepEqual(s.parsed,['first','second','third']);assert.equal(s.listenerCount,0);
});

test('visibility and navigation changes cancel pending work, including tasks captured before cancellation',async()=>{
 for(const interrupt of ['hidden','navigation']){
  const s=fixture(),promise=s.loadGalleryPreview(url(0),'en');s.requests[0].respond();await s.flush();s.paint();
  const late=[...s.timers.values()];if(interrupt==='hidden')s.hidden(true);else s.navigation(true);
  assert.equal(s.frames.size+s.timers.size,0);late.forEach(fn=>fn());assert.equal(s.parsed.length,0);
  if(interrupt==='hidden')s.hidden(false);else s.navigation(false);
  await s.flushWork();assert.ok(await promise);assert.equal(s.parsed.length,1);assert.equal(s.listenerCount,0);
 }
});

test('live gates prevent work if visibility or the route marker changes after RAF without an event',async()=>{
 for(const interrupt of ['hidden','marker']){
  const s=fixture(),promise=s.loadGalleryPreview(url(0),'en');s.requests[0].respond();await s.flush();s.paint();
  if(interrupt==='hidden')s.document.hidden=true;else s.setMarker(true);
  s.task();assert.equal(s.parsed.length,0);assert.equal(s.frames.size+s.timers.size,0);
  if(interrupt==='hidden')s.hidden(false);else{s.setMarker(false);s.navigation(false);}
  await s.flushWork();assert.ok(await promise);assert.equal(s.listenerCount,0);
 }
});

test('deferred documents retain foreground priority and deduplication without unbounded hidden work',async()=>{
 const s=fixture();s.hidden(true);
 const promises=Array.from({length:24},(_,i)=>s.loadGalleryPreview(url(i),'en'));
 for(let i=0;i<24;i++){s.requests.find(r=>r.href===url(i)).respond('person-'+i);await s.flush();}
 assert.equal(s.parsed.length,0);assert.equal(s.frames.size+s.timers.size,0);assert.equal(s.maxActive,2);
 assert.equal(await s.loadGalleryPreview(url(24),'en'),null,'pending raw documents share the bounded cache capacity');assert.equal(s.requests.length,24);
 s.advance(30001);assert.equal(s.loadGalleryPreview(url(23),'en',true),promises[23],'pending work is not duplicated when its download predates TTL');
 s.hidden(false);s.paint();s.task();await s.flush();assert.deepEqual(s.parsed,['person-23']);
 await s.flushWork();await Promise.all(promises);assert.equal(new Set(s.parsed).size,24);assert.equal(s.listenerCount,0);
 s.navigation(true);s.hidden(true);assert.equal(s.frames.size+s.timers.size,0,'idle module keeps no scheduling activity');
});
