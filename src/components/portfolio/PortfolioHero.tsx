'use client';
// Hero grid, easing and scale/unblur composition adapted from the upstream Portfolio hero.
import {motion,useReducedMotion} from 'motion/react';
import Link from 'next/link';
import {useState} from 'react';
import {PortraitMorph} from './PortraitMorph';
import {Icon} from '../Icons';
export function PortfolioHero({copy:c,locale}:{copy:any;locale:string}){
 const [hover,setHover]=useState(false);
 const quiet=useReducedMotion(),ease=[.22,1,.36,1] as const;
 return <section className="portfolio-hero" aria-labelledby="product-title"><div className="portfolio-hero-grid"><motion.div className="portfolio-hero-copy" initial={false} animate={quiet?{opacity:1,y:0}:{opacity:[.65,1],y:[12,0]}} transition={{duration:quiet?0:.8,ease}}><h1 id="product-title">{c.title.map((line:string)=><span key={line}>{line}</span>)}</h1><p>{c.intro}</p><div className="portfolio-hero-actions"><Link className="portfolio-primary" href="/resources">{c.explore}<Icon name="arrow"/></Link><Link className="portfolio-secondary" href="/community">{c.community}<Icon name="arrow"/></Link></div><p className="portfolio-mission" lang="en">Insight through AI.<br/>Vigilance for Opportunity. Seize to Evolve.</p></motion.div><motion.figure className="portfolio-portrait" initial={false} whileInView={quiet?{}:{scale:[.96,1],filter:['blur(4px)','blur(0px)']}} viewport={{once:true}} transition={{duration:1,ease}}><Link href={hover?"/blogs/showcase/leo-park?template=builtin":"/blogs/showcase/lin-studio?template=builtin"} aria-label={c.openTemplate} onPointerEnter={event=>{if(event.pointerType==='mouse')setHover(true);}} onPointerLeave={()=>setHover(false)}><PortraitMorph srcA="/media/portfolio/lin-studio.webp" srcB="/media/portfolio/leo-park.webp" alt={locale==='zh'?'IAVSE 内置博客模板预览':locale==='ja'?'IAVSE ブログテンプレート':'IAVSE built-in blog templates'}/></Link><figcaption>{c.templateNote}</figcaption></motion.figure></div></section>;
}
