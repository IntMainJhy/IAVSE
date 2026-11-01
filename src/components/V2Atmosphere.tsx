'use client';

import {useEffect,useRef} from 'react';
import type {GlassReveal,HomeGlassScene,HomeJourneyChapter} from '@/lib/home-glass';

const loadScene=(canvas:HTMLCanvasElement,signal:AbortSignal)=>import('@/lib/home-glass').then(module=>module.createHomeGlass(canvas,signal,{onProgress:value=>{canvas.dataset.loadingProgress=String(Math.round(value*100));}}));

/** Load the homepage-only renderer without blocking the semantic content. */
export function mountV2Atmosphere(canvas:HTMLCanvasElement,createScene=loadScene,{mode='home'}:{mode?:'home'|'interior'}={}){
 const surface=canvas.parentElement||canvas,host=canvas.closest(mode==='home'?'.v2-home':'.v2-site')||surface,preference=window.matchMedia('(prefers-reduced-motion: reduce)'),controller=new AbortController();
 let pointerBounds=canvas.getBoundingClientRect();
 const revealElements=new Set<HTMLElement>();
 let manualReduced=false,paused=false,systemReduced=preference.matches;
 try{manualReduced=mode==='home'&&window.localStorage?.getItem('iavse-background-motion')==='reduce';}catch{}
 let reducedMotion=manualReduced||systemReduced;
 let scene:HomeGlassScene|null=null,frame=0,lastDraw:number|null=null,activeTime=0,visible=false,printing=false,lost=false,disposed=false;
 let quality=1,slowFrames=0,healthyFrames=0,drawCount=0,sizedWidth=0,sizedHeight=0,sizedDpr=0,displayDpr=0,refreshPeriod=1/60,cadenceCandidate=1/60,cadenceSamples=0,renderCost=0;
 let targetX=0,targetY=0,pointerX=0,pointerY=0,progress=0,dirty=false,revealsDirty=true,progressDirty=true,layoutDirty=true,hostDocumentTop=0;
 canvas.dataset.atmosphere='loading';canvas.style.opacity='0';
 const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=0;lastDraw=null;if(scene)canvas.dataset.atmosphere=lost?'fallback':'paused';};
 const draw=()=>{
  if(!scene||disposed||lost||document.hidden||printing||!visible)return;
  try{
   if(layoutDirty){readLayout();layoutDirty=false;}
   if(progressDirty){readProgress();progressDirty=false;}
   if(revealsDirty){readReveals();revealsDirty=false;}
   const dark=document.documentElement.dataset.colorMode==='dark';
   const started=typeof performance==='undefined'?0:performance.now();
   if(scene.animated||activeTime)scene.render(pointerX,pointerY,dark,progress,reducedMotion,activeTime);
   else scene.render(pointerX,pointerY,dark,progress,reducedMotion);
   renderCost=typeof performance==='undefined'?0:(performance.now()-started)/1000;
   if(canvas.style.opacity!=='1')canvas.style.opacity='1';
  }
  catch{fail();}
 };
 const canRender=()=>!disposed&&!lost&&!!scene&&visible&&!document.hidden&&!printing;
 const continuous=()=>!!scene?.animated&&!reducedMotion&&!paused;
 const moving=()=>!reducedMotion&&scene?.interactive!==false&&Math.abs(targetX-pointerX)+Math.abs(targetY-pointerY)>.0001;
 const tick=(now:number)=>{
  frame=0;if(!canRender())return;
  const elapsed=lastDraw===null?1/120:Math.max(0,(now-lastDraw)/1000),amount=1-Math.exp(-7*Math.min(elapsed,.05));
  if(lastDraw!==null&&elapsed>=1/240&&elapsed<.05){
   // A single unusually short callback is not evidence of a 240Hz display.
   // Confirm faster cadence before using it to judge later frames as missed.
   if(elapsed<refreshPeriod*.85){
    if(Math.abs(elapsed-cadenceCandidate)<elapsed*.2)cadenceSamples++;else{cadenceCandidate=elapsed;cadenceSamples=1;}
    if(cadenceSamples>=3){refreshPeriod=cadenceCandidate;cadenceSamples=0;}
   }else{cadenceSamples=0;if(elapsed<refreshPeriod*1.15)refreshPeriod+=(elapsed-refreshPeriod)*.06;}
  }
  if(continuous())activeTime+=Math.min(elapsed,.25);
  lastDraw=now;pointerX+=(targetX-pointerX)*amount;pointerY+=(targetY-pointerY)*amount;dirty=false;draw();
  // Follow every display callback, including 120/144Hz. Adapt pixels, not animation cadence.
  // CPU submission time and sustained missed display intervals are bounded signals, not a claim of GPU completion time.
  if(continuous()&&++drawCount>24){
   const missedFrameThreshold=refreshPeriod<=.010?refreshPeriod*1.8:Math.max(.025,refreshPeriod*1.8);
   const late=renderCost>refreshPeriod*.7||elapsed>missedFrameThreshold;
   slowFrames=late?slowFrames+1:Math.max(0,slowFrames-1);healthyFrames=!late&&renderCost<refreshPeriod*.45?healthyFrames+1:0;
   const previousQuality=quality;
   if(slowFrames>=12&&quality>.72){quality=Math.max(.72,quality*.85);slowFrames=healthyFrames=0;}
   else if(healthyFrames>=180&&quality<1){quality=Math.min(1,quality/.85);healthyFrames=0;}
   if(quality!==previousQuality){sizedDpr=displayDpr*quality;scene?.resize(sizedWidth,sizedHeight,sizedDpr);canvas.dataset.glassQuality=quality.toFixed(2);canvas.dataset.glassCadence=String(Math.round(1/refreshPeriod));}
  }
  if(canRender()&&(dirty||moving()||continuous()))frame=requestAnimationFrame(tick);else stop();
 };
 const sync=()=>{
  if(canRender()&&(dirty||moving()||continuous())){if(!frame){canvas.dataset.atmosphere='running';frame=requestAnimationFrame(tick);}}
  else stop();
 };
 const clearReveals=()=>{for(const element of revealElements){delete element.dataset.glassMotion;for(const property of['--glass-reveal','--glass-lift','--glass-tilt'])element.style.removeProperty(property);}revealElements.clear();scene?.setReveals?.([]);};
 const hasJourney=()=>mode==='home'&&typeof scene?.setJourney==='function';
 const readLayout=()=>{
  const hostRect=host.getBoundingClientRect(),height=Math.max(pointerBounds.height,1);hostDocumentTop=hostRect.top+(window.scrollY||0);
  if(!hasJourney())return;
  // Sections keep their document geometry while their children move. Cache these
  // measurements after layout changes, never on each scroll or animation frame.
  const track=host.querySelector<HTMLElement>('.home-stories'),cinema=host.getAttribute('data-journey-motion')==='cinema',trackRect=cinema?track?.getBoundingClientRect():null,storyCount=host.querySelectorAll('[data-home-story]').length;
  const chapters:HomeJourneyChapter[]=Array.from(host.querySelectorAll<HTMLElement>('[data-home-story],[data-home-scene="invitation"]')).map((element,index)=>{
   const rect=element.getBoundingClientRect();const virtual=trackRect&&element.dataset.homeStory,span=trackRect?(trackRect.height-height)/Math.max(1,storyCount):0;return{id:element.dataset.homeStory||element.dataset.homeScene||'',start:((virtual?trackRect!.top+index*span:rect.top)-hostRect.top)/height,end:((virtual?trackRect!.top+(index+1)*span+height:rect.bottom)-hostRect.top)/height,side:element.dataset.homeSide==='right'?1:element.dataset.homeStory?-1:0};
  }).filter(chapter=>chapter.id&&Number.isFinite(chapter.start)&&Number.isFinite(chapter.end)&&chapter.end>chapter.start);
  scene?.setJourney?.(chapters);
 };
 const readReveals=()=>{
  if(!scene)return;if(reducedMotion){clearReveals();return;}
  if(hasJourney()){if(revealElements.size)clearReveals();return;}
  const viewport=canvas.getBoundingClientRect(),panels:GlassReveal[]=[];
  // Complete layout reads before writing any reveal styles.
  const measurements=Array.from(host.querySelectorAll?.<HTMLElement>('[data-glass-reveal]')||[]).map(element=>({element,rect:element.getBoundingClientRect()}));
  for(const {element,rect} of measurements){
   const raw=Math.max(0,Math.min(1,(viewport.height-(rect.top-viewport.top))/(viewport.height*.62+Math.min(rect.height,360)*.2))),open=raw*raw*(3-2*raw);
   revealElements.add(element);if(element.dataset.glassMotion!=='active')element.dataset.glassMotion='active';
   for(const [property,value] of[['--glass-reveal',open.toFixed(4)],['--glass-lift',((1-open)*34).toFixed(2)+'px'],['--glass-tilt',((1-open)*3.5).toFixed(2)+'deg']])if(element.style.getPropertyValue(property)!==value)element.style.setProperty(property,value);
   if(raw>.015&&raw<.985&&rect.bottom>viewport.top&&rect.top<viewport.top+viewport.height)panels.push({left:rect.left-viewport.left,top:rect.top-viewport.top,width:rect.width,height:rect.height,progress:raw,variant:element.dataset.glassReveal});
  }
  scene.setReveals?.(panels.slice(0,2));
 };
 const readProgress=()=>{const height=Math.max(pointerBounds.height,1),scrollTop=window.scrollY;progress=mode==='interior'?1.05+Math.max(0,scrollTop||0)/height:typeof scrollTop==='number'?Math.max(0,(scrollTop-hostDocumentTop)/height):Math.max(0,-host.getBoundingClientRect().top/height);if(!hasJourney())revealsDirty=true;};
 const scroll=()=>{progressDirty=true;dirty=true;sync();};
 const invalidateLayout=()=>{if(disposed)return;layoutDirty=true;progressDirty=true;dirty=true;sync();};
 const measure=()=>{
  if(!scene||disposed||lost)return;
  try{
   const rect=canvas.getBoundingClientRect(),width=Math.max(1,rect.width),height=Math.max(1,rect.height),mobile=width<768;pointerBounds=rect;
   displayDpr=Math.min(window.devicePixelRatio||1,2,Math.sqrt((mobile?3000000:8000000)/(width*height)));const dpr=displayDpr*quality;
   if(width!==sizedWidth||height!==sizedHeight||dpr!==sizedDpr){scene.resize(width,height,dpr);sizedWidth=width;sizedHeight=height;sizedDpr=dpr;}
   layoutDirty=progressDirty=true;draw();
  }catch{fail();}
 };
 const move=(event:PointerEvent)=>{
  if(event.pointerType==='touch'||reducedMotion||scene?.interactive===false)return;
  const rect=pointerBounds;
  targetX=Math.max(-1,Math.min(1,((event.clientX-rect.left)/Math.max(rect.width,1)-.5)*2));
  targetY=Math.max(-1,Math.min(1,((event.clientY-rect.top)/Math.max(rect.height,1)-.5)*2));sync();
 };
 const leave=()=>{targetX=targetY=0;sync();};
 const resume=()=>{draw();sync();};
 const beforePrint=()=>{printing=true;sync();};
 const afterPrint=()=>{printing=false;resume();};
 const reduced=(event?:MediaQueryListEvent)=>{if(typeof event?.matches==='boolean')systemReduced=event.matches;else if(event)systemReduced=preference.matches;reducedMotion=manualReduced||(event?systemReduced:systemReduced||preference.matches);if(reducedMotion){pointerX=pointerY=targetX=targetY=0;clearReveals();revealsDirty=false;draw();}else{revealsDirty=true;draw();}dirty=false;sync();};
 const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value?:boolean}>).detail;if(!detail)return;if(detail.action==='paused')paused=!!detail.value;else if(detail.action==='reduced'){manualReduced=!!detail.value;reduced();}else if(detail.action==='replay')activeTime=0;dirty=true;progressDirty=true;draw();sync();};
 const contextLost=(event:Event)=>{event.preventDefault();lost=true;fail();};
 const resize=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);
 const intersection=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);resume();},{threshold:.01});
 const theme=typeof MutationObserver==='undefined'?null:new MutationObserver(draw);
 const cleanup=()=>{
  if(disposed)return;
  disposed=true;controller.abort();stop();clearReveals();resize?.disconnect();intersection?.disconnect();theme?.disconnect();
  if(!resize)window.removeEventListener('resize',measure);
  host.removeEventListener('pointermove',move as EventListener);host.removeEventListener('pointerleave',leave);
  host.removeEventListener('load',invalidateLayout,true);
  canvas.removeEventListener('webglcontextlost',contextLost);
  document.removeEventListener('visibilitychange',resume);preference.removeEventListener('change',reduced);
  window.removeEventListener('beforeprint',beforePrint);window.removeEventListener('afterprint',afterPrint);
  window.removeEventListener('scroll',scroll);
  window.removeEventListener('iavse-scene-control',control);
  window.removeEventListener('iavse-journey-layout',invalidateLayout);
  scene?.dispose();scene=null;
 };
 const fail=()=>{cleanup();canvas.style.opacity='0';canvas.dataset.atmosphere='fallback';};
 resize?.observe(surface);intersection?.observe(canvas);theme?.observe(document.documentElement,{attributes:true,attributeFilter:['data-color-mode']});
 if(!resize)window.addEventListener('resize',measure);
 if(!intersection)visible=true;
 host.addEventListener('pointermove',move as EventListener,{passive:true});host.addEventListener('pointerleave',leave);
 host.addEventListener('load',invalidateLayout,true);
 canvas.addEventListener('webglcontextlost',contextLost);
 document.addEventListener('visibilitychange',resume);preference.addEventListener('change',reduced);
 window.addEventListener('beforeprint',beforePrint);window.addEventListener('afterprint',afterPrint);
 window.addEventListener('scroll',scroll,{passive:true});
 window.addEventListener('iavse-scene-control',control);
 window.addEventListener('iavse-journey-layout',invalidateLayout);
 document.fonts?.ready.then(invalidateLayout);
 void createScene(canvas,controller.signal).then(loaded=>{
  if(disposed){loaded.dispose();return;}
  scene=loaded;if(hasJourney())resize?.observe(host);canvas.dataset.atmosphere=lost?'fallback':'paused';measure();sync();
 }).catch(()=>{if(!disposed)fail();});
 return cleanup;
}

export function V2Atmosphere({mode='home'}:{mode?:'home'|'interior'}={}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>canvas.current?mountV2Atmosphere(canvas.current,loadScene,{mode}):undefined,[mode]);
 return <canvas ref={canvas} className="v2-atmosphere" aria-hidden="true" style={{display:'block',width:'100%',height:'100%'}}/>;
}
