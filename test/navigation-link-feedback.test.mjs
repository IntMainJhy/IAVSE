import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/NavigationLinkFeedback.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
test('native link work gates remain closed until the last overlapping navigation finishes',()=>{
 const exports={},effects=[],events=[];
 vm.runInNewContext(source,{exports,CustomEvent,window:{dispatchEvent:e=>events.push(e.detail.pending)},require:name=>name==='react'?{useEffect:fn=>effects.push(fn)}:name==='react/jsx-runtime'?{jsx:(_tag,props)=>props}:{useLinkStatus:()=>({pending:false})}});
 exports.useNavigationPending(true);const first=effects.pop()();exports.useNavigationPending(true);const second=effects.pop()();assert.deepEqual(events,[true]);first();assert.deepEqual(events,[true]);second();assert.deepEqual(events,[true,false]);second();assert.deepEqual(events,[true,false]);
 const indicator=exports.NavigationLinkFeedback();assert.equal(indicator['aria-hidden'],'true');assert.equal(indicator['data-pending'],undefined);assert.equal(effects.pop()(),undefined);assert.deepEqual(events,[true,false]);
});
