'use client';

import {useLayoutEffect,useRef} from 'react';

const destinations=['feed','members','bookmarks','notifications','me'];
const slotFor=(active:string)=>Math.max(0,destinations.indexOf(['account','posts','profile','following'].includes(active)?'me':active));
// A route may replace PublicFrame. Carry the visible lens position into that
// next frame, rather than restarting its travel at the old tab's centre.
let handoff:{position:number;at:number}|null=null;

export function useLiquidCommunityNav(active:string){
 const ref=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const nav=ref.current,lens=nav?.querySelector<HTMLElement>('.feed-liquid-lens');if(!nav||!lens)return;
  const mobile=matchMedia('(max-width:767px)'),quiet=matchMedia('(prefers-reduced-motion:reduce)');
  let animation:Animation|null=null,selected=slotFor(active),disposed=false,lastWidth=nav.getBoundingClientRect().width;
  const tabs=()=>destinations.map(key=>key==='me'?nav.querySelector<HTMLElement>('.feed-mobile-account>summary'):nav.querySelector<HTMLElement>(':scope>a[data-nav-key="'+key+'"]'));
  const currentPosition=()=>{const n=nav.getBoundingClientRect(),l=lens.getBoundingClientRect();return n.width?(l.left-n.left)/n.width:0;};
  const place=(index:number,animate=true,from?:number)=>{
   if(disposed||!mobile.matches)return;
   const nodes=tabs(),tab=nodes[index];if(!tab)return;
   const n=nav.getBoundingClientRect(),r=tab.getBoundingClientRect(),end=r.left-n.left+2,width=Math.max(0,r.width-4),start=(from??currentPosition())*n.width;
   animation?.cancel();animation=null;
   lens.style.width=width+'px';lens.style.transform='translate3d('+end+'px,0,0)';
   nodes.forEach((node,i)=>node?.toggleAttribute('data-liquid-selected',i===index));
   nav.dataset.liquidReady='true';
   if(animate&&!quiet.matches&&Math.abs(end-start)>.5&&typeof lens.animate==='function'){
    animation=lens.animate([{transform:'translate3d('+start+'px,0,0)'},{transform:'translate3d('+end+'px,0,0)'}],{duration:Math.min(460,200+Math.abs(end-start)*.65),easing:'cubic-bezier(.22,.8,.25,1)',fill:'none'});
    animation.onfinish=()=>{animation=null;};
   }
  };
  const click=(event:MouseEvent)=>{
   const node=event.target instanceof Element?event.target.closest<HTMLElement>('[data-nav-key],.feed-mobile-account>summary'):null;
   if(!node)return;
   const index=node.matches('.feed-mobile-account>summary')?4:destinations.indexOf(node.dataset.navKey||'');
   // Links within the account popover are regular links, never dock targets.
   if(index<0||node.parentElement!==nav&&index!==4)return;
   place(index);
  };
  const toggle=()=>{const account=nav.querySelector<HTMLDetailsElement>('.feed-mobile-account');place(account?.open?4:selected);};
  const resize=()=>{if(mobile.matches)place(selected,false);else{animation?.cancel();animation=null;delete nav.dataset.liquidReady;tabs().forEach(node=>node?.removeAttribute('data-liquid-selected'));}};
  const reduced=()=>{if(quiet.matches){animation?.cancel();animation=null;place(selected,false);}};
  nav.addEventListener('click',click,true);nav.addEventListener('toggle',toggle,true);mobile.addEventListener('change',resize);quiet.addEventListener('change',reduced);
  // ResizeObserver's initial notification is not a resize: it must not cancel
  // the handoff animation just installed by this layout effect.
  const observer=new ResizeObserver(()=>{const width=nav.getBoundingClientRect().width;if(Math.abs(width-lastWidth)<.5)return;lastWidth=width;resize();});observer.observe(nav);
  const previous=handoff&&performance.now()-handoff.at<1200?handoff.position:undefined;handoff=null;
  place(selected,previous!==undefined,previous);
  return()=>{
   if(mobile.matches&&nav.dataset.liquidReady)handoff={position:currentPosition(),at:performance.now()};
   disposed=true;animation?.cancel();observer.disconnect();nav.removeEventListener('click',click,true);nav.removeEventListener('toggle',toggle,true);mobile.removeEventListener('change',resize);quiet.removeEventListener('change',reduced);delete nav.dataset.liquidReady;tabs().forEach(node=>node?.removeAttribute('data-liquid-selected'));
  };
 },[active]);
 return ref;
}
