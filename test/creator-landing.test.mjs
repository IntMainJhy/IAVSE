import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseDocument,DomUtils} from 'htmlparser2';
import * as runtime from 'react/jsx-runtime';
import * as experience from '../src/lib/home-experience.mjs';
import * as spatial from '../src/lib/home-spatial.mjs';

const sourceRoot=fileURLToPath(new URL('../src/',import.meta.url));
const motionTag=tag=>({initial,animate,exit,transition,layout,whileInView,viewport,onHoverStart,onHoverEnd,children,...props})=>React.createElement(tag,props,children);
const image=({fill,priority,unoptimized,...props})=>React.createElement('img',props);
const categoryLabels=['UI 设计','AI Skills','文档','网站与工具','法律咨询'];
const categoryHrefs=['/resources?type=designs','/resources?type=skills','/resources?type=docs','/resources?type=resources','/resources/legal-consultation'];
function components(locale='zh',{user=null,pathname='/',style='brand',publicUrl}={}){
 const reads=[],legacyReads=[],linkProps=[];
 const avatar=({name,avatarId})=>React.createElement('span',{'data-avatar-name':name},avatarId?React.createElement('img',{src:'/media/'+encodeURIComponent(avatarId),alt:''}):null);
 // Keep the real home, hub and tabs; replace only the database-backed directory boundary.
 const directory=kind=>async props=>{
  reads.push({kind,...props});
  return React.createElement('section',{'data-resource-directory':kind},React.createElement('h1',null,{designs:'UI 设计',skills:'AI Skills',docs:'文档',resources:'网站与工具'}[kind]),await serverTree(props.navigation));
 };
 const modules={
  react:React,'react/jsx-runtime':runtime,
  'next/link':{useLinkStatus:()=>({pending:false}),default:({prefetch,scroll,children,...props})=>{linkProps.push({href:props.href,prefetch,scroll});return React.createElement('a',props,children);}},
  'next/image':{default:image},
  'next/navigation':{usePathname:()=>pathname,useRouter:()=>({refresh:()=>{}})},
  'lucide-react':new Proxy({},{get:()=>()=>null}),
  'motion/react':{useReducedMotion:()=>true,motion:new Proxy({},{get:(_,tag)=>motionTag(tag)}),LayoutGroup:({children})=>children,AnimatePresence:({children})=>children},
  '@/lib/home-experience.mjs':experience,
  './HomeStyleProvider':{useHomeStyle:()=>({style,select:()=>{},saved:true})},
  '@/lib/landing-content.mjs':{loadLandingContent:async(...args)=>{legacyReads.push(args);return{posts:[],works:[],space:null,communityUnavailable:false};}},
  '@/lib/legal-consultation.mjs':{LEGAL_CONSULTATION_PATH:'/resources/legal-consultation'},
  '@/lib/server-i18n':{serverI18n:async()=>({t:value=>value,locale})},
  './DesignLibrary':{DesignLibrary:directory('designs')},
  './LearningPages':{DocsPage:directory('docs'),SkillsPage:directory('skills')},
  './SharedCatalog':{ResourcesPage:directory('resources')},
  '@/components/LocaleProvider':{useLocale:()=>({locale,t:value=>value}),LanguageSwitcher:()=>React.createElement('button',{'aria-label':'Language','data-language-switcher':true})},
  '@/components/PageResources':{useResource:path=>{assert.equal(path,'/api/auth/me');return{loading:false,data:{user:user?{nickname:user.name,...user}:null}};}},
  '@/components/CommunityUI':{Logout:()=>React.createElement('button',{'data-logout':true},'Sign out')},
  '@/components/AuthNav':{AuthNav:()=>user?React.createElement('a',{href:'/workspace/account','data-auth-account':true},avatar(user),user.name):React.createElement('a',{href:'/login','data-auth-login':true},'Sign in')},
  '@/components/FeedAvatar':{FeedAvatar:avatar},
  '@/components/SiteTools':{SiteTools:()=>React.createElement('button',{'aria-label':'Language'})},
 };
 const cache=new Map();
 function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file);
  if(file.endsWith('/landing/HomeStyleProvider.tsx'))return modules['./HomeStyleProvider'];
  if(file.endsWith('/components/LocaleProvider.tsx'))return modules['@/components/LocaleProvider'];
  if(file.endsWith('/portfolio/PortraitMorph.tsx'))return{PortraitMorph:({srcA,alt})=>React.createElement('img',{src:srcA,alt,'data-portfolio-portrait':true})};
  if(file.endsWith('/portfolio/ShaderFlow.tsx'))return{ShaderFlow:()=>null};
  const exports={};cache.set(file,exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{exports,Set,Map,URL,URLSearchParams,encodeURIComponent,process:{env:{PUBLIC_URL:publicUrl}},require:key=>{
   if(key.endsWith('.css'))return{};
   if(Object.hasOwn(modules,key))return modules[key];
   const base=key.startsWith('@/')?path.join(sourceRoot,key.slice(2)):key.startsWith('.')?path.resolve(path.dirname(file),key):null;
   assert.ok(base,`Unexpected dependency: ${key}`);
   const target=['','.tsx','.ts','.mjs'].map(ext=>base+ext).find(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile());
   assert.ok(target,`Unresolved dependency: ${key}`);return load(target);
  }});
  return exports;
 }
 return {notices:load(path.join(sourceRoot,'components/SiteAnnouncement.tsx')),page:load(path.join(sourceRoot,'components/PlatformHome.tsx')),runtime:load(path.join(sourceRoot,'components/portfolio/PortfolioRuntime.tsx')),copy:load(path.join(sourceRoot,'lib/landing-copy.ts')),projects:load(path.join(sourceRoot,'components/rbp/projects/projects.tsx')),reads,legacyReads,linkProps};
}
// Resolve server components while leaving client components and their hooks to React SSR.
async function serverTree(element){
 if(Array.isArray(element))return Promise.all(element.map(serverTree));
 if(!React.isValidElement(element))return element;
 if(typeof element.type==='function'&&element.type.constructor.name==='AsyncFunction')return serverTree(await element.type(element.props));
 if(!Object.hasOwn(element.props,'children'))return element;
 const children=await serverTree(element.props.children);
 return Array.isArray(children)?React.cloneElement(element,{},...children):React.cloneElement(element,{},children);
}
async function render(locale='zh',options={}){
 const loaded=components(locale,options),req=new Request(options.reqUrl||'http://example.test/');
 const page=await serverTree(await loaded.page.PlatformHome({req,query:options.query}));
 const html=renderToStaticMarkup(React.createElement(React.Fragment,null,React.createElement(loaded.runtime.PortfolioRuntime),page));
 assert.equal(loaded.reads.length,1,'the homepage resolves exactly one real directory panel');
 assert.equal(loaded.legacyReads.length,0,'the directory homepage does not fetch retired promotional feed content');
 return{...loaded,html,document:parseDocument(html)};
}
const find=(document,predicate)=>DomUtils.findAll(node=>node.type==='tag'&&predicate(node),document.children);
const text=node=>DomUtils.textContent(node);

