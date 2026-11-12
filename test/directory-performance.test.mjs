import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

const directory=await mkdtemp(path.join(tmpdir(),'iavse-directory-perf-'));
process.env.APP_DATA_DIR=directory;process.env.INITIAL_ADMIN_PASSWORD='directory-test-password-2026';process.env.PUBLIC_URL='http://localhost:3190';
const D=await import('../src/lib/db.mjs'),S=await import('../src/lib/spaces.mjs'),{defaultLayout}=await import('../src/lib/spaces-model.mjs');
const d=D.db(),req=new Request('http://localhost:3190/api/spaces/public',{headers:{host:'localhost:3190'}}),fixtures=[];
S.ownerSpace();
D.transaction(()=>{
 for(let i=0;i<180;i++){
  const id=randomUUID(),owner=randomUUID(),release=randomUUID(),handle='directory-'+i,date=new Date(Date.UTC(2030,0,1,0,0,180-i)).toISOString();
  const profile={name:'Published '+i,alias:handle,intro:'Public introduction',avatarId:'',experiences:[],translations:{en:{name:'Author '+i}}},layout=defaultLayout();
  d.prepare('INSERT INTO community_users(id,username,password,nickname,verification,status,created,updated) VALUES(?,?,?,?,?,?,?,?)').run(owner,handle,'unused',handle,'local_test',i<30?'banned':'active',date,date);
  d.prepare("INSERT INTO spaces(id,owner,handle,profile,layout,public_release,visibility,discoverable,created,updated) VALUES(?,?,?,?,?,?,'public',?,?,?)").run(id,owner,handle,JSON.stringify({...profile,name:'PRIVATE DRAFT'}),JSON.stringify(layout),release,i>=30&&i<50?0:1,date,date);
  d.prepare('INSERT INTO space_handles VALUES(?,?)').run(handle,id);
  d.prepare("INSERT INTO space_reviews(id,space,kind,version,data,status,created) VALUES(?,?,'board',1,?,'approved',?)").run(release,id,JSON.stringify({profile,layout,discoverable:!(i>=50&&i<60)}),date);
  for(let n=0;n<2;n++)d.prepare("INSERT INTO space_content(id,space,type,slug,draft,published,visibility,created,updated) VALUES(?,?,'articles',?,?,?,?,?,?)").run(randomUUID(),id,'post-'+n,JSON.stringify({bodyHtml:'PRIVATE DRAFT'}),JSON.stringify({title:'Post '+n,bodyHtml:'x'.repeat(16000),coverId:'cover-'+i+'-'+n}),n?'private':'public',date,date);
  fixtures.push({id,owner,handle,release,date});
 }
});

test('directory skips ineligible rows before its cap and keeps public metadata without bodies or drafts',()=>{
 const list=S.publicSpaces(req);assert.equal(list.length,60);assert.equal(list[0].handle,'directory-60');assert.equal(list.at(-1).handle,'directory-119');
 for(const item of list){const index=Number(item.handle.split('-')[1]);assert.equal(item.profile.name,'Published '+index);assert.equal(item.count,1);assert.equal(item.coverId,'cover-'+index+'-0');assert.equal(item.profile.translations.en.name,'Author '+index);}
 assert.ok(!JSON.stringify(list).includes('PRIVATE DRAFT'));assert.ok(!JSON.stringify(list).includes('bodyHtml'));
});

test('preview mode comes from the approved release, independently of private draft changes',()=>{
 const fixture=fixtures[60],row=d.prepare('SELECT data FROM space_reviews WHERE id=?').get(fixture.release),release=JSON.parse(row.data);
 d.prepare('UPDATE spaces SET layout=? WHERE id=?').run(JSON.stringify({...release.layout,blog:{mode:'static'}}),fixture.id);
 assert.equal(S.publicSpaces(req)[0].mode,'theme');
 d.prepare('UPDATE space_reviews SET data=? WHERE id=?').run(JSON.stringify({...release,layout:{...release.layout,blog:{mode:'static'}}}),fixture.release);
 assert.equal(S.publicSpaces(req)[0].mode,'static');
 d.prepare('UPDATE space_reviews SET data=? WHERE id=?').run(row.data,fixture.release);
 assert.equal(S.publicSpaces(req)[0].mode,'theme');
});

