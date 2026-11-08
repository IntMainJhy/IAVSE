import test from 'node:test';
import assert from 'node:assert/strict';
import seed from '../src/lib/design-taxonomy-seed.json' with {type:'json'};
import {SCENARIOS,STYLE_TAGS,INDUSTRIES,TAXONOMY_PROVENANCE,designFacets,catalogPresentationEntries,filterCatalog} from '../src/lib/design-taxonomy.mjs';

const templates=[
 {slug:'project-atlas',title:'Atlas',summary:'A portfolio starter',category:'通用',tags:['portfolio'],source:{name:'A Studio'},creator:{name:'Anne'},license:{name:'MIT'},template:{kind:'project',stack:['Astro','TypeScript'],features:['Content collections'],scenarios:['portfolio','blog'],author:'Anne'}},
 {slug:'page-counter',title:'Counter',summary:'An ecommerce page',category:'通用',tags:['shop'],source:{name:'B Studio'},template:{kind:'page',stack:['HTML','CSS'],features:['Product variant selector'],scenarios:['ecommerce'],author:'Bao'}},
 {slug:'system-dots',title:'Dots',summary:'Interactive design rules',category:'通用',tags:[],source:{name:'C Studio'},template:{kind:'design-system',stack:['HTML'],features:['Tokens and components'],scenarios:['docs'],author:'Chen'}},
];
const slugs=items=>items.map(item=>item.slug);

test('template facets use the shared scenario vocabulary without mutating it',()=>{
 const before=structuredClone(seed);
 assert.equal(new Set(SCENARIOS.map(item=>item.id)).size,SCENARIOS.length);
 assert.ok(SCENARIOS.some(item=>item.id==='portfolio'));
 assert.deepEqual(designFacets(templates[0]).scenarios,['portfolio','blog']);
 assert.deepEqual(seed,before);
});

test('only real template records are presented, without aliasing matching sources',()=>{
 const original=[...templates,{slug:'old-rewrite',studio:{kind:'website',sourceSlug:'stylekit-apple-style'}},{slug:'stylekit-apple-style',summary:'Old source discovery record'}];
 const before=structuredClone(original);
 assert.deepEqual(slugs(catalogPresentationEntries(original)),slugs(templates));
 assert.deepEqual(original,before);
 assert.deepEqual(slugs(catalogPresentationEntries([...original,templates[0],null,{}, {slug:'missing-kind',template:{}}])),slugs(templates));
 assert.equal(filterCatalog(original,{collection:'all'}).length,3);
 for(const kind of ['project','page','design-system'])assert.equal(filterCatalog(original,{collection:kind}).length,1);
 const distinct={...templates[0],slug:'project-other'};assert.equal(catalogPresentationEntries([templates[0],distinct]).length,2);
});

test('template scenarios take priority over old style references and remain explicit',()=>{
 const entry={...templates[0],slug:'stylekit-pixel-art',studio:{sourceSlug:'stylekit-apple-style'}};
 assert.deepEqual(designFacets(entry).scenarios,['portfolio','blog']);
 assert.deepEqual(designFacets({...entry,template:{...entry.template,scenarios:undefined}}).scenarios,[]);
 const facets=designFacets(entry);facets.scenarios.push('creative');assert.deepEqual(designFacets(entry).scenarios,['portfolio','blog']);
});

test('kind, explicit scenario, stack/function/author search, favorites and sorting combine',()=>{
 assert.deepEqual(slugs(filterCatalog(templates,{collection:'project',scenario:'portfolio',q:'ＡＳＴＲＯ',favorites:'1'},['project-atlas'])),['project-atlas']);
 assert.deepEqual(slugs(filterCatalog(templates,{q:'variant selector'})),['page-counter']);
 assert.deepEqual(slugs(filterCatalog(templates,{q:'Chen'})),['system-dots']);
 assert.deepEqual(slugs(filterCatalog(templates,{q:'MIT'})),['project-atlas']);
 assert.deepEqual(filterCatalog(templates,{collection:'project',scenario:'ecommerce'}),[]);
 assert.deepEqual(filterCatalog(templates,{favorites:'1'},[]),[]);
 const reverse=[...templates].reverse();assert.deepEqual(slugs(filterCatalog(reverse,{sort:'name'})),slugs(templates));assert.deepEqual(slugs(filterCatalog(reverse)),slugs(reverse));
});

test('malformed input never exposes source discovery records as templates',()=>{
 for(const filters of [{collection:'stylekit'},{collection:'missing'},{scenario:'missing'}])assert.deepEqual(filterCatalog(templates,filters),[]);
 for(const filters of [null,undefined,{}, {collection:'all',scenario:'all'}, {q:{},scenario:[]}])assert.equal(filterCatalog(templates,filters).length,3);
 assert.deepEqual(filterCatalog(null),[]);assert.deepEqual(catalogPresentationEntries([null,{}]),[]);
 assert.doesNotThrow(()=>filterCatalog(templates,{favorites:'1'},{}));
});
