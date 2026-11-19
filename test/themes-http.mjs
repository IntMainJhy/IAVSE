// Read-only SSR checks against the running site. No account or content writes.
import assert from 'node:assert/strict';
import {parseDocument,DomUtils} from 'htmlparser2';

const base=process.env.THEME_TEST_URL||'http://127.0.0.1:3008';
const routes=['/','/resources','/resources?type=skills','/community','/docs','/blogs','/login','/workspace/account','/workspace/blog','/admin','/admin/community','/about','/legal/privacy','/downloads','/blogs/showcase/lin-studio'];
const find=(document,predicate)=>DomUtils.findAll(node=>node.type==='tag'&&predicate(node),document.children);
const classes=node=>(node.attribs.class||'').split(/\s+/);
const primaryHrefs=['/','/community','/blogs','/about'];
const read=async(route,cookie)=>{
 const response=await fetch(base+route,{headers:{cookie}});
 assert.equal(response.status,200,route);
 return parseDocument(await response.text());
};
function assertPlainRoot(document,label){
 const root=find(document,node=>node.name==='html')[0];assert.ok(root,label+' has a server-rendered document');
 assert.equal(root.attribs['data-site-style'],'brand',label+' uses the plain public appearance');
 assert.equal(root.attribs['data-home-style'],'brand',label+' normalizes the legacy appearance identifier');
 assert.equal(root.attribs['data-color-mode'],'light',label+' starts with the light surface before hydration');
 assert.equal(find(document,node=>classes(node).includes('home-style-trigger')||Object.hasOwn(node.attribs,'data-style-option')).length,0,label+' has no retired appearance picker');
 const surface=find(document,node=>classes(node).includes('rbp-surface'))[0];
 if(surface)assert.ok(!classes(surface).includes('dark'),label+' server surface matches the document appearance');
}
let combinations=0;
for(const preference of ['fly','brand','anime','classic'])for(const route of routes){
 const document=await read(route,`iavse-home-style=${preference}; site-color-mode=dark; site-locale=zh`),label=`${route} (${preference})`;
 assertPlainRoot(document,label);
 const owned=/^\/(?:admin(?:\/|$)|workspace\/blog(?:\/|$)|blogs\/showcase(?:\/|$))/.test(route);
 const headers=find(document,node=>Object.hasOwn(node.attribs,'data-iavse-header'));
 assert.equal(headers.length,owned?0:1,label+' keeps the route-owned chrome boundary');
 if(!owned){
  const header=headers[0],nav=find(header,node=>node.name==='nav')[0];
  assert.deepEqual(find(nav,node=>node.name==='a').map(node=>node.attribs.href),primaryHrefs,label+' exposes the same four functional destinations');
  assert.equal(find(header,node=>classes(node).some(name=>name.startsWith('glass-switch')||name==='iavse-header__more')).length,0,label+' has one plain header without glass or a second settings panel');
  assert.equal(find(header,node=>classes(node).includes('language-control')).length,1,label+' retains language selection');
  for(const href of ['https://github.com/IntMainJhy/IAVSE','https://atomgit.com/InMainJhy/IAVSE'])assert.equal(find(header,node=>node.name==='a'&&node.attribs.href===href).length,1,label+' retains '+href);
  const active=find(nav,node=>node.attribs['aria-current']==='page').map(node=>node.attribs.href);
  const expected=route==='/'||/^\/(?:resources|docs|skills)(?:[/?]|$)/.test(route)?'/':route==='/community'?'/community':route==='/blogs'?'/blogs':route==='/about'?'/about':null;
  assert.deepEqual(active,expected?[expected]:[],label+' marks only the current primary destination');
 }
 if(route==='/'||route==='/resources'||route==='/resources?type=skills'){
  const kind=route.includes('type=skills')?'skills':'designs';
  assert.equal(find(document,node=>node.attribs['data-resource-kind']===kind).length,1,label+' opens the requested directory immediately');
  assert.equal(find(document,node=>Object.hasOwn(node.attribs,'data-home-hero')).length,0,label+' has no promotional entry scene');
 }
 combinations++;
}
for(const invalid of ['','monochrome','constructor']){
 const document=await read('/resources',`iavse-home-style=${invalid}; site-ui=monochrome`);
 assertPlainRoot(document,`unsupported preference ${JSON.stringify(invalid)}`);
}
const protectedResponse=await fetch(base+'/api/admin/community/accounts',{headers:{cookie:'iavse-home-style=brand; site-ui=monochrome'}});
assert.ok([401,403].includes(protectedResponse.status),'an appearance preference cannot grant authentication');
const legacyDark=await read('/resources','iavse-home-style=classic; site-color-mode=dark; iavse-classic-color-mode=dark');
assertPlainRoot(legacyDark,'stored legacy dark preference');
console.log(`PASS: ${combinations} route/preference combinations render the plain public website, preserve functional chrome and keep authentication boundaries.`);
