'use client';
import {useLayoutEffect,useRef} from 'react';

export function CatalogNavigation({active,label,children,className='resource-hub-tabs'}:{active:string;label:string;children:React.ReactNode;className?:string}){
 const root=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const nav=root.current;if(!nav)return;
  const reveal=()=>{
   const selected=nav.querySelector<HTMLElement>('[aria-current]');if(!selected)return;
   const frame=nav.getBoundingClientRect(),tab=selected.getBoundingClientRect();
   if(tab.left<frame.left)nav.scrollLeft+=tab.left-frame.left-5;
   else if(tab.right>frame.right)nav.scrollLeft+=tab.right-frame.right+5;
  };
  reveal();const observer=new ResizeObserver(reveal);observer.observe(nav);return()=>observer.disconnect();
 },[active]);
 return <nav ref={root} className={className} aria-label={label}>{children}</nav>;
}
