import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as geometry from '../src/lib/blog-gallery-space.mjs';

const exports={},jsx=(type,props)=>({type,props});
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/components/BlogSpaceGallery.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:name=>{
 if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};
 if(name==='react')return{memo:fn=>fn,useRef:value=>({current:value}),useEffect:()=>{},useCallback:fn=>fn,useMemo:fn=>fn(),useState:value=>[typeof value==='function'?value():value,()=>{}]};
 if(name==='next/link')return{default:'Link'};
 if(name==='gsap')return{gsap:{}};
 if(name.includes('blog-gallery-space'))return geometry;
 if(name.includes('gallery-preview'))return{cachedGalleryPreview:()=>null};
 if(name.includes('LocaleProvider'))return{useLocale:()=>({locale:'en'})};
 return{};
}});
const walk=node=>node&&typeof node==='object'?[node,...[node.props?.children].flat().flatMap(walk)]:[];
test('themed previews cannot execute scripts while authored static-site previews retain their sandbox',()=>{
 const spaces=[{handle:'theme',name:'Theme',href:'/blog/theme'},{handle:'static',name:'Static',href:'/blog/static',mode:'static'},{handle:'sample',name:'Sample',href:'/blogs/showcase/sample',showcase:true}];
 const wrapped=exports.BlogSpaceGallery({spaces,labels:{}}),gallery=wrapped.type(wrapped.props),panels=walk(gallery).filter(node=>typeof node.type==='function'&&Object.hasOwn(node.props||{},'mounted'));
 const frames=panels.map(panel=>walk(panel.type({...panel.props,mounted:true})).find(node=>node.type==='iframe'));
 assert.equal(frames.length,3);
 assert.equal(frames[0].props.sandbox,'allow-same-origin');
 assert.equal(frames[1].props.sandbox,'allow-scripts allow-same-origin');
 assert.equal(frames[2].props.sandbox,'allow-same-origin');
 assert.equal(frames[0].props.src,'/blog/theme/preview');
 assert.equal(frames[1].props.src,'/blog/static?embed=gallery');
 assert.equal(frames[2].props.src,'/blogs/showcase/sample?embed=gallery');
 for(const frame of frames){assert.equal(frame.props.tabIndex,-1);assert.equal(frame.props['aria-hidden'],'true');assert.equal(frame.props.loading,'eager');}
});
