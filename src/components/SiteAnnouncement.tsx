'use client';
import Link from 'next/link';
import {createContext,useContext,useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {MouseEvent,ReactNode} from 'react';
import {useLocale} from './LocaleProvider';
import {Icon} from './Icons';

export type SiteAnnouncements={enabled:boolean;items:{title:string;url:string}[]};
const empty:SiteAnnouncements={enabled:false,items:[]};
type AnnouncementState={value:SiteAnnouncements;visible:boolean;dismiss:()=>void};
const Context=createContext<AnnouncementState>({value:empty,visible:false,dismiss:()=>{}});
const shown=(value:SiteAnnouncements)=>value.enabled&&value.items.length>0;

/** Server-seeded geometry; changes are explicit saves, never a hydration-time reveal. */
export function SiteAnnouncementsProvider({initial,children}:{initial:SiteAnnouncements;children:ReactNode}){
 const [value,setValue]=useState(initial),[dismissed,setDismissed]=useState(false),request=useRef<AbortController|null>(null);
 const revision=JSON.stringify(value),visible=shown(value)&&!dismissed;
 useLayoutEffect(()=>{request.current?.abort();setValue(initial);},[initial]);
 // Closing belongs to this mounted tab, not the saved announcement. New copy is news again.
 useLayoutEffect(()=>{setDismissed(false);},[revision]);
 useLayoutEffect(()=>{document.documentElement.dataset.siteAnnouncements=visible?'enabled':'disabled';},[visible,initial]);
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
 return <Context.Provider value={{value,visible,dismiss:()=>setDismissed(true)}}>{children}</Context.Provider>;
}

export function SiteAnnouncement(){
 const {value,visible,dismiss}=useContext(Context),{locale}=useLocale();
 const [paused,setPaused]=useState(false);
 if(!visible)return null;
 const label=locale==='zh'?'网站公告':locale==='ja'?'お知らせ':'Site updates';
 const closeLabel=locale==='zh'?'关闭公告':locale==='ja'?'お知らせを閉じる':'Dismiss announcement';
 const title=(text:string)=>text==='从资源目录开始，发现设计、工具与创作指南。'?(locale==='en'?'Start in the resource directory. Explore designs, tools and practical guides.':locale==='ja'?'リソース一覧でデザイン、ツール、制作ガイドを探そう。':text):text==='网站更新与公告将在这里发布。'?(locale==='en'?'Website news and updates will appear here.':locale==='ja'?'サイトの更新やお知らせをここでお届けします。':text):text;
 const close=(event:MouseEvent<HTMLButtonElement>)=>{
  const owner=event.currentTarget.closest('[data-site-chrome], [data-announcement-host]');
  const next=owner&&Array.from(owner.querySelectorAll<HTMLElement>('[data-site-brand],.iavse-header__brand')).find(node=>node.getClientRects().length&&!node.closest('[inert]')&&!node.matches(':disabled'));
  dismiss();
  next?.focus({preventScroll:true});
 };
 const pauseLabel=locale==='zh'?'暂停滚动':locale==='ja'?'スクロールを一時停止':'Pause scrolling';
 const group=(copy:boolean)=><ul className="notice-edition" aria-hidden={copy||undefined}>{value.items.map((item,index)=><li key={index}>
  <span className="notice-star" aria-hidden="true">✳</span>
  {item.url?(item.url.startsWith('/')?<Link prefetch={false} href={item.url} tabIndex={copy?-1:undefined}>{title(item.title)}<Icon name="arrow"/></Link>:<a href={item.url} target="_blank" rel="noopener noreferrer" tabIndex={copy?-1:undefined}>{title(item.title)}<Icon name="arrow"/></a>):<span>{title(item.title)}</span>}
 </li>)}</ul>;
 return <aside className="site-announcement" aria-label={label} data-paused={paused}>
  <div className="site-announcement-viewport" role="region" aria-label={label} tabIndex={0}><div className="notice-track">{group(false)}{group(true)}</div></div>
  <button type="button" className="site-announcement-close" onClick={close} aria-label={closeLabel}><Icon name="close"/></button>
  <span className="site-announcement-label"><Icon name="megaphone"/><span>{label}</span></span>
  <button type="button" className="notice-motion" onClick={()=>setPaused(!paused)} aria-label={pauseLabel} aria-pressed={paused}><Icon name={paused?'play':'pause'}/></button>
 </aside>;
}
export function SiteAnnouncementOffset(){const {visible}=useContext(Context);return visible?<div className="site-announcement-offset" aria-hidden="true"/>:null;}
