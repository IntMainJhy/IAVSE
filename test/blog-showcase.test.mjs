import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {blogShowcases,showcaseProfile,showcasePageData,showcaseAvatarSrc} from '../src/lib/blog-showcase.mjs';
import {blogTemplates} from '../src/lib/blog-templates.mjs';
import {blogAppearances} from '../src/lib/blog-appearances.mjs';

test('showcase data uses the existing blog layout and appearance system without member accounts',()=>{
 assert.equal(new Set(blogShowcases.map(item=>item.handle)).size,11);
 assert.deepEqual(new Set(blogShowcases.map(item=>item.appearance)),new Set(blogAppearances.map(item=>item.id)));
 assert.deepEqual(new Set(blogShowcases.map(item=>item.template)),new Set(blogTemplates.map(item=>item.id)));
 assert.equal(new Set(blogShowcases.map(item=>item.avatarSrc)).size,11);
 assert.equal(new Set(blogShowcases.map(item=>item.role)).size,11);
 for(const entry of blogShowcases){
  const preview=showcaseProfile(entry.handle,'zh'),data=showcasePageData(entry.handle,'zh'),english=showcasePageData(entry.handle,'en'),design=data.layout.blog.design;
  assert.ok(preview.href.startsWith('/blogs/showcase/'));assert.equal(preview.showcase,true);assert.equal(preview.avatarId,'');
  assert.equal(data.owner,'showcase');assert.equal(data.siteOwner,false);assert.equal(data.profile.name,entry.name);assert.equal(data.profile.avatarId,'');
  assert.ok(blogTemplates.some(template=>template.id===design.template));assert.ok(blogAppearances.some(appearance=>appearance.id===design.appearance));
  assert.equal(design.template,entry.template);assert.equal(design.appearance,entry.appearance);assert.equal(design.autoLayout,true);
  assert.ok(design.nodes.some(node=>node.kind==='template'&&node.part==='header'));
  assert.ok(design.nodes.some(node=>node.kind==='template'&&node.part==='section:work'));
  assert.ok(design.nodes.every(node=>node.kind==='template'||node.id==='contact-note'),'only existing template factory nodes are used');
  assert.deepEqual(data.profile.resume.metrics,[]);assert.deepEqual(data.profile.experiences,[]);assert.deepEqual(data.content,[]);
  assert.equal(data.profile.resume.sections[0].items[0].title,entry.projectTitle);assert.equal(data.profile.intro,entry.intro);assert.equal(english.profile.intro,entry.introEn);
  assert.equal(design.motion.entrance,false);assert.equal(design.motion.interactions,false);assert.equal(design.motion.marquee,false);
 }
 for(const handle of ['../private','not-a-profile','lin-studio/../../admin']){assert.equal(showcaseProfile(handle),null);assert.equal(showcasePageData(handle),null);}
});

test('bundled avatar sources allow exact local art only and cannot become arbitrary image URLs',()=>{
 const artwork=new Set();
 for(const entry of blogShowcases){assert.equal(showcaseAvatarSrc(entry.avatarSrc),entry.avatarSrc);const svg=fs.readFileSync(new URL('../public'+entry.avatarSrc,import.meta.url),'utf8');assert.match(svg,/^<svg[\s>]/);assert.doesNotMatch(svg,/<script|javascript:|onload\s*=/i);assert.match(svg,/creativecommons.org\/publicdomain\/zero/);artwork.add(svg);}
 assert.equal(artwork.size,11,'each display has its own bundled hand-drawn portrait');
 for(const value of ['https://example.test/face.svg','//example.test/a.svg','/images/showcase/../private.svg','/images/showcase/lin.svg?key=private','/images/showcase/lin.svg#x','/images/showcase/%6cin.svg','/media/a','/images/showcase/unused.svg','javascript:alert(1)',null,{},42])assert.equal(showcaseAvatarSrc(value),'');
});

test('showcase embed renders the real BlogTheme without platform chrome or visit collection',async()=>{
 const source=fs.readFileSync(new URL('../src/app/blogs/showcase/[handle]/page.tsx',import.meta.url),'utf8'),compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,exports={};
 const jsx=(type,props)=>({type,props});
 vm.runInNewContext(compiled,{exports,require:name=>{
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};if(name==='next/link')return{default:'Link'};
  if(name.endsWith('.css'))return{};
  if(name.endsWith('/BlogTheme'))return{BlogTheme:'StaticBlogTheme'};
  if(name==='next/navigation')return{notFound:()=>{throw Error('Not found');}};
  if(name.includes('server-i18n'))return{serverI18n:async()=>({locale:'zh'})};
  if(name.includes('blog-showcase'))return{showcasePageData};
  if(name.includes('BlogThemeBoundary'))return{PublicBlogTheme:'PublicBlogTheme'};
  throw Error('Unexpected dependency '+name);
 }});
 const request=embed=>({params:Promise.resolve({handle:'lin-studio'}),searchParams:Promise.resolve(embed?{embed:'gallery'}:{})});
 const preview=await exports.default(request(true));assert.equal(preview.props.className,'blog-public-shell blog-gallery-embed');
 const theme=preview.props.children;assert.equal(theme.type,'StaticBlogTheme');assert.equal(theme.props.staticPreview,true);assert.equal(theme.props.preview,true);assert.equal(theme.props.embedded,true);assert.equal(theme.props.data.layout.blog.design.appearance,'sketch');
 const full=await exports.default(request(false));assert.equal(full.props.className,'showcase-full-page');assert.equal(exports.metadata.robots.index,false);assert.equal(exports.metadata.robots.follow,false);
 await assert.rejects(()=>exports.default({params:Promise.resolve({handle:'missing'}),searchParams:Promise.resolve({embed:'gallery'})}),/Not found/);
});
