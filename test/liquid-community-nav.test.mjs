import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/useLiquidCommunityNav.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function runtime(){
 let currentNav,setup,now=100,mobile=true,reduced=false;
 const exports={},mediaListeners=new Set(),reducedListeners=new Set();
 const media={get matches(){return mobile;},addEventListener:(_,fn)=>mediaListeners.add(fn),removeEventListener:(_,fn)=>mediaListeners.delete(fn)};
 const quiet={get matches(){return reduced;},addEventListener:(_,fn)=>reducedListeners.add(fn),removeEventListener:(_,fn)=>reducedListeners.delete(fn)};
 class Element{}
 vm.runInNewContext(source,{exports,Element,performance:{now:()=>now},matchMedia:q=>q.includes('max-width')?media:quiet,ResizeObserver:class{constructor(fn){this.fn=fn;}observe(element){element.resize=this.fn;}disconnect(){currentNav.disconnected=true;}},require:name=>{if(name==='react')return{useRef:()=>({current:currentNav}),useLayoutEffect:fn=>setup=fn};throw Error(name);}});
 function mount(active='feed'){
  const listeners=new Map(),nav={dataset:{},width:400,left:12,disconnected:false,getBoundingClientRect(){return {width:this.width,left:this.left};},addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)};
  const makeTab=(key,index)=>Object.assign(new Element(),{dataset:{navKey:key},parentElement:nav,selected:false,getBoundingClientRect:()=>({left:nav.left+index*80,width:80}),matches:q=>key==='me'&&q==='.feed-mobile-account>summary',closest(){return this;},toggleAttribute(_,value){this.selected=value;},removeAttribute(){this.selected=false;}});
  const tabs=['feed','members','bookmarks','notifications','me'].map(makeTab),account={open:false};tabs[4].parentElement=account;
  const lens={style:{},animation:null,animations:[],getBoundingClientRect(){const x=this.animation?.position??Number(this.style.transform?.match(/translate3d\(([-.\d]+)/)?.[1]||0);return{left:nav.left+x,width:76};},animate(frames,options){const value={position:Number(frames[0].transform.match(/translate3d\(([-.\d]+)/)[1]),frames,options,cancel:()=>{value.cancelled=true;this.animation=null;}};this.animation=value;this.animations.push(value);return value;}};
  nav.querySelector=selector=>selector==='.feed-liquid-lens'?lens:selector==='.feed-mobile-account'?account:selector==='.feed-mobile-account>summary'?tabs[4]:tabs.find(tab=>selector.includes('"'+tab.dataset.navKey+'"'));
  currentNav=nav;exports.useLiquidCommunityNav(active);const cleanup=setup();
  return{nav,tabs,lens,listeners,cleanup,click:index=>listeners.get('click')({target:tabs[index]}),account:open=>{account.open=open;listeners.get('toggle')();}};
 }
 return{mount,mobile:value=>{mobile=value;mediaListeners.forEach(fn=>fn());},reduce:value=>{reduced=value;reducedListeners.forEach(fn=>fn());},advance:value=>now+=value,mediaListeners,reducedListeners};
}

test('the lens changes destination without cancelling the real navigation or account disclosure',()=>{
 const r=runtime(),s=r.mount();assert.equal(s.tabs[0].selected,true);assert.equal(s.lens.style.width,'76px');assert.equal(s.lens.animations.length,0);
 s.click(1);assert.equal(s.tabs[1].selected,true);assert.equal(s.lens.animations.length,1);assert.match(s.lens.style.transform,/82px/);
 s.account(true);assert.equal(s.tabs[4].selected,true);s.account(false);assert.equal(s.tabs[0].selected,true);
 s.cleanup();assert.equal(s.listeners.size,0);
});

test('a replacing route continues from the visible lens position instead of snapping back',()=>{
 const r=runtime(),first=r.mount();first.click(2);first.lens.animation.position=63;first.cleanup();r.advance(80);
 const next=r.mount('bookmarks');assert.equal(next.lens.animations.length,1);assert.equal(next.lens.animations[0].frames[0].transform,'translate3d(63px,0,0)');assert.match(next.lens.style.transform,/162px/);next.nav.resize();assert.ok(next.lens.animation,'the observer initial notification preserves the route handoff');next.cleanup();
 r.advance(1500);const later=r.mount('notifications');assert.equal(later.lens.animations.length,0,'an unrelated later visit does not replay an old route handoff');later.cleanup();
});

test('reduced motion and desktop transitions cancel animation and cleanup removes every listener',()=>{
 const r=runtime(),s=r.mount();s.click(3);const tween=s.lens.animation;r.reduce(true);assert.equal(tween.cancelled,true);assert.equal(s.lens.animation,null);
 r.mobile(false);assert.equal(s.nav.dataset.liquidReady,undefined);assert.equal(s.tabs.some(tab=>tab.selected),false);s.cleanup();
 assert.equal(r.mediaListeners.size,0);assert.equal(r.reducedListeners.size,0);assert.equal(s.listeners.size,0);assert.equal(s.nav.disconnected,true);
});
