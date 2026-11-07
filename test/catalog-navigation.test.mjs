import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/CatalogNavigation.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function fixture({overflow=true}={}){
 const effects=[],frames=new Map(),observed=[],exports={};let id=0,observer,reads=0,disconnects=0,left=500,width=100;
 const selected={getBoundingClientRect(){reads++;return{left:left-nav.scrollLeft,right:left-nav.scrollLeft+width};}};
 const nav={clientWidth:280,scrollWidth:overflow?700:280,scrollLeft:0,scrollTop:41,querySelector:()=>selected,getBoundingClientRect(){reads++;return{left:0,right:280};}};
 vm.runInNewContext(source,{exports,requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key),ResizeObserver:class{constructor(fn){observer=fn;}observe(node){observed.push(node);}disconnect(){disconnects++;}},require:name=>{
  if(name==='react')return{useRef:()=>({current:nav}),useLayoutEffect:fn=>effects.push(fn)};
  if(name==='react/jsx-runtime')return{jsx:(_,props)=>props};
  throw Error('Unexpected dependency '+name);
 }});
 const props=exports.CatalogNavigation({active:'last',label:'Scopes',children:'links'}),cleanup=effects[0]();
 return{nav,selected,props,cleanup,frames,observed,resize:()=>observer(),widen:()=>{width=160;},step:()=>{const scheduled=[...frames.values()];frames.clear();scheduled.forEach(fn=>fn());},get reads(){return reads},get disconnects(){return disconnects}};
}

test('an offscreen current catalog choice is revealed before paint without moving the page vertically',()=>{
 const s=fixture(),rect=s.selected.getBoundingClientRect();
 assert.equal(s.props['aria-label'],'Scopes');assert.ok(s.nav.scrollLeft>0);
 assert.ok(rect.left>=0&&rect.right<=s.nav.clientWidth);assert.equal(s.nav.scrollTop,41);
 assert.ok(s.observed.includes(s.nav)&&s.observed.includes(s.selected),'font and count width changes must also be observed');s.cleanup();
});

test('selected-label resize bursts share one frame and pending reads cannot run after unmount',()=>{
 const s=fixture(),before=s.reads;s.widen();for(let n=0;n<10;n++)s.resize();
 assert.equal(s.frames.size,1);assert.equal(s.reads,before,'observer callbacks do not force layout');s.step();
 assert.ok(s.selected.getBoundingClientRect().right<=s.nav.clientWidth,'a widened current label stays visible');
 s.resize();assert.equal(s.frames.size,1);s.cleanup();assert.equal(s.frames.size,0);assert.equal(s.disconnects,1);
 const stopped=s.reads;s.resize();s.step();assert.equal(s.reads,stopped);assert.equal(s.nav.scrollTop,41);
});

test('fully visible catalog scopes skip rectangle reads and preserve the scroll position',()=>{
 const s=fixture({overflow:false});assert.equal(s.reads,0);s.resize();s.step();assert.equal(s.reads,0);assert.equal(s.nav.scrollLeft,0);s.cleanup();
});
