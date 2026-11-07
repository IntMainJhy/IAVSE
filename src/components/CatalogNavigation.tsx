'use client';
import {useLayoutEffect,useRef} from 'react';

export function CatalogNavigation({active,label,children,className='resource-hub-tabs'}:{active:string;label:string;children:React.ReactNode;className?:string}){
 const root=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const nav=root.current;if(!nav)return;
  let frame=0,live=true;
  const reveal=()=>{
   if(!live||nav.scrollWidth<=nav.clientWidth)return;
   const selected=nav.querySelector<HTMLElement>('[aria-current]');if(!selected)return;
   const bounds=nav.getBoundingClientRect(),tab=selected.getBoundingClientRect();
   const delta=tab.left<bounds.left?tab.left-bounds.left-5:tab.right>bounds.right?tab.right-bounds.right+5:0;
   if(Math.abs(delta)>.5)nav.scrollLeft+=delta;
  };
  // Reveal the committed choice before paint; defer resize bursts to one read/write frame.
  reveal();
  const observer=new ResizeObserver(()=>{if(live&&!frame)frame=requestAnimationFrame(()=>{frame=0;reveal();});});
  observer.observe(nav);const selected=nav.querySelector<HTMLElement>('[aria-current]');if(selected)observer.observe(selected);
  return()=>{live=false;cancelAnimationFrame(frame);observer.disconnect();};
 },[active,label,children]);
 return <nav ref={root} className={className} aria-label={label}>{children}</nav>;
}
