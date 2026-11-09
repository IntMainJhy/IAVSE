'use client';
import {useEffect,useId,useRef,useState} from 'react';
import type {CSSProperties,ReactNode} from 'react';
import Link from 'next/link';
import {Icon} from './Icons';
import {spatialChapterAt} from '@/lib/home-spatial.mjs';
import '@/app/home-spatial.css';

type Chapter={id:string;title:string;description:string;action:string;href:string;headingId:string;content:ReactNode};
export function HomeSpatialShowcase({chapters,label,previous,next}:{chapters:Chapter[];label:string;previous:string;next:string}){
 const [active,setActive]=useState(0),[spatial,setSpatial]=useState(false),root=useRef<HTMLDivElement>(null),shell=useRef<HTMLDivElement>(null),tabs=useRef<(HTMLButtonElement|null)[]>([]),panels=useRef<(HTMLElement|null)[]>([]),id=useId();
 const geometry=useRef({start:0,travel:1,flowStarts:[] as number[]}),manual=useRef<number|null>(null),release=useRef<ReturnType<typeof setTimeout>|null>(null),spatialRef=useRef(false);
 useEffect(()=>{
  const host=root.current,stage=shell.current;if(!host||!stage)return;
  const desktop=matchMedia('(min-width:1100px) and (min-height:900px)'),quiet=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,disposed=false;
  function update(){frame=0;if(disposed)return;const {start,travel,flowStarts}=geometry.current;if(spatialRef.current){const p=Math.max(0,Math.min(1,(window.scrollY-start)/travel));host!.style.setProperty('--hs-progress',String(p));if(manual.current===null)setActive(spatialChapterAt(window.scrollY,start,travel,chapters.length));}else if(manual.current===null){const cursor=window.scrollY+Math.min(window.innerHeight*.35,200);let index=0;flowStarts.forEach((top,i)=>{if(cursor>=top)index=i;});setActive(index);}}
  function request(){if(!frame)frame=requestAnimationFrame(update);}
  function measure(){if(disposed)return;const viewport=stage!.querySelector<HTMLElement>('.hs-viewport'),panel=stage!.querySelector<HTMLElement>('.hs-panel');geometry.current={start:host!.getBoundingClientRect().top+window.scrollY-86,travel:Math.max(1,host!.offsetHeight-stage!.offsetHeight),flowStarts:panels.current.map(panel=>panel?panel.getBoundingClientRect().top+window.scrollY:Infinity)};if(viewport&&panel)host!.style.setProperty('--hs-panel-left',Math.round((viewport.clientWidth-panel.offsetWidth)/2)+'px');request();}
  function preference(){const enabled=desktop.matches&&!quiet.matches;spatialRef.current=enabled;setSpatial(enabled);manual.current=null;requestAnimationFrame(measure);}
  function unlock(){manual.current=null;if(release.current)clearTimeout(release.current);release.current=null;request();}
  const resize=new ResizeObserver(measure);resize.observe(host);resize.observe(stage);panels.current.forEach(panel=>{if(panel)resize.observe(panel);});preference();
  desktop.addEventListener('change',preference);quiet.addEventListener('change',preference);window.addEventListener('scroll',request,{passive:true});window.addEventListener('scrollend',unlock);window.addEventListener('wheel',unlock,{passive:true});window.addEventListener('touchstart',unlock,{passive:true});
  return()=>{disposed=true;if(frame)cancelAnimationFrame(frame);if(release.current)clearTimeout(release.current);resize.disconnect();desktop.removeEventListener('change',preference);quiet.removeEventListener('change',preference);window.removeEventListener('scroll',request);window.removeEventListener('scrollend',unlock);window.removeEventListener('wheel',unlock);window.removeEventListener('touchstart',unlock);};
 },[chapters.length]);
 useEffect(()=>{if(!spatial)return;const focused=document.activeElement;for(let index=0;index<panels.current.length;index++)if(index!==active&&focused&&panels.current[index]?.contains(focused)){tabs.current[active]?.focus({preventScroll:true});break;}},[active,spatial]);
 function choose(index:number){
  const selected=Math.max(0,Math.min(chapters.length-1,index));setActive(selected);manual.current=selected;if(release.current)clearTimeout(release.current);release.current=setTimeout(()=>{manual.current=null;},1300);
  if(spatialRef.current){const {start,travel}=geometry.current;window.scrollTo({top:start+selected/Math.max(1,chapters.length-1)*travel,behavior:'smooth'});}
  else panels.current[selected]?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 return <div ref={root} className="hs-journey" data-spatial={spatial} data-chapter={active}>
  <div ref={shell} className="hs-shell">
   <nav className="hs-chapter-nav" aria-label={label}><div role={spatial?'tablist':undefined} aria-label={spatial?label:undefined} onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const selected=event.key==='Home'?0:event.key==='End'?chapters.length-1:(active+(event.key==='ArrowRight'?1:-1)+chapters.length)%chapters.length;choose(selected);tabs.current[selected]?.focus({preventScroll:true});}}>{chapters.map((chapter,index)=><button ref={node=>{tabs.current[index]=node;}} key={chapter.id} id={id+'-tab-'+index} type="button" role={spatial?'tab':undefined} aria-selected={spatial?index===active:undefined} aria-current={!spatial&&index===active?'step':undefined} aria-controls={chapter.id} tabIndex={spatial&&index!==active?-1:0} onClick={()=>choose(index)}>{chapter.title}</button>)}</div></nav>
   <div className="hs-viewport"><div className="hs-floor" aria-hidden="true"/><div className="hs-camera">{chapters.map((chapter,index)=><section ref={node=>{panels.current[index]=node;}} key={chapter.id} id={chapter.id} className="hs-panel" data-scene={chapter.id} data-active={index===active} role={spatial?'tabpanel':undefined} aria-labelledby={spatial?id+'-tab-'+index:chapter.headingId} aria-hidden={spatial&&index!==active?true:undefined} inert={spatial&&index!==active} style={{'--hs-offset':index-active,'--hs-depth':Math.abs(index-active)} as CSSProperties}>
     <header className="hs-panel-heading"><div><h3 id={chapter.headingId}>{chapter.title}</h3><p>{chapter.description}</p></div><Link href={chapter.href}>{chapter.action}<Icon name="arrow"/></Link></header><div className="hs-panel-content">{chapter.content}</div>
    </section>)}</div></div>
   {spatial&&<div className="hs-navigation"><div className="hs-progress" aria-hidden="true"><span/></div><div className="hs-step-buttons"><button type="button" aria-label={previous} disabled={active===0} onClick={()=>choose(active-1)}><Icon name="arrow"/></button><button type="button" aria-label={next} disabled={active===chapters.length-1} onClick={()=>choose(active+1)}><Icon name="arrow"/></button></div></div>}
  </div>
 </div>;
}
