import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import ts from 'typescript';
import nextConfig from '../next.config.mjs';

const compile=path=>ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;

test('only the explicit public homepage gallery preview permits same-origin framing',async()=>{
 const exports={};
 class NextResponse{constructor(body,options={}){this.body=body;this.headers=new Headers(options.headers);}static next(){return new NextResponse(null);}static json(){return new NextResponse(null);}static redirect(){return new NextResponse(null);}}
 vm.runInNewContext(compile('../src/middleware.ts'),{exports,Headers,Map,Date,URL,Uint8Array,crypto:webcrypto,btoa,process:{env:{NODE_ENV:'production'}},require:name=>{
  if(name==='next/server')return{NextResponse};
  if(name.includes('app-access'))return{apiAllowed:()=>true,pageRedirect:()=>null,appSurface:()=> 'combined'};
  if(name.includes('request-security'))return{clientIp:()=> 'gallery-test'};
  throw Error(name);
 }});
 for(const path of ['/blog/alice','/blog/alice?embed=other','/blog/alice/articles/one?embed=gallery','/workspace/blog?embed=gallery','/login?embed=gallery','/blogs/showcase/lin-studio','/blogs/showcase/lin-studio?embed=other','/blogs/showcase/lin-studio/private?embed=gallery','/blog/alice/preview/private?embed=gallery','/blog/alice/articles/preview?embed=gallery']){
  const response=exports.middleware({nextUrl:new URL('https://example.test'+path),url:'https://example.test'+path,headers:new Headers()});
  assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/,path);
 }
 for(const path of ['/blog/alice?embed=gallery','/blogs/showcase/lin-studio?embed=gallery','/blog/alice/preview']){
 const response=exports.middleware({nextUrl:new URL('https://example.test'+path),url:'https://example.test'+path,headers:new Headers()});
 assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'self'/);
 assert.equal(response.headers.get('X-Frame-Options'),'SAMEORIGIN');
 assert.equal(response.headers.get('X-Robots-Tag'),'noindex, nofollow');
 }
 const rules=await nextConfig.headers(),preview=rules.find(rule=>rule.source==='/blog/:handle');
 assert.deepEqual(preview.has,[{type:'query',key:'embed',value:'gallery'}]);
 const isolatedPreview=rules.find(rule=>rule.source==='/blog/:handle/preview');
 assert.equal(isolatedPreview.has,undefined);
 assert.equal(isolatedPreview.headers.find(header=>header.key==='X-Frame-Options').value,'SAMEORIGIN');
 const samplePreview=rules.find(rule=>rule.source==='/blogs/showcase/:handle');
 assert.deepEqual(samplePreview.has,[{type:'query',key:'embed',value:'gallery'}]);
 assert.equal(samplePreview.headers.find(header=>header.key==='X-Frame-Options').value,'SAMEORIGIN');
 assert.equal(rules[0].headers.find(header=>header.key==='X-Frame-Options').value,'DENY');
});