test('homepage server markup opens the UI design directory with direct categories and the filing footer in reading order',async()=>{
 const{document,copy,reads,linkProps}=await render(),c=copy.landingCopy('zh'),all=find(document,()=>true);
 const hub=find(document,n=>n.attribs['data-resource-kind']==='designs');assert.equal(hub.length,1);
 const tabs=find(hub[0],n=>n.name==='nav'&&n.attribs['aria-label']==='资源类型');assert.equal(tabs.length,1);
 const links=find(tabs[0],n=>n.name==='a');
 assert.deepEqual(links.map(text),categoryLabels);assert.deepEqual(links.map(n=>n.attribs.href),categoryHrefs);
 assert.deepEqual(links.filter(n=>n.attribs['aria-current']==='page').map(n=>n.attribs.href),[categoryHrefs[0]]);
 assert.equal(find(tabs[0],n=>n.name==='details'||n.name==='button').length,0,'category entries remain directly available');
 const directory=find(hub[0],n=>n.attribs['data-resource-directory']==='designs')[0];
 assert.equal(text(find(directory,n=>n.name==='h1')[0]),'UI 设计');assert.equal(reads[0].kind,'designs');
 const header=find(document,n=>Object.hasOwn(n.attribs,'data-iavse-header'))[0],footer=find(document,n=>n.name==='footer');
 assert.equal(footer.length,1);assert.deepEqual(find(footer[0],n=>n.name==='a').map(n=>n.attribs.href),['https://beian.miit.gov.cn/']);
 const order=[header,directory,tabs[0],footer[0]].map(n=>all.indexOf(n));
 assert.ok(order.every((position,index)=>position>=0&&(index===0||position>order[index-1])),'the directory contains its categories after its heading and before the filing footer');
 assert.equal(find(document,n=>Object.hasOwn(n.attribs,'data-auth-login')).length,1);
 assert.equal(find(document,n=>Object.hasOwn(n.attribs,'data-home-hero')||Object.hasOwn(n.attribs,'data-iavse-landing')).length,0);
 assert.equal(find(document,n=>['iframe','video','canvas'].includes(n.name)).length,0,'the directory is ready without a promotional scene');
 for(const href of categoryHrefs){const props=linkProps.find(link=>link.href===href);assert.equal(props.prefetch,false);assert.equal(props.scroll,false);}
 for(const marker of ['hello@example.com','Josh Mercer','Public post 0','private-marker'])assert.ok(!text(document).includes(marker),marker);
});

