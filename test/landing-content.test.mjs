import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {projectLandingContent} from '../src/lib/landing-content.mjs';
import * as locales from '../src/lib/content-locales.mjs';

const privateFields={draft:'PRIVATE_DRAFT',body:'PRIVATE_BODY',bodyHtml:'PRIVATE_HTML',note:'PRIVATE_NOTE',session:'PRIVATE_SESSION',email:'PRIVATE_EMAIL'};
const post=(id,extra={})=>({id,title:'Public '+id,summary:'Reviewed excerpt',sourceName:'Original source',license:'Author license',authorName:'Published author',...privateFields,...extra});
const space=(handle,extra={})=>({handle,profile:{name:'Published '+handle,intro:'Public introduction',avatarId:'avatar-'+handle,...privateFields},count:2,...privateFields,...extra});
const work=(id,handle,extra={})=>({id,handle,type:'projects',slug:id,title:'Work '+id,summary:'Public project summary',authorName:'Published '+handle,...privateFields,...extra});
const keys=value=>Object.keys(value).sort();

test('landing DTOs whitelist public fields, construct internal links and bound every collection',()=>{
 const spaces=Array.from({length:6},(_,i)=>space('member '+i));
 const posts=Array.from({length:6},(_,i)=>post('post '+i,{coverId:'cover-'+i,authorAvatarId:'avatar-'+i,commentCount:i,likeCount:i+1,url:'https://untrusted.example',href:'PRIVATE_LINK'}));
 const works=Array.from({length:6},(_,i)=>work('work '+i,'member '+(i%4),{coverId:'work-cover-'+i,authorAvatarId:'avatar-'+i,href:'PRIVATE_LINK'}));
 const result=projectLandingContent({posts,spaces,works});
 assert.equal(result.posts.length,4);assert.equal(result.works.length,3);
 assert.deepEqual(keys(result),['communityUnavailable','posts','space','works']);
 assert.deepEqual(keys(result.posts[0]),['authorAvatarId','authorName','category','commentCount','coverId','href','id','license','likeCount','source','summary','title'].sort());
 assert.deepEqual(keys(result.works[0]),['authorAvatarId','authorName','coverId','href','id','summary','title','type'].sort());
 assert.deepEqual(keys(result.space),['avatarId','count','coverId','handle','href','intro','name'].sort());
 assert.equal(result.posts[0].href,'/community/post%200');
 assert.equal(result.works[0].href,'/blog/member%200/projects/work%200');
 assert.equal(result.works[0].type,'work');assert.equal(result.space.href,'/blog/member%200');
 assert.equal(result.posts[0].source,'Original source');assert.equal(result.posts[0].license,'Author license');
 assert.doesNotMatch(JSON.stringify(result),/PRIVATE_|untrusted/);
});

test('posts and projects use stable newest-first ordering without modifying public inputs',()=>{
 const posts=[post('old',{activityAt:'invalid timestamp',updated:'2026-11-01T00:00:00Z'}),post('new-a',{activityAt:'2026-11-09T00:00:00Z',updated:'2026-11-02T00:00:00Z'}),post('new-b',{updated:'2026-11-09T00:00:00Z'}),post('undated')];
 const works=[work('old','a',{updated:'2026-11-01T00:00:00Z'}),work('new','b',{updated:'2026-11-10T00:00:00Z'}),work('middle','a',{updated:'2026-11-05T00:00:00Z'})];
 const result=projectLandingContent({posts,spaces:[space('a'),space('b')],works});
 assert.deepEqual(result.posts.map(item=>item.id),['new-a','new-b','old','undated']);
 assert.deepEqual(result.works.map(item=>item.id),['new','middle','old']);
 assert.deepEqual(posts.map(item=>item.id),['old','new-a','new-b','undated']);
 assert.deepEqual(works.map(item=>item.id),['old','new','middle']);
 assert.equal(result.space.handle,'a','directory order chooses the first eligible public space');
});

test('localized public text never replaces canonical IDs, media, author or URLs',()=>{
 const translations={en:{title:'English title',summary:'English summary',coverId:'PRIVATE_COVER',id:'PRIVATE_ID',href:'PRIVATE_LINK'}};
 const result=projectLandingContent({locale:'en',posts:[post('p',{translations,coverId:'published-cover'})],spaces:[space('a',{profile:{name:'原名',intro:'原简介',avatarId:'published-avatar',translations:{en:{name:'English author',intro:'English introduction',avatarId:'PRIVATE_AVATAR'}}}})],works:[work('w','a',{translations})]});
 assert.equal(result.posts[0].title,'English title');assert.equal(result.posts[0].summary,'English summary');
 assert.equal(result.posts[0].id,'p');assert.equal(result.posts[0].coverId,'published-cover');
 assert.equal(result.works[0].title,'English title');assert.equal(result.works[0].href,'/blog/a/projects/w');
 assert.equal(result.space.name,'English author');assert.equal(result.space.intro,'English introduction');assert.equal(result.space.avatarId,'published-avatar');
 assert.doesNotMatch(JSON.stringify(result),/PRIVATE_/);
});

