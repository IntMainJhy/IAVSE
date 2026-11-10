import {localizeContent,localizeProfile} from './content-locales.mjs';

const list=value=>Array.isArray(value)?value:[];
const record=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const text=(value,max=600)=>typeof value==='string'?value.trim().slice(0,max):'';
const count=value=>Number.isFinite(Number(value))?Math.max(0,Math.floor(Number(value))):0;
const time=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))?Date.parse(value):0;
const newest=items=>items.map((item,index)=>({item,index,time:time(item.activityAt)||time(item.updated)})).sort((a,b)=>b.time-a.time||a.index-b.index).map(({item})=>item);

/** A small, explicit DTO: public-source objects and translations never reach the client. */
export function projectLandingContent({posts=[],spaces=[],works=[],locale='zh',communityUnavailable=false}={}){
 const directory=list(spaces).map(record).filter(item=>text(item.handle,100)).slice(0,4);
 const handles=new Set(directory.map(item=>text(item.handle,100)));
 const first=directory[0],profile=first?localizeProfile(record(first.profile),locale):null;
 const space=first?{
  handle:text(first.handle,100),name:text(profile.name,120),intro:text(profile.intro),
  avatarId:text(profile.avatarId,80),coverId:text(first.coverId,80),
  href:'/blog/'+encodeURIComponent(text(first.handle,100)),count:count(first.count)
 }:null;
 const publicPosts=communityUnavailable?[]:newest(list(posts).map(record)).map(item=>{
  const localized=localizeContent(item,locale),id=text(item.id,100),title=text(localized.title,200);
  if(!id||!title)return null;
  return{
   id,title,summary:text(localized.summary),category:text(item.category,120),
   source:text(item.sourceName,200),license:text(item.license,1000),coverId:text(item.coverId,80),
   authorName:text(item.authorName,120),authorAvatarId:text(item.authorAvatarId,80),
   commentCount:count(item.commentCount),likeCount:count(item.likeCount),
   href:'/community/'+encodeURIComponent(id)
  };
 }).filter(Boolean).slice(0,4);
 const publicWorks=newest(list(works).map(record)).map(item=>{
  const handle=text(item.handle,100),slug=text(item.slug,200),localized=localizeContent(item,locale),title=text(localized.title,200);
  if(item.type!=='projects'||!handles.has(handle)||!slug||!title)return null;
  return{
   id:text(item.id,100)||handle+'/'+slug,title,summary:text(localized.summary),coverId:text(item.coverId,80),
   authorName:text(item.authorName,120),authorAvatarId:text(item.authorAvatarId,80),
   href:'/blog/'+encodeURIComponent(handle)+'/projects/'+encodeURIComponent(slug),type:'work'
  };
 }).filter(Boolean).slice(0,3);
 return{posts:publicPosts,works:publicWorks,space,communityUnavailable:!!communityUnavailable};
}

/** Use the same in-process, permission-checked GET path as pageResources. */
export async function loadLandingContent(req,locale='zh'){
 let posts=[],spaces=[],works=[],communityUnavailable=false;
 try{
  const {handle}=await import('./api.mjs');
  const response=await handle(new Request(new URL('/api/community/posts',req.url),{method:'GET',headers:req.headers}));
  if(!response.ok)communityUnavailable=true;
  else{
   const result=await response.json();
   if(Array.isArray(result?.items))posts=result.items;
   else communityUnavailable=true;
  }
 }catch{communityUnavailable=true;}
 try{
  const {publicSpaces,publicSpace}=await import('./spaces.mjs');
  spaces=list(publicSpaces(req)).map(record).filter(item=>text(item.handle,100)).slice(0,4);
  for(const entry of spaces){
   try{
    const board=publicSpace(req,entry.handle),profile=localizeProfile(record(board?.profile),locale);
    for(const document of list(board?.content))if(document?.type==='projects')works.push({
     ...document,handle:entry.handle,authorName:profile.name,authorAvatarId:profile.avatarId
    });
   }catch{}
  }
 }catch{}
 return projectLandingContent({posts,spaces,works,locale,communityUnavailable});
}
