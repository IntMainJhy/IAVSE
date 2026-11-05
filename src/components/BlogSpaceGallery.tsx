'use client';

import Link from 'next/link';
import {useCallback,useEffect,useMemo,useRef,useState,type KeyboardEvent,type CSSProperties} from 'react';
import {gsap} from 'gsap';
import {Icon} from './Icons';
import {FeedAvatar} from './FeedAvatar';
import {observeGalleryFrame} from '@/lib/gallery-frame-ready';
import {cachedGalleryPreview,loadGalleryPreview} from '@/lib/gallery-preview';
import {useLocale} from './LocaleProvider';
import {gallerySpacePose,gallerySceneMetrics,galleryCameraPose,galleryViewDepth,galleryDepthExtent,galleryLoadOrder,galleryLimit} from '@/lib/blog-gallery-space.mjs';

export type GallerySpace={handle:string;name:string;intro:string;avatarId:string;href:string;avatarSrc?:string;showcase?:boolean;role?:string;template?:string;mode?:'theme'|'static'};
type Labels={open:string;preview:string;browse:string;directory:string;previous:string;next:string;select:string;close:string;overview:string;reset:string;loading:string};
function GalleryAvatar({space}:{space:GallerySpace}){return space.avatarSrc?<img className="gallery-avatar" src={space.avatarSrc} alt="" width={36} height={36}/>:<FeedAvatar name={space.name} avatarId={space.avatarId}/>;}

function GalleryPanel({space,labels,selected,mounted,index,onSelect,onReady}:{space:GallerySpace;labels:Labels;selected:boolean;mounted:boolean;index:number;onSelect:()=>void;onReady:(handle:string)=>void}){
 const {locale}=useLocale(),src=space.showcase||space.mode==='static'?space.href+'?embed=gallery':space.href+'/preview';
 const [html,setHtml]=useState<string|null|undefined>(()=>space.mode==='static'?null:cachedGalleryPreview(src,locale));
 const surface=useRef<HTMLDivElement>(null),readiness=useRef<(()=>void)|null>(null),done=useRef(false),[loaded,setLoaded]=useState(false);
 const ready=useCallback(()=>{if(done.current)return;done.current=true;onReady(space.handle);},[onReady,space.handle]);
 useEffect(()=>{const plane=surface.current;if(!plane)return;const measure=()=>plane.style.setProperty('--gallery-scale',String(plane.clientWidth/1200));const resize=new ResizeObserver(measure);resize.observe(plane);measure();return()=>resize.disconnect();},[]);
 // A failed public document must not hold the rest of the loading queue hostage.
 useEffect(()=>{if(!mounted||loaded)return;const timeout=setTimeout(ready,12000);return()=>clearTimeout(timeout);},[mounted,loaded,ready]);
 useEffect(()=>()=>{readiness.current?.();readiness.current=null;},[space.href]);
 useEffect(()=>{if(!mounted||space.mode==='static')return;let live=true;void loadGalleryPreview(src,locale,true).then(value=>{if(live)setHtml(value);});return()=>{live=false;};},[mounted,src,locale,space.mode]);
 return <article className="blog-gallery-exhibit" data-gallery-handle={space.handle} data-selected={selected} style={{'--float-delay':`${index*-1.7}s`,'--float-duration':`${8+index*.35}s`} as CSSProperties}>
  <div className="blog-gallery-float">
   <div ref={surface} className="blog-gallery-plane">
    <span className="gallery-card-back" aria-hidden="true"/><span className="gallery-card-edge edge-left" aria-hidden="true"/><span className="gallery-card-edge edge-right" aria-hidden="true"/><span className="gallery-card-edge edge-top" aria-hidden="true"/><span className="gallery-card-edge edge-bottom" aria-hidden="true"/>
    <div className="blog-gallery-viewport" data-loaded={loaded}>
     <div className="blog-gallery-placeholder" aria-hidden="true"><span>@{space.handle}</span><GalleryAvatar space={space}/><strong>{space.name}</strong><p>{space.intro}</p></div>
     {/* The stage owns interaction; themed documents stay server-rendered and script-free. */}
     {mounted&&html!==undefined&&<iframe src={html===null?src:undefined} srcDoc={html??undefined} title={labels.preview+' · '+space.name} tabIndex={-1} aria-hidden="true" loading="eager" referrerPolicy="same-origin" sandbox={space.mode==='static'?'allow-scripts allow-same-origin':'allow-same-origin'} onLoad={event=>{readiness.current?.();readiness.current=observeGalleryFrame(event.currentTarget,()=>{setLoaded(true);ready();});}}/>}
    </div>
    <button className="blog-gallery-select" type="button" onClick={onSelect} aria-label={labels.select+' · '+space.name} aria-pressed={selected} data-gallery-trigger={space.handle}/>
   </div>
   <div className="blog-gallery-signature" aria-hidden="true"><GalleryAvatar space={space}/><span>{space.name}</span></div>
  </div>
 </article>;
}

