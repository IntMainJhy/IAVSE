import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';

const file = new URL('../src/components/useCommunitySidebarMotion.ts', import.meta.url);
const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;

test('desktop rail previews pointer and keyboard targets, returns to the route and respects reduced motion', () => {
  const exports = {}, listeners = new Map(), frames = [];
  const media = () => ({matches:true, addEventListener(type, fn){this.change=fn;}, removeEventListener(){delete this.change;}});
  const desktop=media(), reduced=media();
  reduced.matches=false;
  const pill={style:{}, getBoundingClientRect:()=>({top:Number(pill.style.transform?.match(/translateY\((\d+)/)?.[1] || 0)}),
    animate(keyframes){const animation={keyframes,cancelled:false,cancel(){this.cancelled=true;}};frames.push(animation);return animation;}};
  let cleanup, resize;
  const nav={scrollTop:0,dataset:{},closest:()=>null,querySelector:selector=>selector.includes('indicator')?pill:current,
    querySelectorAll:()=>[current,next],getBoundingClientRect:()=>({top:0}),
    addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
  class Link {
    constructor(y){this.offsetTop=y;this.offsetLeft=0;this.offsetWidth=160;this.offsetHeight=44;this.parentElement=nav;}
    closest(){return this;}
    matches(query){return query===':focus-visible';}
  }
  const current=new Link(0), next=new Link(48);
  vm.runInNewContext(source,{exports,Element:Link,performance:{now:()=>0},document:{activeElement:null},
    matchMedia:query=>query.includes('min-width')?desktop:reduced,
    ResizeObserver:class{constructor(fn){resize=fn;}observe(){}disconnect(){}},
    require:()=>({useLayoutEffect:fn=>{cleanup=fn();}})});
  exports.useCommunitySidebarMotion({current:nav},'feed');
  assert.equal(frames.length,0,'first paint is already aligned');
  assert.equal(pill.style.transform,'translateY(0px)');
  listeners.get('pointerover')({pointerType:'mouse',target:next});
  assert.equal(pill.style.transform,'translateY(48px)');
  resize();assert.equal(frames[0].cancelled,false,'an initial observer notification cannot interrupt the trip');
  listeners.get('pointerleave')();
  assert.equal(pill.style.transform,'translateY(0px)');
  listeners.get('focusin')({type:'focusin',target:next});
  listeners.get('pointerover')({pointerType:'mouse',target:current});
  assert.equal(pill.style.transform,'translateY(48px)','keyboard focus remains visible');
  reduced.matches=true;reduced.change();
  assert.ok(frames.at(-1).cancelled);
  const count=frames.length;
  listeners.get('pointerover')({pointerType:'mouse',target:next});
  assert.equal(frames.length,count);
  desktop.matches=false;desktop.change();
  assert.equal(nav.dataset.railReady,undefined,'the mobile dock owns its selection');
  cleanup();assert.equal(listeners.size,0);
});
