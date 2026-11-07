import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import originals from '../src/lib/design-library-seed.json' with {type:'json'};
import vibeui from '../src/lib/design-imports/vibeui.json' with {type:'json'};
import stylekit from '../src/lib/design-imports/stylekit.json' with {type:'json'};
import {designCategories,designCategory,designCollection,designPage,importedDesign,externalPreviewUrl} from '../src/lib/design-catalog.mjs';
import {filterDesignEntries} from '../src/lib/design-search.mjs';
const all=[...originals,...vibeui.map(importedDesign),...stylekit.map(importedDesign)];

test('both complete source catalogs retain distinct IDs, provenance and public experience URLs',()=>{
 assert.equal(vibeui.length,112);assert.equal(stylekit.length,149);assert.equal(all.length,281);
 assert.equal(new Set(all.map(e=>e.id)).size,all.length);assert.equal(new Set(all.map(e=>e.slug)).size,all.length);
 for(const entry of [...vibeui,...stylekit]){
  assert.ok(designCategories.includes(entry.category),entry.slug);
  assert.ok(entry.source.name&&entry.collection.name&&entry.provenance.note,entry.slug);
  for(const url of [entry.source.url,entry.collection.url,entry.websiteUrl,entry.previewUrl,entry.provenance.evidenceUrl])assert.equal(new URL(url).protocol,'https:');
  assert.ok(entry.license.name&&entry.license.status,entry.slug);
 }
});
test('VibeUI categories and every preview version are retained, and unknown licenses do not imply copied source',()=>{
 assert.deepEqual(designCategories.map(c=>vibeui.filter(e=>e.category===c).length),[12,14,6,10,4,8,40,8,10]);
 assert.equal(vibeui.flatMap(e=>e.previewVariants).length,166);
 assert.equal(vibeui.filter(e=>e.license.status==='verified').length,54);
 const mit=readFileSync(new URL('../docs/licenses/VoltAgent-awesome-design-md-MIT.txt',import.meta.url),'utf8').trim();
 for(const e of vibeui.filter(e=>e.license.status==='verified'))assert.ok(e.specification.includes(mit),'copying or downloading '+e.slug+' retains the license');
 for(const e of vibeui.filter(e=>e.license.status==='unconfirmed')){
  assert.equal(e.image,'');assert.equal(e.specification,'');assert.equal(e.prompt,'');
  assert.match(e.source.url,/github\.com\/yuanfu8899\/uiuxskillProMax/);
  assert.match(e.previewUrl,/^https:\/\/yuanfu8899\.github\.io\//);
 }
});
test('StyleKit covers and redistribution notices are included locally',()=>{
 for(const e of stylekit){
  assert.match(e.image,/^\/design-imports\/stylekit\/[a-z0-9-]+\.svg$/);
  assert.ok(existsSync(new URL('../public'+e.image,import.meta.url)),e.slug);
  assert.equal(e.license.name,'MIT');assert.ok(e.prompt.length>100&&e.specification.length>100);
 }
 assert.match(readFileSync(new URL('../public/design-imports/stylekit/LICENSE.txt',import.meta.url),'utf8'),/Permission is hereby granted/);
});
test('source, category and keyword filters combine without losing original category compatibility',()=>{
 assert.equal(filterDesignEntries(all,{collection:'vibeui'}).length,112);
 assert.equal(filterDesignEntries(all,{collection:'stylekit'}).length,149);
 assert.deepEqual(filterDesignEntries(all,{collection:'vibeui',category:'AI',q:'claude'}).map(e=>e.slug),['vibeui-claude']);
 assert.equal(filterDesignEntries(all,{collection:'stylekit',q:'vibeui'}).length,0);
 for(const e of all)assert.ok(designCategories.includes(designCategory(e)));
 assert.equal(designCollection(originals[0]),'iavse');
});
test('pagination visits every item once and bounds invalid or stale page requests',()=>{
 const result=[];for(let page=1;page<=Math.ceil(all.length/36);page++)result.push(...designPage(all,{page}).items);
 assert.deepEqual(result,all);assert.equal(designPage(all,{page:10000}).page,8);
 assert.equal(designPage(all,{page:-1}).page,1);assert.equal(designPage(all,{page:NaN}).page,1);
 assert.deepEqual(designPage([]),{items:[],page:1,pages:1,total:0});
});

test('remote preview URLs come only from reviewed entries and variant indices',()=>{
 assert.equal(externalPreviewUrl(vibeui[0],1),vibeui[0].previewVariants[1].url);
 for(const variant of [-1,NaN,'https://evil.example/',10000])assert.equal(externalPreviewUrl(vibeui[0],variant),vibeui[0].previewUrl);
 assert.equal(externalPreviewUrl({previewUrl:'https://evil.example/'}),null);
 assert.equal(externalPreviewUrl({previewUrl:'https://vibeui.top.evil.example/'}),null);
 assert.equal(externalPreviewUrl({previewUrl:'http://vibeui.top/'}),null);
});
