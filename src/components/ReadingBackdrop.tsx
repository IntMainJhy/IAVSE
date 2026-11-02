'use client';

import {useEffect,useRef} from 'react';

/** Quiet paper points. Only a small pointer neighbourhood moves, then sleeps. */
export function ReadingBackdrop(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return;
  const capability=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  let context:CanvasRenderingContext2D|null=null,frame=0,last=0,movedAt=0,x=-200,y=-200,alpha=0,w=0,h=0,reduced=false;
  try{reduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const allowed=()=>capability.matches&&!reduced&&!document.hidden;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;alpha=0;last=0;context?.clearRect(0,0,w,h);canvas.dataset.state='idle';};
  const resize=()=>{stop();w=innerWidth;h=innerHeight;canvas.width=w;canvas.height=h;};
  const draw=(now:number)=>{
   frame=0;if(!allowed()){stop();return;}
   if(now-last<32){frame=requestAnimationFrame(draw);return;}
   last=now;const target=now-movedAt<120?.6:0;alpha+=(target-alpha)*.22;
   if(alpha<.008&&!target){stop();return;}
   context??=canvas.getContext('2d');if(!context)return;
   context.clearRect(0,0,w,h);context.fillStyle=`rgba(78,106,145,${alpha*.34})`;
   const spacing=32,startX=Math.floor((x-112)/spacing)*spacing,startY=Math.floor((y-112)/spacing)*spacing;
   for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const px=startX+col*spacing,py=startY+row*spacing,dx=px-x,dy=py-y,d=Math.hypot(dx,dy),falloff=Math.max(0,1-d/112);
    if(!falloff)continue;
    const shift=falloff*falloff*7*alpha,ratio=shift/Math.max(1,d);
    context.beginPath();context.arc(px+dx*ratio,py+dy*ratio,.7+falloff*.6,0,Math.PI*2);context.fill();
   }
   canvas.dataset.state='active';frame=requestAnimationFrame(draw);
  };
  const move=(event:PointerEvent)=>{
   if(!allowed()||event.pointerType==='touch')return;
   x=event.clientX;y=event.clientY;movedAt=performance.now();
   if(!frame)frame=requestAnimationFrame(draw);
  };
  const preference=()=>{if(!allowed())stop();};
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced'){reduced=detail.value;preference();}};
  resize();window.addEventListener('resize',resize);window.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('visibilitychange',preference);capability.addEventListener('change',preference);window.addEventListener('iavse-scene-control',control);
  return()=>{stop();window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',preference);capability.removeEventListener('change',preference);window.removeEventListener('iavse-scene-control',control);canvas.width=canvas.height=0;};
 },[]);
 return <div className="reading-backdrop" aria-hidden="true"><div className="reading-backdrop-points"/><canvas ref={ref} data-state="idle"/></div>;
}
