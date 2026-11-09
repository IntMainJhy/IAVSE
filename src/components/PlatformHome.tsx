import {serverI18n} from '@/lib/server-i18n';
import Link from 'next/link';
import {cookies} from 'next/headers';
import {HomeBitsAtmosphere} from './HomeBitsAtmosphere';
import {HomeBitsMotion} from './HomeBitsMotion';
import {HomeProductShowcase} from './HomeProductShowcase';
import {homeExperienceCopy} from '@/lib/home-experience.mjs';
import {Icon} from './Icons';
import '@/app/home-react-bits.css';
// THESIS: IAVSE is a usable creator platform presented through flowing light and real product content.
// OWN-WORLD: Cloudlight's open product hierarchy, Portfolio's calm motion, original Security-inspired ASCII; IAVSE blue and outlined V remain.
// FIRST VIEWPORT: centered product headline and two real actions, licensed React Bits Silk field and a functional resource workbench.
// STORY: discover useful resources, share actual experience, create a personal space; native document scrolling.
// FORM: user-pinned React Bits references replace the discarded cinematic scene; no paid Pro source or demo metrics are republished.
// FINISH: independent desktop/mobile review, existing feature regression checks and accurate scoped documentation.
export async function PlatformHome(_:{req:Request}){
 const {locale}=await serverI18n(),c=homeExperienceCopy(locale),jar=await cookies();
 return <div className="v2-home rb-home">
  <template dangerouslySetInnerHTML={{__html:'<!-- IAVSE React Bits homepage: licensed open React Bits Silk, original ASCII waves and real product interactions. Cloudlight, Security and Portfolio are visual references; paid Pro template code and sample claims are not bundled. Scope: homepage only. -->'}}/>
  <HomeBitsMotion/>
  <section className="rb-hero" aria-labelledby="product-title"><HomeBitsAtmosphere initialDark={jar.get('site-color-mode')?.value==='dark'} locale={locale}/><div className="rb-hero-copy"><h1 id="product-title">{c.title.map((line:string)=><span key={line}>{line}</span>)}</h1><p>{c.intro}</p><div className="rb-hero-actions"><Link className="rb-primary" href="/resources" data-rb-magnetic>{c.explore}<Icon name="arrow"/></Link><Link className="rb-secondary" href="/community" data-rb-magnetic>{c.community}<Icon name="arrow"/></Link></div><p className="rb-brand-mission" lang="en"><span>Insight through AI.</span><span>Vigilance for Opportunity.</span><span>Seize to Evolve.</span></p></div>
   <HomeProductShowcase locale={locale} reactBits/>
  </section>
 </div>;
}
