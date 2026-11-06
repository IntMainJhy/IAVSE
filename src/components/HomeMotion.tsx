'use client';
import {useEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {homeScrollRefresh} from '@/lib/home-scroll-refresh';

/** Native page scrolling, with a short, one-time entrance for each section. */
export function HomeMotion(){
 const anchor=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const root=anchor.current?.closest<HTMLElement>('.v2-home');if(!root)return;
  gsap.registerPlugin(ScrollTrigger);
  let reduced=false,live=true,media:ReturnType<typeof gsap.matchMedia>|null=null;
  try{reduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const notify=()=>{if(live)window.dispatchEvent(new Event('iavse-journey-layout'));};
  const refreshWork=homeScrollRefresh(root),refresh=refreshWork.request;
  const stories=Array.from(root.querySelectorAll<HTMLElement>('[data-home-story]'));
  const restore=()=>{delete root.dataset.journeyMotion;};
  const setup=()=>{
   media?.revert();media=null;restore();
   if(!reduced){media=gsap.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{
    root.dataset.journeyMotion='flow';
    stories.forEach(scene=>{
     const art=scene.querySelector<HTMLElement>('.home-story-visual'),copy=scene.querySelector<HTMLElement>('.home-story-copy');
     const interactive=['editor','resources'].includes(scene.dataset.homeStory||'');
     // No pin, scrub or shared stage: the document always follows the user's
     // wheel/touch input. Art and copy arrive together at the viewport edge,
     // with less travel and a softer deceleration; fast scrolling completes them.
     const entrance=gsap.timeline({defaults:{duration:.9,ease:'power2.out'},scrollTrigger:{trigger:scene,start:'top bottom',once:true,fastScrollEnd:true}});
     if(art)entrance.fromTo(art,interactive?{opacity:.78}:{opacity:.78,y:14},interactive?{opacity:1,clearProps:'opacity'}:{opacity:1,y:0,clearProps:'transform,opacity'},0);
     if(copy)entrance.fromTo(copy,{opacity:.78,y:10},{opacity:1,y:0,clearProps:'transform,opacity'},0);
    });
    const closing=root.querySelector<HTMLElement>('.v2-invitation');
    if(closing)gsap.fromTo(closing,{opacity:.78,y:14},{opacity:1,y:0,duration:.9,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:closing,start:'top bottom',once:true,fastScrollEnd:true}});
    refresh();return restore;
   },root);}
   refresh();notify();
  };
  const control=(event:Event)=>{const d=(event as CustomEvent<{action:string;value:boolean}>).detail;if(d?.action==='reduced'&&reduced!==!!d.value){reduced=!!d.value;setup();}};
  ScrollTrigger.addEventListener('refresh',notify);window.addEventListener('iavse-scene-control',control);
  const images=Array.from(root.querySelectorAll('img'));images.forEach(i=>i.addEventListener('load',refresh));document.fonts?.ready.then(refresh);setup();
  return()=>{
   live=false;refreshWork.dispose();
   if(root.isConnected)media?.revert();
   else if(media){
    // Reverting a detached page initializes never-played startAt tweens just to
    // restore styles nobody can see. Keep full revert for live/StrictMode trees.
    for(const context of media.contexts){
     const triggers=context.data.filter((entry:unknown)=>entry instanceof ScrollTrigger) as ScrollTrigger[];
     triggers.forEach(trigger=>trigger.kill(false));
     // Context.kill(false) would otherwise call trigger.kill() a second time,
     // whose default performs the expensive revert we are deliberately avoiding.
     context.data=context.data.filter((entry:unknown)=>!triggers.includes(entry as ScrollTrigger));
    }
    media.kill(false);
   }
   restore();ScrollTrigger.removeEventListener('refresh',notify);window.removeEventListener('iavse-scene-control',control);images.forEach(i=>i.removeEventListener('load',refresh));
  };
 },[]);
 return <span ref={anchor} hidden aria-hidden="true"/>;
}
