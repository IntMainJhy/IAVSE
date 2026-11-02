'use client';

import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import type {CSSProperties,PointerEvent} from 'react';
import {useLocale} from './LocaleProvider';
import {useHomeChapterActive} from './useHomeChapterActive';
import {Icon} from './Icons';

type SculptureProps={posterSrc:string;label:string;pauseLabel:string;playLabel:string};
type Entry={title:string;description:string;href:string;icon:string};
type ResourceGroup={id:string;title:string;word:string;icon:string;entries:Entry[]};

/** These are existing public destinations, not simulated records or popularity data. */
function resources(locale:string):ResourceGroup[]{
 const zh=locale==='zh',ja=locale==='ja';
 return [
  {id:'docs',title:zh?'文档':ja?'ドキュメント':'Docs',word:zh?'从理解开始':ja?'理解から始める':'Start with understanding',icon:'file',entries:[
   {title:zh?'开始使用 IAVSE':ja?'IAVSE を使い始める':'Get started with IAVSE',description:zh?'认识社区、博客主页和共享内容。':ja?'コミュニティ、ブログ、共有コンテンツを知る。':'Meet the community, blog homes and shared content.',href:'/docs/getting-started',icon:'cursor'},
   {title:zh?'搭建博客主页':ja?'ブログホームを作る':'Build your blog home',description:zh?'整理资料，编排自己的页面。':ja?'プロフィールを整理し、自分のページを作る。':'Arrange your profile and shape your own page.',href:'/docs/showcase',icon:'layers'},
   {title:'Connect API & MCP',description:zh?'让熟悉的 AI 工具接入发布流程。':ja?'いつもの AI ツールで公開の流れにつなぐ。':'Connect your AI tools to your publishing workflow.',href:'/docs/connect',icon:'link'}
  ]},
  {id:'skills',title:'Skills',word:zh?'把想法变成行动':ja?'アイデアを行動に':'Put an idea to work',icon:'cursor',entries:[
   {title:'GSAP Skills',description:zh?'时间线、滚动交互与动效性能。':ja?'タイムライン、スクロール、動きの最適化。':'Timelines, scroll interaction and animation performance.',href:'/skills/gsap',icon:'layers'},
   {title:'Impeccable',description:zh?'审查界面，打磨排版与交互。':ja?'画面を見直し、レイアウトと操作を磨く。':'Review an interface and refine its layout and interactions.',href:'/skills/impeccable',icon:'grid'},
   {title:'React Best Practices',description:zh?'改进 React 与 Next.js 的渲染性能。':ja?'React と Next.js の描画を改善する。':'Improve rendering in React and Next.js.',href:'/skills/react-best-practices',icon:'chart'}
  ]},
  {id:'tools',title:zh?'网站与工具':ja?'サイトとツール':'Tools',word:zh?'让发现触手可及':ja?'発見を手元に':'Keep a discovery close',icon:'folder',entries:[
   {title:zh?'资源目录':ja?'リソース一覧':'Resource directory',description:zh?'继续发现网站与实用工具。':ja?'サイトと便利なツールを探す。':'Explore websites and useful tools in one place.',href:'/resources?type=resources',icon:'search'},
   {title:zh?'法律咨询':ja?'法律相談':'Legal consultation',description:zh?'了解律师背景、业务范围与咨询方式。':ja?'弁護士の経歴、相談分野、連絡方法。':'Read the lawyer’s background, practice and contact options.',href:'/resources/legal-consultation',icon:'shield'},
   {title:zh?'桌面客户端':ja?'デスクトップアプリ':'Desktop apps',description:zh?'查看 macOS 与 Windows 客户端。':ja?'macOS と Windows のアプリを確認する。':'Find the macOS and Windows desktop apps.',href:'/downloads',icon:'monitor'}
  ]}
 ];
}

