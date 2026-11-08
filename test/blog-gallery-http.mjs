import assert from 'node:assert/strict';
import {parseDocument} from 'htmlparser2';
import {blogShowcases,showcaseProfile} from '../src/lib/blog-showcase.mjs';

const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3008';
const walk=node=>[node,...(node.children||[]).flatMap(walk)];
const hasClass=(node,name)=>(node.attribs?.class||'').split(/\s+/).includes(name);
const read=async path=>{
 const response=await fetch(new URL(path,base),{redirect:'manual'});
 assert.equal(response.status,200,path);
 assert.match(response.headers.get('content-type'),/text\/html/);
 const html=await response.text();return {response,html,nodes:walk(parseDocument(html))};
};

const manifest=await fetch(new URL('/api/blog-gallery',base)).then(response=>{assert.equal(response.status,200);return response.json();});
const expectedPreviews=new Set(blogShowcases.map(entry=>showcaseProfile(entry.handle).href+'&embed=gallery'));
assert.ok(manifest.previews.length<=12,'the warm manifest keeps its gallery cap');
for(const path of manifest.previews.filter(path=>path?.startsWith('/blogs/showcase/')))assert.ok(expectedPreviews.has(path),'warm manifest agrees with the gallery links: '+path);
for(const entry of blogShowcases){
 const href=showcaseProfile(entry.handle).href,path=href+'&embed=gallery';
 const {response,html,nodes}=await read(path);
 assert.ok(html.length<=350000,'fits the gallery document budget: '+entry.handle);
 assert.equal(response.headers.get('x-frame-options'),'SAMEORIGIN');
 assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'self'/);
 const embed=nodes.find(node=>hasClass(node,'blog-gallery-embed'));
 assert.ok(embed,'readiness marker exists in real server HTML: '+entry.handle);
 const content=walk(embed);
 assert.ok(content.some(node=>hasClass(node,'bd-page-shell')),'real designed page is present, not only a loading shell');
 assert.ok(content.some(node=>node.attribs?.['data-page-template']===entry.template),'editor layout matches '+entry.template);
 assert.ok(content.some(node=>node.attribs?.['data-appearance']===entry.appearance),'editor appearance matches '+entry.appearance);
 const full=await read(href);
 assert.ok(full.nodes.some(node=>node.attribs?.['data-page-template']===entry.template),'full link uses the same layout');
 assert.ok(full.nodes.some(node=>node.attribs?.['data-appearance']===entry.appearance),'full link uses the same appearance');
}
const legacy=await read('/blogs/showcase/maya-lab?embed=gallery');
assert.ok(legacy.nodes.some(node=>hasClass(node,'blog-gallery-embed')),'legacy embed links also signal readiness');
const study=await read('/blogs/showcase/maya-lab');
assert.ok(study.nodes.some(node=>hasClass(node,'showcase-portfolio')),'original study remains available');
console.log('Gallery HTTP: all 11 built-in examples render matching templates and appearances, publish readiness markers, and fit the cache budget.');
