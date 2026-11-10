import Link from 'next/link';
import {publicSpaces} from '@/lib/spaces.mjs';
import {localizeProfile} from '@/lib/content-locales.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {BlogProductShowcase} from './BlogProductShowcase';
import {Icon} from './Icons';
import type {GallerySpace} from './BlogSpaceGallery';
import {FeedAvatar} from './FeedAvatar';
import {blogShowcases,showcaseProfile} from '@/lib/blog-showcase.mjs';

/** Discovery always lists published, discoverable spaces, independently of login. */
export async function BlogSpacesPage({req}:{req:Request}){
 const {t,locale}=await serverI18n();
 const say=(zh:string,en:string,ja:string)=>locale==='en'?en:locale==='ja'?ja:zh;
 const spaces:GallerySpace[]=publicSpaces(req).map((space:any)=>{
  const profile=localizeProfile(space.profile,locale);
  return {handle:space.handle,name:profile.name||space.handle,intro:profile.intro||'',avatarId:profile.avatarId||'',href:'/blog/'+encodeURIComponent(space.handle),mode:space.mode};
 });
 return <div className="blog-spaces-page" data-blog-spaces data-spaces-surface="portfolio">
  <header className="creator-directory-intro">
   <div><h1>{t('博客空间')}</h1><p>{say('每一个主页，都是一个独立的世界。','Every homepage, a world of its own.','一つひとつのホームページに、その人の世界。')}</p></div>
   <Link className="space-btn primary" href="/workspace/blog">{t('创建我的空间')}<Icon name="plus"/></Link>
  </header>
  <section className="portfolio-spaces-directory" aria-label={t("发现博客空间")}>{[...spaces,...blogShowcases.map(item=>showcaseProfile(item.handle,locale)).filter(Boolean) as GallerySpace[]].map(space=><article className="portfolio-space-card" key={space.handle}>{space.showcase?<small>{say("内置模板 · 虚构人物示例","Built-in template · fictional example","組み込みテンプレート · 架空の人物")}</small>:<small>{say("公开博客空间","Public blog space","公開ブログスペース")}</small>}{space.avatarSrc?<img src={space.avatarSrc} alt="" width={58} height={58}/>:<FeedAvatar name={space.name} avatarId={space.avatarId}/>}<h2>{space.name}</h2><p>{space.intro}</p><Link href={space.href}>{t("进入博客空间")}<Icon name="arrow"/></Link></article>)}</section>
  <BlogProductShowcase locale={locale} spaces={spaces} labels={{open:t('进入博客空间'),empty:t('暂时没有公开博客空间。'),emptyBody:t('作品、经历与想法，在这里相遇。')}}/>
 </div>;
}
