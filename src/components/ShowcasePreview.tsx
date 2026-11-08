'use client';
import {useId,useState} from 'react';
import Link from 'next/link';
import {Icon} from './Icons';
type Shot={src:string;width:number;height:number};
type Props={desktop:Shot;mobile:Shot;title:string;href:string;caption:string;labels:{desktop:string;mobile:string;size:string;preview:string;open:string;imageFailure:string}};

/** A readable single surface; switching device never overlays two miniature pages. */
export function ShowcasePreview({desktop,mobile,title,href,caption,labels}:Props){
 const [device,setDevice]=useState<'desktop'|'mobile'>('desktop'),[failed,setFailed]=useState(false),id=useId(),shot=device==='desktop'?desktop:mobile;
 return <figure className="ps-preview" data-preview-device={device}>
  <div className="ps-preview-bar"><span><Icon name="lock"/><span>{href}</span></span><div className="ps-device-options" role="group" aria-label={labels.size}>{(['desktop','mobile'] as const).map(value=><button type="button" key={value} aria-pressed={device===value} aria-controls={id} onClick={()=>{setDevice(value);setFailed(false)}}>{labels[value]}</button>)}</div></div>
  <div className="ps-preview-stage" id={id}><div className="ps-preview-device" tabIndex={0} role="region" aria-label={title+' · '+labels[device]}>{failed?<p className="ps-preview-failure" role="status">{labels.imageFailure}</p>:<img key={shot.src} src={shot.src} alt={title+' · '+labels[device]} width={shot.width} height={shot.height} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>}</div></div>
  <figcaption><span>{caption}<small>{labels.preview}</small></span><Link prefetch={false} href={href}>{labels.open}<Icon name="arrow"/></Link></figcaption>
 </figure>;
}
