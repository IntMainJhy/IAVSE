// RBP Portfolio motion with viewport entry, as requested for IAVSE.
// Source 1581b9b8; see docs/licenses/RBP-Portfolio.txt.
"use client";
import {motion,useReducedMotion} from 'motion/react';
import type {ReactNode} from 'react';
import {RBP_MOTION} from '@/lib/rbp-motion.mjs';
const EASE=[...RBP_MOTION.ease] as [number,number,number,number];
export function FadeIn({children,delay=0,duration=.8,className,reveal='scroll'}:{children:ReactNode;delay?:number;duration?:number;className?:string;reveal?:'scroll'|'mount'}):ReactNode{
 const quiet=useReducedMotion();
 const target={opacity:1,y:0};
 return <motion.div data-rbp-entry={reveal} initial={quiet?false:{opacity:0,y:RBP_MOTION.distance}} {...(reveal==='mount'?{animate:target}:{whileInView:target,viewport:{once:true,amount:RBP_MOTION.threshold,margin:RBP_MOTION.margin as `${number}px ${number}px ${number}% ${number}px`}})} transition={{duration:quiet?0:duration,delay:quiet?0:Math.min(delay,.21),ease:EASE}} className={className}>{children}</motion.div>;
}
export function ScaleUnblur({children,delay=0,duration=1,className}:{children:ReactNode;delay?:number;duration?:number;className?:string}):ReactNode{
 const quiet=useReducedMotion();
 return <motion.div data-rbp-entry="mount" initial={quiet?false:{opacity:0,scale:.7,filter:'blur(20px)'}} animate={{opacity:1,scale:1,filter:'blur(0px)'}} transition={{duration:quiet?0:duration,delay:quiet?0:delay,ease:EASE}} style={{transformOrigin:'center'}} className={className}>{children}</motion.div>;
}
