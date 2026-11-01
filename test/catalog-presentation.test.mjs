import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogCoverUrl} from '../src/lib/catalog-presentation.mjs';
import {catalogCover} from '../src/lib/catalog-cover.mjs';

test('generated cover links preserve multilingual labels without changing query fields or SVG markup',()=>{
 const title='C++ & 中文 <script>alert(1)</script>',category='设计 &kind=resources';
 const url=new URL(catalogCoverUrl('skills',title,category),'https://example.invalid');
 assert.equal(url.pathname,'/api/covers');
 assert.deepEqual(url.searchParams.getAll('kind'),['skills']);
 assert.equal(url.searchParams.get('title'),title);
 assert.equal(url.searchParams.get('category'),category);
 const svg=catalogCover(Object.fromEntries(url.searchParams));
 assert.ok(!svg.includes('<script>'));
 assert.ok(svg.includes('&lt;script&gt;'));
 assert.ok(svg.includes('设计 &amp;kind=resources'));
});

const titleLines=svg=>[...svg.match(/<g data-cover-title="true"[^>]*>(.*?)<\/g>/s)[1].matchAll(/<text[^>]*>(.*?)<\/text>/gs)].map(match=>match[1]);
test('cover titles preserve ordinary English words and wrap mixed CJK content without empty lines',()=>{
 const english=catalogCover({title:'Building our IAVSE community together with independent creators',kind:'resources'}),lines=titleLines(english);
 assert.ok(lines.length>1&&lines.length<=3);
 assert.equal(lines.join(' '),'Building our IAVSE community together with independent creators');
 assert.ok(lines.some(line=>line.includes('IAVSE')));assert.ok(lines.some(line=>line.includes('community')));assert.ok(!english.includes('FOLIVO'));
 const mixed=titleLines(catalogCover({title:'IAVSE 开发者的个人空间与内容发布平台，让每一次创作都能够被发现和分享。'}));
 assert.ok(mixed.length>1&&mixed.length<=3);assert.ok(mixed.every(line=>line.trim()));assert.ok(mixed.some(line=>line.includes('IAVSE')));assert.ok(mixed.every(line=>!line.startsWith('。')));
 const long=titleLines(catalogCover({title:'A'.repeat(110)}));assert.equal(long.length,3);assert.ok(long[2].endsWith('…'),'an unusually long unbroken token is bounded and visibly truncated');
});
