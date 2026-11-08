import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/DirectorySearch.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function mount(initial={}){
 const hooks=[],listeners=new Map(),changes=[];let index=0,effects=[],tree,props={value:'',label:'Search',placeholder:'Search',onSearch:value=>changes.push(value),...initial};
 class Element{closest(){return null}focus(){document.activeElement=this}}
 const input=new Element();input.closest=()=>input;const trigger=new Element(),root=new Element();root.contains=target=>target===input||target===trigger;
 const document={activeElement:null,querySelector:()=>null};
 const window={addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:(type,fn)=>{if(listeners.get(type)===fn)listeners.delete(type)}};
 const react={useId:()=>{index++;return 'search'},useRef:value=>hooks[index++]??(hooks[index-1]={current:value}),useState:initial=>{const i=index++;hooks[i]??={value:initial};return[hooks[i].value,value=>{hooks[i].value=typeof value==='function'?value(hooks[i].value):value}]},useEffect:(fn,deps)=>{const i=index++,old=hooks[i];if(!old||!deps.every((v,n)=>Object.is(v,old.deps[n])))effects.push({i,fn,deps})}};
 const jsx=(type,props)=>{if(props.ref)props.ref.current=type==='input'?input:type==='button'?trigger:root;return{type,props}};
 const exports={};vm.runInNewContext(source,{exports,window,document,HTMLElement:Element,require:name=>{if(name==='react')return react;if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};if(name==='./Icons')return{Icon:()=>null};if(name==='./LocaleProvider')return{useLocale:()=>({t:v=>v})};throw Error(name)}});
 function render(next={}){props={...props,...next};index=0;effects=[];tree=exports.DirectorySearch(props);for(const e of effects){hooks[e.i]?.cleanup?.();hooks[e.i]={deps:e.deps,cleanup:e.fn()}}return tree}
 function nodes(){const out=[];const walk=node=>{if(Array.isArray(node))node.forEach(walk);else if(node?.props){out.push(node);walk(node.props.children)}};walk(tree);return out}
 const find=(type,match=()=>true)=>nodes().find(node=>node.type===type&&match(node.props));render();
 return{render,changes,input,trigger,document,listeners,find,click:()=>find('button',p=>p.className==='explorer-search-toggle').props.onClick(),type:value=>find('input',p=>p.type==='search').props.onChange({target:{value}}),submit:()=>find('form').props.onSubmit({preventDefault(){}}),key:(key,target=input)=>listeners.get('keydown')?.({key,target,preventDefault(){}}),cleanup:()=>hooks.forEach(h=>h?.cleanup?.())};
}

test('shared search applies only submitted drafts and preserves native filter fields',()=>{
 const s=mount({action:'/skills',fields:{type:'design',tool:'codex'}});assert.equal(s.find('div',p=>p.className==='explorer-search-reveal').props.inert,true);
 s.click();s.render();assert.equal(s.document.activeElement,s.input);s.type('  UI review  ');s.render();assert.deepEqual(s.changes,[]);s.submit();s.render();assert.deepEqual(s.changes,['UI review']);
 assert.equal(s.find('form').props.action,'/skills');assert.equal(s.find('input',p=>p.name==='type').props.value,'design');assert.equal(s.find('input',p=>p.name==='tool').props.value,'codex');assert.equal(s.find('input',p=>p.type==='search').props.name,'q');s.cleanup();assert.equal(s.listeners.size,0);
});

test('Escape cancels an unsubmitted draft and restores the same trigger',()=>{
 const s=mount({value:'React'});s.render();s.type('unsubmitted');s.render();s.key('Escape');s.render();assert.equal(s.find('input',p=>p.type==='search').props.value,'React');assert.equal(s.find('button',p=>p.className==='explorer-search-toggle').props['aria-expanded'],false);assert.equal(s.document.activeElement,s.trigger);assert.deepEqual(s.changes,[]);s.cleanup();
});

test('slash reveals search without hijacking typing and clearing is an explicit action',()=>{
 const s=mount();s.key('/',s.input);s.render();assert.equal(s.find('button',p=>p.className==='explorer-search-toggle').props['aria-expanded'],false);s.key('/',s.trigger);s.render();assert.equal(s.document.activeElement,s.input);s.type('React');s.render();s.find('button',p=>p.className==='explorer-search-clear').props.onClick();s.render();assert.deepEqual(s.changes,['']);assert.equal(s.find('input',p=>p.type==='search').props.value,'');s.cleanup();
});
