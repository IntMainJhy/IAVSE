'use client';

import {useEffect,useRef} from 'react';
import type {QuantumField} from '@/lib/quantum-field';

/** One React-owned, lazily loaded point field shared by the reading routes. */
export function QuantumBackdrop(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current,host=canvas?.closest<HTMLElement>('.v2-site');if(!canvas||!host)return;
  const controller=new AbortController(),preference=matchMedia('(prefers-reduced-motion:reduce)');
  let field:QuantumField|null=null,frame=0,last=0,animationTime=0,disposed=false,failed=false,dirty=true;
  let width=innerWidth,height=innerHeight,scroll=window.scrollY/Math.max(1,height),x=0,y=0,targetX=0,targetY=0,savedReduced=false,paused=false;
  try{savedReduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const reduced=()=>savedReduced||preference.matches;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};
  const syncHeader=()=>host.toggleAttribute('data-glass-scrolled',window.scrollY>48);
  const tick=(now:number)=>{
   frame=0;if(disposed||failed||document.hidden||!field)return;
   const interval=width<768?1000/24:1000/30;
   if(!reduced()&&!paused&&last&&now-last<interval){frame=requestAnimationFrame(tick);return;}
   const delta=last?Math.min((now-last)/1000,.1):1/30;last=now;
   if(!reduced()&&!paused)animationTime+=delta;
   const blend=1-Math.exp(-5*delta);x+=(targetX-x)*blend;y+=(targetY-y)*blend;
   try{field.render(animationTime,x,y,scroll,reduced()||paused);}catch{fallback();return;}
   dirty=false;const state=reduced()||paused?'paused':'running';if(canvas.dataset.field!==state)canvas.dataset.field=state;
   if(!reduced()&&!paused)frame=requestAnimationFrame(tick);
  };
  const wake=()=>{if(field&&!disposed&&!failed&&!document.hidden&&!frame&&(dirty||!reduced()&&!paused))frame=requestAnimationFrame(tick);};
  const resize=()=>{width=innerWidth;height=innerHeight;scroll=window.scrollY/Math.max(1,height);try{field?.resize(width,height,devicePixelRatio||1);}catch{fallback();return;}dirty=true;wake();};
  const onScroll=()=>{scroll=window.scrollY/Math.max(1,height);syncHeader();dirty=true;wake();};
  const move=(event:PointerEvent)=>{if(event.pointerType==='touch'||reduced()||paused)return;targetX=Math.max(-1,Math.min(1,event.clientX/width*2-1));targetY=Math.max(-1,Math.min(1,1-event.clientY/height*2));wake();};
  const leave=()=>{targetX=targetY=0;wake();};
  const mode=()=>{stop();dirty=true;wake();};
  const visibility=()=>{if(document.hidden)stop();else{dirty=true;wake();}};
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced')savedReduced=!!detail.value;else if(detail?.action==='paused')paused=!!detail.value;else return;mode();};
  const fallback=()=>{if(failed)return;failed=true;stop();controller.abort();field?.dispose();field=null;canvas.dataset.field='fallback';};
  const lost=(event:Event)=>{event.preventDefault();fallback();};
  canvas.dataset.field='loading';syncHeader();
  window.addEventListener('resize',resize);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);
  preference.addEventListener('change',mode);document.addEventListener('visibilitychange',visibility);window.addEventListener('iavse-scene-control',control);canvas.addEventListener('webglcontextlost',lost);
  void import('@/lib/quantum-field').then(module=>module.createQuantumField(canvas,controller.signal)).then(scene=>{if(disposed||failed||controller.signal.aborted){scene.dispose();return;}field=scene;resize();}).catch(()=>{if(!disposed)fallback();});
  return()=>{disposed=true;stop();controller.abort();field?.dispose();window.removeEventListener('resize',resize);window.removeEventListener('scroll',onScroll);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);preference.removeEventListener('change',mode);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('iavse-scene-control',control);canvas.removeEventListener('webglcontextlost',lost);host.removeAttribute('data-glass-scrolled');canvas.width=canvas.height=0;};
 },[]);
 return <div className="quantum-backdrop" aria-hidden="true"><div className="quantum-backdrop-fallback"/><canvas ref={ref} data-field="loading"/></div>;
}