test('missing covers and optional fields stay empty and malformed activity does not invent counts',()=>{
 const result=projectLandingContent({posts:[post('p',{summary:undefined,sourceName:null,authorName:undefined,commentCount:-2,likeCount:Infinity}),null,{},post('')],spaces:[space('a',{profile:null,count:-5})],works:[work('w','a',{coverId:null,authorName:undefined,authorAvatarId:undefined}),work('article','a',{type:'articles'}),work('outside','missing')]});
 assert.equal(result.posts.length,1);assert.equal(result.works.length,1);
 assert.equal(result.posts[0].coverId,'');assert.equal(result.posts[0].summary,'');assert.equal(result.posts[0].source,'');
 assert.equal(result.posts[0].authorName,'');assert.equal(result.posts[0].authorAvatarId,'');
 assert.equal(result.posts[0].commentCount,0);assert.equal(result.posts[0].likeCount,0);
 assert.equal(result.works[0].coverId,'');assert.equal(result.works[0].authorName,'');assert.equal(result.works[0].authorAvatarId,'');
 assert.equal(result.space.name,'');assert.equal(result.space.avatarId,'');assert.equal(result.space.count,0);
});

test('only the first four discoverable spaces can supply work and empty states stay genuine',()=>{
 const spaces=Array.from({length:5},(_,i)=>space('member-'+i));
 const result=projectLandingContent({spaces,works:[work('excluded','member-4'),work('included','member-3')]});
 assert.deepEqual(result.works.map(item=>item.id),['included']);
 assert.deepEqual(projectLandingContent(),{posts:[],works:[],space:null,communityUnavailable:false});
 assert.deepEqual(projectLandingContent({posts:null,spaces:{},works:false}),{posts:[],works:[],space:null,communityUnavailable:false});
 assert.deepEqual(projectLandingContent({posts:[post('must-hide')],communityUnavailable:true}),{posts:[],works:[],space:null,communityUnavailable:true});
});

// Stub module boundaries without opening a database, reading private data or using HTTP.
const loaderCode=ts.transpileModule(readFileSync(new URL('../src/lib/landing-content.mjs',import.meta.url),'utf8'),{compilerOptions:{allowJs:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function loader({handle=async()=>Response.json({items:[]}),publicSpaces=()=>[],publicSpace=()=>({profile:{},content:[]})}={}){
 const exports={};
 vm.runInNewContext(loaderCode,{exports,Request,URL,require:name=>{
  if(name==='./content-locales.mjs')return locales;
  if(name==='./api.mjs')return{handle};
  if(name==='./spaces.mjs')return{publicSpaces,publicSpace};
  throw Error('Unexpected module '+name);
 }});
 return exports.loadLandingContent;
}

test('loader calls the in-process GET with original headers and reads at most four public spaces',async()=>{
 const request=new Request('https://public.example/?private=query',{headers:{host:'public.example',cookie:'private-session'}}),seen=[];
 const spaces=Array.from({length:6},(_,i)=>space('member-'+i));
 const load=loader({handle:async req=>{
  assert.equal(req.url,'https://public.example/api/community/posts');assert.equal(req.method,'GET');
  assert.equal(req.headers.get('host'),'public.example');assert.equal(req.headers.get('cookie'),'private-session');
  return Response.json({items:[post('p',{commentCount:3,likeCount:5})],session:'PRIVATE_SESSION'});
 },publicSpaces:req=>{assert.equal(req,request);return spaces;},publicSpace:(req,handle)=>{
  assert.equal(req,request);seen.push(handle);
  return{profile:{name:'原名',avatarId:'public-avatar',translations:{en:{name:'Translated author'}},...privateFields},content:[work(handle,handle),work('article',handle,{type:'articles'})],...privateFields};
 }});
 const result=await load(request,'en');
 assert.deepEqual(seen,['member-0','member-1','member-2','member-3']);
 assert.equal(result.posts[0].commentCount,3);assert.equal(result.posts[0].likeCount,5);
 assert.equal(result.works.length,3);assert.equal(result.works[0].authorName,'Translated author');assert.equal(result.works[0].authorAvatarId,'public-avatar');
 assert.equal(result.communityUnavailable,false);assert.doesNotMatch(JSON.stringify(result),/PRIVATE_|private-session|private=query/);
});

test('unavailable or malformed community responses keep errors private and do not synthesize posts',async()=>{
 for(const handle of [async()=>Response.json({error:'PRIVATE_DATABASE_PATH'},{status:503}),async()=>{throw Error('PRIVATE_DATABASE_PATH');},async()=>Response.json({items:null,error:'PRIVATE_MESSAGE'}),async()=>new Response('PRIVATE_INVALID_JSON')]){
  const result=await loader({handle})(new Request('http://localhost/'));
  assert.equal(result.communityUnavailable,true);assert.equal(result.posts.length,0);assert.equal(result.works.length,0);assert.equal(result.space,null);
  assert.doesNotMatch(JSON.stringify(result),/PRIVATE_/);
 }
});

test('a missing public board cannot expose drafts or stop other published project summaries',async()=>{
 const load=loader({publicSpaces:()=>[space('unavailable'),space('available')],publicSpace:(req,handle)=>{
  if(handle==='unavailable')throw Error('PRIVATE_BOARD');
  return{profile:{name:'Public author'},content:[work('w',handle)]};
 }});
 const result=await load(new Request('http://localhost/'));
 assert.equal(result.communityUnavailable,false);assert.equal(result.posts.length,0);assert.equal(result.works.length,1);assert.equal(result.works[0].href,'/blog/available/projects/w');
 assert.doesNotMatch(JSON.stringify(result),/PRIVATE_/);
 const empty=await loader({publicSpaces:()=>{throw Error('PRIVATE_DIRECTORY');}})(new Request('http://localhost/'));
 assert.equal(empty.space,null);assert.equal(empty.works.length,0);assert.doesNotMatch(JSON.stringify(empty),/PRIVATE_/);
});
