import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/useUnsaved.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function mount(dirty,allow=false){
 const listeners=new Map(),prompts=[],dispatched=[],exports={};let effect;
 class Element{
  href='https://site.example/';target='';rawHref='/';download=false;
  closest(){return this}
  hasAttribute(name){return name==='download'&&this.download}
  getAttribute(name){return name==='href'?this.rawHref:null}
 }
 const events={addEventListener:(name,handler)=>listeners.set(name,handler),removeEventListener:name=>listeners.delete(name),dispatchEvent:event=>{dispatched.push(event);return true;}};
 vm.runInNewContext(source,{exports,Element,Event,URL,location:new URL('https://site.example/workspace/blog'),document:events,window:events,confirm:message=>{prompts.push(message);return allow},require:name=>{
  if(name==='react')return{useEffect:callback=>{effect=callback}};
  if(name==='./LocaleProvider')return{useLocale:()=>({t:value=>value})};
  throw new Error('Unexpected dependency: '+name);
 }});
 exports.useUnsaved(dirty);const cleanup=effect();
 const click={button:0,target:new Element(),preventDefault(){this.prevented=true},stopImmediatePropagation(){this.stopped=true}};
 return{listeners,prompts,dispatched,cleanup,click};
}
test('canvas return navigation can be canceled while a draft is unsaved',()=>{
 const f=mount(true);f.listeners.get('click')(f.click);
 assert.equal(f.prompts.length,1);assert.equal(f.click.prevented,true);assert.equal(f.click.stopped,true);
 assert.equal(f.dispatched.length,1);assert.equal(f.dispatched[0].type,'iavse-navigation-cancel');
 const unload={preventDefault(){this.prevented=true}};f.listeners.get('beforeunload')(unload);
 assert.equal(unload.prevented,true);assert.equal(unload.returnValue,'');
 f.cleanup();assert.equal(f.listeners.size,0);
});
test('saved drafts leave freely, and an explicit decision allows leaving an unsaved draft',()=>{
 const clean=mount(false);assert.equal(clean.listeners.size,0);assert.equal(clean.prompts.length,0);
 const dirty=mount(true,true);dirty.listeners.get('click')(dirty.click);
 assert.equal(dirty.prompts.length,1);assert.equal(dirty.click.prevented,undefined);assert.equal(dirty.click.stopped,undefined);
 assert.equal(dirty.dispatched.length,0);
 dirty.cleanup();
});

test('modified clicks, other targets, downloads and same-document hashes do not emit cancellation',()=>{
 for(const overrides of [{button:1},{metaKey:true},{ctrlKey:true},{shiftKey:true},{altKey:true},{defaultPrevented:true}]){
  const f=mount(true);Object.assign(f.click,overrides);f.listeners.get('click')(f.click);assert.equal(f.prompts.length,0);assert.equal(f.dispatched.length,0);f.cleanup();
 }
 for(const overrides of [{target:'_blank'},{download:true},{rawHref:'#canvas',href:'https://site.example/workspace/blog#canvas'},{rawHref:'/workspace/blog#canvas',href:'https://site.example/workspace/blog#canvas'},{rawHref:'https://example.org/',href:'https://example.org/'}]){
  const f=mount(true);Object.assign(f.click.target,overrides);f.listeners.get('click')(f.click);assert.equal(f.prompts.length,0);assert.equal(f.dispatched.length,0);f.cleanup();
 }
});


test('editing a community submission uses the shared cancellation guard',()=>{
 const editorSource=ts.transpileModule(fs.readFileSync(new URL('../src/components/CommunityEditor.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const exports={},state=[],guards=[];let index=0;
 const jsx=(type,props)=>({type,props});
 vm.runInNewContext(editorSource,{exports,require:name=>{
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};
  if(name==='react')return{useEffect:()=>{},useState:initial=>{const slot=index++;if(!(slot in state))state[slot]=initial;return[state[slot],value=>{state[slot]=typeof value==='function'?value(state[slot]):value;}];}};
  if(name==='./LocaleProvider')return{useLocale:()=>({t:value=>value,locale:'zh'})};
  if(name==='next/navigation')return{useRouter:()=>({replace(){}})};
  if(name==='./PageResources')return{usePageSeed:()=>null};
  if(name==='./useUnsaved')return{useUnsaved:dirty=>guards.push(mount(dirty))};
  return new Proxy({},{get:(_,key)=>key});
 }});
 const render=()=>{index=0;return exports.CommunityEditor({config:{taxonomy:{categories:['技术笔记'],tags:[]}},user:{status:'active',canPublish:true,nickname:'Writer'}});};
 const walk=node=>node&&typeof node==='object'?[node,...[node.props?.children].flat().flatMap(walk)]:[];
 const initial=render();assert.equal(guards.at(-1).listeners.size,0,'an untouched submission has no unsaved guard');
 const body=walk(initial).find(node=>node.props?.name==='submission-body');body.props.onChange('An unsaved community draft');render();
 const guard=guards.at(-1);assert.ok(guard.listeners.has('click'),'the real editor dirty state installs the shared guard');
 guard.listeners.get('click')(guard.click);assert.equal(guard.click.prevented,true);
 assert.equal(guard.dispatched[0]?.type,'iavse-navigation-cancel','declining submission navigation releases PageMotion suspension');
 guard.cleanup();
});

test('in-page administration navigation uses the same unsaved decision before replacing the view',()=>{
 for(const allow of [false,true]){
  const f=mount(true,allow),event=new Event('iavse-before-inline-navigation',{cancelable:true});
  f.listeners.get('iavse-before-inline-navigation')(event);assert.equal(f.prompts.length,1);assert.equal(event.defaultPrevented,!allow);
  f.cleanup();assert.equal(f.listeners.size,0);
 }
 assert.equal(mount(false).listeners.has('iavse-before-inline-navigation'),false);
});
