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

test('server-rendered comments remain a readable six-example gallery before motion preferences are known',()=>{
 for(const [locale,title]of[['zh','创作者的声音'],['en','Made for voices like yours.'],['ja','クリエイターの声']]){
  const html=renderToStaticMarkup(React.createElement(load(locale))),nodes=descendants(parseDocument(html));
  assert.ok(html.includes(title));assert.equal(nodes.filter(node=>node.name==='figure').length,6);
  assert.equal(nodes.filter(node=>node.name==='blockquote').length,6,'the quiet server render needs no duplicate track');
  const rows=nodes.filter(node=>node.attribs?.class==='creator-voices-row');assert.equal(rows.length,1);
  assert.equal(rows[0].attribs.tabindex,'0');assert.equal(rows[0].attribs.role,'region');assert.ok(rows[0].attribs['aria-label']);
  const controls=nodes.filter(node=>node.name==='button');assert.equal(controls.length,2);
  assert.ok(controls.every(node=>node.attribs['aria-controls']==='creator-voices-gallery'&&node.attribs['aria-label']));
  assert.ok(Object.hasOwn(controls[0].attribs,'disabled'));assert.ok(!Object.hasOwn(controls[1].attribs,'disabled'));
  assert.ok(html.includes(locale==='zh'?'示例评论':locale==='ja'?'デモ用のコメント':'Illustrative comments'),'examples never masquerade as real testimonials');
 }
});

