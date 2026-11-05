'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

const links='.organic-header .organic-desktop-nav>a,.organic-header .organic-mobile-menu>nav>a,.organic-header a.organic-brand';
const destinations=new Set(['/','/community','/blogs','/resources']);

/** Short native snapshots bridge different backgrounds without copying live WebGL/DOM. */
export function NavigationTransition(){
 const router=useRouter();
 useEffect(()=>{
  if(typeof document.startViewTransition!=='function'||window.top!==window.self)return;
  const preference=matchMedia('(prefers-reduced-motion:reduce)');
  const targetCleanups=new Set<()=>void>();
  let cancel:(()=>void)|undefined;
  const click=(event:MouseEvent)=>{
   if(preference.matches||document.hidden||event.defaultPrevented||event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!link?.matches(links)||link.target&&link.target!=='_self'||link.hasAttribute('download'))return;
   const url=new URL(link.href,location.href),to=url.pathname;
   if(url.origin!==location.origin||!destinations.has(to)||url.search||url.hash||to===location.pathname+location.search)return;
   // Run at the anchor, after *all* document capture guards and before Next Link.
   // Preventing default in capture would bypass editors' unsaved-draft prompts.
   const navigate=(input:MouseEvent)=>{
    discard();
    if(input.defaultPrevented)return;
    input.preventDefault();cancel?.();
    let live=true,pushed=false,settle!:()=>void,transition:ViewTransition|undefined,timer:ReturnType<typeof setTimeout>|undefined;
    const committed=new Promise<void>(resolve=>{settle=resolve;});
    const observer=new MutationObserver(()=>{
     if(document.querySelector<HTMLElement>('[data-motion-route]')?.dataset.motionRoute===to){observer.disconnect();settle();}
    });
    const release=()=>{
     if(!live)return;live=false;clearTimeout(timer);observer.disconnect();settle();
     document.documentElement.removeAttribute('data-iavse-transition');cancel=undefined;
    };
    const stop=()=>{transition?.skipTransition();release();};cancel=stop;
    document.documentElement.setAttribute('data-iavse-transition','');
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-motion-route']});
    // A slow/failed response must never hold the native snapshot overlay indefinitely.
    timer=setTimeout(()=>{if(!pushed){pushed=true;router.push(to);}stop();},1600);
    try{
     transition=document.startViewTransition(async()=>{
      if(!live)return;pushed=true;router.push(to);await committed;
     });
     // Skipped/interrupted native transitions reject ready; routing still completes.
     void transition.ready.catch(()=>{});
     void transition.finished.then(release,release);
    }catch{stop();if(!pushed)router.push(to);}
   };
   const discard=()=>{link.removeEventListener('click',navigate);clearTimeout(cleanupTimer);targetCleanups.delete(discard);};
   link.addEventListener('click',navigate,{once:true});
   // A guard can stop dispatch before the target is reached. Leave no stale handler.
   // Native input runs microtask checkpoints BETWEEN listeners, before the target.
   const cleanupTimer=setTimeout(discard,0);targetCleanups.add(discard);
  };
  const stop=()=>cancel?.();
  document.addEventListener('click',click,true);
  window.addEventListener('popstate',stop);window.addEventListener('iavse-navigation-cancel',stop);
  preference.addEventListener('change',stop);
  return()=>{stop();for(const discard of targetCleanups)discard();document.removeEventListener('click',click,true);window.removeEventListener('popstate',stop);window.removeEventListener('iavse-navigation-cancel',stop);preference.removeEventListener('change',stop);};
 },[router]);
 return null;
}
