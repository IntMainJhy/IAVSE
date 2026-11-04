import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const root=new URL('../src/app/',import.meta.url),read=path=>fs.readFileSync(new URL(path,root),'utf8');
const files=name=>[...read('route-styles/'+name+'.css').matchAll(/@import '\.\.\/(.+\.css)'/g)].map(match=>match[1]);
test('server route CSS preserves the established cascade and excludes unrelated feature families',()=>{
 const baseline=files('fallback');
 for(const name of ['home','blogs','blog','catalog','community','workspace','admin','account']){
  const selected=files(name);assert.equal(new Set(selected).size,selected.length,name);
  assert.deepEqual(selected,baseline.filter(file=>selected.includes(file)),name+' keeps the old cascade');
  for(const file of selected)assert.ok(fs.existsSync(new URL(file,root)),file);
 }
 assert.ok(!files('home').includes('anx-portfolio.css'));
 assert.ok(!files('home').includes('community-feed.css'));
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
