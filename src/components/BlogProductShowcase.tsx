import Link from 'next/link';
import {HomeBlogCanvasDemo} from './HomeBlogCanvasDemo';
import {BlogProductLooks} from './BlogProductLooks';
import {ShowcasePreview} from './ShowcasePreview';
import {FeedAvatar} from './FeedAvatar';
import {Icon} from './Icons';
import type {GallerySpace} from './BlogSpaceGallery';
import {blogProductCopy} from '@/lib/blog-product-copy.mjs';
import {productShowcaseCopy} from '@/lib/product-showcase.mjs';
import '@/app/product-showroom.css';

type Props={locale:string;spaces:GallerySpace[];labels:{open:string;empty:string;emptyBody:string}};
const looks=[{file:'portfolio',handle:'maya-lab',name:'Maya Zhou'},{file:'resume',handle:'anika-observes',name:'Anika Rao'},{file:'editorial',handle:'kei-sound',name:'Kei Tanaka'}];

/** Product evidence follows the discoverable 3D gallery; no stacked promotional film. */
export function BlogProductShowcase({locale,spaces,labels}:Props){
 const c=blogProductCopy(locale),shared=productShowcaseCopy(locale);
 return <div className="product-showroom product-showroom-blog" data-product-showroom="blogs">
  <div className="ps-container">
   <section className="ps-section ps-blog-intro" id="blog-spaces-directory" aria-labelledby="blog-product-title">
    <header className="ps-heading ps-heading-split"><h2 id="blog-product-title">{c.title}</h2><div><p>{c.intro}</p><div className="ps-actions"><Link className="ps-cta" href="/workspace/blog">{c.create}<Icon name="arrow"/></Link><a className="ps-text-link" href="#film-canvas-title">{c.tryCanvas}<Icon name="chevron-down"/></a></div></div></header>
    <p className="ps-note ps-look-note">{shared.blogDemo}</p><BlogProductLooks looks={looks} labels={c.lookLabels} details={c.looksDetail} open={c.publishAction}/>
   </section>
  </div>
  <section className="ps-editor-band" aria-labelledby="film-canvas-title"><div className="ps-container ps-editor-layout">
   <div className="ps-editor-copy"><h2 id="film-canvas-title">{c.canvasTitle}</h2><p className="ps-lead">{c.canvasBody}</p><ul className="ps-feature-lines">{c.canvasFeatures.map((feature:string)=><li key={feature}><Icon name="check"/>{feature}</li>)}</ul><p className="ps-note">{shared.noAccountChanges}</p></div>
   <div className="ps-editor-proof"><div className="ps-editor-frame"><HomeBlogCanvasDemo key={locale} locale={locale} pageScroll/></div><p className="ps-note">{c.canvasHint}</p></div>
  </div></section>
  <section className="ps-section ps-container ps-publish-section" aria-labelledby="film-publish-title"><header className="ps-heading ps-heading-split"><h2 id="film-publish-title">{c.publishTitle}</h2><div><p>{c.publishBody}</p><ol className="ps-publish-steps">{shared.workflow.map((step:string,index:number)=><li key={step}>{index>0&&<Icon name="arrow"/>}{step}</li>)}</ol></div></header>
   <ShowcasePreview desktop={{src:'/media/blog-product/portfolio.webp',width:900,height:1015}} mobile={{src:'/media/blog-product/portfolio-mobile.webp',width:390,height:844}} title="Maya Zhou" href="/blogs/showcase/maya-lab" caption={'Maya Zhou · '+shared.exampleImage} labels={{...shared,open:c.publishAction}}/>
  </section>
  <section className="ps-directory ps-container" data-blog-directory aria-labelledby="ps-directory-title"><header><h2 id="ps-directory-title">{shared.directory}</h2><span>{c.directoryCount.replace('{0}',new Intl.NumberFormat(locale).format(spaces.length))}</span></header>
   {spaces.length?<div className="ps-creator-list">{spaces.map(space=><article className="creator-entry ps-creator-entry" key={space.handle}><FeedAvatar name={space.name} avatarId={space.avatarId}/><div><h3>{space.name}</h3><span>@{space.handle}</span>{space.intro&&<p>{space.intro}</p>}</div><Link className="creator-enter ps-text-link" href={space.href}>{labels.open}<Icon name="arrow"/></Link></article>)}</div>:<div className="ps-directory-empty"><p>{labels.empty}</p><p>{labels.emptyBody}</p><Link className="ps-text-link" href="/workspace/blog">{c.create}<Icon name="arrow"/></Link></div>}
  </section>
  <section className="ps-close ps-container" aria-labelledby="film-invitation-title"><h2 id="film-invitation-title">{c.finalTitle}</h2><p>{c.finalBody}</p><div className="ps-actions"><Link className="ps-cta" href="/workspace/blog">{c.create}<Icon name="arrow"/></Link><Link className="ps-text-link" href="/docs/showcase">{shared.guide}<Icon name="arrow"/></Link></div></section>
 </div>;
}