test('three locales preserve resource, community, blog and account destinations with signed-in avatars',async()=>{
 for(const locale of ['zh','en','ja']){
  const guest=await render(locale),c=guest.copy.landingCopy(locale);
  const header=find(guest.document,n=>Object.hasOwn(n.attribs,'data-iavse-header'))[0];
  const nav=find(header,n=>n.name==='nav'&&n.attribs['aria-label']===c.nav)[0];
  assert.deepEqual(find(nav,n=>n.name==='a').map(n=>n.attribs.href),['/','/community','/blogs','/about']);
  assert.equal(find(nav,n=>n.name==='a')[0].attribs['aria-label'],c.resources);
  assert.equal(find(guest.document,n=>Object.hasOwn(n.attribs,'data-language-switcher')).length,1);
  for(const href of ['/login','/community','/blogs','/about',...categoryHrefs,'https://github.com/IntMainJhy/IAVSE','https://atomgit.com/InMainJhy/IAVSE'])assert.ok(find(guest.document,n=>n.name==='a'&&n.attribs.href===href).length,`${locale}: ${href}`);
  const signedIn=await render(locale,{user:{name:'Signed-in member',avatarId:'signed-in-avatar'}});
  assert.equal(find(signedIn.document,n=>Object.hasOwn(n.attribs,'data-auth-login')).length,0);
  const account=find(signedIn.document,n=>Object.hasOwn(n.attribs,'data-auth-account'));assert.equal(account.length,1);
  assert.equal(account[0].attribs.href,'/workspace/account');assert.ok(text(account[0]).includes('Signed-in member'));
  assert.equal(find(account[0],n=>n.name==='img'&&n.attribs.src==='/media/signed-in-avatar').length,1);
 }
 const fallback=components().copy;assert.equal(fallback.landingCopy('unknown'),fallback.landingCopy('zh'));
});

test('homepage categories select their real directory and preserve query state and public origin',async()=>{
 const cases=[
  [{},'designs'],[{type:'designs'},'designs'],[{type:'skills',q:'agent'},'skills'],[{type:'docs',q:'guide'},'docs'],
  [{type:'resources',category:'development'},'resources'],[{category:'development'},'resources'],[{type:'invalid'},'designs'],
 ];
 for(const[query,kind]of cases){
  const{document,reads}=await render('zh',{query,reqUrl:'https://www.example.test/?type=skills'});
  assert.equal(reads[0].kind,kind);assert.equal(reads[0].query,query,'the selected directory receives the original filters');
  assert.equal(find(document,n=>n.attribs['data-resource-kind']===kind).length,1);
  const tabs=find(document,n=>n.name==='nav'&&n.attribs['aria-label']==='资源类型')[0];
  const selected=find(tabs,n=>n.attribs['aria-current']==='page');assert.equal(selected.length,1);
  assert.equal(new URL(selected[0].attribs.href,'https://example.test').searchParams.get('type'),kind);
  if(kind==='skills')assert.equal(reads[0].baseUrl,'https://www.example.test');
  if(kind==='docs')assert.deepEqual(Array.from(reads[0].path),['docs']);
 }
 const configured=await render('en',{query:{type:'skills'},publicUrl:'https://public.example.test/subpath'});
 assert.equal(configured.reads[0].baseUrl,'https://public.example.test');
 const searched=await render('zh',{query:{type:'designs',q:'  中文 UI  '}});
 const tabs=find(searched.document,n=>n.name==='nav'&&n.attribs['aria-label']==='资源类型')[0];
 for(const link of find(tabs,n=>n.name==='a'&&n.attribs.href.includes('?'))){assert.equal(new URL(link.attribs.href,'https://example.test').searchParams.get('q'),'中文 UI');}
});

