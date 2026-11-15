// Read-only SSR checks against the running site. No account or content writes.
import assert from 'node:assert/strict';
const base=process.env.THEME_TEST_URL||'http://127.0.0.1:3008';
const routes=['/','/resources','/resources?type=skills','/community','/docs','/blogs','/login','/workspace/account','/workspace/blog','/admin','/admin/community','/about','/legal/privacy','/downloads','/blogs/showcase/lin-studio'];
for(const style of ['fly','brand','anime','classic'])for(const route of routes){
 const response=await fetch(base+route,{headers:{cookie:`iavse-home-style=${style}; site-locale=zh`}});
 assert.equal(response.status,200,route);
 const html=await response.text(),root=html.match(/<html\b[^>]*>/)?.[0]||'';
 assert.ok(root.includes(`data-site-style="${style}"`),route+' restores the requested world in its first response');
 assert.ok(root.includes(`data-color-mode="${['brand','classic'].includes(style)?'light':'dark'}"`),route+' uses matching legacy appearance');
 assert.ok(html.includes('class="home-style-trigger"'),route+' offers the shared selector');
 if(html.includes('data-rbp-route='))assert.ok(html.includes(`class="rbp-surface${['brand','classic'].includes(style)?'':' dark'}"`),route+' server surface matches its root before hydration');
}
for(const invalid of ['','monochrome','constructor']){
 const response=await fetch(base+'/resources',{headers:{cookie:`iavse-home-style=${invalid}; site-ui=monochrome`}}),html=await response.text();
 assert.ok(html.match(/<html\b[^>]*>/)?.[0].includes('data-site-style="anime"'),'unsupported preferences fall back to the selected anime UI');
}
const protectedResponse=await fetch(base+'/api/admin/community/accounts',{headers:{cookie:'iavse-home-style=brand; site-ui=monochrome'}});
assert.ok([401,403].includes(protectedResponse.status),'An appearance preference cannot grant authentication');
console.log('PASS: 60 route/style combinations restore one shared selection and control; invalid preferences stay bounded and grant no access.');

const classicDark=await fetch(base+'/resources',{headers:{cookie:'iavse-home-style=classic; site-color-mode=dark'}}).then(response=>response.text());
assert.ok(classicDark.match(/<html\b[^>]*>/)?.[0].includes('data-color-mode="dark"'),'original UI keeps its stored dark appearance');
