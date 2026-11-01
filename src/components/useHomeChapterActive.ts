'use client';
import {useEffect,useState} from 'react';
import type {RefObject} from 'react';

/** Overlapping sticky chapters intersect the viewport even while their scene is hidden. */
export function useHomeChapterActive(host:RefObject<HTMLElement|null>){
 const [active,setActive]=useState(false);
 useEffect(()=>{
  const chapter=host.current?.closest('[data-home-story]');
  const sync=()=>setActive(!chapter||chapter.getAttribute('aria-hidden')!=='true');
  sync();
  if(!chapter)return;
  const observer=new MutationObserver(sync);
  observer.observe(chapter,{attributes:true,attributeFilter:['aria-hidden']});
  return()=>observer.disconnect();
 },[host]);
 return active;
}
