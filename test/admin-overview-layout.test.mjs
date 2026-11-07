import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseDocument} from 'htmlparser2';
import ts from 'typescript';

const source=ts.transpileModule(readFileSync(new URL('../src/components/AdminOverview.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const element=React.createElement,walk=node=>[node,...(node.children||[]).flatMap(walk)],text=node=>node.type==='text'?node.data:(node.children||[]).map(text).join('');
const reviewRoutes=['catalog','reviews','comments','spaces','reports'].map(path=>'/admin/community/'+path);
function render({pending={},recent=[]}={}){
 const data={audience:{users:2,publicContent:3,publicSpaces:1,trafficToday:{uv:2,pv:5},trafficAll:{pv:19},timezone:'Asia/Shanghai'},totals:{content:4,bytes:1536},pending:{catalog:0,posts:0,comments:0,spaces:0,reports:0,...pending},recent};
 const wrapper=({children,className})=>element('div',{className},children);
 const modules={
  'react/jsx-runtime':runtime,
  'next/link':{default:({href,children,prefetch,...props})=>element('a',{href,...props},children)},
  './react-bits/SpotlightCard':{default:wrapper},'./react-bits/AnimatedContent':{default:wrapper},'./react-bits/StarBorder':{default:({children,className,...props})=>element('button',{className,'aria-label':props['aria-label']},children)},
  './AdminAppearance':{useAdminAppearance:()=>({dark:false})},
  './LocaleProvider':{useLocale:()=>({locale:'zh',t:(value,values=[])=>values.reduce((result,item,index)=>result.replaceAll('{'+index+'}',item),value)})},
  './PageResources':{useResource:()=>({data,refresh(){},refreshing:false})},'./Icons':{Icon:()=>null},
  '@/lib/client':{bytes:value=>value+' B'},'@/lib/locale-format.mjs':{localeDate:value=>value},'./AdminOverview.module.css':{default:{overview:'overview'}}
 };
 const exports={};vm.runInNewContext(source,{exports,require:name=>{if(!Object.hasOwn(modules,name))throw Error('Unexpected dependency '+name);return modules[name];}});
 const html=renderToStaticMarkup(element(exports.AdminOverview)),nodes=walk(parseDocument(html));
 const disclosure=label=>nodes.find(node=>node.name==='details'&&(node.children||[]).some(child=>child.name==='summary'&&text(child).includes(label)));
 return{html,nodes,disclosure};
}

test('everyday content actions precede recent work and statistics while zero review queues stay collapsed and reachable',()=>{
 const {nodes,disclosure}=render(),review=disclosure('审核与治理'),statistics=disclosure('网站运行概览');
 assert.ok(review);assert.ok(statistics);assert.equal(Object.hasOwn(review.attribs,'open'),false);assert.equal(Object.hasOwn(statistics.attribs,'open'),false);
 const destinations=walk(review).filter(node=>node.name==='a').map(node=>node.attribs.href);
 assert.deepEqual(destinations,reviewRoutes,'collapsing empty queues retains every review destination');
 const recentIndex=nodes.findIndex(node=>node.attribs?.id==='admin-recent-title'),statsIndex=nodes.indexOf(statistics);
 assert.ok(recentIndex<statsIndex,'recent editing remains ahead of secondary statistics');
 for(const href of ['/admin/articles/new','/admin/articles','/admin/projects','/admin/resources','/admin/files']){
  const index=nodes.findIndex(node=>node.name==='a'&&node.attribs.href===href);
  assert.ok(index>=0&&index<recentIndex,href+' is a first-screen action, not buried among statistics');
 }
});

test('pending work opens the review disclosure and reports the aggregate without losing individual queue counts',()=>{
 const {disclosure}=render({pending:{catalog:2,comments:1,reports:3}}),review=disclosure('审核与治理');
 assert.equal(Object.hasOwn(review.attribs,'open'),true);
 const summary=review.children.find(node=>node.name==='summary'),badge=walk(summary).find(node=>node.attribs?.['aria-label']?.startsWith('待处理事项'));
 assert.equal(text(badge),'6');assert.equal(badge.attribs['aria-label'],'待处理事项 6');
 for(const [href,count]of [['/admin/community/catalog','2'],['/admin/community/comments','1'],['/admin/community/reports','3']]){
  const link=walk(review).find(node=>node.name==='a'&&node.attribs.href===href),number=walk(link).find(node=>node.name==='strong');
  assert.equal(text(number),count);assert.equal(number.attribs['data-has-work'],'true');
 }
});

test('recent work keeps real type-specific editing routes and renders titles as safe text',()=>{
 const title='Draft <script>alert(1)</script>',updated='2026-11-07T05:00:00.000Z';
 const {nodes}=render({recent:[{id:'article-id',type:'articles',status:'draft',title,updated},{id:'project-id',type:'projects',status:'published',title:'Project & notes',updated}]});
 for(const href of ['/admin/articles/edit/article-id','/admin/projects/edit/project-id'])assert.ok(nodes.some(node=>node.name==='a'&&node.attribs.href===href),href);
 assert.ok(nodes.some(node=>node.type==='text'&&node.data===title));assert.equal(nodes.some(node=>node.name==='script'),false);
 assert.equal(nodes.filter(node=>node.name==='time'&&node.attribs.datetime===updated).length,2);
});
