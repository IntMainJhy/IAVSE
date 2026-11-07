import assert from 'node:assert/strict';
import {studioPages,studioComponentEntries} from '../src/lib/design-studio.mjs';
const base=(process.env.TEST_PUBLIC_URL||'http://127.0.0.1:3008').replace(/\/$/,'');
const get=async(path,status=200)=>{const r=await fetch(base+path,{headers:{cookie:'site-locale=zh'}});assert.equal(r.status,status,path);return r.text()};
const list=await get('/resources?type=designs');assert.ok(list.includes('网站参考重做'));assert.ok(list.includes('studio-linear'));assert.ok(list.includes('VibeUI'));assert.ok(list.includes('StyleKit'));assert.equal((list.match(/class="design-card"/g)||[]).length,9);
const components=await get('/resources?type=designs&collection=studio&view=components');assert.equal((components.match(/class="design-card"/g)||[]).length,24);
for(const entry of studioPages){const html=await get('/resources/designs/'+entry.slug+'/preview');assert.ok(html.includes('data-reference-study="'+entry.studio.referenceKey+'"'),entry.slug);assert.ok(html.includes(entry.referenceSite.url.replaceAll('&','&amp;')));assert.ok(!html.includes('src="https://vibeui.top'));const detail=await get('/resources/designs/'+entry.slug);assert.ok(detail.includes('查看参考网站'));assert.ok(detail.includes('component-prompts'))}
for(const slug of ['studio-stylekit-editorial','studio-vibeui-claude','studio-iavse-enterprise-data','linear-precision','notion-paper-workspace'])await get('/resources/designs/'+slug+'/preview',404);
for(const entry of studioComponentEntries){const html=await get('/resources/designs/'+entry.slug+'/preview');assert.ok(html.includes('component-library-preview'))}
console.log(JSON.stringify({websiteBackedPages:9,standaloneComponents:24,removedTemplateRoutes:5,sourceCatalogsRetained:true}));
