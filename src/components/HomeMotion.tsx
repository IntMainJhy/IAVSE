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
     // wheel/touch input. Start partly visible, and never replay on scroll back.
     const entrance=gsap.timeline({defaults:{duration:.7,ease:'power3.out'},scrollTrigger:{trigger:scene,start:'top 94%',once:true}});
     if(art)entrance.fromTo(art,interactive?{opacity:.72}:{opacity:.72,y:24},interactive?{opacity:1,clearProps:'opacity'}:{opacity:1,y:0,clearProps:'transform,opacity'},0);
     if(copy)entrance.fromTo(copy,{opacity:.6,y:18},{opacity:1,y:0,clearProps:'transform,opacity'},.08);
    });
    const closing=root.querySelector<HTMLElement>('.v2-invitation');
    if(closing)gsap.fromTo(closing,{opacity:.7,y:20},{opacity:1,y:0,duration:.7,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:closing,start:'top 94%',once:true}});
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
