import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/gallery-frame-ready.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture({theme=false,hosted=false,fonts}={}){
 let callback,ready=0,disconnected=0,loaded=false;const timers=new Map(),exports={};
 const child={matches:()=>theme,hasAttribute:()=>false,getAttribute:()=>null},staticSite={querySelector:selector=>selector==='iframe'?{}:loaded?null:{}};
 const embed={children:[child],querySelector:()=>hosted?staticSite:null},doc={documentElement:{},querySelector:()=>embed,fonts:fonts?{ready:fonts}:undefined};
 vm.runInNewContext(source,{exports,MutationObserver:class{constructor(fn){callback=fn;}observe(){}disconnect(){disconnected++;}},setTimeout:fn=>{timers.set(1,fn);return 1;},clearTimeout:id=>timers.delete(id)});
 const stop=exports.observeGalleryFrame({contentDocument:doc},()=>ready++);
 return{stop,theme(){theme=true;callback();},load(){loaded=true;callback();},timeout(){timers.get(1)?.();},get ready(){return ready;},get timers(){return timers.size;},get disconnected(){return disconnected;}};
}
test('a streamed Suspense placeholder stays covered until the real published theme mounts',()=>{const f=fixture();assert.equal(f.ready,0);f.theme();assert.equal(f.ready,1);assert.equal(f.timers,0);assert.equal(f.disconnected,1);f.theme();assert.equal(f.ready,1);});
test('already rendered documents reveal immediately while hosted pages wait for their inner load',()=>{const ready=fixture({theme:true});assert.equal(ready.ready,1);assert.equal(ready.timers,0);const hosted=fixture({hosted:true});assert.equal(hosted.ready,0);hosted.load();assert.equal(hosted.ready,1);});
test('offscreen unmounts and loading timeouts release observers without exposing failed previews',()=>{const f=fixture();f.stop();f.theme();assert.equal(f.ready,0);assert.equal(f.timers,0);const timed=fixture();timed.timeout();timed.theme();assert.equal(timed.ready,0);assert.equal(timed.timers,0);});
test('the first reveal waits for the theme fonts and a late font completion cannot revive an unmounted frame',async()=>{
 let complete;const fonts=new Promise(resolve=>{complete=resolve;}),f=fixture({theme:true,fonts}),gone=fixture({theme:true,fonts});assert.equal(f.ready,0);gone.stop();complete();await fonts;await Promise.resolve();assert.equal(f.ready,1);assert.equal(gone.ready,0);assert.equal(f.timers,0);
});
