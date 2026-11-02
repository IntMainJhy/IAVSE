'use client';

import Link from 'next/link';
import {useEffect,useMemo,useRef,useState,type KeyboardEvent,type CSSProperties} from 'react';
import {gsap} from 'gsap';
import {Icon} from './Icons';
import {FeedAvatar} from './FeedAvatar';
import {observeGalleryFrame} from '@/lib/gallery-frame-ready';
import {gallerySpacePose} from '@/lib/blog-gallery-space.mjs';

export type GallerySpace={handle:string;name:string;intro:string;avatarId:string;href:string;avatarSrc?:string;showcase?:boolean;role?:string;template?:string};
type Labels={open:string;preview:string;browse:string;directory:string;previous:string;next:string;select:string;close:string;overview:string};
function GalleryAvatar({space}:{space:GallerySpace}){return space.avatarSrc?<img className="gallery-avatar" src={space.avatarSrc} alt="" width={36} height={36}/>:<FeedAvatar name={space.name} avatarId={space.avatarId}/>;}

function GalleryPanel({space,labels,selected,mounted,index,onSelect}:{space:GallerySpace;labels:Labels;selected:boolean;mounted:boolean;index:number;onSelect:()=>void}){
 const surface=useRef<HTMLDivElement>(null),readiness=useRef<(()=>void)|null>(null),[loaded,setLoaded]=useState(false);
 useEffect(()=>{const plane=surface.current;if(!plane)return;const measure=()=>plane.style.setProperty('--gallery-scale',String(plane.clientWidth/1200));const resize=new ResizeObserver(measure);resize.observe(plane);measure();return()=>resize.disconnect();},[]);
 useEffect(()=>()=>{readiness.current?.();readiness.current=null;},[space.href]);
 return <article className="blog-gallery-exhibit" data-gallery-handle={space.handle} data-selected={selected} style={{'--float-delay':`${index*-1.7}s`,'--float-duration':`${7+index*.8}s`} as CSSProperties}>
  <div className="blog-gallery-float">
   <div ref={surface} className="blog-gallery-plane">
    <div className="blog-gallery-browser" aria-hidden="true"><span className="blog-gallery-dots"><i/><i/><i/></span><span>iavse / {space.handle}</span><Icon name="arrow"/></div>
    <div className="blog-gallery-viewport" data-loaded={loaded}>
     <div className="blog-gallery-placeholder" aria-hidden="true"><span>@{space.handle}</span><GalleryAvatar space={space}/><strong>{space.name}</strong><p>{space.intro}</p></div>
     {mounted&&<iframe src={space.href+'?embed=gallery'} title={labels.preview+' · '+space.name} tabIndex={-1} aria-hidden="true" loading="eager" referrerPolicy="same-origin" sandbox="allow-scripts allow-same-origin" onLoad={event=>{readiness.current?.();readiness.current=observeGalleryFrame(event.currentTarget,()=>setLoaded(true));}}/>}
    </div>
    <button className="blog-gallery-select" type="button" onClick={onSelect} aria-label={labels.select+' · '+space.name} aria-pressed={selected} data-gallery-trigger={space.handle}/>
   </div>
   <div className="blog-gallery-signature" aria-hidden="true"><GalleryAvatar space={space}/><span>{space.name}</span></div>
  </div>
 </article>;
}

