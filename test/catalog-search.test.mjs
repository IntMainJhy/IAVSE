import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/CatalogSearch.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;

function mount(initial={}){
 const hooks=[],frames=new Map();let index=0,id=0,cancels=0,styleWrites=0,rectReads=0,inputMounted=false,opened=false,showCalls=0,hideCalls=0,layouts=[],effects=[],output;
 let path='/skills',query='',rect={left:800,right:880,top:200},props={value:'',label:'Search',...initial};
 const document={activeElement:null};
 const focus=(element,options)=>{element.focusOptions=options;document.activeElement=element;};
 const trigger={getBoundingClientRect:()=>{rectReads++;return rect;},focus(options){focus(this,options);}};
 const input={value:'',focus(options){focus(this,options);}};
 const panel={style:new Proxy({}, {set(object,key,value){styleWrites++;object[key]=value;return true;}}),matches:()=>opened,showPopover(){opened=true;showCalls++;},hidePopover(){opened=false;hideCalls++;},contains:element=>element===input};
 class Target extends EventTarget{
  listeners=new Set();
  addEventListener(type,fn,options){super.addEventListener(type,fn,options);this.listeners.add(fn);}
  removeEventListener(type,fn,options){super.removeEventListener(type,fn,options);this.listeners.delete(fn);}
 }
 const viewport=Object.assign(new Target(),{width:1440,height:900,offsetLeft:0,offsetTop:0});
 const window=Object.assign(new Target(),{innerWidth:1440,innerHeight:900,visualViewport:viewport});
 const unchanged=(before,after)=>before&&after&&before.length===after.length&&before.every((value,i)=>Object.is(value,after[i]));
 const effect=(kind,fn,deps)=>{const slot=index++,old=hooks[slot];if(!old||!unchanged(old.deps,deps))(kind==='layout'?layouts:effects).push({slot,fn,deps});};
 const react={
  useId:()=>{index++;return 'search';},
  useRef:value=>{const slot=index++;return hooks[slot]??(hooks[slot]={current:value});},
  useState:value=>{const slot=index++;if(!hooks[slot])hooks[slot]={value};return[hooks[slot].value,next=>{hooks[slot].value=typeof next==='function'?next(hooks[slot].value):next;}];},
  useCallback:(fn,deps)=>{const slot=index++,old=hooks[slot];if(!old||!unchanged(old.deps,deps))hooks[slot]={fn,deps};return hooks[slot].fn;},
  useLayoutEffect:(fn,deps)=>effect('layout',fn,deps),useEffect:(fn,deps)=>effect('effect',fn,deps),
 };
 const jsx=(type,node)=>{if(node.ref){node.ref.current=type==='input'?input:type==='button'?trigger:panel;if(type==='input'&&!inputMounted){input.value=node.defaultValue;inputMounted=true;}}return{type,props:node};};
 const exports={},sandbox={exports,window,document,requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>{cancels++;frames.delete(key);},require:name=>{
  if(name==='react')return react;
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};
  if(name==='next/navigation')return{usePathname:()=>path,useSearchParams:()=>new URLSearchParams(query)};
  if(name==='./LocaleProvider')return{useLocale:()=>({t:value=>value})};
  if(name==='./Icons')return{Icon:()=>null};
  if(name.endsWith('.css'))return{};
  throw Error('Unexpected dependency '+name);
 }};
 vm.runInNewContext(source,sandbox);
 const commit=list=>{for(const {slot,fn,deps}of list){hooks[slot]?.cleanup?.();hooks[slot]={deps,cleanup:fn()};}};
 const render=(next={})=>{props={...props,...next};index=0;layouts=[];effects=[];output=exports.CatalogSearch(props);commit(layouts);commit(effects);return output;};
 render();
 const tree=()=>({trigger:output.props.children[0],panel:output.props.children[1],input:output.props.children[1].props.children.find(node=>node?.type==='input')});
 return{window,viewport,document,trigger,panel,input,frames,tree,render,click:()=>tree().trigger.props.onClick(),toggle:()=>tree().panel.props.onToggle(),escape:()=>tree().panel.props.onKeyDown({key:'Escape',preventDefault(){}}),navigate:(next,nextQuery,nextProps={})=>{path=next;query=nextQuery;return render(nextProps);},step:()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());},geometry:(next)=>{rect={...rect,...next};},cleanup:()=>{hooks.forEach(hook=>hook?.cleanup?.());},get opened(){return opened;},get showCalls(){return showCalls;},get hideCalls(){return hideCalls;},get cancels(){return cancels;},get styleWrites(){return styleWrites;},get rectReads(){return rectReads;}};
}

