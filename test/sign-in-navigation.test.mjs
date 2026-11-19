import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {signInRequest} from '../src/lib/sign-in-navigation.mjs';

const location=new URL('https://site.example/resources?type=skills&q=GSAP');
const link=(href,options={})=>({href:new URL(href,location).href,target:'',hasAttribute:name=>name==='download'&&options.download,...options});
test('local sign-in links preserve an explicit safe return path without consuming other destinations',()=>{
 assert.deepEqual(signInRequest(link('/login'),location.href),{next:'',mode:'login'});
 assert.deepEqual(signInRequest(link('/login?next=%2Fworkspace%2Faccount'),location.href),{next:'/workspace/account',mode:'login'});
 assert.deepEqual(signInRequest(link('/join/?next=%2Fworkspace%2Faccount'),location.href),{next:'/workspace/account',mode:'join'});
 for(const href of ['/join/invite','/admin/login','/login?reset=private','/login#recovery','https://outside.example/login','https://outside.example/join'])assert.equal(signInRequest(link(href),location.href),null);
 for(const options of [{target:'_blank'},{download:true}])assert.equal(signInRequest(link('/login',options),location.href),null);
});
test('malicious return paths never leave the current application',()=>{
 for(const path of ['/login','/join'])for(const next of ['https://outside.example/','//outside.example/','/\\outside.example/','/\noutside'])assert.deepEqual(signInRequest(link(path+'?'+new URLSearchParams({next})),location.href),{next:'',mode:path==='/join'?'join':'login'});
});
test('the credential form retains POST semantics if native submission is ever used',()=>{
 const source=fs.readFileSync(new URL('../src/components/SignInForm.tsx',import.meta.url),'utf8'),exports={};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:name=>{
  if(name==='react')return React;if(name==='react/jsx-runtime')return jsxRuntime;
  if(name.includes('LocaleProvider'))return{useLocale:()=>({t:value=>value})};
  if(name.includes('EmailSettings'))return{PasswordRecovery:()=>null};if(name.includes('Icons'))return{Icon:()=>null};return{};
 }});
 const html=renderToStaticMarkup(React.createElement(exports.default,{onSuccess(){}}));
 assert.match(html,/<form\b[^>]*\bmethod="post"/);assert.match(html,/type="password"/);assert.doesNotMatch(html,/method="get"/);
});
test('the public controller opens the dialog without navigating or swallowing native modified clicks',()=>{
 const source=fs.readFileSync(new URL('../src/components/SiteSignIn.tsx',import.meta.url),'utf8'),exports={},effects=[],listeners=new Map(),states=[],events=[];
 class Element{constructor(href){Object.assign(this,link(href));}closest(){return this;}}
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,location,Element,Event,document:{addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)},window:{addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name),dispatchEvent:event=>events.push(event.type)},require:name=>{
  if(name==='react')return{lazy:()=>()=>null,useEffect:fn=>effects.push(fn),useState:()=>[null,value=>states.push(value)],useCallback:fn=>fn,useRef:()=>({current:false})};
  if(name==='next/navigation')return{usePathname:()=>'/resources'};
  if(name.includes('PlatformAccount'))return{usePlatformAccount:()=>({user:null})};
  if(name.includes('sign-in-navigation'))return{signInRequest};
  return{};
 }});
 assert.equal(exports.SiteSignIn(),null);const cleanups=effects.map(fn=>fn());states.length=0;
 const click=(href,extras={})=>{const event={target:new Element(href),button:0,preventDefault(){this.defaultPrevented=true;},...extras};listeners.get('click')(event);return event;};
 for(const extras of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{defaultPrevented:true}])click('/login',extras);
 assert.equal(states.length,0);assert.equal(click('/community').defaultPrevented,undefined);
 assert.equal(click('/login').defaultPrevented,true);assert.equal(states.length,1);assert.equal(states[0].next,'');assert.deepEqual(events,['iavse-navigation-cancel']);
 assert.equal(click('/join?next=%2Fworkspace%2Faccount').defaultPrevented,true);assert.equal(states[1].mode,'join');assert.equal(states[1].next,'/workspace/account');
 for(const cleanup of cleanups)cleanup?.();assert.equal(listeners.size,0);
});
