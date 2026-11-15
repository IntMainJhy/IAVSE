import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';
import {HOME_STYLES,normalizeHomeStyle,homeStyleColorMode} from '../src/lib/home-style.mjs';

const css=postcss.parse(fs.readFileSync(new URL('../src/app/site-styles.css',import.meta.url),'utf8'));
function roles(style,mode='light'){const result={};css.walkRules(rule=>{if(rule.selector.includes(`[data-home-style=${style}]`)&&rule.parent.type==='root'&&!rule.selector.includes(`[data-color-mode=${mode==='light'?'dark':'light'}]`))Object.assign(result,Object.fromEntries(rule.nodes.filter(n=>n.type==='decl'&&n.prop.startsWith('--')).map(n=>[n.prop,n.value])));});return result;}
const luminance=value=>{const hex=value.length===4?'#'+[...value.slice(1)].map(x=>x+x).join(''):value;return [0,2,4].map(i=>parseInt(hex.slice(1).slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};

test('public style preferences accept the four selected worlds and reject arbitrary cookie values',()=>{
 for(const style of HOME_STYLES)assert.equal(normalizeHomeStyle(style),style);
 for(const value of [undefined,null,'','dark','find','constructor','<style>'])assert.equal(normalizeHomeStyle(value),'anime');
});

test('all four site palettes keep normal, secondary and subtle text readable on reading surfaces',()=>{
 for(const style of HOME_STYLES){
  const r=roles(style);assert.ok(r,style);
  for(const surface of ['--iavse-background','--iavse-canvas','--iavse-muted'])for(const text of ['--iavse-foreground','--iavse-secondary','--iavse-subtle'])assert.ok(contrast(r[surface],r[text])>=4.5,`${style} ${text} on ${surface}`);
  assert.ok(contrast(r['--iavse-focus'],r['--iavse-background'])>=3,style+' focus');
 }
});

test('style direction changes more than color while using the shared semantic roles',()=>{
 const worlds=HOME_STYLES.map(style=>roles(style));
 assert.equal(new Set(worlds.map(r=>r['--site-card-radius'])).size,3);
 assert.equal(new Set(worlds.map(r=>r['--site-heading-font'])).size,2);
 assert.equal(new Set(worlds.map(r=>r['--site-label-font'])).size,2);
});


test('the original UI retains its light and dark palette independently of the three fixed scenes',()=>{
 assert.equal(homeStyleColorMode('classic'),'light');assert.equal(homeStyleColorMode('classic','dark'),'dark');assert.equal(homeStyleColorMode('brand','dark'),'light');assert.equal(homeStyleColorMode('anime','light'),'dark');
 const dark=roles('classic','dark');for(const bg of ['--iavse-background','--iavse-canvas','--iavse-muted'])for(const text of ['--iavse-foreground','--iavse-secondary','--iavse-subtle'])assert.ok(contrast(dark[bg],dark[text])>=4.5);
});

test('reading routes allocate no animation or decorative brand watermark',()=>{
 const source=fs.readFileSync(new URL('../src/components/landing/SiteStyleAtmosphere.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(source,/LandingScene|<canvas|requestAnimationFrame|site-style-wordmark/);assert.match(source,/style==='brand'\)return null/);
});
