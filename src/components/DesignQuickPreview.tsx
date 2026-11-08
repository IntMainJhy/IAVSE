'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Link from 'next/link';
import {Icon} from './Icons';
import {useLocale} from './LocaleProvider';
import type {DesignEntry} from '@/lib/design-types';
import '@/app/design-quick-preview.css';

export type DesignPreviewItem=Pick<DesignEntry,'template'|'license'|'studio'|'slug'|'title'|'image'|'external'|'previewUrl'|'previewVariants'|'websiteUrl'|'source'|'collection'|'preview'|'palette'|'creator'|'referenceSite'|'production'|'previewPolicy'>;

/** Covers never create browsing contexts, observers, or live website previews. */
export function DesignMedia({entry,large=false}:{entry:DesignPreviewItem;large?:boolean}){
 const {t}=useLocale(),picture=useRef<HTMLImageElement>(null),[failedSrc,setFailedSrc]=useState(''),[loadedSrc,setLoadedSrc]=useState('');
 const src=entry.image||(!entry.template&&!entry.external&&!entry.studio?'/media/designs/'+entry.slug+'.webp':'');
 const failed=failedSrc===src,loaded=loadedSrc===src;
 useEffect(()=>{const image=picture.current;if(image?.complete){if(image.naturalWidth>0)setLoadedSrc(src);else if(image.currentSrc)setFailedSrc(src)}},[src]);
 return <div className={'design-media'+(large?' is-large':'')} data-frame="false">
  {src&&!failed&&<img ref={picture} src={src} alt={entry.title} width={1200} height={800} loading={large?'eager':'lazy'} decoding="async" style={{opacity:loaded?1:0}} onLoad={()=>setLoadedSrc(src)} onError={()=>setFailedSrc(src)}/>}
  {(!src||failed||!loaded)&&<div className="design-media-fallback"><span className="design-cover-kind">{t(entry.template?.kind==='project'?'开源项目':entry.template?.kind==='design-system'?'设计规范预览':'页面模板')}</span><strong>{entry.title}</strong><div>{entry.palette.slice(0,5).map((color,index)=><i key={index} style={{background:color}}/>)}</div><span>{entry.template?.stack?.slice(0,3).join(' · ')||entry.creator?.name||entry.source.name}</span></div>}
 </div>;
}

/** A directory passes one opener to every card and owns a single mounted dialog. */
export function DesignPreviewCard({entry,onPreview}:{entry:DesignPreviewItem;onPreview:(trigger:HTMLButtonElement)=>void}){
 const {t}=useLocale(),externalOnly=entry.previewPolicy==='external-only',experience=entry.websiteUrl||entry.previewUrl||entry.source.url;
 return <div className={'design-card-preview'+(externalOnly?' design-reference-only':'')}><DesignMedia entry={entry}/>{externalOnly&&!entry.image?<a className="design-original-link" href={experience} target="_blank" rel="noopener noreferrer">{t('在原站查看')} ↗</a>:<button type="button" className="design-preview-trigger" onClick={event=>onPreview(event.currentTarget)} aria-label={t(externalOnly?'查看界面':'打开预览')+' · '+entry.title} aria-haspopup="dialog"><span><Icon name="eye"/>{t(externalOnly?'查看界面':'打开预览')}</span></button>}</div>;
}

type PreviewViewport='fit'|'desktop'|'tablet'|'mobile';
const previewViewports:Array<{id:PreviewViewport;label:string;width?:number}>=[{id:'fit',label:'适应窗口'},{id:'desktop',label:'桌面',width:1440},{id:'tablet',label:'平板',width:768},{id:'mobile',label:'手机',width:390}];