/** A bounded collection of persistent page previews, independently positioned in 3D. */
export function BlogSpaceGallery({spaces,labels}:{spaces:GallerySpace[];labels:Labels}){
 const exhibits=useMemo(()=>spaces.slice(0,9),[spaces]),host=useRef<HTMLElement>(null),select=useRef<(index:number)=>void>(()=>{}),selectedHandle=useRef<string|null>(null),[selected,setSelected]=useState(-1),[mounted,setMounted]=useState(false);
 useEffect(()=>{
  const element=host.current,stage=element?.querySelector<HTMLElement>('.blog-gallery-exhibits'),world=element?.querySelector<HTMLElement>('.blog-gallery-world');if(!element||!stage||!world||!exhibits.length)return;
  let focus=exhibits.findIndex(space=>space.handle===selectedHandle.current);setSelected(focus);
  const preference=matchMedia('(prefers-reduced-motion:reduce)'),panels=Array.from(element.querySelectorAll<HTMLElement>('[data-gallery-handle]')),context=gsap.context(()=>{},element);
  let saved=false,width=0,height=0,visible=false,pointerFrame=0,targetX=0,targetY=0,x=0,y=0;
  try{saved=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const reduced=()=>saved||preference.matches;
  type Pose=ReturnType<typeof gallerySpacePose>;
  let poses:Pose[]=[];
  const paint=()=>panels.forEach((panel,index)=>{const pose=poses[index];if(!pose)return;panel.style.transform=`translate(-50%,-50%) translate3d(${pose.x}px,${pose.y}px,${pose.z}px) rotateX(${pose.rx}deg) rotateY(${pose.ry}deg) rotateZ(${pose.rz}deg) scale(${pose.scale})`;panel.style.opacity=String(pose.opacity);});
  const arrange=(animate:boolean)=>{
   const targets=panels.map((_,index)=>gallerySpacePose(index,panels.length,width,height,focus));
   if(!poses.length)poses=targets.map(pose=>({...pose}));
   context.add(()=>poses.forEach((pose,index)=>{gsap.to(pose,{...targets[index],duration:animate&&!reduced()?.96:0,ease:'power3.inOut',overwrite:true,onUpdate:paint});}));
   paint();
  };
  const measure=()=>{width=stage.clientWidth;height=stage.clientHeight;arrange(false);};const resize=new ResizeObserver(measure);resize.observe(stage);measure();element.setAttribute('data-gallery-ready','');
  const stopPointer=()=>{cancelAnimationFrame(pointerFrame);pointerFrame=0;};
  const pointerTick=()=>{pointerFrame=0;if(!visible||document.hidden||reduced())return;x+=(targetX-x)*.09;y+=(targetY-y)*.09;world.style.transform=`rotateX(${-y*1.7}deg) rotateY(${x*2.3}deg)`;if(Math.abs(x-targetX)+Math.abs(y-targetY)>.002)pointerFrame=requestAnimationFrame(pointerTick);};
  const wake=()=>{if(!pointerFrame&&visible&&!document.hidden&&!reduced())pointerFrame=requestAnimationFrame(pointerTick);};
  const move=(event:PointerEvent)=>{if(event.pointerType==='touch'||reduced())return;const bounds=stage.getBoundingClientRect();targetX=(event.clientX-bounds.left)/bounds.width*2-1;targetY=(event.clientY-bounds.top)/bounds.height*2-1;wake();};
  const reset=()=>{targetX=targetY=0;wake();};
  select.current=(index:number)=>{focus=index<0?-1:Math.min(index,exhibits.length-1);selectedHandle.current=focus<0?null:exhibits[focus].handle;setSelected(focus);arrange(true);reset();};
  const updatePreference=()=>{element.toggleAttribute('data-gallery-reduced',reduced());if(reduced()){stopPointer();x=y=targetX=targetY=0;world.style.transform='none';arrange(false);}};
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced'){saved=!!detail.value;updatePreference();}};
  const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);element.toggleAttribute('data-gallery-running',visible&&!document.hidden);if(visible){setMounted(true);wake();}else stopPointer();},{rootMargin:'100px 0px'});observer.observe(element);
  const visibility=()=>{element.toggleAttribute('data-gallery-running',visible&&!document.hidden);if(document.hidden)stopPointer();else wake();};
  stage.addEventListener('pointermove',move,{passive:true});stage.addEventListener('pointerleave',reset);document.addEventListener('visibilitychange',visibility);window.addEventListener('iavse-scene-control',control);preference.addEventListener('change',updatePreference);updatePreference();
  return()=>{select.current=()=>{};context.revert();stopPointer();observer.disconnect();resize.disconnect();stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',reset);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('iavse-scene-control',control);preference.removeEventListener('change',updatePreference);};
 },[exhibits]);
 const current=exhibits[selected];
 const close=()=>{const handle=selectedHandle.current;select.current(-1);if(handle)host.current?.querySelector<HTMLButtonElement>(`[data-gallery-trigger="${CSS.escape(handle)}"]`)?.focus({preventScroll:true});};
 const key=(event:KeyboardEvent<HTMLElement>)=>{if(event.altKey||event.metaKey||event.ctrlKey)return;if(event.key==='Escape'&&selected>=0){event.preventDefault();close();return;}let index:number|undefined;if(event.key==='ArrowRight')index=(selected+1)%exhibits.length;else if(event.key==='ArrowLeft')index=selected<0?exhibits.length-1:(selected-1+exhibits.length)%exhibits.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=exhibits.length-1;if(index!==undefined){event.preventDefault();select.current(index);}};
 if(!exhibits.length)return null;
 return <section ref={host} className="blog-gallery" data-mode="spatial" data-focused={selected>=0} aria-label={labels.directory} data-count={exhibits.length} onKeyDown={key}>
  <div className="blog-gallery-exhibits" onClick={event=>{if(event.target===event.currentTarget||event.target===(event.currentTarget.querySelector('.blog-gallery-world')))close();}}>
   <div className="blog-gallery-floor" aria-hidden="true"/>
   <div className="blog-gallery-world">{exhibits.map((space,index)=><GalleryPanel key={space.handle} space={space} labels={labels} index={index} selected={selected===index} mounted={mounted} onSelect={()=>select.current(selected===index?-1:index)}/>)}</div>
  </div>
  <div className="gallery-current" aria-live="polite" aria-atomic="true">{current?<><button type="button" className="gallery-return" onClick={close}><Icon name="close"/>{labels.close}</button><div><span>{current.name}</span><small>{current.role||'@'+current.handle}</small></div><Link href={current.href}>{labels.open}<Icon name="arrow"/></Link></>:<p className="gallery-overview-hint">{labels.overview}</p>}</div>
  <div className="gallery-authors" aria-label={labels.select}>{exhibits.map((space,index)=><button type="button" key={space.handle} aria-label={space.name} aria-pressed={selected===index} onClick={()=>select.current(selected===index?-1:index)}><GalleryAvatar space={space}/><span className="gallery-author-name">{space.name}</span></button>)}</div>
  <a className="blog-gallery-scroll" href="#blog-spaces-directory"><span>{labels.browse}</span><Icon name="chevron-down"/></a>
 </section>;
}
