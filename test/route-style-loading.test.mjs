import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const root=new URL('../src/app/',import.meta.url),read=path=>fs.readFileSync(new URL(path,root),'utf8');
const files=name=>[...read('route-styles/'+name+'.css').matchAll(/@import '\.\.\/(.+\.css)'/g)].map(match=>match[1]);
test('server route CSS preserves the established cascade and excludes unrelated feature families',()=>{
 const baseline=files('fallback');
 const routeOwned={'iavse-landing.css':['home'],'blog-gallery.css':['blogs'],'community-timeline.css':['community','workspace']};
 for(const name of ['home','blogs','blog','catalog','community','workspace','admin','account']){
  const selected=files(name);assert.equal(new Set(selected).size,selected.length,name);
  const shared=selected.filter(file=>!Object.hasOwn(routeOwned,file));
  assert.deepEqual(shared,baseline.filter(file=>shared.includes(file)),name+' keeps the shared cascade');
  if(name!=='home')assert.ok(!selected.includes('iavse-landing.css'),name+' excludes the homepage redesign');
  for(const[file,owners]of Object.entries(routeOwned))assert.equal(selected.includes(file),owners.includes(name),file+' remains owned by '+owners.join('/'));
  for(const file of selected)assert.ok(fs.existsSync(new URL(file,root)),file);
 }
 assert.ok(!files('home').includes('anx-portfolio.css'));
 assert.ok(!files('home').includes('community-feed.css'));
 assert.equal(files('home').at(-1),'iavse-landing.css','the homepage owns its scoped visual override');
 assert.ok(!files('blogs').includes('iavse-home.css'));
 assert.ok(!files('community').includes('blog-appearances.css'));
 for(const feature of ['blog-appearances.css','anx-portfolio.css','blog-reading-finish.css'])assert.ok(files('workspace').includes(feature),'editor needs preview templates');
 for(const [file,group] of [['page.tsx','home'],['blogs/[[...path]]/page.tsx','blogs'],['blog/[[...path]]/page.tsx','blog'],['community/[[...path]]/page.tsx','community'],['resources/[[...path]]/page.tsx','catalog'],['workspace/blog/page.tsx','workspace'],['admin/page.tsx','admin']])assert.ok(read(file).includes('route-styles/'+group+'.css'),file+' owns render-blocking CSS');
 const layout=read('layout.tsx');assert.ok(!layout.includes('community-feed.css'));assert.ok(!layout.includes('iavse-home.css'));
});
test('route adapters preserve metadata, nested path and the original query promise',async()=>{
 const exports={},calls=[],query=Promise.resolve({q:'unchanged',compose:'1'});
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/lib/route-page.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:()=>({default:async props=>{calls.push({kind:'page',path:(await props.params).path,query:props.searchParams});return'page';},generateMetadata:async props=>{calls.push({kind:'metadata',path:(await props.params).path,query:props.searchParams});return'title';}})});
 const adapter=exports.routePage(['resources']),props={params:Promise.resolve({path:['shared','public-id']}),searchParams:query};
 assert.equal(await adapter.Page(props),'page');assert.equal(await adapter.generateMetadata(props),'title');
 for(const call of calls){assert.deepEqual([...call.path],['resources','shared','public-id']);assert.equal(call.query,query);}
});

test('shared platform chrome preserves authored blogs, previews and the full-screen studio',()=>{
 const exports={};
 const source=fs.readFileSync(new URL('../src/lib/platform-chrome.ts',import.meta.url),'utf8');
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports});
 for(const path of ['/blog/alex','/blog/alex/projects/a','/blogs/showcase/editorial','/resources/designs/sample/preview','/workspace/blog','/workspace/blog/preview','/']){
  const chrome=exports.platformChrome(path);assert.equal(chrome.header,false,path);assert.equal(chrome.atmosphere,false,path);
 }
 for(const path of ['/resources','/skills/testing','/docs/setup','/community','/workspace/account','/login','/join','/legal/privacy','/about','/blogs','/missing']){
  const chrome=exports.platformChrome(path);assert.equal(chrome.header,true,path);assert.equal(chrome.atmosphere,true,path);
 }
 assert.equal(exports.platformChrome('/admin/review').header,false,'administration retains its own navigation');
 assert.equal(exports.platformChrome('/admin/review').atmosphere,true);
});
