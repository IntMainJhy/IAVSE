'use client';

import {useEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {homeScrollRefresh} from '@/lib/home-scroll-refresh';

const copy={
 zh:{loading:'正在准备 3D 空间',ready:'滚动，探索你的空间',fallback:'静态背景 · 所有功能均可使用',pause:'暂停背景',resume:'继续背景',reduce:'减少背景动态',system:'系统已减少动态效果',replay:'返回顶部并重播',controls:'空间动画控制'},
 en:{loading:'Preparing the 3D space',ready:'Scroll to explore your space',fallback:'Static background · All features available',pause:'Pause background',resume:'Resume background',reduce:'Reduce background motion',system:'System motion reduction is on',replay:'Back to top and replay',controls:'Scene animation controls'},
 ja:{loading:'3D 空間を準備中',ready:'スクロールして空間を探索',fallback:'静止背景 · すべての機能を利用できます',pause:'背景を停止',resume:'背景を再生',reduce:'背景の動きを減らす',system:'システムの動きを減らす設定が有効',replay:'先頭に戻って再生',controls:'空間アニメーションの操作'}
};
export function HomeCinema({locale}:{locale:string}){
 const c=copy[locale as keyof typeof copy]||copy.en,root=useRef<HTMLDivElement>(null);
 const [state,setState]=useState('loading'),[progress,setProgress]=useState(0),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[systemReduced,setSystemReduced]=useState(false);
 const send=(action:string,value?:boolean)=>window.dispatchEvent(new CustomEvent('iavse-scene-control',{detail:{action,value}}));
 useEffect(()=>{
  const host=root.current?.closest('.v2-home'),canvas=host?.querySelector<HTMLCanvasElement>('.v2-atmosphere');if(!canvas)return;
  const observe=()=>{setState(canvas.dataset.atmosphere||'loading');setProgress(Number(canvas.dataset.loadingProgress||0));};
  const observer=new MutationObserver(observe);observer.observe(canvas,{attributes:true,attributeFilter:['data-atmosphere','data-loading-progress']});observe();
  const preference=matchMedia('(prefers-reduced-motion: reduce)'),motion=(event?:MediaQueryListEvent)=>setSystemReduced(typeof event?.matches==='boolean'?event.matches:preference.matches);motion();preference.addEventListener('change',motion);
  try{const saved=localStorage.getItem('iavse-background-motion')==='reduce';setReduced(saved);send('reduced',saved);}catch{}
  return()=>{observer.disconnect();preference.removeEventListener('change',motion);};
 },[]);
 useEffect(()=>{
  const host=root.current?.closest<HTMLElement>('.v2-home'),hero=host?.querySelector<HTMLElement>('.v2-hero-scene');if(!host||!hero||reduced)return;
  try{if(localStorage.getItem('iavse-background-motion')==='reduce')return;}catch{}
  gsap.registerPlugin(ScrollTrigger);
  const refreshWork=homeScrollRefresh(hero),refresh=refreshWork.request;
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
   const heading=hero.querySelectorAll('h1>span'),copy=hero.querySelector('.v2-hero-copy'),intro=hero.querySelector('.v2-hero-intro'),showcase=hero.querySelector('.v2-hero-showcase'),stage=hero.querySelector('.v2-stage,.v2-hero-empty');
   const entrance=gsap.timeline({defaults:{ease:'power3.out'}});
   if(window.scrollY<32)entrance.fromTo(heading,{y:10,opacity:.6},{y:0,opacity:1,duration:1,stagger:.075,clearProps:'transform,opacity',immediateRender:false});
   // The opening frame belongs to the brand. The product approaches only once
   // its own section crosses the viewport, and reverses with native scrolling.
   if(copy&&intro)gsap.to(copy,{y:-36,opacity:.08,ease:'none',scrollTrigger:{id:'iavse-hero-departure',trigger:intro,start:'top top',end:'bottom 30%',scrub:.45,invalidateOnRefresh:true}});
   if(stage&&showcase)gsap.fromTo(stage,{autoAlpha:0,y:88,rotationX:7,scale:.94,transformPerspective:1800,transformOrigin:'center top'},{autoAlpha:1,y:0,rotationX:0,scale:1,ease:'power2.out',scrollTrigger:{id:'iavse-product-approach',trigger:showcase,start:'top 96%',end:'top 24%',scrub:.55,invalidateOnRefresh:true}});
  },hero);
  const images=Array.from(hero.querySelectorAll('img'));images.forEach(image=>image.addEventListener('load',refresh,{once:true}));
  document.fonts?.ready.then(refresh);refresh();
  return()=>{
   refreshWork.dispose();images.forEach(image=>image.removeEventListener('load',refresh));
   if(hero.isConnected)media.revert();
   else{
    // Only a detached homepage can discard its styles. Live preference changes
    // and StrictMode cleanup still restore every GSAP-owned style with revert().
    for(const context of media.contexts){
     const triggers=context.data.filter((entry:unknown)=>entry instanceof ScrollTrigger) as ScrollTrigger[];
     triggers.forEach(trigger=>trigger.kill(false));
     context.data=context.data.filter((entry:unknown)=>!triggers.includes(entry as ScrollTrigger));
    }
    media.kill(false);
   }
  };
 },[reduced]);
 const loading=state==='loading',failed=state==='fallback',quiet=reduced||systemReduced;
 return <div ref={root} className="iavse-cinema-toolbar">
  <span className="iavse-cinema-status" role="status" aria-live="polite">{loading?c.loading+(progress>0?' · '+Math.min(99,Math.round(progress))+'%':''):failed?c.fallback:systemReduced?c.system:reduced?c.reduce:c.ready}</span>
  <div className="iavse-cinema-controls" role="group" aria-label={c.controls}>
   <button type="button" aria-pressed={paused} disabled={loading||failed||quiet} onClick={()=>{send('paused',!paused);setPaused(!paused);}}>{paused?c.resume:c.pause}</button>
   <button type="button" aria-pressed={quiet} disabled={systemReduced} onClick={()=>{const next=!reduced;setReduced(next);send('reduced',next);try{localStorage.setItem('iavse-background-motion',next?'reduce':'full');}catch{}}}>{c.reduce}</button>
   <button type="button" onClick={()=>{window.scrollTo({top:0,behavior:quiet?'instant':'smooth'});setPaused(false);send('paused',false);send('replay');}}>{c.replay}</button>
  </div>
 </div>;
}
