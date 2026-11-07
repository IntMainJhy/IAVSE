import assert from 'node:assert/strict';
import {studioPages,studioComponentEntries} from '../src/lib/design-studio.mjs';
const base=(process.env.TEST_PUBLIC_URL||'http://127.0.0.1:3008').replace(/\/$/,'');
const get=async(path,status=200)=>{const response=await fetch(base+path,{headers:{cookie:'site-locale=zh'}});assert.equal(response.status,status,path);return response.text()};
const cards=html=>(html.match(/class="design-card"/g)||[]).length;
const list=await get('/resources?type=designs');assert.ok(list.includes('UI 设计图谱'));assert.ok(list.includes('VibeUI'));assert.ok(list.includes('StyleKit'));assert.equal(cards(list),24);assert.ok(list.includes('按场景进入'));assert.ok(list.includes('风格类型'));
for(const[collection,count]of[['studio',12],['interactions',9],['components',24]])assert.equal(cards(await get('/resources?type=designs&collection='+collection)),count,collection);
const legacyComponents=await get('/resources?type=designs&collection=studio&view=components');assert.equal(cards(legacyComponents),24);
const layouts=await get('/resources?type=designs&collection=stylekit&styleType=layout');assert.equal(cards(layouts),18);
const unknown=await get('/resources?type=designs&collection=missing&scenario=missing&styleType=missing');assert.equal(cards(unknown),24);
for(const entry of studioPages){const html=await get('/resources/designs/'+entry.slug+'/preview');assert.ok(html.includes('data-reference-study="'+entry.studio.referenceKey+'"'),entry.slug);assert.ok(html.includes(entry.referenceSite.url.replaceAll('&','&amp;')));const detail=await get('/resources/designs/'+entry.slug);assert.ok(detail.includes('查看参考网站'));assert.ok(detail.includes('component-prompts'))}
for(const slug of ['studio-stylekit-editorial','studio-vibeui-claude','studio-iavse-enterprise-data','linear-precision','notion-paper-workspace'])await get('/resources/designs/'+slug+'/preview',404);
for(const entry of studioComponentEntries){const html=await get('/resources/designs/'+entry.slug+'/preview');assert.ok(html.includes('component-library-preview'))}
console.log(JSON.stringify({defaultPage:24,websites:12,productInteractions:9,standaloneComponents:24,layoutResults:18,removedTemplateRoutes:5,sourceCatalogsRetained:true}));
