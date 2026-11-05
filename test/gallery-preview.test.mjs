import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as geometry from '../src/lib/blog-gallery-space.mjs';
const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/gallery-preview.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const url=i=>'/blogs/showcase/person-'+i+'?embed=gallery';
function fixture(){
 const exports={},requests=[];let time=1000,active=0,maxActive=0,scriptsRemoved=0;
 class DOMParser{parseFromString(html){return{querySelector:selector=>selector==='.blog-gallery-embed'?(html==='missing'?null:{}):null,querySelectorAll:selector=>selector.startsWith('script')?[{remove(){scriptsRemoved++;}}]:[{getAttribute:()=> '/_next/static/shared.css'}],documentElement:{outerHTML:'<html><body><div class="blog-gallery-embed">'+html+'</div></body></html>'}};}}
 const fetch=(href,options)=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});const doc=href!=='/_next/static/shared.css'&&!href.endsWith('shared.css')&&href!=='/api/blog-gallery';if(doc){active++;maxActive=Math.max(active,maxActive);}requests.push({href,options,respond(body='theme',status=200,type='text/html'){if(doc)active--;resolve({ok:status===200,headers:{get:()=>type},text:async()=>body,json:async()=>body});},reject(){if(doc)active--;reject(Error('network'));}});return promise;};
 vm.runInNewContext(source,{exports,fetch,DOMParser,AbortSignal,URL,location:new URL('https://site.example/'),Date:{now:()=>time},require:name=>{if(name.includes('blog-gallery-space'))return geometry;throw Error(name);}});
 const flush=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
 return{...exports,requests,flush,advance:ms=>{time+=ms;},get maxActive(){return maxActive;},get scriptsRemoved(){return scriptsRemoved;}};
}

test('actual preview requests deduplicate, remain at two workers, and foreground requests move ahead',async()=>{
 const s=fixture(),a=s.loadGalleryPreview(url(0),'en'),b=s.loadGalleryPreview(url(1),'en'),c=s.loadGalleryPreview(url(2),'en'),d=s.loadGalleryPreview(url(3),'en');
 assert.equal(s.requests.length,2);assert.equal(s.loadGalleryPreview(url(0),'en'),a);s.loadGalleryPreview(url(3),'en',true);s.requests[0].respond();await s.flush();assert.equal(s.requests.findLast(r=>r.href.includes('person')).href,url(3));
 s.requests[1].respond();await s.flush();s.requests.filter(r=>r.href.includes('person')).slice(2).forEach(r=>r.respond());await Promise.all([a,b,c,d]);assert.equal(s.maxActive,2);assert.equal(s.scriptsRemoved,4);assert.equal(s.requests.filter(r=>r.href.endsWith('shared.css')).length,1,'shared style warmed once');assert.match(s.cachedGalleryPreview(url(0),'en'),/blog-gallery-embed/);assert.equal(s.cachedGalleryPreview(url(0),'zh'),undefined);
 const count=s.requests.length;await s.loadGalleryPreview(url(0),'en');assert.equal(s.requests.length,count);s.advance(30000);assert.equal(s.cachedGalleryPreview(url(0),'en'),undefined);const fresh=s.loadGalleryPreview(url(0),'en');assert.equal(s.requests.length,count+1);s.requests.at(-1).respond('updated');assert.match(await fresh,/updated/);
});

test('failed, oversized and non-preview responses leave no stale HTML and do not stall other authors',async()=>{
 for(const [body,status,type] of [['',503,'text/html'],['missing',200,'text/html'],['x'.repeat(350001),200,'text/html'],['{}',200,'application/json']]){
  const s=fixture(),failed=s.loadGalleryPreview(url(0),'en');s.requests[0].respond(body,status,type);assert.equal(await failed,null);assert.equal(s.cachedGalleryPreview(url(0),'en'),undefined);const retry=s.loadGalleryPreview(url(0),'en');assert.equal(s.requests.length,2);s.requests[1].respond();assert.ok(await retry);
 }
 const s=fixture();for(const path of ['/blog/static?embed=gallery','https://evil.example/blog/a/preview','//evil.example/blog/a/preview','/api/auth/me','/blog/a/preview?draft=1'])assert.equal(await s.loadGalleryPreview(path,'en'),null);assert.equal(s.requests.length,0);
});

test('slow queued work remains deduplicated beyond the completed-document TTL',async()=>{
 const s=fixture(),a=s.loadGalleryPreview(url(0),'en'),b=s.loadGalleryPreview(url(1),'en'),queued=s.loadGalleryPreview(url(2),'en');s.advance(30001);assert.equal(s.loadGalleryPreview(url(2),'en',true),queued);
 s.requests[0].respond();s.requests[1].respond();await s.flush();s.requests.find(r=>r.href===url(2)).respond();await Promise.all([a,b,queued]);assert.equal(s.maxActive,2);
});

test('manifest warming uses the same spatial priority and is deduplicated without creating frames',async()=>{
 const s=fixture(),promise=s.warmGalleryPreviews('en');assert.equal(s.warmGalleryPreviews('en'),promise);assert.equal(s.requests[0].href,'/api/blog-gallery');s.requests[0].respond({previews:[url(0),null,url(2),url(3)]});await promise;assert.deepEqual(s.requests.slice(1).map(r=>r.href),[url(0),url(3)]);s.requests[1].respond();s.requests[2].respond();await s.flush();assert.equal(s.requests.findLast(r=>r.href.includes('person')).href,url(2));s.requests.findLast(r=>r.href.includes('person')).respond();await s.flush();assert.equal(s.maxActive,2);
});

test('a new language gets its own document and the in-memory cache evicts beyond twenty-four entries',async()=>{
 const s=fixture();for(let i=0;i<25;i++){const promise=s.loadGalleryPreview(url(i),'en');s.requests.findLast(r=>r.href===url(i)).respond();await promise;}
 assert.equal(s.cachedGalleryPreview(url(0),'en'),undefined);assert.ok(s.cachedGalleryPreview(url(24),'en'));const localized=s.loadGalleryPreview(url(24),'zh');s.requests.at(-1).respond('中文');assert.match(await localized,/中文/);assert.doesNotMatch(s.cachedGalleryPreview(url(24),'en'),/中文/);
});
