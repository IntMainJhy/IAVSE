'use client';

import {useEffect,useRef,useState} from 'react';
import {useLocale} from './LocaleProvider';
import {Icon} from './Icons';

const voices=[
 {name:'Mira',avatar:'mira',role:['独立开发者','Independent developer','個人開発者'],text:['项目、文章和经历放在一起，别人终于能完整地认识我的创作。','My projects, writing, and experience finally belong in one place.','作品も文章も経験も、自分の創作をひとつの場所に。']},
 {name:'Lin',avatar:'lin',role:['技术写作者','Technical writer','技術ライター'],text:['我想要一个能认真写作，也能自由表达自己的空间。','A place to write thoughtfully and make something that feels like me.','じっくり書いて、自分らしく表現できる場所がほしい。']},
 {name:'Noah',avatar:'noah',role:['开源创作者','Open source creator','オープンソース開発者'],text:['好工具被整理、被分享，就能成为下一次创作的起点。','A useful discovery shared today can start someone’s next project.','今日共有した発見が、誰かの次の制作につながる。']},
 {name:'Aya',avatar:'aya',role:['设计工程师','Design engineer','デザインエンジニア'],text:['页面可以自己编排，作品也有了合适的展示方式。','Being able to arrange my own page gives the work room to speak.','自由にページを組み立てて、作品に合う見せ方を。']},
 {name:'Leo',avatar:'leo',role:['产品开发者','Product maker','プロダクト開発者'],text:['把开发途中那些小发现留下来，慢慢就有了自己的知识库。','Small discoveries along the way become a personal library over time.','開発中の小さな発見を残して、自分のライブラリに。']},
 {name:'Sora',avatar:'sora',role:['创意开发者','Creative developer','クリエイティブ開発者'],text:['从一个想法开始，让做过的事情被更多同路人看见。','Start with an idea. Let the things you make find their people.','ひとつのアイデアから、作品を同じ想いの人へ。']}
];

/** Illustrative feedback is explicitly labeled and never treated as real social proof. */
export function CreatorVoices(){
 const {locale}=useLocale(),index=locale==='zh'?0:locale==='ja'?2:1;
 const root=useRef<HTMLElement>(null),rail=useRef<HTMLDivElement>(null),metrics=useRef({step:0,max:0}),[canPrevious,setCanPrevious]=useState(false),[canNext,setCanNext]=useState(true),[quiet,setQuiet]=useState(true),[visible,setVisible]=useState(false),[entry,setEntry]=useState<'waiting'|'static'|'animate'>('waiting'),[hidden,setHidden]=useState(false),[globalPaused,setGlobalPaused]=useState(false);
 const copy=index===0?{title:'创作者的声音',note:'以下为示例评论，期待你的真实反馈。',previous:'上一组评论',next:'下一组评论',browse:'浏览创作者评论'}:index===2?{title:'クリエイターの声',note:'デモ用のコメントです。あなたの声をお待ちしています。',previous:'前のコメント',next:'次のコメント',browse:'クリエイターのコメントを見る'}:{title:'Made for voices like yours.',note:'Illustrative comments. Your real feedback comes next.',previous:'Previous comments',next:'Next comments',browse:'Browse creator comments'};
 useEffect(()=>{
  const element=root.current,gallery=rail.current;if(!element||!gallery)return;
  const preference=matchMedia('(prefers-reduced-motion:reduce)');let saved=false;try{saved=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  let observed=false,navigationPending=document.documentElement.hasAttribute('data-iavse-transition');
  const sync=()=>{setQuiet(saved||preference.matches);setHidden(document.hidden||navigationPending);};
  const navigation=(event:Event)=>{const pending=(event as CustomEvent<{pending:boolean}>).detail?.pending;if(typeof pending==='boolean'){navigationPending=pending||document.documentElement.hasAttribute('data-iavse-transition');sync();}};
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced'){saved=!!detail.value;sync();}else if(detail?.action==='paused')setGlobalPaused(!!detail.value);};
  // A refresh or restored page can already show these cards before hydration.
  // Only an entrance from below gets a reveal; never hide readable content again.
  const observer=new IntersectionObserver(entries=>{const inView=entries.some(entry=>entry.isIntersecting);setVisible(inView);if(inView){const next=observed?'animate':'static';setEntry(value=>value==='waiting'?next:value);}observed=true;},{rootMargin:'100px'});observer.observe(element);sync();
  const measure=()=>{const first=gallery.children[0] as HTMLElement|undefined,second=gallery.children[1] as HTMLElement|undefined;metrics.current={step:first&&second?second.offsetLeft-first.offsetLeft:gallery.clientWidth,max:Math.max(0,gallery.scrollWidth-gallery.clientWidth)};setCanPrevious(gallery.scrollLeft>1);setCanNext(gallery.scrollLeft<metrics.current.max-1);};
  const size=new ResizeObserver(measure);size.observe(gallery);measure();
  preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('iavse-scene-control',control);
  window.addEventListener('iavse-navigation-pending',navigation);
  return()=>{observer.disconnect();size.disconnect();preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);window.removeEventListener('iavse-scene-control',control);window.removeEventListener('iavse-navigation-pending',navigation);};
 },[]);
 const syncEdges=()=>{const element=rail.current;if(!element)return;setCanPrevious(element.scrollLeft>1);setCanNext(element.scrollLeft<metrics.current.max-1);};
 const move=(direction:number)=>rail.current?.scrollBy({left:direction*metrics.current.step,behavior:quiet||globalPaused?'auto':'smooth'});
 const edge=(end:boolean)=>rail.current?.scrollTo({left:end?metrics.current.max:0,behavior:quiet||globalPaused?'auto':'smooth'});
 return <section ref={root} className="creator-voices" aria-labelledby="creator-voices-title" data-paused={quiet||hidden||globalPaused||!visible} data-quiet={quiet} data-entered={entry!=='waiting'} data-arrival={entry==='animate'}>
  <header><h2 id="creator-voices-title">{copy.title}</h2><p>{copy.note}</p></header>
  <div ref={rail} id="creator-voices-gallery" className="creator-voices-row" tabIndex={0} role="region" aria-label={copy.browse} onScroll={syncEdges} onKeyDown={event=>{if(event.target!==event.currentTarget)return;const direction=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0;if(direction){event.preventDefault();move(direction);}else if(event.key==='Home'||event.key==='End'){event.preventDefault();edge(event.key==='End');}}}>
   {voices.map(voice=><figure className="creator-voice" key={voice.name}><blockquote>{voice.text[index]}</blockquote><figcaption><img src={'/avatars/creators/'+voice.avatar+'.svg'} alt="" width={44} height={44} loading="lazy" decoding="async"/><span>{voice.name}<small>{voice.role[index]}</small></span></figcaption></figure>)}
  </div>
  <div className="creator-voices-controls" role="group" aria-label={copy.browse}><button type="button" aria-label={copy.previous} aria-controls="creator-voices-gallery" disabled={!canPrevious} onClick={()=>move(-1)}><Icon name="arrow"/></button><button type="button" aria-label={copy.next} aria-controls="creator-voices-gallery" disabled={!canNext} onClick={()=>move(1)}><Icon name="arrow"/></button></div>
 </section>;
}
