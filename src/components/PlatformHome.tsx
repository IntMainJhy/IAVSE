import {serverI18n} from '@/lib/server-i18n';
import {PortfolioHero} from './portfolio/PortfolioHero';
import {HomeProductShowcase} from './HomeProductShowcase';
import {homeExperienceCopy} from '@/lib/home-experience.mjs';
// THESIS: IAVSE uses the public Portfolio template as its shared frontend foundation.
// OWN-WORLD: upstream flow shader, morphing preview, Geist, spring pill navigation and Motion + Lenis.
// FIRST VIEWPORT: split product introduction and a real built-in template preview.
// STORY: discover resources, exchange experience, create a personal space; existing publishing and account flows remain.
// FORM: adapt selected public template components with attribution; no paid component source.
// FINISH: validate public routes, workspace, admin, responsive layouts, source attribution and documentation.
export async function PlatformHome(_:{req:Request}){
 const {locale}=await serverI18n(),c=homeExperienceCopy(locale);
 return <div className="v2-home rb-home portfolio-home"><PortfolioHero copy={c} locale={locale}/><HomeProductShowcase locale={locale} reactBits/></div>;
}
