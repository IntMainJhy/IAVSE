// Source: DavidHDev/rbp-portfolio @ 1581b9b8e5876f60e5eb844970747506980c4412, app/about/page.tsx.
// Original component order, spacing and motion; IAVSE product content replaces sample biography.
import { Education } from './about/education';
import { Experience } from './about/experience';
import { PolaroidStrip } from './about/polaroid-strip';
import { Skills } from './about/skills';
import { Stack } from './about/stack';
import { aboutLocale } from './about/copy';
import { ContactCard } from './contact/contact-card';
import { FadeIn } from './ui/motion-primitives';
import type { ReactNode } from 'react';

const copy = {
  zh: {
    greeting: '你好，这里是 ',
    p1: ['IAVSE 是一个连接', '资源发现与社区交流', '的网站。这里整理设计、知识和工具，也为每个人提供', '个人博客空间', '，把介绍、作品与文字放在一起，通过', '可视化编辑', '调整自己的内容。'],
    p2: ['有用的内容不仅是一份链接，也包括它的来源、许可和使用方式。你可以从资源目录开始，查看原始项目和说明，再把实践中获得的经验带回', '社区讨论', '，参与评论、收藏内容或关注感兴趣的人。'],
    p3: ['从现成的', '内置博客模板', '开始，整理内容，调整布局，预览后再按照当前权限与页面流程发布。IAVSE 希望让', '发现、创作与分享', '在同一个地方自然连接。'],
  },
  en: {
    greeting: 'Hello! This is ',
    p1: ['IAVSE brings ', 'resource discovery and community exchange', ' together. Explore design, knowledge and tools, and create a ', 'personal blog space', ' for your introduction, work and writing. Shape that content through ', 'visual editing', '.'],
    p2: ['A useful resource is more than a link: its source, license and usage notes matter too. Start with the directory, explore the original project, then bring what you learn back to ', 'community discussions', '. Join a conversation, bookmark useful content and follow people whose work interests you.'],
    p3: ['Begin with the ', 'built-in blog templates', ', arrange your content and layout, preview the result, and publish through the current permission workflow. IAVSE connects ', 'discovery, creation and sharing', ' in one place.'],
  },
  ja: {
    greeting: 'こんにちは、ここは ',
    p1: ['IAVSE は、', 'リソースの発見とコミュニティの交流', 'をつなぐ場所です。デザイン、知識、ツールを見つけながら、紹介、作品、文章をまとめる', '自分のブログスペース', 'を作り、', 'ビジュアル編集', 'で内容を整えられます。'],
    p2: ['役立つリソースには、リンクだけでなく出典、ライセンス、使い方も欠かせません。一覧から元のプロジェクトを確かめ、試して学んだことを', 'コミュニティの話し合い', 'に持ち寄りましょう。コメント、保存、フォローを通じて交流できます。'],
    p3: ['まずは', '内蔵ブログテンプレート', 'を選び、内容とレイアウトを調整し、プレビュー後に現在の権限と手順に沿って公開します。IAVSE は、', '発見、制作、共有', 'をひとつの場所でつなぎます。'],
  },
};

export function AboutPage({ locale = 'zh' }: { locale?: string }): ReactNode {
  const c = copy[aboutLocale(locale)];
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-312 pt-40 sm:pt-56">
        <PolaroidStrip />
      </section>

      <section className="mx-auto w-full max-w-160 px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-24">
        <FadeIn delay={0.5}>
          <div className="rounded-4xl border border-foreground/5 bg-foreground/1.5 p-8 sm:p-12 dark:bg-foreground/3">
            <h1 className="font-serif text-[1.75rem] font-medium tracking-tight text-foreground sm:text-[2rem]">
              {c.greeting}<span className="border-b border-foreground/30 pb-0.5">IAVSE</span>.
            </h1>
            <div className="mt-8 space-y-6 text-[17px] leading-[1.7] tracking-tight text-foreground/75 sm:text-[18px]">
              <p>
                {c.p1[0]}<strong className="font-semibold text-foreground">{c.p1[1]}</strong>{c.p1[2]}<strong className="font-semibold text-foreground">{c.p1[3]}</strong>{c.p1[4]}<strong className="font-semibold text-foreground">{c.p1[5]}</strong>{c.p1[6]}
              </p>
              <p>
                {c.p2[0]}<strong className="font-semibold text-foreground">{c.p2[1]}</strong>{c.p2[2]}
              </p>
              <p>
                {c.p3[0]}<strong className="font-semibold text-foreground">{c.p3[1]}</strong>{c.p3[2]}<strong className="font-semibold text-foreground">{c.p3[3]}</strong>{c.p3[4]}
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="mx-auto w-full max-w-[40rem] px-6 pb-20 sm:px-10 sm:pb-28">
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-10">
            <Experience locale={locale}/>
            <Education locale={locale}/>
            <Skills locale={locale}/>
            <Stack locale={locale}/>
          </div>
        </FadeIn>
      </section>

      <ContactCard locale={locale}/>
      <div className="h-12 sm:h-16" />
    </main>
  );
}
