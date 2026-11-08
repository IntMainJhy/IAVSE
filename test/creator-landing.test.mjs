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
import * as showroomData from '../src/lib/product-showcase.mjs';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/PlatformHome.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
async function render(space,locale='zh',media=true){
 const exports={};
 const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
 const modules={
  './ProductCinema':{ProductCinema:()=>null},
  'react':React,'react/jsx-runtime':runtime,'next/link':{default:Link},
  '@/lib/product-showcase.mjs':showroomData,'./LocaleProvider':{useLocale:()=>({locale,t:value=>value})},
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
 for(const name of ['ShowcasePreview','ShowcaseDiscovery','HomeProductShowcase']){const component={};const code=ts.transpileModule(fs.readFileSync(new URL('../src/components/'+name+'.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports:component,Set,require:key=>{if(key.endsWith('.css'))return{};if(!Object.hasOwn(modules,key))throw Error(key);return modules[key]}});modules['./'+name]=component;}
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
test('product proof uses one readable homepage surface and real catalog links without idle films',async()=>{
 const html=await render(space,'en');
 assert.deepEqual([...html.matchAll(/data-home-story="([^"]+)"/g)].map(match=>match[1]),['blog','editor','skills','resources']);
 assert.match(html,/src="\/media\/home\/creator-home.webp"/);assert.doesNotMatch(html,/<video|<iframe|data-cinema-variant/);
 assert.ok(html.includes('data-editor-demo="true" data-locale="en" data-page-scroll="true"'));
 for(const href of ['/workspace/blog','/blogs','/community','/resources?type=designs','/resources?type=skills','/docs/showcase'])assert.ok(html.includes('href="'+href+'"'),href+' remains a real destination');
 const copy=productCopy.homeProductCopy('en');for(const title of [copy.blogTitle,copy.editorTitle,copy.skillTitle,copy.resourceTitle])assert.ok(html.includes(title));
});

test('homepage proof keeps Jianghao Yu’s captured identity separate from the editable featured creator',async()=>{
 for(const locale of ['zh','en','ja']){
  const html=await render(space,locale),copy=productCopy.homeProductCopy(locale),blog=html.match(/<section[^>]*data-home-story="blog"[\s\S]*?<\/section>/)?.[0];
  assert.ok(blog);assert.ok(blog.includes('href="/blog/jianghaoyu2006"'));assert.ok(blog.includes('/media/home/creator-home.webp'));
  assert.ok(blog.includes(copy.blogAlt));assert.ok(blog.includes(copy.blogExample));assert.ok(blog.includes('data-preview-device="desktop"'));
  assert.doesNotMatch(blog,/Maya|maya-lab|\/media\/blog-product\/portfolio|Published author|published-author|published-cover/);
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

test('the complete product showroom follows the protected opening and adds no background renderer',async()=>{
 const descendants=node=>(node.children||[]).flatMap(child=>[...(child.type==='tag'?[child]:[]),...descendants(child)]);
 const hasClass=(node,name)=>node.attribs?.class?.split(/\s+/).includes(name);
 for(const creator of [space,null]){
  const html=await render(creator,'en'),nodes=descendants(parseDocument(html)),showroom=nodes.find(node=>node.attribs['data-product-showroom']==='home'),hero=nodes.find(node=>hasClass(node,'v2-hero-scene'));assert.ok(showroom);assert.equal(hero.parent,showroom.parent);assert.ok(hero.parent.children.indexOf(hero)<hero.parent.children.indexOf(showroom));
  const inside=descendants(showroom);assert.deepEqual(inside.filter(node=>node.attribs['data-home-story']).map(node=>node.attribs['data-home-story']),['blog','editor','skills','resources']);
  assert.ok(!inside.some(node=>node.name==='canvas'||node.name==='video'||node.name==='iframe'||hasClass(node,'v2-hero-scene')||node.attribs['data-home-cinema']||node.attribs['data-stage']));
  assert.equal(inside.filter(node=>node.attribs['data-home-scene']==='invitation').length,1);assert.equal(inside.filter(node=>node.attribs['data-creator-voices']==='true').length,1);
  assert.ok(descendants(hero).some(node=>node.attribs[creator?'data-stage':'class']===(creator?'true':'v2-hero-empty')));
  assert.equal((html.match(/data-home-motion="true"/g)||[]).length,1);assert.ok(html.includes('data-glass-reveal="stage"'));
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
test('the illustrative creator comments precede a clear final creation action',async()=>{
 const html=await render(space);assert.ok(html.includes('data-home-scene="invitation"'));assert.ok(html.indexOf('data-creator-voices="true"')<html.indexOf('data-home-scene="invitation"'));assert.ok(html.slice(html.indexOf('data-home-scene="invitation"')).includes('href="/workspace/blog"'));
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
