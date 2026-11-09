'use client';
import {useEffect,useState} from 'react';
import Silk from './react-bits/Silk';

/** Application settings around the licensed React Bits shader; no Pro template source is bundled. */
export function HomeBitsAtmosphere({initialDark,locale}:{initialDark:boolean;locale:string}){
 const [dark,setDark]=useState(initialDark),[quiet,setQuiet]=useState(false);
 useEffect(()=>{
  const sync=()=>setDark(document.documentElement.dataset.colorMode==='dark'),media=matchMedia('(prefers-reduced-motion: reduce)'),reduced=()=>setQuiet(media.matches);
  const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-color-mode']});sync();reduced();media.addEventListener('change',reduced);
  return()=>{observer.disconnect();media.removeEventListener('change',reduced);};
 },[]);
 const label=locale==='en'?(dark?'Switch to light theme':'Switch to dark theme'):locale==='ja'?(dark?'ライトテーマに切り替え':'ダークテーマに切り替え'):(dark?'切换浅色外观':'切换深色外观');
 function toggle(){const value=dark?'light':'dark';document.documentElement.dataset.colorMode=value;document.documentElement.dataset.colorPreference=value;document.cookie='site-color-mode='+value+'; Path=/; Max-Age=31536000; SameSite=Lax';setDark(!dark);}
 return <><div className="rb-atmosphere" aria-hidden="true"><Silk color={dark?'#142e50':'#c6e4ff'} sheenColor={dark?'#80bbff':'#ffffff'} speed={2} scale={1.5} rotation={.8} depth={.2} sheen={.35} glow={.12} ripple={.4} wave={.8} noiseIntensity={.12} variation={2} intro={false} lightMode={!dark} mouseInteraction={!quiet} clickRipple={!quiet} interactionStrength={.4} paused={quiet} dpr={1}/></div><button className="rb-theme-switch" type="button" aria-label={label} title={label} onClick={toggle}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{dark?<><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>:<path d="M20.8 13.1A9 9 0 0 1 10.9 3.2 9 9 0 1 0 20.8 13.1Z"/>}</svg></button></>;
}