test('legacy theme embeds redirect to their isolated renderer while static sites retain the original route',async()=>{
 const data={owner:'owner',handle:'alice',profile:{name:'Alice',intro:'Published biography'},layout:{blog:{design:{nodes:[]}}},content:[]};
 const exports={},jsx=(type,props)=>({type,props}),dependency=(name)=>{
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};
  if(name==='next/link')return{default:'Link'};
  if(name==='next/navigation')return{notFound:()=>{throw Error('Not found');},redirect:path=>{throw Error('Redirect:'+path);}};
  if(name.includes('server-i18n'))return{serverI18n:async()=>({t:x=>x,locale:'en'})};
  if(name.includes('spaces.mjs'))return{publicSpace:()=>data};
  if(name.includes('blog-hosting.mjs'))return{publicBlogBundle:()=>({id:'bundle',files:['index.html'],entry:'index.html'}),staticPage:()=> 'index.html'};
  if(name==='./BlogTheme')return{BlogTheme:'StaticBlogTheme'};
  if(name.includes('content-locales'))return{localizeProfile:x=>x};
  return Object.fromEntries(['PlatformGlass','BrandMark','PublicBlogTheme','BlogShare','StaticSite','SpaceVisit'].map(key=>[key,key]));
 };
 vm.runInNewContext(compile('../src/components/BlogPublic.tsx'),{exports,require:dependency});
 const walk=node=>node&&typeof node==='object'?[node,...[node.props?.children].flat().flatMap(walk)]:[];
 const req=new Request('https://example.test/blog/alice');
 await assert.rejects(()=>exports.BlogPublic({req,path:['blog','alice'],query:{embed:'gallery'}}),/Redirect:\/blog\/alice\/preview/);
 const normal=await exports.BlogPublic({req,path:['blog','alice'],query:{}});
 assert.equal(walk(normal).some(node=>node.type==='SpaceVisit'),true);
 assert.equal(walk(normal).some(node=>node.props?.className==='blog-platform-bar'),true);
 data.owner='member';data.layout.blog.mode='static';
 const hosted=await exports.BlogPublic({req,path:['blog','alice'],query:{embed:'gallery'}}),nodes=walk(hosted);
 assert.equal(nodes.some(node=>node.type==='StaticSite'),true);assert.equal(nodes.some(node=>node.type==='SpaceVisit'),false);
 assert.equal(nodes.find(node=>node.type==='StaticSite').props.src,'/site-files/bundle/public/index.html');
});


test('isolated theme previews enforce public-space eligibility and keep the original template and locale',async()=>{
 const exports={},jsx=(type,props)=>({type,props});let locale='en',allowed=true,mode='theme',read;
 const data={owner:'member',handle:'alice',profile:{name:'Published Alice'},layout:{blog:{mode:'theme'}},content:[]};
 vm.runInNewContext(compile('../src/app/blog/[handle]/preview/page.tsx'),{exports,Request,URL,Headers,process:{env:{PUBLIC_URL:'https://example.test'}},require:name=>{
  if(name.endsWith('.css'))return{};
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};
  if(name==='next/headers')return{headers:async()=>new Headers({cookie:'site-locale='+locale})};
  if(name==='next/navigation')return{notFound:()=>{throw Error('Not found');}};
  if(name.includes('server-i18n'))return{serverI18n:async()=>({locale})};
  if(name.includes('spaces.mjs'))return{publicSpace:(req,handle)=>{read={req,handle};if(!allowed)throw Error('Private/frozen/ineligible');return{...data,layout:{blog:{mode}}};}};
  if(name.includes('/BlogTheme'))return{BlogTheme:'StaticBlogTheme'};
  throw Error(name);
 }});
 for(locale of ['en','zh','ja']){
  const tree=await exports.default({params:Promise.resolve({handle:'alice'})});
  assert.equal(tree.props.lang,locale==='zh'?'zh-CN':locale);assert.equal(tree.props.className,'blog-public-shell blog-gallery-embed');
  const theme=tree.props.children;assert.equal(theme.type,'StaticBlogTheme');assert.equal(theme.props.data.profile.name,'Published Alice');
  assert.equal(theme.props.preview,true);assert.equal(theme.props.staticPreview,true);assert.equal(read.handle,'alice');
  assert.equal(read.req.headers.get('cookie'),'site-locale='+locale);
 }
 allowed=false;await assert.rejects(()=>exports.default({params:Promise.resolve({handle:'alice'})}),/Not found/);
 allowed=true;mode='static';await assert.rejects(()=>exports.default({params:Promise.resolve({handle:'alice'})}),/Not found/);
 assert.equal(exports.metadata.robots.index,false);assert.equal(exports.metadata.robots.follow,false);
 const publicSource=fs.readFileSync(new URL('../src/components/BlogPublic.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(publicSource,/import\(['"]\.\/BlogTheme['"]\)/,'the general page graph must not import the static theme renderer');
});
