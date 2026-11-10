'use client';
// Navigation spring, active pill and theme reveal adapted from rbp-portfolio/components/layout/nav.tsx.
import {motion,useReducedMotion} from 'motion/react';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import Link from 'next/link';
type Item={href:string;label:string;active:boolean;current?:'page'|'location'};
export function PortfolioNavigation({items,label,locale}:{items:Item[];label:string;locale:string}){
 const root=useRef<HTMLElement>(null),[pill,setPill]=useState<{x:number;width:number}|null>(null),quiet=useReducedMotion();
 useLayoutEffect(()=>{const nav=root.current;const sync=()=>{const link=nav?.querySelector<HTMLElement>('[aria-current]');if(nav&&link){const r=link.getBoundingClientRect(),n=nav.getBoundingClientRect();setPill({x:r.left-n.left,width:r.width});}};sync();const observer=new ResizeObserver(sync);if(nav)observer.observe(nav);document.fonts.ready.then(sync);return()=>observer.disconnect();},[items]);
 return <nav ref={root} className="organic-desktop-nav portfolio-nav" aria-label={label}>{pill&&<motion.span className="portfolio-nav-pill" aria-hidden="true" initial={false} animate={{x:pill.x,width:pill.width}} transition={quiet?{duration:0}:{type:'spring',stiffness:380,damping:32}}/>}{items.map(item=><Link key={item.href} href={item.href} className={item.active?'is-active':''} aria-current={item.current}>{item.label}</Link>)}<PortfolioThemeToggle locale={locale}/></nav>;
}
export function PortfolioThemeToggle({locale}:{locale:string}){
 const [dark,setDark]=useState(false),quiet=useReducedMotion();
 useEffect(()=>{const sync=()=>setDark(document.documentElement.dataset.colorMode==='dark');sync();const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-color-mode']});return()=>observer.disconnect();},[]);
 const label=locale==='zh'?(dark?'切换浅色外观':'切换深色外观'):locale==='ja'?(dark?'ライトテーマに切り替え':'ダークテーマに切り替え'):(dark?'Switch to light theme':'Switch to dark theme');
 const toggle=(event:React.MouseEvent<HTMLButtonElement>)=>{const next=dark?'light':'dark',apply=()=>{document.documentElement.dataset.colorMode=next;document.documentElement.dataset.colorPreference=next;document.cookie='site-color-mode='+next+'; Path=/; Max-Age=31536000; SameSite=Lax';setDark(!dark);};if(!document.startViewTransition||quiet){apply();return;}const r=event.currentTarget.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,html=document.documentElement;html.style.setProperty('--theme-cx',x+'px');html.style.setProperty('--theme-cy',y+'px');html.style.setProperty('--theme-r',Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+'px');html.dataset.themeAnim='1';document.startViewTransition(apply).finished.catch(()=>{}).finally(()=>delete html.dataset.themeAnim);};
 return <button className="portfolio-theme-toggle" type="button" aria-label={label} title={label} aria-pressed={dark} onClick={toggle}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{dark?<><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>:<path d="M20.8 13.1A9 9 0 0 1 10.9 3.2 9 9 0 1 0 20.8 13.1Z"/>}</svg></button>;
}
