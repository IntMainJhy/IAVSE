import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseDocument} from 'htmlparser2';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync(new URL('../src/components/ProductCinema.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const walk=node=>[node,...(node.children||[]).flatMap(walk)];
function render(variant,chapter){
 let state=0;const exports={};
 vm.runInNewContext(source,{exports,require:name=>{
  if(name==='react')return{...React,useEffect:()=>{},useRef:()=>({current:null}),useId:()=>variant,useState:value=>{const index=state++;return[index===0?'space':index===1?chapter:value,()=>{}];}};
  if(name==='react/jsx-runtime')return runtime;
  if(name==='next/link')return{default:({href,children})=>React.createElement('a',{href},children)};
  if(name==='gsap')return{gsap:{}};if(name==='./Icons')return{Icon:()=>null};if(name.endsWith('.css'))return{};throw Error(name);
 }});
 return walk(parseDocument(renderToStaticMarkup(React.createElement(exports.ProductCinema,{locale:'zh',variant}))));
}
test('every spatial chapter paints one full scene and exposes its selected chapter and keyboard rotation control',()=>{
 for(const variant of ['blogs','home','resources'])for(let chapter=0;chapter<3;chapter++){
  const nodes=render(variant,chapter),planes=nodes.filter(n=>n.attribs?.class?.split(' ').includes('product-cinema-plane'));
  assert.equal(planes.length,3);const visible=planes.filter(n=>!Object.hasOwn(n.attribs,'hidden'));assert.equal(visible.length,1,variant+' chapter '+chapter);assert.equal(planes.indexOf(visible[0]),chapter);
  assert.ok(walk(visible[0]).some(n=>n.name==='h3'),'active scene retains its complete heading');
  const chapterGroup=nodes.find(n=>n.attribs?.class==='product-cinema-chapters');assert.equal(walk(chapterGroup).filter(n=>n.name==='button'&&n.attribs['aria-pressed']==='true').length,1);
  assert.ok(nodes.some(n=>n.name==='input'&&n.attribs.type==='range'&&n.attribs['aria-label']==='转动视角'));
  assert.ok(nodes.some(n=>n.name==='button'&&n.attribs['aria-label']==='重置视角'));
 }
});
