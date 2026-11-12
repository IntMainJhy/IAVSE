'use client';

import Link from 'next/link';
import {ArrowRight, ArrowUpRight} from 'lucide-react';
import {useId, useState} from 'react';
import {FeedAvatar} from '@/components/FeedAvatar';
import {useLocale} from '@/components/LocaleProvider';
import {landingCopy} from '@/lib/landing-copy';
import type {LandingContent} from './IavseLanding';
import '@/app/landing-space-showcase.css';

const templateLabels = {
  zh: {
    choose: '选择模板预览', editorial: '图文手记', resume: '个人简历',
    editorialAlt: '浅色纸面上的衬线标题与人物插画，下方分节列出个人介绍与专长。',
    resumeAlt: '黑色背景上的粗体姓名与方形头像，下方依次展示简介、技能标签和项目经历。',
  },
  en: {
    choose: 'Choose a template preview', editorial: 'Editorial', resume: 'Résumé',
    editorialAlt: 'A serif name and illustrated portrait on warm paper, with a bio and specialties below.',
    resumeAlt: 'A bold name and square portrait on a black page, followed by a bio, skill tags and project experience.',
  },
  ja: {
    choose: 'テンプレートのプレビューを選択', editorial: '読みもの', resume: '履歴書',
    editorialAlt: '淡い紙色に明朝体の名前と人物イラストを配し、その下に自己紹介と専門分野が続きます。',
    resumeAlt: '黒地に太字の名前と四角い人物イラストを並べ、下に自己紹介、スキルタグ、プロジェクト経験を掲載しています。',
  },
};

const templates = ['editorial', 'resume'] as const;

export function LandingSpaceShowcase({space}: {space: LandingContent['space']}) {
  const {locale} = useLocale();
  const c = landingCopy(locale);
  const labels = templateLabels[locale];
  const [template, setTemplate] = useState<typeof templates[number]>('editorial');
  const previewId = useId();

  return <section className="iv-space-showcase" aria-label={c.blogs}>
    <div className="iv-space-intro" data-landing-reveal>
      <h2>{c.spaceTitle}</h2>
      <p>{c.spaceBody}</p>
    </div>

    <figure className="iv-space-board" data-landing-reveal>
      <div className="iv-space-mat" id={previewId} data-template={template}>
        <img key={template} src={'/media/home-product/space-' + template + '.webp'} alt={template === 'editorial' ? labels.editorialAlt : labels.resumeAlt} width={1280} height={860} loading="lazy"/>
      </div>
      <figcaption>
        <div className="iv-space-picker" role="group" aria-label={labels.choose} data-space-templates>
          {templates.map(id => <button key={id} type="button" aria-pressed={template === id} aria-controls={previewId} onClick={() => setTemplate(id)}>
            <span className={'iv-space-swatch iv-space-swatch--' + id} aria-hidden="true"/>
            {labels[id]}
          </button>)}
        </div>
        <span className="iv-space-sample-note">{c.example}</span>
      </figcaption>
    </figure>

    <div className="iv-space-details" data-landing-reveal>
      <div className="iv-space-destinations">
        <Link href="/workspace/blog" className="iv-button">{c.createSpace}<ArrowUpRight size={16} aria-hidden="true"/></Link>
        <Link href="/blogs" className="iv-text-link">{c.exploreSpace}<ArrowRight size={15} aria-hidden="true"/></Link>
      </div>
      <p className="iv-space-publishing">{c.spacePublishing}</p>
      {space && <Link href={space.href} className="iv-member-space">
        {space.coverId
          ? <img className="iv-member-cover" src={'/media/' + encodeURIComponent(space.coverId)} alt="" width={72} height={54} loading="lazy"/>
          : <FeedAvatar name={space.name || space.handle} avatarId={space.avatarId}/>}
        <span className="iv-member-space-copy">
          <span>{c.publicSpace}</span>
          <strong>{space.name || space.handle}</strong>
          {space.intro && <span className="iv-member-bio">{space.intro}</span>}
        </span>
        <ArrowUpRight size={16} aria-hidden="true"/>
      </Link>}
    </div>
  </section>;
}
