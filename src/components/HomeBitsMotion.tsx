'use client';
import {useEffect,useRef} from 'react';
import {asciiWave} from '@/lib/home-bits.mjs';

/** Original ASCII wave inspired by the Security demo; native scrolling and bounded drawing. */
export function HomeBitsMotion(){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const host=ref.current?.closest<HTMLElement>('.rb-home'),canvas=host?.querySelector<HTMLCanvasElement>('.rb-ascii');if(!host||!canvas)return;
  const context=canvas.getContext('2d'),quiet=matchMedia('(prefers-reduced-motion: reduce)');if(!context)return;
  let frame=0,last=0,time=0,visible=false,disposed=false,width=1,height=1,pointer=.5;
  const chars=' .:-=+*#%@';
  function draw(now:number){
   frame=0;if(disposed||document.hidden||!visible)return;const dt=last?Math.min(.1,(now-last)/1000):0;
   if(last&&dt<1/28){frame=requestAnimationFrame(draw);return;}last=now;if(!quiet.matches)time+=dt;
   context!.clearRect(0,0,width,height);context!.font='10px "IAVSE Mono",monospace';context!.textAlign='center';context!.textBaseline='middle';
   const step=width<600?15:14,rows=Math.ceil(height/step),cols=Math.ceil(width/step);
   for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const x=col*step,y=row*step,density=asciiWave(x/width*1800,y/height,time,pointer),index=Math.floor(density*(chars.length-1));if(index<1)continue;
    context!.fillStyle=`rgba(${115+Math.round(density*80)},${174+Math.round(density*55)},255,${(.15+density*.65).toFixed(2)})`;context!.fillText(chars[index],x,y);
   }
   if(!quiet.matches)frame=requestAnimationFrame(draw);
  }
  function wake(){if(!disposed&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function resize(){const r=canvas!.getBoundingClientRect();width=Math.max(1,Math.round(r.width));height=Math.max(1,Math.round(r.height));const dpr=Math.min(devicePixelRatio||1,1.5);canvas!.width=width*dpr;canvas!.height=height*dpr;context!.setTransform(dpr,0,0,dpr,0,0);last=0;wake();}
  function preference(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;wake();}
  function visibility(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;wake();}
  function move(e:PointerEvent){if(quiet.matches||e.pointerType==='touch')return;pointer=Math.max(0,Math.min(1,e.clientX/innerWidth));}
  const bounds=new ResizeObserver(resize);bounds.observe(canvas);const intersection=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)wake();else{cancelAnimationFrame(frame);frame=0;last=0;}});intersection.observe(canvas);
  window.addEventListener('pointermove',move,{passive:true});quiet.addEventListener('change',preference);document.addEventListener('visibilitychange',visibility);resize();
  const links=Array.from(host.querySelectorAll<HTMLElement>('[data-rb-magnetic]'));const cleanups=links.map(link=>{
   const move=(e:PointerEvent)=>{if(quiet.matches||e.pointerType==='touch')return;const r=link.getBoundingClientRect();link.style.setProperty('--rb-mx',((e.clientX-r.left-r.width/2)*.065).toFixed(2)+'px');link.style.setProperty('--rb-my',((e.clientY-r.top-r.height/2)*.08).toFixed(2)+'px');};
   const reset=()=>{link.style.removeProperty('--rb-mx');link.style.removeProperty('--rb-my');};link.addEventListener('pointermove',move,{passive:true});link.addEventListener('pointerleave',reset);return()=>{link.removeEventListener('pointermove',move);link.removeEventListener('pointerleave',reset);reset();};
  });
  return()=>{disposed=true;cancelAnimationFrame(frame);bounds.disconnect();intersection.disconnect();window.removeEventListener('pointermove',move);quiet.removeEventListener('change',preference);document.removeEventListener('visibilitychange',visibility);cleanups.forEach(fn=>fn());};
 },[]);
 return <span ref={ref} hidden aria-hidden="true"/>;
}
