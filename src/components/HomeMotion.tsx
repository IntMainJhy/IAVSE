'use client';
import {useEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {homeScrollRefresh} from '@/lib/home-scroll-refresh';

/** Native page scrolling, with a short, one-time entrance for each product target. */
export function HomeMotion({layoutKey}:{layoutKey?:string}={}){
 const anchor=useRef<HTMLSpanElement>(null),refreshOnLayout=useRef<(()=>void)|null>(null);
 useEffect(()=>{
  const root=anchor.current?.closest<HTMLElement>('.v2-home');if(!root)return;
  gsap.registerPlugin(ScrollTrigger);
  let reduced=false,live=true,hasEntrances=false,media:ReturnType<typeof gsap.matchMedia>|null=null;
  try{reduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const notify=()=>{if(live)window.dispatchEvent(new Event('iavse-journey-layout'));};
  const refreshWork=homeScrollRefresh(root),refresh=()=>{if(hasEntrances)refreshWork.request();};
  refreshOnLayout.current=()=>{if(hasEntrances)refreshWork.request(true);};
  const stories=Array.from(root.querySelectorAll<HTMLElement>('[data-home-story]'));
  const restore=()=>{hasEntrances=false;delete root.dataset.journeyMotion;};
  const setup=()=>{
   media?.revert();media=null;restore();
   if(!reduced){media=gsap.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{
    // Batch visibility reads before GSAP writes any start values. Restored or
    // already-visible content keeps its server-rendered state.
    const viewportHeight=window.innerHeight,upcoming:{element:HTMLElement;travel:number|null}[]=[];
    stories.forEach(scene=>{
     const art=scene.querySelector<HTMLElement>('.home-story-visual'),copy=scene.querySelector<HTMLElement>('.home-story-copy');
     const interactive=['editor','resources'].includes(scene.dataset.homeStory||'');
     if(art&&art.getBoundingClientRect().top>=viewportHeight)upcoming.push({element:art,travel:interactive?null:14});
     if(copy&&copy.getBoundingClientRect().top>=viewportHeight)upcoming.push({element:copy,travel:10});
    });
    const closing=root.querySelector<HTMLElement>('.v2-invitation'),closingUpcoming=closing&&closing.getBoundingClientRect().top>=viewportHeight;
    root.dataset.journeyMotion='flow';
    upcoming.forEach(({element,travel})=>{
     // No pin, scrub or shared stage: the document always follows the user's
     // wheel/touch input. Stacked art and copy each arrive at their own edge;
     // interactive surfaces retain ownership of their coordinate transforms.
     const entrance=gsap.timeline({paused:true,defaults:{duration:.9,ease:'power2.out'}});
     entrance.fromTo(element,travel===null?{opacity:.78}:{opacity:.78,y:travel},travel===null?{opacity:1,clearProps:'opacity'}:{opacity:1,y:0,clearProps:'transform,opacity'},0);
     // Attach only after the timeline is populated. An empty timeline's deferred
     // refresh can remove earlier `once` triggers while GSAP iterates that list.
     ScrollTrigger.create({animation:entrance,trigger:element,start:'top bottom',once:true,fastScrollEnd:true});hasEntrances=true;
    });
    if(closing&&closingUpcoming){gsap.fromTo(closing,{opacity:.78,y:14},{opacity:1,y:0,duration:.9,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:closing,start:'top bottom',once:true,fastScrollEnd:true}});hasEntrances=true;}
    refresh();return restore;
   },root);}
   refresh();notify();
  };
  const control=(event:Event)=>{const d=(event as CustomEvent<{action:string;value:boolean}>).detail;if(d?.action==='reduced'&&reduced!==!!d.value){reduced=!!d.value;setup();}};
  ScrollTrigger.addEventListener('refresh',notify);window.addEventListener('iavse-scene-control',control);
  const images=Array.from(root.querySelectorAll('img'));images.forEach(i=>i.addEventListener('load',refresh));document.fonts?.ready.then(refresh);setup();
  return()=>{
   live=false;refreshOnLayout.current=null;refreshWork.dispose();
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
 // Server locale changes commit new text geometry without remounting this owner.
 useEffect(()=>{refreshOnLayout.current?.();},[layoutKey]);
 return <span ref={anchor} hidden aria-hidden="true"/>;
}
