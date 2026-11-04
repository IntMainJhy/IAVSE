'use client';

import {useEffect,useRef} from 'react';

/** A small passing field; click feedback is a static texture animated by the compositor. */
export function QuantumPointer(){
 const pointer=useRef<HTMLCanvasElement>(null),pulse=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  // Embedded blog previews share the document styles, but never need a second cursor.
  if(window.top!==window.self)return;
  const canvas=pointer.current,wave=pulse.current;if(!canvas||!wave)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const fine=matchMedia('(any-hover:hover) and (any-pointer:fine)'),preference=matchMedia('(prefers-reduced-motion:reduce)');
  const size=240,waveSize=640,dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=canvas.height=size*dpr;ctx.scale(dpr,dpr);
  let frame=0,previous=0,x=0,y=0,dx=0,dy=0,alpha=0,lastMove=-Infinity,light=false,savedReduced=false,navigating=false;
  let animation:Animation|undefined;
  try{savedReduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const reduced=()=>savedReduced||preference.matches;
  const color=(bright:boolean)=>bright?'174,211,255':'62,124,210';
  const bright=(element:Element|null)=>document.documentElement.dataset.colorMode==='dark'||!!element?.closest('.v2-landing:not([data-glass-scrolled])');
  const clearPointer=()=>{cancelAnimationFrame(frame);frame=0;previous=0;alpha=0;dx=dy=0;lastMove=-Infinity;ctx.clearRect(0,0,size,size);};
  const clear=()=>{clearPointer();animation?.cancel();animation=undefined;};
  const dot=(context:CanvasRenderingContext2D,cx:number,cy:number,radius:number,opacity:number,rgb:string)=>{context.fillStyle=`rgba(${rgb},${opacity})`;context.beginPath();context.arc(cx,cy,radius,0,Math.PI*2);context.fill();};
  const draw=(now:number)=>{
   frame=0;if(document.hidden){clear();return;}
   const dt=previous?Math.min((now-previous)/1000,.05):1/60;previous=now;
   const target=fine.matches&&!reduced()?Math.max(0,Math.min(1,1-(now-lastMove-140)/420)):0;
   alpha+=(target-alpha)*(1-Math.exp(-16*dt));dx*=Math.exp(-7*dt);dy*=Math.exp(-7*dt);
   ctx.clearRect(0,0,size,size);
   if(alpha>.006){
    const originX=x-size/2,originY=y-size/2,ox=((-originX%18)+18)%18,oy=((-originY%18)+18)%18;
    canvas.style.transform=`translate3d(${originX}px,${originY}px,0)`;
    for(let row=0;row<17;row++)for(let col=0;col<17;col++){
     const ax=col*18+ox,ay=row*18+oy,vx=ax-size/2,vy=ay-size/2,d=Math.hypot(vx,vy),falloff=Math.max(0,1-d/110);if(!falloff)continue;
     const force=falloff*falloff*14,safe=Math.max(d,1);
     dot(ctx,ax+vx/safe*force-dx*falloff*.13,ay+vy/safe*force-dy*falloff*.13,.65+falloff*.8,alpha*falloff*.66,color(light));
    }
   }
   if(alpha>.006||target>0)frame=requestAnimationFrame(draw);else previous=0;
  };
  const wake=()=>{if(!document.hidden&&!navigating&&!frame)frame=requestAnimationFrame(draw);};
  const move=(event:PointerEvent)=>{
   if(event.pointerType==='touch'||!fine.matches||reduced()||document.hidden||navigating)return;
   dx=Math.max(-36,Math.min(36,event.clientX-x));dy=Math.max(-36,Math.min(36,event.clientY-y));x=event.clientX;y=event.clientY;
   lastMove=performance.now();light=bright(event.target instanceof Element?event.target:null);wake();
  };
  const click=(event:MouseEvent)=>{
   if(event.button!==0||document.hidden)return;
   const element=event.target instanceof Element?event.target.closest<HTMLElement>('a,button,summary,input[type=button],input[type=submit],[role=button],[role=tab],[role=option]'):null;
   if(!element||element.matches(':disabled,[aria-disabled=true]'))return;
   let px=event.clientX,py=event.clientY;
   if(event.detail===0){const rect=element.getBoundingClientRect();px=rect.left+rect.width/2;py=rect.top+rect.height/2;}
   animation?.cancel();
   const origin=`translate3d(${px-waveSize/2}px,${py-waveSize/2}px,0)`,quiet=reduced();
   wave.style.color=`rgb(${color(bright(element))})`;
   // The ring is painted once. No canvas work or JS frame loop competes with navigation.
   animation=wave.animate([
    {transform:`${origin} scale(${quiet ? .12 : .08})`,opacity:.68},
    {offset:.22,opacity:.55},
    {transform:`${origin} scale(${quiet ? .12 : 1})`,opacity:0},
   ],{duration:quiet?180:620,easing:'cubic-bezier(.16,1,.3,1)'});
  };
  const leave=()=>{lastMove=-Infinity;wake();};
  const mode=()=>{if(reduced())clear();else leave();};
  const visibility=()=>{if(document.hidden)clear();};
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced'){savedReduced=!!detail.value;mode();}};
  const navigation=(event:Event)=>{navigating=!!(event as CustomEvent<{pending:boolean}>).detail?.pending;if(navigating)clearPointer();};
  window.addEventListener('pointermove',move,{passive:true});document.addEventListener('click',click,true);document.documentElement.addEventListener('pointerleave',leave);window.addEventListener('blur',clear);
  fine.addEventListener('change',mode);preference.addEventListener('change',mode);document.addEventListener('visibilitychange',visibility);window.addEventListener('iavse-scene-control',control);
  window.addEventListener('iavse-navigation-pending',navigation);
  return()=>{clear();window.removeEventListener('pointermove',move);document.removeEventListener('click',click,{capture:true});document.documentElement.removeEventListener('pointerleave',leave);window.removeEventListener('blur',clear);fine.removeEventListener('change',mode);preference.removeEventListener('change',mode);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('iavse-scene-control',control);window.removeEventListener('iavse-navigation-pending',navigation);canvas.width=canvas.height=0;};
 },[]);
 return <><canvas ref={pointer} className="iavse-quantum-pointer" aria-hidden="true"/><div ref={pulse} className="iavse-quantum-wave" aria-hidden="true"/></>;
}
