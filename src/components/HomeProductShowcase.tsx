import Link from 'next/link';
import {Icon} from './Icons';
import {HomeResourceExplorer} from './HomeResourceExplorer';
import {HomeSpacePreview} from './HomeSpacePreview';
import {HomeSpatialShowcase} from './HomeSpatialShowcase';
import {publicPosts} from '@/lib/community.mjs';
import {homeCommunityPreview,homeExperienceCopy,homeResourceSelections,homeSpatialCopy} from '@/lib/home-experience.mjs';
import '@/app/home-experience.css';

/** Three real product surfaces share a perspective stage and native document scrolling.
 * The approved blue opening, shared navigation, sources and public-feed policy remain separate.
 * Mobile, short viewports and reduced motion use the complete readable document flow.
 */
export function HomeProductShowcase({locale}:{locale:string}){
 const c=homeExperienceCopy(locale),s=homeSpatialCopy(locale),feed=homeCommunityPreview(()=>publicPosts({}));
 const chapters=[
  {id:'discover',headingId:'hx-discover-title',title:s.chapters[0],description:s.descriptions[0],action:c.explore,href:'/resources',content:<HomeResourceExplorer groups={homeResourceSelections} copy={c}/>},
  {id:'community-product',headingId:'hx-community-title',title:s.chapters[1],description:s.descriptions[1],action:c.feed,href:'/community',content:<><div className="hx-community-preview"><header><h4>{c.recent}</h4><Icon name="comment"/></header>{feed.items.length?<div className="hx-posts">{feed.items.map((item:any)=><article key={item.id}><Link href={item.href}><span className="hx-post-category">{item.category}</span><h4>{item.title}<Icon name="arrow"/></h4><p>{item.summary}</p><span className="hx-post-author">{item.author}</span></Link></article>)}</div>:<div className="hx-community-empty"><Icon name="comment"/><h4>{feed.state==='unavailable'?c.unavailable:c.emptyCommunity}</h4><p>{feed.state==='unavailable'?c.unavailableBody:c.emptyCommunityBody}</p><Link className="hx-link" href={feed.state==='unavailable'?'/community':'/workspace/submissions/new'}>{feed.state==='unavailable'?c.feed:c.write}<Icon name="arrow"/></Link></div>}</div><div className="hs-community-bottom"><ul className="hx-community-features">{c.communityLinks.map((text:string)=><li key={text}>{text}</li>)}</ul><Link className="hx-link" href="/community">{c.community}<Icon name="arrow"/></Link></div></>},
  {id:'spaces',headingId:'hx-spaces-title',title:s.chapters[2],description:s.descriptions[2],action:c.spaceAction,href:'/blogs',content:<><HomeSpacePreview copy={c}/><div className="hs-space-actions"><Link className="hx-link" href="/workspace/blog">{c.create}<Icon name="arrow"/></Link></div></>}
 ];
 return <div className="home-experience" id="home-product" data-home-experience="community-discovery">
  <div className="hx-spatial-intro hx-container"><header className="hx-introduction"><h2 id="hx-product-title">{c.title.map((line:string)=><span key={line}>{line}</span>)}</h2><div><p>{c.intro}</p><div className="hx-actions"><Link href="/resources" className="hx-primary">{c.explore}<Icon name="arrow"/></Link><Link href="/community" className="hx-link">{c.community}<Icon name="arrow"/></Link></div></div></header></div>
  <HomeSpatialShowcase chapters={chapters} label={s.label} previous={s.previous} next={s.next}/>
  <section className="hx-questions hx-container" aria-label={locale==='zh'?'使用说明':locale==='ja'?'利用の案内':'Usage notes'}>{c.questions.map(([question,answer]:string[])=><details key={question}><summary>{question}<Icon name="plus"/></summary><p>{answer}</p></details>)}</section>
  <section className="hx-close hx-container" aria-labelledby="hx-close-title"><h2 id="hx-close-title">{c.closeTitle}</h2><p>{c.closeBody}</p><div className="hx-actions"><Link className="hx-primary" href="/community">{c.community}<Icon name="arrow"/></Link><Link className="hx-link" href="/resources">{c.explore}<Icon name="arrow"/></Link></div></section>
 </div>;
}
