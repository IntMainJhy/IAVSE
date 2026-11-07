import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('resource discovery remains private until owner review; collection and scheduler are bounded',async t=>{
 const directory=await mkdtemp(path.join(tmpdir(),'iavse-discovery-'));
 process.env.APP_DATA_DIR=directory;process.env.INITIAL_ADMIN_PASSWORD='isolated-discovery-test-password';process.env.PUBLIC_URL='http://localhost:3010';delete process.env.DEMO_SKIP_LOGIN;
 const P=await import('../src/lib/catalog-public-skills.mjs'),D=await import('../src/lib/db.mjs'),A=await import('../src/lib/auth.mjs'),I=await import('../src/lib/design-intake.mjs'),C=await import('../src/lib/design-intake-collector.mjs'),API=await import('../src/lib/api.mjs');
 const owner={id:'owner',role:'owner',status:'active'},base='http://localhost:3010';
 const token=A.login(new Request(base+'/api/auth/login'),{username:'admin',password:process.env.INITIAL_ADMIN_PASSWORD});
 const request=(input,user=owner,origin=base)=>{const req=new Request(base+'/api/admin/discovery',{method:input?'POST':'GET',headers:{Cookie:'site_admin='+token,...(input?{'Content-Type':'application/json',Origin:origin}:{})},body:input?JSON.stringify(input):undefined});return user===owner?req:A.delegatedRequest(req,user)};
 const send=async input=>{const response=await API.handle(request(input));return {status:response.status,body:await response.json()}};
 const design={title:'Example design',summary:'An independent editorial workspace with generous whitespace and useful type hierarchy for long-form content.',source:{name:'Example original',url:'https://example.com/design'},category:'editorial'};
 let entry;
 try{
  await t.test('first mutation rejecting a seeded source cannot roll back the discovery schema',async()=>{
   assert.equal(D.db().prepare("SELECT name FROM sqlite_master WHERE name='design_intake_entries'").get(),undefined);
   assert.throws(()=>D.transaction(()=>{I.intakeDb();throw new Error('rollback initialization')}),/rollback initialization/);
   assert.equal(D.db().prepare("SELECT name FROM sqlite_master WHERE name='design_intake_entries'").get(),undefined);
   const duplicate=await send({action:'create',kind:'design',draft:{...design,source:{name:'Linear',url:'https://linear.app/'}}});assert.equal(duplicate.status,409);
   const response=await API.handle(request(null));assert.equal(response.status,200);assert.equal((await response.json()).total,0);assert.ok(I.readPublishedDesigns().some(item=>item.source?.url==='https://linear.app/'));
  });
  await t.test('owner-only route and strict same-origin mutations',async()=>{
   assert.equal((await API.handle(new Request(base+'/api/admin/discovery'))).status,401);
   for(const role of ['member','reviewer'])assert.equal((await API.handle(request(null,{id:role,role,status:'active'}))).status,401);
   assert.equal((await API.handle(request({action:'settings',enabled:false},owner,'https://evil.example.com'))).status,403);
   assert.equal((await API.handle(request(null))).status,200);
  });
  await t.test('draft creation, canonical deduplication, review validation and revision conflict',async()=>{
   const result=await send({action:'create',kind:'design',draft:design});assert.equal(result.status,200,JSON.stringify(result.body));entry=result.body;
   assert.equal(entry.status,'pending');assert.equal(entry.visibility,'private');assert.ok(!I.readPublishedDesigns().some(item=>item.id===entry.id));
   assert.equal((await send({action:'create',kind:'design',draft:{...design,source:{...design.source,url:'https://example.com/design/?utm_source=test#hello'}}})).status,409);
   assert.equal((await send({action:'approve',id:entry.id,version:entry.version,verified:true,reason:'Original source reviewed.'})).status,400);
   assert.equal((await send({action:'save',id:entry.id,version:99,draft:design})).status,409);
   for(const url of ['http://example.com','https://127.0.0.1/a','https://localhost/a','https://user:secret@example.com','javascript:alert(1)','https://2130706433/a'])assert.throws(()=>I.canonicalSource(url));
   assert.equal(I.canonicalSource('https://github.com/Owner/Repo/?utm_source=test#readme'),'https://github.com/owner/repo');
  });
  await t.test('changing a draft to its original website retains the collected source alias for deduplication',async()=>{
   const original={...design,title:'Source alias fixture',source:{name:'Collection permalink',url:'https://example.com/collection/permalink'}};
   const candidate=I.createDiscoveryDraft({kind:'design',draft:original});
   await I.discoveryAction(owner,{action:'save',id:candidate.id,version:candidate.version,draft:{...candidate.draft,source:{name:'Original website',url:'https://original.example.com/'}}});
   assert.throws(()=>I.createDiscoveryDraft({kind:'design',draft:original}),error=>error.status===409);
   assert.throws(()=>I.createDiscoveryDraft({kind:'design',draft:{...original,source:{name:'Original website',url:'https://original.example.com/?utm_source=feed'}}}),error=>error.status===409);
   assert.ok(I.existingDiscoverySources().has('https://example.com/collection/permalink'));
  });
  await t.test('publish snapshots are explicit, safe templates and published versions survive draft editing',async()=>{
   const complete={...entry.draft,palette:['#ffffff','#1d1d1f','#0071e3'],typography:'Use a system sans serif with clear typographic scale.',layout:'A single editorial column grows into a three-column grid on wider displays.',motion:'Use opacity and transforms only; respect reduced motion.',prompt:'Build an original editorial resource library with source-attributed preview cards. '.repeat(3),specification:'Use semantic headings, visible focus states, meaningful source links, reusable token definitions, responsive card grids and transparent motion guidance. '.repeat(3),preview:{theme:'light',layout:'<script>alert(1)</script>',accent:'#0071e3'}};
   const saved=await send({action:'save',id:entry.id,version:entry.version,draft:complete});assert.equal(saved.status,200,JSON.stringify(saved.body));entry=saved.body;assert.equal(entry.draft.preview.layout,'editorial');
   assert.equal((await send({action:'approve',id:entry.id,version:entry.version,reason:'Reviewed source and license.'})).status,400);
   entry=(await send({action:'approve',id:entry.id,version:entry.version,verified:true,reason:'Reviewed source and license.'})).body;assert.equal(entry.visibility,'public');assert.equal(I.readPublishedDesigns().find(item=>item.id===entry.id).title,'Example design');
   entry=(await send({action:'save',id:entry.id,version:entry.version,draft:{...entry.draft,title:'Pending revised title',source:{name:'Updated source',url:'https://example.com/revised-source'}}})).body;assert.equal(entry.status,'pending');assert.equal(I.readPublishedDesigns().find(item=>item.id===entry.id).title,'Example design');
   assert.throws(()=>I.createDiscoveryDraft({kind:'design',draft:design}),error=>error.status===409);
   entry=(await send({action:'reject',id:entry.id,version:entry.version,reason:'The revised copy needs another source check.'})).body;assert.equal(entry.status,'rejected');assert.ok(I.readPublishedDesigns().some(item=>item.id===entry.id));
   entry=(await send({action:'offline',id:entry.id,version:entry.version})).body;assert.equal(entry.visibility,'private');assert.ok(!I.readPublishedDesigns().some(item=>item.id===entry.id));
   assert.ok(D.db().prepare("SELECT COUNT(*) n FROM community_audit WHERE action LIKE 'site_discovery_%'").get().n>=5);
  });
  await t.test('skill publishing requires installation, licensing and recommendation information',async()=>{
   let skill=(await send({action:'create',kind:'skill',draft:{title:'Useful skill',summary:'A focused reusable agent workflow with a well documented task scope and clear setup steps.',source:{name:'Original skill repo',url:'https://github.com/example-owner/reviewable-skill'}}})).body;
   assert.equal((await send({action:'approve',id:skill.id,version:skill.version,verified:true,reason:'Checked original repository.'})).status,400);
   skill=(await send({action:'save',id:skill.id,version:skill.version,draft:{...skill.draft,repo:'example-owner/reviewable-skill',installCommand:'npx skills add example-owner/reviewable-skill',license:'MIT',tools:['codex'],recommendation:'Use this focused skill when auditing existing component hierarchies and interaction states.'}})).body;
   skill=(await send({action:'approve',id:skill.id,version:skill.version,verified:true,reason:'Checked original repository and license.'})).body;
   assert.equal(I.readPublishedSkills().find(item=>item.id===skill.id).name,'Useful skill');
   const publicSkill=P.findPublicSkill(skill.draft.slug);assert.equal(publicSkill.name,'Useful skill');assert.equal(publicSkill.installCommand,skill.draft.installCommand);assert.equal(P.filterPublicSkills(P.readPublicSkills(),{q:'Useful skill',tool:'codex',category:'engineering'}).length,1);
   for(const [suffix,overrides] of [['slug',{slug:skill.draft.slug,repo:'another-owner/another-skill'}],['repo',{slug:'different-slug',repo:skill.draft.repo}],['curated',{slug:'curated-duplicate',repo:'vercel-labs/agent-skills'}]]){
    const duplicate=(await send({action:'create',kind:'skill',draft:{...skill.draft,...overrides,source:{name:'Review candidate',url:'https://example.com/skill-'+suffix}}})).body;assert.ok(duplicate.id);assert.equal((await send({action:'approve',id:duplicate.id,version:duplicate.version,verified:true,reason:'Reviewed source and install guide.'})).status,409);assert.ok(!P.readPublicSkills().some(item=>item.id===duplicate.id));
   }
  });
  await t.test('allowlisted collector, partial failures, duplicates and no auto publishing',async()=>{
   const calls=[],clock=()=>new Date('2030-03-10T10:00:00Z');
   const fetcher=async(url,options)=>{calls.push(url);assert.equal(options.redirect,'error');assert.ok(options.signal);if(url.includes('awwwards'))return new Response('Unavailable',{status:503});return Response.json({items:[{name:'New repo',full_name:'sample/new-resource',html_url:'https://github.com/sample/new-resource',description:'A new resource for review',topics:['design'],stargazers_count:500,license:{spdx_id:'MIT'}}]})};
   const before=I.readPublishedDesigns().length,result=await C.collectDiscovery({fetcher,clock});assert.equal(result.added,1);assert.equal(result.status,'partial');assert.equal(calls.length,4);assert.equal(I.readPublishedDesigns().length,before);
   const candidate=D.db().prepare("SELECT * FROM design_intake_entries WHERE source_key='https://github.com/sample/new-resource'").get();assert.equal(candidate.visibility,'private');assert.equal(candidate.published,null);
   const again=await C.collectDiscovery({fetcher,clock:()=>new Date('2030-03-10T10:02:00Z')});assert.equal(again.added,0);
   await assert.rejects(C.collectDiscovery({fetcher,clock:()=>new Date('2030-03-10T10:02:10Z')}),error=>error.status===429);
   let fetched=false;await assert.rejects(C.fetchDiscoverySource({id:'evil',url:'http://localhost:8080'}, {fetcher:()=>{fetched=true}}));assert.equal(fetched,false);
   await assert.rejects(C.fetchDiscoverySource(C.discoverySources[1],{fetcher:async()=>new Response('x'.repeat(750001))}),/体积限制/);
   await assert.rejects(C.fetchDiscoverySource(C.discoverySources[1],{fetcher:async()=>new Response('not json')}),/JSON/);
  });
  await t.test('removing the last item of a filtered page clamps pagination to the remaining queue',async()=>{
   for(let index=0;index<25;index++)I.createDiscoveryDraft({kind:'design',draft:{...design,title:'pagination-fixture-'+index,source:{name:'Fixture source',url:'https://example.org/pagination-'+index}}});
   const params=new URLSearchParams({status:'pending',q:'pagination-fixture',page:'2'}),before=I.discoveryQueue(params);assert.equal(before.page,2);assert.equal(before.pages,2);assert.equal(before.items.length,1);
   await I.discoveryAction(owner,{action:'reject',id:before.items[0].id,version:before.items[0].version,reason:'Not included after source review.'});
   const after=I.discoveryQueue(params);assert.equal(after.page,1);assert.equal(after.pages,1);assert.equal(after.total,24);assert.equal(after.items.length,24);
   assert.equal(I.discoveryQueue(new URLSearchParams({q:'definitely-missing-query',page:'999'})).page,1);
  });
  await t.test('source-alias migration reserves the published snapshot even when the draft changed its URL',()=>{
   D.db().prepare('DELETE FROM design_intake_source_keys WHERE source_key=?').run('https://example.com/design');
   assert.equal(D.db().prepare('SELECT id FROM design_intake_entries WHERE source_key=?').get('https://example.com/design'),undefined);
   D.db().close();delete globalThis.__personalSiteDb;
   const row=I.intakeDb().prepare('SELECT entry_id FROM design_intake_source_keys WHERE source_key=?').get('https://example.com/design');assert.equal(row.entry_id,entry.id);
   assert.throws(()=>I.createDiscoveryDraft({kind:'design',draft:design}),error=>error.status===409);
  });
  await t.test('scheduled work is claimed once per Shanghai day and honors pause',()=>{
   I.updateDiscoverySettings({enabled:true,lastScheduledDate:''});assert.equal(I.claimScheduledDiscovery(new Date('2030-03-11T00:59:00Z')),false);assert.equal(I.claimScheduledDiscovery(new Date('2030-03-11T01:00:00Z')),true);assert.equal(I.claimScheduledDiscovery(new Date('2030-03-11T06:00:00Z')),false);assert.equal(I.claimScheduledDiscovery(new Date('2030-03-12T01:00:00Z')),true);
   I.updateDiscoverySettings({enabled:false});assert.equal(I.claimScheduledDiscovery(new Date('2030-03-13T01:00:00Z')),false);assert.ok(I.discoverySettings().heartbeat);
  });
 }finally{D.db().close();delete globalThis.__personalSiteDb;await rm(directory,{recursive:true,force:true})}
});