test('freezes, takedowns and author restrictions take effect on the next directory read',()=>{
 const fixture=fixtures[60],caseId=randomUUID();
 d.prepare("INSERT INTO community_cases(id,token,kind,category,description,created,updated,frozen) VALUES(?,?,'report','test','directory permission test',?,?,1)").run(caseId,randomUUID(),fixture.date,fixture.date);
 d.prepare('INSERT INTO space_case_targets VALUES(?,?,NULL)').run(caseId,fixture.id);
 assert.equal(S.publicSpaces(req)[0].handle,'directory-61');
 d.prepare('UPDATE community_cases SET frozen=0 WHERE id=?').run(caseId);assert.equal(S.publicSpaces(req)[0].handle,fixture.handle);
 const content=d.prepare("SELECT id FROM space_content WHERE space=? AND visibility='public'").get(fixture.id);
 d.prepare('UPDATE space_case_targets SET content=? WHERE case_id=?').run(content.id,caseId);d.prepare('UPDATE community_cases SET frozen=1 WHERE id=?').run(caseId);
 const frozen=S.publicSpaces(req)[0];assert.equal(frozen.handle,fixture.handle);assert.equal(frozen.count,0);assert.equal(frozen.coverId,'');
 d.prepare('UPDATE community_cases SET frozen=0 WHERE id=?').run(caseId);assert.equal(S.publicSpaces(req)[0].count,1);
 d.prepare("UPDATE community_users SET status='banned' WHERE id=?").run(fixture.owner);assert.equal(S.publicSpaces(req)[0].handle,'directory-61');
 d.prepare("UPDATE community_users SET status='active' WHERE id=?").run(fixture.owner);assert.equal(S.publicSpaces(req)[0].handle,fixture.handle);
});

test('owner lookup reaches a published space beyond the directory cap and respects both discoverability flags',()=>{
 const bind=owner=>d.prepare("INSERT OR REPLACE INTO config(key,value) VALUES('siteOwnerAccount',?)").run(JSON.stringify({id:owner}));
 try{
  const official=fixtures[150];
  bind(official.owner);
  assert.ok(!S.publicSpaces(req).some(item=>item.handle===official.handle));
  const summary=S.publicSiteOwnerSummary(req);
  assert.equal(summary.siteOwner,true);
  assert.equal(summary.handle,official.handle);
  assert.equal(summary.profile.name,'Published 150');
  for(const index of [35,55,10]){
   bind(fixtures[index].owner);
   assert.equal(S.publicSiteOwnerSummary(req),null);
  }
 }finally{d.prepare("DELETE FROM config WHERE key='siteOwnerAccount'").run();}
});

test('directory and content lookups use their ordered and complaint lookup indexes',()=>{
 const plan=(sql,...args)=>d.prepare('EXPLAIN QUERY PLAN '+sql).all(...args).map(row=>row.detail).join('\n');
 assert.match(plan("SELECT * FROM spaces WHERE visibility='public' AND discoverable<>0 ORDER BY updated DESC"),/space_discovery/);
 assert.match(plan("SELECT json_extract(published,'$.coverId') FROM space_content WHERE space=? AND visibility='public' AND published IS NOT NULL ORDER BY updated DESC",fixtures[60].id),/space_public_content/);
 assert.match(plan('SELECT 1 FROM space_case_targets WHERE space=? AND content=?',fixtures[60].id,''),/space_case_space/);
});

test.after(async()=>{d.close();delete globalThis.__personalSiteDb;await rm(directory,{recursive:true,force:true});});