test('public feed projection remains bounded and strips private fields without inventing unavailable activity',()=>{
 const posts=Array.from({length:4},(_,i)=>({id:'post '+i,title:'Public post '+i,summary:'Reviewed summary',authorName:'Public author',category:'Technical notes',draft:'private-marker',reviewer:'private-marker',body:'private-marker',authorId:'private-marker'}));
 let reads=0;const feed=experience.homeCommunityPreview(()=>{reads++;return{items:posts,total:99}});
 assert.equal(reads,1);assert.equal(feed.items.length,2);assert.equal(feed.items[0].href,'/community/post%200');
 assert.deepEqual(Object.keys(feed.items[0]).sort(),['id','title','summary','author','category','href'].sort());assert.ok(!JSON.stringify(feed).includes('private-marker'));
 assert.equal(experience.homeCommunityPreview(()=>({items:[]})).state,'ready');
 const unavailable=experience.homeCommunityPreview(()=>{throw Error('private database detail')});assert.deepEqual(unavailable,{state:'unavailable',items:[]});
});

test('homepage excerpts remain bounded and displayed product captures have provenance',()=>{
 const groups=experience.homeResourceSelections;assert.deepEqual(groups.map(g=>g.id),['designs','skills','docs','resources']);assert.ok(groups.every(g=>g.items.length<=3));assert.ok(Buffer.byteLength(JSON.stringify(groups))<16000);
 const loaded=components();assert.equal(loaded.projects.productProjects().length,4);
 for(const name of ['lin-studio','leo-park']){const file=new URL('../public/media/portfolio/'+name+'.webp',import.meta.url);assert.ok(fs.statSync(file).size>1000);const origin=JSON.parse(fs.readFileSync(new URL(file.href+'.json'),'utf8'));assert.match(origin.prompt,/Actual screenshot of IAVSE built-in/);}
 for(const name of ['skills','community']){const file=new URL('../public/media/portfolio/'+name+'.webp',import.meta.url);assert.ok(fs.statSync(file).size>1000);const origin=JSON.parse(fs.readFileSync(new URL(file.href+'.json'),'utf8'));assert.match(origin.prompt,/Actual IAVSE public product screenshot/);assert.ok(origin.route.startsWith('/'));}
 for(const name of ['editorial','resume']){const file=new URL('../public/media/home-product/space-'+name+'.webp',import.meta.url);assert.ok(fs.statSync(file).size>1000);const origin=JSON.parse(fs.readFileSync(new URL(file.href+'.json'),'utf8'));assert.match(origin.prompt,/Actual screenshot of IAVSE built-in/);}
});

test('legacy spatial helpers remain bounded while the directory stays usable without enhancement',async()=>{
 assert.equal(spatial.spatialChapterAt(100,100,1000,3),0);
 assert.equal(spatial.spatialChapterAt(600,100,1000,3),1);
 assert.equal(spatial.spatialChapterAt(1100,100,1000,3),2);
 assert.equal(spatial.spatialChapterAt(-300,100,1000,3),0);
 assert.equal(spatial.spatialChapterAt(99999,100,1000,3),2);
 assert.equal(spatial.spatialChapterAt(NaN,100,1000,3),0);
 assert.equal(spatial.spatialChapterAt(300,100,0,3),0);
 const{html,document}=await render();assert.ok(!html.includes('class="hs-journey"'));
 assert.equal(find(document,n=>Object.hasOwn(n.attribs,'inert')).length,0,'the plain directory needs no optical copies');
 for(const node of find(document,n=>['a','button'].includes(n.name))){
  let parent=node.parent;
  while(parent){assert.ok(!Object.hasOwn(parent.attribs||{},'inert'),'server controls remain usable before enhancement');parent=parent.parent;}
 }
});

test('four primary destinations expose only the current route across all locales',async()=>{
 const routes=[['/','/'],['/about','/about'],['/community/discussion','/community'],['/resources/designs','/'],['/docs/showcase','/'],['/skills/example','/'],['/blogs','/blogs'],['/login',null]];
 for(const locale of ['zh','en','ja'])for(const[pathname,active]of routes){
  const{document,copy}=await render(locale,{pathname}),c=copy.landingCopy(locale);
  const nav=find(document,n=>n.name==='nav'&&n.attribs['aria-label']===c.nav)[0],links=find(nav,n=>n.name==='a');
  assert.deepEqual(links.map(n=>n.attribs.href),['/','/community','/blogs','/about']);
  assert.equal(links[0].attribs['aria-label'],c.resources);assert.equal(links[3].attribs['aria-label'],c.navAbout);
  assert.deepEqual(links.filter(n=>n.attribs['aria-current']==='page').map(n=>n.attribs.href),active?[active]:[]);
 }
});

