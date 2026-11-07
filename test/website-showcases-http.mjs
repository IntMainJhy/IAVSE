import assert from 'node:assert/strict';
import {websiteShowcases} from '../src/lib/website-showcases.mjs';
const base=(process.env.TEST_PUBLIC_URL||'http://127.0.0.1:3008').replace(/\/$/,'');
const get=async path=>{const response=await fetch(base+path,{headers:{cookie:'site-locale=zh'}});assert.equal(response.status,200,path);return response.text()};
const list=await get('/resources?type=designs&collection=studio');assert.equal((list.match(/class="design-card"/g)||[]).length,12);assert.ok(list.includes('预览尺寸'));
for(const entry of websiteShowcases){
 const route='/resources/designs/'+entry.slug,html=await get(route+'/preview'),embedded=await get(route+'/preview?embed=1'),detail=await get(route);
 assert.ok(html.includes('data-website-showcase="'+entry.studio.websiteKey+'"'),entry.slug);assert.ok(html.includes('website-showcase-toolbar'),entry.slug+' standalone reference');
 assert.ok(embedded.includes('data-embedded="true"'),entry.slug);assert.ok(!embedded.includes('class="website-showcase-toolbar"'),entry.slug+' embedded chrome');
 assert.ok(detail.includes('id="design-language"'),entry.slug+' design facts');for(const title of ['配色与颜色角色','字体与排版','布局与空间','响应式规则'])assert.ok(detail.includes(title),entry.slug+' '+title);
 assert.ok(detail.includes('id="component-prompts"'),entry.slug+' component prompts');assert.ok(detail.includes('id="design-prompt"'),entry.slug+' full prompt');
 assert.ok(detail.includes(entry.referenceSite.url.replaceAll('&','&amp;')),entry.slug+' source');
}
const unique=await get('/resources?type=designs&collection=studio&q=website-apple');assert.equal((unique.match(/class="design-card"/g)||[]).length,1);
console.log(JSON.stringify({completeWebsites:websiteShowcases.length,sourceLinks:true,embeddedWithoutDuplicateToolbar:true,designFacts:true,componentPrompts:true}));
