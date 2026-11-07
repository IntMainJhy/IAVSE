import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG_FILTER_DEFAULTS,readCatalogFilters,readCatalogPage,catalogQuery,readCatalogFavorites} from '../src/lib/design-catalog-state.mjs';

test('catalog public URL defaults match visible controls and preserve supported legacy links',()=>{
 assert.deepEqual(readCatalogFilters(new URLSearchParams()),CATALOG_FILTER_DEFAULTS);
 assert.deepEqual(readCatalogFilters(new URLSearchParams('collection=missing&scenario=missing&styleType=missing&tag=retro,missing,retro,%20game-ui&industry=missing&favorites=yes&sort=missing')),{...CATALOG_FILTER_DEFAULTS,tag:'retro,game-ui'});
 assert.equal(readCatalogFilters(new URLSearchParams('collection=studio&view=components')).collection,'components');
 assert.equal(readCatalogFilters(new URLSearchParams('category=AI')).industry,'AI');
 const selected={...CATALOG_FILTER_DEFAULTS,collection:'stylekit',q:'a & b',scenario:'marketing',type:'visual',tag:'colorful,gradient',industry:'AI',favorites:'1',sort:'name'};
 const query=catalogQuery(selected,3);assert.equal(query.get('type'),'designs');assert.equal(query.get('styleType'),'visual');assert.equal(query.get('page'),'3');assert.deepEqual(readCatalogFilters(query),selected);
 assert.equal(catalogQuery(CATALOG_FILTER_DEFAULTS).toString(),'type=designs');
});

test('page values and favorite storage cannot introduce invalid navigation or duplicate saves',()=>{
 for(const value of [undefined,null,'',0,-2,'Infinity','NaN','invalid'])assert.equal(readCatalogPage(value),1);
 assert.equal(readCatalogPage('3.8'),3);
 assert.deepEqual(readCatalogFavorites('["website-apple","stale","website-apple",null,42,"website-dark"]',['website-apple','website-dark']),['website-apple','website-dark']);
 for(const value of ['broken json','{}','null',null,42])assert.deepEqual(readCatalogFavorites(value,['website-apple']),[]);
 const memory=['website-apple'];assert.deepEqual(readCatalogFavorites(memory,['website-apple']),memory);assert.notEqual(readCatalogFavorites(memory,['website-apple']),memory);
});
