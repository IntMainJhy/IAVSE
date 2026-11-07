'use client';

import {useEffect,useRef} from 'react';
import type {SpatialMode,SpatialScene} from '@/lib/spatial-scene';

const loadScene=(canvas:HTMLCanvasElement,signal:AbortSignal,mode:SpatialMode)=>import('@/lib/spatial-scene').then(module=>signal.aborted?Promise.reject(new DOMException('Aborted','AbortError')):module.createSpatialScene(canvas,signal,mode));

/** A decorative real-time scene. Native scrolling and content own all input. */
export function mountSpatialBackdrop(canvas:HTMLCanvasElement,mode:SpatialMode,createScene=loadScene){
 const surface=canvas.parentElement||canvas,host=mode==='gallery'?canvas.closest<HTMLElement>('[data-home-background="gallery"]')||surface:surface;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let live=true,failed=false,visible=false,printing=false,paused=false,manualReduced=false,systemReduced=preference.matches;
 let navigationPending=document.documentElement.hasAttribute('data-iavse-transition');
 let scene:SpatialScene|null=null,setup:AbortController|null=null,frame=0,last=0,time=0,dirty=true,sizeDirty=true,painted=false;
 let width=innerWidth,height=innerHeight,hostTop=0,x=0,y=0,targetX=0,targetY=0,scroll=0,targetScroll=0;
 try{manualReduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
 const quiet=()=>manualReduced||systemReduced;
 const active=()=>live&&!failed&&visible&&!printing&&!document.hidden&&!navigationPending;
 const state=(value:string)=>{if(canvas.dataset.spatial!==value)canvas.dataset.spatial=value;};
 const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;if(scene&&!failed)state('paused');};
 const cancelSetup=()=>{const attempt=setup;setup=null;attempt?.abort();};
 const pending=()=>dirty||sizeDirty||(!quiet()&&!paused&&(mode==='gallery'||Math.abs(x-targetX)+Math.abs(y-targetY)+Math.abs(scroll-targetScroll)>.001));
 const wake=()=>{if(active()&&scene&&!frame&&pending())frame=requestAnimationFrame(draw);};
 const progress=()=>{targetScroll=Math.max(0,Math.min(20,((window.scrollY||0)-hostTop)/Math.max(1,height)));};
 const measure=()=>{
  const rect=surface.getBoundingClientRect();width=Math.max(1,rect.width||innerWidth);height=Math.max(1,rect.height||innerHeight);
  hostTop=mode==='gallery'?host.getBoundingClientRect().top+(window.scrollY||0):0;progress();if(!painted)scroll=targetScroll;
  const dpr=Math.min(devicePixelRatio||1,1.5,Math.sqrt((width<768?550000:1600000)/(width*height)));
  scene?.resize(width,height,dpr);sizeDirty=false;
 };
 function draw(now:number){
  frame=0;if(!active()||!scene)return;
  // Mobile fill rate is bounded; desktop follows the display for pointer response.
  if(width<768&&last&&now-last<1000/30-1){wake();return;}
  const delta=last?Math.min(.05,(now-last)/1000):1/60;last=now;
  const eased=1-Math.exp(-7*delta);
  if(!quiet()&&!paused){time+=delta;x+=(targetX-x)*eased;y+=(targetY-y)*eased;scroll+=(targetScroll-scroll)*eased;}
  try{
   if(sizeDirty)measure();
   scene.render({time:quiet()?0:time,x:quiet()?0:x,y:quiet()?0:y,scroll:quiet()?0:scroll,reduced:quiet()});
   painted=true;dirty=false;state(quiet()||paused?'paused':'running');canvas.style.opacity='1';
  }catch{fallback();return;}
  wake();
 }
 const start=()=>{
  if(!active()||scene||setup)return;
  const attempt=new AbortController();setup=attempt;state('loading');
  void createScene(canvas,attempt.signal,mode).then(result=>{
   if(setup!==attempt||!active()||attempt.signal.aborted){if(setup===attempt)setup=null;result.dispose();return;}
   setup=null;scene=result;sizeDirty=dirty=true;wake();
  }).catch(error=>{if(setup!==attempt)return;setup=null;if(live&&error?.name!=='AbortError')fallback();});
 };
 const resume=()=>{if(active()){progress();start();dirty=true;wake();}else{stop();cancelSetup();}};
 function fallback(){failed=true;stop();cancelSetup();scene?.dispose();scene=null;canvas.style.opacity='0';state('fallback');}
 const resize=()=>{sizeDirty=dirty=true;wake();};
 const onScroll=()=>{if(!active())return;progress();dirty=true;wake();};
 const move=(event:PointerEvent)=>{
  if(!active()||quiet()||paused||event.pointerType==='touch')return;
  targetX=Math.max(-1,Math.min(1,event.clientX/Math.max(1,width)*2-1));targetY=Math.max(-1,Math.min(1,1-event.clientY/Math.max(1,height)*2));wake();
 };
 const leave=()=>{targetX=targetY=0;wake();};
 const reduced=(event:MediaQueryListEvent)=>{systemReduced=event.matches;stop();dirty=true;resume();};
 const visibility=()=>resume();
 const beforePrint=()=>{printing=true;resume();},afterPrint=()=>{printing=false;resume();};
 const navigation=(event:Event)=>{
  const detail=(event as CustomEvent<{pending:boolean}>).detail;if(typeof detail?.pending!=='boolean')return;
  navigationPending=detail.pending||document.documentElement.hasAttribute('data-iavse-transition');resume();
 };
 const control=(event:Event)=>{
  const detail=(event as CustomEvent<{action:string;value?:boolean}>).detail;
  if(detail?.action==='reduced')manualReduced=!!detail.value;
  else if(detail?.action==='paused')paused=!!detail.value;
  else if(detail?.action==='replay'){paused=false;time=0;x=y=targetX=targetY=0;}
  else return;
  stop();dirty=true;resume();
 };
 const lost=(event:Event)=>{event.preventDefault();fallback();};
 const intersection=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);resume();},{threshold:.01});
 const bounds=new ResizeObserver(resize);
 state('idle');intersection.observe(surface);bounds.observe(surface);if(host!==surface)bounds.observe(host);
 window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);
 window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',resize);
 window.addEventListener('beforeprint',beforePrint);window.addEventListener('afterprint',afterPrint);
 window.addEventListener('iavse-navigation-pending',navigation);window.addEventListener('iavse-scene-control',control);
 document.addEventListener('visibilitychange',visibility);preference.addEventListener('change',reduced);canvas.addEventListener('webglcontextlost',lost);
 return()=>{
  live=false;stop();cancelSetup();intersection.disconnect();bounds.disconnect();
  window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);
  window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',resize);
  window.removeEventListener('beforeprint',beforePrint);window.removeEventListener('afterprint',afterPrint);
  window.removeEventListener('iavse-navigation-pending',navigation);window.removeEventListener('iavse-scene-control',control);
  document.removeEventListener('visibilitychange',visibility);preference.removeEventListener('change',reduced);canvas.removeEventListener('webglcontextlost',lost);
  scene?.dispose();scene=null;canvas.width=canvas.height=0;
 };
}

export function SpatialBackdrop({mode}:{mode:SpatialMode}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>canvas.current?mountSpatialBackdrop(canvas.current,mode):undefined,[mode]);
 return <div className="spatial-backdrop" data-spatial-mode={mode} aria-hidden="true"><canvas ref={canvas}/></div>;
}
