import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/BlogProductMotion.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function mount({width=1440,reduced=false,kinds=['canvas','look','publish'],tops=kinds.map((_,i)=>1100+i*1100)}={}){
 class Element{
  constructor(kind='',top=0){this.dataset=kind?{filmCamera:kind}:{};this.top=top;this.motion=null;this.reads=0;}
  closest(){return this.scene;}
  getBoundingClientRect(){this.reads++;return{top:this.top};}
  querySelectorAll(){return shots;}
  addEventListener(){throw Error('Product camera cannot intercept canvas input or native scrolling');}
 }
 const shots=kinds.map((kind,index)=>{const shot=new Element(kind);shot.scene=new Element('',tops[index]);return shot;}),root=new Element();
 const refs=[],effects=[],tweens=[],contexts=[],registrations=[];let hook=0,activeContext=null,current=null,mediaCallback,mediaScope,mediaQuery,reverted=false,output;
 const activate=()=>{
  if(width<900||reduced||reverted)return;
  const ctx={tweens:[],reverted:false,revert(){this.cleanup?.();for(const tween of this.tweens){tween.scrollTrigger.kill();tween.kill();tween.node.motion=null;}this.reverted=true;}};
  contexts.push(ctx);current=ctx;activeContext=ctx;ctx.cleanup=mediaCallback?.();activeContext=null;
 };
 const media={add(query,callback,scope){mediaQuery=query;mediaScope=scope;mediaCallback=callback;activate();},revert(){current?.revert();current=null;reverted=true;}};
 const ScrollTrigger={getAll(){throw Error('Cannot touch another scene’s ScrollTriggers');}};
 const gsap={registerPlugin:plugin=>registrations.push(plugin),matchMedia:()=>media,fromTo(node,from,to){
  const tween={node,from,to,killed:false,scrollTrigger:{killed:false,kill(){this.killed=true;}},kill(){this.killed=true;}};
  activeContext.tweens.push(tween);tweens.push(tween);node.motion={...from};return tween;
 }};
 const exports={};vm.runInNewContext(source,{exports,window:{innerHeight:900},require:name=>{
  if(name==='react')return{useRef:initial=>refs[hook++]??(refs[hook-1]={current:initial}),useEffect:(fn,deps)=>{const slot=hook++,previous=effects[slot];if(!previous||deps.some((value,index)=>value!==previous.deps[index]))effects[slot]={fn,deps,dirty:true,cleanup:previous?.cleanup};}};
  if(name==='react/jsx-runtime')return{jsx:(type,props)=>{if(props.ref)props.ref.current=root;return{type,props};}};
  if(name==='gsap')return{gsap};if(name==='gsap/ScrollTrigger')return{ScrollTrigger};throw Error('Unexpected dependency '+name);
 }});
 const render=children=>{hook=0;output=exports.BlogProductMotion({children});for(const effect of effects.filter(Boolean))if(effect.dirty){effect.cleanup?.();effect.cleanup=effect.fn();effect.dirty=false;}return output;};
 const children={realContent:true};render(children);
 return{root,shots,tweens,contexts,registrations,ScrollTrigger,children,render,get output(){return output;},cleanup(){effects.filter(Boolean).forEach(effect=>effect.cleanup?.());},change(next){current?.revert();current=null;if('width'in next)width=next.width;if('reduced'in next)reduced=next.reduced;activate();},start(tween){tween.to.onStart?.();},complete(tween){tween.to.onStart?.();tween.node.motion=null;tween.to.onComplete?.();},get scope(){return mediaScope;},get query(){return mediaQuery;},get reverted(){return reverted;}};
}

test('only decorative child art receives one native unpinned entrance; the interactive canvas never changes coordinates',()=>{
 const s=mount();assert.equal(s.output.props.children,s.children);assert.equal(s.output.props.className,'blog-product-film');assert.equal(s.output.props.style,undefined);
 assert.deepEqual(s.registrations,[s.ScrollTrigger]);assert.equal(s.scope,s.root);assert.match(s.query,/min-width: 900px/);assert.match(s.query,/prefers-reduced-motion: no-preference/);
 const art=s.shots.filter(shot=>shot.dataset.filmCamera!=='canvas');assert.equal(s.tweens.length,art.length);
 for(const tween of s.tweens){
  assert.ok(art.includes(tween.node));assert.equal(tween.to.scrollTrigger.trigger,tween.node.scene);assert.equal(tween.to.scrollTrigger.once,true);assert.equal(tween.to.scrollTrigger.fastScrollEnd,true);
  assert.equal(tween.to.scrollTrigger.scrub,undefined,'fast scrolling cannot leave a scrub catch-up tail');assert.equal(tween.to.scrollTrigger.pin,undefined);assert.equal(tween.to.scrollTrigger.snap,undefined);
  assert.ok(tween.from.y<=24&&tween.from.scale>=.985);assert.ok((tween.from.rotateY||0)<=2);assert.equal(tween.from.opacity,undefined);assert.equal(tween.to.clearProps,'transform');
 }
 const canvas=s.shots.find(shot=>shot.dataset.filmCamera==='canvas');assert.equal(canvas.motion,null);assert.equal(canvas.scene.reads,0,'interactive canvas does not participate in camera geometry');
 s.cleanup();assert.ok(s.reverted);assert.equal(s.root.dataset.filmMotion,undefined);assert.ok(s.tweens.every(t=>t.killed&&t.scrollTrigger.killed));
});

test('a fast-scroll completion or started entrance cannot replay after resize or a reduced-motion round trip',()=>{
 const s=mount();const seen=s.tweens[0];s.complete(seen);const active=s.tweens[1];s.start(active);
 s.change({width:390});assert.ok(s.shots.every(node=>node.motion===null));assert.ok(s.tweens.every(t=>t.killed&&t.scrollTrigger.killed));
 const before=s.tweens.length;s.change({width:1440});assert.equal(s.tweens.length,before,'returning to desktop preserves completed and already-seen shots');
 s.change({reduced:true});s.change({reduced:false});assert.equal(s.tweens.length,before);s.cleanup();
});

test('RSC and locale children updates preserve the existing motion owner and completed state',()=>{
 const s=mount();s.start(s.tweens[0]);const count=s.tweens.length,contexts=s.contexts.length,nextChildren={locale:'en',realContent:true};
 s.render(nextChildren);assert.equal(s.output.props.children,nextChildren);assert.equal(s.contexts.length,contexts);assert.equal(s.tweens.length,count);assert.ok(s.tweens.every(t=>!t.killed),'a content rerender cannot revert and rebuild an active camera');
 s.cleanup();assert.ok(s.tweens.every(t=>t.killed));
});

test('restored or initially visible content stays at rest, and mobile/reduced entries prepare no start poses',()=>{
 const s=mount({kinds:['canvas','look','look','publish'],tops:[-900,-100,500,1800]});assert.equal(s.tweens.length,1);assert.equal(s.tweens[0].node.dataset.filmCamera,'publish');assert.ok(s.shots.slice(0,3).every(node=>node.motion===null));
 s.change({width:390});for(const shot of s.shots)shot.scene.top=1800;const before=s.tweens.length;s.change({width:1440});assert.equal(s.tweens.length,before+1,'restored visible look shots remain remembered even when geometry later moves below fold');s.cleanup();
 for(const settings of [{width:390},{reduced:true}]){const entry=mount(settings);assert.equal(entry.tweens.length,0);assert.ok(entry.shots.every(node=>node.motion===null));entry.cleanup();}
});