/** A small spatial index made from real, selectable document surfaces. No extra WebGL context. */
export function HomeResourceSculpture({label,pauseLabel,playLabel}:SculptureProps){
 const {locale}=useLocale(),groups=resources(locale),host=useRef<HTMLDivElement>(null),plane=useRef<HTMLDivElement>(null);
 const chapterActive=useHomeChapterActive(host);
 const [category,setCategory]=useState(0),[selected,setSelected]=useState(0),[visible,setVisible]=useState(false),[hidden,setHidden]=useState(false),[reduced,setReduced]=useState(true),[printing,setPrinting]=useState(false),[paused,setPaused]=useState(false),[globalPaused,setGlobalPaused]=useState(false);
 const pointer=useRef({x:0,y:0,targetX:0,targetY:0,frame:0});
 const group=groups[category],entry=group.entries[selected],quiet=reduced||printing;
 const running=chapterActive&&visible&&!hidden&&!quiet&&!paused&&!globalPaused;
 const resetPointer=()=>{const state=pointer.current;cancelAnimationFrame(state.frame);state.frame=0;state.x=state.y=state.targetX=state.targetY=0;plane.current?.style.setProperty('--atlas-x','0');plane.current?.style.setProperty('--atlas-y','0');};
 useEffect(()=>{
  const element=host.current;if(!element)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');let systemReduced=preference.matches,manualReduced=false;
  try{manualReduced=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const sync=()=>setReduced(systemReduced||manualReduced),motion=(event:MediaQueryListEvent)=>{systemReduced=event.matches;sync();},visibility=()=>setHidden(document.hidden),beforePrint=()=>setPrinting(true),afterPrint=()=>setPrinting(false);
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value?:boolean}>).detail;if(detail?.action==='reduced'){manualReduced=!!detail.value;sync();}else if(detail?.action==='paused')setGlobalPaused(!!detail.value);else if(detail?.action==='replay'){setCategory(0);setSelected(0);resetPointer();}};
  const viewport=new IntersectionObserver(entries=>setVisible(entries.some(entry=>entry.isIntersecting)),{threshold:.05});viewport.observe(element);
  sync();visibility();preference.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);window.addEventListener('beforeprint',beforePrint);window.addEventListener('afterprint',afterPrint);window.addEventListener('iavse-scene-control',control);
  return()=>{viewport.disconnect();preference.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('beforeprint',beforePrint);window.removeEventListener('afterprint',afterPrint);window.removeEventListener('iavse-scene-control',control);resetPointer();};
 },[]);
 useEffect(()=>{if(!running)resetPointer();},[running]);
 const move=(event:PointerEvent<HTMLDivElement>)=>{
  if(!running||event.pointerType==='touch')return;
  const rect=event.currentTarget.getBoundingClientRect(),state=pointer.current;state.targetX=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));state.targetY=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
  if(state.frame)return;
  const draw=()=>{state.frame=0;state.x+=(state.targetX-state.x)*.16;state.y+=(state.targetY-state.y)*.16;plane.current?.style.setProperty('--atlas-x',state.x.toFixed(3));plane.current?.style.setProperty('--atlas-y',state.y.toFixed(3));if(Math.abs(state.x-state.targetX)+Math.abs(state.y-state.targetY)>.002)state.frame=requestAnimationFrame(draw);};
  state.frame=requestAnimationFrame(draw);
 };
 const groupLabel=locale==='zh'?'选择资源类型':locale==='ja'?'リソースの種類':'Choose a resource type',open=locale==='zh'?'打开资源':locale==='ja'?'リソースを開く':'Open resource';
 return <div ref={host} className="home-resource-sculpture resource-atlas" data-running={running} data-quiet={quiet} data-category={group.id} role="group" aria-label={label}>
  <div className="atlas-browser-bar"><span className="atlas-browser-dots" aria-hidden="true"><i/><i/><i/></span><span>iavse / resources</span><Icon name="grid"/></div>
  <div className="atlas-toolbar"><div className="atlas-mode-switch" role="group" aria-label={groupLabel}>{groups.map((item,index)=><button type="button" key={item.id} aria-pressed={category===index} onClick={()=>{setCategory(index);setSelected(0);}}><Icon name={item.icon}/><span>{item.title}</span></button>)}</div><button className="atlas-pause" type="button" aria-label={paused?playLabel:pauseLabel} aria-pressed={paused} onClick={()=>setPaused(value=>!value)}><Icon name={paused?'play':'pause'}/></button></div>
  <div className="atlas-workspace" onPointerMove={move} onPointerLeave={resetPointer}>
   <div className="atlas-perspective" ref={plane} style={{'--atlas-selection':selected} as CSSProperties}>
    <svg className="atlas-paths" viewBox="0 0 640 340" preserveAspectRatio="none" aria-hidden="true"><path d="M224 170H264Q284 170 284 150V70Q284 48 308 48H370"/><path d="M224 170H370"/><path d="M224 170H264Q284 170 284 190V270Q284 292 308 292H370"/>{[0,1,2].map(index=><path key={index} className={selected===index?'is-selected':''} d={index===0?'M224 170H264Q284 170 284 150V70Q284 48 308 48H370':index===1?'M224 170H370':'M224 170H264Q284 170 284 190V270Q284 292 308 292H370'}/>)}</svg>
    <div className="atlas-book" aria-hidden="true"><div className="atlas-book-shadow"/><div className="atlas-sheet atlas-sheet-back"/><div className="atlas-sheet atlas-sheet-middle"/><div className="atlas-sheet atlas-sheet-front"><span className="atlas-book-mark">IAVSE</span><div className="atlas-book-symbol"><Icon name={group.icon}/></div><strong>{group.title}</strong><span className="atlas-book-word">{group.word}</span><span className="atlas-book-footer"><span>↗</span><i/><i/><i/></span></div></div>
    <div className="atlas-nodes">{group.entries.map((item,index)=><button key={item.href} type="button" className={'atlas-node'+(selected===index?' is-selected':'')} aria-pressed={selected===index} onClick={()=>setSelected(index)}><span className="atlas-node-icon"><Icon name={item.icon}/></span><span>{item.title}</span><span className="atlas-node-dot" aria-hidden="true"/></button>)}</div>
   </div>
  </div>
  <div className="atlas-detail" aria-live="polite"><div><strong>{entry.title}</strong><p>{entry.description}</p></div><Link href={entry.href} aria-label={open+' · '+entry.title}><Icon name="arrow"/></Link></div>
 </div>;
}