test('active queries hydrate as compact controls; rapid reversals follow the native popover state',()=>{
 const s=mount({value:'React'});assert.equal(s.opened,false);assert.equal(s.showCalls,0);assert.equal(s.input.value,'React');
 // Native toggle events and React commits may arrive after another pointer action.
 s.click();assert.equal(s.opened,true);s.click();assert.equal(s.opened,false);s.click();assert.equal(s.opened,true);
 s.toggle();s.render();assert.equal(s.tree().trigger.props['aria-expanded'],true);
 s.escape();s.render();assert.equal(s.tree().trigger.props['aria-expanded'],false);assert.equal(s.document.activeElement,s.trigger);
 assert.equal(s.trigger.focusOptions.preventScroll,true);assert.equal(s.input.value,'React');assert.equal(s.tree().input.props.disabled,undefined);
 s.cleanup();
});

test('committed filter navigation discards stale drafts and closes without replaying an entrance',()=>{
 const s=mount({value:'React'});s.click();s.render();s.input.value='Unsubmitted draft';
 s.navigate('/skills','q=React&type=engineering',{value:'React'});
 assert.equal(s.input.value,'React');assert.equal(s.opened,false);assert.equal(s.showCalls,1);assert.equal(s.document.activeElement,s.trigger);
 const nextLink={};s.document.activeElement=nextLink;
 s.navigate('/skills','q=React&type=engineering&tool=codex',{value:'React'});
 assert.equal(s.document.activeElement,nextLink,'filter navigation cannot steal focus from its target');assert.equal(s.opened,false);
 s.cleanup();
});

test('controlled workspace typing keeps its one explicit reveal and caret owner',()=>{
 const changes=[],s=mount({onChange:value=>changes.push(value),submit:false});s.click();s.render();
 s.input.value='Re';s.tree().input.props.onChange({target:{value:'Re'}});s.render({value:'Re'});
 assert.deepEqual(changes,['Re']);assert.equal(s.input.value,'Re');assert.equal(s.opened,true);assert.equal(s.showCalls,1);assert.equal(s.document.activeElement,s.input);
 s.input.value='';s.tree().input.props.onChange({target:{value:''}});s.render({value:''});assert.equal(s.opened,true);assert.equal(s.showCalls,1);
 s.cleanup();
});

test('viewport bursts share one frame and skip unchanged style writes while clamping to the visual viewport',()=>{
 const s=mount();s.click();s.render();const reads=s.rectReads,writes=s.styleWrites;
 for(let n=0;n<20;n++){s.window.dispatchEvent(new Event('scroll'));s.viewport.dispatchEvent(new Event('resize'));}
 assert.equal(s.frames.size,1);assert.equal(s.cancels,0,'a pending frame is reused rather than repeatedly canceled');s.step();
 assert.equal(s.rectReads,reads+1);assert.equal(s.styleWrites,writes);
 Object.assign(s.viewport,{width:320,height:280,offsetLeft:30,offsetTop:400});s.geometry({right:1100,top:1000});s.viewport.dispatchEvent(new Event('resize'));s.step();
 assert.equal(s.panel.style.width,'296px');assert.equal(s.panel.style.left,'42px');assert.equal(s.panel.style.top,'624px');
 s.window.dispatchEvent(new Event('scroll'));assert.equal(s.frames.size,1);s.cleanup();assert.equal(s.frames.size,0);assert.equal(s.window.listeners.size+s.viewport.listeners.size,0);
});
