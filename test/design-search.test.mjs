import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterDesignEntries} from '../src/lib/design-search.mjs';

const entries=JSON.parse(readFileSync(new URL('../src/lib/design-library-seed.json',import.meta.url),'utf8'));
const slugs=filters=>filterDesignEntries(entries,filters).map(entry=>entry.slug);

test('design search finds source brands even when their titles are Chinese',()=>{
 assert.deepEqual(slugs({q:'Notion'}),['notion-paper-workspace']);
 assert.deepEqual(slugs({q:'LINEAR'}),['linear-precision']);
 assert.deepEqual(slugs({q:'  iAvSe  '}),[
  'iavse-optical-glass','iavse-spatial-gallery','iavse-resource-story','iavse-bento-control',
 ]);
 assert.deepEqual(slugs({q:'Ｎｏｔｉｏｎ'}),['notion-paper-workspace']);
});

test('source name, source URL, slug and category are searchable fields',()=>{
 const entry={...entries[0],title:'示例设计',summary:'一份界面参考',tags:[],source:{name:'Source Brand',url:'https://source.example/design'},slug:'unique-design-slug',category:'独立类别'};
 for(const q of ['SOURCE BRAND','SOURCE.EXAMPLE','UNIQUE-DESIGN-SLUG','独立类别']){
  assert.deepEqual(filterDesignEntries([entry],{q}),[entry]);
 }
});

test('category and keyword filters must both match',()=>{
 assert.deepEqual(slugs({category:'工作空间',q:'notion'}),['notion-paper-workspace']);
 assert.deepEqual(slugs({category:'工作空间',q:'linear'}),['linear-precision']);
 assert.deepEqual(slugs({category:'原创设计',q:'notion'}),[]);
 assert.deepEqual(slugs({category:'工作空间',q:'IAVSE'}),[]);
});

test('empty search preserves ordering, category-only results and real empty results',()=>{
 assert.deepEqual(filterDesignEntries(entries,{q:'  '}),entries);
 assert.deepEqual(filterDesignEntries(entries,{category:'工作空间'}),entries.filter(entry=>entry.category==='工作空间'));
 assert.deepEqual(slugs({q:'not-a-real-design-source'}),[]);
 assert.deepEqual(slugs({category:'不存在的分类'}),[]);
});
