'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import '@/app/directory-toolbar.css';
import {Icon} from './Icons';

export function DirectoryFacet({label,value,children}:{label:string;value:string;children:ReactNode}){
 const root=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{
  const outside=(event:PointerEvent)=>{if(root.current?.open&&!root.current.contains(event.target as Node))root.current.open=false};
  const place=()=>{
   const element=root.current;
   if(!element?.open)return;
   const panel=element.querySelector<HTMLElement>('.directory-facet-options');
   if(!panel)return;
   const rect=element.querySelector('summary')!.getBoundingClientRect();
   const height=window.visualViewport?.height||window.innerHeight;
   const below=height-rect.bottom-(window.matchMedia('(max-width:767px)').matches?88:16);
   const above=rect.top-112;
   const upwards=below<180&&above>below;
   element.dataset.placement=upwards?'above':'below';
   panel.style.maxHeight=Math.max(90,Math.min(290,upwards?above:below))+'px';
  };
  const element=root.current;
  document.addEventListener('pointerdown',outside);
  element?.addEventListener('toggle',place);
  window.addEventListener('resize',place);
  return()=>{document.removeEventListener('pointerdown',outside);element?.removeEventListener('toggle',place);window.removeEventListener('resize',place)};

 },[]);
 return <details className="directory-facet" ref={root} name="directory-facets" onKeyDown={e=>{
  if(e.key==='Escape'&&root.current?.open){root.current.open=false;root.current.querySelector('summary')?.focus();e.preventDefault()}
 }}>
  <summary><span>{label}</span><strong>{value}</strong><Icon name="chevron-down"/></summary>
  <div className="directory-facet-options" onClick={e=>{
   if((e.target as HTMLElement).closest('a,button')&&root.current){root.current.open=false;root.current.querySelector('summary')?.focus({preventScroll:true})}
  }}>{children}</div>
 </details>;
}
