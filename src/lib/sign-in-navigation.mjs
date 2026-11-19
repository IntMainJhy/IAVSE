import {internalDestination} from './navigation.mjs';

/** Enhance ordinary local login links while preserving native browser actions. */
export function signInRequest(link,locationHref){
 if(!link||link.target&&link.target!=='_self'||link.hasAttribute('download'))return null;
 try{
  const current=new URL(locationHref),url=new URL(link.href,current);
  if(url.origin!==current.origin||!/^\/login\/?$/.test(url.pathname)||url.hash||[...url.searchParams.keys()].some(key=>key!=='next'))return null;
  return{next:internalDestination(url.searchParams.get('next'),'')};
 }catch{return null;}
}
