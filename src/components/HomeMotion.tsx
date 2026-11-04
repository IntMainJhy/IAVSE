'use client';
import {useEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

/** One scrollable film stage; native document flow remains the no-motion fallback. */
export function HomeMotion(){
 const anchor=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const root=anchor.current?.closest<HTMLElement>('.v2-home');if(!root)return;
  gsap.registerPlugin(ScrollTrigger);
  let reduced=false,live=true,frame=0,media:ReturnType<typeof gsap.matchMedia>|null=null;
  try{reduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const notify=()=>{if(live)window.dispatchEvent(new Event('iavse-journey-layout'));};
  const refresh=()=>{if(live&&!frame)frame=requestAnimationFrame(()=>{frame=0;if(live)ScrollTrigger.refresh();});};
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
     const timeline=gsap.timeline({defaults:{ease:'power2.inOut'},scrollTrigger:{id:'iavse-story-film',trigger:track,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true,onUpdate:self=>{
      if(root.dataset.journeyMotion!=='cinema')return;
      const current=Math.min(last,Math.floor(self.progress*stories.length));
      if(stories[current]?.dataset.journeyActive==='true')return;
      stories.forEach((s,i)=>{s.inert=i!==current;s.setAttribute('aria-hidden',String(i!==current));s.dataset.journeyActive=String(i===current);});
      links.forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
     }}});
     stories.forEach((scene,i)=>{
      const art=scene.querySelector<HTMLElement>('.home-story-visual'),copy=scene.querySelector<HTMLElement>('.home-story-copy'),interactive=['editor','resources'].includes(scene.dataset.homeStory||'');
      gsap.set(scene,{autoAlpha:i===0?1:0});scene.inert=i!==0;scene.setAttribute('aria-hidden',String(i!==0));scene.dataset.journeyActive=String(i===0);if(i===0)links[0]?.setAttribute('aria-current','step');
      if(i>0)timeline.to(scene,{autoAlpha:1,duration:.22},i);
      if(art&&i>0)timeline.fromTo(art,interactive?{opacity:0,clipPath:'inset(12% 0 12% 0 round 24px)'}:{opacity:0,y:100,z:-240,rotationY:scene.dataset.homeSide==='right'?-8:8,scale:.92,transformPerspective:1400},interactive?{opacity:1,clipPath:'inset(0% 0 0% 0 round 24px)',duration:.32,immediateRender:false}:{opacity:1,y:0,z:0,rotationY:0,scale:1,duration:.32,immediateRender:false},i);
      if(copy&&i>0)timeline.fromTo(copy,{opacity:0,y:45},{opacity:1,y:0,duration:.28,immediateRender:false},i+.10);
      if(i<last){if(art)timeline.to(art,interactive?{opacity:0,duration:.20}:{opacity:0,y:-65,z:100,scale:1.035,duration:.20},i+.80);if(copy)timeline.to(copy,{opacity:0,y:-24,duration:.16},i+.78);timeline.to(scene,{autoAlpha:0,duration:.12},i+.90);}
     });
     const firstParts=stories[0]?.querySelectorAll('.home-story-visual,.home-story-copy');
     if(firstParts?.length)gsap.fromTo(firstParts,{opacity:0,y:70},{opacity:1,y:0,ease:'power2.out',stagger:.08,scrollTrigger:{trigger:track,start:'top 88%',end:'top 8%',scrub:.5}});
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
  return()=>{live=false;cancelAnimationFrame(frame);media?.revert();restore();ScrollTrigger.removeEventListener('refresh',notify);window.removeEventListener('iavse-scene-control',control);root.removeEventListener('click',jump);images.forEach(i=>i.removeEventListener('load',refresh));};
 },[]);
 return <span ref={anchor} hidden aria-hidden="true"/>;
}
