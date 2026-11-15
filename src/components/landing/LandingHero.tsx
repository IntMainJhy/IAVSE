'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useLocale} from '../LocaleProvider';
import {useHomeStyle} from './HomeStyleProvider';
import {LandingScene} from './LandingScene';

export function LandingHero() {
  const {locale} = useLocale(), {style} = useHomeStyle();
  const [paused, setPaused] = useState(false), [opened, setOpened] = useState(false);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPaused(preference.matches); sync();
    preference.addEventListener('change', sync); return () => preference.removeEventListener('change', sync);
  }, []);
  useEffect(() => {setOpened(false);}, [style]);
  if (style === 'classic') return null;
  const zh = locale === 'zh', ja = locale === 'ja';
  const title = style === 'anime' ? zh ? ['把热爱，', '写成自己的故事。'] : ja ? ['好きなことを、', '自分だけの物語に。'] : ['Turn what you love', 'into your own story.']
    : style === 'fly' ? zh ? ['灵感汇聚，', '创作发生。'] : ja ? ['アイデアが集まり、', '創作がはじまる。'] : ['Ideas come together.', 'Creation happens.']
      : zh ? ['每一次创作，都有来处。'] : ja ? ['すべての創作に、きっかけがある。'] : ['Every creation starts somewhere.'];
  const description = style === 'anime' ? zh ? <>发现好用的资源、教程与 Skill，<br/>也把你的创作，分享给同路的人。</> : ja ? <>リソースやガイド、Skill に出会い、<br/>自分の創作を仲間に届けよう。</> : <>Discover resources, guides and Skills.<br/>Share what you make with kindred minds.</>
    : zh ? style === 'fly' ? '发现好资源，让想法继续生长。' : <>资源、教程、Skill 与分享，<br className="hs-mobile-break"/>都从这里找到。</> : ja ? 'リソース、ガイド、Skill、みんなの創作。' : 'Resources, guides, Skills and work worth sharing.';
  const cta = zh ? style === 'brand' ? '打开内容库' : style === 'anime' ? '发现灵感' : '探索内容' : ja ? 'リソースを探す' : 'Explore resources';
  return <section key={style} className={'hs-hero hs-hero--'+style} data-home-hero={style} data-paused={paused}>
    {style !== 'brand' && <LandingScene key={style} style={style} paused={paused} opened={opened} dusk={false}/>}
    <div className="hs-copy">
      <p className="hs-eyebrow">{style === 'anime' ? zh ? '写给每一个正在创作的你' : ja ? '創作を続けるあなたへ' : 'FOR EVERYONE WHO CREATES' : zh ? '灵感 · 工具 · 创作' : ja ? '発見 · ツール · 創作' : 'IDEAS · TOOLS · CREATION'}</p>
      <h1>{title.map(line => <span key={line}>{line}</span>)}</h1>
      {style !== 'brand' && <><p className="hs-description">{description}</p><Link href="/resources" className="hs-cta">{cta}</Link></>}
    </div>
    {style === 'brand' && <><div className="hs-brand-object"><LandingScene key={style} style={style} paused={paused} opened={opened} dusk={false}/><button type="button" className="hs-v-control" aria-label={zh ? '展开立体字标' : ja ? '立体ロゴを開く' : 'Open the sculpted wordmark'} aria-pressed={opened} onClick={() => setOpened(!opened)}/></div><div className="hs-brand-action"><Link href="/resources" className="hs-cta" onPointerEnter={() => setOpened(true)} onPointerLeave={() => setOpened(false)}>{cta}</Link><p className="hs-description">{description}</p></div></>}

  </section>;
}
