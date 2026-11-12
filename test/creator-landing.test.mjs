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
const emptyContent={posts:[],works:[],space:null,communityUnavailable:false};
function components(locale='zh',{content=emptyContent,user=null,pathname='/'}={}){
 const reads=[];
 const avatar=({name,avatarId})=>React.createElement('span',{'data-avatar-name':name},avatarId?React.createElement('img',{src:'/media/'+encodeURIComponent(avatarId),alt:''}):null);
 const modules={
  react:React,'react/jsx-runtime':runtime,
  'next/link':{default:({prefetch,children,...props})=>React.createElement('a',props,children)},
  'next/image':{default:image},
  'next/navigation':{usePathname:()=>pathname,useRouter:()=>({refresh:()=>{}})},
  'lucide-react':new Proxy({},{get:()=>()=>null}),
  'motion/react':{useReducedMotion:()=>true,motion:new Proxy({},{get:(_,tag)=>motionTag(tag)}),LayoutGroup:({children})=>children,AnimatePresence:({children})=>children},
  '@/lib/home-experience.mjs':experience,
  '@/lib/landing-content.mjs':{loadLandingContent:async(req,requestedLocale)=>{reads.push({req,locale:requestedLocale});return content;}},
  '@/lib/server-i18n':{serverI18n:async()=>({t:value=>value,locale})},
  '@/components/LocaleProvider':{useLocale:()=>({locale,t:value=>value}),LanguageSwitcher:()=>React.createElement('button',{'aria-label':'Language','data-language-switcher':true})},
  '@/components/AuthNav':{AuthNav:()=>user?React.createElement('a',{href:'/workspace/account','data-auth-account':true},avatar(user),user.name):React.createElement('a',{href:'/login','data-auth-login':true},'Sign in')},
  '@/components/FeedAvatar':{FeedAvatar:avatar},
  '@/components/SiteTools':{SiteTools:()=>React.createElement('button',{'aria-label':'Language'})},
 };
 const cache=new Map();
 function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file);
  if(file.endsWith('/landing/IavseFlowBackdrop.tsx'))return{default:()=>React.createElement('div',{'data-flow-backdrop-stub':true,'aria-hidden':'true'})};
  if(file.endsWith('/portfolio/PortraitMorph.tsx'))return{PortraitMorph:({srcA,alt})=>React.createElement('img',{src:srcA,alt,'data-portfolio-portrait':true})};
  if(file.endsWith('/portfolio/ShaderFlow.tsx'))return{ShaderFlow:()=>null};
  const exports={};cache.set(file,exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{exports,Set,Map,encodeURIComponent,require:key=>{
   if(key.endsWith('.css'))return{};
   if(Object.hasOwn(modules,key))return modules[key];
   const base=key.startsWith('@/')?path.join(sourceRoot,key.slice(2)):key.startsWith('.')?path.resolve(path.dirname(file),key):null;
   assert.ok(base,`Unexpected dependency: ${key}`);
   const target=['','.tsx','.ts','.mjs'].map(ext=>base+ext).find(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile());
   assert.ok(target,`Unresolved dependency: ${key}`);return load(target);
  }});
  return exports;
 }
 return {page:load(path.join(sourceRoot,'components/PlatformHome.tsx')),runtime:load(path.join(sourceRoot,'components/portfolio/PortfolioRuntime.tsx')),copy:load(path.join(sourceRoot,'lib/landing-copy.ts')),projects:load(path.join(sourceRoot,'components/rbp/projects/projects.tsx')),reads};
}
async function render(locale='zh',options={}){
 const loaded=components(locale,options),req=new Request('http://example.test/'),html=renderToStaticMarkup(React.createElement(React.Fragment,null,React.createElement(loaded.runtime.PortfolioRuntime),await loaded.page.PlatformHome({req})));
 assert.equal(loaded.reads.length,1);assert.equal(loaded.reads[0].req,req);assert.equal(loaded.reads[0].locale,locale);
 return {...loaded,html,document:parseDocument(html)};
}
const find=(document,predicate)=>DomUtils.findAll(node=>node.type==='tag'&&predicate(node),document.children);
const text=node=>DomUtils.textContent(node);

