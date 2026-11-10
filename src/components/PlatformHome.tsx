import {serverI18n} from '@/lib/server-i18n';
import {Hero} from './rbp/hero/hero';
import {Projects} from './rbp/projects/projects';
import {ContactCard} from './rbp/contact/contact-card';
// THESIS: refine the existing IAVSE composition through independent color, type and spacing.
// FORM: existing Hero → Projects → Contact; no commercial template code or assets.
// FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
export async function PlatformHome(_:{req:Request}){
 const {locale}=await serverI18n();
 return <div className="flex flex-1 flex-col gap-20 sm:gap-28" data-rbp-home><Hero locale={locale}/><Projects locale={locale} withHeadline viewMoreVisible/><ContactCard locale={locale}/><div className="h-12 sm:h-16"/></div>;
}
