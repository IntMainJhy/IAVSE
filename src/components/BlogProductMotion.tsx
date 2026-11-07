'use client';

import {useLayoutEffect,useRef,type ReactNode} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

/** Local product-camera moves. The document always keeps its native scroll. */
export function BlogProductMotion({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const element=root.current;if(!element)return;
  gsap.registerPlugin(ScrollTrigger);
  let live=true,canvasUsed=false,settleCanvas:(()=>void)|null=null;
  const media=gsap.matchMedia();
  media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)',context=>{
   // Read all stable scene boxes before applying any camera transform. Restored
   // scroll keeps completed scenes at their visible, server-rendered position.
   const shots=Array.from(element.querySelectorAll<HTMLElement>('[data-film-camera]')).map(shot=>{
    const scene=shot.closest<HTMLElement>('[data-film-scene]')||shot;
    return{shot,scene,kind:shot.dataset.filmCamera,upcoming:scene.getBoundingClientRect().top>window.innerHeight*.18};
   });
   for(const {shot,scene,kind,upcoming}of shots){
    if(!upcoming||!['canvas','look','publish'].includes(kind||'')||kind==='canvas'&&canvasUsed)continue;
    const from=kind==='canvas'?{y:56,scale:.94,rotateX:8,transformPerspective:1600}:kind==='look'?{y:32,rotateY:6,transformPerspective:1600}:{y:32,scale:.97};
    const to=kind==='canvas'?{y:0,scale:1,rotateX:0}:kind==='look'?{y:0,rotateY:0}:{y:0,scale:1};
    const tween=gsap.fromTo(shot,from,{...to,ease:'none',scrollTrigger:{trigger:scene,start:'top 85%',end:'top 18%',scrub:.35}});
    if(kind==='canvas')settleCanvas=()=>context.add(()=>{
     // Capture-phase settlement runs before the canvas measures a drag origin.
     tween.scrollTrigger?.kill(false);tween.kill();gsap.set(shot,{clearProps:'transform'});
    });
   }
   element.dataset.filmMotion='camera';
   return()=>{settleCanvas=null;delete element.dataset.filmMotion;};
  },element);
  const interact=(event:Event)=>{
   if(!live||canvasUsed||!(event.target instanceof Element)||!event.target.closest('[data-film-interactive]'))return;
   canvasUsed=true;settleCanvas?.();settleCanvas=null;
  };
  element.addEventListener('pointerdown',interact,true);element.addEventListener('focusin',interact,true);
  return()=>{live=false;element.removeEventListener('pointerdown',interact,true);element.removeEventListener('focusin',interact,true);media.revert();};
 },[children]);
 return <div ref={root} className="blog-product-film" data-blog-product-film>{children}</div>;
}
