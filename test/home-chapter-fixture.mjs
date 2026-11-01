import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/useHomeChapterActive.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
export function chapterFixture(React,{inactive=false}={}){
 const observers=[],chapter={getAttribute:()=>inactive?'true':null},host={closest:()=>chapter},exports={};
 class MutationObserver{constructor(callback){this.callback=callback;observers.push(this);}observe(target,options){this.target=target;this.options=options;}disconnect(){this.disconnected=true;}}
 vm.runInNewContext(source,{exports,MutationObserver,require:name=>{if(name==='react')return React;throw Error('Unexpected chapter dependency '+name);}});
 return {module:exports,host,observers,activate(value){inactive=!value;for(const observer of observers)if(!observer.disconnected)observer.callback([{attributeName:'aria-hidden'}]);}};
}
