'use client';
import {useId,useRef,useState,type KeyboardEvent} from 'react';
import Link from 'next/link';
import {useLocale} from './LocaleProvider';
import {Icon} from './Icons';
type Item={id:string;title:string;summary:string;source:string;href:string;image?:string};
type Category={id:string;label:string;href?:string;items:Item[]};
export function ShowcaseDiscovery({categories,label,more,href,variant}:{categories:Category[];label:string;more:string;href:string;variant:'skills'|'resources'}){
 const {t}=useLocale(),[active,setActive]=useState(0),id=useId(),tabs=useRef<HTMLDivElement>(null),selected=categories[active];
 function navigate(event:KeyboardEvent<HTMLDivElement>){if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?categories.length-1:(active+(event.key==='ArrowLeft'?-1:1)+categories.length)%categories.length;setActive(next);tabs.current?.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();}
 return <div className={'ps-discovery ps-discovery-'+variant}>
  <div className="ps-discovery-tabs" ref={tabs} role="tablist" aria-label={label} onKeyDown={navigate}>{categories.map((category,index)=><button key={category.id} type="button" role="tab" id={id+'-tab-'+index} aria-controls={id+'-panel'} aria-selected={active===index} tabIndex={active===index?0:-1} onClick={()=>setActive(index)}>{t(category.label)}</button>)}</div>
  <div className="ps-discovery-content" id={id+'-panel'} role="tabpanel" aria-labelledby={id+'-tab-'+active} data-kind={selected.id}>
   <ul>{selected.items.map(item=><li key={item.id}><Link prefetch={false} href={item.href} {...(item.href.startsWith('https://')?{target:'_blank',rel:'noopener noreferrer'}:{})}>{item.image&&<div className="ps-discovery-cover"><img src={item.image} alt={item.title} width={480} height={300} loading="lazy" decoding="async"/></div>}<div><h4>{item.title}</h4><p>{t(item.summary)}</p><span>{item.source}</span></div><Icon name="arrow"/></Link></li>)}</ul>
  </div>
  <Link className="ps-discovery-more" prefetch={false} href={selected.href||href}>{more}<Icon name="arrow"/></Link>
 </div>;
}
