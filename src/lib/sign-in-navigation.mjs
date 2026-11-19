import {internalDestination} from './navigation.mjs';

/** Enhance ordinary local account links while preserving native browser actions.
 * @returns {{next:string,mode:'login'|'join'}|null}
 */
export function signInRequest(link,locationHref){
 if(!link||link.target&&link.target!=='_self'||link.hasAttribute('download'))return null;
 try{
  const current=new URL(locationHref),url=new URL(link.href,current);
  if(url.origin!==current.origin||!/^\/(?:login|join)\/?$/.test(url.pathname)||url.hash||[...url.searchParams.keys()].some(key=>key!=='next'))return null;
  return{next:internalDestination(url.searchParams.get('next'),''),mode:url.pathname.startsWith('/join')?'join':'login'};
 }catch{return null;}
}
