import {serverI18n} from '@/lib/server-i18n';
import {Hero} from './rbp/hero/hero';
import {Projects} from './rbp/projects/projects';
import {ContactCard} from './rbp/contact/contact-card';
// THESIS: Keep RBP Portfolio's composition and motion; replace only its content with IAVSE.
// OWN-WORLD: original monochrome flow, effective system fonts, morphing image, capsule nav, Motion and Lenis.
// STORY: the original four project cards lead to real resources, Skills, community and blog spaces.
// FIRST VIEWPORT: original 1100px container, equal desktop columns, two-line title, two CTAs and 420px image.
// FORM: user-pinned DavidHDev/rbp-portfolio @ 1581b9b8; Hero → Projects → ContactCard, without extra sections.
// FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
export async function PlatformHome(_:{req:Request}){
 const {locale}=await serverI18n();
 return <div className="flex flex-1 flex-col gap-20 sm:gap-28" data-rbp-home><Hero locale={locale}/><Projects locale={locale} withHeadline viewMoreVisible/><ContactCard locale={locale}/><div className="h-12 sm:h-16"/></div>;
}
