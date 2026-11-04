'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

const destinations=new Set(['/','/community','/blogs','/resources']);
const mainNavigation='.organic-header .organic-desktop-nav>a,.organic-header .organic-mobile-menu>nav>a';
type Connection={saveData?:boolean;effectiveType?:string};

/** Warm only a chosen public destination, leaving clicks and draft guards alone. */
export function NavigationIntent(){
 const router=useRouter();
 useEffect(()=>{
  // Four possible keys bound this map; a later visit may refresh stale data.
  const warmed=new Map<string,number>();
  const prepare=(event:Event)=>{
   const input=event as PointerEvent;
   if(event.defaultPrevented||input.metaKey||input.ctrlKey||input.shiftKey||input.altKey)return;
   const connection=(navigator as Navigator&{connection?:Connection}).connection;
   if(connection?.saveData||['slow-2g','2g','3g'].includes(connection?.effectiveType||''))return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!link?.matches(mainNavigation)||link.target&&link.target!=='_self'||link.hasAttribute('download'))return;
   let url:URL;try{url=new URL(link.href,location.href);}catch{return;}
   if(url.origin!==location.origin||!destinations.has(url.pathname)||url.search||url.hash||url.pathname===location.pathname+location.search)return;
   const time=Date.now(),previous=warmed.get(url.pathname);
   if(previous!==undefined&&time-previous<30000)return;
   try{router.prefetch(url.pathname);warmed.set(url.pathname,time);}catch{}
  };
  document.addEventListener('pointerover',prepare,{passive:true});
  document.addEventListener('focusin',prepare);
  document.addEventListener('touchstart',prepare,{passive:true});
  return()=>{document.removeEventListener('pointerover',prepare);document.removeEventListener('focusin',prepare);document.removeEventListener('touchstart',prepare);};
 },[router]);
 return null;
}
