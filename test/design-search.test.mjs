import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterDesignEntries} from '../src/lib/design-search.mjs';
import {designCategory} from '../src/lib/design-catalog.mjs';

const entries=JSON.parse(readFileSync(new URL('../src/lib/template-library.json',import.meta.url),'utf8')).filter(entry=>entry.template.kind==='design-system');
const slugs=filters=>filterDesignEntries(entries,filters).map(entry=>entry.slug);

test('design search finds source brands even when their titles are Chinese',()=>{
 assert.deepEqual(slugs({q:'Notion'}),['voltagent-notion']);
 assert.deepEqual(slugs({q:'LINEAR'}),['voltagent-linear-app']);
 assert.deepEqual(slugs({q:'  iAvSe  '}),[]);
 assert.deepEqual(slugs({q:'Ｎｏｔｉｏｎ'}),['voltagent-notion']);
});

test('source name, source URL, slug and category are searchable fields',()=>{
 const entry={...entries[0],title:'示例设计',summary:'一份界面参考',tags:[],source:{name:'Source Brand',url:'https://source.example/design'},slug:'unique-design-slug',category:'独立类别'};
 for(const q of ['SOURCE BRAND','SOURCE.EXAMPLE','UNIQUE-DESIGN-SLUG','独立类别']){
  assert.deepEqual(filterDesignEntries([entry],{q}),[entry]);
 }
});

test('category and keyword filters must both match',()=>{
 assert.deepEqual(slugs({category:'协作与效率',q:'notion'}),['voltagent-notion']);
 assert.deepEqual(slugs({category:'协作与效率',q:'linear'}),['voltagent-linear-app']);
 assert.deepEqual(slugs({category:'原创设计',q:'notion'}),[]);
 assert.deepEqual(slugs({category:'工作空间',q:'IAVSE'}),[]);
});

test('reviewed reference industry labels never collapse into the generic category',()=>{
 for(const entry of entries)assert.equal(designCategory(entry),entry.category,entry.slug);
 assert.deepEqual(slugs({category:'金融与支付',q:'stripe'}),['voltagent-stripe']);
 assert.deepEqual(slugs({category:'云服务与数据',q:'stripe'}),[]);
});

test('empty search preserves ordering, category-only results and real empty results',()=>{
 assert.deepEqual(filterDesignEntries(entries,{q:'  '}),entries);
 assert.deepEqual(filterDesignEntries(entries,{category:'工作空间'}),entries.filter(entry=>entry.category==='工作空间'));
 assert.deepEqual(slugs({q:'not-a-real-design-source'}),[]);
 assert.deepEqual(slugs({category:'不存在的分类'}),[]);
});