export function BlogSpaceGallery(props:{spaces:GallerySpace[];labels:Labels}){
 const {locale}=useLocale();return <GalleryScene key={locale} {...props}/>;
}

function GalleryScene({spaces,labels}:{spaces:GallerySpace[];labels:Labels}){
 const exhibits=useMemo(()=>spaces.slice(0,galleryLimit),[spaces]),host=useRef<HTMLElement>(null),select=useRef<(index:number)=>void>(()=>{}),resetView=useRef<()=>void>(()=>{}),selectedHandle=useRef<string|null>(null),suppressClick=useRef(false),settled=useRef(new Set<string>());
 const [selected,setSelected]=useState(-1),[activated,setActivated]=useState(false),[mounted,setMounted]=useState<string[]>([]),[settledVersion,setSettledVersion]=useState(0),[revealed,setRevealed]=useState(false);
 const onReady=useCallback((handle:string)=>{if(!settled.current.has(handle)){settled.current.add(handle);setSettledVersion(value=>value+1);}},[]);
 useEffect(()=>{if(exhibits.every(space=>settled.current.has(space.handle)))setRevealed(true);},[exhibits,settledVersion]);
 // One unavailable author cannot hide the entire discoverable directory.
 useEffect(()=>{if(!activated||revealed)return;const timer=setTimeout(()=>setRevealed(true),8000);return()=>clearTimeout(timer);},[activated,revealed]);
 useEffect(()=>{
  if(!activated)return;
  setMounted(current=>{const next=current.filter(handle=>exhibits.some(space=>space.handle===handle));let available=2-next.filter(handle=>!settled.current.has(handle)).length;for(const index of galleryLoadOrder(exhibits.length,selected)){const handle=exhibits[index].handle;if(available>0&&!next.includes(handle)){next.push(handle);available--;}}return next.length===current.length&&next.every((handle,index)=>handle===current[index])?current:next;});
 },[activated,exhibits,selected,settledVersion]);
 useEffect(()=>{
  const element=host.current,stage=element?.querySelector<HTMLElement>('.blog-gallery-exhibits'),world=element?.querySelector<HTMLElement>('.blog-gallery-world');if(!element||!stage||!world||!exhibits.length)return;
  let focus=exhibits.findIndex(space=>space.handle===selectedHandle.current);setSelected(focus);
  const preference=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)'),panels=Array.from(element.querySelectorAll<HTMLElement>('[data-gallery-handle]')),context=gsap.context(()=>{},element);
  let saved=false,width=0,height=0,cardWidth=360,perspective=1000,visible=false,pointerFrame=0,orbitYaw=0,orbitPitch=0,pointerYaw=0,pointerPitch=0;
  let drag:{id:number;x:number;y:number;yaw:number;pitch:number;active:boolean}|null=null,tween:gsap.core.Tween|undefined,pointerPosition:{x:number;y:number}|null=null;
  try{saved=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const reduced=()=>saved||preference.matches;
  type Pose=ReturnType<typeof gallerySpacePose>;type Camera=ReturnType<typeof galleryCameraPose>;
  const rendered=panels.map(()=>({transform:'',visibility:'',opacity:'',haze:''}));
  let poses:Pose[]=[],camera:Camera={x:0,y:0,z:0,yaw:0,pitch:0};
  const paint=()=>{
   world.style.transform=`translate3d(${camera.x}px,${camera.y}px,${camera.z}px) rotateX(${camera.pitch}deg) rotateY(${camera.yaw}deg)`;
   for(let index=0;index<panels.length;index++){
    const panel=panels[index],pose=poses[index];if(!pose)continue;
    const cached=rendered[index],transform=`translate(-50%,-50%) translate3d(${pose.x}px,${pose.y}px,${pose.z}px) rotateX(${pose.rx}deg) rotateY(${pose.ry}deg) rotateZ(${pose.rz}deg)`;
    if(cached.transform!==transform){panel.style.transform=transform;cached.transform=transform;}
    const depth=galleryViewDepth(pose,camera),near=Math.max(0,Math.min(1,(perspective-90-galleryDepthExtent(pose,camera,cardWidth)-depth)/220));
    // Cull only pages the camera actually passes. Distant pages stay in their places.
    const visibility=near===0?'hidden':'visible',opacity=String(near),haze=String(Math.max(0,Math.min(.22,-depth/7000)));
    if(cached.visibility!==visibility){panel.style.visibility=visibility;cached.visibility=visibility;}
    if(cached.opacity!==opacity){panel.style.opacity=opacity;cached.opacity=opacity;}
    if(cached.haze!==haze){panel.style.setProperty('--gallery-haze',haze);cached.haze=haze;}
   }
  };
  const stopPointer=()=>{cancelAnimationFrame(pointerFrame);pointerFrame=0;};
  const pointerTick=()=>{pointerFrame=0;if(!visible||document.hidden||reduced()||focus>=0||tween?.isActive())return;if(pointerPosition){const bounds=stage.getBoundingClientRect();pointerYaw=((pointerPosition.x-bounds.left)/bounds.width*2-1)*3.5;pointerPitch=-((pointerPosition.y-bounds.top)/bounds.height*2-1)*2.2;pointerPosition=null;}const yaw=orbitYaw+pointerYaw,pitch=orbitPitch+pointerPitch;camera.yaw+=(yaw-camera.yaw)*.1;camera.pitch+=(pitch-camera.pitch)*.1;paint();if(Math.abs(yaw-camera.yaw)+Math.abs(pitch-camera.pitch)>.008)pointerFrame=requestAnimationFrame(pointerTick);};
  const wake=()=>{if(!pointerFrame&&visible&&!document.hidden&&!reduced()&&focus<0)pointerFrame=requestAnimationFrame(pointerTick);};
  const arrange=(animate:boolean)=>{
   tween?.kill();stopPointer();
   const targets=panels.map((_,index)=>gallerySpacePose(index,panels.length,width,height,focus)),targetCamera=galleryCameraPose(focus,panels.length,width,height,orbitYaw,orbitPitch);
   if(!poses.length||!animate||reduced()){poses=targets;camera=targetCamera;paint();return;}
   const starts=poses.map(pose=>({...pose})),startCamera={...camera},progress={value:0},poseKeys=['x','y','z','rx','ry','rz'] as const,cameraKeys=['x','y','z','yaw','pitch'] as const;
   // A single tween performs one O(n) paint per frame for the complete scene.
   context.add(()=>{tween=gsap.to(progress,{value:1,duration:1.2,ease:'power3.inOut',onUpdate:()=>{const t=progress.value;for(let index=0;index<targets.length;index++)for(const key of poseKeys)poses[index][key]=starts[index][key]+(targets[index][key]-starts[index][key])*t;for(const key of cameraKeys)camera[key]=startCamera[key]+(targetCamera[key]-startCamera[key])*t;paint();},onComplete:wake});});
  };
  const measure=()=>{width=stage.clientWidth;height=stage.clientHeight;const metrics=gallerySceneMetrics(width);perspective=metrics.perspective;cardWidth=metrics.cardWidth;stage.style.setProperty('--gallery-perspective',perspective+'px');stage.style.setProperty('--gallery-card-width',metrics.cardWidth+'px');arrange(false);};
  const resize=new ResizeObserver(measure);resize.observe(stage);measure();element.setAttribute('data-gallery-ready','');
  select.current=(index:number)=>{focus=index<0?-1:Math.min(index,exhibits.length-1);selectedHandle.current=focus<0?null:exhibits[focus].handle;setSelected(focus);pointerPosition=null;pointerYaw=pointerPitch=0;arrange(true);};
  resetView.current=()=>{pointerPosition=null;orbitYaw=orbitPitch=pointerYaw=pointerPitch=0;arrange(true);};
  const down=(event:PointerEvent)=>{suppressClick.current=false;if(focus>=0||reduced()||!event.isPrimary||event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:orbitYaw,pitch:orbitPitch,active:false};};
  const move=(event:PointerEvent)=>{
   if(reduced()||focus>=0)return;
   if(drag&&drag.id===event.pointerId){const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!drag.active&&Math.hypot(dx,dy)>8&&(event.pointerType!=='touch'||Math.abs(dx)>Math.abs(dy)*1.2)){drag.active=true;stage.setPointerCapture(event.pointerId);element.setAttribute('data-gallery-dragging','');}if(drag.active){if(event.cancelable)event.preventDefault();pointerPosition=null;orbitYaw=Math.max(-16,Math.min(16,drag.yaw+dx*.06));orbitPitch=Math.max(-9,Math.min(9,drag.pitch-dy*.04));pointerYaw=pointerPitch=0;wake();return;}}
   if(event.pointerType==='touch'||!fine.matches)return;pointerPosition={x:event.clientX,y:event.clientY};wake();
  };
  const up=(event:PointerEvent)=>{if(!drag||drag.id!==event.pointerId)return;if(drag.active)suppressClick.current=true;drag=null;element.removeAttribute('data-gallery-dragging');if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);};
  const leave=()=>{if(drag?.active)return;pointerPosition=null;pointerYaw=pointerPitch=0;wake();};
  const updatePreference=()=>{element.toggleAttribute('data-gallery-reduced',reduced());if(reduced()){stopPointer();pointerPosition=null;orbitYaw=orbitPitch=pointerYaw=pointerPitch=0;arrange(false);}};
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced'){saved=!!detail.value;updatePreference();}};
  const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);element.toggleAttribute('data-gallery-running',visible&&!document.hidden);if(visible){setActivated(true);wake();}else stopPointer();},{rootMargin:'100px 0px'});observer.observe(element);
  const visibility=()=>{element.toggleAttribute('data-gallery-running',visible&&!document.hidden);if(document.hidden)stopPointer();else wake();};
  stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);window.addEventListener('iavse-scene-control',control);preference.addEventListener('change',updatePreference);updatePreference();
  return()=>{select.current=()=>{};resetView.current=()=>{};context.revert();stopPointer();observer.disconnect();resize.disconnect();stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerup',up);stage.removeEventListener('pointercancel',up);stage.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('iavse-scene-control',control);preference.removeEventListener('change',updatePreference);};
 },[exhibits]);
 const current=exhibits[selected];
 const close=()=>{const handle=selectedHandle.current;select.current(-1);if(handle)host.current?.querySelector<HTMLButtonElement>(`[data-gallery-trigger="${CSS.escape(handle)}"]`)?.focus({preventScroll:true});};
 const key=(event:KeyboardEvent<HTMLElement>)=>{if(event.altKey||event.metaKey||event.ctrlKey)return;if(event.key==='Escape'&&selected>=0){event.preventDefault();close();return;}const buttons=Array.from(host.current?.querySelectorAll<HTMLButtonElement>('.gallery-authors>button')||[]),author=(event.target as Element).closest<HTMLButtonElement>('.gallery-authors>button'),origin=author?buttons.indexOf(author):selected;let index:number|undefined;if(event.key==='ArrowRight')index=(origin+1)%exhibits.length;else if(event.key==='ArrowLeft')index=origin<0?exhibits.length-1:(origin-1+exhibits.length)%exhibits.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=exhibits.length-1;if(index!==undefined){event.preventDefault();select.current(index);host.current?.querySelectorAll<HTMLButtonElement>('.gallery-authors>button')[index]?.focus({preventScroll:true});}};
 if(!exhibits.length)return null;
 return <section ref={host} className="blog-gallery" data-mode="spatial" data-focused={selected>=0} data-gallery-prepared={revealed} aria-label={labels.directory} data-count={exhibits.length} onKeyDown={key}>
  <div className="gallery-view-tools"><button type="button" onClick={()=>resetView.current()} disabled={selected>=0}>{labels.reset}</button></div>
  <div className="blog-gallery-exhibits" onClickCapture={event=>{if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}} onClick={event=>{if(event.target===event.currentTarget)close();}}>
   {!revealed&&<div className="blog-gallery-loading" role="status"><span>{labels.loading}</span><span className="blog-gallery-progress" aria-hidden="true"><i style={{transform:`scaleX(${settled.current.size/Math.max(1,exhibits.length)})`}}/></span></div>}
   <div className="blog-gallery-world" inert={!revealed} aria-hidden={!revealed}>{exhibits.map((space,index)=><GalleryPanel key={space.handle} space={space} labels={labels} index={index} selected={selected===index} mounted={mounted.includes(space.handle)} onSelect={()=>select.current(selected===index?-1:index)} onReady={onReady}/>)}</div>
  </div>
  <div className="gallery-current" aria-live="polite" aria-atomic="true">{current?<><button type="button" className="gallery-return" onClick={close}><Icon name="close"/>{labels.close}</button><div><span>{current.name}</span><small>{current.role||'@'+current.handle}</small></div><Link href={current.href}>{labels.open}<Icon name="arrow"/></Link></>:<p className="gallery-overview-hint">{labels.overview}</p>}</div>
  <div className="gallery-authors" aria-label={labels.select}>{exhibits.map((space,index)=><button type="button" key={space.handle} aria-label={space.name} aria-pressed={selected===index} onClick={()=>select.current(selected===index?-1:index)}><GalleryAvatar space={space}/><span className="gallery-author-name">{space.name}</span></button>)}</div>
  <a className="blog-gallery-scroll" href="#blog-spaces-directory"><span>{labels.browse}</span><Icon name="chevron-down"/></a>
 </section>;
}
