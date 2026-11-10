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
function components(locale='zh'){
 const modules={
  react:React,'react/jsx-runtime':runtime,
  'next/link':{default:({prefetch,children,...props})=>React.createElement('a',props,children)},
  'next/image':{default:image},
  'lucide-react':new Proxy({},{get:()=>()=>null}),
  'motion/react':{useReducedMotion:()=>true,motion:new Proxy({},{get:(_,tag)=>motionTag(tag)}),LayoutGroup:({children})=>children,AnimatePresence:({children})=>children},
  '@/lib/home-experience.mjs':experience,
  '@/lib/server-i18n':{serverI18n:async()=>({t:value=>value,locale})},
  '@/components/SiteTools':{SiteTools:()=>React.createElement('button',{'aria-label':'Language'})},
 };
 const cache=new Map();
 function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file);
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
 return {page:load(path.join(sourceRoot,'components/PlatformHome.tsx')),copy:load(path.join(sourceRoot,'lib/portfolio-content.ts')),projects:load(path.join(sourceRoot,'components/rbp/projects/projects.tsx'))};
}
async function render(locale='zh'){
 const loaded=components(locale),html=renderToStaticMarkup(await loaded.page.PlatformHome({req:new Request('http://example.test/')}));
 return {...loaded,html,document:parseDocument(html)};
}
const find=(document,predicate)=>DomUtils.findAll(node=>node.type==='tag'&&predicate(node),document.children);
const text=node=>DomUtils.textContent(node);
const hasClass=(node,name)=>(node.attribs.class||'').split(/\s+/).includes(name);

test('Portfolio homepage keeps the template reading order and exposes four real IAVSE destinations',async()=>{
 const {html,document}=await render();
 const headings=find(document,node=>/^h[12]$/.test(node.name));
 assert.deepEqual(headings.map(node=>node.name),['h1','h2','h2']);
 const cards=find(document,node=>hasClass(node,'project-card'));
 assert.equal(cards.length,4);
 assert.deepEqual(cards.map(node=>node.attribs.href),['/resources?type=designs','/resources?type=skills','/community','/blogs']);
 assert.equal(find(document,node=>Object.hasOwn(node.attribs,'data-portfolio-portrait')).length,1);
 assert.ok(text(document).includes('IAVSE'));
 assert.ok(html.indexOf('<h1')<html.indexOf('project-card'));
 assert.ok(html.indexOf('project-card')<html.indexOf('Let’s connect'));
 for(const old of ['iavse-cinema-toolbar','v2-hero-showcase','v2-stage-profile','product-showroom-home','home-blog-demo','data-creator-voices','creator-home.webp','jianghaoyu2006','hx-explorer','hx-questions','rb-chapter'])assert.ok(!html.includes(old),old);
 assert.doesNotMatch(html,/<iframe|<video/);
});

test('every locale merges translated product content without placeholder template identities or broken destinations',async()=>{
 for(const locale of ['zh','en','ja']){
  const {html,document,copy,projects}=await render(locale),c=copy.portfolioCopy(locale),content=text(document);
  for(const value of [c.greeting,...c.title,c.intro,c.projectTitle,c.projectIntro,c.connect,c.connectBody,c.source,c.explore])assert.ok(content.includes(value),`${locale}: ${value}`);
  for(const href of ['/resources','/community','/blogs','/workspace/account','/about','/legal/privacy','https://github.com/IntMainJhy/IAVSE'])assert.ok(find(document,node=>node.name==='a'&&node.attribs.href===href).length,href);
  const expected=projects.productProjects(locale),images=find(document,node=>node.name==='img');
  for(const project of expected){assert.ok(content.includes(project.title));assert.ok(content.includes(project.meta));assert.ok(images.some(node=>node.attribs.src===project.image&&node.attribs.alt===project.imageAlt));}
  assert.ok(images.some(node=>node.attribs.alt===c.templateAlt));
  for(const marker of ['undefined','hello@example.com','Josh Mercer','Public post 0','private-marker'])assert.ok(!html.includes(marker),marker);
 }
 const fallback=components().copy;assert.equal(fallback.portfolioCopy('unknown'),fallback.portfolioCopy('zh'));
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
 const {html}=await render();assert.ok(!html.includes('class="hs-journey"'));
 assert.ok(!html.includes('inert=""'),'server content stays usable before enhancement');
});
