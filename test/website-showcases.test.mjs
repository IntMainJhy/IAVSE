import test from 'node:test';
import assert from 'node:assert/strict';
import styles from '../src/lib/design-imports/stylekit.json' with {type:'json'};
import {websiteReferences,websiteShowcases} from '../src/lib/website-showcases.mjs';
import {SCENARIOS,STYLE_TAGS,designFacets,catalogPresentationEntries} from '../src/lib/design-taxonomy.mjs';

const expected=['apple','stripe','editorial','brutalist','swiss','minimal','glass','bento','organic','pixel','cyber','dark'];
const filled=value=>typeof value==='string'&&value.trim().length>0;

test('the twelve complete websites retain exact source identities without replacing source records',()=>{
 assert.equal(websiteReferences.length,12);assert.equal(websiteShowcases.length,12);assert.deepEqual(new Set(websiteReferences.map(item=>item.key)),new Set(expected));
 assert.equal(new Set(websiteShowcases.map(item=>item.studio.sourceSlug)).size,12);
 for(const entry of websiteShowcases){
  const source=styles.find(item=>item.slug===entry.studio.sourceSlug);assert.ok(source,entry.slug);
  assert.equal(entry.studio.kind,'website');assert.equal(entry.external,false);assert.equal(entry.previewPolicy,'embed');assert.equal(entry.websiteUrl,'/resources/designs/'+entry.slug+'/preview');
  assert.match(entry.referenceSite.url,/^https:\/\//);assert.ok(entry.referenceUrls.length>=2);assert.ok(entry.referenceUrls.some(item=>item.url.includes('stylekit.top/zh/styles/')));
  assert.ok(entry.prompt.length>=500,entry.slug+' full prompt');assert.notEqual(entry.prompt,source.prompt);assert.notEqual(entry.specification,source.specification);
  assert.equal(designFacets(entry).styleType,designFacets(source).styleType);assert.deepEqual(designFacets(entry).scenarios,designFacets(source).scenarios);
  assert.ok(entry.studio.interactions.length>=2,entry.slug+' working interactions');assert.ok(entry.studio.observations.length>=3,entry.slug+' concrete observations');
 }
 assert.equal(catalogPresentationEntries([...websiteShowcases,...styles]).length,149);assert.equal(styles.length,149);
});

test('each website supplies usable color, typography, spacing, layout and responsive design specifications',()=>{
 for(const reference of websiteReferences){
  const entry=websiteShowcases.find(item=>item.studio.websiteKey===reference.key),details=entry.studio.designDetails;
  assert.ok(details.colorRoles.length>=4,entry.slug+' colors');for(const color of details.colorRoles)for(const key of ['role','hex','usage'])assert.ok(filled(color[key]),entry.slug+' color '+key);
  assert.ok(details.typography.length>=3,entry.slug+' typography');for(const type of details.typography)for(const key of ['role','family','size','weight','lineHeight'])assert.ok(filled(String(type[key]??'')),entry.slug+' typography '+key);
  assert.ok(details.spacing.length>=3,entry.slug+' spacing');for(const space of details.spacing)for(const key of ['token','value','usage'])assert.ok(filled(space[key]),entry.slug+' spacing '+key);
  for(const key of ['designFocus','layoutRules','responsive','motion','do','dont'])assert.ok(Array.isArray(details[key])&&details[key].length>=1&&details[key].every(filled),entry.slug+' '+key);
  for(const heading of ['## 颜色分类与使用角色','## 字体与排版','## 空间与尺寸','## 页面布局','## 响应式规则','## 动效与交互'])assert.ok(entry.specification.includes(heading),entry.slug+' '+heading);
  assert.ok(entry.studio.componentIds.length>=3,entry.slug+' components');
  for(const id of entry.studio.componentIds){const prompt=entry.studio.componentPrompts[id];assert.ok(filled(prompt)&&prompt.length>=100,entry.slug+' '+id+' prompt')}
  assert.ok((reference.scenarios||[]).every(id=>SCENARIOS.some(item=>item.id===id)));assert.ok((reference.styleTags||[]).every(id=>STYLE_TAGS.some(item=>item.id===id)));
 }
 assert.equal(new Set(websiteShowcases.map(item=>item.prompt)).size,12);
});
