'use client';

import Link from 'next/link';
import {useState} from 'react';
import {useLocale} from './LocaleProvider';
import {Icon} from './Icons';
import '@/app/featured-picks.css';

export type FeaturedPick={id:string;title:string;summary:string;href:string;source:string;kind:string;emoji:string};
type Group={id:string;label:string;items:FeaturedPick[]};

function PickVisual({kind}:{kind:string}){
 return <div className={'pick-visual pick-visual--'+kind} aria-hidden="true">
  {kind==='drawing'?<svg viewBox="0 0 120 70"><rect x="29" y="19" width="62" height="36" rx="8"/><path d="M29 10h62M29 6v8m62-8v8M20 19v36m-4-36h8m-8 36h8"/><path className="pick-draw-line" d="M38 30h42M38 38h27M38 46h34"/><circle cx="91" cy="55" r="12"/></svg>:kind==='palette'?<><i/><i/><i/><span>Aa</span></>:kind==='motion'||kind==='shapes'?<><i/><i/><i/></>:kind==='code'?<><span>&lt;create&gt;</span><i/><i/><span>&lt;/create&gt;</span></>:<><div className="pick-mini-nav"><i/><i/><i/></div><div className="pick-mini-content"><i/><i/><i/></div>{kind==='cursor'&&<svg className="pick-mini-cursor" viewBox="0 0 24 24"><path d="m5 2 14 12-7 1-3 7z"/></svg>}</>}
 </div>;
}

/** Small original previews, with real titles and destinations, rather than a second gallery runtime. */
export function FeaturedPicks({groups,title}:{groups:Group[];title?:string}){
 const {locale,t}=useLocale(),[selected,setSelected]=useState(groups[0]?.id),active=groups.find(group=>group.id===selected)||groups[0];
 const say=(zh:string,en:string,ja:string)=>locale==='en'?en:locale==='ja'?ja:zh;
 if(!active?.items.length)return null;
 return <section className="creator-picks" aria-label={title||say('我的创作工具箱','My creative toolkit','制作のツール箱')}>
  <div className="creator-picks-heading"><h2><span className="picks-sticker" aria-hidden="true">✦</span>{title||say('我的创作工具箱','My creative toolkit','制作のツール箱')}<span className="picks-selection-note">{say('亲自挑选，按需带走','Picked with care. Take what fits.','選んだ道具を、必要なときに。')}</span></h2>{groups.length>1&&<div className="picks-tabs" role="group" aria-label={say('精选内容类型','Featured collection','おすすめの種類')}>{groups.map(group=><button type="button" key={group.id} aria-pressed={active.id===group.id} onClick={()=>setSelected(group.id)}>{t(group.label)}</button>)}</div>}</div>
  <ul className="creator-picks-track" key={active.id}>{active.items.map(item=><li key={item.id}><Link className="creator-pick" href={item.href} prefetch={false} target={item.href.startsWith('https://')?'_blank':undefined} rel={item.href.startsWith('https://')?'noopener noreferrer':undefined}>
   <PickVisual kind={item.kind}/><span className="pick-sticker" aria-hidden="true">{item.emoji}</span>
   <div className="creator-pick-copy"><h3>{item.title}</h3><p>{t(item.summary)}</p><div><span>{item.source}</span><Icon name="arrow"/></div></div>
  </Link></li>)}</ul>
 </section>;
}