test('homepage server markup keeps the hero, community empty state, resource links, blog space and footer in reading order',async()=>{
 const {document,copy}=await render(),c=copy.landingCopy('zh'),all=find(document,()=>true);
 const hero=find(document,node=>node.name==='h1');assert.equal(hero.length,1);assert.equal(text(hero[0]),c.title.join(''));
 const filters=find(document,node=>node.attribs.role==='group'&&node.attribs['aria-label']===c.filters);assert.equal(filters.length,1);
 const buttons=find(filters[0],node=>node.name==='button');
 assert.deepEqual(buttons.map(text),[c.all,c.works,c.discussions]);assert.deepEqual(buttons.map(node=>node.attribs['aria-pressed']),['true','false','false']);
 const empty=find(document,node=>Object.hasOwn(node.attribs,'data-landing-empty'));assert.equal(empty.length,1);
 assert.ok(text(empty[0]).includes(c.emptyTitle));
 assert.deepEqual(find(empty[0],node=>node.name==='a').map(node=>node.attribs.href),['/community']);
 const resources=find(document,node=>node.name==='aside'&&node.attribs['aria-label']===c.resources);assert.equal(resources.length,1);
 assert.deepEqual(find(resources[0],node=>node.name==='a').map(node=>node.attribs.href),['/resources?type=designs','/resources?type=skills','/resources?type=docs','/resources?type=resources']);
 const spaces=find(document,node=>node.name==='section'&&node.attribs['aria-label']===c.blogs);assert.equal(spaces.length,1);
 const footer=find(document,node=>node.name==='footer');assert.equal(footer.length,1);
 const order=[hero[0],filters[0],empty[0],resources[0],spaces[0],footer[0]].map(node=>all.indexOf(node));
 assert.ok(order.every((position,index)=>position>=0&&(index===0||position>order[index-1])),'semantic content stays in its intended reading order');
 const primary=find(document,node=>node.name==='nav'&&node.attribs['aria-label']===c.nav);
 assert.ok(primary.length>0);assert.deepEqual(find(primary[0],node=>node.name==='a').map(node=>node.attribs.href),['/','/community','/resources','/blogs','/about']);
 assert.equal(find(document,node=>Object.hasOwn(node.attribs,'data-auth-login')).length,1);
 assert.equal(find(document,node=>Object.hasOwn(node.attribs,'data-flow-backdrop-stub')).length,1,'the optional background is isolated from server content');
 const preview=find(spaces[0],node=>node.name==='img');assert.equal(preview.length,1);
 assert.equal(preview[0].attribs.src,'/media/home-product/space-editorial.webp');assert.equal(preview[0].attribs.alt,c.example);assert.ok(text(spaces[0]).includes(c.example));
 assert.equal(find(document,node=>['iframe','video'].includes(node.name)).length,0);
 assert.equal(find(document,node=>node.name==='a'&&/^\/(?:community\/|blog\/|blogs\/showcase\/)/.test(node.attribs.href||'')).length,0,'empty content does not fabricate public posts, projects or creators');
 for(const name of ['Lin Chen','Maya Zhou','Leo Park','Josh Mercer','jianghaoyu2006'])assert.ok(!text(document).includes(name),name);

 const failed=await render('zh',{content:{...emptyContent,communityUnavailable:true}}),failedEmpty=find(failed.document,node=>Object.hasOwn(node.attribs,'data-landing-empty'));
 assert.equal(failedEmpty.length,1);assert.ok(text(failedEmpty[0]).includes(c.unavailable));
 assert.deepEqual(find(failedEmpty[0],node=>node.name==='button').map(text),[c.retry]);
});

