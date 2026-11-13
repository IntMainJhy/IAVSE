// Source: DavidHDev/rbp-portfolio @ 1581b9b8e5876f60e5eb844970747506980c4412, app/about/page.tsx.
// Existing component order and motion; IAVSE independently refines visual roles and spacing.
import './about/studio.css';
import { Experience } from './about/experience';
import { PolaroidStrip } from './about/polaroid-strip';
import { Stack } from './about/stack';
import { aboutLocale } from './about/copy';
import { ContactCard } from './contact/contact-card';
import { FadeIn } from './ui/motion-primitives';
import type { ReactNode } from 'react';

const copy = {
  zh: {greeting: '关于 ', intro: '在 IAVSE 查找设计、工具和实践指南，与社区交流心得，也可以建立自己的作品主页。'},
  en: {greeting: 'About ', intro: 'Find designs, tools and practical guides, trade notes in the community, and build a homepage for your work.'},
  ja: {greeting: '', intro: 'デザインやツールを探し、試したことをコミュニティで共有できます。自分の作品を紹介するホームページも作れます。'},
};

const story={
  zh:{more:'展开介绍',less:'收起介绍',paragraphs:['一个好工具往往藏在某个人的实践笔记里。IAVSE 把这些线索整理到同一个地方：你可以按用途查看界面设计、文档与 AI Skill，回到原项目核对来源和使用许可，再决定是否用于自己的作品。','社区用来记录试过的方法、踩过的坑和值得再用的工具。想把零散的经验整理成作品集时，可以建立个人博客，把项目、文章和资源放在自己的地址下。博客空间的画廊则给这些主页留了一个展示位置。']},
  en:{more:'Read more',less:'Show less',paragraphs:['A useful tool often hides in someone’s working notes. The IAVSE directory brings designs, documentation and AI skills together by purpose. Each entry points back to its source so you can check the license before using it in your work.','The community is a place for field notes, experiments and tools worth revisiting. A personal blog brings projects, articles and resources together at one address. The space gallery gives those homepages a place to be discovered.']},
  ja:{more:'続きを見る',less:'閉じる',paragraphs:['役立つツールは、誰かの制作ノートに隠れていることがあります。IAVSE ではデザイン、ドキュメント、AI Skill を用途から探し、元のプロジェクトで出典とライセンスを確かめられます。','コミュニティには、試した方法や制作中の発見を記録できます。個人ブログでは作品、記事、リソースを一つのアドレスにまとめられます。ギャラリーは、そんなホームページに出会う場所です。']}
};

export function AboutPage({ locale = 'zh' }: { locale?: string }): ReactNode {
  const c = copy[aboutLocale(locale)], detail=story[aboutLocale(locale)];
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-312 pt-32 sm:pt-44">
        <PolaroidStrip />
      </section>

      <section className="mx-auto w-full max-w-160 px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-24">
        <FadeIn delay={0.5}>
          <div data-iavse-about-intro className="rounded-4xl border border-foreground/5 bg-foreground/1.5 p-8 max-md:text-center sm:p-12 dark:bg-foreground/3">
            <h1 className="font-serif text-[1.75rem] font-medium tracking-tight text-foreground sm:text-[2rem]">
              {c.greeting}<span className="border-b border-foreground/30 pb-0.5">IAVSE</span>{locale === 'ja' && ' について'}
            </h1>
            <p className="about-lead">{c.intro}</p>
            <details className="about-story">
              <summary><span className="about-excerpt" aria-hidden="true">{detail.paragraphs[0]}</span><span className="about-more">{detail.more} ↓</span><span className="about-less">{detail.less} ↑</span></summary>
              <div className="about-story-body">{detail.paragraphs.map(text=><p key={text}>{text}</p>)}</div>
            </details>
          </div>
        </FadeIn>
      </section>

      <section className="mx-auto w-full max-w-[40rem] px-6 pb-20 sm:px-10 sm:pb-28">
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-10">
            <Experience locale={locale}/>
            <Stack locale={locale}/>
          </div>
        </FadeIn>
      </section>

      <ContactCard locale={locale}/>
      <div className="h-12 sm:h-16" />
    </main>
  );
}
