import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {blogShowcases,showcaseProfile,showcasePageData,showcaseAvatarSrc} from '../src/lib/blog-showcase.mjs';
import {blogTemplates} from '../src/lib/blog-templates.mjs';
import {blogAppearances} from '../src/lib/blog-appearances.mjs';
import {showcasePortfolioData} from '../src/lib/blog-showcase-stories.mjs';

test('showcase data uses the existing blog layout and appearance system without member accounts',()=>{
 assert.equal(new Set(blogShowcases.map(item=>item.handle)).size,11);
 assert.deepEqual(new Set(blogShowcases.map(item=>item.appearance)),new Set(blogAppearances.map(item=>item.id)));
 assert.deepEqual(new Set(blogShowcases.map(item=>item.template)),new Set(blogTemplates.map(item=>item.id)));
 assert.equal(new Set(blogShowcases.map(item=>item.avatarSrc)).size,11);
 assert.equal(new Set(blogShowcases.map(item=>item.role)).size,11);
 for(const entry of blogShowcases){
  const preview=showcaseProfile(entry.handle,'zh'),data=showcasePageData(entry.handle,'zh'),english=showcasePageData(entry.handle,'en'),design=data.layout.blog.design;
  assert.equal(preview.href,'/blogs/showcase/'+entry.handle+'?template=builtin');assert.equal(preview.showcase,true);assert.equal(preview.avatarId,'');
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

test('gallery original-home previews match full homepages while explicit editor-template previews remain available',async()=>{
 const source=fs.readFileSync(new URL('../src/app/blogs/showcase/[handle]/page.tsx',import.meta.url),'utf8'),compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,exports={};
 const jsx=(type,props)=>({type,props});
 vm.runInNewContext(compiled,{exports,require:name=>{
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};if(name.endsWith('.css'))return{};
  if(name==='next/navigation')return{notFound:()=>{throw Error('Not found');}};
  if(name==='next/link')return{default:'Link'};
  if(name.includes('server-i18n'))return{serverI18n:async()=>({locale:'zh'})};
  if(name.includes('blog-showcase.mjs'))return{showcasePageData};
  if(name.includes('blog-showcase-stories'))return{showcasePortfolioData};
  if(name.includes('blog-templates'))return{blogTemplates};
  if(name.includes('blog-appearances'))return{blogAppearance:id=>blogAppearances.find(item=>item.id===id)};
  if(name.includes('/BlogTheme'))return{BlogTheme:'BlogTheme'};
  if(name.includes('ShowcasePortfolio'))return{ShowcasePortfolio:'ShowcasePortfolio'};
  throw Error('Unexpected dependency '+name);
 }});
 const request=(handle,query={})=>({params:Promise.resolve({handle}),searchParams:Promise.resolve(query)}),walk=node=>node&&typeof node==='object'?[node,...[node.props?.children].flat().flatMap(walk)]:[];
 for(const item of blogShowcases){
  const preview=await exports.default(request(item.handle,{embed:'gallery',template:'builtin'})),legacy=await exports.default(request(item.handle,{embed:'gallery'})),full=await exports.default(request(item.handle,{template:'builtin'})),study=await exports.default(request(item.handle));
  assert.equal(preview.props.className,'blog-public-shell blog-gallery-embed','the loader can recognize every actual example document');
  const frameTheme=preview.props.children,fullTheme=walk(full).find(node=>node.type==='BlogTheme');
  assert.equal(frameTheme.type,'BlogTheme');assert.equal(frameTheme.props.preview,true);assert.equal(frameTheme.props.staticPreview,true);assert.equal(frameTheme.props.embedded,true);
  assert.deepEqual(frameTheme.props.data,showcasePageData(item.handle,'zh'));assert.deepEqual(fullTheme.props.data,frameTheme.props.data);
  assert.equal(fullTheme.props.staticPreview,false,'the full example keeps native responsive layout');
  assert.equal(study.type,'ShowcasePortfolio','original reference studies are retained');assert.equal(study.props.data.projects.length,2);
  assert.equal(legacy.props.className,'blog-public-shell blog-gallery-embed');
  assert.equal(legacy.props.children.type,'ShowcasePortfolio');assert.equal(legacy.props.children.props.embedded,true);
  assert.deepEqual(legacy.props.children.props.data,study.props.data,'default gallery and opened homepage present the same work');
  assert.equal(walk(full).some(node=>node.type==='SpaceVisit'),false);
 }
 assert.equal(exports.metadata.robots.index,false);assert.equal(exports.metadata.robots.follow,false);
 for(const query of [{},{embed:'gallery'},{template:'builtin'}])await assert.rejects(()=>exports.default(request('missing',query)),/Not found/);
});

test('every fictional creator has substantive localized cases, notes and a working method',()=>{
 const art=new Set();
 for(const locale of ['zh','en'])for(const creator of blogShowcases){
  const data=showcasePortfolioData(creator.handle,locale);assert.ok(data);art.add(data.art);
  assert.equal(data.projects.length,2);assert.equal(data.notes.length,2);assert.equal(new Set(data.projects.map(p=>p.title)).size,2);
  for(const project of data.projects)for(const field of ['description','problem','approach','reflection'])assert.ok(project[field].length>10,creator.handle+' '+field);
  for(const note of data.notes){assert.ok(note.title);assert.equal(note.body.length,2);assert.ok(note.body.every(p=>p.length>30));}
  assert.ok(data.practice.length>10);assert.ok(data.experience);assert.equal(data.name,creator.name);
 }
 assert.ok(art.size>=8);assert.equal(showcasePortfolioData('../private'),null);
});
