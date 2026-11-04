import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/NavigationIntent.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function mount(){
 const listeners=new Map(),calls=[],connection={},exports={},location=new URL('https://site.example/workspace/blog');let effect,time=1000,fail=false;
 class Element{
  constructor(href,options={}){this.href=new URL(href,location.href).href;this.target='';this.main=true;this.download=false;Object.assign(this,options);}
  closest(){return this;}
  matches(){return this.main;}
  hasAttribute(name){return name==='download'&&this.download;}
 }
 const document={addEventListener:(name,handler)=>listeners.set(name,handler),removeEventListener:name=>listeners.delete(name)};
 vm.runInNewContext(source,{exports,document,location,navigator:{connection},Element,URL,Date:{now:()=>time},require:name=>{
  if(name==='react')return{useEffect:callback=>{effect=callback;}};
  if(name==='next/navigation')return{useRouter:()=>({prefetch:href=>{if(fail)throw Error('Prefetch unavailable');calls.push(href);}})};
  throw new Error('Unexpected dependency: '+name);
 }});
 assert.equal(exports.NavigationIntent(),null);const cleanup=effect();
 function intent(name,href,options={},extra={}){const event={target:new Element(href,options),defaultPrevented:false,...extra};listeners.get(name)(event);return event;}
 return{listeners,calls,connection,location,cleanup,intent,advance:ms=>{time+=ms;},failing:value=>{fail=value;}};
}

test('public main navigation warms on pointer, keyboard and touch intent without handling clicks',()=>{
 const f=mount();
 const pointer=f.intent('pointerover','/community');f.intent('focusin','/blogs');f.intent('touchstart','/resources');f.intent('focusin','/');
 assert.deepEqual(f.calls,['/community','/blogs','/resources','/']);assert.equal(f.listeners.has('click'),false);assert.equal(pointer.defaultPrevented,false);f.cleanup();assert.equal(f.listeners.size,0);
});

test('repeated intent is deduplicated for thirty seconds and remains limited to four destinations',()=>{
 const f=mount();for(let i=0;i<40;i++)for(const href of ['/','/community','/blogs','/resources'])f.intent(i%2?'focusin':'pointerover',href);
 assert.equal(f.calls.length,4);f.advance(29999);f.intent('touchstart','/resources');assert.equal(f.calls.length,4);f.advance(1);f.intent('pointerover','/resources');assert.equal(f.calls.length,5);f.cleanup();
});

test('footer, account, preview, modified, download and hash links never trigger intent prefetch',()=>{
 const f=mount();
 for(const href of ['/workspace/account','/workspace/blog','/admin','/login','/blog/lin','/blogs/showcase/lin','/api/auth/me','/download/file','/resources?compose=1','/resources#tools','https://elsewhere.example/community'])f.intent('pointerover',href);
 for(const options of [{main:false},{target:'_blank'},{target:'preview-frame'},{download:true}])f.intent('pointerover','/blogs',options);
 for(const extra of [{defaultPrevented:true},{metaKey:true},{ctrlKey:true},{shiftKey:true},{altKey:true}])f.intent('focusin','/community',{},extra);
 f.location.pathname='/resources';f.location.search='';f.intent('touchstart','/resources');assert.deepEqual(f.calls,[]);f.cleanup();
});

test('data-saving and slow-network preferences suppress optional loading and can change while mounted',()=>{
 const f=mount();f.connection.saveData=true;f.intent('pointerover','/community');f.connection.saveData=false;
 for(const effectiveType of ['slow-2g','2g','3g']){f.connection.effectiveType=effectiveType;f.intent('focusin','/blogs');}
 assert.deepEqual(f.calls,[]);f.connection.effectiveType='4g';f.intent('touchstart','/resources');assert.deepEqual(f.calls,['/resources']);f.cleanup();
});

test('an unavailable prefetch never cancels navigation or prevents a later retry',()=>{
 const f=mount();f.failing(true);assert.doesNotThrow(()=>f.intent('pointerover','/blogs'));assert.deepEqual(f.calls,[]);f.failing(false);f.intent('focusin','/blogs');assert.deepEqual(f.calls,['/blogs']);f.cleanup();
});
