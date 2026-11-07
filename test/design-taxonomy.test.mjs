import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import styles from '../src/lib/design-imports/stylekit.json' with {type:'json'};
import vibeui from '../src/lib/design-imports/vibeui.json' with {type:'json'};
import own from '../src/lib/design-library-seed.json' with {type:'json'};
import seed from '../src/lib/design-taxonomy-seed.json' with {type:'json'};
import {studioPages,studioComponentEntries} from '../src/lib/design-studio.mjs';
import {SCENARIOS,STYLE_TAGS,INDUSTRIES,TAXONOMY_PROVENANCE,designFacets,catalogPresentationEntries,filterCatalog} from '../src/lib/design-taxonomy.mjs';

const pairs=[['apple','apple-style'],['stripe','stripe-style'],['editorial','editorial'],['brutalist','neo-brutalist'],['swiss','swiss-style'],['minimal','minimalist-flat'],['glass','glassmorphism'],['bento','bento-grid'],['organic','natural-organic'],['pixel','pixel-art'],['cyber','cyberpunk-neon'],['dark','dark-mode']];
const websites=pairs.map(([key,slug])=>({slug:'website-'+key,title:key,summary:'Independent website example',category:'通用',tags:[],collection:{name:'网站设计'},studio:{kind:'website',websiteKey:key,sourceSlug:'stylekit-'+slug}}));
const entries=[...websites,...studioPages,...studioComponentEntries,...own,...vibeui,...styles];
const slugs=items=>items.map(item=>item.slug);

test('the factual taxonomy retains all 149 explicit memberships, 131 visual/18 layout and 13 source tags',()=>{
 const snapshot=JSON.parse(gunzipSync(readFileSync(new URL('../scripts/design-import/stylekit-source.json.gz',import.meta.url))));
 assert.equal(SCENARIOS.length,10);assert.equal(STYLE_TAGS.length,13);assert.equal(INDUSTRIES.length,9);assert.equal(Object.keys(seed.styles).length,149);
 assert.equal(filterCatalog(styles,{type:'visual'}).length,131);assert.equal(filterCatalog(styles,{type:'layout'}).length,18);
 for(const record of snapshot.index.styles){assert.deepEqual(seed.styles[record.slug].tags,record.tags);assert.equal(seed.styles[record.slug].styleType,record.styleType);assert.ok(seed.styles[record.slug].scenarios.length>=1);assert.ok(seed.styles[record.slug].scenarios.every(id=>SCENARIOS.some(item=>item.id===id)))}
 assert.deepEqual(designFacets(styles.find(item=>item.slug==='stylekit-pixel-art')).scenarios,['creative']);
 assert.equal(TAXONOMY_PROVENANCE.license,'MIT');assert.match(TAXONOMY_PROVENANCE.licenseUrl,/AnxForever\/stylekit\/blob\/[a-f0-9]+\/LICENSE/);assert.match(TAXONOMY_PROVENANCE.scenarioSha256,/^[a-f0-9]{64}$/);
});

test('native replacements remove duplicate presentation without deleting or changing any original record',()=>{
 const before=slugs(entries),source=styles.find(item=>item.slug==='stylekit-apple-style');
 const visible=catalogPresentationEntries(entries);
 assert.equal(visible.length,265);assert.equal(filterCatalog(entries,{collection:'studio'}).length,12);assert.equal(filterCatalog(entries,{collection:'stylekit'}).length,149);
 assert.equal(filterCatalog(entries,{collection:'vibeui'}).length,112);assert.equal(filterCatalog(entries,{collection:'interactions'}).length,9);assert.equal(filterCatalog(entries,{collection:'components'}).length,24);
 assert.ok(visible.includes(websites[0]));assert.ok(!visible.includes(source));assert.ok(entries.includes(source));assert.deepEqual(slugs(entries),before);
 assert.equal(filterCatalog(entries,{collection:'stylekit',type:'visual'}).length,131);assert.equal(filterCatalog(entries,{collection:'stylekit',type:'layout'}).length,18);
 assert.deepEqual(designFacets(websites[0]),designFacets(source));
 assert.equal(new Set(slugs(catalogPresentationEntries([...entries,...websites,websites[0]]))).size,265);
 for(const record of vibeui.filter(item=>item.previewPolicy==='external-only'))assert.ok(visible.includes(record));
 assert.equal(visible.filter(item=>item.previewPolicy==='external-only').length,58);
});

test('combined source, scenario, type, tags, industry, query and favorites filters all apply',()=>{
 assert.deepEqual(slugs(filterCatalog(entries,{collection:'stylekit',scenario:'ecommerce',type:'visual',tag:'brand-inspired',industry:'通用',q:'ＡＰＰＬＥ',favorites:'1'},['website-apple'])),['website-apple']);
 assert.deepEqual(slugs(filterCatalog(entries,{tag:'retro,game-ui',favorites:'1'},['website-pixel','website-apple'])),['website-pixel']);
 assert.deepEqual(slugs(filterCatalog(entries,{tag:'retro, high-contrast',favorites:'1'},['website-pixel'])),[]);
 assert.ok(filterCatalog(entries,{collection:'vibeui',industry:'AI'}).every(item=>item.category==='AI'));
 assert.equal(filterCatalog(entries,{favorites:'1'},[]).length,0);
 assert.equal(filterCatalog(entries,{collection:'components',q:'数据明细表'}).length,1);
});

test('unknown and malformed filter input is safe, and known all sentinels remain unfiltered',()=>{
 for(const invalid of [{collection:'missing'},{scenario:'missing'},{type:'missing'},{tag:'retro,missing'},{industry:'missing'}])assert.deepEqual(filterCatalog(entries,invalid),[]);
 for(const options of [null,undefined,{}, {collection:'all',scenario:'all',type:'all',tag:'all',industry:'all',sort:'unknown'},{q:{},tag:[],scenario:[]}])assert.equal(filterCatalog(entries,options).length,265);
 assert.deepEqual(filterCatalog(null),[]);assert.deepEqual(catalogPresentationEntries([null,{}]),[]);
 assert.doesNotThrow(()=>filterCatalog(entries,{favorites:'1'},{}));
 assert.deepEqual(designFacets({slug:'unknown',summary:'brass dashboard gauges',tags:['精密仪表盘']}),{scenarios:[],styleType:'visual',tags:[],industry:'通用'});
});

test('facet results and name sorting never mutate factual seed arrays or recommendation order',()=>{
 const record=styles.find(item=>item.slug==='stylekit-apple-style'),facets=designFacets(record);facets.scenarios.push('creative');facets.tags.length=0;
 assert.deepEqual(designFacets(record).scenarios,['ecommerce','saas','marketing']);assert.deepEqual(designFacets(record).tags,['brand-inspired']);
 const input=[{slug:'z',title:'Z'},{slug:'a',title:'A'}];assert.deepEqual(slugs(filterCatalog(input,{sort:'name'})),['a','z']);assert.deepEqual(slugs(filterCatalog(input,{sort:'recommended'})),['z','a']);assert.deepEqual(slugs(input),['z','a']);
 // A local website cannot silently recategorize the source it replaces.
 assert.equal(designFacets({...websites[0],studio:{...websites[0].studio,styleType:'layout',scenarios:[],tags:[]}}).styleType,'visual');
});
