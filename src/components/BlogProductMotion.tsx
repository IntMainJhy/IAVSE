'use client';

import {useEffect,useRef,type ReactNode} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

/** One local camera entrance per decorative shot; the interactive canvas stays fixed. */
export function BlogProductMotion({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null),seen=useRef(new WeakSet<HTMLElement>());
 useEffect(()=>{
  const element=root.current;if(!element)return;
  gsap.registerPlugin(ScrollTrigger);
  const media=gsap.matchMedia();
  media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)',()=>{
   // Only prepare offscreen art. Refresh/back restoration and media changes must
   // never pull an already-visible window away from its final position.
   const shots=Array.from(element.querySelectorAll<HTMLElement>('[data-film-camera]'))
    .filter(shot=>['look','publish'].includes(shot.dataset.filmCamera||'')&&!seen.current.has(shot))
    .map(shot=>{const scene=shot.closest<HTMLElement>('[data-film-scene]')||shot;return{shot,scene,top:scene.getBoundingClientRect().top};});
   for(const {shot,scene,top}of shots){
    if(top<window.innerHeight){seen.current.add(shot);continue;}
    const look=shot.dataset.filmCamera==='look',remember=()=>{seen.current.add(shot);};
    gsap.fromTo(shot,{y:24,scale:.985,...(look?{rotateY:2,transformPerspective:1600}:{})},{
     y:0,scale:1,...(look?{rotateY:0}:{}),duration:.55,ease:'power2.out',clearProps:'transform',onStart:remember,onComplete:remember,
     scrollTrigger:{trigger:scene,start:'top 92%',end:'top 15%',once:true,fastScrollEnd:true}
    });
   }
   if(shots.some(({top})=>top>=window.innerHeight))element.dataset.filmMotion='camera';
   return()=>{delete element.dataset.filmMotion;};
  },element);
  return()=>{media.revert();};
  // RSC/locale updates change the existing shot contents, not their motion owner.
 },[]);
 return <div ref={root} className="blog-product-film" data-blog-product-film>{children}</div>;
}
