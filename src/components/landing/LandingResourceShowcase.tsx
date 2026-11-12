'use client';

import Link from 'next/link';
import {ArrowRight, ArrowUpRight, BookOpen, ChevronDown, Compass, PanelsTopLeft, Sparkles} from 'lucide-react';
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

  return <aside className="iv-catalog" aria-label={c.resources}>
    <div className="iv-catalog-intro" data-landing-reveal>
      <h2>{c.resourceTitle}</h2>
      <p>{labels.intro}</p>
    </div>
    <div className="iv-catalog-index" data-landing-reveal>
      {categories.map(({id, label, icon: Icon}) => {
        const group = groups.find(group => group.id === id);
        if (!group) return null;
        return <details key={id} name="iv-resource-groups" className="iv-catalog-group" open={id === 'designs'}>
          <summary>
            <Icon size={19} strokeWidth={1.6} aria-hidden="true"/>
            <span>{label}</span>
            <ChevronDown size={16} className="iv-catalog-chevron" aria-hidden="true"/>
          </summary>
          <ul className={id === 'designs' ? 'iv-catalog-covers' : 'iv-catalog-list'}>
            {group.items.map(item => {
              const title = locale === 'zh' ? item.title : templateTitles[item.id]?.[locale] ?? t(item.title);
              const external = /^https?:\/\//.test(item.href);
              return <li key={item.id}>
                <Link href={item.href} prefetch={false} className="iv-catalog-item"
                  target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
                  {item.image && <img src={item.image} alt="" width={384} height={240} loading="lazy" decoding="async"/>}
                  <span className="iv-catalog-item-title">{title}</span>
                  <span className="iv-catalog-origin">{item.source}</span>
                  {!item.image && <ArrowUpRight size={15} aria-hidden="true"/>}
                </Link>
              </li>;
            })}
          </ul>
          <Link className="iv-catalog-more" href={group.href} aria-label={`${labels.browse} · ${label}`}>
            {labels.browse}<ArrowRight size={15} aria-hidden="true"/>
          </Link>
        </details>;
      })}
      <p className="iv-catalog-note">{c.resourceNote}</p>
    </div>
  </aside>;
}
