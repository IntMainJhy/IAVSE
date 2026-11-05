'use client';

import {useEffect,useRef} from 'react';

/** Two bounded fields: a passing pointer and an independently anchored, batched wave. */
export function QuantumPointer(){
 const pointer=useRef<HTMLCanvasElement>(null),pulse=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  // Embedded blog previews share the document styles, but never need a second cursor.
  if(window.top!==window.self)return;
  const canvas=pointer.current,wave=pulse.current;if(!canvas||!wave)return;
  const ctx=canvas.getContext('2d'),ink=wave.getContext('2d');if(!ctx||!ink)return;
  const fine=matchMedia('(any-hover:hover) and (any-pointer:fine)'),preference=matchMedia('(prefers-reduced-motion:reduce)');
  const size=240,waveSize=640,dpr=Math.min(devicePixelRatio||1,1.5);
  for(const [surface,context,length] of [[canvas,ctx,size],[wave,ink,waveSize]] as const){surface.width=surface.height=length*dpr;context.scale(dpr,dpr);}
  let frame=0,previous=0,x=0,y=0,dx=0,dy=0,alpha=0,lastMove=-Infinity,light=false,savedReduced=false,navigating=false;
  let waveFrame=0,wavePrevious=0,waveElapsed=0,quietPulse=false,waveLight=false;
  // Reuse geometry and paths. The original ripple moves dots, rather than scaling a picture.
  const points=new Float32Array(37*37*5),groups=Array.from({length:16},()=>[] as number[]),pointerGroups=Array.from({length:16},()=>[] as number[]),falloffs=new Float32Array(1024);
  for(let i=0;i<falloffs.length;i++)falloffs[i]=Math.exp(-Math.pow(i/(falloffs.length-1)*3,2));
  try{savedReduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const reduced=()=>savedReduced||preference.matches;
  const color=(bright:boolean)=>bright?'174,211,255':'62,124,210';
  const bright=(element:Element|null)=>document.documentElement.dataset.colorMode==='dark'||!!element?.closest('.v2-landing:not([data-glass-scrolled])');
  const clearPointer=()=>{cancelAnimationFrame(frame);frame=0;previous=0;alpha=0;dx=dy=0;lastMove=-Infinity;ctx.clearRect(0,0,size,size);};
  const clearWave=()=>{cancelAnimationFrame(waveFrame);waveFrame=0;wavePrevious=waveElapsed=0;ink.clearRect(0,0,waveSize,waveSize);wave.style.opacity='0';};
  const clear=()=>{clearPointer();clearWave();};
  const paintWave=(progress:number)=>{
   // Follow the current surface after a route remount, without measuring layout.
   const host=document.querySelector('.organic-site,.blog-public-shell'),nextLight=host?bright(host):waveLight;
   if(nextLight!==waveLight){waveLight=nextLight;ink.fillStyle=`rgb(${color(waveLight)})`;}
   const radius=quietPulse?18:14+260*(1-(1-progress)*(1-progress)),spread=quietPulse?18:22+progress*20;
   for(const group of groups)group.length=0;
   for(let i=0;i<points.length;i+=5){
    const distance=Math.abs(points[i+4]-radius)/spread;if(distance>=3)continue;
    const crest=falloffs[Math.round(distance/3*(falloffs.length-1))]*(1-progress);if(crest<.018)continue;
    const force=quietPulse?0:crest*15,group=groups[Math.min(groups.length-1,Math.floor(crest*groups.length))];
    group.push(points[i]+points[i+2]*force,points[i+1]+points[i+3]*force);
   }
   ink.clearRect(0,0,waveSize,waveSize);
   for(let i=0;i<groups.length;i++){
    const group=groups[i];if(!group.length)continue;
    const crest=(i+.5)/groups.length,radius=.7+crest*1.4;ink.globalAlpha=crest*.84;ink.beginPath();
    for(let j=0;j<group.length;j+=2){ink.moveTo(group[j]+radius,group[j+1]);ink.arc(group[j],group[j+1],radius,0,Math.PI*2);}
    ink.fill();
   }
  };
  const drawWave=(now:number)=>{
   waveFrame=0;
   // A busy route commit must not consume the entire effect before its first paint.
   waveElapsed+=Math.max(0,Math.min(now-wavePrevious,48));wavePrevious=now;
   const progress=waveElapsed/(quietPulse?180:760);
   if(document.hidden||progress>=1){clearWave();return;}
   paintWave(progress);waveFrame=requestAnimationFrame(drawWave);
  };
  const draw=(now:number)=>{
   frame=0;if(document.hidden){clear();return;}
   const dt=previous?Math.min((now-previous)/1000,.05):1/60;previous=now;
   const target=fine.matches&&!reduced()?Math.max(0,Math.min(1,1-(now-lastMove-140)/420)):0;
   alpha+=(target-alpha)*(1-Math.exp(-16*dt));dx*=Math.exp(-7*dt);dy*=Math.exp(-7*dt);
   ctx.clearRect(0,0,size,size);
   if(alpha>.006){
    const originX=x-size/2,originY=y-size/2,ox=((-originX%18)+18)%18,oy=((-originY%18)+18)%18;
    canvas.style.transform=`translate3d(${originX}px,${originY}px,0)`;
    for(const group of pointerGroups)group.length=0;
    for(let row=0;row<17;row++)for(let col=0;col<17;col++){
     const ax=col*18+ox,ay=row*18+oy,vx=ax-size/2,vy=ay-size/2,d=Math.hypot(vx,vy),falloff=Math.max(0,1-d/110);if(!falloff)continue;
     const force=falloff*falloff*14,safe=Math.max(d,1);
     const group=pointerGroups[Math.min(pointerGroups.length-1,Math.floor(falloff*pointerGroups.length))];
     group.push(ax+vx/safe*force-dx*falloff*.13,ay+vy/safe*force-dy*falloff*.13);
    }
    ctx.fillStyle=`rgb(${color(light)})`;
    for(let i=0;i<pointerGroups.length;i++){
     const group=pointerGroups[i];if(!group.length)continue;
     const strength=(i+.5)/pointerGroups.length,radius=.65+strength*.8;ctx.globalAlpha=alpha*strength*.66;ctx.beginPath();
     for(let j=0;j<group.length;j+=2){ctx.moveTo(group[j]+radius,group[j+1]);ctx.arc(group[j],group[j+1],radius,0,Math.PI*2);}
     ctx.fill();
    }
   }
   if(alpha>.006||target>0)frame=requestAnimationFrame(draw);else previous=0;
  };
  const wake=()=>{if(!document.hidden&&!navigating&&!frame)frame=requestAnimationFrame(draw);};
  const move=(event:PointerEvent)=>{
   if(event.pointerType==='touch'||!fine.matches||reduced()||document.hidden||navigating||document.documentElement.hasAttribute('data-iavse-transition'))return;
   dx=Math.max(-36,Math.min(36,event.clientX-x));dy=Math.max(-36,Math.min(36,event.clientY-y));x=event.clientX;y=event.clientY;
   lastMove=performance.now();light=bright(event.target instanceof Element?event.target:null);wake();
  };
  const click=(event:MouseEvent)=>{
   if(event.button!==0||document.hidden)return;
   const element=event.target instanceof Element?event.target.closest<HTMLElement>('a,button,summary,input[type=button],input[type=submit],[role=button],[role=tab],[role=option]'):null;
   if(!element||element.matches(':disabled,[aria-disabled=true]'))return;
   let px=event.clientX,py=event.clientY;
   if(event.detail===0){const rect=element.getBoundingClientRect();px=rect.left+rect.width/2;py=rect.top+rect.height/2;}
   clearWave();wavePrevious=performance.now();quietPulse=reduced();
   const center=waveSize/2,ox=((-(px-center)%18)+18)%18,oy=((-(py-center)%18)+18)%18;
   for(let row=0,i=0;row<37;row++)for(let col=0;col<37;col++,i+=5){
    const ax=col*18+ox,ay=row*18+oy,vx=ax-center,vy=ay-center,distance=Math.hypot(vx,vy),safe=Math.max(distance,1);
    points[i]=ax;points[i+1]=ay;points[i+2]=vx/safe;points[i+3]=vy/safe;points[i+4]=distance;
   }
   waveLight=bright(element);ink.fillStyle=`rgb(${color(waveLight)})`;
   wave.style.transform=`translate3d(${px-center}px,${py-center}px,0)`;wave.style.opacity='1';
   // Acknowledge immediately, before React/route work can delay the next RAF.
   paintWave(0);
   // Keep the wave alive during navigation; only the background/pointer yield.
   waveFrame=requestAnimationFrame(drawWave);
  };
  const leave=()=>{lastMove=-Infinity;wake();};
  const mode=()=>{if(reduced())clear();else leave();};
  const visibility=()=>{if(document.hidden)clear();};
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced'){savedReduced=!!detail.value;mode();}};
  const navigation=(event:Event)=>{navigating=!!(event as CustomEvent<{pending:boolean}>).detail?.pending;if(navigating)clearPointer();};
  window.addEventListener('pointermove',move,{passive:true});document.addEventListener('click',click,true);document.documentElement.addEventListener('pointerleave',leave);window.addEventListener('blur',clear);
  fine.addEventListener('change',mode);preference.addEventListener('change',mode);document.addEventListener('visibilitychange',visibility);window.addEventListener('iavse-scene-control',control);
  window.addEventListener('iavse-navigation-pending',navigation);
  return()=>{clear();window.removeEventListener('pointermove',move);document.removeEventListener('click',click,{capture:true});document.documentElement.removeEventListener('pointerleave',leave);window.removeEventListener('blur',clear);fine.removeEventListener('change',mode);preference.removeEventListener('change',mode);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('iavse-scene-control',control);window.removeEventListener('iavse-navigation-pending',navigation);canvas.width=canvas.height=wave.width=wave.height=0;};
 },[]);
 return <><canvas ref={pointer} className="iavse-quantum-pointer" aria-hidden="true"/><canvas ref={pulse} className="iavse-quantum-wave" aria-hidden="true"/></>;
}
