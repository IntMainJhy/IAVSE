import Link from 'next/link';
import {BlogProductMotion} from './BlogProductMotion';
import {HomeBlogCanvasDemo} from './HomeBlogCanvasDemo';
import {BlogProductLooks} from './BlogProductLooks';
import {FeedAvatar} from './FeedAvatar';
import {Icon} from './Icons';
import type {GallerySpace} from './BlogSpaceGallery';
import {blogProductCopy} from '@/lib/blog-product-copy.mjs';
import '@/app/blog-product-film.css';

type Props={locale:string;spaces:GallerySpace[];labels:{open:string;empty:string;emptyBody:string}};
const looks=[{file:'portfolio',handle:'maya-lab',name:'Maya Zhou'},{file:'resume',handle:'anika-observes',name:'Anika Rao'},{file:'editorial',handle:'kei-sound',name:'Kei Tanaka'}];

/** Product proof below the original gallery; all author links remain server rendered. */
export function BlogProductShowcase({locale,spaces,labels}:Props){
 const c=blogProductCopy(locale);
 return <BlogProductMotion>
  <section className="film-opening" id="blog-spaces-directory" aria-labelledby="blog-product-title">
   <div className="film-heading"><h2 id="blog-product-title">{c.title}</h2></div>
   <div className="film-opening-copy"><p>{c.intro}</p><div className="film-opening-actions"><Link className="film-create-link" href="/workspace/blog">{c.create}<Icon name="arrow"/></Link><a className="film-text-link" href="#film-canvas-title">{c.tryCanvas}<Icon name="chevron-down"/></a></div></div>
  </section>
  <section className="film-canvas-scene" data-film-scene aria-labelledby="film-canvas-title">
   <header className="film-scene-heading"><h2 id="film-canvas-title">{c.canvasTitle}</h2><p>{c.canvasBody}</p></header>
   <div className="film-canvas-stage"><div className="film-canvas-window" data-film-interactive><HomeBlogCanvasDemo key={locale} locale={locale}/></div></div>
   <ul className="film-canvas-features">{c.canvasFeatures.map((feature:string,index:number)=><li key={feature}><Icon name={['cursor','text','eye'][index]}/>{feature}</li>)}</ul>
   <p className="film-demo-note"><Icon name="cursor"/>{c.canvasHint}</p>
  </section>
  <section className="film-looks-scene" data-film-scene aria-labelledby="film-looks-title">
   <header className="film-scene-heading"><h2 id="film-looks-title">{c.looksTitle}</h2><p>{c.looksBody}</p></header>
   <BlogProductLooks looks={looks} labels={c.lookLabels} details={c.looksDetail} open={c.publishAction}/>
  </section>
  <section className="film-publish-scene" data-film-scene aria-labelledby="film-publish-title">
   <div className="film-publish-copy"><h2 id="film-publish-title">{c.publishTitle}</h2><p>{c.publishBody}</p><Link className="film-text-link" href="/blogs/showcase/maya-lab">{c.publishAction}<Icon name="arrow"/></Link></div>
   <div className="film-publish-camera" data-film-camera="publish"><div className="film-publish-window"><div className="film-browser-bar"><span aria-hidden="true"><i/><i/><i/></span><span>/blogs/showcase/maya-lab</span><Icon name="lock"/></div><img src="/media/blog-product/portfolio.webp" alt={c.lookLabels[0]+' · Maya Zhou'} width={900} height={1015} loading="lazy" decoding="async"/></div><div className="film-mobile-window"><img src="/media/blog-product/portfolio-mobile.webp" alt={c.lookLabels[0]+' · Maya Zhou · 390px'} width={390} height={844} loading="lazy" decoding="async"/></div></div>
  </section>
  <section className="film-invitation" aria-labelledby="film-invitation-title"><h2 id="film-invitation-title">{c.finalTitle}</h2><p>{c.finalBody}</p><Link className="film-create-link" href="/workspace/blog">{c.create}<Icon name="arrow"/></Link></section>
  <details className="film-directory" data-blog-directory><summary><span>{c.directoryTitle}</span><span>{c.directoryCount.replace('{0}',new Intl.NumberFormat(locale).format(spaces.length))}</span><Icon name="chevron-down"/></summary>
   {spaces.length?<div className="film-creator-grid">{spaces.map(space=><article className="creator-entry film-creator-entry" key={space.handle}><div className="film-creator-identity"><FeedAvatar name={space.name} avatarId={space.avatarId}/><div><h3>{space.name}</h3><span>@{space.handle}</span></div></div>{space.intro&&<p>{space.intro}</p>}<Link className="creator-enter" href={space.href}>{labels.open}<Icon name="arrow"/></Link></article>)}</div>:<div className="film-directory-empty"><p>{labels.empty}</p><p>{labels.emptyBody}</p><Link className="film-text-link" href="/workspace/blog">{c.create}<Icon name="arrow"/></Link></div>}
  </details>
 </BlogProductMotion>;
}