export function DesignPreviewDialog({entry,onClose,returnFocus}:{entry:DesignPreviewItem;onClose:()=>void;returnFocus?:HTMLElement|null}){
 const {t}=useLocale(),dialog=useRef<HTMLDialogElement>(null),id=useId(),stage=useRef<HTMLDivElement>(null),[variant,setVariant]=useState(entry.previewUrl),[viewport,setViewport]=useState<PreviewViewport>('fit'),[stageSize,setStageSize]=useState({width:0,height:0}),[loaded,setLoaded]=useState(false),[slow,setSlow]=useState(false);
 useEffect(()=>{const element=dialog.current,returnTo=returnFocus;if(element&&!element.open)element.showModal();return()=>{queueMicrotask(()=>{if(returnTo?.isConnected)returnTo.focus({preventScroll:true})})}},[returnFocus]);
 useEffect(()=>{const element=stage.current;if(!element)return;const measure=()=>setStageSize({width:element.clientWidth,height:element.clientHeight});const observer=new ResizeObserver(measure);observer.observe(element);measure();return()=>observer.disconnect()},[]);
 const imagePreview=entry.previewPolicy==='image'||entry.previewPolicy==='external-only';
 const experience=imagePreview?(entry.template?.repository||entry.source.url):(entry.websiteUrl||entry.previewUrl||entry.source.url),origin=entry.creator||entry.source;
 const target=previewViewports.find(item=>item.id===viewport)?.width,availableWidth=Math.max(1,stageSize.width),frameWidth=target||availableWidth,scale=Math.min(1,availableWidth/frameWidth),frameHeight=Math.max(1,Math.floor(stageSize.height/scale));
 const selectedVariant=Math.max(0,entry.previewVariants?.findIndex(item=>item.url===variant)??0),localPreview='/resources/designs/'+entry.slug+'/preview?embed=1&variant='+selectedVariant;
 useEffect(()=>{setLoaded(false);setSlow(false);if(imagePreview)return;const timer=setTimeout(()=>setSlow(true),10000);return()=>clearTimeout(timer)},[localPreview,imagePreview]);
 return <dialog ref={dialog} className="design-zoom-dialog is-responsive-preview" data-preview-dialog="true" aria-labelledby={id} onClose={onClose} onClick={event=>{if(event.target===event.currentTarget){const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)onClose()}}}>
  <header><div><h2 id={id}>{entry.title}</h2><p><a href={origin.url} target="_blank" rel="noopener noreferrer">{t('原作者')} · {origin.name} ↗</a></p></div><a href={experience} target="_blank" rel="noopener noreferrer">{t(imagePreview?'查看源码':'独立打开演示')}<Icon name="arrow"/></a><button type="button" onClick={onClose} aria-label={t('关闭预览')} autoFocus><Icon name="close"/></button></header>
  {!!entry.previewVariants&&entry.previewVariants.length>1&&<div className="design-preview-variants" aria-label={t('预览版本')}>{entry.previewVariants.map(item=><button type="button" key={item.url} onClick={()=>setVariant(item.url)} aria-pressed={variant===item.url}>{t(item.label)}</button>)}</div>}
  <div className="design-preview-tools">{imagePreview?<p className="design-preview-image-note">{t(entry.template?'原项目界面截图；在线演示暂不可用，可从 GitHub 获取完整项目。':'封面预览，完整演示请在原站打开。')}</p>:<><div className="design-preview-viewports" role="group" aria-label={t('预览尺寸')}>{previewViewports.map(item=><button key={item.id} type="button" aria-pressed={viewport===item.id} onClick={()=>setViewport(item.id)}>{t(item.label)}{item.width&&<span>{item.width}</span>}</button>)}</div><output className="design-preview-dimensions">{stageSize.width>0?`${Math.round(frameWidth)} × ${frameHeight}`:'—'}</output></>}</div>
  {slow&&!loaded&&<p className="design-preview-slow" role="status">{t('演示加载较慢，也可以独立打开演示。')}</p>}
  <div ref={stage} className="design-zoom-content design-preview-stage"><div className="design-preview-viewport" data-viewport={viewport} style={{width:frameWidth*scale,height:stageSize.height||'100%'}}><div className="design-preview-scaled" style={{width:frameWidth,height:frameHeight,transform:`scale(${scale})`}}>{stageSize.width>0&&(imagePreview?<DesignMedia entry={entry} large/>:<iframe key={localPreview} src={localPreview} title={entry.title+' · '+t('完整预览')} onLoad={()=>setLoaded(true)} onError={()=>setSlow(true)} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer"/>)}</div></div></div>
  <footer><span>{t(entry.template?.kind==='design-system'?'配色、字体与组件规范预览，不等同于完整应用。':'保留原作者实现；功能、技术栈和许可见模板详情。')}{entry.license&&<> · <a href={entry.license.url} target="_blank" rel="noopener noreferrer">{entry.license.name}</a></>}</span><nav>{!imagePreview&&variant&&<a href={variant} target="_blank" rel="noopener noreferrer">{t('独立打开预览')} ↗</a>}<Link prefetch={false} href={'/resources/designs/'+entry.slug} onClick={onClose}>{t('模板详情与来源')} ↗</Link></nav></footer>
 </dialog>;
}

/** Standalone detail pages reuse the same on-demand preview without an idle iframe. */
export function DesignQuickPreview({entry}:{entry:DesignPreviewItem}){
 const [open,setOpen]=useState(false),trigger=useRef<HTMLButtonElement|null>(null);
 return <><DesignPreviewCard entry={entry} onPreview={element=>{trigger.current=element;setOpen(true)}}/>{open&&<DesignPreviewDialog key={entry.slug} entry={entry} returnFocus={trigger.current} onClose={()=>setOpen(false)}/>}</>;
}
