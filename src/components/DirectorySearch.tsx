'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {useLocale} from './LocaleProvider';
import {Icon} from './Icons';

/** Shared directory search: draft input is applied only by an explicit submission. */
export function DirectorySearch({value,label,placeholder,onSearch,maxLength=120,action,fields={}}:{value:string;label:string;placeholder:string;onSearch:(query:string)=>void;maxLength?:number;action?:string;fields?:Record<string,string>}){
 const {t}=useLocale(),id=useId(),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),input=useRef<HTMLInputElement>(null);
 const [expanded,setExpanded]=useState(Boolean(value)),[draft,setDraft]=useState(value);
 useEffect(()=>{setDraft(value);if(value)setExpanded(true)},[value]);
 useEffect(()=>{if(expanded)input.current?.focus({preventScroll:true})},[expanded]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{
  if(document.querySelector('dialog[open]'))return;
  const target=event.target instanceof HTMLElement?event.target:null;
  if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!target?.closest('input,textarea,select,[contenteditable]')){event.preventDefault();setExpanded(true);input.current?.focus({preventScroll:true})}
  if(event.key==='Escape'&&expanded&&target&&root.current?.contains(target)){event.preventDefault();setExpanded(false);setDraft(value);trigger.current?.focus({preventScroll:true})}
 };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[expanded,value]);
 return <div ref={root} className="explorer-search-row" data-template-search="true" data-expanded={expanded}>
  <button ref={trigger} type="button" className="explorer-search-toggle" aria-label={label} aria-expanded={expanded} aria-controls={id+'-panel'} onClick={()=>{setExpanded(!expanded);if(expanded)setDraft(value)}}><Icon name="search"/><span>{t('搜索')}</span>{value&&<i aria-label={t('已应用搜索')}/>}<kbd aria-hidden="true">/</kbd></button>
  <div id={id+'-panel'} className="explorer-search-reveal" inert={!expanded} aria-hidden={!expanded}>
   <form className="explorer-search" role="search" action={action} method="get" onSubmit={event=>{event.preventDefault();const query=draft.trim();setDraft(query);onSearch(query)}}>{Object.entries(fields).map(([name,value])=><input key={name} type="hidden" name={name} value={value}/>)}<label className="sr-only" htmlFor={id+'-input'}>{label}</label><input id={id+'-input'} ref={input} type="search" name="q" value={draft} onChange={event=>setDraft(event.target.value)} placeholder={placeholder} maxLength={maxLength} autoComplete="off" aria-keyshortcuts="/"/>{draft&&<button type="button" className="explorer-search-clear" aria-label={t('清空搜索')} onClick={()=>{setDraft('');onSearch('');input.current?.focus({preventScroll:true})}}><Icon name="close"/></button>}<button type="submit" className="explorer-search-submit">{t('搜索')}<Icon name="arrow"/></button></form>
  </div>
  <p>{t(expanded?'Enter 搜索，Esc 收起。':'点击展开搜索，或按 /。')}</p>
 </div>;
}
