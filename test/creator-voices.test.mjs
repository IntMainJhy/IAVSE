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
  if(name==='./Icons')return{Icon:()=>React.createElement('svg',{'aria-hidden':'true'})};
  throw Error(name);
 }});
 return exports.CreatorVoices;
}
const descendants=node=>[node,...(node.children||[]).flatMap(descendants)];

test('creator comments form one accessible native gallery with six unique examples and browsing controls',()=>{
 for(const [locale,title]of[['zh','创作者的声音'],['en','Made for voices like yours.'],['ja','クリエイターの声']]){
  const html=renderToStaticMarkup(React.createElement(load(locale))),nodes=descendants(parseDocument(html));
  assert.ok(html.includes(title));assert.equal(nodes.filter(node=>node.name==='figure').length,6);
  assert.equal(nodes.filter(node=>node.name==='blockquote').length,6,'each example appears once, without marquee clones');
  const rows=nodes.filter(node=>node.attribs?.class==='creator-voices-row');assert.equal(rows.length,1);
  assert.equal(rows[0].attribs.tabindex,'0');assert.equal(rows[0].attribs.role,'region');assert.ok(rows[0].attribs['aria-label']);
  const controls=nodes.filter(node=>node.name==='button');assert.equal(controls.length,2);
  assert.ok(controls.every(node=>node.attribs['aria-controls']==='creator-voices-gallery'&&node.attribs['aria-label']));
  assert.ok(Object.hasOwn(controls[0].attribs,'disabled'));assert.ok(!Object.hasOwn(controls[1].attribs,'disabled'));
  assert.equal(nodes.filter(node=>node.attribs?.class==='creator-voices-group').length,0,'there are no repeated track groups');
 }
});

function motionFixture(){
 const target=()=>{const listeners=new Map();return{listeners,addEventListener:(type,listener)=>listeners.set(type,listener),removeEventListener:(type,listener)=>{if(listeners.get(type)===listener)listeners.delete(type);},emit:(type,event={})=>listeners.get(type)?.(event)}};
 const attributes=new Set(),document={...target(),hidden:false,documentElement:{hasAttribute:name=>attributes.has(name)}},window=target(),preference={...target(),matches:false},values=[],refs=[];let cursor=0,refCursor=0,effect,observer,sizeObserver,tree;
 const calls=[],gallery={scrollLeft:0,clientWidth:960,scrollWidth:2424,children:[{offsetLeft:40},{offsetLeft:448}],scrollBy(options){calls.push(['by',options]);this.scrollLeft=Math.max(0,Math.min(this.scrollWidth-this.clientWidth,this.scrollLeft+options.left));},scrollTo(options){calls.push(['to',options]);this.scrollLeft=options.left;}};
 const react={useRef:initial=>{const index=refCursor++;return refs[index]??=( {current:initial});},useEffect:fn=>{effect??=fn;},useState:initial=>{const index=cursor++;if(!(index in values))values[index]=initial;return[values[index],value=>{values[index]=typeof value==='function'?value(values[index]):value;}];}};
 const Component=load('zh',react,{document,window,matchMedia:()=>preference,localStorage:{getItem:()=>null},IntersectionObserver:class{constructor(callback){this.callback=callback;observer=this;}observe(){}disconnect(){this.disconnected=true;}},ResizeObserver:class{constructor(callback){this.callback=callback;sizeObserver=this;}observe(){}disconnect(){this.disconnected=true;}}});
 const render=()=>{cursor=refCursor=0;tree=Component();return tree.props;};
 assert.equal(render()['data-paused'],true);refs[0].current={};refs[1].current=gallery;const cleanup=effect();
 const row=()=>render().children[1].props,buttons=()=>render().children[2].props.children.map(node=>node.props);
 return{render,cleanup,observer,get sizeObserver(){return sizeObserver;},document,window,preference,attributes,gallery,calls,row,buttons};
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

test('route handoffs pause the gallery entrance until the current root releases, preserving manual and visibility pauses',()=>{
 const f=motionFixture(),navigate=pending=>f.window.emit('iavse-navigation-pending',{detail:{pending}});f.observer.callback([{isIntersecting:true}]);assert.equal(f.render()['data-paused'],false);
 f.attributes.add('data-iavse-transition');navigate(true);assert.equal(f.render()['data-paused'],true);navigate(false);assert.equal(f.render()['data-paused'],true,'an old page cannot release the current transition');
 f.document.emit('visibilitychange');assert.equal(f.render()['data-paused'],true);f.attributes.delete('data-iavse-transition');f.window.emit('iavse-scene-control',{detail:{action:'paused',value:true}});navigate(false);assert.equal(f.render()['data-paused'],true);f.window.emit('iavse-scene-control',{detail:{action:'paused',value:false}});assert.equal(f.render()['data-paused'],false);f.cleanup();assert.equal(f.window.listeners.size,0);
});

test('every selected portrait exists and all six examples keep their original identities',()=>{
 const html=renderToStaticMarkup(React.createElement(load('en'))),nodes=descendants(parseDocument(html));
 const cards=nodes.filter(node=>node.name==='figure');assert.equal(cards.length,6);
 for(const name of ['Mira','Lin','Noah','Aya','Leo','Sora'])assert.ok(html.includes(name));
 const portraits=new Set(nodes.filter(node=>node.name==='img').map(node=>node.attribs.src));assert.equal(portraits.size,6);
 for(const portrait of portraits){const asset=new URL('../public'+portrait,import.meta.url);assert.ok(fs.existsSync(asset),'missing portrait: '+portrait);assert.match(fs.readFileSync(asset,'utf8'),/<svg\b/);}
});


test('arrow and keyboard navigation move one card, preserve vertical keys and respect reduced motion',()=>{
 const f=motionFixture();
 f.buttons()[1].onClick();assert.deepEqual(JSON.parse(JSON.stringify(f.calls.at(-1))),['by',{left:408,behavior:'smooth'}]);
 f.row().onScroll();assert.equal(f.buttons()[0].disabled,false);
 const target={};let prevented=0;
 f.row().onKeyDown({target,currentTarget:target,key:'ArrowLeft',preventDefault(){prevented++;}});assert.equal(prevented,1);assert.equal(f.gallery.scrollLeft,0);f.row().onScroll();assert.equal(f.buttons()[0].disabled,true);
 f.row().onKeyDown({target,currentTarget:target,key:'End',preventDefault(){prevented++;}});assert.equal(f.gallery.scrollLeft,1464);f.row().onScroll();assert.equal(f.buttons()[1].disabled,true);
 f.row().onKeyDown({target,currentTarget:target,key:'ArrowDown',preventDefault(){prevented++;}});assert.equal(prevented,2,'vertical keys remain native page scrolling');
 f.preference.matches=true;f.preference.emit('change');f.buttons()[0].onClick();assert.equal(f.calls.at(-1)[1].behavior,'auto');
 f.gallery.clientWidth=1200;f.sizeObserver.callback();assert.equal(f.buttons()[1].disabled,false,'resize refreshes cached bounds');
 f.cleanup();assert.equal(f.sizeObserver.disconnected,true);
});
