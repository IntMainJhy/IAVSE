import {serverI18n} from '@/lib/server-i18n';
import {V2Atmosphere} from './V2Atmosphere';
import {HomeProductShowcase} from './HomeProductShowcase';
export async function PlatformHome(_:{req:Request}){
 const {t,locale}=await serverI18n();
 return <div className="v2-home">
  <div className="v2-home-atmosphere" aria-hidden="true"><V2Atmosphere/></div>
  <section className="v2-hero-scene" aria-labelledby="product-title"><div className="v2-hero-intro"><div className="v2-hero-copy"><h1 id="product-title" lang="en"><span>Insight through AI.</span><span>Vigilance for Opportunity.</span><span>Seize to Evolve.</span></h1><p className="iavse-brand-words" lang="en">INSIGHT · ARTIFICIAL INTELLIGENCE · VIGILANCE · SEIZE · EVOLVE</p>{locale!=='en'&&<p className="iavse-brand-translation">{t('以洞察驱动智能，以敏锐发现机遇，以行动实现进化。')}</p>}</div></div></section>
  <HomeProductShowcase locale={locale}/>
 </div>;
}
