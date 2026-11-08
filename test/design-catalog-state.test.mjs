import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG_FILTER_DEFAULTS,readCatalogFilters,catalogQuery,readCatalogFavorites} from '../src/lib/design-catalog-state.mjs';

test('template URLs expose only current controls and discard obsolete groups and pagination',()=>{
 assert.deepEqual(readCatalogFilters(new URLSearchParams()),CATALOG_FILTER_DEFAULTS);
 for(const collection of ['studio','licensed','vibeui','stylekit','components','interactions','missing']){
  const input=new URLSearchParams({collection,page:'8',view:'components',styleType:'visual',tag:'retro',industry:'AI'});
  assert.deepEqual(readCatalogFilters(input),CATALOG_FILTER_DEFAULTS);
  assert.equal(catalogQuery(readCatalogFilters(input)).toString(),'type=designs');
 }
 for(const collection of ['project','page','design-system']){
  const selected={...CATALOG_FILTER_DEFAULTS,collection,q:'a & b',scenario:'marketing',industry:'finance',visual:'minimal',favorites:'1',sort:'name'};
  const query=catalogQuery({...selected,page:'8',styleType:'layout'},8);
  assert.equal(query.get('type'),'designs');assert.equal(query.has('page'),false);assert.equal(query.has('styleType'),false);
  assert.deepEqual(readCatalogFilters(query),selected);
 }
 assert.deepEqual(readCatalogFilters(new URLSearchParams('scenario=missing&industry=missing&visual=missing&favorites=yes&sort=missing')),CATALOG_FILTER_DEFAULTS);
 assert.equal(catalogQuery({collection:'invalid',scenario:'invalid'}).toString(),'type=designs');
});

test('favorite storage safely retains only unique actual template slugs',()=>{
 assert.deepEqual(readCatalogFavorites('["project-alpha","stale","project-alpha",null,42,"template-beta"]',['project-alpha','template-beta']),['project-alpha','template-beta']);
 for(const value of ['broken json','{}','null',null,42])assert.deepEqual(readCatalogFavorites(value,['project-alpha']),[]);
 const memory=['project-alpha'];assert.deepEqual(readCatalogFavorites(memory,['project-alpha']),memory);assert.notEqual(readCatalogFavorites(memory,['project-alpha']),memory);
});
