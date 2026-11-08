import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3008';
let checks=0;
async function query(input,status=200,origin=new URL(base).origin){
 const response=await fetch(base+'/api/design-catalog',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(input)});
 assert.equal(response.status,status);assert.equal(response.headers.get('cache-control'),'no-store');checks++;
 return response.json();
}
const html=await(await fetch(base+'/resources?type=designs')).text();
assert.equal((html.match(/data-template-slug=/g)||[]).length,24);
assert.ok(!html.includes('voltagent-spacex'),'unloaded metadata does not hide in the RSC payload');
assert.equal((html.match(/<iframe\b/g)||[]).length,0);
const all=[];let cursor=null,total=0;
do{const page=await query({cursor});total=page.total;assert.ok(page.items.length<=24);all.push(...page.items.map(item=>item.slug));cursor=page.nextCursor;}while(cursor);
assert.equal(all.length,total);assert.equal(new Set(all).size,total);
const docs=await query({filters:{scenario:'docs'}});assert.deepEqual(docs.items.map(item=>item.slug),['template-hextra','template-just-docs','template-starlight','template-nextra']);
const favorite=await query({filters:{favorites:'1'},favorites:['template-agency','private-missing','template-agency']});assert.equal(favorite.total,1);assert.equal(favorite.favoriteCount,1);assert.equal(favorite.items[0].slug,'template-agency');
const filtered=await query({filters:{industry:'finance',visual:'gradient',q:'Stripe'}});assert.deepEqual(filtered.items.map(item=>item.slug),['voltagent-stripe']);
const first=await query({});await query({filters:{q:'Claude'},cursor:first.nextCursor},400);
await query({},403,'https://foreign.invalid');await query({filters:{q:'x'.repeat(121)}},400);
console.log(JSON.stringify({apiChecks:checks,templates:total,firstBatch:24,duplicates:0,unloadedMetadataInHtml:false,idleIframes:0}));
