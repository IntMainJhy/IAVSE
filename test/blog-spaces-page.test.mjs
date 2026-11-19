import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {blogShowcases,showcaseProfile} from '../src/lib/blog-showcase.mjs';
import {localizeProfile} from '../src/lib/content-locales.mjs';

const source=fs.readFileSync(new URL('../src/components/BlogSpacesPage.tsx',import.meta.url),'utf8');
const jsx=(type,props)=>({type,props});
const walk=node=>Array.isArray(node)?node.flatMap(walk):node&&typeof node==='object'?[node,...walk(node.props?.children)]:[];
const text=node=>Array.isArray(node)?node.map(text).join(''):node&&typeof node==='object'?text(node.props?.children):typeof node==='string'||typeof node==='number'?String(node):'';
const memberCards=tree=>walk(tree).filter(node=>node.type==='li'&&node.props['data-space-kind']==='member');
const members=[
 {handle:'my-space',profile:{name:'Owner',alias:'Research notes',intro:'An unchanged published homepage.',avatarId:'portrait-owner',translations:{en:{name:'River Notes',intro:'Tools for quiet work.'},ja:{name:'川のノート',intro:'日々の制作について。'}}},mode:'theme',draft:{profile:{name:'PRIVATE_DRAFT_NAME'}},content:[{bodyHtml:'PRIVATE_ARTICLE_BODY'}]},
 {handle:'public-guest',profile:{name:'Guest',intro:'A published static site.',avatarId:''},mode:'static'}
];
async function renderDirectory({locale='zh',query={},directory=members,featured=[]}={}){
 const req=new Request('http://example.test/blogs'),reads=[],exports={};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,Intl,encodeURIComponent,require:name=>{
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};
  if(name==='next/link')return{default:'Link'};
  if(name.includes('server-i18n'))return{serverI18n:async()=>({locale,t:s=>s})};
  if(name.includes('spaces.mjs'))return{publicGallery:r=>{reads.push(r);return {directory,featured};}};
  if(name.includes('content-locales'))return{localizeProfile};
  if(name.includes('blog-showcase.mjs'))return{blogShowcases,showcaseProfile};
  if(name.endsWith('/Icons'))return{Icon:'Icon'};
  if(name.endsWith('.css'))return{};
  throw Error('Unexpected dependency '+name);
 }});
 const tree=await exports.BlogSpacesPage({req,query});
 assert.deepEqual(reads,[req],'uses the request-qualified discovery service once');
 return tree;
}

test('public blogs render immediately as a semantic directory with localized author details and original destinations',async()=>{
 for(const locale of ['zh','en','ja']){
  const tree=await renderDirectory({locale,featured:[{handle:'FEATURED_OUTSIDE_DIRECTORY',profile:{name:'NOT_A_DIRECTORY_MEMBER'}}]}),nodes=walk(tree);
  const directory=nodes.find(node=>node.type==='section'&&Object.hasOwn(node.props,'data-blog-directory'));
  assert.ok(directory,'the complete public list is present in the server-rendered tree');
  const cards=memberCards(directory);
  assert.equal(cards.length,members.length);
  assert.deepEqual(cards.flatMap(card=>walk(card).filter(node=>node.type==='Link').map(node=>node.props.href)),['/blog/my-space','/blog/public-guest']);
  for(let i=0;i<cards.length;i++){
   const expected=localizeProfile(members[i].profile,locale);
   assert.ok(text(cards[i]).includes(expected.name));
   assert.ok(text(cards[i]).includes(expected.intro));
   assert.ok(text(cards[i]).includes('@'+members[i].handle));
  }
  assert.doesNotMatch(JSON.stringify(tree),/PRIVATE_DRAFT_NAME|PRIVATE_ARTICLE_BODY|FEATURED_OUTSIDE_DIRECTORY|NOT_A_DIRECTORY_MEMBER/,'cards expose only approved directory summaries');
  assert.equal(nodes.filter(node=>['iframe','canvas','script','BlogSpaceGallery','BlogProductShowcase'].includes(node.type)).length,0,'the index has no scene, embedded sites or marketing film');
  assert.ok(nodes.some(node=>node.type==='Link'&&node.props.href==='/workspace/blog'),'creation points to the real workspace');
  const form=nodes.find(node=>node.type==='form');
  assert.equal(form.props.action,'/blogs');assert.equal(form.props.method,'get');assert.equal(form.props.role,'search');
  assert.ok(walk(form).some(node=>node.type==='input'&&node.props.name==='q'),'search works through a native GET form');
 }
});

