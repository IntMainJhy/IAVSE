'use client';

import {useEffect,useRef} from 'react';

/** A small canvas, awake only over actionable UI; never captures pointer input. */
export function QuantumPointer(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current,host=canvas?.closest('.v2-site');if(!canvas||!host)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const capability=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  let frame=0,x=0,y=0,alpha=0,target=0,previous=0,clickAt=-1000,reduced=false;
  try{reduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const dpr=Math.min(devicePixelRatio||1,1.5),size=240;canvas.width=size*dpr;canvas.height=size*dpr;ctx.scale(dpr,dpr);
  const allowed=()=>capability.matches&&!reduced&&!document.hidden;
  const clear=()=>{cancelAnimationFrame(frame);frame=0;alpha=target=0;previous=0;ctx.clearRect(0,0,size,size);};
  const draw=(now:number)=>{
   frame=0;if(!allowed()){clear();return;}
   const dt=previous?Math.min((now-previous)/1000,.05):1/60;previous=now;alpha+=(target-alpha)*(1-Math.exp(-12*dt));
   ctx.clearRect(0,0,size,size);canvas.style.transform=`translate3d(${x-size/2}px,${y-size/2}px,0)`;
   const ox=-(x-size/2)%18,oy=-(y-size/2)%18,pulse=Math.max(0,(now-clickAt)/700);
   for(let row=0;row<15;row++)for(let col=0;col<15;col++){
    const px=col*18+ox,py=row*18+oy,dx=px-120,dy=py-120,d=Math.hypot(dx,dy),falloff=Math.max(0,1-d/110);
    if(!falloff)continue;
    const wave=pulse<1?Math.exp(-Math.pow((d-pulse*115)/18,2))*(1-pulse)*10:0;
    const repel=falloff*falloff*13+wave,safe=Math.max(d,1);
    ctx.fillStyle=`rgba(78,145,245,${alpha*falloff*.65})`;ctx.beginPath();ctx.arc(px+dx/safe*repel,py+dy/safe*repel,.7+falloff*.8,0,Math.PI*2);ctx.fill();
   }
   if(Math.abs(target-alpha)>.008||pulse<1)frame=requestAnimationFrame(draw);else if(!target)clear();
  };
  const wake=()=>{if(allowed()&&!frame)frame=requestAnimationFrame(draw);};
  const move=(event:PointerEvent)=>{
   if(event.pointerType==='touch')return;
   x=event.clientX;y=event.clientY;target=Number(!!(event.target as Element)?.closest('a,button,summary,.home-story-visual'));
   if(target||alpha)wake();
  };
  const leave=()=>{target=0;wake();};
  const press=()=>{if(target){clickAt=performance.now();wake();}};
  const preference=()=>{if(!allowed())clear();};
  const control=(event:Event)=>{const d=(event as CustomEvent<{action:string;value:boolean}>).detail;if(d?.action==='reduced'){reduced=!!d.value;preference();}};
  host.addEventListener('pointermove',move as EventListener,{passive:true});host.addEventListener('pointerleave',leave);host.addEventListener('pointerdown',press);
  capability.addEventListener('change',preference);document.addEventListener('visibilitychange',preference);window.addEventListener('iavse-scene-control',control);window.addEventListener('scroll',leave,{passive:true});
  return()=>{clear();host.removeEventListener('pointermove',move as EventListener);host.removeEventListener('pointerleave',leave);host.removeEventListener('pointerdown',press);capability.removeEventListener('change',preference);document.removeEventListener('visibilitychange',preference);window.removeEventListener('iavse-scene-control',control);window.removeEventListener('scroll',leave);};
 },[]);
 return <canvas ref={ref} className="iavse-quantum-pointer" aria-hidden="true"/>;
}
