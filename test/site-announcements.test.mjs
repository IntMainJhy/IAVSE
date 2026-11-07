import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

const directory=await mkdtemp(path.join(tmpdir(),'iavse-announcements-')),base='http://localhost:3186';
Object.assign(process.env,{APP_DATA_DIR:directory,PUBLIC_URL:base,APP_SURFACE:'combined',INITIAL_ADMIN_PASSWORD:'isolated-announcements-owner-password'});
const D=await import('../src/lib/db.mjs'),A=await import('../src/lib/auth.mjs'),C=await import('../src/lib/content.mjs'),N=await import('../src/lib/site-announcements.mjs'),API=await import('../src/lib/api.mjs'),Access=await import('../src/lib/app-access.mjs');
const request=(url='/',{method='GET',token='',body,origin=base}={})=>new Request(base+url,{method,headers:{host:'localhost:3186',origin,cookie:'site_admin='+token,'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
D.db();const owner=A.login(request(),{username:'admin',password:process.env.INITIAL_ADMIN_PASSWORD});
const member=randomUUID(),memberToken=randomUUID();
D.db().prepare('INSERT INTO community_users(id,username,password,nickname,role,verification,created,updated) VALUES(?,?,?,?,?,?,?,?)').run(member,'announcement_member','unused','Announcement fixture','member','local_test',D.now(),D.now());
D.db().prepare('INSERT INTO sessions VALUES(?,?,?)').run(D.hash(memberToken),Date.now()+600000,member);
const call=(url,options)=>API.handle(request(url,options));
const store=value=>D.db().prepare("INSERT INTO config(key,value) VALUES('announcements',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(value));
const save=(value,token=owner,origin=base)=>call('/api/admin/config',{method:'POST',token,origin,body:{key:'announcements',value}});

test('announcement defaults are read-only and public output is schema-owned',async()=>{
 const before=D.db().prepare("SELECT value FROM config WHERE key='announcements'").get();assert.equal(before,undefined);
 const response=await call('/api/announcements');assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 assert.deepEqual(await response.json(),N.defaultSiteAnnouncements);
 assert.equal(D.db().prepare("SELECT value FROM config WHERE key='announcements'").get(),undefined,'reading a default does not mutate configuration');
 store({enabled:true,items:[{title:'Public notice',url:'/docs',privateToken:'not-public'}],secret:'not-public',operatorEmail:'owner@example.invalid'});
 assert.deepEqual(await(await call('/api/announcements')).json(),{enabled:true,items:[{title:'Public notice',url:'/docs'}]});
});

test('only the owner can read editable announcements or save them and CSRF remains enforced',async()=>{
 const value={enabled:true,items:[{title:'Maintenance update',url:'/resources'}]};
 for(const token of ['',memberToken]){
  assert.equal((await call('/api/admin/config?key=announcements',{token})).status,401);
  assert.equal((await save(value,token)).status,401);
 }
 assert.equal((await save(value,owner,'https://foreign.example')).status,403);
 assert.equal((await call('/api/announcements',{method:'POST',body:value})).status,404,'the public endpoint is read-only');
 assert.equal((await save(value)).status,200);
 assert.deepEqual(await(await call('/api/admin/config?key=announcements',{token:owner})).json(),value);
 assert.ok(D.db().prepare("SELECT 1 FROM community_audit WHERE action='site_config_update' AND target='announcements'").get(),'announcement edits use the existing audit trail');
});

test('saving and reopening announcements preserves general settings and disabled drafts stay private',async()=>{
 const site=D.getConfig('site'),promotionBar=JSON.stringify(site.promotionBar),value={enabled:true,items:[{title:'Release notes',url:'https://example.com/updates'},{title:'Plain text notice',url:''}]};
 const response=await save(value);assert.equal(response.status,200);assert.deepEqual(await response.json(),value);
 D.db().close();delete globalThis.__personalSiteDb;
 assert.deepEqual(N.readSiteAnnouncements(),value);assert.deepEqual(D.getConfig('site'),site);assert.equal(JSON.stringify(D.getConfig('site').promotionBar),promotionBar);
 assert.equal((await save({...value,enabled:false})).status,200);
 assert.deepEqual(await(await call('/api/announcements')).json(),{enabled:false,items:[]});
 assert.deepEqual(await(await call('/api/admin/config?key=announcements',{token:owner})).json(),{...value,enabled:false});
 assert.equal((await save({enabled:false,items:[]})).status,200);assert.deepEqual(N.readSiteAnnouncements(),{enabled:false,items:[]});
});

test('schema rejects malformed input and unsafe paths without overwriting the previous version',async()=>{
 const initial={enabled:true,items:[{title:'Safe current announcement',url:'/docs?category=guides#start'}]};assert.equal((await save(initial)).status,200);
 const urls=['javascript:alert(1)','data:text/html,notice','//evil.example','/\\evil.example','/path\\tail','http://example.com','https://name:secret@example.com','/path with space','\nhttps://example.com','https://example.com/\tpath','/%2f%2fevil.example','/%5cevil.example','/safe%0aheader'];
 for(const url of urls){assert.equal((await save({enabled:true,items:[{title:'Unsafe link fixture',url}]})).status,400,url);assert.deepEqual(N.readSiteAnnouncements(),initial);}
 for(const value of [{enabled:'true',items:[]},{enabled:true,items:[]},{enabled:false,items:Array(4).fill({title:'Too many',url:''})},{enabled:true,items:[{title:'',url:''}]},{enabled:true,items:[{title:'a'.repeat(121),url:''}]},{enabled:true,items:[{title:'line\nbreak',url:''}]},{enabled:true,items:[{title:5,url:''}]},{enabled:true,items:[null]}])assert.equal((await save(value)).status,400,JSON.stringify(value));
 assert.deepEqual(N.readSiteAnnouncements(),initial);
});

test('public config reads fail closed on corrupt stored data and are available on both split surfaces',async()=>{
 store({enabled:true,items:[{title:'Unsafe stored value',url:'javascript:alert(1)'}],secret:'not-public'});
 assert.deepEqual(N.readSiteAnnouncements({publicOnly:true}),{enabled:false,items:[]});
 for(const surface of ['combined','platform','admin']){process.env.APP_SURFACE=surface;assert.equal(Access.apiAllowed('/api/announcements'),true);assert.deepEqual(await(await call('/api/announcements')).json(),{enabled:false,items:[]});}
 process.env.APP_SURFACE='combined';
});

test.after(async()=>{D.db().close();delete globalThis.__personalSiteDb;await rm(directory,{recursive:true,force:true});});
