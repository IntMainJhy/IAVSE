import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';
import {HOME_STYLES,normalizeHomeStyle} from '../src/lib/home-style.mjs';

const css=postcss.parse(fs.readFileSync(new URL('../src/app/site-styles.css',import.meta.url),'utf8'));
function roles(style){let result;css.walkRules(rule=>{if(rule.selector.includes(`[data-home-style=${style}]`)&&rule.parent.type==='root')result=Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));});return result;}
const luminance=value=>{const hex=value.length===4?'#'+[...value.slice(1)].map(x=>x+x).join(''):value;return [0,2,4].map(i=>parseInt(hex.slice(1).slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};

test('public style preferences accept the three selected worlds and reject arbitrary cookie values',()=>{
 for(const style of HOME_STYLES)assert.equal(normalizeHomeStyle(style),style);
 for(const value of [undefined,null,'','dark','find','constructor','<style>'])assert.equal(normalizeHomeStyle(value),'anime');
});

test('all three site palettes keep normal, secondary and subtle text readable on reading surfaces',()=>{
 for(const style of HOME_STYLES){
  const r=roles(style);assert.ok(r,style);
  for(const surface of ['--iavse-background','--iavse-canvas','--iavse-muted'])for(const text of ['--iavse-foreground','--iavse-secondary','--iavse-subtle'])assert.ok(contrast(r[surface],r[text])>=4.5,`${style} ${text} on ${surface}`);
  assert.ok(contrast(r['--iavse-focus'],r['--iavse-background'])>=3,style+' focus');
 }
});

test('style direction changes more than color while using the shared semantic roles',()=>{
 const worlds=HOME_STYLES.map(roles);
 assert.equal(new Set(worlds.map(r=>r['--site-card-radius'])).size,3);
 assert.equal(new Set(worlds.map(r=>r['--site-heading-font'])).size,2);
 assert.equal(new Set(worlds.map(r=>r['--site-label-font'])).size,2);
});
