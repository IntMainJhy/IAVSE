'use client';

import Link from 'next/link';
import {useState,useSyncExternalStore} from 'react';
import {LandingScene} from './landing/LandingScene';
import {useLocale} from './LocaleProvider';
import {Icon} from './Icons';
import '@/app/home-styles.css';
import '@/app/about-sea-breeze.css';

const readReducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverReducedMotion=()=>true;
function subscribeReducedMotion(onChange:()=>void){
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 preference.addEventListener('change',onChange);
 return()=>preference.removeEventListener('change',onChange);
}

/** The retained Sea breeze scene lives here, independent of platform appearance. */
export function AboutSeaBreeze(){
 const {locale}=useLocale(),quiet=useSyncExternalStore(subscribeReducedMotion,readReducedMotion,serverReducedMotion),[paused,setPaused]=useState(false);
 const say=(zh:string,en:string,ja:string)=>locale==='en'?en:locale==='ja'?ja:zh;
 const still=quiet!==false||paused;
 return <section className="about-sea-breeze" data-about-sea-breeze data-paused={still} aria-labelledby="about-sea-title">
  <LandingScene style="anime" paused={still} opened={false} dusk={false}/>
  <div className="about-sea-copy">
   <h1 id="about-sea-title">{say('每一次创作，','Every creation','すべての創作に、')}<br/>{say('都有来处。','starts somewhere.','きっかけがある。')}</h1>
   <p>{say('发现好用的资源、教程与 Skill，也把你的创作，分享给同路的人。','Discover resources, guides and Skills. Share what you make with kindred minds.','リソースやガイド、Skill に出会い、自分の創作を仲間に届けよう。')}</p>
   <div className="about-sea-actions"><Link className="platform-primary" href="/resources">{say('发现灵感','Explore resources','リソースを探す')}</Link><a className="about-story-link" href="#about-letter">{say('读这封来信','Read our letter','便りを読む')}<Icon name="chevron-down"/></a></div>
  </div>
  <div className="about-sea-footer"><span>{say('海风来信','A letter on the sea breeze','海風の便り')}</span><button type="button" onClick={()=>setPaused(value=>!value)} aria-pressed={paused} disabled={quiet===true} aria-label={say(still?'播放海风动画':'暂停海风动画',still?'Play the sea breeze':'Pause the sea breeze',still?'海風の動きを再開':'海風の動きを停止')}><Icon name={still?'play':'pause'}/><span>{say(still?'静静阅读':'让海风慢一点',still?'Read quietly':'A slower moment',still?'静かに読む':'少しゆっくり')}</span></button></div>
 </section>;
}
