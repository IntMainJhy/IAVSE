import test from 'node:test';
import assert from 'node:assert/strict';
import {mergePublicSkills,findPublicSkill,filterPublicSkills,normalizePublicSkillTools} from '../src/lib/catalog-public-skills.mjs';
import {curatedSkills} from '../src/lib/skill-catalog.mjs';

const custom=(overrides={})=>({id:'runtime-1',slug:'fresh-design-review',title:'Fresh design review',name:'Fresh design review',repo:'new-author/design-review',category:'design',summary:'Audits responsive layout and visual hierarchy.',tags:['Responsive','界面'],sourceUrl:'https://github.com/new-author/design-review',installUrl:'https://github.com/new-author/design-review',installCommand:'npx skills add new-author/design-review',license:'MIT',tools:['Codex','Claude Code'],recommended:true,recommendation:'Use when reviewing navigation consistency and compact search interfaces.',...overrides});

test('public directory preserves all curated modules and merges reviewed snapshots with real recommendations',()=>{
 const result=mergePublicSkills(curatedSkills,[custom()]);assert.equal(result.length,curatedSkills.length+1);
 for(const entry of curatedSkills)assert.ok(result.some(item=>item.id===entry.id&&item.slug===entry.id));
 const runtime=findPublicSkill('fresh-design-review',result);assert.equal(runtime.origin,'reviewed');assert.equal(runtime.featured,true);assert.equal(runtime.recommendation,custom().recommendation);assert.deepEqual(runtime.tools.map(tool=>tool.id),['codex','claude-code']);assert.equal(findPublicSkill('runtime-1',result).slug,'fresh-design-review');
 assert.equal(findPublicSkill('missing',result),null);
});

test('repo, slug and id collisions cannot shadow static or earlier approved entries',()=>{
 const duplicateRepo=custom({id:'repo-duplicate',slug:'new-slug',repo:curatedSkills[0].repo.toUpperCase()}),duplicateSlug=custom({id:'slug-duplicate',slug:curatedSkills[0].id}),duplicateId=custom({id:curatedSkills[0].id,slug:'alternate-slug'});
 assert.equal(mergePublicSkills(curatedSkills,[duplicateRepo,duplicateSlug,duplicateId]).length,curatedSkills.length);
 const rows=mergePublicSkills(curatedSkills,[custom(),custom({id:'runtime-2',slug:'another-slug'})]);assert.equal(rows.length,curatedSkills.length+1);
 assert.equal(mergePublicSkills(curatedSkills,[custom({slug:'../unsafe'})]).length,curatedSkills.length);
});

test('runtime searches include recommendation, category, multilingual tags and normalized tool filters',()=>{
 const result=mergePublicSkills([], [custom()]);
 assert.equal(filterPublicSkills(result,{q:'navigation compact',category:'design',tool:'codex'}).length,1);
 assert.equal(filterPublicSkills(result,{q:'界面',tool:'claude-code'}).length,1);
 assert.equal(filterPublicSkills(result,{q:'ｒｅｓｐｏｎｓｉｖｅ'}).length,1);
 assert.equal(filterPublicSkills(result,{tool:'cursor'}).length,0);assert.equal(filterPublicSkills(result,{category:'testing'}).length,0);
 assert.equal(filterPublicSkills(result,{q:'not-present'}).length,0);
 assert.deepEqual(normalizePublicSkillTools(['codex-cli','codex-app','claude','Gemini CLI','unknown']).map(tool=>tool.id),['codex','claude-code','gemini-cli']);
});
