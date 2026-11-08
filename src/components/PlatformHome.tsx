import Link from 'next/link';
import {serverI18n} from '@/lib/server-i18n';
import {defaultBlogSpace} from '@/lib/spaces.mjs';
import {localizeContent,localizeProfile} from '@/lib/content-locales.mjs';
import {Icon} from './Icons';
import {V2Atmosphere} from './V2Atmosphere';
import {CreatorStage,type CreatorStageData,type CreatorProject} from './CreatorStage';
import {HomeMotion} from './HomeMotion';
import {HomeCinema} from './HomeCinema';
import type {HomeBlogDemoExample} from './HomeBlogCanvasDemo';
import {HomeProductShowcase} from './HomeProductShowcase';
import '@/app/home-showcase.css';
export async function PlatformHome({req}:{req:Request}){
 const {t,locale}=await serverI18n();
 let featured:any=null;try{featured=defaultBlogSpace(req)}catch{}
 let creator:CreatorStageData|null=null;
 let demoCreator:HomeBlogDemoExample|null=null;
 if(featured){
  const profile=localizeProfile(featured.profile,locale),url='/blog/'+encodeURIComponent(featured.handle),design=featured.layout.blog?.design;
  const visibleParts=new Set((design?.nodes||[]).filter((node:any)=>!node.hidden).map((node:any)=>node.part));
  const section=profile.resume?.sections?.find((section:any)=>/project|作品|项目/i.test(section.id+' '+section.title)&&(!design||visibleParts.has('section:'+section.id)));
  const localized=(item:any,field:string)=>item.translations?.[locale]?.[field]?.trim()||item[field]||'';
  const resumeProjects:CreatorProject[]=(section?.items||[]).filter((item:any)=>item.title).map((item:any)=>({title:localized(item,'title'),description:localized(item,'description'),imageId:item.coverId||'',href:url+'#anx-'+section.id}));
  const documents=featured.content.filter((item:any)=>item.type==='projects').map((raw:any)=>{const item=localizeContent(raw,locale);return{title:item.title,description:item.summary,imageId:item.coverId||'',href:'/u/'+encodeURIComponent(featured.handle)+'/projects/'+encodeURIComponent(item.slug)}});
  creator={name:profile.name,handle:featured.handle,intro:profile.intro||'',avatarId:profile.avatarId||'',skills:profile.skills||[],url,projects:resumeProjects.length?resumeProjects:documents};
  demoCreator={...creator,name:featured.layout.blog?.title||creator.name,description:featured.layout.blog?.description||profile.alias||'@'+featured.handle,skills:creator.skills.slice(0,6),projects:creator.projects.slice(0,2)};
 }
 return <div className="v2-home">
  <HomeMotion layoutKey={locale}/>
  <div className="v2-home-atmosphere" aria-hidden="true"><V2Atmosphere/></div>
  <section className="v2-hero-scene" aria-labelledby="product-title"><div className="v2-hero-intro"><div className="v2-hero-copy"><h1 id="product-title" lang="en"><span>Insight through AI.</span><span>Vigilance for Opportunity.</span><span>Seize to Evolve.</span></h1><p className="iavse-brand-words" lang="en">INSIGHT · ARTIFICIAL INTELLIGENCE · VIGILANCE · SEIZE · EVOLVE</p>{locale!=='en'&&<p className="iavse-brand-translation">{t('以洞察驱动智能，以敏锐发现机遇，以行动实现进化。')}</p>}</div><HomeCinema locale={locale}/></div>
   <div className="v2-hero-showcase" data-glass-reveal="stage">{creator?<CreatorStage creator={creator}/>:<div className="v2-hero-empty"><h2>{t('完整介绍你自己')}</h2><p>{t('个人介绍、经历、技能与作品。')}</p><Link href="/workspace/blog">{t('创建我的空间')}<Icon name="arrow"/></Link></div>}</div>
  </section>
  <HomeProductShowcase locale={locale} creator={demoCreator}/>
 </div>;
}
