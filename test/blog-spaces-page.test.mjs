import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {blogShowcases,showcaseProfile} from '../src/lib/blog-showcase.mjs';
import {localizeProfile} from '../src/lib/content-locales.mjs';

const source=fs.readFileSync(new URL('../src/components/BlogSpacesPage.tsx',import.meta.url),'utf8');
const jsx=(type,props)=>({type,props});
const walk=node=>node&&typeof node==='object'?[node,...[node.props?.children].flat().flatMap(walk)]:[];

test('spatial directory preserves member destinations, matches example preview links and offers a full native fallback',async()=>{
 for(const locale of ['zh','en','ja']){
  const req=new Request('http://example.test/blogs'),reads=[],members=[
   {handle:'my-space',profile:{name:'Owner',intro:'An unchanged published homepage.',avatarId:'portrait-owner'},mode:'theme'},
   {handle:'public-guest',profile:{name:'Guest',intro:'A published static site.',avatarId:''},mode:'static'}
  ],exports={};
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,Intl,encodeURIComponent,require:name=>{
   if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};
   if(name==='next/link')return{default:'Link'};
   if(name.includes('server-i18n'))return{serverI18n:async()=>({locale,t:s=>s})};
   if(name.includes('spaces.mjs'))return{publicSpaces:r=>{reads.push(r);return members;}};
   if(name.includes('content-locales'))return{localizeProfile};
   if(name.includes('blog-showcase.mjs'))return{blogShowcases,showcaseProfile};
   if(name.endsWith('BlogSpaceGallery'))return{BlogSpaceGallery:'BlogSpaceGallery'};
   if(name.endsWith('BlogProductShowcase'))return{BlogProductShowcase:'BlogProductShowcase'};
   if(name.endsWith('/Icons'))return{Icon:'Icon'};
   throw Error('Unexpected dependency '+name);
  }});
  const tree=await exports.BlogSpacesPage({req}),nodes=walk(tree),gallery=nodes.find(n=>n.type==='BlogSpaceGallery'),fallback=nodes.find(n=>n.type==='details'&&Object.hasOwn(n.props,'data-blog-spaces-list'));
  assert.deepEqual(reads,[req],'uses the request-qualified discovery service once');
  assert.ok(gallery);assert.ok(fallback,'native details remains usable without scene JavaScript');
  assert.equal(gallery.props.spaces.length,members.length+blogShowcases.length);
  assert.deepEqual(Array.from(gallery.props.spaces.slice(0,2),s=>({href:s.href,mode:s.mode})),[{href:'/blog/my-space',mode:'theme'},{href:'/blog/public-guest',mode:'static'}]);
  const expected=[...members.map(s=>'/blog/'+s.handle),...blogShowcases.map(s=>'/blogs/showcase/'+s.handle)];
  assert.deepEqual(walk(fallback).filter(n=>n.type==='Link').map(n=>n.props.href),expected);
  assert.deepEqual(Array.from(gallery.props.spaces,s=>s.href),expected,'preview and opened original home use the same route');
  assert.ok(gallery.props.spaces.slice(2).every(s=>s.showcase&&s.role&&s.href.indexOf('?')<0));
  const evidence=nodes.find(n=>n.type==='BlogProductShowcase');
  assert.deepEqual(Array.from(evidence.props.spaces,s=>s.handle),members.map(s=>s.handle),'public-member directory does not invent accounts from examples');
 }
});

test('gallery warming uses the same original-home previews, keeps static sites inert and remains bounded/private',async()=>{
 const exports={},reads=[],req=new Request('http://example.test/api/blog-gallery'),members=[{handle:'my space',mode:'theme'},{handle:'static-member',mode:'static'}];
 const route=fs.readFileSync(new URL('../src/app/api/blog-gallery/route.ts',import.meta.url),'utf8');
 vm.runInNewContext(ts.transpileModule(route,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Response,encodeURIComponent,require:name=>{
  if(name.includes('spaces.mjs'))return{publicSpaces:r=>{reads.push(r);return members;}};
  if(name.includes('blog-showcase.mjs'))return{blogShowcases};
  if(name.includes('blog-gallery-space'))return{galleryLimit:12};
  throw Error('Unexpected dependency '+name);
 }});
 const response=exports.GET(req),{previews}=await response.json();assert.deepEqual(reads,[req]);
 assert.equal(response.headers.get('cache-control'),'private, no-store');
 assert.equal(previews.length,12);assert.equal(previews[0],'/blog/my%20space/preview');assert.equal(previews[1],null);
 assert.deepEqual(previews.slice(2),blogShowcases.slice(0,10).map(s=>'/blogs/showcase/'+s.handle+'?embed=gallery'));
});
