import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import entries from '../src/lib/template-library.json' with {type:'json'};
import {createCatalogIndex,filterCatalog} from '../src/lib/design-taxonomy.mjs';
import {designDirectoryEntry} from '../src/lib/design-directory-data.mjs';
import {templateCoverSrcSet} from '../src/lib/template-cover.mjs';

test('a prebuilt index keeps every combined filter, order and count identical',()=>{
 const index=createCatalogIndex(entries);
 assert.equal(index.counts.all,entries.length);
 assert.equal(index.counts.project,18);assert.equal(index.counts['design-system'],54);
 for(const filters of [{},{q:'finance'},{q:'文档'},{collection:'project',scenario:'docs'},{visual:'minimal',industry:'finance'},{favorites:'1',sort:'name'},{collection:'design-system',industry:'ai',q:'Claude'}])assert.deepEqual(filterCatalog(entries,filters,['voltagent-stripe'],index),filterCatalog(entries,filters,['voltagent-stripe']));
 assert.equal(index.scenarios.get('docs'),4);
 const next=[...entries,{...entries[0],slug:'new-snapshot-entry'}];
 assert.equal(filterCatalog(next,{},[],index).length,entries.length+1,'an old index cannot hide a new snapshot');
});

test('directory payloads exclude long specifications while keeping preview and filter metadata',()=>{
 for(const entry of entries){const item=designDirectoryEntry(entry);assert.equal(item.slug,entry.slug);assert.equal(item.previewUrl,entry.previewUrl);assert.deepEqual(item.template.scenarios,entry.template.scenarios);assert.deepEqual(item.template.visualStyles,entry.template.visualStyles);for(const key of ['specification','prompt','typography','motion','bodyHtml','production'])assert.equal(Object.hasOwn(item,key),false);}
 const src='/template-covers/project-adminkit.webp?v=1234567890abcdef';
 assert.equal(templateCoverSrcSet(src),'/template-covers/thumbs/project-adminkit.webp?v=1234567890abcdef 1x, '+src+' 2x');
 assert.equal(templateCoverSrcSet(src,true),undefined);
 for(const input of ['https://other.example/image.webp','/media/user-image.webp','javascript:alert(1)','/template-covers/../private.webp'])assert.equal(templateCoverSrcSet(input),undefined);
});

test('published detail lookup is indexed, skips private drafts, and reflects a withdrawal immediately',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'iavse-directory-index-'));process.env.APP_DATA_DIR=dir;
 const I=await import('../src/lib/design-intake.mjs');const D=await import('../src/lib/db.mjs');const db=I.intakeDb();
 try{
  const published={id:'reviewed',slug:'reviewed-performance-fixture',title:'Reviewed',summary:'Public summary',specification:'x'.repeat(50000),prompt:'y'.repeat(20000),template:{kind:'project',scenarios:['docs']}};
  const insert=db.prepare('INSERT INTO design_intake_entries(id,kind,source_key,status,visibility,draft,published,created,updated,reviewed) VALUES(?,?,?,?,?,?,?,?,?,?)');
  insert.run('reviewed','design','https://example.com/reviewed','approved','public',JSON.stringify({...published,title:'PRIVATE DRAFT'}),JSON.stringify(published),'2026-11-08','2026-11-08','2026-11-08');
  insert.run('private','design','https://example.com/private','pending','private',JSON.stringify({...published,slug:'private-only'}),null,'2026-11-08','2026-11-08',null);
  assert.equal(I.findPublishedDesign(published.slug).title,'Reviewed');assert.equal(I.findPublishedDesign('private-only'),null);
  assert.equal(I.findPublishedDesign(entries[0].slug).slug,entries[0].slug);
  const summary=I.readPublishedDesigns({summary:true}).find(x=>x.slug===published.slug);assert.equal(summary.specification,undefined);assert.equal(summary.prompt,undefined);assert.equal(I.readPublishedDesigns().find(x=>x.slug===published.slug).specification.length,50000);
  const plan=db.prepare("EXPLAIN QUERY PLAN SELECT published FROM design_intake_entries INDEXED BY design_intake_public_slug WHERE kind='design' AND visibility='public' AND published IS NOT NULL AND json_valid(published) AND json_extract(published,'$.slug')=? ORDER BY reviewed DESC,id DESC LIMIT 1").all(published.slug);
  assert.ok(plan.some(x=>x.detail.includes('design_intake_public_slug')));
  db.prepare("UPDATE design_intake_entries SET visibility='private' WHERE id='reviewed'").run();assert.equal(I.findPublishedDesign(published.slug),null);assert.ok(!I.readPublishedDesigns({summary:true}).some(x=>x.slug===published.slug));
 }finally{db.close();delete globalThis.__personalSiteDb;delete process.env.APP_DATA_DIR;rmSync(dir,{recursive:true,force:true});}
});

test('new projects preserve explicit licenses, source versions and original demo identities',()=>{
 const evidence=JSON.parse(readFileSync(new URL('../docs/open-template-expansion-2026-11-08.json',import.meta.url),'utf8'));
 assert.equal(evidence.projects.length,6);
 for(const source of evidence.projects){const entry=entries.find(x=>x.slug==='template-'+source.id);assert.equal(entry.template.upstreamDemoUrl,source.demo);assert.equal(entry.license.url,source.licenseUrl);assert.match(source.sourceBlobSha,/^[a-f0-9]{40}$/);assert.equal(readFileSync(new URL('../public/template-covers/licenses/'+source.id+'-MIT.txt',import.meta.url),'utf8').trim(),source.licenseText.trim());assert.ok(entry.specification.includes(source.revision));}
 assert.ok(!entries.some(x=>x.slug==='template-astroplate'),'the source explicitly withheld demo image permission');
 assert.equal(entries.find(x=>x.slug==='template-adminkit').previewUrl,'https://demo-mit.adminkit.io/');
});
