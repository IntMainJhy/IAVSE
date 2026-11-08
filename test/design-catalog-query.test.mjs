import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import entries from '../src/lib/template-library.json' with {type:'json'};

const dir=mkdtempSync(path.join(tmpdir(),'iavse-bounded-catalog-'));
process.env.APP_DATA_DIR=dir;process.env.PUBLIC_URL='http://catalog.test';
const {buildDesignCatalogSnapshot,queryDesignCatalog,publishedDesignCatalogSnapshot}=await import('../src/lib/design-catalog-query.mjs');
const {intakeDb}=await import('../src/lib/design-intake.mjs');
const {filterCatalog}=await import('../src/lib/design-taxonomy.mjs');
const {handle}=await import('../src/lib/api.mjs');
after(()=>{globalThis.__personalSiteDb?.db.close();delete globalThis.__personalSiteDb;delete process.env.APP_DATA_DIR;delete process.env.PUBLIC_URL;rmSync(dir,{recursive:true,force:true});});

test('SSR and subsequent batches carry at most 24 summaries, with stable combined filters and order',()=>{
 const snapshot=buildDesignCatalogSnapshot(entries,'test-1');
 for(const filters of [{},{collection:'project'},{industry:'finance'},{scenario:'docs'},{visual:'minimal',sort:'name'},{collection:'design-system',q:'Claude'},{favorites:'1'}]){
  const favorites=['template-agency','voltagent-claude','private-not-a-project'];
  const expected=filterCatalog(entries,filters,favorites),seen=[];let cursor=null;
  do{const page=queryDesignCatalog({filters,favorites,cursor},snapshot);assert.ok(page.items.length<=24);assert.equal(page.total,expected.length);assert.ok(page.items.every(item=>!('specification'in item)&&!('prompt'in item)));seen.push(...page.items.map(item=>item.slug));cursor=page.nextCursor;}while(cursor);
  assert.deepEqual(seen,expected.map(item=>item.slug));assert.equal(new Set(seen).size,seen.length);
 }
 const fixtures=Array.from({length:10000},(_,i)=>({...entries[i%entries.length],slug:'fixture-'+i}));
 const page=queryDesignCatalog({},buildDesignCatalogSnapshot(fixtures,'large'));
 assert.equal(page.total,10000);assert.equal(page.items.length,24);assert.equal(JSON.stringify(page).includes('fixture-9999'),false);
 assert.ok(Buffer.byteLength(JSON.stringify(page))<60000,'first-batch payload stays bounded as the directory grows');
});

test('cursors reject changed filters and revisions, invalid input cannot request an unbounded response',()=>{
 const snapshot=buildDesignCatalogSnapshot(entries,'test-1'),first=queryDesignCatalog({},snapshot);
 assert.throws(()=>queryDesignCatalog({cursor:first.nextCursor,filters:{q:'Claude'}},snapshot),error=>error.status===400);
 assert.throws(()=>queryDesignCatalog({cursor:first.nextCursor},buildDesignCatalogSnapshot(entries,'test-2')),error=>error.status===409);
 for(const input of [null,[],{filters:'bad'},{filters:{q:'a'.repeat(121)}},{favorites:Array(1001).fill('template-agency')},{cursor:'broken'},{cursor:'a'.repeat(513)}])assert.throws(()=>queryDesignCatalog(input,snapshot),error=>error.status===400);
 const page=queryDesignCatalog({limit:10000,filters:{collection:'project'},favorites:['template-agency','template-agency','unknown',null]},snapshot);
 assert.equal(page.favoriteCount,1);assert.ok(page.items.length<=24);
 assert.deepEqual(page.validFavorites,['template-agency']);
});

test('committed snapshot cache reuses only the current revision and invalidates across connections and rollbacks',()=>{
 const db=intakeDb(),before=publishedDesignCatalogSnapshot();assert.equal(publishedDesignCatalogSnapshot(),before);
 const item={...entries[0],id:'published-fixture',slug:'published-fixture',title:'Published fixture'};
 db.prepare('INSERT INTO design_intake_entries(id,kind,source_key,status,visibility,draft,published,created,updated) VALUES(?,?,?,?,?,?,?,?,?)').run(item.id,'design','https://catalog.test/fixture','approved','public',JSON.stringify({...item,title:'PRIVATE DRAFT'}),JSON.stringify(item),'now','now');
 const published=publishedDesignCatalogSnapshot(),oldCursor=queryDesignCatalog({},published).nextCursor;assert.notEqual(published,before);assert.equal(queryDesignCatalog({filters:{q:'Published fixture'}},published).items[0].title,item.title);
 db.exec('BEGIN');db.prepare("UPDATE design_intake_entries SET visibility='private' WHERE id=?").run(item.id);
 assert.equal(queryDesignCatalog({filters:{q:'Published fixture'}},publishedDesignCatalogSnapshot()).total,0);db.exec('ROLLBACK');
 assert.equal(publishedDesignCatalogSnapshot(),published,'rolled-back snapshots never poison the committed cache');
 const other=new DatabaseSync(path.join(dir,'site.sqlite'));
 try{other.prepare("UPDATE design_intake_entries SET visibility='private' WHERE id=?").run(item.id);}finally{other.close();}
 const withdrawn=publishedDesignCatalogSnapshot();assert.throws(()=>queryDesignCatalog({cursor:oldCursor}),error=>error.status===409);assert.notEqual(withdrawn,published);assert.equal(queryDesignCatalog({filters:{q:'Published fixture'}},withdrawn).total,0);
 db.prepare("UPDATE design_intake_entries SET visibility='public' WHERE id=?").run(item.id);const restored=publishedDesignCatalogSnapshot();assert.equal(queryDesignCatalog({filters:{q:'Published fixture'}},restored).total,1);
 db.prepare('DELETE FROM design_intake_entries WHERE id=?').run(item.id);assert.notEqual(publishedDesignCatalogSnapshot(),restored);
});

test('the public query API enforces origin, JSON size, method and no-store without disclosing unpublished fields',async()=>{
 const request=(body,origin='http://catalog.test')=>new Request('http://catalog.test/api/design-catalog',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
 const response=await handle(request({filters:{scenario:'docs'}}));assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 const page=await response.json();assert.equal(page.total,4);assert.ok(page.items.every(item=>item.template.scenarios.includes('docs')));assert.ok(!JSON.stringify(page).includes('PRIVATE DRAFT'));
 assert.equal((await handle(request({},'https://foreign.test'))).status,403);
 assert.equal((await handle(new Request('http://catalog.test/api/design-catalog'))).status,405);
 assert.equal((await handle(request({filters:{q:'a'.repeat(128001)}}))).status,413);
 assert.equal((await handle(request({filters:[]}))).status,400);
});
