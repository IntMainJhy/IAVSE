'use client';
import {useEffect} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {RBP_MOTION,revealDelay} from '@/lib/rbp-motion.mjs';

// Enhance existing operation layouts without wrapping or moving form controls.
const TARGETS='h1,.page-head,.catalog-page-heading,.resource-card,.skill-directory-card,.skill-grid-card,.design-card,.feed-post,.feed-empty,.feed-suggestions,.admin-focus-recent,.admin-focus-review,.admin-focus-statistics,.account-section,.space-panel,.learning-card';
const CONTENT='.space-root,.bd-block,.anx-portfolio,.personal-homepage,.react-flow__viewport,[contenteditable=true],[data-rbp-entry]';
const SCOPE='[data-rbp-reveal-scope]',ITEM='[data-rbp-reveal-item]',GROUP='[data-rbp-reveal-group]';
export function ApplicationReveal(){
 const path=usePathname(),query=useSearchParams().toString();
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  if(!('IntersectionObserver' in window))return;
  const seen=new WeakSet<Element>(),pending=new Set<HTMLElement>(),animations=new Map<HTMLElement,Animation>();
  let disposed=false;
  const clear=(node:HTMLElement)=>{node.removeAttribute('data-rbp-reveal');pending.delete(node);};
  const release=(node:HTMLElement)=>{observer.unobserve(node);const animation=animations.get(node);animations.delete(node);animation?.cancel();clear(node);};
  const show=(node:HTMLElement,index=0)=>{
   if(disposed||!pending.has(node))return;
   pending.delete(node);observer.unobserve(node);
   if(media.matches||!node.animate){clear(node);return;}
   node.dataset.rbpReveal='running';
   const animation=node.animate([{opacity:0,transform:`translateY(${RBP_MOTION.distance}px)`},{opacity:1,transform:'translateY(0)'}],{duration:RBP_MOTION.applicationDuration,delay:revealDelay(index),easing:RBP_MOTION.cssEase,fill:'both'});
   animations.set(node,animation);
   animation.finished.catch(()=>{}).finally(()=>{if(!disposed&&animations.get(node)===animation)release(node);});
  };
  const observer=new IntersectionObserver(entries=>{
   const groups=new Map<Element|null,number>();
   entries.filter(e=>e.isIntersecting&&pending.has(e.target as HTMLElement)).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left).forEach(entry=>{
    const node=entry.target as HTMLElement,group=node.closest(GROUP)||node.closest(SCOPE),index=groups.get(group)||0;
    groups.set(group,index+1);show(node,index);
   });
  },{threshold:RBP_MOTION.threshold,rootMargin:RBP_MOTION.margin});
  const prepare=(node:HTMLElement)=>{
    if(seen.has(node)||node.closest(CONTENT)||node.closest('[data-rbp-reveal]')||node.parentElement?.closest(ITEM))return;
    const rect=node.getBoundingClientRect();if(!rect.width||!rect.height)return;
    seen.add(node);
    if(media.matches||!node.animate||node.contains(document.activeElement))return;
    node.dataset.rbpReveal='pending';pending.add(node);observer.observe(node);
  };
  const scan=()=>{
   if(disposed)return;
   document.querySelectorAll<HTMLElement>('.rbp-application').forEach(root=>root.querySelectorAll<HTMLElement>(TARGETS).forEach(prepare));
   // Product stories opt in readable chunks, rather than hiding tall sections or authored art.
   document.querySelectorAll<HTMLElement>(SCOPE).forEach(root=>root.querySelectorAll<HTMLElement>(ITEM).forEach(node=>{if(node.closest(SCOPE)===root)prepare(node);}));
  };
  let frame=0;
  const changes=new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length)&&!frame)frame=requestAnimationFrame(()=>{frame=0;scan();});});
  changes.observe(document.body,{childList:true,subtree:true});scan();
  const reduce=()=>{if(media.matches){for(const node of pending)release(node);for(const node of animations.keys())release(node);}};
  const focus=(e:FocusEvent)=>{const node=(e.target as Element)?.closest<HTMLElement>('[data-rbp-reveal]');if(node)release(node);};
  media.addEventListener('change',reduce);document.addEventListener('focusin',focus);
  return()=>{disposed=true;cancelAnimationFrame(frame);changes.disconnect();observer.disconnect();media.removeEventListener('change',reduce);document.removeEventListener('focusin',focus);for(const node of pending)release(node);for(const node of animations.keys())release(node);};
 },[path,query]);
 return null;
}
