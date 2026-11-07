import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {resourceKey,resourceFamily} from '../src/lib/resource-key.mjs';

function fixture(){
 const slots=[],requests=[],effects=[];let cursor=0;
 const same=(a,b)=>a&&a.length===b.length&&a.every((value,index)=>Object.is(value,b[index]));
 const request=path=>new Promise((resolve,reject)=>requests.push({path,resolve,reject}));
 const context={scope:'owner-page',resources:{},read:request};
 const react={
  createContext:()=>({}),useContext:()=>context,
  useState:initial=>{const index=cursor++;if(!slots[index])slots[index]={value:initial};return[slots[index].value,value=>{slots[index].value=typeof value==='function'?value(slots[index].value):value;}];},
  useCallback:(callback,deps)=>{const index=cursor++;if(!same(slots[index]?.deps,deps))slots[index]={value:callback,deps};return slots[index].value;},
  useEffect:(callback,deps)=>{const index=cursor++;if(!same(slots[index]?.deps,deps))effects.push(()=>{slots[index]?.cleanup?.();slots[index]={deps,cleanup:callback()};});}
 };
 const source=ts.transpileModule(readFileSync(new URL('../src/components/PageResources.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const exports={};vm.runInNewContext(source,{exports,window:{addEventListener(){},removeEventListener(){}},require:name=>{
  if(name==='react')return react;
  if(name==='react/jsx-runtime')return{jsx:()=>null};
  if(name==='@/lib/client')return{api:request};
  if(name==='@/lib/resource-key.mjs')return{resourceKey,resourceFamily};
  throw new Error('Unexpected dependency '+name);
 }});
 return{
  requests,
  render(path){cursor=0;return exports.useResource(path);},
  flush(){for(const effect of effects.splice(0))effect();},
  dispose(){for(const slot of slots)slot?.cleanup?.();}
 };
}

test('resource families distinguish admin content collections without fragmenting their search and paging states',()=>{
 assert.equal(resourceFamily('/api/admin/content?type=articles&q=one&page=2'),resourceFamily('/api/admin/content?status=draft&type=articles&q=two'));
 assert.notEqual(resourceFamily('/api/admin/content?type=articles'),resourceFamily('/api/admin/content?type=resources'));
 assert.notEqual(resourceFamily('/api/admin/content?type=articles'),resourceFamily('/api/admin/content?type=articles&trash=1'));
 assert.equal(resourceFamily('/api/admin/content?type=articles'),resourceFamily('/api/admin/content?type=articles&trash=0'));
 assert.equal(resourceFamily('/api/admin/files?page=1'),resourceFamily('/api/admin/files?page=2'));
 assert.equal(resourceFamily(''),'');
});

test('switching type or trash never presents the previous collection as current rows',async()=>{
 for(const next of ['/api/admin/content?type=resources','/api/admin/content?type=articles&trash=1']){
  const f=fixture(),path='/api/admin/content?type=articles',articleRows={items:[{id:'article-row'}]};
  assert.equal(f.render(path).loading,true);f.flush();f.requests[0].resolve(articleRows);await Promise.resolve();
  assert.equal(f.render(path).data,articleRows);
  const switching=f.render(next);assert.equal(switching.data,null);assert.equal(switching.loading,true);
  f.flush();const nextRows={items:[{id:'next-collection-row'}]};f.requests[1].resolve(nextRows);await Promise.resolve();
  const ready=f.render(next);assert.equal(ready.data,nextRows);assert.equal(ready.loading,false);f.dispose();
 }
});

test('query changes retain visible rows as busy and ignore an obsolete query that resolves later',async()=>{
 const f=fixture(),path='/api/admin/content?type=articles',rows={items:[{id:'original'}]};
 f.render(path);f.flush();f.requests[0].resolve(rows);await Promise.resolve();f.render(path);
 const first=path+'&q=first',latest=path+'&q=latest';
 const updating=f.render(first);assert.equal(updating.data,rows);assert.equal(updating.refreshing,true);assert.equal(updating.loading,false);f.flush();
 const second=f.render(latest);assert.equal(second.data,rows);assert.equal(second.refreshing,true);f.flush();
 const latestRows={items:[{id:'latest'}]};f.requests[2].resolve(latestRows);await Promise.resolve();
 assert.equal(f.render(latest).data,latestRows);
 f.requests[1].resolve({items:[{id:'obsolete'}]});await Promise.resolve();
 const stable=f.render(latest);assert.equal(stable.data,latestRows);assert.equal(stable.refreshing,false);f.dispose();
});
