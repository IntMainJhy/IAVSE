'use client';
import {useEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {homeScrollRefresh} from '@/lib/home-scroll-refresh';

/** One scrollable film stage; native document flow remains the no-motion fallback. */
export function HomeMotion(){
 const anchor=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const root=anchor.current?.closest<HTMLElement>('.v2-home');if(!root)return;
  gsap.registerPlugin(ScrollTrigger);
  let reduced=false,live=true,media:ReturnType<typeof gsap.matchMedia>|null=null;
  try{reduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const notify=()=>{if(live)window.dispatchEvent(new Event('iavse-journey-layout'));};
  const refreshWork=homeScrollRefresh(root),refresh=refreshWork.request;
  const stories=Array.from(root.querySelectorAll<HTMLElement>('[data-home-story]')),track=root.querySelector<HTMLElement>('.home-stories');
  const links=Array.from(root.querySelectorAll<HTMLAnchorElement>('.home-scene-nav a'));
  const restore=()=>{delete root.dataset.journeyMotion;for(const s of stories){s.inert=false;s.removeAttribute('aria-hidden');delete s.dataset.journeyActive;}links.forEach(a=>a.removeAttribute('aria-current'));};
  const setup=()=>{
   media?.revert();media=null;restore();
   if(!reduced){media=gsap.matchMedia();media.add({desktop:'(min-width:1001px) and (min-height:720px)',compact:'(max-width:1000px), (max-height:719px)',reduce:'(prefers-reduced-motion: reduce)'},match=>{
    if(match.conditions!.reduce)return;
    const desktop=!!match.conditions!.desktop;root.dataset.journeyMotion=desktop?'cinema':'flow';
    if(desktop&&track){
     const last=stories.length-1;
     const activate=(time:number)=>{
      if(root.dataset.journeyMotion!=='cinema')return;
      const current=Math.max(0,Math.min(last,Math.floor(time)));
      if(stories[current]?.dataset.journeyActive==='true')return;
      stories.forEach((s,i)=>{s.inert=i!==current;s.setAttribute('aria-hidden',String(i!==current));s.dataset.journeyActive=String(i===current);});
      links.forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
     };
     activate(0);
     // The scrubbed playhead owns visual and interaction state together. Raw
     // scroll progress can run ahead while the film is still catching up.
     const timeline=gsap.timeline({defaults:{ease:'power1.inOut'},onUpdate:function(){activate(this.time());},scrollTrigger:{id:'iavse-story-film',trigger:track,start:'top top',end:'bottom bottom',scrub:.5}});
     stories.forEach((scene,i)=>{
      const art=scene.querySelector<HTMLElement>('.home-story-visual'),copy=scene.querySelector<HTMLElement>('.home-story-copy'),interactive=['editor','resources'].includes(scene.dataset.homeStory||'');
      gsap.set(scene,{autoAlpha:i===0?1:0});
      if(art)gsap.set(art,interactive?{opacity:i===0?1:0}:{opacity:i===0?1:0,y:0,z:0,scale:1});
      if(copy)gsap.set(copy,{opacity:i===0?1:0,y:0});
      // Adjacent chapters share the same anchor and handoff window. Their
      // complementary fades never clear the stage between reading intervals.
      if(i>0){
       timeline.set(scene,{autoAlpha:1},i-.22);
       if(art)timeline.fromTo(art,interactive?{opacity:0}:{opacity:0,y:24,z:-40,scale:.985},interactive?{opacity:1,duration:.44,immediateRender:false}:{opacity:1,y:0,z:0,scale:1,duration:.44,immediateRender:false},i-.22);
       // Text changes hands at the boundary so two sentences never overlap.
       if(copy)timeline.fromTo(copy,{opacity:0,y:12},{opacity:1,y:0,duration:.16,immediateRender:false},i);
      }
      if(i<last){
       if(art)timeline.fromTo(art,interactive?{opacity:1}:{opacity:1,y:0,z:0,scale:1},interactive?{opacity:0,duration:.44,immediateRender:false}:{opacity:0,y:-20,z:24,scale:1.008,duration:.44,immediateRender:false},i+.78);
       if(copy)timeline.fromTo(copy,{opacity:1,y:0},{opacity:0,y:-12,duration:.12,immediateRender:false},i+.88);
       timeline.set(scene,{autoAlpha:0},i+1.22);
      }
     });
     // Keep the first panel in native view as the stage enters. A second
     // entrance tween must not compete with chapter fades on the same nodes.
     timeline.to({hold:0},{hold:1,duration:.6},last+.4);
    }else{
     stories.forEach(scene=>{const parts=scene.querySelectorAll('.home-story-visual,.home-story-copy');gsap.fromTo(parts,{opacity:0,y:36},{opacity:1,y:0,duration:.9,stagger:.15,ease:'power3.out',scrollTrigger:{trigger:scene,start:'top 88%',toggleActions:'play none none reverse'}});});
    }
    const closing=root.querySelector<HTMLElement>('.v2-invitation');
    if(closing)gsap.fromTo(closing,{opacity:0,y:48},{opacity:1,y:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:closing,start:'top 88%',toggleActions:'play none none reverse'}});
    refresh();return restore;
   },root);}
   refresh();notify();
  };
  const jump=(event:Event)=>{const link=(event.target as Element).closest<HTMLAnchorElement>('.home-scene-nav a,.v2-hero-actions a[href="#creators"]');if(!link||!track||root.dataset.journeyMotion!=='cinema')return;const index=links.findIndex(a=>a.hash===link.hash);if(index<0)return;event.preventDefault();const top=track.getBoundingClientRect().top+window.scrollY,length=track.offsetHeight-window.innerHeight;window.scrollTo({top:top+length*(index+.42)/stories.length,behavior:'smooth'});};
  const control=(event:Event)=>{const d=(event as CustomEvent<{action:string;value:boolean}>).detail;if(d?.action==='reduced'&&reduced!==!!d.value){reduced=!!d.value;setup();}};
  ScrollTrigger.addEventListener('refresh',notify);window.addEventListener('iavse-scene-control',control);root.addEventListener('click',jump);
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
   restore();ScrollTrigger.removeEventListener('refresh',notify);window.removeEventListener('iavse-scene-control',control);root.removeEventListener('click',jump);images.forEach(i=>i.removeEventListener('load',refresh));
  };
 },[]);
 return <span ref={anchor} hidden aria-hidden="true"/>;
}
