'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {ArrowRight, Plus} from 'lucide-react';
import {useLocale} from '../LocaleProvider';
import {useHomeStyle} from './HomeStyleProvider';
import {LandingScene} from './LandingScene';

export function LandingHero() {
  const {locale} = useLocale(), {style} = useHomeStyle();
  const [paused, setPaused] = useState(false), [opened, setOpened] = useState(false), [dusk, setDusk] = useState(false);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPaused(preference.matches); sync();
    preference.addEventListener('change', sync); return () => preference.removeEventListener('change', sync);
  }, []);
  useEffect(() => {setOpened(false);}, [style]);
  const zh = locale === 'zh', ja = locale === 'ja';
  const title = style === 'anime' ? zh ? ['把热爱，', '写成自己的故事。'] : ja ? ['好きなことを、', '自分だけの物語に。'] : ['Turn what you love', 'into your own story.']
    : style === 'fly' ? zh ? ['灵感汇聚，', '创作发生。'] : ja ? ['アイデアが集まり、', '創作がはじまる。'] : ['Ideas come together.', 'Creation happens.']
      : zh ? ['每一次创作，都有来处。'] : ja ? ['すべての創作に、きっかけがある。'] : ['Every creation starts somewhere.'];
  const description = style === 'anime' ? zh ? <>发现好用的资源、教程与 Skill，<br/>也把你的创作，分享给同路的人。</> : ja ? <>リソースやガイド、Skill に出会い、<br/>自分の創作を仲間に届けよう。</> : <>Discover resources, guides and Skills.<br/>Share what you make with kindred minds.</>
    : zh ? style === 'fly' ? '发现好资源，让想法继续生长。' : <>资源、教程、Skill 与分享，<br className="hs-mobile-break"/>都从这里找到。</> : ja ? 'リソース、ガイド、Skill、みんなの創作。' : 'Resources, guides, Skills and work worth sharing.';
  const cta = zh ? style === 'brand' ? '打开内容库' : style === 'anime' ? '发现灵感' : '探索内容' : ja ? 'リソースを探す' : 'Explore resources';
  const names = zh ? {fly:'字符潮汐',brand:'打开 IAVSE',anime:'海风来信'} : ja ? {fly:'文字の潮流',brand:'IAVSE を開く',anime:'海風の便り'} : {fly:'CHARACTER TIDE',brand:'OPEN IAVSE',anime:'A LETTER FROM THE SEA'};
  return <section key={style} className={'hs-hero hs-hero--'+style} data-home-hero={style} data-paused={paused}>
    {style !== 'brand' && <LandingScene key={style} style={style} paused={paused} opened={opened} dusk={dusk}/>}
    {style === 'fly' && <div className="hs-island" data-open={opened} onKeyDown={event => {if(event.key === 'Escape') setOpened(false);}}>
      <button className="hs-island-trigger" type="button" aria-expanded={opened} aria-controls="home-island-content" onClick={() => setOpened(!opened)}><span className="hs-island-mark" aria-hidden="true">∿</span><strong>{zh ? '灵感岛' : ja ? 'アイデアの島' : 'Inspiration island'}</strong><span>{zh ? '本周精选' : ja ? '今週の注目' : 'Selected for you'}</span><Plus size={20} aria-hidden="true"/></button>
      <div className="hs-island-content" id="home-island-content" hidden={!opened}><span>SKILL / UI DESIGN</span><h2>oil-ui</h2><p>{zh ? '从设计方向到真实界面，让每一次创作有据可依。' : ja ? '方向性から実装まで、根拠のある UI デザイン。' : 'A clear direction, from the first idea to a real interface.'}</p><Link href="/skills">{zh ? '探索设计 Skill' : ja ? 'Skill を探す' : 'Explore Skills'}<ArrowRight size={17} aria-hidden="true"/></Link></div>
    </div>}
    <div className="hs-copy">
      <p className="hs-eyebrow">{style === 'anime' ? zh ? '写给每一个正在创作的你' : ja ? '創作を続けるあなたへ' : 'FOR EVERYONE WHO CREATES' : zh ? '灵感 · 工具 · 创作' : ja ? '発見 · ツール · 創作' : 'IDEAS · TOOLS · CREATION'}</p>
      <h1>{title.map(line => <span key={line}>{line}</span>)}</h1>
      {style !== 'brand' && <><p className="hs-description">{description}</p><Link href="/resources" className="hs-cta">{cta}<ArrowRight size={22} aria-hidden="true"/></Link></>}
    </div>
    {style === 'brand' && <><div className="hs-brand-object"><LandingScene key={style} style={style} paused={paused} opened={opened} dusk={false}/><button type="button" className="hs-v-control" aria-label={zh ? '展开立体字标' : ja ? '立体ロゴを開く' : 'Open the sculpted wordmark'} aria-pressed={opened} onClick={() => setOpened(!opened)}/></div><div className="hs-brand-action"><Link href="/resources" className="hs-cta" onPointerEnter={() => setOpened(true)} onPointerLeave={() => setOpened(false)}>{cta}<ArrowRight size={20} aria-hidden="true"/></Link><p className="hs-description">{description}</p></div></>}
    {style === 'anime' && <div className="hs-vertical" aria-hidden="true">{zh ? '风起时，灵感也有了方向。' : ja ? '風が吹けば、ひらめきも動き出す。' : 'FOLLOW THE BREEZE, FIND YOUR IDEA.'}</div>}
    <div className="hs-controls"><span>{names[style]}<i>/</i><span>{style === 'anime' ? 'A LETTER FROM THE SEA' : 'IAVSE · CREATE TOGETHER'}</span></span><div>{style === 'anime' && <button type="button" aria-pressed={dusk} onClick={() => setDusk(!dusk)}>{zh ? `光线 · ${dusk ? '暮色' : '日落'}` : ja ? dusk ? '夕闇' : '夕焼け' : dusk ? 'Dusk' : 'Sunset'}</button>}<button type="button" data-home-motion aria-pressed={paused} onClick={() => setPaused(!paused)}>{zh ? paused ? '播放动态' : '暂停动态' : ja ? paused ? '再生する' : '一時停止' : paused ? 'Play motion' : 'Pause motion'}</button></div></div>
    {style === 'anime' && <div className="hs-discovery"><span>{zh ? '此刻的灵感' : ja ? 'いまのひらめき' : 'A LITTLE INSPIRATION'}</span><Link href="/skills"><small>SKILL</small><strong>{zh ? '让想法，从这里开始生长。' : ja ? 'アイデアを育てよう。' : 'Give your next idea a place to grow.'}</strong><ArrowRight size={21} aria-hidden="true"/></Link><Link href="/resources" className="hs-discovery-more">{zh ? '浏览内容库' : ja ? 'リソース一覧' : 'Browse resources'}<ArrowRight size={17} aria-hidden="true"/></Link></div>}
  </section>;
}
