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
  let timer:ReturnType<typeof setTimeout>|undefined,hovered:HTMLAnchorElement|null=null;
  const cancel=()=>{clearTimeout(timer);timer=undefined;hovered=null;};
  const warm=(link:HTMLAnchorElement)=>{
   const connection=(navigator as Navigator&{connection?:Connection}).connection;
   if(connection?.saveData||['slow-2g','2g','3g'].includes(connection?.effectiveType||''))return;
   if(!link.matches(mainNavigation)||link.target&&link.target!=='_self'||link.hasAttribute('download'))return;
   let url:URL;try{url=new URL(link.href,location.href);}catch{return;}
   if(url.origin!==location.origin||!destinations.has(url.pathname)||url.search||url.hash||url.pathname===location.pathname+location.search)return;
   const time=Date.now(),previous=warmed.get(url.pathname);
   if(previous!==undefined&&time-previous<30000)return;
   try{router.prefetch(url.pathname);warmed.set(url.pathname,time);}catch{}
  };
  const prepare=(event:Event)=>{
   const input=event as PointerEvent;
   if(event.defaultPrevented||input.metaKey||input.ctrlKey||input.shiftKey||input.altKey)return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!link?.matches(mainNavigation))return;
   if(event.type!=='pointerover'){cancel();warm(link);return;}
   if(link===hovered)return;
   cancel();hovered=link;
   timer=setTimeout(()=>{cancel();warm(link);},120);
  };
  const leave=(event:PointerEvent)=>{if(hovered&&!(event.relatedTarget instanceof Element&&event.relatedTarget.closest('a[href]')===hovered))cancel();};
  const navigation=(event:Event)=>{if((event as CustomEvent<{pending:boolean}>).detail?.pending)cancel();};
  document.addEventListener('pointerover',prepare,{passive:true});
  document.addEventListener('pointerout',leave,{passive:true});
  document.addEventListener('pointerdown',cancel,{passive:true});
  document.addEventListener('focusin',prepare);
  document.addEventListener('touchstart',prepare,{passive:true});
  window.addEventListener('iavse-navigation-pending',navigation);
  return()=>{cancel();document.removeEventListener('pointerover',prepare);document.removeEventListener('pointerout',leave);document.removeEventListener('pointerdown',cancel);document.removeEventListener('focusin',prepare);document.removeEventListener('touchstart',prepare);window.removeEventListener('iavse-navigation-pending',navigation);};
 },[router]);
 return null;
}
