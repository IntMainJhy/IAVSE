'use client';
import {useId,useRef,useState} from 'react';
import Link from 'next/link';
import {Icon} from './Icons';

type Item={id:string;title:string;summary:string;source:string;href:string;image?:string};
type Group={id:string;href:string;items:Item[]};
export function HomeResourceExplorer({groups,copy:c}:{groups:Group[];copy:any}){
 const [active,setActive]=useState(groups[0]?.id||''),[query,setQuery]=useState(''),[searching,setSearching]=useState(false),input=useRef<HTMLInputElement>(null),trigger=useRef<HTMLButtonElement>(null),id=useId();
 const group=groups.find(group=>group.id===active),needle=query.trim().toLocaleLowerCase(),items=(group?.items||[]).filter(item=>!needle||[item.title,item.summary,item.source].join(' ').toLocaleLowerCase().includes(needle));
 function closeSearch(){setQuery('');setSearching(false);trigger.current?.focus();}
 return <div className="hx-explorer">
  <div className="hx-explorer-toolbar"><div className="hx-tabs" role="tablist" aria-label={c.selection} onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const at=groups.findIndex(group=>group.id===active),next=event.key==='Home'?0:event.key==='End'?groups.length-1:(at+(event.key==='ArrowRight'?1:-1)+groups.length)%groups.length;setActive(groups[next].id);event.currentTarget.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();}}>{groups.map(group=><button key={group.id} role="tab" type="button" id={id+'-'+group.id} aria-controls={id+'-panel'} aria-selected={active===group.id} tabIndex={active===group.id?0:-1} onClick={()=>setActive(group.id)}>{c.tabs[group.id]}</button>)}</div>
   <div className="hx-search" data-open={searching}><button ref={trigger} type="button" className="hx-search-trigger" aria-label={c.search} aria-expanded={searching} aria-controls={id+'-search'} onClick={()=>{if(searching)closeSearch();else{setSearching(true);requestAnimationFrame(()=>input.current?.focus());}}}><Icon name="search"/></button><div id={id+'-search'} className="hx-search-field" hidden={!searching}><label className="sr-only" htmlFor={id+'-input'}>{c.searchLabel}</label><input id={id+'-input'} ref={input} type="search" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeSearch();}}} placeholder={c.searchPlaceholder}/><button type="button" onClick={closeSearch} aria-label={c.clear}><Icon name="close"/></button></div></div>
  </div>
  <div id={id+'-panel'} role="tabpanel" aria-labelledby={id+'-'+active} className="hx-resource-panel" tabIndex={0}>
   {items.length?<div className={'hx-resource-items '+(active==='designs'?'is-visual':'is-reading')}>{items.map(item=>{const external=/^https?:\/\//.test(item.href);return <article key={item.id} className="hx-resource"><Link prefetch={false} href={item.href} {...external?{target:'_blank',rel:'noopener noreferrer'}:{}} className="hx-resource-link">{item.image&&<div className="hx-resource-image"><img src={item.image} width={640} height={400} alt="" loading="lazy" decoding="async"/></div>}<div className="hx-resource-content"><h3>{item.title}<Icon name="arrow"/></h3><p>{item.summary}</p><span className="hx-resource-source">{item.source}</span></div></Link></article>})}</div>:<div className="hx-resource-empty" role="status"><h3>{c.emptyTitle}</h3><p>{c.emptyBody}</p><button type="button" onClick={()=>{setQuery('');input.current?.focus();}}>{c.clear}<Icon name="arrow"/></button></div>}
  </div>
  <footer className="hx-explorer-footer"><span>{c.selection} · {c.source}</span><Link href={group?.href||'/resources'}>{c.all}<Icon name="arrow"/></Link></footer>
 </div>;
}