test('search filters only discoverable directory summaries, using localized names, handles and intros',async()=>{
 for(const [query,locale,expected] of [
  [{q:'  ＯＷＮＥＲ  '},'zh',['my-space']],
  [{q:'published owner'},'zh',['my-space']],
  [{q:'public-guest'},'zh',['public-guest']],
  [{q:'research'},'zh',['my-space']],
  [{q:'quiet'},'en',['my-space']],
  [{q:'制作'},'ja',['my-space']],
  [{q:['Guest','Owner']},'zh',['public-guest']],
  [{q:[]},'zh',['my-space','public-guest']],
  [{q:'Lin Chen'},'zh',[]],
  [{q:'PRIVATE_DRAFT_NAME'},'zh',[]]
 ]){
  const tree=await renderDirectory({query,locale});
  assert.deepEqual(memberCards(tree).map(card=>walk(card).find(node=>node.type==='Link').props.href),expected.map(handle=>'/blog/'+handle));
  const examples=walk(tree).find(node=>node.type==='details');
  assert.equal(memberCards(examples).length,0,'examples never become public members or search results');
 }
 const tree=await renderDirectory({query:{q:'missing-space'}}),nodes=walk(tree);
 assert.ok(text(tree).includes('没有找到相关空间'));
 assert.ok(nodes.some(node=>node.type==='Link'&&node.props.href==='/blogs'),'a no-result query has a native way back to all spaces');
});

test('an empty public directory stays truthful and fictional examples remain separately collapsed',async()=>{
 for(const locale of ['zh','en','ja']){
  const tree=await renderDirectory({locale,directory:[],featured:[members[0]]}),nodes=walk(tree);
  const directory=nodes.find(node=>Object.hasOwn(node.props||{},'data-blog-directory'));
  assert.equal(memberCards(directory).length,0,'featured entries do not replace an empty eligible directory');
  assert.match(text(directory),/暂无公开博客空间|No public blog spaces yet|公開ブログはまだありません/);
  const examples=nodes.find(node=>node.type==='details'&&Object.hasOwn(node.props,'data-blog-examples'));
  assert.ok(examples);assert.ok(!examples.props.open,'built-in examples are collapsed by default');
  assert.match(text(examples),/虚构|fictional|架空/i);
  const cards=walk(examples).filter(node=>node.type==='li');
  assert.equal(cards.length,blogShowcases.length);
  assert.ok(cards.every(card=>card.props['data-space-kind']==='example'));
  assert.deepEqual(cards.map(card=>walk(card).find(node=>node.type==='Link').props.href),blogShowcases.map(item=>'/blogs/showcase/'+item.handle));
  assert.ok(cards.every(card=>/虚构人物|Fictional person|架空の人物/.test(text(card))));
 }
});

test('gallery warming uses the same original-home previews, keeps static sites inert and remains bounded/private',async()=>{
 const exports={},reads=[],req=new Request('http://example.test/api/blog-gallery'),members=[{handle:'my space',mode:'theme'},{handle:'static-member',mode:'static'}];
 const route=fs.readFileSync(new URL('../src/app/api/blog-gallery/route.ts',import.meta.url),'utf8');
 vm.runInNewContext(ts.transpileModule(route,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Response,encodeURIComponent,require:name=>{
  if(name.includes('spaces.mjs'))return{publicGallery:r=>{reads.push(r);return {directory:members,featured:[]};}};
  if(name.includes('blog-showcase.mjs'))return{blogShowcases};
  if(name.includes('blog-gallery-space'))return{galleryLimit:12};
  throw Error('Unexpected dependency '+name);
 }});
 const response=exports.GET(req),{previews}=await response.json();assert.deepEqual(reads,[req]);
 assert.equal(response.headers.get('cache-control'),'private, no-store');
 assert.equal(previews.length,12);assert.equal(previews[0],'/blog/my%20space/preview');assert.equal(previews[1],null);
 assert.deepEqual(previews.slice(2),blogShowcases.slice(0,10).map(s=>'/blogs/showcase/'+s.handle+'?embed=gallery'));
});
