import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/home-scroll-refresh.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
export function loadHomeScrollRefresh(globals){
 const exports={};
 vm.runInNewContext(source,{...globals,exports,require:name=>{
  if(name==='gsap/ScrollTrigger')return{ScrollTrigger:globals.ScrollTrigger};
  throw Error('Unexpected dependency '+name);
 }});
 return exports;
}
