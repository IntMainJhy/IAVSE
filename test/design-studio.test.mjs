import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import seeds from '../src/lib/design-library-seed.json' with {type:'json'};
import {studioDesigns,studioPages,studioComponentEntries,studioComponents,componentPrompt} from '../src/lib/design-studio.mjs';
import {filterDesignEntries} from '../src/lib/design-search.mjs';

const expected=['linear','notion','github','stripe','apple','vercel','claude','figma','raycast'];
test('only individually implemented, website-backed pages remain in the new directory',()=>{
 assert.equal(studioPages.length,9);assert.deepEqual(new Set(studioPages.map(e=>e.studio.referenceKey)),new Set(expected));
 assert.equal(new Set(studioPages.map(e=>new URL(e.referenceSite.url).hostname)).size,9);
 for(const entry of studioPages){
  assert.equal(entry.external,false);assert.ok(entry.studio.referencePages.length);assert.ok(entry.studio.observations.length>=3,entry.slug);
  assert.ok(entry.studio.interactions.length>=2,entry.slug);assert.match(entry.referenceSite.url,/^https:\/\//);
  assert.ok(entry.prompt.length>300,entry.slug);assert.ok(entry.specification.includes(entry.referenceSite.name),entry.slug);
  assert.ok(!entry.studio.family&&!entry.studio.originSlug,entry.slug);assert.ok(!entry.slug.startsWith('studio-stylekit-')&&!entry.slug.startsWith('studio-vibeui-'));
 }
 const source=readFileSync(new URL('../src/lib/design-studio.mjs',import.meta.url),'utf8');assert.ok(!source.includes('familyFor'));assert.ok(!source.includes('design-imports/'));
 assert.equal(existsSync(new URL('../src/lib/design-studio/families.mjs',import.meta.url)),false);
});
test('the older recolored brand templates and their thumbnails are removed while the four IAVSE examples remain',()=>{
 assert.equal(seeds.length,4);assert.ok(seeds.every(e=>e.featured&&e.slug.startsWith('iavse-')));
 for(const slug of ['linear-precision','notion-paper-workspace','apple-product-stage','stripe-gradient-platform'])assert.equal(existsSync(new URL('../public/media/designs/'+slug+'.webp',import.meta.url)),false);
 assert.equal(studioDesigns.some(e=>e.slug==='studio-stylekit-editorial'),false);assert.equal(studioDesigns.some(e=>e.slug==='studio-vibeui-claude'),false);
});
test('standalone component entries stay separate and site-specific component prompts use actual observations',()=>{
 assert.equal(studioComponentEntries.length,24);assert.equal(studioDesigns.length,33);
 assert.equal(new Set(studioDesigns.map(e=>e.slug)).size,33);
 for(const entry of studioPages){const ids=entry.studio.componentIds;assert.ok(ids.length);for(const id of ids){const prompt=componentPrompt(entry,id);assert.ok(prompt.includes(entry.title));assert.ok(prompt.includes(entry.studio.observations[0]))}}
 assert.equal(componentPrompt(studioPages[0],'does-not-exist'),'');
 assert.equal(filterDesignEntries(studioDesigns,{q:'数据明细表'}).some(e=>e.slug==='studio-component-table'),true);
 assert.equal(new Set(studioComponents.map(c=>c[0])).size,24);
});
