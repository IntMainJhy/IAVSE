'use client';
import {useCallback,useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {useLocale} from './LocaleProvider';
import {Icon} from './Icons';
import '@/app/catalog-search.css';
import '@/app/page-search-toolbar.css';

/** A field inside the caller's form: collapsing never drops its query from FormData. */
export function CatalogSearch({value,label,placeholder,name='q',maxLength=120,submit=true,className='',onChange}:{
 value:string;label:string;placeholder?:string;name?:string;maxLength?:number;submit?:boolean;className?:string;onChange?:(value:string)=>void;
}){
 const {t}=useLocale(),id=useId(),route=usePathname()+'?'+useSearchParams().toString(),trigger=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null);
 const[open,setOpen]=useState(false);
 const position=useCallback(()=>{
  if(!trigger.current||!panel.current)return;
  const rect=trigger.current.getBoundingClientRect(),viewport=window.visualViewport;
  const left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0,width=viewport?.width||window.innerWidth,height=viewport?.height||window.innerHeight;
  const panelWidth=Math.min(380,width-24);
  panel.current.style.width=panelWidth+'px';
  panel.current.style.left=Math.max(left+12,Math.min(rect.right-panelWidth,left+width-panelWidth-12))+'px';
  panel.current.style.top=Math.max(top+8,Math.min(rect.top,top+height-56))+'px';
 },[]);
 const show=useCallback((focus=false)=>{
  position();panel.current?.showPopover();
  if(focus)input.current?.focus({preventScroll:true});
 },[position]);
 const close=(restore=false)=>{panel.current?.hidePopover();if(restore)trigger.current?.focus({preventScroll:true});};
 useLayoutEffect(()=>{
  // Keep the same DOM input and caret through server-filtered navigation.
  if(input.current&&input.current.value!==value)input.current.value=value;
 },[value,route]);
 useLayoutEffect(()=>{if(value)show();},[value,show]);
 useEffect(()=>{
  if(!open)return;
  let frame=0;
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(position);};
  window.addEventListener('resize',update);window.addEventListener('scroll',update,true);
  window.visualViewport?.addEventListener('resize',update);window.visualViewport?.addEventListener('scroll',update);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);window.visualViewport?.removeEventListener('resize',update);window.visualViewport?.removeEventListener('scroll',update);};
 },[open,position]);
 return <div className={'catalog-search-control '+className} data-open={open}>
  <button ref={trigger} type="button" className="catalog-search-trigger" aria-label={label} aria-expanded={open} aria-controls={id} onClick={()=>open?close(true):show(true)}><Icon name="search"/><span>{t('搜索')}</span>{value&&<span className="catalog-search-active" aria-hidden="true"/>}</button>
  <div ref={panel} id={id} popover="auto" className="catalog-search-panel" onToggle={()=>setOpen(!!panel.current?.matches(':popover-open'))} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();close(true);}}}>
   <label className="catalog-search-label" htmlFor={id+'-input'}>{label}</label>
   <Icon name="search"/>
   <input ref={input} id={id+'-input'} type="search" name={name} defaultValue={value} placeholder={placeholder||label} aria-label={label} maxLength={maxLength} autoComplete="off" onChange={event=>onChange?.(event.target.value)}/>
   {submit&&<button className="catalog-search-submit" type="submit" aria-label={label}><Icon name="arrow"/></button>}
   <button className="catalog-search-close" type="button" aria-label={t('关闭')} onClick={()=>close(true)}><Icon name="close"/></button>
  </div>
 </div>;
}
