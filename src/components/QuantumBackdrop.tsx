'use client';

import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import type {QuantumField} from '@/lib/quantum-field';

// Bento indexes own an opaque neutral canvas, so they need no hidden GPU work.
const quantumRoute=(path:string)=>!/^\/(?:resources(?:\/legal-consultation)?|docs|skills)\/?$/.test(path)&&(/^\/(?:community|resources|docs|skills)(?:\/|$)/.test(path)||/^\/blogs\/?$/.test(path));
const hostSelector='.organic-site.v2-site[data-surface="reading"][data-reading-scene="quantum"]';

/** A root-owned field retains its GPU resources between reading routes. */
export function QuantumBackdrop(){
 const path=usePathname(),ref=useRef<HTMLCanvasElement>(null),plane=useRef<HTMLDivElement>(null),route=useRef(path),sync=useRef<(path:string)=>void>(()=>{});
 route.current=path;
 useEffect(()=>{
  const canvas=ref.current,layer=plane.current;if(!canvas||!layer||window.top!==window.self)return;
  const preference=matchMedia('(prefers-reduced-motion:reduce)');
  let field:QuantumField|null=null,host:HTMLElement|null=null,setup:AbortController|null=null,fieldController:AbortController|null=null,eligible=false,frame=0,last=0,animationTime=0,disposed=false,failed=false,dirty=true;
  let width=innerWidth,height=innerHeight,scroll=window.scrollY/Math.max(1,height),x=0,y=0,targetX=0,targetY=0,savedReduced=false,paused=false;
  let navigationPending=document.documentElement.hasAttribute('data-iavse-transition');
  try{savedReduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const reduced=()=>savedReduced||preference.matches;
  const active=()=>!!host?.isConnected&&eligible&&!document.hidden&&!navigationPending;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};
  // Cancel only unfinished setup. A fully created field remains reusable across
  // reading routes and temporary navigation/visibility pauses.
  const cancelSetup=()=>{const attempt=setup;setup=null;attempt?.abort();};
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
  const resize=()=>{width=innerWidth;height=innerHeight;if(!field||!active())return;scroll=window.scrollY/Math.max(1,height);try{field.resize(width,height,devicePixelRatio||1);}catch{fallback();return;}dirty=true;wake();};
  const onScroll=()=>{if(!active())return;scroll=window.scrollY/Math.max(1,height);syncHeader();dirty=true;wake();};
  const move=(event:PointerEvent)=>{if(!active()||event.pointerType==='touch'||reduced()||paused)return;targetX=Math.max(-1,Math.min(1,event.clientX/width*2-1));targetY=Math.max(-1,Math.min(1,1-event.clientY/height*2));wake();};
  const leave=()=>{targetX=targetY=0;wake();};
  const mode=()=>{stop();dirty=true;wake();};
  const load=()=>{
   if(!active()||field||setup||failed||disposed)return;
   const attempt=new AbortController();setup=attempt;
   void import('@/lib/quantum-field').then(module=>{
    // A navigation may begin while this chunk is loading. Keep shader creation
    // out of its commit/arrival frames; the handoff resumes loading afterwards.
    if(setup!==attempt||disposed||failed||attempt.signal.aborted||!active())return null;
    return module.createQuantumField(canvas,attempt.signal,{width:innerWidth,height:innerHeight,dpr:devicePixelRatio||1});
   }).then(scene=>{
    if(setup!==attempt||disposed||failed||attempt.signal.aborted||!active()){
     if(setup===attempt)setup=null;
     attempt.abort();scene?.dispose();return;
    }
    setup=null;if(!scene)return;fieldController=attempt;field=scene;resize();
   }).catch(error=>{
    // A late rejected attempt must not reset or fail its newer replacement.
    if(setup!==attempt)return;setup=null;attempt.abort();
    if(!disposed&&error?.name!=='AbortError')fallback();
   });
  };
  const navigation=(event:Event)=>{
   const detail=(event as CustomEvent<{pending:boolean}>).detail;if(typeof detail?.pending!=='boolean')return;
   // Ignore an older page's release while a newer root handoff is still active.
   const next=detail.pending||document.documentElement.hasAttribute('data-iavse-transition');
   if(next===navigationPending)return;navigationPending=next;
   if(navigationPending){stop();cancelSetup();return;}
   load();resize();
  };
  const visibility=()=>{if(document.hidden){stop();cancelSetup();}else{load();resize();}};
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced')savedReduced=!!detail.value;else if(detail?.action==='paused'){if(!eligible)return;paused=!!detail.value;}else return;mode();};
  const fallback=()=>{if(failed)return;failed=true;stop();cancelSetup();fieldController?.abort();fieldController=null;field?.dispose();field=null;canvas.dataset.field='fallback';};
  const lost=(event:Event)=>{event.preventDefault();fallback();};
  const bind=()=>{
   const next=eligible?document.querySelector<HTMLElement>(hostSelector):null;
   if(host!==next){host?.removeAttribute('data-quantum-host');host?.removeAttribute('data-glass-scrolled');host=next;}
   layer.hidden=!host;
   if(!host){stop();cancelSetup();return;}
   host.toggleAttribute('data-quantum-host',true);syncHeader();load();resize();
  };
  // The pathname can commit before a streamed shell. Rebind only when its host
  // changes, rather than recreating the renderer as the page DOM is replaced.
  const observer=new MutationObserver(()=>{if(eligible&&(!host||!host.isConnected))bind();});
  observer.observe(document.body,{childList:true,subtree:true});
  sync.current=next=>{eligible=quantumRoute(next);if(!eligible)paused=false;bind();};
  canvas.dataset.field='loading';sync.current(route.current);
  window.addEventListener('resize',resize);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);
  preference.addEventListener('change',mode);document.addEventListener('visibilitychange',visibility);window.addEventListener('iavse-scene-control',control);window.addEventListener('iavse-navigation-pending',navigation);canvas.addEventListener('webglcontextlost',lost);
  return()=>{disposed=true;sync.current=()=>{};observer.disconnect();stop();cancelSetup();fieldController?.abort();fieldController=null;field?.dispose();window.removeEventListener('resize',resize);window.removeEventListener('scroll',onScroll);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);preference.removeEventListener('change',mode);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('iavse-scene-control',control);window.removeEventListener('iavse-navigation-pending',navigation);canvas.removeEventListener('webglcontextlost',lost);host?.removeAttribute('data-quantum-host');host?.removeAttribute('data-glass-scrolled');canvas.width=canvas.height=0;};
 },[]);
 useEffect(()=>{sync.current(path);},[path]);
 return <div ref={plane} className="quantum-backdrop" data-persistent hidden aria-hidden="true"><div className="quantum-backdrop-fallback"/><canvas ref={ref} data-field="loading"/></div>;
}
