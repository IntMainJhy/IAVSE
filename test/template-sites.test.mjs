import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import manifest from '../src/lib/template-sites-manifest.json' with {type:'json'};
import transformations from '../vendor/stylekit-templates/transforms.json' with {type:'json'};
import fonts from '../vendor/stylekit-templates/fonts.json' with {type:'json'};
const root=new URL('../',import.meta.url),read=path=>fs.readFileSync(new URL(path,root)),sha=content=>crypto.createHash('sha256').update(content).digest('hex');

test('all original template sources and documented runtime adaptations retain their verified hashes',()=>{
 assert.equal(manifest.templates.length,37);assert.equal(manifest.templates.flatMap(entry=>entry.routes).length,47);
 for(const file of transformations.files){
  assert.equal(sha(read(file.originalPath)),file.sourceSha256,file.originalPath);
  assert.equal(sha(read(file.runtimePath)),file.runtimeSha256,file.runtimePath);
  if(file.sourceSha256!==file.runtimeSha256)assert.ok(file.changes.length,file.runtimePath);
 }
 for(const entry of manifest.templates){assert.equal(sha(read('public'+entry.entry)),entry.entrySha256,entry.slug);assert.equal(entry.license,'MIT');}
 assert.match(read('vendor/stylekit-templates/licenses/StyleKit-MIT.txt').toString(),/Permission is hereby granted/);
});

test('every local template font is traceable to its source and included OFL notice',()=>{
 assert.equal(new Set(fonts.map(font=>font.family)).size,15);
 for(const font of fonts){assert.equal(font.license,'OFL-1.1');assert.equal(sha(read('public/'+font.file)),font.sha256,font.file);assert.match(read(font.licensePath).toString(),/SIL OPEN FONT LICENSE/i);assert.ok(font.sourceUrl.startsWith('https://raw.githubusercontent.com/google/fonts/'));}
});

test('standalone route serves original runtime entries without platform layout and rejects unknown paths',async()=>{
 const source=ts.transpileModule(read('src/app/template-sites/[...path]/route.ts').toString(),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext(source,{exports,Response,URL,require:name=>{if(name.includes('template-sites-manifest'))return{default:manifest};throw Error(name)}});
 for(const path of ['brutal-landing','editorial-profile-archive/work/quiet-system']){
  const response=await exports.GET(new Request('https://site.example/template-sites/'+path),{params:Promise.resolve({path:path.split('/')})});assert.equal(response.status,200);
  const html=await response.text();assert.match(html,/id="template-root"/);assert.match(html,/type="module" src="\/template-site-assets\/entries\//);assert.doesNotMatch(html,/QuantumBackdrop|_next\/static|iavse-quantum/);assert.equal(response.headers.get('X-Frame-Options'),'SAMEORIGIN');
 }
 for(const path of [['unknown'],['brutal-landing','missing'],['..','admin'],['%22%3e%3cscript']]){
  const response=await exports.GET(new Request('https://site.example/template-sites/invalid'),{params:Promise.resolve({path})});assert.equal(response.status,404);assert.doesNotMatch(await response.text(),/<script/i);
 }
});
