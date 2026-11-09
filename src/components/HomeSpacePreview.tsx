'use client';
import {useId,useState} from 'react';
import Link from 'next/link';
import {Icon} from './Icons';
const examples=[{id:'editorial',handle:'lin-studio'},{id:'resume',handle:'leo-park'}];
export function HomeSpacePreview({copy:c}:{copy:any}){
 const [active,setActive]=useState(0),id=useId(),example=examples[active];
 return <figure className="hx-space-preview"><div className="hx-template-options" role="tablist" aria-label={c.templateLabel} onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?1:1-active;setActive(next);event.currentTarget.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();}}>{examples.map((item,index)=><button key={item.id} type="button" role="tab" id={id+'-'+item.id} aria-selected={index===active} aria-controls={id+'-panel'} tabIndex={index===active?0:-1} onClick={()=>setActive(index)}>{c.templateNames[index]}</button>)}</div><div id={id+'-panel'} role="tabpanel" aria-labelledby={id+'-'+example.id} tabIndex={0}><Link className="hx-template-image" href={'/blogs/showcase/'+example.handle+'?template=builtin'} aria-label={c.openTemplate}><picture><img src={'/media/home-product/space-'+example.id+'.webp'} width={1280} height={860} alt={c.templateNames[active]} loading="lazy" decoding="async"/></picture></Link></div><figcaption><span>{c.templateNote}</span><Link href={'/blogs/showcase/'+example.handle+'?template=builtin'}>{c.openTemplate}<Icon name="arrow"/></Link></figcaption></figure>;
}
