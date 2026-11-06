'use client';

import {useEffect,useRef} from 'react';
import {useRouter} from 'next/navigation';
import {gsap} from 'gsap';
import {mainNavigationDestination,navigationReceivers} from '@/lib/navigation-motion';

/** Route requests start immediately. GSAP owns only the visual handoff. */
export function NavigationTransition(){
 const router=useRouter(),veil=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const layer=veil.current;if(!layer||window.top!==window.self)return;
  const preference=matchMedia('(prefers-reduced-motion:reduce)'),targetCleanups=new Set<()=>void>();
  let cancel:(()=>void)|undefined,arrive:((route:string,root:HTMLElement)=>void)|undefined;
  const begin=(to:string)=>{
   cancel?.();
   const source=document.querySelector<HTMLElement>('[data-motion-route]');
   const from=source?.dataset.motionRoute||location.pathname+location.search;
   const crossesHome=(location.pathname==='/')!==(to==='/');
   // Match the outgoing surface with a cheap painted gradient; no DOM copies,
   // canvas readback, full-page blur or native snapshot that can hold navigation.
   layer.dataset.surface=location.pathname==='/'&&scrollY<innerHeight?'landing':'reading';
   let live=true,committed=false,incoming:gsap.Context|undefined,timer:ReturnType<typeof setTimeout>|undefined;
   const outgoing=gsap.context(()=>{},source||document.body);
   const release=()=>{
    if(!live)return;live=false;clearTimeout(timer);outgoing.revert();incoming?.revert();
    source?.removeAttribute('aria-busy');layer.hidden=true;
    document.documentElement.removeAttribute('data-iavse-transition');cancel=arrive=undefined;
    window.dispatchEvent(new CustomEvent('iavse-navigation-pending',{detail:{pending:false}}));
   };
   cancel=release;
   document.documentElement.setAttribute('data-iavse-transition',to);
   window.dispatchEvent(new CustomEvent('iavse-navigation-pending',{detail:{pending:true}}));
   source?.setAttribute('aria-busy','true');
   outgoing.add(()=>{
    const targets=source?navigationReceivers(source):[];
    const timeline=gsap.timeline({defaults:{ease:'power2.out',overwrite:'auto'}});
    if(targets.length)timeline.to(targets,{opacity:.8,y:-4,duration:.14},0);
    if(crossesHome){layer.hidden=false;timeline.to(layer,{opacity:.16,duration:.14},0);}
   });
   // A failed/redirected response cannot leave dimmed content or suspended scenes.
   timer=setTimeout(release,4000);
   arrive=(route,root)=>{
    if(!live)return;
    // A different committed navigation (filter, footer, redirect) supersedes this
    // handoff. Restore immediately so its own PageMotion arrival can take over.
    if(route!==to){if(route!==from)release();return;}
    if(committed)return;committed=true;
    outgoing.revert();source?.removeAttribute('aria-busy');
    incoming=gsap.context(()=>{
     const targets=navigationReceivers(root,true);
     const timeline=gsap.timeline({defaults:{ease:'power3.out',overwrite:'auto'},onComplete:release});
     if(crossesHome){layer.hidden=false;timeline.fromTo(layer,{opacity:.72},{opacity:0,duration:.32},0);}
     if(targets.length)timeline.fromTo(targets,{opacity:.72,y:10},{opacity:1,y:0,duration:.32,stagger:.025,clearProps:'transform,opacity'},0);
     // Even an empty streamed shell has a bounded handoff and releases renderers.
     if(!crossesHome&&!targets.length)timeline.to(layer,{opacity:0,duration:.16},0);
    },root);
   };
  };
  const click=(event:MouseEvent)=>{
   if(document.hidden||event.defaultPrevented||event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!link)return;
   const to=mainNavigationDestination(link);if(!to||preference.matches)return;
   // Target phase is after every document capture draft guard, before Next Link.
   const navigate=(input:MouseEvent)=>{
    discard();if(input.defaultPrevented)return;
    input.preventDefault();try{begin(to);}catch{cancel?.();}
    // Never wait for RAF, departure completion, snapshots or an animation timer.
    try{router.push(to);}catch{cancel?.();}
   };
   const discard=()=>{link.removeEventListener('click',navigate);clearTimeout(cleanupTimer);targetCleanups.delete(discard);};
   link.addEventListener('click',navigate,{once:true});
   // Native input can checkpoint microtasks between capture and target listeners.
   const cleanupTimer=setTimeout(discard,0);targetCleanups.add(discard);
  };
  const commit=(event:Event)=>{const detail=(event as CustomEvent<{route:string;root:HTMLElement}>).detail;if(detail)arrive?.(detail.route,detail.root);};
  const stop=()=>cancel?.();
  const visibility=()=>{if(document.hidden)stop();};
  document.addEventListener('click',click,true);document.addEventListener('visibilitychange',visibility);
  window.addEventListener('iavse-route-commit',commit);window.addEventListener('popstate',stop);window.addEventListener('iavse-navigation-cancel',stop);
  preference.addEventListener('change',stop);
  return()=>{stop();for(const discard of targetCleanups)discard();document.removeEventListener('click',click,true);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('iavse-route-commit',commit);window.removeEventListener('popstate',stop);window.removeEventListener('iavse-navigation-cancel',stop);preference.removeEventListener('change',stop);};
 },[router]);
 return <div ref={veil} className="iavse-route-veil" hidden aria-hidden="true"/>;
}
