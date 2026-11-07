import Link from 'next/link';
import {serverI18n} from '@/lib/server-i18n';
import {defaultBlogSpace} from '@/lib/spaces.mjs';
import {localizeContent,localizeProfile} from '@/lib/content-locales.mjs';
import {Icon} from './Icons';
import {V2Atmosphere} from './V2Atmosphere';
import {CreatorStage,type CreatorStageData,type CreatorProject} from './CreatorStage';
import {HomeMotion} from './HomeMotion';
import {HomeCinema} from './HomeCinema';
import {HomeBlogCanvasDemo,type HomeBlogDemoExample} from './HomeBlogCanvasDemo';
import {HomeResourceSculpture} from './HomeResourceSculpture';
import {HomeStoryVideo} from './HomeStoryVideo';
import {CreatorVoices} from './CreatorVoices';
import {homeProductCopy} from '@/lib/home-product-copy.mjs';
import '@/app/home-showcase.css';
import '@/app/home-product-showcase.css';
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
 const copy=homeProductCopy(locale);
 return <div className="v2-home">
  <HomeMotion layoutKey={locale}/>
  <div className="v2-home-atmosphere" aria-hidden="true"><V2Atmosphere/></div>
  <section className="v2-hero-scene" aria-labelledby="product-title"><div className="v2-hero-intro"><div className="v2-hero-copy"><h1 id="product-title" lang="en"><span>Insight through AI.</span><span>Vigilance for Opportunity.</span><span>Seize to Evolve.</span></h1><p className="iavse-brand-words" lang="en">INSIGHT · ARTIFICIAL INTELLIGENCE · VIGILANCE · SEIZE · EVOLVE</p>{locale!=='en'&&<p className="iavse-brand-translation">{t('以洞察驱动智能，以敏锐发现机遇，以行动实现进化。')}</p>}</div><HomeCinema locale={locale}/></div>
   <div className="v2-hero-showcase" data-glass-reveal="stage">{creator?<CreatorStage creator={creator}/>:<div className="v2-hero-empty"><h2>{t('完整介绍你自己')}</h2><p>{t('个人介绍、经历、技能与作品。')}</p><Link href="/workspace/blog">{t('创建我的空间')}<Icon name="arrow"/></Link></div>}</div>
  </section>
  <div className="home-stories home-product" data-home-product>
   <section className="home-story home-story-primary" data-home-story="blog" data-home-side="left" id="creators" aria-labelledby="v2-creators-title">
    <div className="home-story-copy"><h2 id="v2-creators-title">{copy.blogTitle}</h2><div className="home-story-body"><p>{copy.blogText}</p><Link className="home-story-link" href="/blogs">{t('发现更多主页')}<Icon name="arrow"/></Link></div></div>
    <Link className="home-story-visual home-story-screenshot home-identity-stage" href="/blog/jianghaoyu2006" aria-label={copy.blogExample}><div className="home-identity-desktop"><img src="/media/home/creator-home.webp" alt={copy.blogAlt} width={1280} height={1000} loading="lazy" decoding="async"/></div><div className="home-identity-phone"><img src="/media/home/creator-home-mobile.webp" alt="" width={390} height={844} loading="lazy" decoding="async"/></div></Link>
    <p className="home-story-caption">{copy.blogExample}</p>
   </section>
   <section className="home-story home-story-primary is-reverse" id="canvas-demo" data-home-story="editor" data-home-side="right" aria-labelledby="v2-editor-title">
    <div className="home-story-copy"><h2 id="v2-editor-title">{copy.editorTitle}</h2><div className="home-story-body"><p>{copy.editorText}</p><Link className="home-story-link" href="/workspace/blog">{copy.editorAction}<Icon name="arrow"/></Link></div></div>
    <div className="home-story-visual home-story-editor"><div className="home-editor-window"><HomeBlogCanvasDemo locale={locale} creator={demoCreator} pageScroll/></div></div>
    <ul className="home-editor-features">{copy.editorFeatures.map((feature:string,index:number)=><li key={feature}><Icon name={['cursor','text','eye'][index]}/>{feature}</li>)}</ul><p className="home-story-caption">{copy.editorHint}</p>
   </section>
   <section className="home-story home-story-discovery" id="skills-demo" data-home-story="skills" data-home-side="left" aria-labelledby="v2-skills-title">
    <div className="home-story-copy"><h2 id="v2-skills-title">{copy.skillTitle}</h2><div className="home-story-body"><p>{copy.skillText}</p><Link className="home-story-link" href="/resources?type=skills">{copy.skillAction}<Icon name="arrow"/></Link><Link className="home-story-secondary" href="/skills/gsap">GSAP Skills<Icon name="arrow"/></Link></div></div>
    <div className="home-story-visual home-skill-stage"><HomeStoryVideo src="/media/home/skills-loop.mp4" poster="/media/home/skills-poster.webp" label={copy.skillAlt} pauseLabel={copy.pause} playLabel={copy.play}/></div>
   </section>
   <section className="home-story home-story-discovery is-reverse" id="resources-demo" data-home-story="resources" data-home-side="right" aria-labelledby="v2-tools-title">
    <div className="home-story-copy"><h2 id="v2-tools-title">{copy.resourceTitle}</h2><div className="home-story-body"><p>{copy.resourceText}</p><Link className="home-story-link" href="/resources">{copy.resourceAction}<Icon name="arrow"/></Link><Link className="home-story-secondary" href="/community">{copy.community}<Icon name="arrow"/></Link></div></div>
    <div className="home-story-visual home-resource-stage"><HomeResourceSculpture posterSrc="/media/home/resources.webp" label={copy.resourceAlt} pauseLabel={copy.pause} playLabel={copy.play}/></div>
   </section>
  </div>
  <section className="v2-section v2-invitation" data-home-scene="invitation" data-home-product aria-labelledby="v2-invitation-title"><h2 id="v2-invitation-title">{t('下一份值得被看见的，')}<span>{t('是你的创造。')}</span></h2><div><Link className="v2-primary" href="/workspace/blog">{t('创建我的空间')}<Icon name="arrow"/></Link></div></section>
  <CreatorVoices/>
 </div>;
}
