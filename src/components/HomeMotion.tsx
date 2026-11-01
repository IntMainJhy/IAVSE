'use client';

import {useEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

/** A native-scroll edit: approach, a long readable hold, then a handoff. */
export function HomeMotion(){
 const anchor=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const root=anchor.current?.closest<HTMLElement>('.v2-home');if(!root)return;
  gsap.registerPlugin(ScrollTrigger);
  let manualReduced=false,live=true,refreshFrame=0,media:ReturnType<typeof gsap.matchMedia>|null=null;
  try{manualReduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const notify=()=>{if(live)window.dispatchEvent(new Event('iavse-journey-layout'));};
  const refresh=()=>{if(live&&!refreshFrame)refreshFrame=requestAnimationFrame(()=>{refreshFrame=0;if(live)ScrollTrigger.refresh();});};
  const setup=()=>{
   media?.revert();media=null;delete root.dataset.journeyMotion;
   if(!manualReduced){
    media=gsap.matchMedia();
    media.add({desktop:'(min-width:1001px) and (min-height:720px)',compact:'(max-width:1000px), (max-height:719px)',reduce:'(prefers-reduced-motion: reduce)'},match=>{
     if(match.conditions!.reduce)return;
     const desktop=!!match.conditions!.desktop;let active=true;
     root.dataset.journeyMotion='full';
     const stories=Array.from(root.querySelectorAll<HTMLElement>('[data-home-story]'));
     for(const [index,scene] of stories.entries()){
      const side=scene.dataset.homeSide==='right'?1:-1,id=scene.dataset.homeStory||String(index);
      const art=scene.querySelector<HTMLElement>('.home-story-visual'),copy=scene.querySelector<HTMLElement>('.home-story-copy');
      const interactive=id==='editor'||id==='resources';
      const timeline=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'iavse-story-'+id,trigger:scene,start:desktop?'top 90%':'top 95%',end:desktop?'bottom 12%':'bottom 12%',scrub:.3,invalidateOnRefresh:true,onToggle:self=>{
       if(!active)return;if(self.isActive)scene.dataset.journeyActive='true';else delete scene.dataset.journeyActive;
      }}});
      // Keep pointer coordinates exact in the real editor and Fiber canvas.
      // The shared WebGL journey supplies their spatial motion behind the UI.
      if(art){
       if(interactive)timeline.fromTo(art,{opacity:.92,'--journey-focus':.2},{opacity:1,'--journey-focus':1,duration:.24,immediateRender:false},0).to(art,{opacity:.94,'--journey-focus':.35,duration:.20},.80);
       else timeline.fromTo(art,{x:desktop?side*64:0,y:desktop?48:22,z:desktop?-120:0,rotationY:desktop?-side*6:0,rotationX:desktop?2.5:0,scale:desktop?.965:1,opacity:.84,transformPerspective:1600,transformOrigin:'center center'},{x:0,y:0,z:0,rotationY:0,rotationX:0,scale:1,opacity:1,duration:.24,immediateRender:false},0).to(art,{x:desktop?-side*18:0,y:desktop?-28:-12,z:desktop?-40:0,rotationY:desktop?side*2:0,scale:desktop?.99:1,opacity:.90,duration:.20},.80);
      }
      if(copy)timeline.fromTo(copy,{x:desktop?-side*26:0,y:desktop?32:16,opacity:.76},{x:0,y:0,opacity:1,duration:.25,immediateRender:false},.03).to(copy,{y:desktop?-30:-12,opacity:.68,duration:.20},.80);
     }
     const closing=root.querySelector<HTMLElement>('[data-home-scene="invitation"]');
     if(closing){
      const title=closing.querySelector('h2'),actions=closing.querySelector(':scope > div');
      const end=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'iavse-story-invitation',trigger:closing,start:'top 92%',end:'top 42%',scrub:.35,invalidateOnRefresh:true}});
      if(title)end.fromTo(title,{y:desktop?40:20,opacity:.78},{y:0,opacity:1,duration:1,immediateRender:false},0);
      if(actions)end.fromTo(actions,{y:12,opacity:.82},{y:0,opacity:1,duration:.7,immediateRender:false},.3);
     }
     refresh();
     return()=>{active=false;delete root.dataset.journeyMotion;for(const scene of stories)delete scene.dataset.journeyActive;};
    },root);
   }
   refresh();notify();
  };
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action?:string;value?:boolean}>).detail;if(detail?.action!=='reduced')return;const next=!!detail.value;if(next!==manualReduced){manualReduced=next;setup();}};
  ScrollTrigger.addEventListener('refresh',notify);window.addEventListener('iavse-scene-control',control);
  const images=Array.from(root.querySelectorAll('img'));images.forEach(image=>image.addEventListener('load',refresh,{once:true}));document.fonts?.ready.then(refresh);
  setup();
  return()=>{live=false;cancelAnimationFrame(refreshFrame);ScrollTrigger.removeEventListener('refresh',notify);window.removeEventListener('iavse-scene-control',control);images.forEach(image=>image.removeEventListener('load',refresh));media?.revert();delete root.dataset.journeyMotion;};
 },[]);
 return <span ref={anchor} hidden aria-hidden="true"/>;
}
