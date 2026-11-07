import assert from 'node:assert/strict';
import vibeui from '../src/lib/design-imports/vibeui.json' with {type:'json'};
const base=(process.env.TEST_PUBLIC_URL||'http://127.0.0.1:3008').replace(/\/$/,'');
const page=async(path,status=200)=>{const response=await fetch(base+path,{headers:{cookie:'site-locale=zh'}});assert.equal(response.status,status,path);return response.text()};
const skills=await page('/skills?collection=vibeui&page=2');
assert.equal((skills.match(/<li class="skill-entry">/g)||[]).length,36);
assert.match(skills,/\/skills\?collection=vibeui&amp;page=3/);
assert.match(skills,/收录 242 项/);
const stylekit=await page('/skills/stylekit?collection=stylekit');
assert.match(stylekit,/npx skills@latest add AnxForever\/stylekit-skill/);
assert.match(stylekit,/href="\/skills\?collection=stylekit"/);
assert.match(stylekit,/93b9c1de903a6c3f6f7944224b26d154b325e1eb\/LICENSE/);
for(const slug of ['vibeui-figma-use','vibeui-remotion-best-practices','web-design-guidelines']){
 const html=await page('/skills/'+slug);
 const installation=html.split('id="installation"')[1]?.split('</section>')[0];
 assert.ok(installation);assert.ok(!installation.includes('skill-command'),slug+' must not display an unverified installation command');
}
const restricted=vibeui.filter(e=>e.previewPolicy==='external-only');
for(let index=0;index<restricted.length;index+=6)await Promise.all(restricted.slice(index,index+6).map(entry=>page('/resources/designs/'+entry.slug+'/preview',404)));
const external=await page('/resources/designs/'+restricted[0].slug);
assert.match(external,/在原站查看/);assert.ok(!external.includes('<iframe'));assert.ok(!external.includes('design-preview-trigger'));
const claude=await page('/resources/designs/vibeui-claude');
assert.match(claude,/VoltAgent/);assert.match(claude,/风格参考/);assert.match(claude,/claude\.ai/);
const preview=await fetch(base+'/resources/designs/vibeui-claude/preview');
assert.equal(preview.status,200);assert.ok(preview.headers.get('content-security-policy').includes('https://vibeui.top'));
assert.ok(!preview.headers.get('content-security-policy').includes('yuanfu8899.github.io'));
console.log(JSON.stringify({skillsPagination:true,verifiedInstall:true,restrictedSkillInstallations:3,restrictedUIPreviews:restricted.length,distinctAttribution:true}));
