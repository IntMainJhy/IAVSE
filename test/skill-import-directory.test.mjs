import test from 'node:test';
import assert from 'node:assert/strict';
import vibeui from '../src/lib/skill-imports/vibeui.json' with {type:'json'};
import stylekit from '../src/lib/skill-imports/stylekit.json' with {type:'json'};
import audit from '../src/lib/skill-imports/vibeui-audit.json' with {type:'json'};
import references from '../src/lib/skill-imports/vibeui-references.json' with {type:'json'};
import {curatedSkills,skillCategories,skillFilterHref} from '../src/lib/skill-catalog.mjs';
import {mergePublicSkills,filterPublicSkills} from '../src/lib/catalog-public-skills.mjs';
import {mergeImportedSkills,skillDefinitionKey,skillCollectionIds,skillPage,skillCollectionFilter} from '../src/lib/skill-import-directory.mjs';

test('each collected input has an audit disposition; only verified Skill definitions and collections enter the catalog',()=>{
 assert.equal(audit.inputCount,341);assert.equal(audit.entries.length,341);
 assert.equal(new Set(audit.entries.map(e=>e.collectionEntryId)).size,341);
 assert.equal(vibeui.length,227);assert.equal(stylekit.length,1);assert.equal(references.length,20);
 const mapped=new Set([...vibeui,...references].map(e=>e.id));
 for(const row of audit.entries){assert.ok(row.reason,row.collectionEntryId);if(row.catalogId)assert.ok(mapped.has(row.catalogId),row.collectionEntryId)}
 for(const row of [...vibeui,...stylekit]){
  assert.equal(row.sourceStatus,'verified',row.id);assert.ok(['single','collection'].includes(row.kind));
  assert.ok(skillCategories.some(c=>c.id===row.category),row.id);
  assert.match(row.commit,/^[a-f0-9]{40}$/);assert.ok(row.sourceUrl.includes('/blob/'+row.commit+'/'));
  if(row.kind==='single')assert.match(row.sourceUrl,/\/SKILL\.md$/i);
  assert.ok(row.summary&&row.provenance.note&&row.collection.name);
  assert.equal('body' in row,false);assert.equal('content' in row,false);
  if(row.installCommand){assert.equal(row.licenseStatus,'verified');assert.equal(row.id,'stylekit')}
 }
});

test('definition identity ignores revision and SKILL.md filename but preserves independent paths in a repository',()=>{
 const first={id:'a',slug:'a',repo:'Owner/Repo',sourceUrl:'https://github.com/Owner/Repo/blob/main/skills/a/SKILL.md'};
 const imported={id:'import-a',slug:'import-a',repo:'owner/repo',path:'skills/a',skillFile:'skills/a/SKILL.md',collection:{name:'VibeUI',url:'https://vibeui.top/'}};
 assert.equal(skillDefinitionKey(first),skillDefinitionKey(imported));
 const merged=mergeImportedSkills([first],[imported,{...imported,id:'b',slug:'b',path:'skills/b',skillFile:'skills/b/SKILL.md'}]);
 assert.equal(merged.length,2);assert.deepEqual(skillCollectionIds(merged[0]),['iavse','vibeui']);
 assert.equal(skillDefinitionKey({repo:'a/b',sourceUrl:'https://github.com/a/b/blob/main/SKILL.md'}),skillDefinitionKey({repo:'a/b',path:'',skillFile:'SKILL.md'}));
 assert.throws(()=>mergeImportedSkills([first],[{...imported,id:'a',slug:'other',path:'other',skillFile:'other/SKILL.md'}]),/duplicate/);
});

test('source filters expose all imported skills while duplicate curated definitions remain a single entry',()=>{
 const all=mergePublicSkills(curatedSkills,[],[...vibeui,...stylekit]);
 assert.equal(all.length,242);assert.equal(new Set(all.map(skillDefinitionKey)).size,all.length);
 assert.equal(filterPublicSkills(all,{collection:'vibeui'}).length,227);
 assert.equal(filterPublicSkills(all,{collection:'stylekit'}).length,1);
 assert.equal(filterPublicSkills(all,{collection:'iavse'}).length,24);
 const mergedGuidelines=all.find(e=>e.id==='web-design-guidelines');
 assert.equal(mergedGuidelines.licenseStatus,'custom');assert.equal(mergedGuidelines.licenseScope,'readme-declaration');
 assert.match(mergedGuidelines.licenseUrl,/\/README\.md$/);assert.ok(mergedGuidelines.licenseNote);
 assert.equal(filterPublicSkills(all,{q:'StyleKit',collection:'stylekit'})[0].id,'stylekit');
 const pages=[];for(let page=1;page<=7;page++)pages.push(...skillPage(all,page).items);
 assert.deepEqual(pages,all);assert.equal(skillPage(all,1000).page,7);assert.equal(skillPage(all,-2).page,1);
 assert.deepEqual(skillPage([]),{items:[],page:1,pages:1,total:0});
 assert.equal(skillCollectionFilter({collection:['vibeui']}),'all');
 assert.equal(skillFilterHref('design','UI','all','vibeui',2),'/skills?type=design&q=UI&collection=vibeui&page=2');
});

test('custom and unconfirmed Skill licenses remain links, without fabricated install commands',()=>{
 const figma=vibeui.filter(e=>e.license==='Figma Developer Terms');assert.equal(figma.length,7);
 for(const entry of vibeui.filter(e=>e.licenseStatus!=='verified')){assert.equal(entry.installCommand,'');assert.ok(entry.licenseNote)}
 for(const entry of figma){assert.equal(entry.licenseStatus,'custom');assert.match(entry.licenseUrl,/\/skills\/\.curated\/figma-/)}
});
