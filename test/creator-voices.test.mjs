import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseDocument} from 'htmlparser2';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/CreatorVoices.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function load(locale,react=React,globals={}){
 const exports={};
 vm.runInNewContext(source,{exports,...globals,require:name=>{
  if(name==='react')return react;
  if(name==='react/jsx-runtime')return runtime;
  if(name==='./LocaleProvider')return{useLocale:()=>({locale})};
  throw Error(name);
 }});
 return exports.CreatorVoices;
}
const descendants=node=>[node,...(node.children||[]).flatMap(descendants)];

test('creator comments keep six accessible examples in every language without a pause button',()=>{
 for(const [locale,title]of[['zh','创作者的声音'],['en','Made for voices like yours.'],['ja','クリエイターの声']]){
  const html=renderToStaticMarkup(React.createElement(load(locale))),nodes=descendants(parseDocument(html));
  assert.ok(html.includes(title));assert.equal(nodes.filter(node=>node.name==='button').length,0);
  const rows=nodes.filter(node=>node.attribs?.class==='creator-voices-row');assert.equal(rows.length,2);
  for(const row of rows){assert.equal(row.attribs.tabindex,'0');assert.equal(row.attribs.role,'region');assert.ok(row.attribs['aria-label'].startsWith(title));}
  const groups=nodes.filter(node=>node.attribs?.class==='creator-voices-group'),copies=groups.filter(node=>node.attribs['aria-hidden']==='true');
  assert.equal(copies.length,2);
  assert.ok(copies.every(node=>descendants(node).every(child=>!['a','button','input','select','textarea'].includes(child.name)&&!Object.hasOwn(child.attribs||{},'tabindex'))),'visual loop copies must not add keyboard stops');
  assert.equal(groups.filter(node=>!copies.includes(node)).flatMap(descendants).filter(node=>node.name==='figure').length,6);
 }
});

function motionFixture(){
 const target=()=>{const listeners=new Map();return{listeners,addEventListener:(type,listener)=>listeners.set(type,listener),removeEventListener:(type,listener)=>{if(listeners.get(type)===listener)listeners.delete(type);},emit:(type,event={})=>listeners.get(type)?.(event)}};
 const attributes=new Set(),document={...target(),hidden:false,documentElement:{hasAttribute:name=>attributes.has(name)}},window=target(),preference={...target(),matches:false},values=[];let cursor=0,effect,observer;
 const react={useRef:()=>({current:{}}),useEffect:fn=>{effect??=fn;},useState:initial=>{const index=cursor++;if(!(index in values))values[index]=initial;return[values[index],value=>{values[index]=typeof value==='function'?value(values[index]):value;}];}};
 const Component=load('zh',react,{document,window,matchMedia:()=>preference,localStorage:{getItem:()=>null},IntersectionObserver:class{constructor(callback){this.callback=callback;observer=this;}observe(){}disconnect(){this.disconnected=true;}}});
 const render=()=>{cursor=0;return Component().props;};
 assert.equal(render()['data-paused'],true);const cleanup=effect();
 return{render,cleanup,observer,document,window,preference,attributes};
}
test('entry reveals once; hidden tabs and offscreen comments pause without resetting motion preferences',()=>{
 const{render,cleanup,observer,document,window,preference}=motionFixture();
 observer.callback([{isIntersecting:true}]);assert.equal(render()['data-paused'],false);assert.equal(render()['data-entered'],true);
 observer.callback([{isIntersecting:false}]);assert.equal(render()['data-paused'],true);assert.equal(render()['data-entered'],true);
 observer.callback([{isIntersecting:true}]);document.hidden=true;document.emit('visibilitychange');
 assert.equal(render()['data-paused'],true);assert.equal(render()['data-quiet'],false,'a hidden tab pauses instead of switching to a different layout');
 document.hidden=false;document.emit('visibilitychange');assert.equal(render()['data-paused'],false);
 preference.matches=true;preference.emit('change');assert.equal(render()['data-quiet'],true);
 preference.matches=false;preference.emit('change');assert.equal(render()['data-paused'],false);
 window.emit('iavse-scene-control',{detail:{action:'paused',value:true}});assert.equal(render()['data-paused'],true);
 window.emit('iavse-scene-control',{detail:{action:'paused',value:false}});assert.equal(render()['data-paused'],false);
 window.emit('iavse-scene-control',{detail:{action:'reduced',value:true}});assert.equal(render()['data-quiet'],true);
 cleanup();assert.equal(observer.disconnected,true);for(const item of[document,window,preference])assert.equal(item.listeners.size,0);
});

test('already-visible cards never replay an entrance after hydration or re-entry; a future entrance remains gentle',()=>{
 const restored=motionFixture();restored.observer.callback([{isIntersecting:true}]);assert.equal(restored.render()['data-entered'],true);assert.equal(restored.render()['data-arrival'],false);restored.observer.callback([{isIntersecting:false}]);restored.observer.callback([{isIntersecting:true}]);assert.equal(restored.render()['data-arrival'],false);restored.cleanup();
 const future=motionFixture();future.observer.callback([{isIntersecting:false}]);future.observer.callback([{isIntersecting:true}]);assert.equal(future.render()['data-arrival'],true);future.cleanup();
});

test('route handoffs pause the marquee until the current root releases, preserving manual and visibility pauses',()=>{
 const f=motionFixture(),navigate=pending=>f.window.emit('iavse-navigation-pending',{detail:{pending}});f.observer.callback([{isIntersecting:true}]);assert.equal(f.render()['data-paused'],false);
 f.attributes.add('data-iavse-transition');navigate(true);assert.equal(f.render()['data-paused'],true);navigate(false);assert.equal(f.render()['data-paused'],true,'an old page cannot release the current transition');
 f.document.emit('visibilitychange');assert.equal(f.render()['data-paused'],true);f.attributes.delete('data-iavse-transition');f.window.emit('iavse-scene-control',{detail:{action:'paused',value:true}});navigate(false);assert.equal(f.render()['data-paused'],true);f.window.emit('iavse-scene-control',{detail:{action:'paused',value:false}});assert.equal(f.render()['data-paused'],false);f.cleanup();assert.equal(f.window.listeners.size,0);
});

test('every dynamically selected portrait exists and examples retain six distinct material tones',()=>{
 const html=renderToStaticMarkup(React.createElement(load('en'))),nodes=descendants(parseDocument(html));
 const cards=nodes.filter(node=>node.name==='figure'),tones=new Set(cards.map(node=>node.attribs['data-tone']));assert.equal(tones.size,6);
 const portraits=new Set(nodes.filter(node=>node.name==='img').map(node=>node.attribs.src));assert.equal(portraits.size,6);
 for(const portrait of portraits){const asset=new URL('../public'+portrait,import.meta.url);assert.ok(fs.existsSync(asset),'missing portrait: '+portrait);assert.match(fs.readFileSync(asset,'utf8'),/<svg\b/);}
});
