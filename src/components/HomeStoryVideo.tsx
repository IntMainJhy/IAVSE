'use client';
import {useHomeChapterActive} from './useHomeChapterActive';

import {useEffect,useRef,useState} from 'react';
import {Icon} from './Icons';

/** A recording of the actual public Skill directory, loaded only beside the viewport. */
export function HomeStoryVideo({src,poster,label,pauseLabel,playLabel}:{src:string;poster:string;label:string;pauseLabel:string;playLabel:string}){
 const host=useRef<HTMLDivElement>(null),video=useRef<HTMLVideoElement>(null);
 const chapterActive=useHomeChapterActive(host);
 const [enabled,setEnabled]=useState(false),[nearby,setNearby]=useState(false),[visible,setVisible]=useState(false),[hidden,setHidden]=useState(false),[reduced,setReduced]=useState(true),[paused,setPaused]=useState(false),[globalPaused,setGlobalPaused]=useState(false),[printing,setPrinting]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');let systemReduced=preference.matches,manualReduced=false;
  try{manualReduced=window.localStorage?.getItem('iavse-background-motion')==='reduce';}catch{}
  const syncMotion=()=>setReduced(systemReduced||manualReduced),motion=(event?:MediaQueryListEvent)=>{systemReduced=typeof event?.matches==='boolean'?event.matches:preference.matches;syncMotion();},visibility=()=>setHidden(document.hidden),beforePrint=()=>{video.current?.pause();setPrinting(true);},afterPrint=()=>setPrinting(false);
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value?:boolean}>).detail;if(!detail)return;if(detail.action==='reduced'){manualReduced=!!detail.value;syncMotion();}else if(detail.action==='paused')setGlobalPaused(!!detail.value);else if(detail.action==='replay'&&video.current){try{video.current.currentTime=0;}catch{}}};
  syncMotion();visibility();
  const proximity=new IntersectionObserver(entries=>setNearby(entries.some(entry=>entry.isIntersecting)),{rootMargin:'200px'}),viewport=new IntersectionObserver(entries=>setVisible(entries.some(entry=>entry.isIntersecting)),{threshold:.05});
  proximity.observe(element);viewport.observe(element);preference.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);window.addEventListener('beforeprint',beforePrint);window.addEventListener('afterprint',afterPrint);window.addEventListener('iavse-scene-control',control);
  return()=>{proximity.disconnect();viewport.disconnect();preference.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('beforeprint',beforePrint);window.removeEventListener('afterprint',afterPrint);window.removeEventListener('iavse-scene-control',control);};
 },[]);
 // Once prepared, retain the same media element across motion toggles. A quiet
 // initial visit only needs the poster and never requests the recording.
 // Once this chapter mounts the recording, buffer future frames before revealing
 // it; loadeddata alone only guarantees one decoded frame and can flash then stall.
 useEffect(()=>{if(chapterActive&&nearby&&!reduced&&!hidden&&!printing&&!globalPaused)setEnabled(true);},[chapterActive,nearby,reduced,hidden,printing,globalPaused]);
 useEffect(()=>{
  const element=video.current;if(!element)return;
  if(chapterActive&&enabled&&visible&&!hidden&&!reduced&&!paused&&!globalPaused&&!printing&&!failed){void element.play().catch(()=>{});}else element.pause();
  return()=>element.pause();
 },[chapterActive,enabled,visible,hidden,reduced,paused,globalPaused,printing,failed]);
 return <div ref={host} className="home-story-video" data-ready={ready&&!failed&&!reduced&&!printing?'true':'false'}>
  <img src={poster} alt={label} width={1200} height={900} loading="lazy" decoding="async"/>
  {enabled&&!failed&&<video ref={video} src={src} poster={poster} muted loop playsInline preload="auto" aria-hidden="true" onCanPlay={()=>setReady(true)} onError={()=>setFailed(true)}/>}
  {ready&&!failed&&!reduced&&<button type="button" className="home-media-pause" aria-label={paused?playLabel:pauseLabel} aria-pressed={paused} onClick={()=>setPaused(value=>!value)}><Icon name={paused?'play':'pause'}/></button>}
 </div>;
}
