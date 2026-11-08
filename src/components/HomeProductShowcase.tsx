import Link from 'next/link';
import {Icon} from './Icons';
import {HomeBlogCanvasDemo,type HomeBlogDemoExample} from './HomeBlogCanvasDemo';
import {ShowcasePreview} from './ShowcasePreview';
import {ShowcaseDiscovery} from './ShowcaseDiscovery';
import {CreatorVoices} from './CreatorVoices';
import {homeProductCopy} from '@/lib/home-product-copy.mjs';
import {productShowcaseCopy,showcaseSkills,showcaseResources} from '@/lib/product-showcase.mjs';
import '@/app/product-showroom.css';

/** The existing blue glass hero is outside this boundary and remains untouched. */
export function HomeProductShowcase({locale,creator}:{locale:string;creator:HomeBlogDemoExample|null}){
 const c=productShowcaseCopy(locale),home=homeProductCopy(locale);
 return <div className="product-showroom product-showroom-home" data-product-showroom="home">
  <div className="ps-container">
   <nav className="ps-section-nav" aria-label={c.homeIntro}>{c.homeNav.map((label:string,index:number)=><a key={label} href={'#'+['creators','canvas-demo','creative-resources'][index]}>{label}<Icon name="chevron-down"/></a>)}</nav>
   <section className="ps-section ps-homepage-section" id="creators" data-home-story="blog" aria-labelledby="v2-creators-title">
    <header className="ps-heading ps-heading-split"><h2 id="v2-creators-title">{home.blogTitle}</h2><div><p>{home.blogText}</p><ul className="ps-feature-lines">{c.homeFeatures.map((text:string)=><li key={text}><Icon name="check"/>{text}</li>)}</ul><Link className="ps-text-link" href="/blogs">{c.homeNav[0]}<Icon name="arrow"/></Link></div></header>
    <ShowcasePreview desktop={{src:'/media/home/creator-home.webp',width:1280,height:1000}} mobile={{src:'/media/home/creator-home-mobile.webp',width:390,height:844}} title={home.blogAlt} href="/blog/jianghaoyu2006" caption={home.blogExample+' · '+c.sourceImage} labels={c}/>
   </section>
  </div>
  <section className="ps-editor-band" id="canvas-demo" data-home-story="editor" aria-labelledby="v2-editor-title"><div className="ps-container ps-editor-layout">
   <div className="ps-editor-copy"><h2 id="v2-editor-title">{home.editorTitle}</h2><p className="ps-lead">{c.editorLead}</p><p>{home.editorText}</p><ul className="ps-feature-lines">{home.editorFeatures.map((text:string)=><li key={text}><Icon name="check"/>{text}</li>)}</ul><Link className="ps-cta" href="/workspace/blog">{home.editorAction}<Icon name="arrow"/></Link></div>
   <div className="ps-editor-proof"><div className="ps-editor-frame"><HomeBlogCanvasDemo locale={locale} creator={creator} pageScroll/></div><p className="ps-note">{c.editorNote}</p></div>
  </div></section>
  <section className="ps-section ps-container" id="creative-resources" aria-labelledby="ps-discovery-title"><header className="ps-heading ps-heading-split"><h2 id="ps-discovery-title">{c.homeIntro}</h2><p>{c.homeIntroBody}</p></header>
   <div className="ps-discovery-grid">
    <article className="ps-discovery-feature ps-skill-feature" id="skills-demo" data-home-story="skills"><header><h3>{home.skillTitle}</h3><p>{c.skillIntro}</p></header><ShowcaseDiscovery categories={showcaseSkills} variant="skills" label={c.skillLabel} more={c.moreSkills} href="/resources?type=skills"/></article>
    <article className="ps-discovery-feature ps-resource-feature" id="resources-demo" data-home-story="resources"><header><h3>{home.resourceTitle}</h3><p>{c.resourceIntro}</p></header><ShowcaseDiscovery categories={showcaseResources} variant="resources" label={c.resourceLabel} more={c.moreResources} href="/resources"/></article>
   </div>
  </section>
  <CreatorVoices/>
  <section className="ps-close ps-container" data-home-scene="invitation" aria-labelledby="v2-invitation-title"><h2 id="v2-invitation-title">{c.closeTitle}</h2><p>{c.closeBody}</p><div className="ps-actions"><Link className="ps-cta" href="/workspace/blog">{c.create}<Icon name="arrow"/></Link><Link className="ps-text-link" href="/docs/showcase">{c.guide}<Icon name="arrow"/></Link><Link className="ps-text-link" href="/community">{home.community}<Icon name="arrow"/></Link></div></section>
 </div>;
}
