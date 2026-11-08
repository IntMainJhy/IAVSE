import assert from 'node:assert/strict';
import entries from '../src/lib/template-library.json' with {type:'json'};
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3008';
let checked=0;
async function get(path){const response=await fetch(base+path,{headers:{cookie:'site-locale=zh'}});assert.equal(response.status,200,path);checked++;return response}
const directory=await (await get('/resources?type=designs')).text();
for(const label of ['完整开源项目','设计规范预览'])assert.ok(directory.includes(label));
for(const label of ['本站重写','授权引用','设计目录分页','下一页'])assert.ok(!directory.includes(label),label);
assert.equal((directory.match(/<iframe\b/g)||[]).length,0,'directory never loads idle live previews');
assert.equal((directory.match(/data-template-slug=/g)||[]).length,24,'first response stays bounded');
for(const [query,slugs]of [
 ['scenario=docs',['template-hextra','template-just-docs','template-starlight','template-nextra']],
 ['industry=finance',['voltagent-stripe','voltagent-coinbase','voltagent-kraken','voltagent-revolut','voltagent-wise']],
 ['industry=finance&visual=gradient&q=Stripe',['voltagent-stripe']],
]){
 const html=await(await get('/resources?type=designs&'+query)).text();
 assert.deepEqual([...html.matchAll(/data-template-slug="([^"]+)"/g)].map(match=>match[1]),slugs,query);
 assert.match(html,/aria-label="按参考行业筛选"/);assert.match(html,/aria-label="按视觉风格筛选"/);
}
const sourceAudit=await(await get('/catalog-audits/vibeui-112.json')).json();
assert.equal(sourceAudit.entries.length,112);assert.equal(sourceAudit.summary.included,54);assert.equal(sourceAudit.summary.excluded,58);
for(const entry of entries.filter(entry=>entry.template.kind==='design-system'))for(const variant of entry.previewVariants){
 const response=await get(variant.url),html=await response.text();assert.match(response.headers.get('content-security-policy'),/sandbox allow-scripts/);assert.match(html,/Copyright \(c\) 2026 VoltAgent/);assert.doesNotMatch(html,/<script\b/i);
}
for(const slug of ['template-astro-paper','voltagent-claude','template-fuwari']){
 const html=await (await get('/resources/designs/'+slug)).text();assert.ok(html.includes('GitHub')&&html.includes('MIT'));assert.equal((html.match(/<iframe\b/g)||[]).length,0,'details start without heavy previews');
}
for(const id of ['tabler','hextra','just-docs','clean-blog','freelancer','landwind','bigspring','resume','adminkit','agency','starlight','nextra','console','hugo-awesome']){
 const entry=entries.find(item=>item.slug==='template-'+id);
 const preview=await get('/resources/designs/'+entry.slug+'/preview'),html=await preview.text();
 assert.ok(html.includes('src="'+entry.template.upstreamDemoUrl+'"'),id);
 assert.ok(preview.headers.get('content-security-policy').includes(new URL(entry.template.upstreamDemoUrl).origin),id);
 const detail=await(await get('/resources/designs/'+entry.slug)).text();assert.ok(detail.includes('组件提示词')&&detail.includes(entry.template.repository),id);
}
for(const old of ['website-apple','stylekit-minimalist-flat','vibeui-claude','website-stylekit-acid-graphics','template-brutal-landing','template-anx-portfolio'])assert.equal((await fetch(base+'/resources/designs/'+old)).status,404,old);
for(const entry of entries.filter(entry=>entry.image)){
 const response=await get(entry.image);assert.match(response.headers.get('content-type'),/image\/webp/);assert.match(response.headers.get('cache-control'),/max-age=86400/);
 const thumbnail=await get(entry.image.replace('/template-covers/','/template-covers/thumbs/'));assert.match(thumbnail.headers.get('content-type'),/image\/webp/);
}
assert.equal((await fetch(base+'/template-sites/brutal-landing')).status,404);
console.log(JSON.stringify({httpChecks:checked,projects:entries.filter(entry=>entry.template.kind==='project').length,sourceVariants:108,staticCovers:entries.filter(entry=>entry.image).length,retiredRoutes:6,idleIframes:0}));
