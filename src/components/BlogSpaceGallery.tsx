'use client';

import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {Icon} from './Icons';
import {FeedAvatar} from './FeedAvatar';
import {observeGalleryFrame} from '@/lib/gallery-frame-ready';

export type GallerySpace={handle:string;name:string;intro:string;avatarId:string;href:string};
type Labels={open:string;preview:string;browse:string;directory:string};

/** Published pages remain DOM documents, rather than flattened project-cover textures. */
function GalleryPanel({space,labels,index,active}:{space:GallerySpace;labels:Labels;index:number;active:boolean}){
 const host=useRef<HTMLElement>(null),surface=useRef<HTMLDivElement>(null),readiness=useRef<(()=>void)|null>(null),[loaded,setLoaded]=useState(false);
 useEffect(()=>{setLoaded(false);return()=>{readiness.current?.();readiness.current=null;};},[active,space.href]);
 useEffect(()=>{
  const element=host.current,plane=surface.current;if(!element||!plane)return;
  const preference=matchMedia('(prefers-reduced-motion:reduce)'),pointer=matchMedia('(pointer:fine)');
  let frame=0,visible=false,x=0,y=0,targetX=0,targetY=0,bounds:DOMRect|null=null,savedReduced=false;
  try{savedReduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const reduced=()=>savedReduced||preference.matches||!pointer.matches;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;};
  const draw=()=>{frame=0;if(!visible||document.hidden)return;x+=(targetX-x)*.16;y+=(targetY-y)*.16;plane.style.setProperty('--gallery-x',x.toFixed(3));plane.style.setProperty('--gallery-y',y.toFixed(3));if(Math.abs(x-targetX)+Math.abs(y-targetY)>.002)frame=requestAnimationFrame(draw);};
  const wake=()=>{if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);};
  const move=(event:PointerEvent)=>{if(reduced()||event.pointerType==='touch')return;bounds||=element.getBoundingClientRect();targetX=(event.clientX-bounds.left)/bounds.width*2-1;targetY=(event.clientY-bounds.top)/bounds.height*2-1;wake();};
  const reset=()=>{bounds=null;targetX=targetY=0;wake();};
  const measure=()=>{const width=plane.clientWidth;plane.style.setProperty('--gallery-scale',String(width/1200));bounds=null;};
  const resize=new ResizeObserver(measure);resize.observe(plane);measure();
  // Unmount off-screen documents so author scripts/media cannot accumulate.
  const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);if(visible){element.dataset.entered='true';wake();}else stop();},{rootMargin:'160px 0px',threshold:0});observer.observe(element);
  const visibility=()=>{if(document.hidden)stop();else wake();};
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action!=='reduced')return;savedReduced=!!detail.value;stop();x=y=targetX=targetY=0;plane.style.setProperty('--gallery-x','0');plane.style.setProperty('--gallery-y','0');};
  element.addEventListener('pointermove',move,{passive:true});element.addEventListener('pointerleave',reset);window.addEventListener('scroll',reset,{passive:true});document.addEventListener('visibilitychange',visibility);window.addEventListener('iavse-scene-control',control);preference.addEventListener('change',reset);pointer.addEventListener('change',reset);
  return()=>{stop();observer.disconnect();resize.disconnect();element.removeEventListener('pointermove',move);element.removeEventListener('pointerleave',reset);window.removeEventListener('scroll',reset);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('iavse-scene-control',control);preference.removeEventListener('change',reset);pointer.removeEventListener('change',reset);};
 },[]);
 return <article ref={host} className="blog-gallery-exhibit" data-gallery-handle={space.handle} data-side={index%2?'right':'left'}>
  <div className="blog-gallery-plinth" aria-hidden="true"/>
  <div ref={surface} className="blog-gallery-plane">
   <div className="blog-gallery-browser" aria-hidden="true"><span className="blog-gallery-dots"><i/><i/><i/></span><span>iavse / {space.handle}</span><Icon name="arrow"/></div>
   <div className="blog-gallery-viewport" data-loaded={loaded}>
    <div className="blog-gallery-placeholder" aria-hidden="true"><span>@{space.handle}</span><FeedAvatar name={space.name} avatarId={space.avatarId}/><strong>{space.name}</strong><p>{space.intro}</p></div>
    {active&&<iframe src={space.href+'?embed=gallery'} title={labels.preview+' · '+space.name} tabIndex={-1} aria-hidden="true" loading="lazy" referrerPolicy="same-origin" sandbox="allow-scripts allow-same-origin" onLoad={event=>{readiness.current?.();readiness.current=observeGalleryFrame(event.currentTarget,()=>setLoaded(true));}}/>}
   </div>
   <Link className="blog-gallery-open" href={space.href} aria-label={labels.open+' · '+space.name}><span>{labels.open}<Icon name="arrow"/></span></Link>
  </div>
  <div className="blog-gallery-caption"><span>{space.name}</span><span>@{space.handle}</span></div>
 </article>;
}

export function BlogSpaceGallery({spaces,labels}:{spaces:GallerySpace[];labels:Labels}){
 const host=useRef<HTMLElement>(null),[active,setActive]=useState<string[]>([]);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  let saved=false;try{saved=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  element.toggleAttribute('data-gallery-reduced',saved);
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced')element.toggleAttribute('data-gallery-reduced',!!detail.value);};
  window.addEventListener('iavse-scene-control',control);return()=>window.removeEventListener('iavse-scene-control',control);
 },[]);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  let frame=0;
  const update=()=>{
   frame=0;const height=innerHeight;
   // Read the row geometry together, then write transforms. This never changes
   // layout and never creates a continuously running animation frame loop.
   const panels=Array.from(element.querySelectorAll<HTMLElement>('[data-gallery-handle]')).map(panel=>({panel,handle:panel.dataset.galleryHandle!,rect:panel.getBoundingClientRect()}));
   const candidates=panels.filter(({rect})=>rect.bottom>-160&&rect.top<height+160).sort((a,b)=>Math.abs(a.rect.top+a.rect.height/2-height/2)-Math.abs(b.rect.top+b.rect.height/2-height/2)).slice(0,innerWidth<768?2:3).map(panel=>panel.handle).sort();
   for(const {panel,rect} of panels)panel.style.setProperty('--gallery-reveal',String(Math.max(0,Math.min(1,(height-rect.top)/(height*.7)))));
   setActive(previous=>previous.join('|')===candidates.join('|')?previous:candidates);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const resize=new ResizeObserver(schedule);resize.observe(element);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);update();
  return()=>{cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
 },[spaces]);
 // Every discoverable space has one exhibit; only the nearest three documents
 // are mounted. The accessible directory remains available below the exhibition.
 return <section ref={host} className="blog-gallery" aria-label={labels.directory} data-count={spaces.length}>
  <div className="blog-gallery-floor" aria-hidden="true"/>
  <div className="blog-gallery-exhibits">{spaces.map((space,index)=><GalleryPanel key={space.handle} space={space} labels={labels} index={index} active={active.includes(space.handle)}/>)}</div>
  <a className="blog-gallery-scroll" href="#blog-spaces-directory"><span>{labels.browse}</span><Icon name="chevron-down"/></a>
 </section>;
}
