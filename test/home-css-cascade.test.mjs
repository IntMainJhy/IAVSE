import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';
const read=name=>fs.readFileSync(new URL('../src/app/'+name,import.meta.url),'utf8');
test('every feature bundle excludes retired platform skins',()=>{
 for(const name of ['home','blogs','blog','catalog','community','workspace','admin','account','fallback'])assert.doesNotMatch(read('route-styles/'+name+'.css'),/glass-platform|glass-studio|iavse-(?:platform|interiors|quantum|liquid|home|catalog|blogs|workspace)|site-unified|site-appearance|quiet-ui|v2\.css/);
});
test('one shared system supplies both appearance palettes and usable focus colors',()=>{
 const css=postcss.parse(read('rbp-system.css'));const colors=[];css.walkDecls('--rbp-background',d=>colors.push(d.value));assert.deepEqual(colors,['#fff','#0a0a0a']);assert.match(read('layout.tsx'),/rbp-system\.css/);assert.doesNotMatch(read('layout.tsx'),/portfolio-foundation\.css|site-chrome\.css/);
 css.walkRules(rule=>{if(rule.selector?.includes(':focus-visible'))assert.ok(rule.nodes.some(n=>n.prop==='outline'&&n.value.includes('--rbp-focus')));});
});
test('author content and canvas gesture regions are outside application styling and reveal selectors',()=>{
 const css=read('rbp-system.css');assert.match(css,/@scope \(\.rbp-application\) to \([^)]*\.react-flow__viewport/);assert.doesNotMatch(css,/touch-action\s*:\s*none|body\s*\{[^}]*overflow\s*:\s*hidden/);
 const source=fs.readFileSync(new URL('../src/components/rbp/ui/application-reveal.tsx',import.meta.url),'utf8');assert.match(source,/contenteditable=true/);assert.match(source,/\.react-flow__viewport/);
});
test('selected text keeps readable contrast in both RBP appearances',()=>{
 const css=postcss.parse(read('rbp-system.css'));const backgrounds=[];css.walkDecls('--rbp-selection',d=>{if(/^#/.test(d.value))backgrounds.push(d.value)});
 const lum=hex=>{let h=hex.slice(1);if(h.length===3)h=[...h].map(x=>x+x).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0)};
 assert.equal(backgrounds.length,2);for(const [i,fg] of ['#0a0a0a','#fafafa'].entries()){const a=lum(fg),b=lum(backgrounds[i]);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,'selection contrast '+i);}
});
