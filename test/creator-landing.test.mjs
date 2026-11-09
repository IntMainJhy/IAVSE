import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as runtime from 'react/jsx-runtime';
import * as experience from '../src/lib/home-experience.mjs';
import * as spatial from '../src/lib/home-spatial.mjs';

function load(name,modules){const exports={};const code=ts.transpileModule(fs.readFileSync(new URL('../src/components/'+name+'.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,Set,encodeURIComponent,require:key=>{if(key.endsWith('.css'))return{};assert.ok(Object.hasOwn(modules,key),key);return modules[key]}});return exports;}
async function render(locale='zh',read=()=>({items:[]})){
 const modules={'react':React,'react/jsx-runtime':runtime,'next/link':{default:({prefetch,children,...props})=>React.createElement('a',props,children)},'./Icons':{Icon:()=>null},'@/lib/home-experience.mjs':experience,'@/lib/home-spatial.mjs':spatial,'@/lib/community.mjs':{publicPosts:read},'@/lib/server-i18n':{serverI18n:async()=>({t:value=>value,locale})},'./V2Atmosphere':{V2Atmosphere:()=>React.createElement('canvas',{'data-protected-opening':true})}};
 for(const name of ['HomeResourceExplorer','HomeSpacePreview','HomeSpatialShowcase','HomeProductShowcase'])modules['./'+name]=load(name,modules);
 const page=load('PlatformHome',modules);return renderToStaticMarkup(await page.PlatformHome({req:new Request('http://example.test/')}));
}

test('homepage preserves the opening and replaces every old product display and visible background toolbar',async()=>{
 const html=await render();
 for(const phrase of ['Insight through AI.','Vigilance for Opportunity.','Seize to Evolve.'])assert.ok(html.includes(phrase));
 assert.equal((html.match(/data-protected-opening/g)||[]).length,1);
 assert.match(html,/data-home-experience="community-discovery"/);
 assert.match(html,/data-home-story="products"/,'product stage joins the same optical scene as the opening');
 for(const old of ['iavse-cinema-toolbar','v2-hero-showcase','v2-stage-profile','product-showroom-home','home-blog-demo','data-creator-voices','creator-home.webp','jianghaoyu2006'])assert.ok(!html.includes(old),old);
 assert.doesNotMatch(html,/<iframe|<video/);
});

test('all locales expose distinct discovery, community and built-in space sections with real destinations',async()=>{
 for(const locale of ['zh','en','ja']){
  const html=await render(locale),c=experience.homeExperienceCopy(locale);
  for(const id of ['discover','hx-community-title','spaces','hx-close-title'])assert.ok(html.includes('id="'+id+'"'));
  for(const href of ['/resources','/community','/blogs','/workspace/blog','/workspace/submissions/new','/blogs/showcase/lin-studio?template=builtin'])assert.ok(html.includes('href="'+href+'"'),href);
  assert.ok(html.includes(c.templateNote));assert.ok(html.includes(c.emptyCommunity));
  for(const resource of experience.homeResourceSelections[0].items){assert.ok(html.includes(resource.href));assert.ok(html.includes(resource.source));assert.ok(html.includes(resource.image.replaceAll('&','&amp;')));}
  assert.ok(!html.includes('undefined'));
 }
 assert.equal(experience.homeExperienceCopy('unknown'),experience.homeExperienceCopy('zh'));
});

test('public feed projection is bounded, strips private fields and never turns unavailable data into invented activity',async()=>{
 const posts=Array.from({length:4},(_,i)=>({id:'post '+i,title:'Public post '+i,summary:'Reviewed summary',authorName:'Public author',category:'Technical notes',draft:'private-marker',reviewer:'private-marker',body:'private-marker',authorId:'private-marker'}));
 let reads=0;const feed=experience.homeCommunityPreview(()=>{reads++;return{items:posts,total:99}});
 assert.equal(reads,1);assert.equal(feed.items.length,2);assert.equal(feed.items[0].href,'/community/post%200');
 assert.deepEqual(Object.keys(feed.items[0]).sort(),['id','title','summary','author','category','href'].sort());assert.ok(!JSON.stringify(feed).includes('private-marker'));
 const html=await render('en',()=>({items:posts}));assert.ok(html.includes('Public post 0'));assert.ok(html.includes('Public post 1'));assert.ok(!html.includes('Public post 2'));assert.ok(!html.includes('private-marker'));
 assert.equal(experience.homeCommunityPreview(()=>({items:[]})).state,'ready');
 const unavailable=experience.homeCommunityPreview(()=>{throw Error('private database detail')});assert.deepEqual(unavailable,{state:'unavailable',items:[]});
 const failed=await render('zh',()=>{throw Error('private database detail')});assert.ok(failed.includes(experience.homeExperienceCopy('zh').unavailable));assert.ok(!failed.includes('private database detail'));
});

test('interactive excerpts stay small and all shipped space screenshots have source records',()=>{
 const groups=experience.homeResourceSelections;assert.deepEqual(groups.map(g=>g.id),['designs','skills','docs','resources']);assert.ok(groups.every(g=>g.items.length<=3));assert.ok(Buffer.byteLength(JSON.stringify(groups))<16000);
 for(const name of ['editorial','resume']){const file=new URL('../public/media/home-product/space-'+name+'.webp',import.meta.url);assert.ok(fs.statSync(file).size>1000);const origin=JSON.parse(fs.readFileSync(new URL(file.href+'.json'),'utf8'));assert.match(origin.prompt,/Actual screenshot of IAVSE built-in/);}
});


test('spatial chapters follow bounded native scroll positions and SSR retains every chapter in reading order',async()=>{
 assert.equal(spatial.spatialChapterAt(100,100,1000,3),0);
 assert.equal(spatial.spatialChapterAt(600,100,1000,3),1);
 assert.equal(spatial.spatialChapterAt(1100,100,1000,3),2);
 assert.equal(spatial.spatialChapterAt(-300,100,1000,3),0);
 assert.equal(spatial.spatialChapterAt(99999,100,1000,3),2);
 assert.equal(spatial.spatialChapterAt(NaN,100,1000,3),0);
 assert.equal(spatial.spatialChapterAt(300,100,0,3),0);
 const html=await render();assert.ok(html.includes('class="hs-journey" data-spatial="false"'));
 assert.deepEqual([...html.matchAll(/class="hs-panel" data-scene="([^"]+)"/g)].map(match=>match[1]),['discover','community-product','spaces']);
 assert.ok(!html.includes('inert=""'),'server content stays usable before enhancement');
});
