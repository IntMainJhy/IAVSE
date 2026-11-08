import assert from 'node:assert/strict';
import entries from '../src/lib/template-library.json' with {type:'json'};
import sites from '../src/lib/template-sites-manifest.json' with {type:'json'};
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3008';
let checked=0;
async function get(path){const response=await fetch(base+path);assert.equal(response.status,200,path);checked++;return response}
const directory=await (await get('/resources?type=designs')).text();
for(const label of ['完整开源项目','页面模板','设计规范预览'])assert.ok(directory.includes(label));
for(const label of ['本站重写','授权引用','设计目录分页','下一页'])assert.ok(!directory.includes(label),label);
assert.equal((directory.match(/<iframe\b/g)||[]).length,0,'directory never loads idle live previews');
assert.equal((directory.match(/data-template-slug=/g)||[]).length,24,'first response stays bounded');
for(const item of sites.templates){
 const response=await get('/template-sites/'+item.slug),html=await response.text(),policy=response.headers.get('content-security-policy');
 assert.ok(html.includes(item.entry),item.slug);assert.match(policy,/script-src 'self';/);assert.match(policy,/frame-ancestors 'self'/);assert.equal(response.headers.get('x-frame-options'),'SAMEORIGIN');
 assert.doesNotMatch(html,/_next\/static|iavse-quantum/);
}
for(const entry of entries.filter(entry=>entry.template.kind==='design-system'))for(const variant of entry.previewVariants){
 const response=await get(variant.url),html=await response.text();assert.match(response.headers.get('content-security-policy'),/sandbox allow-scripts/);assert.match(html,/Copyright \(c\) 2026 VoltAgent/);assert.doesNotMatch(html,/<script\b/i);
}
await get('/template-sites/editorial-profile-archive/work/quiet-system');
for(const slug of ['template-brutal-landing','voltagent-claude','template-anx-portfolio']){
 const html=await (await get('/resources/designs/'+slug)).text();assert.ok(html.includes('GitHub')&&html.includes('MIT'));assert.equal((html.match(/<iframe\b/g)||[]).length,0,'details start without heavy previews');
}
for(const old of ['website-apple','stylekit-minimalist-flat','vibeui-claude','website-stylekit-acid-graphics'])assert.equal((await fetch(base+'/resources/designs/'+old)).status,404,old);
for(const entry of entries.filter(entry=>entry.image)){
 const response=await get(entry.image);assert.match(response.headers.get('content-type'),/image\/webp/);assert.match(response.headers.get('cache-control'),/max-age=86400/);
}
console.log(JSON.stringify({httpChecks:checked,templates:sites.templates.length,sourceVariants:108,staticCovers:entries.filter(entry=>entry.image).length,retiredRoutes:4,idleIframes:0}));
