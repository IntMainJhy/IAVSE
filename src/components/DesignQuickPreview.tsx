'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Link from 'next/link';
import {Icon} from './Icons';
import {useLocale} from './LocaleProvider';
import type {DesignEntry} from '@/lib/design-types';
import '@/app/design-quick-preview.css';

export type DesignPreviewItem=Pick<DesignEntry,'studio'|'slug'|'title'|'image'|'external'|'previewUrl'|'previewVariants'|'websiteUrl'|'source'|'collection'|'preview'|'palette'|'creator'|'referenceSite'|'production'|'previewPolicy'>;
export function DesignMedia({entry,large=false}:{entry:DesignPreviewItem;large?:boolean}){
 const {t}=useLocale(),host=useRef<HTMLDivElement>(null),[visible,setVisible]=useState(large),[width,setWidth]=useState(0),[failed,setFailed]=useState(false),[loaded,setLoaded]=useState(false),[slow,setSlow]=useState(false);
 // A same-origin wrapper gives each remote preview its own CSP even after Next client navigation.
 const frame=entry.previewPolicy!=='external-only'&&(entry.studio||(entry.external&&!entry.image&&entry.previewUrl))?'/resources/designs/'+entry.slug+'/preview?embed=1&variant='+Math.max(0,entry.previewVariants?.findIndex(item=>item.url===entry.previewUrl)??0):'';
 useEffect(()=>{setLoaded(false);setSlow(false);if(!frame||!visible)return;const timer=setTimeout(()=>setSlow(true),10000);return()=>clearTimeout(timer)},[frame,visible]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const resize=new ResizeObserver(()=>setWidth(el.clientWidth));resize.observe(el);setWidth(el.clientWidth);
  if(large)return()=>resize.disconnect();
  const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{rootMargin:'120px'});observer.observe(el);
  return()=>{resize.disconnect();observer.disconnect()};
 },[large]);
 const src=entry.previewPolicy==='external-only'||entry.studio?'':entry.image||(!entry.external?'/media/designs/'+entry.slug+'.webp':'');
 return <div ref={host} className={'design-media'+(large?' is-large':'')} data-frame={!!frame}>
  {src&&!failed?<img src={src} alt={entry.title} width={1200} height={800} loading={large?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>:frame?<>{!loaded&&<div className="design-media-loading" role={large?'status':undefined}><span>{t(slow?'加载较慢，可在新窗口打开预览。':'正在加载预览…')}</span></div>}{visible&&(large||width>0)&&<iframe key={frame} src={frame} title={entry.title+' · '+entry.source.name} loading={large?'eager':'lazy'} onLoad={()=>setLoaded(true)} onError={()=>setSlow(true)} tabIndex={large?0:-1} aria-hidden={large?undefined:true} sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" style={large?undefined:{width:1280,height:800,transform:`scale(${width/1280})`}}/>}</>:<div className="design-media-fallback"><strong>{entry.title}</strong><div>{entry.palette.slice(0,5).map((color,index)=><i key={index} style={{background:color}}/>)}</div><span>{entry.previewPolicy==='external-only'?t('仅提供原站链接'):entry.source.name}</span></div>}
 </div>;
}

type PreviewViewport='fit'|'desktop'|'tablet'|'mobile';
const previewViewports:Array<{id:PreviewViewport;label:string;width?:number}>=[{id:'fit',label:'适应窗口'},{id:'desktop',label:'桌面',width:1440},{id:'tablet',label:'平板',width:768},{id:'mobile',label:'手机',width:390}];
export function DesignQuickPreview({entry}:{entry:DesignPreviewItem}){
 const {t}=useLocale(),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),id=useId(),[open,setOpen]=useState(false),[variant,setVariant]=useState(entry.previewUrl);
 const stage=useRef<HTMLDivElement>(null),[viewport,setViewport]=useState<PreviewViewport>('fit'),[stageSize,setStageSize]=useState({width:0,height:0}),[session,setSession]=useState(0);
 useEffect(()=>{const element=stage.current;if(!open||!element)return;const measure=()=>setStageSize({width:element.clientWidth,height:element.clientHeight});const observer=new ResizeObserver(measure);observer.observe(element);measure();return()=>observer.disconnect()},[open]);
 const imagePreview=!!entry.external&&!!entry.image;
 const experience=entry.websiteUrl||entry.source.url,origin=entry.referenceSite||(entry.external?entry.source:undefined);
 const target=previewViewports.find(item=>item.id===viewport)?.width,availableWidth=Math.max(1,stageSize.width),frameWidth=target||availableWidth,scale=Math.min(1,availableWidth/frameWidth),frameHeight=Math.max(1,Math.floor(stageSize.height/scale));
 const localPreview='/resources/designs/'+entry.slug+'/preview?embed=1';
 const resetFrame=(element:HTMLIFrameElement)=>{try{element.contentWindow?.scrollTo(0,0);element.contentDocument?.querySelectorAll('[data-design-scroll-root],.referenced-design-preview,.component-library-preview').forEach(node=>{node.scrollTop=0;node.scrollLeft=0})}catch{/* A cross-origin source manages its own scroll. */}};
 if(entry.previewPolicy==='external-only')return <div className="design-card-preview design-reference-only"><DesignMedia entry={entry}/><a className="design-original-link" href={experience} target="_blank" rel="noopener noreferrer">{t('在原站查看')} ↗</a></div>;
 const show=()=>{setViewport('fit');setStageSize({width:0,height:0});setSession(value=>value+1);setOpen(true);dialog.current?.showModal();if(dialog.current)dialog.current.scrollTop=0};
 const close=()=>dialog.current?.close();
 return <>
  <div className="design-card-preview"><DesignMedia entry={entry}/><button ref={trigger} type="button" className="design-preview-trigger" onClick={show} aria-label={t('放大预览')+' · '+entry.title} aria-haspopup="dialog"><span><Icon name="eye"/>{t('放大预览')}</span></button></div>
  <dialog ref={dialog} className="design-zoom-dialog is-responsive-preview" data-preview-dialog="true" aria-labelledby={id} onClose={()=>{setOpen(false);trigger.current?.focus({preventScroll:true})}} onClick={event=>{if(event.target===event.currentTarget){const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close()}}}>
   <header><div><h2 id={id}>{entry.title}</h2><p>{origin?<a href={origin.url} target="_blank" rel="noopener noreferrer">{t('参考网站')} · {origin.name} ↗</a>:entry.creator?.name||entry.source.name}</p></div><a href={experience} target="_blank" rel="noopener noreferrer">{t(entry.studio?.websiteKey?'打开网站示例':entry.studio?'进入交互演示':'进入真实网站')}<Icon name="arrow"/></a><button type="button" onClick={close} aria-label={t('关闭预览')} autoFocus><Icon name="close"/></button></header>
   {!!entry.previewVariants&&entry.previewVariants.length>1&&<div className="design-preview-variants" aria-label={t('预览版本')}>{entry.previewVariants.map(item=><button type="button" key={item.url} onClick={()=>setVariant(item.url)} aria-pressed={variant===item.url}>{t(item.label)}</button>)}</div>}
   <div className="design-preview-tools">{imagePreview?<p className="design-preview-image-note">{t('原站封面预览，完整网站请在原站打开。')}</p>:<><div className="design-preview-viewports" role="group" aria-label={t('预览尺寸')}>{previewViewports.map(item=><button key={item.id} type="button" aria-pressed={viewport===item.id} onClick={()=>setViewport(item.id)}>{t(item.label)}{item.width&&<span>{item.width}</span>}</button>)}</div><output className="design-preview-dimensions">{stageSize.width>0?`${Math.round(frameWidth)} × ${frameHeight}`:'—'}</output></>}</div>
   {open&&<div ref={stage} className="design-zoom-content design-preview-stage"><div className="design-preview-viewport" data-viewport={viewport} style={{width:frameWidth*scale,height:stageSize.height||'100%'}}><div className="design-preview-scaled" style={{width:frameWidth,height:frameHeight,transform:`scale(${scale})`}}>{stageSize.width>0&&(entry.external?<DesignMedia key={session+':'+variant} entry={{...entry,previewUrl:variant}} large/>:<iframe key={session+':'+entry.slug} src={localPreview} title={entry.title} onLoad={event=>resetFrame(event.currentTarget)} sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"/>)}</div></div></div>}
   <footer><span>{t(entry.studio?.websiteKey?'IAVSE 网站设计示例；具体参考页与实现范围见设计详情。':entry.studio?'IAVSE 本地交互演示；具体参考页与实现范围见设计详情。':entry.external?'外部设计预览；演示作者与使用许可见设计详情。':'IAVSE 原创风格演示；真实网站由原作者维护。')}</span><nav>{variant&&<a href={variant} target="_blank" rel="noopener noreferrer">{t('独立打开预览')} ↗</a>}<Link href={'/resources/designs/'+entry.slug} onClick={close}>{t(entry.studio?.websiteKey?'设计说明与提示词':'来源与许可')} ↗</Link></nav></footer>
  </dialog>
 </>;
}
