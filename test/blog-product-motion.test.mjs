import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/BlogProductMotion.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function mount({width=1440,reduced=false,tops=[1100,2200,2200,2200,3400]}={}){
 class Element{
  constructor(kind='',top=0){this.dataset=kind?{filmCamera:kind}:{};this.top=top;this.listeners=new Map();this.motion=null;}
  closest(selector){return selector==='[data-film-scene]'?this.scene:selector==='[data-film-interactive]'&&this.interactive?this:null;}
  getBoundingClientRect(){return{top:this.top};}
  querySelectorAll(){return shots;}
  addEventListener(type,fn,capture){this.listeners.set(type,{fn,capture});}
  removeEventListener(type,fn,capture){const entry=this.listeners.get(type);if(entry?.fn===fn&&entry.capture===capture)this.listeners.delete(type);}
  emit(type,target){this.listeners.get(type)?.fn({target});}
 }
 const shots=['canvas','look','look','look','publish'].map((kind,index)=>{const shot=new Element(kind),scene=new Element('',tops[index]);shot.scene=scene;return shot;});
 const root=new Element(),tweens=[],sets=[],contexts=[],registrations=[],effects=[];let activeContext=null,mediaCleanup,current,mediaScope,mediaQuery,reverted=false;
 const context=()=>{const ctx={tweens:[],nodes:[],add(fn){const before=activeContext;activeContext=ctx;try{return fn();}finally{activeContext=before;}},revert(){this.cleanup?.();for(const t of this.tweens){t.scrollTrigger.kill(false);t.kill();t.node.motion=null;}for(const node of this.nodes)node.motion=null;this.reverted=true;}};contexts.push(ctx);return ctx;};
 const activate=()=>{
  if(width<900||reduced||reverted)return;
  current=context();activeContext=current;current.cleanup=mediaCleanup?.(current);activeContext=null;
 };
 const media={add(query,callback,scope){mediaQuery=query;mediaScope=scope;mediaCleanup=callback;activate();},revert(){current?.revert();current=null;reverted=true;}};
 const gsap={registerPlugin:plugin=>registrations.push(plugin),matchMedia:()=>media,fromTo:(node,from,to)=>{
  const tween={node,from,to,killed:false,scrollTrigger:{killed:false,kill(revert){this.killed=true;this.revert=revert;}},kill(){this.killed=true;}};
  activeContext.tweens.push(tween);tweens.push(tween);node.motion={...from};return tween;
 },set:(node,values)=>{sets.push({node,values});activeContext.nodes.push(node);if(values.clearProps==='transform')node.motion=null;}};
 const ScrollTrigger={getAll(){throw Error('Cannot touch another scene’s ScrollTriggers');}},exports={};
 vm.runInNewContext(source,{exports,Element,window:{innerHeight:900},require:name=>{
  if(name==='react')return{useRef:()=>({current:root}),useLayoutEffect:fn=>effects.push(fn)};
  if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props})};
  if(name==='gsap')return{gsap};if(name==='gsap/ScrollTrigger')return{ScrollTrigger};throw Error('Unexpected dependency '+name);
 }});
 const children={realContent:true},output=exports.BlogProductMotion({children}),cleanup=effects[0]();
 return{root,shots,tweens,sets,contexts,output,children,registrations,ScrollTrigger,cleanup,change(next){current?.revert();current=null;if('width'in next)width=next.width;if('reduced'in next)reduced=next.reduced;activate();},interact(type='pointerdown',interactive=true){const target=new Element();target.interactive=interactive;root.emit(type,target);},get scope(){return mediaScope;},get query(){return mediaQuery;},get reverted(){return reverted;}};
}

test('product cameras stay scoped to art and use native unpinned scroll with visible defaults',()=>{
 const s=mount();assert.equal(s.output.props.children,s.children);assert.equal(s.output.props.className,'blog-product-film');assert.equal(s.output.props.style,undefined);
 assert.deepEqual(s.registrations,[s.ScrollTrigger]);assert.equal(s.scope,s.root);assert.match(s.query,/min-width: 900px/);assert.match(s.query,/prefers-reduced-motion: no-preference/);
 assert.equal(s.tweens.length,5);
 for(const tween of s.tweens){
  assert.ok(s.shots.includes(tween.node));assert.equal(tween.to.scrollTrigger.trigger,tween.node.scene);assert.equal(tween.to.ease,'none');assert.equal(tween.to.scrollTrigger.scrub,.35);
  assert.equal(tween.to.scrollTrigger.pin,undefined);assert.equal(tween.to.scrollTrigger.snap,undefined);assert.equal(tween.from.opacity,undefined,'content never waits behind an invisible entrance');
 }
 s.cleanup();assert.ok(s.reverted);assert.equal(s.root.listeners.size,0);assert.equal(s.root.dataset.filmMotion,undefined);assert.ok(s.tweens.every(t=>t.killed&&t.scrollTrigger.killed));
});

test('capture-phase interaction settles only the canvas before a drag and keeps it settled after media changes',()=>{
 const s=mount();assert.equal(s.root.listeners.get('pointerdown').capture,true);assert.equal(s.root.listeners.get('focusin').capture,true);
 s.interact('pointerdown',false);assert.equal(s.tweens.some(t=>t.killed),false,'other product controls do not settle the demo');
 s.interact();const canvas=s.tweens[0];assert.ok(canvas.killed&&canvas.scrollTrigger.killed);assert.equal(canvas.node.motion,null);assert.equal(s.sets.length,1);assert.ok(s.tweens.slice(1).every(t=>!t.killed));
 s.interact('focusin');assert.equal(s.sets.length,1,'pointer focus cannot settle twice');
 s.change({width:390});const before=s.tweens.length;s.change({width:1440});assert.equal(s.tweens.length,before+4,'a used canvas never starts moving again after resize');assert.ok(s.tweens.slice(before).every(t=>t.node.dataset.filmCamera!=='canvas'));
 s.cleanup();s.interact();assert.equal(s.sets.length,1);
});

test('phone and reduced-motion entries keep static art, while live preference changes release every local track',()=>{
 for(const settings of [{width:390},{reduced:true}]){const s=mount(settings);assert.equal(s.tweens.length,0);assert.ok(s.shots.every(node=>node.motion===null));s.cleanup();}
 const s=mount();s.change({reduced:true});assert.ok(s.tweens.every(t=>t.killed&&t.scrollTrigger.killed));assert.equal(s.root.dataset.filmMotion,undefined);assert.ok(s.shots.every(node=>node.motion===null));
 const before=s.tweens.length;s.change({reduced:false});assert.equal(s.tweens.length,before+5);s.cleanup();
});

test('restored scroll leaves completed scenes at their final default instead of replaying a camera entrance',()=>{
 const s=mount({tops:[-900,-100,-100,-100,1200]});assert.equal(s.tweens.length,1);assert.equal(s.tweens[0].node.dataset.filmCamera,'publish');assert.ok(s.shots.slice(0,4).every(node=>node.motion===null));s.cleanup();
});
