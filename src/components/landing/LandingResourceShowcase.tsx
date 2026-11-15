'use client';

import Link from 'next/link';
import {ArrowUpRight, BookOpen, Compass, PanelsTopLeft, Sparkles} from 'lucide-react';
import {useLocale} from '@/components/LocaleProvider';
import {landingCopy} from '@/lib/landing-copy';
import '@/app/landing-resources.css';

export type ResourceShowcaseGroup = {
  id: string;
  href: string;
  items: {id: string; title: string; source: string; image?: string; href: string}[];
};

const copy = {
  zh: {intro: '从界面模板里找布局，挑一个 Skill 改进设计，再顺着文档动手做。', browse: '浏览此分类'},
  en: {intro: 'Explore layouts, find a design skill and open a guide when you’re ready to build.', browse: 'Browse category'},
  ja: {intro: 'テンプレートでレイアウトを見比べ、デザインに役立つ Skill や制作手順を探せます。', browse: 'このカテゴリを見る'},
};

// The design catalog records these template titles in Chinese.
const templateTitles: Record<string, {en: string; ja: string}> = {
  'template-astro-paper': {en: 'AstroPaper blog', ja: 'AstroPaper 技術ブログ'},
  'template-adminkit': {en: 'AdminKit dashboard', ja: 'AdminKit 管理画面'},
  'template-agency': {en: 'Agency portfolio', ja: 'Agency ポートフォリオ'},
};

export function LandingResourceShowcase({groups}: {groups: ResourceShowcaseGroup[]}) {
  const {locale, t} = useLocale();
  const c = landingCopy(locale);
  const labels = copy[locale];
  const categories = [
    {id: 'designs', label: c.design, icon: PanelsTopLeft},
    {id: 'skills', label: c.skill, icon: Sparkles},
    {id: 'docs', label: c.docs, icon: BookOpen},
    {id: 'resources', label: c.tools, icon: Compass},
  ];

  const designs = groups.find(group => group.id === 'designs');
  return <aside className="iv-catalog" aria-label={c.resources}>
    <div className="iv-catalog-intro" data-story-reveal>
      <div><h2>{c.resourceTitle}</h2><p>{labels.intro}</p></div>
      <Link className="iv-text-link" href="/resources">{c.resources}<ArrowUpRight size={17} aria-hidden="true"/></Link>
    </div>
    <nav className="iv-catalog-index" aria-label={c.resources} data-story-reveal>
      {categories.map(({id, label, icon: Icon}) => {
        const group = groups.find(group => group.id === id);
        return group ? <Link key={id} href={group.href} className="iv-catalog-category"><Icon size={23} strokeWidth={1.4} aria-hidden="true"/><span>{label}</span><ArrowUpRight size={16} aria-hidden="true"/></Link> : null;
      })}
    </nav>
    <ul className="iv-catalog-covers" data-story-reveal>
      {designs?.items.map(item => {
        const title = locale === 'zh' ? item.title : templateTitles[item.id]?.[locale] ?? t(item.title);
        const external = /^https?:\/\//.test(item.href);
        return <li key={item.id}><Link href={item.href} prefetch={false} className="iv-catalog-item" target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
          {item.image && <img src={item.image} alt="" width={384} height={240} loading="lazy" decoding="async"/>}
          <span className="iv-catalog-item-title">{title}</span><span className="iv-catalog-origin">{item.source}</span>
        </Link></li>;
      })}
    </ul>
    <p className="iv-catalog-note">{c.resourceNote}</p>
  </aside>;
}
