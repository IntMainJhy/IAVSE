'use client';

import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import type {QuantumField} from '@/lib/quantum-field';

const quantumRoute=(path:string)=>/^\/(?:community|resources|docs|skills)(?:\/|$)/.test(path)||/^\/blogs\/?$/.test(path);
const hostSelector='.organic-site.v2-site[data-surface="reading"][data-reading-scene="quantum"]';

/** A root-owned field retains its GPU resources between reading routes. */
export function QuantumBackdrop(){
 const path=usePathname(),ref=useRef<HTMLCanvasElement>(null),plane=useRef<HTMLDivElement>(null),route=useRef(path),sync=useRef<(path:string)=>void>(()=>{});
 route.current=path;
 useEffect(()=>{
  const canvas=ref.current,layer=plane.current;if(!canvas||!layer||window.top!==window.self)return;
  const controller=new AbortController(),preference=matchMedia('(prefers-reduced-motion:reduce)');
  let field:QuantumField|null=null,host:HTMLElement|null=null,eligible=false,loading=false,frame=0,last=0,animationTime=0,disposed=false,failed=false,dirty=true;
  let width=innerWidth,height=innerHeight,scroll=window.scrollY/Math.max(1,height),x=0,y=0,targetX=0,targetY=0,savedReduced=false,paused=false;
  try{savedReduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const reduced=()=>savedReduced||preference.matches;
  const active=()=>!!host?.isConnected&&eligible&&!document.hidden;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};
  const syncHeader=()=>host?.toggleAttribute('data-glass-scrolled',window.scrollY>48);
  const tick=(now:number)=>{
   frame=0;if(disposed||failed||!active()||!field)return;
   const interval=width<768?1000/24:1000/30;
   if(!reduced()&&!paused&&last&&now-last<interval){frame=requestAnimationFrame(tick);return;}
   const delta=last?Math.min((now-last)/1000,.1):1/30;last=now;
   if(!reduced()&&!paused)animationTime+=delta;
   const blend=1-Math.exp(-5*delta);x+=(targetX-x)*blend;y+=(targetY-y)*blend;
   try{field.render(animationTime,x,y,scroll,reduced()||paused);}catch{fallback();return;}
   dirty=false;const state=reduced()||paused?'paused':'running';if(canvas.dataset.field!==state)canvas.dataset.field=state;
   if(!reduced()&&!paused)frame=requestAnimationFrame(tick);
  };
  const wake=()=>{if(field&&!disposed&&!failed&&active()&&!frame&&(dirty||!reduced()&&!paused))frame=requestAnimationFrame(tick);};
  const resize=()=>{width=innerWidth;height=innerHeight;scroll=window.scrollY/Math.max(1,height);if(!active())return;try{field?.resize(width,height,devicePixelRatio||1);}catch{fallback();return;}dirty=true;wake();};
  const onScroll=()=>{if(!active())return;scroll=window.scrollY/Math.max(1,height);syncHeader();dirty=true;wake();};
  const move=(event:PointerEvent)=>{if(!active()||event.pointerType==='touch'||reduced()||paused)return;targetX=Math.max(-1,Math.min(1,event.clientX/width*2-1));targetY=Math.max(-1,Math.min(1,1-event.clientY/height*2));wake();};
  const leave=()=>{targetX=targetY=0;wake();};
  const mode=()=>{stop();dirty=true;wake();};
  const load=()=>{
   if(!active()||field||loading||failed||disposed)return;loading=true;
   void import('@/lib/quantum-field').then(module=>module.createQuantumField(canvas,controller.signal)).then(scene=>{
    loading=false;if(disposed||failed||controller.signal.aborted){scene.dispose();return;}field=scene;resize();
   }).catch(()=>{loading=false;if(!disposed)fallback();});
  };
  const visibility=()=>{if(document.hidden)stop();else{load();resize();}};
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced')savedReduced=!!detail.value;else if(detail?.action==='paused'){if(!eligible)return;paused=!!detail.value;}else return;mode();};
  const fallback=()=>{if(failed)return;failed=true;stop();controller.abort();field?.dispose();field=null;canvas.dataset.field='fallback';};
  const lost=(event:Event)=>{event.preventDefault();fallback();};
  const bind=()=>{
   const next=eligible?document.querySelector<HTMLElement>(hostSelector):null;
   if(host!==next){host?.removeAttribute('data-quantum-host');host?.removeAttribute('data-glass-scrolled');host=next;}
   layer.hidden=!host;
   if(!host){stop();return;}
   host.toggleAttribute('data-quantum-host',true);syncHeader();load();resize();
  };
  // The pathname can commit before a streamed shell. Rebind only when its host
  // changes, rather than recreating the renderer as the page DOM is replaced.
  const observer=new MutationObserver(()=>{if(eligible&&(!host||!host.isConnected))bind();});
  observer.observe(document.body,{childList:true,subtree:true});
  sync.current=next=>{eligible=quantumRoute(next);if(!eligible)paused=false;bind();};
  canvas.dataset.field='loading';sync.current(route.current);
  window.addEventListener('resize',resize);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);
  preference.addEventListener('change',mode);document.addEventListener('visibilitychange',visibility);window.addEventListener('iavse-scene-control',control);canvas.addEventListener('webglcontextlost',lost);
  return()=>{disposed=true;sync.current=()=>{};observer.disconnect();stop();controller.abort();field?.dispose();window.removeEventListener('resize',resize);window.removeEventListener('scroll',onScroll);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);preference.removeEventListener('change',mode);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('iavse-scene-control',control);canvas.removeEventListener('webglcontextlost',lost);host?.removeAttribute('data-quantum-host');host?.removeAttribute('data-glass-scrolled');canvas.width=canvas.height=0;};
 },[]);
 useEffect(()=>{sync.current(path);},[path]);
 return <div ref={plane} className="quantum-backdrop" data-persistent hidden aria-hidden="true"><div className="quantum-backdrop-fallback"/><canvas ref={ref} data-field="loading"/></div>;
}