test('three locales preserve real destinations, labeled template fallback and supplied public author avatars',async()=>{
 for(const locale of ['zh','en','ja']){
  const empty=await render(locale),c=empty.copy.landingCopy(locale),content=text(empty.document);
  assert.equal(find(empty.document,node=>Object.hasOwn(node.attribs,'data-iavse-landing'))[0].attribs['data-landing-locale'],locale);
  for(const value of [...c.title,c.intro,c.communityTitle,c.emptyTitle,c.resourceTitle,c.design,c.skill,c.docs,c.tools,c.resourceNote,c.spaceTitle,c.spaceBody,c.example,c.source,c.privacy,c.spacePublishing])assert.ok(content.includes(value),`${locale}: ${value}`);
  const entrances=find(empty.document,node=>node.name==='nav'&&node.attribs['aria-label']===c.productEntries);
  assert.equal(entrances.length,1);
  const entryLinks=find(entrances[0],node=>node.name==='a');
  assert.deepEqual(entryLinks.map(node=>[text(node),node.attribs.href]),[[c.community,'/community'],[c.resources,'/resources']]);
  assert.ok(entryLinks.every(node=>!Object.hasOwn(node.attribs,'aria-current')),'neither destination is the homepage');
  for(const href of ['/','/login','/resources','/community','/blogs','/workspace/account','/about','/legal/privacy','https://github.com/IntMainJhy/IAVSE'])assert.ok(find(empty.document,node=>node.name==='a'&&node.attribs.href===href).length,`${locale}: ${href}`);
  assert.equal(find(empty.document,node=>Object.hasOwn(node.attribs,'data-language-switcher')).length,1);
  for(const marker of ['undefined','hello@example.com','Josh Mercer','Public post 0','private-marker'])assert.ok(!content.includes(marker),marker);

  const supplied={posts:[{id:'published-post',title:'Reviewed discussion',summary:'Published excerpt',category:'Practice',source:'Author',license:'Author license',coverId:'',authorName:'Discussion author',authorAvatarId:'discussion-avatar',commentCount:0,likeCount:0,href:'/community/published-post'}],works:[{id:'published-work',title:'Published project',summary:'Published project excerpt',coverId:'',authorName:'Project author',authorAvatarId:'project-avatar',href:'/blog/public-member/projects/project-one',type:'work'}],space:{handle:'public-member',name:'Public member',intro:'Published member introduction',avatarId:'space-avatar',coverId:'',href:'/blog/public-member',count:1},communityUnavailable:false};
  const published=await render(locale,{content:supplied,user:{name:'Signed-in member',avatarId:'signed-in-avatar'}}),publishedText=text(published.document);
  assert.equal(find(published.document,node=>Object.hasOwn(node.attribs,'data-landing-empty')).length,0);
  assert.equal(find(published.document,node=>Object.hasOwn(node.attribs,'data-auth-account')).length,1);
  for(const href of ['/community/published-post','/blog/public-member/projects/project-one','/blog/public-member'])assert.ok(find(published.document,node=>node.name==='a'&&node.attribs.href===href).length,href);
  for(const name of ['Reviewed discussion','Published project','Project author','Discussion author','Public member','Signed-in member'])assert.ok(publishedText.includes(name),name);
  const images=find(published.document,node=>node.name==='img');
  for(const id of ['signed-in-avatar','project-avatar','discussion-avatar','space-avatar'])assert.ok(images.some(node=>node.attribs.src==='/media/'+id),id);
  assert.ok(publishedText.includes('0 '+c.comments),'zero is the actual published comment count');
  assert.ok(!publishedText.includes(c.example));assert.ok(images.every(node=>node.attribs.src!=='/media/home-product/space-editorial.webp'),'a real public space replaces the labeled template fallback');
  assert.equal(find(published.document,node=>['iframe','video'].includes(node.name)).length,0);
 }
 const fallback=components().copy;assert.equal(fallback.landingCopy('unknown'),fallback.landingCopy('zh'));
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

test('legacy spatial helpers remain stable and the current homepage is usable without spatial enhancement',async()=>{
 assert.equal(spatial.spatialChapterAt(100,100,1000,3),0);
 assert.equal(spatial.spatialChapterAt(600,100,1000,3),1);
 assert.equal(spatial.spatialChapterAt(1100,100,1000,3),2);
 assert.equal(spatial.spatialChapterAt(-300,100,1000,3),0);
 assert.equal(spatial.spatialChapterAt(99999,100,1000,3),2);
 assert.equal(spatial.spatialChapterAt(NaN,100,1000,3),0);
 assert.equal(spatial.spatialChapterAt(300,100,0,3),0);
 const {html,document}=await render();assert.ok(!html.includes('class="hs-journey"'));
 const decorative=find(document,node=>Object.hasOwn(node.attribs,'inert'));
 assert.ok(decorative.length>0,'the optical copy is separate from real controls');
 for(const node of decorative){
  assert.equal(node.attribs['aria-hidden'],'true');
  assert.equal(find(node,child=>['a','button','input'].includes(child.name)).length,0,'decorative copies cannot duplicate controls');
 }
 for(const node of find(document,node=>['a','button'].includes(node.name))){
  let parent=node.parent;
  while(parent){assert.ok(!Object.hasOwn(parent.attribs||{},'inert'),'real server controls stay usable before enhancement');parent=parent.parent;}
 }
});


test('five navigation destinations expose only the current route, including home and about in all locales',async()=>{
 const routes=[['/','/'],['/about','/about'],['/community/discussion','/community'],['/resources/designs','/resources'],['/docs/showcase','/resources'],['/skills/example','/resources'],['/blogs','/blogs'],['/login',null]];
 for(const locale of ['zh','en','ja']){
  for(const[pathname,active]of routes){
   const{document,copy}=await render(locale,{pathname}),c=copy.landingCopy(locale);
   const nav=find(document,n=>n.name==='nav'&&n.attribs['aria-label']===c.nav)[0];
   const links=find(nav,n=>n.name==='a');
   assert.deepEqual(links.map(n=>n.attribs.href),['/','/community','/resources','/blogs','/about']);
   assert.equal(links[0].attribs['aria-label'],c.navHome);assert.equal(links[4].attribs['aria-label'],c.navAbout);
   assert.deepEqual(links.filter(n=>n.attribs['aria-current']==='page').map(n=>n.attribs.href),active?[active]:[]);
  }
 }
});


test('the root owns one shared header on home without a second backdrop or a page-owned replacement',async()=>{
 const{document}=await render();
 const landing=find(document,n=>Object.hasOwn(n.attribs,'data-iavse-landing'))[0];
 assert.equal(find(document,n=>Object.hasOwn(n.attribs,'data-iavse-header')).length,1);
 assert.equal(find(landing,n=>Object.hasOwn(n.attribs,'data-iavse-header')).length,0,'home content cannot replace the moving root header');
 assert.equal(find(document,n=>n.attribs['data-iavse-platform']==='home').length,1);
 assert.equal(find(document,n=>Object.hasOwn(n.attribs,'data-flow-backdrop-stub')).length,1,'home retains its original local mist');
 const empty=find(document,n=>Object.hasOwn(n.attribs,'data-landing-empty'))[0];
 assert.ok(Object.hasOwn(empty.attribs,'data-landing-reveal'),'the initial community empty card joins scroll entry just like populated cards');
 for(const pathname of ['/blog/public-member','/blogs/showcase/editorial','/workspace/blog','/resources/designs/item/preview']){
  const loaded=components('zh',{pathname});
  const html=renderToStaticMarkup(React.createElement(loaded.runtime.PortfolioRuntime));
  assert.equal(html,'',pathname+' keeps its authored or workbench chrome');
 }
});


test('the persistent header exposes the same capsule and keeps language after identity and theme beside navigation',async()=>{
 for(const user of [null,{name:'Signed-in member',avatarId:'account-avatar'}]){
  const{document,copy}=await render('zh',{user}),c=copy.landingCopy('zh');
  const header=find(document,n=>Object.hasOwn(n.attribs,'data-iavse-header'))[0];
  const nav=find(header,n=>n.name==='nav'&&n.attribs['aria-label']===c.nav);
  assert.equal(nav.length,1,'one live capsule serves every viewport');
  assert.equal(find(header,n=>(n.attribs.class||'').includes('iavse-header__mobile')).length,0,'the header has no separate collapsed mobile menu');
  const navigation=nav[0].parent,theme=find(navigation,n=>n.name==='button'&&n.attribs.class==='iavse-theme-toggle');
  assert.equal(theme.length,1);assert.equal(theme[0].attribs.type,'button');
  const identity=find(header,n=>n.attribs.class==='iavse-header__identity')[0],children=(identity.children||[]).filter(n=>n.type==='tag');
  assert.ok(Object.hasOwn(children.at(-1).attribs,'data-language-switcher'),'language is the last account-side control');
  const footer=find(document,n=>n.name==='footer')[0];assert.equal(find(footer,n=>Object.hasOwn(n.attribs,'data-language-switcher')).length,0);
  for(const link of find(nav[0],n=>n.name==='a')){
   assert.ok(link.attribs['aria-label']);
   const compact=find(link,n=>(n.attribs.class||'').includes('glass-switch__compact-label'))[0];
   assert.equal(compact.attribs['aria-hidden'],'true','short visible labels do not replace full accessible destination names');
  }
 }
});
