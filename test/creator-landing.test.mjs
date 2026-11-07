import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as runtime from 'react/jsx-runtime';
import {parseDocument} from 'htmlparser2';
import * as locales from '../src/lib/content-locales.mjs';
import * as productCopy from '../src/lib/home-product-copy.mjs';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/PlatformHome.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
async function render(space,locale='zh',media=true){
 const exports={};
 const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
 const modules={
  'react/jsx-runtime':runtime,'next/link':{default:Link},
  '@/lib/server-i18n':{serverI18n:async()=>({t:(value,args=[])=>value.replace(/\{(\d+)\}/g,(_,i)=>String(args[i]??'{'+i+'}')),locale})},
  '@/lib/spaces.mjs':{defaultBlogSpace:()=>space},
  '@/lib/content-locales.mjs':locales,
  '@/lib/home-product-copy.mjs':productCopy,
  './FeedAvatar':{FeedAvatar:()=>null},'./Icons':{Icon:()=>null},'./V2Atmosphere':{V2Atmosphere:()=>null},
  './HomeMotion':{HomeMotion:()=>React.createElement('span',{'data-home-motion':true})},'./HomeCinema':{HomeCinema:()=>React.createElement('span',{'data-home-cinema':true})},
  './CreatorVoices':{CreatorVoices:()=>React.createElement('section',{'data-creator-voices':true},'Illustrative creator comments')},
  './HomeResourceSculpture':{HomeResourceSculpture:({posterSrc,label})=>media?React.createElement('img',{src:posterSrc,alt:label,'data-resource-fallback':true}):null},
  './HomeStoryVideo':{HomeStoryVideo:({src,poster,label})=>media?React.createElement('img',{src:poster,alt:label,'data-video-src':src}):null},
  './HomeBlogCanvasDemo':{HomeBlogCanvasDemo:({locale,creator,pageScroll})=>React.createElement('div',{'data-editor-demo':true,'data-locale':locale,'data-page-scroll':pageScroll},React.createElement('pre',{'data-demo-creator':true},JSON.stringify(creator??null)))},
  '@/app/home-showcase.css':{},'@/app/home-product-showcase.css':{},'@/app/gallery-backgrounds.css':{},
  './CreatorStage':{CreatorStage:({creator})=>React.createElement('pre',{'data-stage':true},JSON.stringify(creator))}
 };
 vm.runInNewContext(source,{exports,Set,encodeURIComponent,require:name=>{if(!Object.hasOwn(modules,name))throw new Error(name);return modules[name]}});
 return renderToStaticMarkup(await exports.PlatformHome({req:new Request('http://site.example/')}));
}
function demoSnapshot(html){const raw=html.match(/<pre data-demo-creator="true">([\s\S]*?)<\/pre>/)?.[1];assert.notEqual(raw,undefined,'demo props are captured');return JSON.parse(raw.replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'));}
const space={handle:'published-author',profile:{name:'Published author',intro:'Public introduction',email:'private-marker',skills:['ArkTS'],resume:{sections:[{id:'projects',title:'代表项目',items:[{title:'Real work',description:'A published project',coverId:'published-cover',translations:{en:{title:'Translated work'}}}]}]}},layout:{blog:{design:{nodes:[{part:'section:projects'}]}}},content:[]};
test('creator landing projects use the reviewed résumé cover and localized public presentation',async()=>{
 const html=await render(space,'en');
 assert.ok(html.includes('published-cover'));
 assert.ok(html.includes('Translated work'));
 assert.ok(html.includes('/blog/published-author#anx-projects'));
 assert.ok(!html.includes('private-marker'));
 const example=demoSnapshot(html);assert.equal(example.name,'Published author');assert.equal(example.projects[0].title,'Translated work');assert.equal(example.projects[0].imageId,'published-cover');
 assert.ok(html.includes('data-glass-reveal="stage"'));
 assert.ok(html.includes('data-stage="true"'));
});
test('hidden résumé projects stay out of the landing and published documents provide the fallback',async()=>{
 const hidden={...space,layout:{blog:{design:{nodes:[{part:'section:projects',hidden:true}]}}},content:[{type:'projects',slug:'public-project',title:'Published document',summary:'Public summary',coverId:'document-cover'},{type:'articles',slug:'article',title:'Not a portfolio project',summary:'Article'}]};
 const html=await render(hidden);
 assert.ok(!html.includes('Real work'));
 assert.ok(!html.includes('published-cover'));
 assert.ok(html.includes('Published document'));
 assert.ok(html.includes('document-cover'));
 assert.ok(!html.includes('Not a portfolio project'));
 const example=demoSnapshot(html);assert.equal(example.projects.length,1);assert.equal(example.projects[0].title,'Published document');assert.ok(!JSON.stringify(example).includes('Real work'));assert.ok(!JSON.stringify(example).includes('published-cover'));
});
test('large feature rows alternate real media while keeping public navigation independent of renderers',async()=>{
 const html=await render(space,'en');
 assert.deepEqual(Array.from(html.matchAll(/data-home-story="([^"]+)" data-home-side="([^"]+)"/g),match=>[match[1],match[2]]),[['blog','left'],['editor','right'],['skills','left'],['resources','right']]);
 for(const src of ['/media/home/creator-home.webp','/media/home/creator-home-mobile.webp','/media/home/skills-poster.webp','/media/home/resources.webp'])assert.ok(html.includes('src="'+src+'"'),src+' supplies real imagery');
 assert.ok(html.includes('data-video-src="/media/home/skills-loop.mp4"'));
 const noMedia=await render(space,'en',false);
 assert.ok(html.includes('data-editor-demo="true" data-locale="en" data-page-scroll="true"'));
 for(const href of ['/workspace/blog','/blogs','/community','/resources','/resources?type=skills','/skills/gsap'])assert.ok(noMedia.includes('href="'+href+'"'),href+' remains a normal public link without video or GPU content');
 const copy=productCopy.homeProductCopy('en');for(const title of [copy.blogTitle,copy.editorTitle,copy.skillTitle,copy.resourceTitle])assert.ok(noMedia.includes(title),'feature copy stays readable without client renderers');
});

test('the portfolio shows Jianghao Yu’s real public homepage in every language without borrowing the featured creator’s identity',async()=>{
 for(const locale of ['zh','en','ja']){
  const html=await render(space,locale),copy=productCopy.homeProductCopy(locale),blog=html.match(/<section[^>]*data-home-story="blog"[\s\S]*?<\/section>/)?.[0];
  assert.ok(blog,'the portfolio story is present');
  assert.ok(blog.includes('href="/blog/jianghaoyu2006"'));
  for(const src of ['/media/home/creator-home.webp','/media/home/creator-home-mobile.webp'])assert.ok(blog.includes('src="'+src+'"'));
  assert.match(copy.blogExample,/Jianghao\s?Yu/);assert.match(copy.blogAlt,/Jianghao\s?Yu/);
  assert.ok(blog.includes('aria-label="'+copy.blogExample+'"'));
  assert.ok(blog.includes('alt="'+copy.blogAlt+'"'));
  assert.ok(blog.includes('<p class="home-story-caption">'+copy.blogExample+'</p>'));
  assert.doesNotMatch(blog,/Maya|maya-lab|\/media\/blog-product\/portfolio|Published author|published-author|published-cover|home-story-person/,'the real captured homepage keeps its own identity');
 }
});

test('product copy supplies complete localized labels and features with a Chinese fallback',()=>{
 const base=productCopy.homeProductCopy('zh');assert.equal(Object.keys(base).length,20);
 for(const locale of ['zh','en','ja']){
  const copy=productCopy.homeProductCopy(locale);assert.deepEqual(Object.keys(copy).sort(),Object.keys(base).sort());
  for(const [key,value] of Object.entries(copy))if(key==='editorFeatures'){assert.equal(value.length,3);assert.ok(value.every(item=>typeof item==='string'&&item.trim()));}else assert.ok(typeof value==='string'&&value.trim(),locale+' '+key);
 }
 assert.equal(productCopy.homeProductCopy('unknown'),base);
});

test('the product stories begin after the preserved opening and reserve the large treatment for blog and editor',async()=>{
 const html=await render(space,'en'),opening=html.slice(html.indexOf('<section class="v2-hero-scene"'),html.indexOf('<div class="home-stories home-product"'));
 assert.match(opening,/class="v2-hero-intro"/);assert.match(opening,/id="product-title"/);assert.match(opening,/data-home-cinema="true"/);assert.match(opening,/data-glass-reveal="stage"/);assert.match(opening,/data-stage="true"/);
 assert.doesNotMatch(opening,/data-home-product|home-story|data-editor-demo/);
 assert.equal((html.match(/data-home-motion="true"/g)||[]).length,1);assert.match(html,/class="v2-home-atmosphere" aria-hidden="true"/);
 const sections=Array.from(html.matchAll(/<section class="([^"]+)"[^>]*data-home-story="([^"]+)"/g),match=>({classes:match[1],story:match[2]}));
 assert.deepEqual(sections.map(({story})=>story),['blog','editor','skills','resources']);
 assert.deepEqual(sections.filter(({classes})=>classes.includes('home-story-primary')).map(({story})=>story),['blog','editor']);
 assert.deepEqual(sections.filter(({classes})=>classes.includes('home-story-discovery')).map(({story})=>story),['skills','resources']);
 assert.match(html,/class="home-stories home-product" data-home-product="true"/);
});

test('the gallery contains the complete lower homepage without adding a background renderer to the independent hero',async()=>{
 const descendants=node=>(node.children||[]).flatMap(child=>[...(child.type==='tag'?[child]:[]),...descendants(child)]);
 const hasClass=(node,name)=>node.attribs?.class?.split(/\s+/).includes(name);
 for(const creator of [space,null]){
  const nodes=descendants(parseDocument(await render(creator,'en'))),galleries=nodes.filter(node=>node.attribs['data-home-background']==='gallery');assert.equal(galleries.length,1);
  const gallery=galleries[0],inside=descendants(gallery),hero=nodes.find(node=>hasClass(node,'v2-hero-scene'));
  assert.ok(hasClass(gallery,'home-gallery-background'));assert.equal(hero.parent,gallery.parent,'the background starts after the independent hero scene');assert.ok(hero.parent.children.indexOf(hero)<hero.parent.children.indexOf(gallery));
  assert.ok(!inside.some(node=>node.name==='canvas'||hasClass(node,'spatial-backdrop')||node.attribs['data-spatial-mode']),'the lower homepage uses its CSS surfaces without an additional background renderer');
  assert.ok(!nodes.some(node=>hasClass(node,'spatial-backdrop')||node.attribs['data-spatial-mode']),'the removed spatial background is not mounted anywhere on the homepage');
  assert.deepEqual(inside.filter(node=>node.attribs['data-home-story']).map(node=>[node.attribs['data-home-story'],node.attribs['data-home-side']]),[['blog','left'],['editor','right'],['skills','left'],['resources','right']]);
  assert.equal(inside.filter(node=>node.attribs['data-home-scene']==='invitation').length,1);assert.equal(inside.filter(node=>node.attribs['data-creator-voices']==='true').length,1);
  assert.ok(!inside.some(node=>hasClass(node,'v2-hero-scene')||hasClass(node,'v2-hero-intro')||hasClass(node,'v2-hero-showcase')||node.attribs['data-home-cinema']||node.attribs['data-stage']),'the optical opening and creator stage never receive the gallery background');
  assert.ok(descendants(hero).some(node=>node.attribs[creator?'data-stage':'class']===(creator?'true':'v2-hero-empty')),'both published and empty hero states remain available');
 }
});
test('the editor receives the real public snapshot without repeating a separate project row',async()=>{
 const intro='A long public creator introduction that belongs on the full profile rather than being repeated through every feature.';
 const mixed={...space,profile:{...space.profile,intro,resume:{sections:[{id:'projects',title:'代表项目',items:[{title:'Text-only project',description:'Visible on the original portfolio'},space.profile.resume.sections[0].items[0],{title:'Another illustrated work',description:'Second cover',coverId:'secondary-cover'}]}]}}};
 const html=await render(mixed),stage=html.match(/<pre data-stage="true">([\s\S]*?)<\/pre>/)?.[1],stories=html.replace(/<pre data-stage="true">[\s\S]*?<\/pre>/,'').replace(/<pre data-demo-creator="true">[\s\S]*?<\/pre>/,'');
 assert.ok(stage?.includes(intro));assert.ok(stage?.includes('Text-only project'));assert.ok(stage?.includes('Another illustrated work'));
 const example=demoSnapshot(html);assert.equal(example.intro,intro);assert.equal(example.projects.length,2);assert.equal(example.projects[0].title,'Text-only project');assert.equal(example.projects[1].title,'Real work');
 assert.ok(!stories.includes(intro),'the authored introduction appears only inside the two window renderers');
 assert.equal(Array.from(stories.matchAll(/data-home-story="editor"/g)).length,1);
 assert.ok(!stories.includes('data-home-story="work"'));
 assert.ok(!stories.includes('published-cover'));
 assert.ok(!stories.includes('/media/secondary-cover'));
 assert.ok(!stories.includes('Text-only project'));
 assert.ok(!stories.includes('Another illustrated work'));
});
test('homepage retains the creation invitation and adds a separate creator-voices section',async()=>{
 const html=await render(space);
 assert.ok(html.includes('data-home-scene="invitation"'));
 assert.ok(!html.includes('data-card-gallery'));
 assert.ok(!html.includes('home-card'));
 const afterInvitation=html.slice(html.indexOf('data-home-scene="invitation"'));
 assert.equal(Array.from(afterInvitation.matchAll(/<section/g)).length,1,'the creator-voices section follows the invitation');
 assert.ok(afterInvitation.includes('data-creator-voices="true"'));
});
test('the editor story and real navigation remain available without a published creator',async()=>{
 const html=await render(null,'en');
 assert.ok(html.includes('href="/workspace/blog"'));
 assert.ok(!html.includes('data-stage="true"'));
 assert.ok(html.includes('data-home-story="editor"'));
 assert.ok(html.includes('data-editor-demo="true" data-locale="en"'));
 assert.ok(html.includes('href="/blogs"'));
 assert.ok(!html.includes('undefined'));
 assert.equal(demoSnapshot(html),null,'the client renderer uses its local fallback when no public creator is available');
});


test('the editor receives a localized, bounded public whitelist with authored blog title and description',async()=>{
 const data={...structuredClone(space),id:'internal-space-id-marker',owner:'internal-owner-marker',privateDraft:'private-draft-marker'};
 data.profile={...data.profile,alias:'Base alias',avatarId:'reviewed-avatar',internalId:'internal-profile-id-marker',privateDraft:'private-profile-draft-marker',skills:['Base skill'],translations:{en:{name:'Localized author',alias:'Localized alias',intro:'Localized introduction',skills:Array.from({length:9},(_,i)=>'Localized skill '+i)}}};
 data.profile.resume.sections[0].items=[...data.profile.resume.sections[0].items,{title:'Second work',description:'Second summary',coverId:'second-cover',internalId:'internal-project-id-marker',translations:{en:{title:'Translated second work',description:'Translated second summary'}}},{title:'Third work omitted from demo',description:'Third summary',coverId:'third-cover'}];
 data.layout.blog={...data.layout.blog,title:'Authored page title',description:'Authored page description',privateDraft:'private-layout-draft-marker'};
 const html=await render(data,'en'),example=demoSnapshot(html);
 assert.deepEqual(Object.keys(example).sort(),['name','handle','intro','avatarId','skills','url','projects','description'].sort());
 assert.equal(example.name,'Authored page title');assert.equal(example.description,'Authored page description');assert.equal(example.intro,'Localized introduction');assert.equal(example.avatarId,'reviewed-avatar');assert.equal(example.handle,'published-author');assert.equal(example.url,'/blog/published-author');
 assert.deepEqual(example.skills,Array.from({length:6},(_,i)=>'Localized skill '+i));assert.equal(example.projects.length,2);assert.equal(example.projects[0].title,'Translated work');assert.equal(example.projects[1].title,'Translated second work');assert.equal(example.projects[1].description,'Translated second summary');assert.equal(example.projects[1].imageId,'second-cover');
 for(const project of example.projects)assert.deepEqual(Object.keys(project).sort(),['title','description','imageId','href'].sort());
 for(const marker of ['private-marker','internal-space-id-marker','internal-owner-marker','private-draft-marker','internal-profile-id-marker','private-profile-draft-marker','private-layout-draft-marker','internal-project-id-marker'])assert.ok(!JSON.stringify(example).includes(marker),marker+' stays outside serialized client props');
 assert.ok(!JSON.stringify(example).includes('Third work omitted from demo'));
});

test('missing authored page titles use localized profile identity and alias or public handle fallback',async()=>{
 const data=structuredClone(space);data.profile.alias='Base alias';data.profile.translations={en:{name:'Localized identity',alias:'Localized alias',intro:'Localized intro'}};
 const alias=demoSnapshot(await render(data,'en'));assert.equal(alias.name,'Localized identity');assert.equal(alias.description,'Localized alias');assert.equal(alias.intro,'Localized intro');
 data.profile.alias='';data.profile.translations.en.alias='';const handle=demoSnapshot(await render(data,'en'));assert.equal(handle.description,'@published-author');assert.equal(handle.name,'Localized identity');
});


test('home introduction and closing invitation do not offer unavailable app downloads',async()=>{
 for(const locale of ['zh','en','ja']){
  const html=await render(space,locale);
  assert.doesNotMatch(html,/iavse-mac-download|v2-hero-actions|href="\/downloads(?:#[^"]*)?"/);
  assert.ok(html.includes('href="/workspace/blog"'));
 }
});
