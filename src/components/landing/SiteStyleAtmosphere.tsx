'use client';

import {useHomeStyle} from './HomeStyleProvider';

/** Reading pages keep their palette without allocating a second animated scene. */
export function SiteStyleAtmosphere(){
 const {style}=useHomeStyle();
 if(style==='brand')return null;
 return <div className={'site-style-atmosphere site-style-atmosphere--'+style} data-site-atmosphere={style} aria-hidden="true">
  {style==='classic'?<div className="classic-flow-static"/>:<picture className="site-style-art">
   {style==='fly'&&<source media="(max-width:600px)" srcSet="/media/home-styles/fly-fallback-mobile.webp"/>}
   <img src={style==='fly'?'/media/home-styles/fly-fallback-desktop.webp':'/media/home-styles/sea-breeze-daylight-960.webp'} alt="" loading="lazy" decoding="async" fetchPriority="low"/>
  </picture>}
  <div className="site-style-veil"/>
 </div>;
}
