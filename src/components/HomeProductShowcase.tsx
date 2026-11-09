import Link from 'next/link';
import {Icon} from './Icons';
import {HomeResourceExplorer} from './HomeResourceExplorer';
import {HomeSpacePreview} from './HomeSpacePreview';
import {publicPosts} from '@/lib/community.mjs';
import {homeCommunityPreview,homeExperienceCopy,homeResourceSelections} from '@/lib/home-experience.mjs';
import '@/app/home-experience.css';

/**
 * THESIS: Discover resources, exchange experience, then publish personal work.
 * OWN-WORLD: User-pinned light Apple surfaces, system type, black actions.
 * STORY: Real catalog excerpts, qualified public sharing, built-in templates.
 * FIRST VIEWPORT: Large two-line statement and an operable resource shelf.
 * FORM: Pinned Apple direction; three distinct source-led compositions.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
 */
export function HomeProductShowcase({locale}:{locale:string}){
 const c=homeExperienceCopy(locale),feed=homeCommunityPreview(()=>publicPosts({}));
 return <div className="home-experience" id="home-product" data-home-experience="community-discovery">
  <section className="hx-discover hx-container" id="discover" aria-labelledby="hx-discover-title">
   <header className="hx-introduction"><h2 id="hx-discover-title">{c.title.map((line:string)=><span key={line}>{line}</span>)}</h2><div><p>{c.intro}</p><div className="hx-actions"><Link href="/resources" className="hx-primary">{c.explore}<Icon name="arrow"/></Link><Link href="/community" className="hx-link">{c.community}<Icon name="arrow"/></Link></div></div></header>
   <HomeResourceExplorer groups={homeResourceSelections} copy={c}/>
  </section>
  <section className="hx-community-band" aria-labelledby="hx-community-title"><div className="hx-container hx-community-layout">
   <div className="hx-community-copy"><h2 id="hx-community-title">{c.communityTitle.map((line:string)=><span key={line}>{line}</span>)}</h2><p>{c.communityBody}</p><Link className="hx-primary" href="/community">{c.feed}<Icon name="arrow"/></Link><ul className="hx-community-features">{c.communityLinks.map((text:string)=><li key={text}>{text}</li>)}</ul></div>
   <div className="hx-community-preview"><header><h3>{c.recent}</h3><Icon name="comment"/></header>{feed.items.length?<div className="hx-posts">{feed.items.map((item:any)=><article key={item.id}><Link href={item.href}><span className="hx-post-category">{item.category}</span><h4>{item.title}<Icon name="arrow"/></h4><p>{item.summary}</p><span className="hx-post-author">{item.author}</span></Link></article>)}</div>:<div className="hx-community-empty"><Icon name="comment"/><h4>{feed.state==='unavailable'?c.unavailable:c.emptyCommunity}</h4><p>{feed.state==='unavailable'?c.unavailableBody:c.emptyCommunityBody}</p><Link className="hx-link" href={feed.state==='unavailable'?'/community':'/workspace/submissions/new'}>{feed.state==='unavailable'?c.feed:c.write}<Icon name="arrow"/></Link></div>}</div>
  </div></section>
  <section className="hx-spaces hx-container" id="spaces" aria-labelledby="hx-spaces-title"><div className="hx-space-copy"><h2 id="hx-spaces-title">{c.spaceTitle.map((line:string)=><span key={line}>{line}</span>)}</h2><p>{c.spaceBody}</p><ul>{c.spaceFeatures.map((text:string)=><li key={text}>{text}</li>)}</ul><div className="hx-actions"><Link className="hx-primary" href="/blogs">{c.spaceAction}<Icon name="arrow"/></Link><Link className="hx-link" href="/workspace/blog">{c.create}<Icon name="arrow"/></Link></div></div><HomeSpacePreview copy={c}/></section>
  <section className="hx-questions hx-container" aria-label={locale==='zh'?'使用说明':locale==='ja'?'利用の案内':'Usage notes'}>{c.questions.map(([question,answer]:string[])=><details key={question}><summary>{question}<Icon name="plus"/></summary><p>{answer}</p></details>)}</section>
  <section className="hx-close hx-container" aria-labelledby="hx-close-title"><h2 id="hx-close-title">{c.closeTitle}</h2><p>{c.closeBody}</p><div className="hx-actions"><Link className="hx-primary" href="/community">{c.community}<Icon name="arrow"/></Link><Link className="hx-link" href="/resources">{c.explore}<Icon name="arrow"/></Link></div></section>
 </div>;
}
