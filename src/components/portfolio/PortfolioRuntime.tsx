'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {ShaderFlow} from './ShaderFlow';
import 'lenis/dist/lenis.css';

/** Portfolio's shared flow backdrop and Lenis foundation, adapted to IAVSE's routes and preferences. */
export function PortfolioRuntime(){
 const path=usePathname(),[dark,setDark]=useState(false),[enabled,setEnabled]=useState(false),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const sync=()=>setDark(document.documentElement.dataset.colorMode==='dark');sync();const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-color-mode']});return()=>observer.disconnect();},[]);
 useEffect(()=>{
  const active=!/^\/(?:blog\/|blogs\/showcase\/|admin(?:\/|$)|workspace(?:\/|$))/.test(path);setEnabled(active);
  if(!active)return;let disposed=false,generation=0,stop=()=>{};
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const setup=()=>{const attempt=++generation;stop();if(media.matches){document.documentElement.dataset.portfolioMotion='reduced';return;}import('lenis').then(({default:Lenis})=>{
   if(disposed||media.matches||attempt!==generation)return;const lenis=new Lenis({duration:1.6,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true,syncTouch:false,anchors:{offset:-112},prevent:node=>!!node.closest('input,textarea,select,[data-lenis-prevent],details[open]')});
   let frame=0;const tick=(now:number)=>{lenis.raf(now);frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);document.documentElement.dataset.portfolioMotion='lenis';stop=()=>{cancelAnimationFrame(frame);lenis.destroy();};
  }).catch(()=>{if(!disposed)document.documentElement.dataset.portfolioMotion="native";});};setup();media.addEventListener('change',setup);
  return()=>{disposed=true;stop();media.removeEventListener('change',setup);delete document.documentElement.dataset.portfolioMotion;};
 },[path]);
 return <div ref={ref} className={"portfolio-backdrop"+(path==='/'?'':' is-inner')} aria-hidden="true" hidden={!enabled}>{enabled&&<ShaderFlow className="portfolio-flow" brightness={dark?1:3} iterations={10} flowSpeed={[0,.1]} colorLowA={dark?[.025,.04,.07]:[.18,.2,.3]} colorHighA={dark?[.18,.22,.28]:[.55,.38,.32]}/>}</div>;
}
