'use client';
import {useLayoutEffect,useRef,type ReactNode} from 'react';

/** Grid placement keeps DOM/keyboard order and leaves existing cards in place on append. */
export function DesignMasonry({children,layoutKey,busy}:{children:ReactNode;layoutKey:string;busy:boolean}){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const grid=root.current;if(!grid)return;
  let frame=0,lastWidth=0;
  const layout=()=>{
   frame=0;
   const width=grid.getBoundingClientRect().width;if(!width)return;
   lastWidth=width;
   const gap=parseFloat(getComputedStyle(grid).getPropertyValue('--design-gallery-gap'))||24;
   const cards=Array.from(grid.querySelectorAll<HTMLElement>(':scope > .design-gallery-card'));
   // Read every fixed-aspect cover before writing spans; image loading cannot move the grid.
   const spans=cards.map(card=>Math.ceil((card.querySelector<HTMLElement>('.design-card-preview')?.getBoundingClientRect().height||0)+gap));
   cards.forEach((card,index)=>card.style.setProperty('--gallery-span',String(spans[index])));
   grid.dataset.masonryReady='true';
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(layout)};
  layout();
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(entries=>{
   if(entries.some(entry=>Math.abs(entry.contentRect.width-lastWidth)>.5))schedule();
  });
  if(observer)observer.observe(grid);else window.addEventListener('resize',schedule,{passive:true});
  return()=>{observer?.disconnect();window.removeEventListener('resize',schedule);cancelAnimationFrame(frame)};
 },[layoutKey]);
 return <div ref={root} className="design-grid" aria-busy={busy}>{children}</div>;
}
