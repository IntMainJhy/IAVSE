import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import entries from '../src/lib/template-library.json' with {type:'json'};
import {templatePreviewUrl} from '../src/lib/template-preview.mjs';
import {catalogPresentationEntries,filterCatalog} from '../src/lib/design-taxonomy.mjs';

test('reset catalog contains independent GitHub projects and separately named design references',()=>{
 assert.equal(entries.length,58);
 assert.equal(new Set(entries.map(entry=>entry.slug)).size,58);
 assert.deepEqual(['project','page','design-system'].map(collection=>filterCatalog(entries,{collection}).length),[4,0,54]);
 assert.equal(catalogPresentationEntries(entries).length,58);
 for(const entry of entries){
  assert.equal(entry.license.status,'verified');assert.equal(entry.license.name.startsWith('MIT'),true);
  assert.ok(entry.template.repository.startsWith('https://github.com/'));
  assert.ok(entry.creator.name&&entry.creator.url&&entry.provenance.evidenceUrl);
  assert.ok(entry.source.url.startsWith(entry.template.repository));
  assert.ok(!entry.studio,'no rewritten or generated page metadata remains');
 }
 assert.ok(!existsSync(new URL('../src/lib/design-imports',import.meta.url)));
 assert.ok(!entries.some(entry=>entry.slug.startsWith('website-')||entry.slug.includes('uiuxpro-')));
 const publicFolders=readdirSync(new URL('../public/design-artifacts',import.meta.url));
 assert.equal(publicFolders.length,54);assert.ok(publicFolders.every(name=>name.startsWith('vibeui-')&&!name.includes('uiuxpro-')));
});

test('retained VoltAgent copies preserve licenses and real light/dark documents without generated interactions',()=>{
 const mit=readFileSync(new URL('../docs/licenses/VoltAgent-awesome-design-md-MIT.txt',import.meta.url),'utf8').trim();
 for(const entry of entries.filter(entry=>entry.template.kind==='design-system')){
  assert.ok(entry.specification.includes(mit),entry.slug);
  assert.equal(entry.previewVariants.length,2);
  for(const variant of entry.previewVariants){
   const html=readFileSync(new URL('../public'+variant.url,import.meta.url),'utf8');
   assert.match(html,/Copyright \(c\) 2026 VoltAgent/);
   assert.doesNotMatch(html,/<script\b|study-feedback|study-reset|study-section/i);
   assert.ok(html.length>5000);
  }
 }
});

test('preview selection allows only reviewed local documents and exact external project URLs',()=>{
 const study=entries.find(entry=>entry.slug==='voltagent-claude');
 assert.equal(templatePreviewUrl(study,1),study.previewVariants[1].url);
 for(const value of [-1,NaN,10000,'https://evil.example'])assert.equal(templatePreviewUrl(study,value),study.previewUrl);
 assert.ok(!entries.some(entry=>entry.template.repository.startsWith('https://github.com/AnxForever/')));
 assert.ok(!existsSync(new URL('../src/app/template-sites',import.meta.url)));
 const project=entries.find(entry=>entry.slug==='template-fuwari');assert.equal(templatePreviewUrl(project),'https://fuwari.vercel.app');
 for(const url of ['javascript:alert(1)','//evil.example/','/template-sites/../admin','https://evil.example/','https://fuwari.vercel.app.evil.example/','https://user:pass@fuwari.vercel.app/'])assert.equal(templatePreviewUrl({...project,previewUrl:url}),null);
 assert.equal(templatePreviewUrl(entries.find(entry=>entry.slug==='template-astrowind')),null);
 for(const entry of entries)assert.match(entry.image,/^\/template-covers\/[a-z0-9-]+\.webp\?v=[a-f0-9]{16}$/);
});
