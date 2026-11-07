import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseDocument} from 'htmlparser2';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/SiteAnnouncement.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const seed=(title='Server announcement',url='')=>({enabled:true,items:[{title,url}]});
function load({react=React,locale='en',globals={}}={}){
 const exports={};vm.runInNewContext(source,{exports,...globals,require:name=>{
  if(name==='react')return react;if(name==='react/jsx-runtime')return runtime;
  if(name==='next/link')return{default:({href,children})=>React.createElement('a',{href},children)};
  if(name==='./LocaleProvider')return{useLocale:()=>({locale})};
  if(name==='./Icons')return{Icon:()=>React.createElement('svg',{'aria-hidden':'true'})};
  throw Error('Unmocked dependency '+name);
 }});return exports;
}
const descendants=node=>[node,...(node.children||[]).flatMap(descendants)];
function markup(value,locale='en'){
 const {SiteAnnouncementsProvider,SiteAnnouncement,SiteAnnouncementOffset}=load({locale});
 return renderToStaticMarkup(React.createElement(SiteAnnouncementsProvider,{initial:value},React.createElement(React.Fragment,null,React.createElement(SiteAnnouncement),React.createElement(SiteAnnouncementOffset))));
}

test('server-seeded notices and offsets agree immediately; a lone text-only notice remains keyboard reachable',()=>{
 const text='A long announcement without a link. '.repeat(3),html=markup(seed(text)),nodes=descendants(parseDocument(html));
 assert.ok(html.includes(text));assert.equal(nodes.filter(node=>node.name==='aside').length,1);
 const viewport=nodes.find(node=>node.attribs?.class==='site-announcement-viewport');
 assert.equal(viewport.attribs.role,'region');assert.equal(viewport.attribs.tabindex,'0');assert.equal(viewport.attribs['aria-label'],'Site updates');
 assert.equal(nodes.filter(node=>node.name==='a').length,0,'plain notices do not acquire an invented destination');
 const offset=nodes.find(node=>node.attribs?.class==='site-announcement-offset');assert.equal(offset.attribs['aria-hidden'],'true');
 for(const value of [{enabled:false,items:seed().items},{enabled:false,items:[]},{enabled:true,items:[]}])assert.equal(markup(value),'','disabled or empty announcements reserve no space');
});

test('localized default notices and real destinations retain safe accessible semantics',()=>{
 for(const [locale,label,text]of [['zh','网站公告','网站更新与公告将在这里发布。'],['en','Site updates','Website news and updates will appear here.'],['ja','お知らせ','サイトの更新やお知らせをここでお届けします。']]){
  const html=markup(seed('网站更新与公告将在这里发布。'),locale);assert.ok(html.includes(label));assert.ok(html.includes(text));
 }
 const html=markup({enabled:true,items:[{title:'Internal guide',url:'/docs'},{title:'External update',url:'https://example.com/updates'},{title:'<script>literal text</script>',url:''}]}),nodes=descendants(parseDocument(html)),links=nodes.filter(node=>node.name==='a');
 assert.equal(links[0].attribs.href,'/docs');assert.equal(links[0].attribs.target,undefined);
 assert.equal(links[1].attribs.target,'_blank');assert.equal(links[1].attribs.rel,'noopener noreferrer');
 assert.equal(nodes.filter(node=>node.name==='script').length,0);assert.ok(html.includes('&lt;script&gt;literal text&lt;/script&gt;'));
});

