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
 const root=useRef<HTMLElement>(null),[paused,setPaused]=useState(false),[quiet,setQuiet]=useState(true),[visible,setVisible]=useState(false),[globalPaused,setGlobalPaused]=useState(false);
 const copy=index===0?{title:'创作者的声音',note:'以下为示例评论，期待你的真实反馈。',pause:'暂停评论滚动',play:'继续评论滚动'}:index===2?{title:'クリエイターの声',note:'デモ用のコメントです。あなたの声をお待ちしています。',pause:'コメントを停止',play:'コメントを再生'}:{title:'Made for voices like yours.',note:'Illustrative comments. Your real feedback comes next.',pause:'Pause comments',play:'Resume comments'};
 useEffect(()=>{
  const element=root.current;if(!element)return;
  const preference=matchMedia('(prefers-reduced-motion:reduce)');let saved=false;try{saved=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}
  const sync=()=>setQuiet(saved||preference.matches||document.hidden);
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value:boolean}>).detail;if(detail?.action==='reduced'){saved=!!detail.value;sync();}else if(detail?.action==='paused')setGlobalPaused(!!detail.value);};
  const observer=new IntersectionObserver(entries=>setVisible(entries.some(entry=>entry.isIntersecting)),{rootMargin:'100px'});observer.observe(element);sync();
  preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('iavse-scene-control',control);
  return()=>{observer.disconnect();preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);window.removeEventListener('iavse-scene-control',control);};
 },[]);
 const card=(voice:typeof voices[number])=><figure className="creator-voice" key={voice.name}><blockquote>{voice.text[index]}</blockquote><figcaption><img src={'/avatars/creators/'+voice.avatar+'.svg'} alt="" width={44} height={44} loading="lazy" decoding="async"/><span>{voice.name}<small>{voice.role[index]}</small></span></figcaption></figure>;
 return <section ref={root} className="creator-voices" aria-labelledby="creator-voices-title" data-paused={paused||quiet||globalPaused||!visible} data-quiet={quiet}>
  <header><div><h2 id="creator-voices-title">{copy.title}</h2><p>{copy.note}</p></div><button type="button" className="creator-voices-control" aria-label={paused?copy.play:copy.pause} aria-pressed={paused} disabled={quiet||globalPaused} onClick={()=>setPaused(value=>!value)}><Icon name={paused?'play':'pause'}/></button></header>
  <div className="creator-voices-window">{[voices.slice(0,3),voices.slice(3)].map((row,i)=><div className="creator-voices-row" key={i} data-direction={i?'right':'left'} tabIndex={quiet?0:undefined} role={quiet?'region':undefined} aria-label={quiet?copy.title+' '+(i+1):undefined}><div className="creator-voices-track"><div className="creator-voices-group">{row.map(card)}</div><div className="creator-voices-group" aria-hidden="true" inert>{row.map(card)}</div></div></div>)}</div>
 </section>;
}
