import test from 'node:test';
import assert from 'node:assert/strict';
import vibeui from '../src/lib/design-imports/vibeui.json' with {type:'json'};
import stylekit from '../src/lib/design-imports/stylekit.json' with {type:'json'};
import {studioDesigns,studioPages,studioComponentEntries,studioComponents,componentPrompt,studioContrast} from '../src/lib/design-studio.mjs';
import {filterDesignEntries} from '../src/lib/design-search.mjs';
import {designCollection} from '../src/lib/design-catalog.mjs';

test('independent demos cover every retained reference without replacing or copying their documents',()=>{
 assert.equal(studioPages.length,269);assert.equal(studioComponentEntries.length,24);assert.equal(studioDesigns.length,293);
 const sources=[...vibeui,...stylekit],bySource=new Map(studioPages.filter(e=>e.studio.originSlug).map(e=>[e.studio.originSlug,e]));
 assert.equal(bySource.size,sources.length);
 for(const source of sources){const own=bySource.get(source.slug);assert.ok(own);assert.notEqual(own.prompt,source.prompt);assert.notEqual(own.specification,source.specification);assert.equal(own.external,false);assert.equal(own.image,'');assert.equal(own.creator.name,'IAVSE');assert.equal(own.websiteUrl,'/resources/designs/'+own.slug+'/preview');assert.ok(own.referenceUrls.some(r=>r.url==='/resources/designs/'+source.slug))}
 assert.equal(new Set(studioDesigns.map(e=>e.slug)).size,293);
});
test('all generated themes have valid recipes and readable text while retaining distinct structural directions',()=>{
 assert.equal(new Set(studioPages.map(e=>e.studio.family)).size,16);assert.equal(new Set(studioPages.map(e=>e.studio.layout)).size,13);
 for(const entry of studioDesigns){const t=entry.studio.theme;assert.ok(studioContrast(t.bg,t.ink)>=4.5,entry.slug);assert.ok(studioContrast(t.accent,t.accentInk)>=4.5,entry.slug);assert.ok(entry.studio.rule&&entry.studio.layout);assert.equal(designCollection(entry),'studio');assert.match(entry.prompt,/390px/);assert.match(entry.specification,/IAVSE/)}
});
test('component prompts are independently usable and specific to the selected component and style',()=>{
 const first=studioPages[0],last=studioPages[15];
 const prompts=studioComponents.map(c=>componentPrompt(first,c));assert.equal(new Set(prompts).size,24);
 for(const c of studioComponents){const prompt=componentPrompt(first,c);assert.ok(prompt.includes(c[1]));assert.ok(prompt.includes(c[4]));assert.notEqual(prompt,componentPrompt(last,c))}
 assert.equal(componentPrompt(first,'does-not-exist'),'');
 assert.equal(filterDesignEntries(studioDesigns,{collection:'studio',q:'数据明细表'}).some(e=>e.slug==='studio-component-table'),true);
});
