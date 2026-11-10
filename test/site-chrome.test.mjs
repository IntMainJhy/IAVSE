import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseDocument,DomUtils} from 'htmlparser2';
import * as jsx from 'react/jsx-runtime';
const read=name=>fs.readFileSync(new URL('../src/app/'+name,import.meta.url),'utf8');

// Previous frosted/optical header assertions were retired with those platform skins.
// Actual rendered navigation semantics remain covered below.
function renderTemplateNav(pathname,items){
 const source=fs.readFileSync(new URL('../src/components/rbp/layout/nav.tsx',import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={},modules={
  react:React,'react/jsx-runtime':jsx,'next/navigation':{usePathname:()=>pathname},
  'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
  'lucide-react':{Sun:()=>null,Moon:()=>null},
  'motion/react':{motion:{span:({initial,animate,transition,children,...props})=>React.createElement('span',props,children)}},
 };
 vm.runInNewContext(code,{exports,require:key=>{assert.ok(Object.hasOwn(modules,key),key);return modules[key]}});
 return parseDocument(renderToStaticMarkup(React.createElement(exports.Nav,{items,locale:'en',label:'Primary'})));
}

test('upstream navigation keeps accessible current-page and parent-location links in every route state',()=>{
 const items=[{href:'/',label:'Home'},{href:'/resources',label:'Resources'},{href:'/community',label:'Community'},{href:'/blogs',label:'Blog spaces'}];
 for(const [pathname,href,current]of [['/','/','page'],['/resources','/resources','page'],['/community/post-1','/community','location'],['/unlisted',null,null]]){
  const document=renderTemplateNav(pathname,items),links=DomUtils.findAll(node=>node.type==='tag'&&node.name==='a',document.children),selected=links.filter(node=>node.attribs['aria-current']);
  assert.deepEqual(links.map(node=>node.attribs.href),items.map(item=>item.href));
  assert.deepEqual(links.map(node=>DomUtils.textContent(node)),items.map(item=>item.label));
  assert.equal(selected.length,href?1:0);
  if(href){assert.equal(selected[0].attribs.href,href);assert.equal(selected[0].attribs['aria-current'],current);}
  const nav=DomUtils.findAll(node=>node.type==='tag'&&node.name==='nav',document.children);assert.equal(nav.length,1);assert.equal(nav[0].attribs['aria-label'],'Primary');
  assert.equal(DomUtils.findAll(node=>node.type==='tag'&&node.name==='button'&&node.attribs.type==='button',document.children).length,1,'theme switch remains a native button');
 }
 const document=renderTemplateNav('/workspace/account',[{href:'/',label:'Home',active:false},{href:'/community',label:'Community',active:true,current:'location'}]);
 const selected=DomUtils.findAll(node=>node.type==='tag'&&node.attribs['aria-current'],document.children);assert.equal(selected.length,1);assert.equal(selected[0].attribs.href,'/community');assert.equal(selected[0].attribs['aria-current'],'location');
 assert.match(read('layout.tsx'),/<PortfolioRuntime\s*\/>/,'route scrolling and backdrop enhancement are owned by the shared root');
});