function mount(initial=seed()){
 const hooks=[],listeners=new Map(),requests=[],channels=[];let index=0,layouts=[],effects=[],changed=false,output,props={initial,children:null};
 const same=(a,b)=>a&&b&&a.length===b.length&&a.every((value,i)=>Object.is(value,b[i]));
 const effect=(queue,fn,deps)=>{const slot=index++,before=hooks[slot];if(!before||!same(before.deps,deps))queue.push({slot,fn,deps});};
 const react={
  createContext:value=>({Provider:{},value}),useContext:context=>context.value,
  useRef:value=>{const slot=index++;return hooks[slot]??=( {current:value});},
  useState:value=>{const slot=index++;if(!hooks[slot])hooks[slot]={value};return[hooks[slot].value,next=>{const value=typeof next==='function'?next(hooks[slot].value):next;if(!Object.is(value,hooks[slot].value)){hooks[slot].value=value;changed=true;}}];},
  useLayoutEffect:(fn,deps)=>effect(layouts,fn,deps),useEffect:(fn,deps)=>effect(effects,fn,deps),
 };
 const window={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name);}},document={documentElement:{dataset:{}}};
 class Channel{constructor(name){this.name=name;this.messages=[];this.closed=false;channels.push(this);}postMessage(message){this.messages.push(message);}close(){this.closed=true;}receive(data){this.onmessage?.({data});}}
 const api=load({react,globals:{window,document,AbortController,BroadcastChannel:Channel,fetch:(url,options)=>new Promise((resolve,reject)=>requests.push({url,options,resolve,reject}))}});
 const commit=queue=>{for(const {slot,fn,deps}of queue){hooks[slot]?.cleanup?.();hooks[slot]={deps,cleanup:fn()};}};
 function render(next={}){
  props={...props,...next};let passes=0;
  do{assert.ok(++passes<=5,'layout synchronization converges before paint');changed=false;index=0;layouts=[];effects=[];output=api.SiteAnnouncementsProvider(props);commit(layouts);commit(effects);}while(changed);
  return output.props.value;
 }
 render();
 return{requests,channels,listeners,document,render,get value(){return output.props.value;},saved:()=>listeners.get('iavse-announcements-updated')?.(),resolve:(position,value,ok=true)=>requests[position].resolve({ok,json:async()=>value}),settle:async()=>{await new Promise(resolve=>setImmediate(resolve));return render();},cleanup:()=>hooks.forEach(hook=>hook?.cleanup?.())};
}

test('hydration uses its initial seed without fetching and a changed RSC seed aborts stale refreshes before paint',async()=>{
 const first=seed('Initial server copy'),f=mount(first);assert.equal(f.value,first);assert.equal(f.requests.length,0);assert.equal(f.document.documentElement.dataset.siteAnnouncements,'enabled');
 f.saved();assert.equal(f.requests.length,1);const next=seed('New locale or route server copy');assert.equal(f.render({initial:next}),next);assert.equal(f.requests[0].options.signal.aborted,true);
 f.resolve(0,seed('Obsolete request copy'));await f.settle();assert.equal(f.value,next,'a late response cannot replace the new server seed');
 const disabled={enabled:false,items:[]};f.render({initial:disabled});assert.equal(f.value,disabled);assert.equal(f.document.documentElement.dataset.siteAnnouncements,'disabled');f.cleanup();
});

test('explicit saves refresh and broadcast once while other tabs only refresh, with rapid requests superseded',async()=>{
 const f=mount(),channel=f.channels[0];assert.equal(channel.name,'iavse-site-announcements');
 f.saved();assert.deepEqual(channel.messages,['refresh']);assert.equal(f.requests[0].url,'/api/announcements');assert.equal(f.requests[0].options.credentials,'same-origin');assert.equal(f.requests[0].options.cache,'no-store');
 channel.receive('refresh');assert.equal(f.requests.length,2);assert.equal(f.requests[0].options.signal.aborted,true);assert.equal(channel.messages.length,1,'receiving a broadcast does not echo it to other tabs');
 channel.receive('unrelated');assert.equal(f.requests.length,2);
 const latest=seed('Latest saved announcement','/resources');f.resolve(1,latest);await f.settle();assert.equal(f.value,latest);
 f.resolve(0,seed('Older save'));await f.settle();assert.equal(f.value,latest);f.cleanup();
});

test('temporary failures retain complete content, and unmount removes listeners, closes the channel and ignores late work',async()=>{
 const initial=seed('Last complete announcement'),f=mount(initial);
 f.saved();f.requests[0].reject(new Error('Temporary offline state'));await f.settle();assert.equal(f.value,initial);
 f.saved();f.resolve(1,null,false);await f.settle();assert.equal(f.value,initial);
 f.saved();f.resolve(2,{enabled:'invalid',items:[]});await f.settle();assert.equal(f.value,initial);
 f.saved();const pending=f.requests[3];f.cleanup();assert.equal(pending.options.signal.aborted,true);assert.equal(f.channels[0].closed,true);assert.equal(f.listeners.size,0);
 pending.resolve({ok:true,json:async()=>seed('Late unmounted response')});await f.settle();assert.equal(f.value,initial);
});
