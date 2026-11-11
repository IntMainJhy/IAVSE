// RBP Portfolio motion with viewport entry, as requested for IAVSE.
// Source 1581b9b8; see docs/licenses/RBP-Portfolio.txt.
"use client";
import {motion,useAnimationControls,useMotionValue,useReducedMotion} from 'motion/react';
import {useEffect,useRef} from 'react';
import type {ReactNode} from 'react';
import {RBP_MOTION} from '@/lib/rbp-motion.mjs';
const EASE=[...RBP_MOTION.ease] as [number,number,number,number];
const HIDDEN={opacity:0,y:RBP_MOTION.distance};
const VISIBLE={opacity:1,y:0};
export function FadeIn({children,delay=0,duration=.8,className,reveal='scroll'}:{children:ReactNode;delay?:number;duration?:number;className?:string;reveal?:'scroll'|'mount'}):ReactNode{
 const quiet=useReducedMotion();
 const nodeRef=useRef<HTMLDivElement>(null);
 const controls=useAnimationControls();
 const y=useMotionValue(quiet?0:RBP_MOTION.distance);
 useEffect(()=>{
  if(reveal==='mount')return;
  const node=nodeRef.current;
  if(!node)return;
  if(quiet||typeof IntersectionObserver==='undefined'){
   controls.set(VISIBLE);
   return()=>controls.stop();
  }
  let visible=false,disposed=false,frame=0,rootBounds:DOMRectReadOnly|null=null;
  const show=(instant=false)=>{
   if(disposed||(visible&&!instant))return;
   visible=true;
   if(instant){controls.stop();controls.set(VISIBLE);}else void controls.start(VISIBLE);
  };
  const check=()=>{
   if(disposed)return;
   const rect=node.getBoundingClientRect();
   // Observe layout coordinates, so our own 12px entry transform cannot rearm it.
   const top=rect.top-y.get(),bottom=rect.bottom-y.get();
   if(node.contains(document.activeElement)){show(true);return;}
   if(bottom<=0||top>=window.innerHeight||rect.right<=0||rect.left>=window.innerWidth){
    if(visible){visible=false;controls.stop();controls.set(HIDDEN);}
    return;
   }
   if(visible||!rootBounds||rect.width<=0||rect.height<=0)return;
   const width=Math.max(0,Math.min(rect.right,rootBounds.right)-Math.max(rect.left,rootBounds.left));
   const height=Math.max(0,Math.min(bottom,rootBounds.bottom)-Math.max(top,rootBounds.top));
   if(width*height/(rect.width*rect.height)>=RBP_MOTION.threshold)show();
  };
  const schedule=()=>{
   if(!frame)frame=requestAnimationFrame(()=>{frame=0;check();});
  };
  const observer=new IntersectionObserver(entries=>{
   if(disposed)return;
   for(const entry of entries)if(entry.target===node){
    rootBounds=entry.rootBounds;
    if(rootBounds)check();else show(true);
   }
  },{threshold:[0,RBP_MOTION.threshold],rootMargin:RBP_MOTION.margin});
  const resize=()=>{
   // Refresh native root bounds even when resizing does not cross a threshold.
   rootBounds=null;observer.unobserve(node);observer.observe(node);schedule();
  };
  const focus=()=>show(true);
  observer.observe(node);
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',resize);
  node.addEventListener('focusin',focus);
  node.addEventListener('focusout',schedule);
  return()=>{
   disposed=true;observer.disconnect();
   if(frame)cancelAnimationFrame(frame);
   window.removeEventListener('scroll',schedule);
   window.removeEventListener('resize',resize);
   node.removeEventListener('focusin',focus);
   node.removeEventListener('focusout',schedule);
   controls.stop();
  };
 },[controls,quiet,reveal,y]);
 return <motion.div ref={nodeRef} data-rbp-entry={reveal} initial={quiet?false:HIDDEN} animate={reveal==='mount'?VISIBLE:controls} style={reveal==='scroll'?{y}:undefined} transition={{duration:quiet?0:duration,delay:quiet?0:Math.min(delay,.21),ease:EASE}} className={className}>{children}</motion.div>;
}
export function ScaleUnblur({children,delay=0,duration=1,className}:{children:ReactNode;delay?:number;duration?:number;className?:string}):ReactNode{
 const quiet=useReducedMotion();
 return <motion.div data-rbp-entry="mount" initial={quiet?false:{opacity:0,scale:.7,filter:'blur(20px)'}} animate={{opacity:1,scale:1,filter:'blur(0px)'}} transition={{duration:quiet?0:duration,delay:quiet?0:delay,ease:EASE}} style={{transformOrigin:'center'}} className={className}>{children}</motion.div>;
}
