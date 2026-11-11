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
  const registered=new Set<HTMLElement>(),pending=new Set<HTMLElement>(),focused=new Set<HTMLElement>(),animations=new Map<HTMLElement,Animation>();
  let disposed=false;
  const clear=(node:HTMLElement)=>{node.removeAttribute('data-rbp-reveal');pending.delete(node);};
  const release=(node:HTMLElement)=>{const animation=animations.get(node);animations.delete(node);animation?.cancel();clear(node);};
  const outside=(node:HTMLElement)=>{
   const rect=node.getBoundingClientRect();let x=0,y=0;
   if(animations.has(node)){
    const transform=getComputedStyle(node).transform;
    if(transform!=='none'&&typeof DOMMatrixReadOnly!=='undefined'){const matrix=new DOMMatrixReadOnly(transform);x=matrix.m41;y=matrix.m42;}
   }
   return rect.bottom-y<=0||rect.top-y>=window.innerHeight||rect.right-x<=0||rect.left-x>=window.innerWidth;
  };
  const owner=(target:Element|null)=>{for(let node=target as HTMLElement|null;node;node=node.parentElement)if(registered.has(node))return node;return null;};
  // Only a complete exit from the physical viewport arms the next entrance.
  // The entry observer's inset and threshold must not hide a still-visible chunk.
  const rearm=(node:HTMLElement)=>{
   if(disposed||!registered.has(node)||!outside(node))return;
   release(node);
   if(media.matches||!node.animate||focused.has(node))return;
   node.dataset.rbpReveal='pending';pending.add(node);
  };
  const show=(node:HTMLElement,index=0)=>{
   if(disposed||!pending.has(node)||outside(node))return;
   pending.delete(node);
   if(media.matches||!node.animate){clear(node);return;}
   node.dataset.rbpReveal='running';
   const animation=node.animate([{opacity:0,transform:`translateY(${RBP_MOTION.distance}px)`},{opacity:1,transform:'translateY(0)'}],{duration:RBP_MOTION.applicationDuration,delay:revealDelay(index),easing:RBP_MOTION.cssEase,fill:'both'});
   animations.set(node,animation);
   animation.finished.catch(()=>{}).finally(()=>{if(!disposed&&animations.get(node)===animation){release(node);rearm(node);}});
  };
  const observer=new IntersectionObserver(entries=>{
   if(disposed)return;
   for(const entry of entries)rearm(entry.target as HTMLElement);
   const groups=new Map<Element|null,number>();
   entries.filter(e=>e.isIntersecting&&pending.has(e.target as HTMLElement)).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left).forEach(entry=>{
    const node=entry.target as HTMLElement,group=node.closest(GROUP)||node.closest(SCOPE),index=groups.get(group)||0;
    groups.set(group,index+1);show(node,index);
   });
  },{threshold:RBP_MOTION.threshold,rootMargin:RBP_MOTION.margin});
  const viewport=new IntersectionObserver(entries=>{
   if(disposed)return;
   for(const entry of entries)rearm(entry.target as HTMLElement);
  },{threshold:0,rootMargin:'0px'});
  // A translated edge chunk may already be outside the observer root before
  // scrolling moves its layout out. Check active animations on that scroll too.
  let exitFrame=0;
  const activeExit=()=>{if(!exitFrame&&animations.size)exitFrame=requestAnimationFrame(()=>{exitFrame=0;if(!disposed)for(const node of animations.keys())rearm(node);});};
  const prepare=(node:HTMLElement)=>{
    if(registered.has(node)||owner(node.parentElement)||node.closest(CONTENT)||node.closest('[data-rbp-reveal]')||node.parentElement?.closest(ITEM))return;
    const rect=node.getBoundingClientRect();if(!rect.width||!rect.height)return;
    registered.add(node);observer.observe(node);viewport.observe(node);
    if(node.contains(document.activeElement))focused.add(node);
    if(media.matches||!node.animate||focused.has(node))return;
    node.dataset.rbpReveal='pending';pending.add(node);
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
  const reduce=()=>{for(const node of registered)if(media.matches)release(node);else rearm(node);};
  const focus=(e:FocusEvent)=>{const node=owner(e.target as Element);if(node){focused.add(node);release(node);}};
  const blur=(e:FocusEvent)=>{const node=owner(e.target as Element);if(node&&!node.contains(e.relatedTarget as Node|null)){focused.delete(node);rearm(node);}};
  media.addEventListener('change',reduce);document.addEventListener('focusin',focus);document.addEventListener('focusout',blur);window.addEventListener('scroll',activeExit,{passive:true,capture:true});window.addEventListener('resize',activeExit,{passive:true});
  return()=>{disposed=true;cancelAnimationFrame(frame);cancelAnimationFrame(exitFrame);changes.disconnect();observer.disconnect();viewport.disconnect();media.removeEventListener('change',reduce);document.removeEventListener('focusin',focus);document.removeEventListener('focusout',blur);window.removeEventListener('scroll',activeExit,true);window.removeEventListener('resize',activeExit);for(const node of registered)release(node);};
 },[path,query]);
 return null;
}