function motionFixture({locale='zh',savedMotion=null,initialReduced=false}={}){
 const target=()=>{const listeners=new Map();return{listeners,addEventListener:(type,listener)=>listeners.set(type,listener),removeEventListener:(type,listener)=>{if(listeners.get(type)===listener)listeners.delete(type);},emit:(type,event={})=>listeners.get(type)?.(event)}};
 const attributes=new Set(),document={...target(),hidden:false,documentElement:{hasAttribute:name=>attributes.has(name)}},window=target(),preference={...target(),matches:initialReduced},hooks=[],frames=new Map(),calls=[];
 let cursor=0,pending=[],observer,sizeObserver,tree,dirty=false,frameId=0,position=0;
 const cards=[{offsetLeft:40},{offsetLeft:448}],gallery={clientWidth:960,scrollWidth:2424,children:cards,firstElementChild:cards[0],contains:target=>target===gallery||cards.includes(target),get scrollLeft(){return position;},set scrollLeft(value){position=Math.max(0,Math.min(this.scrollWidth-this.clientWidth,value));},scrollBy(options){calls.push(['by',options]);this.scrollLeft+=options.left;},scrollTo(options){calls.push(['to',options]);this.scrollLeft=options.left;}};
 const same=(a,b)=>a&&b&&a.length===b.length&&a.every((value,index)=>Object.is(value,b[index]));
 const react={
  useRef:initial=>{const slot=cursor++;return hooks[slot]??={current:initial};},
  useState:initial=>{const slot=cursor++;if(!hooks[slot])hooks[slot]={value:initial};return[hooks[slot].value,value=>{const next=typeof value==='function'?value(hooks[slot].value):value;if(!Object.is(next,hooks[slot].value)){hooks[slot].value=next;dirty=true;}}];},
  useEffect:(fn,deps)=>{const slot=cursor++,old=hooks[slot];if(!old||!same(old.deps,deps))pending.push({slot,fn,deps});}
 };
 const Component=load(locale,react,{document,window,matchMedia:()=>preference,localStorage:{getItem:()=>savedMotion},requestAnimationFrame:callback=>{frames.set(++frameId,callback);return frameId;},cancelAnimationFrame:id=>frames.delete(id),IntersectionObserver:class{constructor(callback){this.callback=callback;observer=this;}observe(){}disconnect(){this.disconnected=true;}},ResizeObserver:class{constructor(callback){this.callback=callback;this.observed=[];sizeObserver=this;}observe(element){this.observed.push(element);}disconnect(){this.disconnected=true;}}});
 const draw=()=>{cursor=0;pending=[];tree=Component();return tree.props;};
 assert.equal(draw()['data-paused'],true);
 hooks[0].current={};hooks[1].current=gallery;
 const commit=()=>{for(const {slot,fn,deps}of pending){hooks[slot]?.cleanup?.();hooks[slot]={deps,cleanup:fn()};}};
 const render=()=>{let passes=0;do{assert.ok(++passes<8,'effects settle');dirty=false;draw();gallery.scrollWidth=tree.props['data-quiet']?2424:4872;gallery.scrollLeft=gallery.scrollLeft;commit();}while(dirty);return tree.props;};
 commit();render();
 const row=()=>render().children[1].props,buttons=()=>render().children[2].props.children.filter(Boolean).map(node=>node.props);
 const tick=now=>{const queued=[...frames.values()];frames.clear();for(const callback of queued)callback(now);};
 const cleanup=()=>{for(const hook of hooks)hook?.cleanup?.();};
 return{render,cleanup,observer,get sizeObserver(){return sizeObserver;},document,window,preference,attributes,gallery,calls,row,buttons,frames,tick};
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


test('arrow and keyboard browsing pause autoplay, loop between cards, and leave vertical keys alone',()=>{
 const f=motionFixture();f.observer.callback([{isIntersecting:true}]);f.render();
 f.buttons()[1].onClick();assert.deepEqual(JSON.parse(JSON.stringify(f.calls.at(-1))),['by',{left:408,behavior:'smooth'}]);
 assert.equal(f.render()['data-paused'],true);assert.equal(f.frames.size,0,'manual browsing cancels the automatic ticker');
 f.row().onScroll();assert.equal(f.buttons()[0].disabled,false);
 const target={};let prevented=0;
 const press=key=>f.row().onKeyDown({target,currentTarget:target,key,preventDefault(){prevented++;}});
 press('ArrowLeft');assert.equal(prevented,1);assert.equal(f.gallery.scrollLeft,0);
 press('ArrowLeft');assert.equal(f.gallery.scrollLeft,2040,'previous from the first card wraps to the last example');
 press('Home');assert.equal(f.gallery.scrollLeft,0);
 press('End');assert.equal(f.gallery.scrollLeft,2040,'End selects the final original example, not the end of the clone track');
 const before=prevented;press('ArrowDown');assert.equal(prevented,before,'vertical keys remain native page scrolling');
 f.row().onKeyDown({target:{},currentTarget:target,key:'ArrowRight',preventDefault(){prevented++;}});assert.equal(prevented,before,'nested controls retain their own keyboard behavior');
 f.cleanup();
});

test('reduced motion keeps bounded native browsing, immediate moves and current resize limits',()=>{
 const f=motionFixture({initialReduced:true});assert.equal(f.row().children.length,6);assert.equal(f.buttons().length,2);assert.equal(f.buttons()[0].disabled,true);
 f.buttons()[1].onClick();assert.deepEqual(JSON.parse(JSON.stringify(f.calls.at(-1))),['by',{left:408,behavior:'auto'}]);
 const target={};f.row().onKeyDown({target,currentTarget:target,key:'End',preventDefault(){}});f.row().onScroll();assert.equal(f.gallery.scrollLeft,1464);assert.equal(f.buttons()[1].disabled,true);
 f.gallery.clientWidth=1200;f.sizeObserver.callback();f.render();f.row().onScroll();assert.equal(f.gallery.scrollLeft,1224);assert.equal(f.buttons()[1].disabled,true);
 f.buttons()[0].onClick();f.row().onScroll();assert.equal(f.buttons()[1].disabled,false);assert.equal(f.frames.size,0);
 assert.ok(f.sizeObserver.observed.includes(f.gallery.firstElementChild),'card resize changes can update the loop distance');
 f.cleanup();assert.equal(f.sizeObserver.disconnected,true);
});

test('animated track repeats visuals but exposes every example exactly once to assistive technology',()=>{
 for(const locale of ['zh','en','ja']){
  const f=motionFixture({locale}),cards=f.row().children;
  assert.equal(cards.length,12);assert.equal(cards.filter(card=>card.props['aria-hidden']!==true).length,6);
  for(let index=0;index<6;index++){
   assert.equal(cards[index].props['aria-hidden'],undefined);assert.equal(cards[index+6].props['aria-hidden'],true);
   assert.equal(cards[index].props.children[0].props.children,cards[index+6].props.children[0].props.children);
  }
  const controls=f.buttons();assert.equal(controls.length,3);assert.ok(controls.every(button=>button['aria-label']&&button['aria-controls']==='creator-voices-gallery'));
  f.preference.matches=true;f.preference.emit('change');assert.equal(f.row().children.length,6);assert.equal(f.buttons().length,2);f.cleanup();
 }
 const saved=motionFixture({savedMotion:'reduce'});assert.equal(saved.render()['data-quiet'],true);assert.equal(saved.row().children.length,6);assert.equal(saved.frames.size,0);saved.cleanup();
});

test('autoplay moves continuously, wraps seamlessly and restarts without accumulating hidden time',()=>{
 const f=motionFixture();assert.equal(f.frames.size,0);f.gallery.scrollLeft=2447;
 f.observer.callback([{isIntersecting:true}]);f.render();assert.equal(f.frames.size,1);
 f.tick(100);f.tick(150);assert.ok(Math.abs(f.gallery.scrollLeft-.4)<.001,'crossing the six-card cycle wraps to the identical first card');
 f.tick(200);assert.ok(Math.abs(f.gallery.scrollLeft-1.8)<.001);
 f.tick(10000);assert.ok(Math.abs(f.gallery.scrollLeft-3.592)<.001,'a delayed frame has bounded movement');
 f.document.hidden=true;f.document.emit('visibilitychange');f.render();assert.equal(f.frames.size,0);const held=f.gallery.scrollLeft;f.tick(20000);assert.equal(f.gallery.scrollLeft,held);
 f.document.hidden=false;f.document.emit('visibilitychange');f.render();f.tick(30000);assert.equal(f.gallery.scrollLeft,held,'resume begins at the held position');f.tick(30050);assert.ok(Math.abs(f.gallery.scrollLeft-held-1.4)<.001);
 f.cleanup();assert.equal(f.frames.size,0,'unmount cancels the only scheduled frame');
});

test('hover and focus suspend motion temporarily while pause, touch and horizontal wheel persist',()=>{
 const f=motionFixture();f.observer.callback([{isIntersecting:true}]);f.render();assert.equal(f.frames.size,1);
 f.render().onMouseEnter();assert.equal(f.render()['data-paused'],true);assert.equal(f.frames.size,0);
 f.render().onMouseLeave();assert.equal(f.render()['data-paused'],false);
 f.render().onFocusCapture({target:f.gallery});assert.equal(f.render()['data-paused'],true);
 f.render().onBlurCapture({currentTarget:{contains:()=>true},relatedTarget:{}});assert.equal(f.render()['data-paused'],true,'focus moving within the region keeps it still');
 f.render().onBlurCapture({currentTarget:{contains:()=>false},relatedTarget:null});assert.equal(f.render()['data-paused'],false);
 f.buttons()[2].onClick();assert.equal(f.render()['data-paused'],true);assert.equal(f.buttons()[2]['aria-pressed'],true);assert.equal(f.buttons()[2]['aria-label'],'继续滚动');
 f.render().onMouseEnter();f.render().onMouseLeave();assert.equal(f.render()['data-paused'],true,'pointer exit does not override an explicit pause');
 f.buttons()[2].onClick();assert.equal(f.render()['data-paused'],false);
 f.row().onWheel({deltaX:0,deltaY:100});assert.equal(f.render()['data-paused'],false,'vertical scrolling does not change the preference');
 f.row().onWheel({deltaX:100,deltaY:0});assert.equal(f.render()['data-paused'],true);f.buttons()[2].onClick();f.render();
 f.row().onTouchStart();assert.equal(f.render()['data-paused'],true);assert.equal(f.frames.size,0);f.cleanup();
});

test('switching to reduced motion refreshes bounds after clones disappear without a viewport resize',()=>{
 const f=motionFixture();f.gallery.clientWidth=900;f.sizeObserver.callback();f.render();
 f.gallery.scrollLeft=2400;f.row().onScroll();assert.equal(f.buttons()[1].disabled,false);
 f.preference.matches=true;f.preference.emit('change');f.render();
 assert.equal(f.row().children.length,6);assert.equal(f.gallery.scrollLeft,1524,'the native scroll position clamps to the shorter quiet gallery');
 assert.equal(f.buttons()[1].disabled,true,'quiet-mode activation updates bounds even if ResizeObserver does not fire');
 f.gallery.scrollLeft=0;f.row().onScroll();assert.equal(f.buttons()[0].disabled,true);assert.equal(f.buttons()[1].disabled,false);
 f.preference.matches=false;f.preference.emit('change');assert.equal(f.row().children.length,12);assert.ok(f.buttons().slice(0,2).every(button=>button.disabled===false));f.cleanup();
});
