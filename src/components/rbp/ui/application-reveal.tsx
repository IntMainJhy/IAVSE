'use client';
import {useEffect} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {RBP_MOTION,revealDelay} from '@/lib/rbp-motion.mjs';

// Enhance existing operation layouts without wrapping or moving form controls.
const TARGETS='h1,.page-head,.catalog-page-heading,.resource-card,.skill-directory-card,.skill-grid-card,.design-card,.feed-post,.feed-empty,.feed-suggestions,.admin-focus-recent,.admin-focus-review,.admin-focus-statistics,.account-section,.space-panel,.learning-card';
const CONTENT='.space-root,.bd-block,.anx-portfolio,.personal-homepage,.react-flow__viewport,[contenteditable=true],[data-rbp-entry]';
export function ApplicationReveal(){
 const path=usePathname(),query=useSearchParams().toString();
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  if(!('IntersectionObserver' in window))return;
  const seen=new WeakSet<Element>(),pending=new Set<HTMLElement>(),animations=new Map<HTMLElement,Animation>();
  const clear=(node:HTMLElement)=>{node.removeAttribute('data-rbp-reveal');pending.delete(node);};
  const show=(node:HTMLElement,index=0)=>{
   pending.delete(node);observer.unobserve(node);
   if(media.matches||!node.animate){clear(node);return;}
   node.dataset.rbpReveal='running';
   const animation=node.animate([{opacity:0,transform:`translateY(${RBP_MOTION.distance}px)`},{opacity:1,transform:'translateY(0)'}],{duration:RBP_MOTION.applicationDuration,delay:revealDelay(index),easing:RBP_MOTION.cssEase,fill:'both'});
   animations.set(node,animation);
   animation.finished.catch(()=>{}).finally(()=>{clear(node);animations.delete(node);animation.cancel();});
  };
  const observer=new IntersectionObserver(entries=>{
   entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left).forEach((entry,i)=>show(entry.target as HTMLElement,i));
  },{threshold:RBP_MOTION.threshold,rootMargin:RBP_MOTION.margin});
  const scan=()=>{
   document.querySelectorAll<HTMLElement>('.rbp-application').forEach(root=>root.querySelectorAll<HTMLElement>(TARGETS).forEach(node=>{
    if(seen.has(node)||node.closest(CONTENT)||node.closest('[data-rbp-reveal]'))return;
    seen.add(node);
    if(media.matches)return;
    const rect=node.getBoundingClientRect();if(!rect.width||!rect.height)return;
    node.dataset.rbpReveal='pending';pending.add(node);observer.observe(node);
   }));
  };
  let frame=0;
  const changes=new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length)&&!frame)frame=requestAnimationFrame(()=>{frame=0;scan();});});
  changes.observe(document.body,{childList:true,subtree:true});scan();
  const reduce=()=>{if(media.matches){for(const node of pending){observer.unobserve(node);clear(node);}for(const [node,animation] of animations){animation.cancel();clear(node);}}};
  const focus=(e:FocusEvent)=>{const node=(e.target as Element)?.closest<HTMLElement>('[data-rbp-reveal]');if(node){animations.get(node)?.cancel();observer.unobserve(node);clear(node);}};
  media.addEventListener('change',reduce);document.addEventListener('focusin',focus);
  return()=>{cancelAnimationFrame(frame);changes.disconnect();observer.disconnect();media.removeEventListener('change',reduce);document.removeEventListener('focusin',focus);for(const node of pending)clear(node);for(const [node,animation] of animations){animation.cancel();clear(node);}};
 },[path,query]);
 return null;
}
