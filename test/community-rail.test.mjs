import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/useCommunityRail.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function mount(){
 const effects=[],frames=new Map(),listeners=new Map(),styles=new Map(),exports={};let id=0,bottom=1200,height=960,desktop=true,disconnected=false;
 const shell={getBoundingClientRect:()=>({bottom})},rail={closest:()=>shell,style:{setProperty:(key,value)=>styles.set(key,value),removeProperty:key=>styles.delete(key)}};
 const preference={get matches(){return desktop;},addEventListener:(key,fn)=>listeners.set('media:'+key,fn),removeEventListener:key=>listeners.delete('media:'+key)};
 const sandbox={exports,window:{addEventListener:(key,fn)=>listeners.set(key,fn),removeEventListener:key=>listeners.delete(key)},get innerHeight(){return height;},matchMedia:()=>preference,getComputedStyle:()=>({top:'96px'}),requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),ResizeObserver:class{constructor(fn){this.fn=fn;}observe(){}disconnect(){disconnected=true;}},require:name=>{if(name==='react')return{useEffect:fn=>effects.push(fn),useRef:()=>({current:rail})};throw Error(name);}};
 vm.runInNewContext(source,sandbox);exports.useCommunityRail();const cleanup=effects[0]();
 const frame=()=>{const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn());};
 return{styles,listeners,frames,frame,cleanup,scroll:value=>{bottom=value;listeners.get('scroll')();},mobile:()=>{desktop=false;listeners.get('media:change')();},get disconnected(){return disconnected;}};
}
test('a footer entering view shortens the rail instead of pushing its first link above chrome',()=>{
 const s=mount();s.frame();assert.equal(s.styles.get('--community-rail-height'),'848px');
 s.scroll(556);s.frame();assert.equal(s.styles.get('--community-rail-height'),'460px');
 s.scroll(1200);s.frame();assert.equal(s.styles.get('--community-rail-height'),'848px');s.cleanup();
});
test('scroll bursts share a measurement and mobile retains its native bottom navigation',()=>{
 const s=mount();for(let i=0;i<20;i++)s.scroll(800-i);assert.equal(s.frames.size,1);s.frame();
 s.mobile();s.frame();assert.equal(s.styles.size,0);s.cleanup();
});
test('unmount removes measurement listeners, queued work and inline constraints',()=>{
 const s=mount();s.frame();s.scroll(600);assert.equal(s.frames.size,1);s.cleanup();assert.equal(s.frames.size,0);assert.equal(s.listeners.size,0);assert.equal(s.styles.size,0);assert.equal(s.disconnected,true);
});
