import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';

const read=name=>fs.readFileSync(new URL('../src/app/'+name,import.meta.url),'utf8');
const sheet=postcss.parse(read('blog-shell.css'));
function declarations(selector){let result={};sheet.walkRules(selector,rule=>{if(rule.parent.type==='root')result=Object.fromEntries(rule.nodes.filter(node=>node.type==='decl').map(node=>[node.prop,node.value]));});return result;}

test('authored-blog chrome has one full-width surface and a separately bounded content row',()=>{
 const bar=declarations('html[data-ui][data-color-mode] .blog-public-shell>.blog-platform-bar');
 assert.equal(bar.width,'100%');assert.equal(bar['max-width'],'none');assert.equal(bar.margin,'0');assert.equal(bar.overflow,'visible');
 assert.equal(bar.background,'var(--blog-chrome-paper)');assert.equal(bar.position,'sticky');assert.equal(bar['z-index'],'80');
 const inner=declarations('.blog-platform-bar-inner');assert.equal(inner['max-width'],'1440px');assert.equal(inner.margin,'auto');assert.equal(inner.overflow,'visible');
 const shell=declarations('html[data-ui][data-color-mode] .blog-public-shell:not(.blog-gallery-embed)');assert.equal(shell['--blog-chrome-paper'],'#fff');
 assert.equal(shell.background,bar.background,'the full viewport and chrome share one paper surface');
});

test('platform glass no longer owns blog backgrounds or paints a second header panel',()=>{
 const shared=postcss.parse(read('glass-platform.css'));let platformBackground=false;
 shared.walkRules(rule=>{
  if(rule.selector==='html[data-ui][data-color-mode] .v2-site:not(.blog-public-shell)')platformBackground=rule.nodes.some(node=>node.prop==='background');
  assert.ok(!rule.selector.startsWith('.blog-public-shell'));assert.ok(!rule.selector.startsWith('html[data-ui][data-color-mode] .blog-public-shell'));
 });assert.equal(platformBackground,true,'the platform gradient explicitly excludes author shells');
 const legacy=postcss.parse(read('blog.css'));legacy.walkRules(rule=>assert.ok(!/blog-platform|blog-public-shell/.test(rule.selector),'legacy template CSS cannot restyle platform chrome'));
 assert.doesNotMatch(read('blog-shell.css'),/backdrop-filter|clip-path|overflow:\s*(?:hidden|clip)/,'header and popovers need no optical overlay or clipping');
});

test('blog, editor preview and fallback routes load the shell owner after shared chrome',()=>{
 for(const group of ['blog','workspace','admin','fallback']){
  const css=read('route-styles/'+group+'.css');assert.ok(css.indexOf("@import '../blog-shell.css';")>css.indexOf("@import '../glass-platform.css';"),group);
 }
});


test('phone chrome keeps the complete wordmark and gives narrow-screen actions room to wrap',()=>{
 const logo=declarations('.blog-platform-logo');assert.equal(logo['flex-shrink'],'0');assert.equal(logo['min-width'],'max-content');
 const media=params=>{let result;sheet.walkAtRules('media',rule=>{if(rule.params===params)result=rule;});return result;};
 const mobile=media('(max-width:640px)'),narrow=media('(max-width:380px)');
 const props=(at,selector)=>{let result={};at.walkRules(selector,rule=>{result=Object.fromEntries(rule.nodes.filter(node=>node.type==='decl').map(node=>[node.prop,node.value]));});return result;};
 assert.equal(props(mobile,'.blog-platform-actions')['min-width'],'0');
 assert.equal(props(mobile,'.blog-platform-actions>a')['white-space'],'normal','long Community profile labels can use two lines');
 assert.equal(props(mobile,'.blog-platform-actions>.space-share-menu')['flex-shrink'],'0','the share action retains its readable label and pointer target');
 assert.equal(props(narrow,'.blog-platform-bar-inner')['flex-wrap'],'wrap');
 assert.equal(props(narrow,'.blog-platform-actions').flex,'0 0 100%','360px phones place both actions on the next row');
 assert.ok(!props(mobile,'.blog-platform-logo').display,'the wordmark remains visible');
});
