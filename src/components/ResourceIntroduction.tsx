import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {serverI18n} from '@/lib/server-i18n';
import {portfolioCopy} from '@/lib/portfolio-content';
import {ContactCard} from './rbp/contact/contact-card';

const categories = [
  {id: 'designs', title: 'UI 设计', zh: '界面模板、设计规范与源码。', en: 'Interface templates, style guides and source code.', ja: 'UI テンプレート、デザインガイド、ソースコード。'},
  {id: 'skills', title: 'AI Skills', zh: '按任务挑选可复用的 AI 工作流程。', en: 'Reusable AI workflows, organized by task.', ja: '作業別に選べる AI ワークフロー。'},
  {id: 'docs', title: '文档', zh: '从搭建网站到发布第一篇文章。', en: 'Guides to setting up a site and publishing your first post.', ja: 'サイトの構築から最初の記事を公開するまで。'},
  {id: 'resources', title: '网站与工具', zh: '开发者手册、设计系统和实用工具。', en: 'Developer references, design systems and tools.', ja: '開発リファレンス、デザインシステム、便利なツール。'},
] as const;

export async function ResourceIntroduction() {
  const {locale, t} = await serverI18n();
  const c = portfolioCopy(locale);
  const language: 'zh' | 'en' | 'ja' = locale === 'zh' || locale === 'ja' ? locale : 'en';
  return <>
    <section className="resource-shelf" aria-labelledby="resource-shelf-title" data-rbp-reveal-scope>
      <header className="resource-shelf-heading" data-rbp-reveal-item>
        <h1 id="resource-shelf-title">{c.resourcesTitle}</h1>
        <p>{c.resourcesIntro}</p>
      </header>
      <ul className="resource-shelf-grid" data-rbp-reveal-group>
        {categories.map(category => (
          <li key={category.id} data-rbp-reveal-item>
            <Link className="resource-shelf-card" href={'/resources?type=' + category.id} data-kind={category.id} prefetch={false}>
              <span className="resource-shelf-art" aria-hidden="true">
                <img src={'/illustrations/resources/' + category.id + '.webp'} alt="" width={384} height={384} decoding="async"/>
              </span>
              <div className="resource-shelf-copy">
                <h2>{t(category.title)}</h2>
                <p>{category[language]}</p>
              </div>
              <ArrowUpRight className="resource-shelf-arrow" size={17} strokeWidth={1.7} aria-hidden="true"/>
            </Link>
          </li>
        ))}
      </ul>
    </section>
    <ContactCard locale={locale}/>
  </>;
}
