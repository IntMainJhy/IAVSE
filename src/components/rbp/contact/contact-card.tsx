// From DavidHDev/rbp-portfolio @ 1581b9b8e5876f60e5eb844970747506980c4412.
// Existing composition and motion with IAVSE content and independently refined visual roles. See docs/licenses/RBP-Portfolio.txt.
import { Github, UserRound, MessageCircle } from "lucide-react";
import {portfolioCopy} from "@/lib/portfolio-content";
import {SiteTools} from "@/components/SiteTools";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ContactCardCtas } from "./contact-card-ctas";
import { FadeIn } from "@/components/rbp/ui/motion-primitives";
export function ContactCard({locale="zh"}:{locale?:string}): ReactNode {
 const c=portfolioCopy(locale);
  return (
    <section className="mx-auto my-12 w-full max-w-275 px-6 sm:my-20 sm:px-10">
      <FadeIn>
        <div data-iavse-contact className="relative w-full overflow-hidden rounded-4xl border border-foreground/8 bg-background p-1.5 shadow-sm">
          <div className="relative w-full overflow-hidden rounded-[1.6rem]">
            <div className="relative grid gap-8 p-6 sm:gap-10 sm:p-7 md:grid-cols-[1.2fr_1fr] md:items-stretch md:gap-6 md:p-6">
              <div className="flex flex-col gap-5 max-md:items-center max-md:text-center">
                <h2 className="font-serif text-[2.25rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3.25rem]">
                  {c.connect}
                </h2>
                <p className="iavse-contact-copy max-w-[29ch] text-[18px] leading-[1.4] tracking-tight text-foreground/65 sm:text-[22px] mb-6">
                  {c.connectBody}
                </p>
                <ContactCardCtas locale={locale} />
              </div>

              <div className="iavse-contact-details border-foreground/8 flex flex-col items-center justify-center gap-6 rounded-[1.1rem] border bg-background p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <SocialIcon
                    href="/workspace/account"
                    label={c.account}
                    lucideIcon={UserRound}
                  />
                  <SocialIcon
                    href="https://github.com/IntMainJhy/IAVSE"
                    label="GitHub"
                    lucideIcon={Github}
                  />
                  <SocialIcon
                    href="/community"
                    label={c.community}
                    lucideIcon={MessageCircle}
                  />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-[13px] tracking-tight text-foreground/70">
                    IAVSE &copy; 2026
                  </p>
                  <p className="text-[12px] tracking-tight text-foreground/45">
                    <Link href="/about">{c.about}</Link> · <Link href="/legal/privacy">{c.privacy}</Link>
                  </p>
                  <SiteTools/>
                  <a className="text-[12px] text-foreground/45" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">蜀ICP备2026018870号-2</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function SocialIcon({
  href,
  label,
  lucideIcon: LucideIcon,
  imageSrc,
}: {
  href: string;
  label: string;
  lucideIcon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  imageSrc?: string;
}): ReactNode {
  const isExternal = href.startsWith("http");
  const props = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  return (
    <Link
      href={href}
      aria-label={label}
      className="border-foreground/8 hover:border-foreground/15 focus-ring inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-background text-foreground/70 transition-colors hover:text-foreground"
      {...props}
    >
      {LucideIcon ? (
        <LucideIcon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
      ) : imageSrc ? (
        <Image
          src={imageSrc}
          alt=""
          width={14}
          height={14}
          aria-hidden="true"
          className="max-h-[14px] max-w-[14px] object-contain dark:invert"
        />
      ) : null}
    </Link>
  );
}
