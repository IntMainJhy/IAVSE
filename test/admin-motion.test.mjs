import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function fixture(reduced=false){
 const layouts=[],effects=[],animations=[],listeners=new Map();
 const node={open:false,showModal(){this.open=true},close(){this.open=false},animate(){const animation={canceled:false,cancel(){this.canceled=true},onfinish:null};animations.push(animation);return animation},addEventListener:(key,fn)=>listeners.set(key,fn),removeEventListener:key=>listeners.delete(key)};
 const source=ts.transpileModule(readFileSync(new URL('../src/components/useAdminEffects.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext(source,{exports,matchMedia:()=>({matches:reduced}),require:()=>({useRef:initial=>({current:initial}),useEffect:fn=>effects.push(fn),useLayoutEffect:fn=>layouts.push(fn)})});
 return{...exports,node,layouts,effects,animations,listeners};
}

test('a stale drawer exit cannot close a rapidly reopened drawer; unmount cancels animation and listeners',()=>{
 const f=fixture(),drawer=f.useAdminDrawer({current:f.node});const cleanup=f.effects[0]();
 drawer.open();assert.equal(f.node.open,true);drawer.close();const oldExit=f.animations.at(-1);
 drawer.open();assert.equal(oldExit.canceled,true);oldExit.onfinish();assert.equal(f.node.open,true);
 drawer.close(true);assert.equal(f.node.open,false);cleanup();assert.equal(f.listeners.size,0);assert.equal(f.animations.at(-1).canceled,true);
});

test('Escape uses an animated close and reduced motion closes synchronously',()=>{
 const f=fixture(),drawer=f.useAdminDrawer({current:f.node});f.effects[0]();drawer.open();let prevented=false;
 f.listeners.get('cancel')({preventDefault(){prevented=true}});assert.equal(prevented,true);assert.equal(f.node.open,true);f.animations.at(-1).onfinish();assert.equal(f.node.open,false);
 const reduced=fixture(true),quiet=reduced.useAdminDrawer({current:reduced.node});quiet.open();quiet.close();assert.equal(reduced.node.open,false);assert.equal(reduced.animations.length,0);
});

test('page motion cancels its previous run and does not stack a second entrance over React Bits cards',()=>{
 const f=fixture(),stage={querySelector:()=>null,animate:f.node.animate};f.useAdminEffects({current:{querySelector:()=>stage}},'settings');const cleanup=f.layouts[0]();assert.equal(f.animations.length,1);cleanup();assert.equal(f.animations[0].canceled,true);
 stage.querySelector=()=>({});f.useAdminEffects({current:{querySelector:()=>stage}},'overview');f.layouts[1]();assert.equal(f.animations.length,1);
});
