// Source: DavidHDev/rbp-portfolio @ 1581b9b8e5876f60e5eb844970747506980c4412, app/about/page.tsx.
// Existing component order and motion; IAVSE independently refines visual roles and spacing.
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

export function AboutPage({ locale = 'zh' }: { locale?: string }): ReactNode {
  const c = copy[aboutLocale(locale)];
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-312 pt-32 sm:pt-44">
        <PolaroidStrip />
      </section>

      <section className="mx-auto w-full max-w-160 px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-24">
        <FadeIn delay={0.5}>
          <div data-iavse-about-intro className="rounded-4xl border border-foreground/5 bg-foreground/1.5 p-8 sm:p-12 dark:bg-foreground/3">
            <h1 className="font-serif text-[1.75rem] font-medium tracking-tight text-foreground sm:text-[2rem]">
              {c.greeting}<span className="border-b border-foreground/30 pb-0.5">IAVSE</span>{locale === 'ja' && ' について'}
            </h1>
            <p className="mt-6 text-[17px] leading-[1.7] tracking-tight text-foreground/75 sm:text-[18px]">{c.intro}</p>
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
