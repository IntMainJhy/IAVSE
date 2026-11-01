import test from 'node:test';
import assert from 'node:assert/strict';
import {isPublicAnalyticsPath} from '../src/lib/analytics-paths.mjs';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

test('public analytics covers discovery and reading without private routes or query data',()=>{
 for(const route of ['/','/blogs','/downloads','/blog/creator','/blog/creator/resume','/blog/creator/experience','/community/members/a-user','/blog/creator/articles/a-post','/docs','/docs/articles/note','/docs/shared/123','/skills','/skills/gsap','/resources/shared/456','/community/a-post'])assert.equal(isPublicAnalyticsPath(route),true,route);
 for(const route of ['/admin','/workspace/blog','/login','/join','/report','/api/me','/blog/creator/edit','/docs?token=private','/docs%3Ftoken=private','/skills/../admin','/skills/a%2Fb','/blog/creator/articles/secret?preview=1','https://example.com','/docs\\admin','/docs#secret','/blog//articles/x'])assert.equal(isPublicAnalyticsPath(route),false,route);
});

test('new public routes use one anonymous visitor and continue respecting privacy exclusions',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'site-public-analytics-'));
 process.env.APP_DATA_DIR=directory;process.env.INITIAL_ADMIN_PASSWORD='isolated-analytics-test-password';process.env.PUBLIC_URL='http://localhost:3010';
 const D=await import('../src/lib/db.mjs'),A=await import('../src/lib/analytics.mjs');
 const req=(cookie='',extra={})=>new Request('http://localhost:3010/api/analytics',{headers:{'user-agent':'PublicBrowser/1.0',cookie,...extra}});
 let cookie='';
 try{
  for(const route of ['/blogs','/skills/gsap','/blog/creator/articles/story']){
   const result=A.track(req(cookie),{id:randomUUID(),kind:'view',path:route});
   if(result.cookie)cookie=result.cookie.split(';')[0];
  }
  for(const headers of [{'dnt':'1'},{'sec-gpc':'1'},{'user-agent':'ExampleBot/1.0'}])A.track(req(cookie,headers),{id:randomUUID(),kind:'view',path:'/blogs'});
  assert.throws(()=>A.track(req(cookie),{id:randomUUID(),kind:'view',path:'/workspace/account'}),e=>e.status===400);
  const result=A.analytics(new URLSearchParams());
  assert.equal(result.totals.pv,3);assert.equal(result.totals.uv,1);
  assert.deepEqual(new Set(result.popular.map(x=>x.path)),new Set(['/blogs','/skills/gsap','/blog/creator/articles/story']));
 }finally{D.db().close();delete globalThis.__personalSiteDb;await rm(directory,{recursive:true,force:true});}
});
