import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseDocument,DomUtils} from 'htmlparser2';
import ts from 'typescript';

const source=ts.transpileModule(readFileSync(new URL('../src/components/BlogProductShowcase.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const element=React.createElement;
const find=(node,predicate)=>DomUtils.findAll(n=>n.type==='tag'&&predicate(n),node.children||[]);
const text=node=>DomUtils.textContent(node);
function render(locale='zh'){
 const modules={
  'react/jsx-runtime':runtime,
  'next/link':{default:({href,children,prefetch,...props})=>element('a',{href,...props},children)},
  './Icons':{Icon:()=>null},'@/app/blog-space-product.css':{}
 },exports={};
 vm.runInNewContext(source,{exports,require:name=>{assert.ok(Object.hasOwn(modules,name),'Unexpected dependency '+name);return modules[name];}});
 const html=renderToStaticMarkup(element(exports.BlogProductShowcase,{locale}));
 return{html,document:parseDocument(html)};
}

test('the replacement introduction explains real capabilities without mounting old demos or another creator directory',()=>{
 const{document,html}=render();
 assert.equal(find(document,n=>n.attribs.id==='blog-space-product').length,1,'the gallery scroll target remains a real section');
 for(const label of ['个人主页','作品集','长文与随笔','资源分享','在线履历','允许在平台中发现我的博客'])assert.ok(text(document).includes(label),label);
 const actions=find(document,n=>n.name==='a').map(n=>n.attribs.href);
 assert.deepEqual(actions,['/workspace/blog','/docs/showcase','/workspace/blog','/docs/showcase']);
 assert.equal(find(document,n=>['iframe','script','img','button'].includes(n.name)).length,0,'static feature storytelling adds no downloads, editor widgets or embedded member pages');
 for(const removed of ['data-blog-directory','data-product-showroom','data-local-demo','film-canvas-title','role="tab"'])assert.ok(!html.includes(removed),removed);
 assert.ok(text(document).includes('非交互编辑器'),'the drawn canvas cannot be mistaken for a working editor');
 const ids=find(document,n=>n.attribs.id).map(n=>n.attribs.id);
 for(const section of find(document,n=>n.name==='section'))assert.ok(ids.includes(section.attribs['aria-labelledby']),'sections retain visible accessible headings');
});

test('publishing copy distinguishes a saved draft, manual homepage publishing and reviewed article snapshots',()=>{
 const{document}=render(),content=text(document);
 for(const detail of ['不会替换已经公开的页面','主页、作品与资源由作者手动发布后公开','文章会固定提交的版本，审核通过后公开','保留公开链接而不进入平台目录'])assert.ok(content.includes(detail),detail);
 const steps=find(document,n=>n.name==='ol')[0];assert.equal(find(steps,n=>n.name==='li').length,3);
 const faqs=find(document,n=>n.name==='details');assert.equal(faqs.length,2);
 for(const faq of faqs){assert.equal(find(faq,n=>n.name==='summary').length,1);assert.equal(find(faq,n=>n.name==='p').length,1);assert.ok(!Object.hasOwn(faq.attribs,'open'));}
 assert.ok(content.includes('以内置模板库为准'),'standalone showcase examples do not claim to be installable editor templates');
});

test('all three supported locales retain the complete product story and real creation/help destinations',()=>{
 for(const locale of ['zh','en','ja']){
  const{html,document}=render(locale),content=text(document);
  assert.equal(find(document,n=>Object.hasOwn(n.attribs,'data-blog-space-product'))[0].attribs['data-product-locale'],locale);
  assert.ok(find(document,n=>n.name==='h2').length>=5);
  assert.equal(find(document,n=>n.name==='details').length,2);
  assert.ok(find(document,n=>n.name==='h2'&&n.attribs.id==='blog-product-title').length);
  for(const href of ['/workspace/blog','/docs/showcase'])assert.equal(find(document,n=>n.name==='a'&&n.attribs.href===href).length,2);
  for(const marker of ['undefined','NaN','hello@example.com'])assert.ok(!html.includes(marker));
  assert.ok(content.length>600,locale+' includes full explanations');
 }
 assert.equal(text(render('unknown').document),text(render('zh').document),'unknown locale safely uses the complete Chinese copy');
});

test('progressive entry opts in readable chunks while server output, diagrams and tall section containers remain at rest',()=>{
 for(const locale of ['zh','en','ja']){
  const{document}=render(locale),has=(node,key)=>Object.hasOwn(node.attribs||{},key),items=find(document,node=>has(node,'data-rbp-reveal-item'));
  assert.equal(find(document,node=>has(node,'data-rbp-reveal-scope')).length,1);
  assert.ok(items.length>=20,'the story reveals paragraphs and list rows instead of waiting for a tall mobile section');
  for(const item of items){
   assert.notEqual(item.name,'section');assert.ok(text(item).trim());
   for(let ancestor=item.parent;ancestor;ancestor=ancestor.parent)assert.ok(!has(ancestor,'data-rbp-reveal-item'),'a readable chunk cannot inherit another chunk entrance');
  }
  for(const diagram of find(document,node=>node.name==='figure'||node.attribs.role==='img')){
   assert.ok(!has(diagram,'data-rbp-reveal-item'));
   assert.equal(find(diagram,node=>has(node,'data-rbp-reveal-item')).length,0,'miniature diagram contents stay out of the reveal owner');
  }
  for(const node of find(document,node=>true)){
   assert.ok(!has(node,'data-rbp-reveal'),'SSR has no hidden pending state');
   assert.ok(!node.attribs.style?.includes('opacity'),'content remains visible before enhancement or with JavaScript disabled');
  }
  assert.ok(find(document,node=>node.name==='details').every(node=>has(node,'data-rbp-reveal-item')),'FAQ controls share the focus-recoverable chunk');
 }
});