test('the root owns one shared header and authored surfaces keep their own chrome',async()=>{
 const{document}=await render(),hub=find(document,n=>Object.hasOwn(n.attribs,'data-resource-kind'))[0];
 assert.equal(find(document,n=>Object.hasOwn(n.attribs,'data-iavse-header')).length,1);
 assert.equal(find(hub,n=>Object.hasOwn(n.attribs,'data-iavse-header')).length,0,'directory content cannot duplicate the root header');
 assert.equal(find(document,n=>n.attribs['data-iavse-platform']==='home').length,1);
 assert.equal(find(document,n=>Object.hasOwn(n.attribs,'data-home-hero')||n.attribs.class==='site-style-atmosphere').length,0);
 for(const pathname of ['/blog/public-member','/blogs/showcase/editorial','/workspace/blog','/resources/designs/item/preview']){
  const loaded=components('zh',{pathname});
  assert.equal(renderToStaticMarkup(React.createElement(loaded.runtime.PortfolioRuntime)),'',pathname+' keeps its authored or workbench chrome');
 }
});

test('the plain header keeps brand, account and language controls without glass or an extra settings disclosure',async()=>{
 for(const user of [null,{name:'Signed-in member',avatarId:'account-avatar'}]){
  const{document,copy,linkProps}=await render('zh',{user}),c=copy.landingCopy('zh');
  const header=find(document,n=>Object.hasOwn(n.attribs,'data-iavse-header'))[0],nav=find(header,n=>n.name==='nav'&&n.attribs['aria-label']===c.nav);
  assert.equal(nav.length,1,'desktop navigation has one live set of links');
  assert.equal(find(header,n=>(n.attribs.class||'').split(' ').some(name=>name.startsWith('glass-switch')||name==='home-style-trigger'||name==='iavse-header__more')).length,0);
  const brand=find(header,n=>n.name==='a'&&n.attribs.class==='iavse-header__brand')[0];
  assert.equal(brand.attribs.href,'/');assert.equal(find(brand,n=>n.name==='svg'&&n.attribs.class==='site-brand-mark').length,1,'the original IAVSE mark stays visible');
  const identity=find(header,n=>n.attribs.class==='iavse-header__identity')[0],children=(identity.children||[]).filter(n=>n.type==='tag');
  assert.ok(Object.hasOwn(children.at(-1).attribs,'data-language-switcher'),'language stays on the account side');
  assert.equal(find(identity,n=>Object.hasOwn(n.attribs,user?'data-auth-account':'data-auth-login')).length,1);
  assert.equal(find(find(document,n=>n.name==='footer')[0],n=>Object.hasOwn(n.attribs,'data-language-switcher')).length,0);
  for(const link of find(nav[0],n=>n.name==='a')){
   assert.ok(link.attribs['aria-label']);
   const compact=find(link,n=>(n.attribs.class||'').includes('iavse-header__compact-label'))[0];
   assert.equal(compact.attribs['aria-hidden'],'true','short visible labels preserve the full accessible name');
   assert.equal(linkProps.find(props=>props.href===link.attribs.href).prefetch,false,'route warming remains controlled by native navigation intent');
  }
 }
});

