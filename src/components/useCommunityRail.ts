'use client';

import {useEffect,useRef} from 'react';

/** Shorten the navigation's scroll area before its containing block reaches the
 * footer. Native sticky positioning can then keep the first link below chrome. */
export function useCommunityRail(){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{
  const rail=ref.current,shell=rail?.closest<HTMLElement>('.community-navigation-shell');
  if(!rail||!shell)return;
  const desktop=matchMedia('(min-width:768px)');
  let frame=0,last=-1;
  const measure=()=>{
   frame=0;
   if(!desktop.matches){rail.style.removeProperty('--community-rail-height');last=-1;return;}
   const top=parseFloat(getComputedStyle(rail).top)||96;
   const available=Math.max(80,Math.floor(Math.min(innerHeight-16,shell.getBoundingClientRect().bottom)-top));
   if(available!==last){rail.style.setProperty('--community-rail-height',available+'px');last=available;}
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};
  const observer=new ResizeObserver(schedule);observer.observe(shell);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);desktop.addEventListener('change',schedule);schedule();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);desktop.removeEventListener('change',schedule);rail.style.removeProperty('--community-rail-height');};
 },[]);
 return ref;
}
