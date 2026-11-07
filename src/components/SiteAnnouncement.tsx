'use client';
import Link from 'next/link';
import {createContext,useContext,useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {useLocale} from './LocaleProvider';
import {Icon} from './Icons';

export type SiteAnnouncements={enabled:boolean;items:{title:string;url:string}[]};
const empty:SiteAnnouncements={enabled:false,items:[]};
const Context=createContext<SiteAnnouncements>(empty);
const shown=(value:SiteAnnouncements)=>value.enabled&&value.items.length>0;

/** Server-seeded geometry; changes are explicit saves, never a hydration-time reveal. */
export function SiteAnnouncementsProvider({initial,children}:{initial:SiteAnnouncements;children:ReactNode}){
 const [value,setValue]=useState(initial),request=useRef<AbortController|null>(null);
 useLayoutEffect(()=>{request.current?.abort();setValue(initial);},[initial]);
 useLayoutEffect(()=>{document.documentElement.dataset.siteAnnouncements=shown(value)?'enabled':'disabled';},[value]);
 useEffect(()=>{
  let channel:BroadcastChannel|null=null,live=true;
  const refresh=()=>{
   request.current?.abort();const attempt=new AbortController();request.current=attempt;
   void fetch('/api/announcements',{credentials:'same-origin',cache:'no-store',signal:attempt.signal}).then(async response=>{
    if(!response.ok)throw new Error('Announcement refresh failed');
    const next=await response.json();
    if(live&&!attempt.signal.aborted&&typeof next.enabled==='boolean'&&Array.isArray(next.items))setValue(next);
   }).catch(()=>{/* Keep the last complete announcement on a temporary network failure. */});
  };
  const saved=()=>{refresh();channel?.postMessage('refresh');};
  try{channel=new BroadcastChannel('iavse-site-announcements');channel.onmessage=event=>{if(event.data==='refresh')refresh();};}catch{}
  window.addEventListener('iavse-announcements-updated',saved);
  return()=>{live=false;request.current?.abort();channel?.close();window.removeEventListener('iavse-announcements-updated',saved);};
 },[]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function SiteAnnouncement(){
 const value=useContext(Context),{locale}=useLocale();if(!shown(value))return null;
 const label=locale==='zh'?'网站公告':locale==='ja'?'お知らせ':'Site updates';
 const title=(text:string)=>text==='网站更新与公告将在这里发布。'?(locale==='en'?'Website news and updates will appear here.':locale==='ja'?'サイトの更新やお知らせをここでお届けします。':text):text;
 return <aside className="site-announcement" aria-label={label}><div className="site-announcement-viewport" role="region" aria-label={label} tabIndex={0}><span className="site-announcement-label">{label}</span><ul>{value.items.map((item,index)=><li key={index}>{item.url?(item.url.startsWith('/')?<Link prefetch={false} href={item.url}>{title(item.title)}<Icon name="arrow"/></Link>:<a href={item.url} target="_blank" rel="noopener noreferrer">{title(item.title)}<Icon name="arrow"/></a>):<span>{title(item.title)}</span>}</li>)}</ul></div></aside>;
}
export function SiteAnnouncementOffset(){const value=useContext(Context);return shown(value)?<div className="site-announcement-offset" aria-hidden="true"/>:null;}
