import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseDocument} from 'htmlparser2';
import ts from 'typescript';
import {blogProductCopy} from '../src/lib/blog-product-copy.mjs';
import {blogTemplates} from '../src/lib/blog-templates.mjs';
import {blogAppearances} from '../src/lib/blog-appearances.mjs';
import {blogShowcases} from '../src/lib/blog-showcase.mjs';

const looksSource=ts.transpileModule(readFileSync(new URL('../src/components/BlogProductLooks.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const source=ts.transpileModule(readFileSync(new URL('../src/components/BlogProductShowcase.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const element=React.createElement,walk=node=>[node,...(node.children||[]).flatMap(walk)],text=node=>node.type==='text'?node.data:(node.children||[]).map(text).join('');
const fixtures=[{handle:'alpha',name:'Alpha <script>alert(1)</script>',intro:'A public introduction',avatarId:'',href:'/blog/alpha',mode:'theme'},{handle:'beta',name:'Beta',intro:'Another published space',avatarId:'',href:'/blog/beta',mode:'static'}];
function render(locale='zh',spaces=fixtures){
 let lookProps;
 const modules={
  './ProductCinema':{ProductCinema:()=>null},
  'react':React,'react/jsx-runtime':runtime,
  'next/link':{default:({href,children,prefetch,...props})=>element('a',{href,...props},children)},
  './BlogProductMotion':{BlogProductMotion:({children})=>element('div',{'data-product-motion':''},children)},
  './HomeBlogCanvasDemo':{HomeBlogCanvasDemo:({locale})=>element('div',{'data-local-demo':locale})},
  './FeedAvatar':{FeedAvatar:()=>null},'./Icons':{Icon:()=>null},'@/lib/blog-product-copy.mjs':{blogProductCopy},'@/app/blog-product-film.css':{}
 };
 const looksExports={};vm.runInNewContext(looksSource,{exports:looksExports,require:name=>{if(!Object.hasOwn(modules,name))throw Error('Unexpected dependency '+name);return modules[name];}});
 modules['./BlogProductLooks']={BlogProductLooks:props=>{lookProps=props;return element(looksExports.BlogProductLooks,props);}};
 const exports={};vm.runInNewContext(source,{exports,require:name=>{if(!Object.hasOwn(modules,name))throw Error('Unexpected dependency '+name);return modules[name];}});
 const html=renderToStaticMarkup(element(exports.BlogProductShowcase,{locale,spaces,labels:{open:'Enter space',empty:'No public spaces yet.',emptyBody:'Work and ideas meet here.'}}));
 return{html,nodes:walk(parseDocument(html)),lookProps};
}

test('the product story retains its gallery anchor, three real feature scenes and complete server-rendered creator directory',()=>{
 const{html,nodes,lookProps}=render(),copy=blogProductCopy('zh');
 assert.ok(nodes.some(node=>node.attribs?.id==='blog-spaces-directory'));
 assert.equal(nodes.filter(node=>Object.hasOwn(node.attribs||{},'data-film-scene')).length,3);
 for(const id of ['film-canvas-title','film-looks-title','film-publish-title'])assert.ok(nodes.some(node=>node.attribs?.id===id));
 const directory=nodes.find(node=>Object.hasOwn(node.attribs||{},'data-blog-directory'));assert.ok(directory);assert.equal(directory.name,'details');assert.equal(Object.hasOwn(directory.attribs,'open'),false);
 const links=walk(directory).filter(node=>node.name==='a').map(node=>node.attribs.href);assert.deepEqual(links,fixtures.map(space=>space.href));
 assert.equal(nodes.filter(node=>node.name==='iframe').length,0,'the product story must not execute additional embedded member sites');
 assert.equal(nodes.filter(node=>node.name==='script').length,0);assert.ok(nodes.some(node=>node.type==='text'&&node.data===fixtures[0].name),'public author names remain escaped text');
 assert.ok(nodes.some(node=>node.name==='a'&&node.attribs.href==='/workspace/blog'));
 const examples=nodes.filter(node=>node.name==='a'&&node.attribs.href?.startsWith('/blogs/showcase/'));assert.equal(examples.length,2,'the selected look and publish scene each retain a real example destination');
 for(const look of lookProps.looks)assert.ok(blogShowcases.some(item=>item.handle===look.handle),'every selectable look must retain a real bundled destination');
 for(const link of examples)assert.ok(blogShowcases.some(item=>link.attribs.href==='/blogs/showcase/'+item.handle),'example links must point at existing bundled showcases');
 assert.equal(nodes.filter(node=>node.attribs?.role==='tab').length,3);
 assert.ok(nodes.some(node=>node.name==='a'&&node.attribs.href==='#film-canvas-title'&&text(node)===copy.tryCanvas));
 assert.ok(html.includes(copy.canvasHint),'the local-only demo boundary must be visible');assert.ok(nodes.some(node=>node.attribs?.['data-local-demo']==='zh'));
});

test('product visuals reserve geometry and an empty public directory keeps a real creation path',()=>{
 const{nodes}=render('en',[]),images=nodes.filter(node=>node.name==='img');assert.equal(images.length,5);
 for(const image of images){assert.match(image.attribs.src,/^\/media\/blog-product\/[a-z-]+\.webp$/);const mobile=image.attribs.src.endsWith('/portfolio-mobile.webp');assert.equal(image.attribs.width,mobile?'390':'900');assert.equal(image.attribs.height,mobile?'844':'1015');assert.equal(image.attribs.loading,'lazy');assert.equal(image.attribs.decoding,'async');assert.ok(image.attribs.alt);}
 const selected=nodes.filter(node=>node.attribs?.role==='tabpanel'&&node.attribs['aria-hidden']==='false');assert.equal(selected.length,1);assert.equal(walk(selected[0]).find(node=>node.name==='img').attribs.src,'/media/blog-product/portfolio.webp');
 assert.equal(images.filter(image=>image.attribs.src.endsWith('/portfolio-mobile.webp')).length,1);
 const directory=nodes.find(node=>Object.hasOwn(node.attribs||{},'data-blog-directory'));assert.ok(text(directory).includes('No public spaces yet.'));
 assert.deepEqual(walk(directory).filter(node=>node.name==='a').map(node=>node.attribs.href),['/workspace/blog']);
});

test('every supported language covers the product story and states the actual layout and appearance capabilities',()=>{
 const keys=Object.keys(blogProductCopy('zh')).sort();
 for(const locale of ['zh','en','ja']){const copy=blogProductCopy(locale);assert.deepEqual(Object.keys(copy).sort(),keys);for(const value of Object.values(copy))assert.ok(Array.isArray(value)?value.length===3&&value.every(item=>item.trim()):value.trim());const{nodes}=render(locale);assert.ok(nodes.some(node=>node.type==='text'&&node.data===copy.canvasHint));}
 const numberWords={6:'six',8:'eight'},numberChinese={6:'六',8:'八'};
 assert.match(blogProductCopy('en').looksBody,new RegExp(numberWords[blogTemplates.length]+' layouts','i'));
 assert.match(blogProductCopy('en').looksBody,new RegExp(numberWords[blogAppearances.length]+' visual styles','i'));
 assert.ok(blogProductCopy('zh').looksBody.includes(numberChinese[blogTemplates.length]+'种布局'));assert.ok(blogProductCopy('zh').looksBody.includes(numberChinese[blogAppearances.length]+'种外观'));
 assert.ok(blogProductCopy('ja').looksBody.includes(blogTemplates.length+' 種類のレイアウト'));assert.ok(blogProductCopy('ja').looksBody.includes(blogAppearances.length+' 種類のスタイル'));
});