test('mobile navigation merges home and resources while keeping all community and account actions accessible',()=>{
 const cases=[['/','/'],['/community/members','/community'],['/resources/designs/a','/'],['/docs/guide','/'],['/skills/example','/'],['/blogs','/blogs'],['/workspace/notifications','account'],['/login','account'],['/about','/about']];
 for(const[pathname,expected]of cases){
  const loaded=components('zh',{pathname}),doc=parseDocument(renderToStaticMarkup(React.createElement(loaded.runtime.PortfolioRuntime)));
  const dock=find(doc,n=>n.name==='nav'&&n.attribs.class==='iavse-mobile-dock')[0],bar=find(dock,n=>n.attribs.class==='iavse-mobile-dock__items')[0];
  assert.deepEqual(find(bar,n=>n.name==='a').map(n=>n.attribs.href),['/','/community','/blogs','/about']);
  const trigger=find(bar,n=>n.name==='button')[0],panel=find(dock,n=>n.name==='dialog')[0];
  assert.equal(find(bar,n=>n.name==='button').length,1);assert.equal(trigger.attribs['aria-controls'],panel.attribs.id);
  assert.equal(trigger.attribs['aria-haspopup'],'dialog');assert.equal(trigger.attribs['aria-expanded'],'false');
  assert.deepEqual(find(bar,n=>n.attribs['aria-current']==='page').map(n=>n.attribs.href??'account'),[expected]);
  const links=find(panel,n=>n.name==='a').map(n=>n.attribs.href);
  for(const href of ['/workspace/bookmarks','/workspace/notifications','/community?feed=following','/workspace/blog'])assert.ok(links.includes('/login?next='+encodeURIComponent(href)),href);
  assert.ok(links.includes('/community/members'));assert.ok(!links.some(h=>h.startsWith('/admin')));
 }
 for(const[role,adminHref]of [['member',null],['reviewer','/admin/community'],['owner','/admin']]){
  const loaded=components('zh',{user:{id:'u1',name:'Test member',status:'active',role,canPublish:true},pathname:'/community'});
  const doc=parseDocument(renderToStaticMarkup(React.createElement(loaded.runtime.PortfolioRuntime))),panel=find(doc,n=>n.name==='dialog'&&n.attribs.class==='iavse-account-sheet')[0];
  const links=find(panel,n=>n.name==='a').map(n=>n.attribs.href);
  assert.ok(links.includes('/workspace/account')&&links.includes('/community/members/u1'));
  assert.ok(links.includes('/workspace/bookmarks')&&links.includes('/workspace/notifications'));
  assert.deepEqual(links.filter(h=>h.startsWith('/admin')),adminHref?[adminHref]:[]);
  assert.equal(find(panel,n=>Object.hasOwn(n.attribs,'data-logout')).length,1);
 }
});

test('configured site updates appear once on visitor routes and stay outside management and authoring screens',()=>{
 for(const [pathname,expected] of [['/',1],['/community',1],['/resources',1],['/blogs',1],['/admin',0],['/admin/settings',0],['/workspace/blog',0],['/login',0]]){
  const {notices,runtime}=components('en',{pathname});
  const html=renderToStaticMarkup(React.createElement(notices.SiteAnnouncementsProvider,{initial:{enabled:true,items:[{title:'Public notice',url:'/about'}]}},React.createElement(runtime.PortfolioRuntime)));
  assert.equal(find(parseDocument(html),node=>node.name==='aside'&&node.attribs.class==='site-announcement').length,expected,pathname);
 }
});


test('legacy visual preferences retain one direct directory without scene or appearance controls',async()=>{
 for(const style of ['fly','brand','anime','classic']){
  const{document}=await render('zh',{style}),header=find(document,n=>Object.hasOwn(n.attribs,'data-iavse-header'))[0];
  const repositories=find(header,n=>(n.attribs.class||'').split(' ').includes('iavse-repository-links'));assert.equal(repositories.length,1);
  const links=find(repositories[0],n=>n.name==='a');
  assert.deepEqual(links.map(n=>n.attribs.href),['https://github.com/IntMainJhy/IAVSE','https://atomgit.com/InMainJhy/IAVSE']);
  for(const link of links){assert.equal(link.attribs.target,'_blank');assert.ok(link.attribs['aria-label']);assert.match(link.attribs.rel,/noopener/);}
  assert.equal(find(document,n=>n.attribs['data-resource-directory']==='designs').length,1);
  assert.equal(find(document,n=>Object.hasOwn(n.attribs,'data-home-hero')||Object.hasOwn(n.attribs,'data-style-option')||['canvas','iframe'].includes(n.name)).length,0);
  assert.equal(find(document,n=>(n.attribs.class||'').split(' ').some(name=>name==='home-style-trigger'||name==='iavse-theme-toggle')).length,0);
 }
});

test('every shared platform header keeps the same functional destinations away from home',async()=>{
 for(const pathname of ['/resources','/docs','/skills','/community','/blogs','/workspace/account','/about','/login','/legal/privacy','/downloads']){
  const{document,copy}=await render('zh',{pathname,style:'brand'}),header=find(document,n=>Object.hasOwn(n.attribs,'data-iavse-header'))[0];
  assert.ok(header,pathname+' has the shared header');
  const nav=find(header,n=>n.name==='nav'&&n.attribs['aria-label']===copy.landingCopy('zh').nav)[0];
  assert.deepEqual(find(nav,n=>n.name==='a').map(n=>n.attribs.href),['/','/community','/blogs','/about']);
  assert.equal(find(header,n=>Object.hasOwn(n.attribs,'data-language-switcher')).length,1);
  assert.equal(find(header,n=>Object.hasOwn(n.attribs,'data-style-option')||(n.attribs.class||'').includes('home-style')).length,0);
 }
});
