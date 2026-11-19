import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import JSZip from 'jszip';
import vm from 'node:vm';
import ts from 'typescript';
import {creatorSkills} from '../src/lib/creator-skills.mjs';
import {curatedSkills} from '../src/lib/skill-catalog.mjs';
import {getSkillDetail} from '../src/lib/skill-details.mjs';
import {mergePublicSkills,findPublicSkill} from '../src/lib/catalog-public-skills.mjs';
import {creatorPicks,websitePicks} from '../src/lib/creator-picks.mjs';

test('the selected skills have complete, licensed download folders with pinned provenance and valid integrity records',async()=>{
 const manifest=JSON.parse(await fs.readFile(new URL('../public/skills/creator/manifest.json',import.meta.url),'utf8'));
 assert.deepEqual(manifest.packages.map(item=>item.id),creatorSkills.map(item=>item.id));
 for(const item of manifest.packages){
  const skill=creatorSkills.find(skill=>skill.id===item.id),bytes=await fs.readFile(new URL('../public'+item.url,import.meta.url));
  assert.equal(bytes.length,item.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
  const zip=await JSZip.loadAsync(bytes),names=Object.keys(zip.files);
  assert.ok(names.every(name=>name.startsWith(item.id+'/')));
  assert.ok(names.every(name=>!/(^|\/)(?:\.env(?:\.|$)|node_modules|\.git|__pycache__)(?:\/|$)/.test(name)));
  assert.match(await zip.file(item.id+'/SKILL.md').async('string'),new RegExp('name: '+item.id));
  assert.match(await zip.file(item.id+'/LICENSE').async('string'),/MIT License/);
  const source=JSON.parse(await zip.file(item.id+'/SOURCE.json').async('string'));
  assert.equal(source.commit,skill.commit);assert.equal(source.repository,'https://github.com/'+skill.repo);
  assert.ok(!JSON.stringify(source).includes('/Users/'));
  if(item.id==='brand-identity')assert.ok(zip.file(item.id+'/THIRD_PARTY_NOTICES.md'));
  const detail=getSkillDetail(item.id);assert.equal(detail.packageDownload,item.url);assert.ok(detail.features.length>=2);assert.equal(detail.prompts.length,2);
 }
});

test('a reviewed package keeps its current revision when an older collection entry is merged and its old address still resolves',()=>{
 const current=creatorSkills.find(skill=>skill.id==='hallmark');
 const old={id:'vibeui-hallmark',slug:'vibeui-hallmark',repo:current.repo,sourceUrl:'https://github.com/'+current.repo+'/blob/407fa689f4a276f2fd389208d271d0fef08f5058/skills/hallmark/SKILL.md',commit:'407fa689f4a276f2fd389208d271d0fef08f5058',collection:{name:'VibeUI',url:'https://vibeui.top/'}};
 const catalog=mergePublicSkills(curatedSkills,[],[old]),hallmark=findPublicSkill('hallmark',catalog);
 assert.equal(catalog.filter(skill=>skill.repo===current.repo).length,1);
 assert.equal(hallmark.commit,current.commit);assert.equal(hallmark.verifiedAt,'2026-11-19');
 assert.equal(findPublicSkill('vibeui-hallmark',catalog),hallmark);
 assert.ok(hallmark.collections.some(item=>item.name==='VibeUI'));
});

test('featured picks use genuine detail pages and known website destinations, and explicit owner recommendations take priority',()=>{
 assert.equal(creatorPicks.length,4);
 for(const pick of creatorPicks){assert.ok(getSkillDetail(pick.id));assert.equal(pick.href,'/skills/'+pick.id);assert.ok(pick.summary&&pick.kind&&pick.emoji);}
 const picks=websitePicks();assert.deepEqual(picks.map(item=>item.id),['reactbits','gsap','shadcn','mdn']);
 assert.ok(picks.every(item=>new URL(item.href).protocol==='https:'));
 const own={id:'own',title:'Recommended site',url:'https://example.org/',summary:'A saved public recommendation.',featured:true};
 assert.equal(websitePicks([own]).at(0).href,own.url);
});

test('an old collection detail address redirects to the selected skill before trying to render an unknown definition',async()=>{
 const current=creatorSkills.find(skill=>skill.id==='hallmark'),catalog=mergePublicSkills(curatedSkills,[],[{id:'vibeui-hallmark',slug:'vibeui-hallmark',repo:current.repo,sourceUrl:current.sourceUrl}]);
 const source=await fs.readFile(new URL('../src/components/SkillDetail.tsx',import.meta.url),'utf8'),exports={};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:name=>{
  if(name.includes('request-catalog'))return{readRequestSkills:()=>catalog};
  if(name.includes('catalog-public-skills'))return{findPublicSkill};
  if(name.includes('skill-details'))return{getSkillDetail};
  if(name==='next/navigation')return{redirect:href=>{throw Error('REDIRECT:'+href)},notFound:()=>{throw Error('NOT_FOUND')}};
  return{};
 }});
 await assert.rejects(exports.SkillDetail({id:'vibeui-hallmark'}),/REDIRECT:\/skills\/hallmark/);
});
