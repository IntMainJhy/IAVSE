import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import entries from '../src/lib/template-library.json' with {type:'json'};
import {SCENARIOS,REFERENCE_INDUSTRIES,VISUAL_STYLES,designFacets,filterCatalog} from '../src/lib/design-taxonomy.mjs';
import {readCatalogFilters,catalogQuery} from '../src/lib/design-catalog-state.mjs';

test('documentation purpose returns actual documentation websites, never token catalogs',()=>{
 const docs=filterCatalog(entries,{scenario:'docs'});
 assert.deepEqual(docs.map(x=>x.slug),['template-hextra','template-just-docs','template-starlight','template-nextra']);
 for(const entry of entries.filter(x=>x.template.kind==='design-system'))assert.deepEqual(designFacets(entry).scenarios,[]);
 // A malformed future import cannot accidentally put a design specimen under deployable docs.
 assert.deepEqual(designFacets({template:{kind:'design-system',scenarios:['docs']}}).scenarios,[]);
});

test('reference industries describe the actual reference brand rather than page layout',()=>{
 const finance=filterCatalog(entries,{industry:'finance'}).map(x=>x.slug);
 assert.ok(finance.includes('voltagent-stripe'));
 assert.equal(finance.length,5);
 assert.ok(!filterCatalog(entries,{industry:'cloud'}).some(x=>x.slug==='voltagent-stripe'));
 assert.ok(filterCatalog(entries,{industry:'cloud'}).some(x=>x.slug==='voltagent-ibm'));
 assert.ok(filterCatalog(entries,{industry:'hardware'}).some(x=>x.slug==='voltagent-nvidia'));
 assert.ok(!filterCatalog(entries,{industry:'finance'}).some(x=>x.template.kind==='project'));
});

test('every published entry has explicit valid visual facets; brand references have a reference industry',()=>{
 const scenarioIds=new Set(SCENARIOS.map(x=>x.id)),industryIds=new Set(REFERENCE_INDUSTRIES.map(x=>x.id)),styleIds=new Set(VISUAL_STYLES.map(x=>x.id));
 for(const entry of entries){const facets=designFacets(entry);
  assert.ok(facets.visualStyles.length,entry.slug);
  assert.ok(facets.visualStyles.every(id=>styleIds.has(id)),entry.slug);
  assert.ok(facets.scenarios.every(id=>scenarioIds.has(id)),entry.slug);
  assert.ok(facets.industries.every(id=>industryIds.has(id)),entry.slug);
  if(entry.template.kind==='design-system')assert.equal(facets.industries.length,1,entry.slug);
  else assert.ok(facets.scenarios.length,entry.slug);
 }
});

test('independent facets combine with search, collection and favorites and survive URL round trips',()=>{
 const filters={collection:'design-system',industry:'finance',visual:'gradient',q:'Stripe',favorites:'1'};
 assert.deepEqual(filterCatalog(entries,filters,['voltagent-stripe']).map(x=>x.slug),['voltagent-stripe']);
 assert.deepEqual(filterCatalog(entries,{industry:'finance',scenario:'docs'}),[]);
 assert.deepEqual(filterCatalog(entries,{visual:'unreviewed'}),[]);
 assert.deepEqual(filterCatalog(entries,{industry:'unreviewed'}),[]);
 assert.equal(filterCatalog(entries,{q:'金融与支付'}).length,5);
 assert.ok(filterCatalog(entries,{q:'编辑排版'}).some(x=>x.slug==='voltagent-claude'));
 const query=catalogQuery(filters),restored=readCatalogFilters(query);
 assert.equal(restored.industry,'finance');assert.equal(restored.visual,'gradient');
 assert.deepEqual(filterCatalog(entries,restored,['voltagent-stripe']).map(x=>x.slug),['voltagent-stripe']);
});

test('all 112 VibeUI records have an explicit upstream permission decision and exact file evidence',()=>{
 const audit=JSON.parse(readFileSync(new URL('../public/catalog-audits/vibeui-112.json',import.meta.url),'utf8'));
 assert.equal(audit.entries.length,112);assert.equal(new Set(audit.entries.map(x=>x.id)).size,112);
 const included=audit.entries.filter(x=>x.decision==='included'),excluded=audit.entries.filter(x=>x.decision==='excluded-license-unconfirmed');
 assert.equal(included.length,54);assert.equal(excluded.length,58);
 assert.equal(audit.summary.newlyAdded,0,'existing licensed references are not duplicated');
 for(const row of included){assert.equal(row.license,'MIT');assert.ok(row.licenseUrl.includes(row.upstreamRevision));assert.equal(row.files.length,3);assert.ok(entries.some(x=>x.slug===row.localSlug));}
 for(const row of excluded){assert.equal(row.license,null);assert.ok(row.permissionEvidence.htmlReviewed);assert.equal(row.permissionEvidence.inlineLicenseNoticeFound,false);assert.ok(!entries.some(x=>x.source.url===row.files[0].upstreamUrl));}
 for(const row of audit.entries)for(const file of row.files){assert.match(file.blobSha,/^[a-f0-9]{40}$/);assert.ok(file.upstreamUrl.startsWith(row.upstreamRepository+'/blob/'+row.upstreamRevision+'/'));assert.ok(file.collectionUrl.includes(audit.collection.revision));}
});
