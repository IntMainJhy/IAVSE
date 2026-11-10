// From DavidHDev/rbp-portfolio @ 1581b9b8e5876f60e5eb844970747506980c4412.
// Existing layout and motion retained; IAVSE independently refines type, surfaces and spacing. See docs/licenses/RBP-Portfolio.txt.
import {BrandMark} from "@/components/BrandMark";
import type { ReactNode } from "react";
import {portfolioCopy} from "@/lib/portfolio-content";

import { HeroCtas } from "./hero-ctas";
import { FadeIn, ScaleUnblur } from "@/components/rbp/ui/motion-primitives";
import { PortraitMorph } from "../../portfolio/PortraitMorph";

const PORTRAIT_SRC = "/media/portfolio/lin-studio.webp";
const PORTRAIT_HOVER_SRC = "/media/portfolio/leo-park.webp";

export function Hero({locale="zh"}:{locale?:string}): ReactNode {
 const c=portfolioCopy(locale);
  return (
    <section className="relative w-full" data-iavse-hero>
      <div className="mx-auto w-full max-w-275 px-6 pt-36 pb-20 sm:px-10 sm:pt-48 sm:pb-28">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-8">
          <FadeIn reveal="mount" className="flex flex-col gap-4">
            <p className="iavse-brand-greeting">
              <BrandMark/>{c.greeting}
            </p>

            <h1 className="text-[2.75rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[2.5rem] lg:text-[3.65rem]">
              <span className="block whitespace-nowrap">
                {c.title[0]}
              </span>
              <span className="block whitespace-nowrap">{c.title[1]}</span>
            </h1>

            <p className="iavse-hero-copy max-w-[34ch]">
              {c.intro}
            </p>

            <HeroCtas locale={locale} />
          </FadeIn>

          <ScaleUnblur className="flex justify-stretch md:justify-end">
            <div className="iavse-preview-frame relative aspect-square w-full md:max-w-105 overflow-hidden">
              <div className="relative h-full w-full overflow-hidden rounded-[1.6rem]">
                <PortraitMorph
                  srcA={PORTRAIT_SRC}
                  srcB={PORTRAIT_HOVER_SRC}
                  alt={c.templateAlt}
                />
              </div>
            </div>
          </ScaleUnblur>
        </div>
      </div>
    </section>
  );
}
