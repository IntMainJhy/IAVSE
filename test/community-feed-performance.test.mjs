import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const temp=await mkdtemp(path.join(tmpdir(),'site-feed-pagination-'));
process.env.APP_DATA_DIR=temp;process.env.PUBLIC_URL='http://127.0.0.1:3008';process.env.INITIAL_ADMIN_PASSWORD='feed-pagination-test-password';
const D=await import('../src/lib/db.mjs'),C=await import('../src/lib/community.mjs');
const d=D.db(),uuid=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),stamp=n=>new Date(Date.UTC(2026,0,1)+n*1000).toISOString();
const users=new Map([
 ['owner',{role:'owner',status:'active',verification:'owner'}],
 [uuid(1),{role:'member',status:'active',verification:'accepted'}],
 [uuid(2),{role:'member',status:'active',verification:'verified'}],
 [uuid(3),{role:'member',status:'active',verification:'pending'}],
 [uuid(4),{role:'member',status:'banned',verification:'verified'}],
 [uuid(5),{role:'member',status:'active',verification:'local_test'}],
 [uuid(6),{role:'member',status:'active',verification:'pending'}]
]);
const insertUser=d.prepare('INSERT INTO community_users(id,username,password,nickname,role,status,verification,created,updated) VALUES(?,?,?,?,?,?,?,?,?)');
for(const[id,user]of users)insertUser.run(id,id,'!unused!',id,user.role,user.status,user.verification,stamp(0),stamp(0));
d.prepare("INSERT INTO config(key,value) VALUES('siteOwnerAccount',?)").run(JSON.stringify({id:uuid(6)}));
const posts=[],reposts=[],follows=new Set([uuid(1),uuid(5)]),frozen=new Set();
const addPost=(n,author,extra={})=>{
 const id=uuid(100+n),revision=uuid(1000+n),doc={title:(n%3?'ÉCOLE':'100%_\\')+' 分享 '+n,summary:n%4?'资源摘要':'ΣΥΝΟΨΗ',body:'BODY-'+id+' '+('x'.repeat(10000)),category:n%2?'技术笔记':'开发资源',tags:[],note:'PRIVATE_REVIEW_NOTE'};
 const post={id,author,visibility:'public',doc,updated:stamp(n),...extra};posts.push(post);
 d.prepare('INSERT INTO community_posts(id,author,draft,public_revision,visibility,created,updated) VALUES(?,?,?,?,?,?,?)').run(id,author,JSON.stringify({...doc,title:'PRIVATE_DRAFT'}),revision,post.visibility,stamp(0),stamp(999));
 d.prepare("INSERT INTO community_revisions(id,post,number,data,status,created,decided) VALUES(?,?,1,?,'approved',?,?)").run(revision,id,JSON.stringify(doc),stamp(0),post.updated);
 return post;
};
D.transaction(()=>{
 for(let i=0;i<60;i++)addPost(i,i%2?uuid(1):uuid(2));
 addPost(60,uuid(3));addPost(61,uuid(4));addPost(62,uuid(1),{visibility:'private'});addPost(63,uuid(5));addPost(64,uuid(6));
 for(const target of [posts[4],posts[9]]){
  frozen.add(target.id);d.prepare("INSERT INTO community_cases(id,token,kind,post,category,description,frozen,created,updated) VALUES(?,?,'report',?,'其他','Synthetic frozen target',1,?,?)").run(uuid(2000+frozen.size),'!unused!',target.id,stamp(0),stamp(0));
 }
 for(const[post,actor,time]of [[posts[0],uuid(1),200],[posts[0],uuid(3),300],[posts[1],uuid(2),400],[posts[1],uuid(5),400],[posts[2],'owner',500],[posts[3],uuid(6),600],[posts[4],uuid(1),700],[posts[5],uuid(4),800],[posts[60],uuid(1),900]]){
  const row={post:post.id,actor,created:stamp(time)};reposts.push(row);d.prepare('INSERT INTO community_reposts(actor,post,created) VALUES(?,?,?)').run(row.actor,row.post,row.created);
 }
 for(const following of follows)d.prepare('INSERT INTO community_follows(follower,following,created) VALUES(?,?,?)').run(uuid(2),following,stamp(0));
});
function reference({q='',category='',page=1,feed='',member=''}={}){
 const qualified=id=>{const user=users.get(id);return user?.status==='active'&&(id==='owner'||user.role==='owner'||['verified','accepted','local_test'].includes(user.verification));};
 const eligibleRepost=id=>id==='owner'||qualified(id)||id===uuid(6)&&users.get(id).status==='active';
 const latest=new Map();
 for(const row of [...reposts].sort((a,b)=>b.created.localeCompare(a.created)||a.actor.localeCompare(b.actor))){
  if(latest.has(row.post)||feed==='following'&&!follows.has(row.actor)||member&&row.actor!==member||!eligibleRepost(row.actor))continue;
  latest.set(row.post,row);
 }
 const needle=String(q).trim().toLowerCase();
 const all=posts.filter(post=>post.visibility==='public'&&qualified(post.author)&&!frozen.has(post.id))
 .filter(post=>(feed!=='following'||follows.has(post.author)||latest.has(post.id))&&(!member||post.author===member||latest.has(post.id)))
 .map(post=>({id:post.id,title:post.doc.title,activityAt:latest.get(post.id)?.created>post.updated?latest.get(post.id).created:post.updated,repostedBy:latest.get(post.id)?.actor||null,doc:post.doc}))
 .filter(post=>(!category||post.doc.category===category)&&(!needle||(post.doc.title+' '+post.doc.summary).toLowerCase().includes(needle)))
 .sort((a,b)=>b.activityAt.localeCompare(a.activityAt)||a.id.localeCompare(b.id));
 const pages=Math.max(1,Math.ceil(all.length/12)),current=Math.max(1,Math.min(pages,Math.floor(Number(page))||1));
 return{items:all.slice((current-1)*12,current*12).map(({doc,...row})=>row),total:all.length,pages,page:current};
}
const projection=result=>({...result,items:result.items.map(row=>({id:row.id,title:row.title,activityAt:row.activityAt,repostedBy:row.repostedBy?.id||null}))});
test('SQL pagination preserves Unicode/literal search, publication chronology, eligible reposts, follows, member feeds and page bounds',()=>{
 const queries=[{},...[-2,0,1,2,3,4,99,'bad'].map(page=>({page})),{category:'技术笔记'},{category:'不存在'},{q:' école '},{q:'συνοψη'},{q:'%_\\'},{q:'BODY-'},{feed:'following'},{member:uuid(1)},{member:uuid(6)},{feed:'following',member:uuid(1)},{feed:'following',q:'ÉCOLE',category:'开发资源',page:2},{member:'owner'}];
 for(const query of queries){
  const result=C.publicPosts(query,uuid(2));assert.deepEqual(projection(result),reference(query),JSON.stringify(query));
  for(const item of result.items){assert.equal(item.body,posts.find(post=>post.id===item.id).doc.body);assert.equal(item.note,undefined);assert.ok(!JSON.stringify(item).includes('PRIVATE_DRAFT'));}
 }
 assert.throws(()=>C.publicPosts({feed:'following'}),error=>error.status===401);
 for(const id of [uuid(4),'missing'])assert.throws(()=>C.publicPosts({member:id}),error=>error.status===404);
});
test('only the current page decodes full published bodies and query preparation does not grow per matching post',()=>{
 const originalPrepare=d.prepare,originalParse=JSON.parse;let prepareCalls=0,bodyParses=0;
 d.prepare=function(...args){prepareCalls++;return originalPrepare.apply(this,args)};
 JSON.parse=function(value,...args){if(typeof value==='string'&&value.includes('BODY-'))bodyParses++;return originalParse(value,...args)};
 try{
  const result=C.publicPosts({q:'ÉCOLE'},uuid(2));assert.equal(result.items.length,12);assert.equal(bodyParses,12);assert.ok(prepareCalls<120,'prepare calls bounded by 12 displayed posts: '+prepareCalls);
 }finally{d.prepare=originalPrepare;JSON.parse=originalParse;}
});
test('qualification, frozen content and repost eligibility changes take effect without cached permission results',()=>{
 users.get(uuid(1)).verification='pending';d.prepare("UPDATE community_users SET verification='pending' WHERE id=?").run(uuid(1));
 assert.deepEqual(projection(C.publicPosts({feed:'following'},uuid(2))),reference({feed:'following'}));
 users.get(uuid(1)).verification='accepted';d.prepare("UPDATE community_users SET verification='accepted' WHERE id=?").run(uuid(1));
 frozen.delete(posts[4].id);d.prepare('UPDATE community_cases SET frozen=0 WHERE post=?').run(posts[4].id);
 assert.deepEqual(projection(C.publicPosts({},uuid(2))),reference());
});
test.after(async()=>{d.close();delete globalThis.__personalSiteDb;await rm(temp,{recursive:true,force:true});});
