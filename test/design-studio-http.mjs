import assert from 'node:assert/strict';
import {studioPages,studioComponentEntries} from '../src/lib/design-studio.mjs';
const base=(process.env.TEST_PUBLIC_URL||'http://127.0.0.1:3008').replace(/\/$/,'');
const get=async path=>{const r=await fetch(base+path,{headers:{cookie:'site-locale=zh'}});assert.equal(r.status,200,path);return r.text()};
const list=await get('/resources?type=designs');assert.ok(list.includes('IAVSE 自研'));assert.ok(list.includes('studio-stylekit-editorial'));assert.ok(list.includes('VibeUI'));assert.ok(list.includes('StyleKit'));
const components=await get('/resources?type=designs&collection=studio&view=components');assert.equal((components.match(/class="design-card"/g)||[]).length,24);assert.ok(components.includes('studio-component-dialog'));
const cases=[...new Map(studioPages.map(e=>[e.studio.layout,e])).values()];
for(const entry of [...cases,...studioComponentEntries]){
 const html=await get('/resources/designs/'+entry.slug+'/preview');assert.ok(html.includes('design-studio-preview'),entry.slug);assert.ok(!html.includes('src="https://vibeui.top'),entry.slug);assert.ok(!html.includes('src="https://yuanfu8899'),entry.slug);
}
const detail=await get('/resources/designs/studio-stylekit-editorial');assert.ok(detail.includes('component-prompts'));assert.ok(detail.includes('复制组件提示词'));assert.ok(detail.includes('/resources/designs/stylekit-editorial'));
const specific=await get('/resources/designs/studio-stylekit-editorial/preview?component=table');assert.ok(specific.includes('项目明细'));assert.ok(specific.includes('查找项目'));
const skills=await get('/skills');assert.ok(!skills.includes('skill-source-collection'));assert.ok(!skills.includes('aria-label="收录平台"'));assert.ok(skills.includes('skill-upstream'));
console.log(JSON.stringify({pageStructures:cases.length,components:studioComponentEntries.length,referenceComparison:true,componentPrompts:true,sourceCatalogsRetained:true,skillCollectorLabelsRemoved:true}));
