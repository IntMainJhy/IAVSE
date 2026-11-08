'use client';

import {useId,useRef,useState,type KeyboardEvent} from 'react';
import Link from 'next/link';
import {Icon} from './Icons';

type Look={file:string;handle:string;name:string};
type Props={looks:Look[];labels:string[];details:string[];open:string};

/** All images share one reserved viewport, so choosing a look never moves the page. */
export function BlogProductLooks({looks,labels,details,open}:Props){
 const [active,setActive]=useState(0),id=useId(),tabs=useRef<HTMLDivElement>(null);
 const choose=(index:number)=>setActive(index);
 function navigate(event:KeyboardEvent<HTMLDivElement>){
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?looks.length-1:(active+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+looks.length)%looks.length;
  choose(next);tabs.current?.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
 }
 return <div className="film-appearance" data-look={looks[active].file}>
  <div className="film-appearance-preview"><div className="film-appearance-pages" data-film-camera="look">
   {looks.map((look,index)=><div className="film-appearance-page" key={look.file} id={id+'-panel-'+index} role="tabpanel" aria-labelledby={id+'-tab-'+index} aria-hidden={active!==index} data-active={active===index} inert={active!==index}>
    <picture><source media="(max-width:760px)" srcSet={'/media/blog-product/'+look.file+'-mobile.webp'} width={390} height={844}/><img src={'/media/blog-product/'+look.file+'.webp'} alt={labels[index]+' · '+look.name} width={900} height={1015} loading="lazy" decoding="async"/></picture>
   </div>)}
  </div></div>
  <div className="film-appearance-controls">
   <div ref={tabs} className="film-appearance-options" role="tablist" aria-label={labels.join(' / ')} onKeyDown={navigate}>
    {looks.map((look,index)=><button key={look.file} type="button" role="tab" id={id+'-tab-'+index} aria-controls={id+'-panel-'+index} aria-selected={active===index} tabIndex={active===index?0:-1} onClick={()=>choose(index)}><span className={'film-look-swatch film-look-swatch-'+look.file} aria-hidden="true"/><span><strong>{labels[index]}</strong><span>{details[index]}</span></span><Icon name="check"/></button>)}
   </div>
   <p className="film-active-look-detail" aria-live="polite">{details[active]}</p>
   <div className="film-appearance-caption"><span>{looks[active].name}</span><Link className="film-text-link" href={'/blogs/showcase/'+looks[active].handle}>{open}<Icon name="arrow"/></Link></div>
  </div>
 </div>;
}
