import Link from 'next/link';
import {publicSpaces} from '@/lib/spaces.mjs';
import {localizeProfile} from '@/lib/content-locales.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {BlogProductShowcase} from './BlogProductShowcase';
import {Icon} from './Icons';
import {BlogSpaceGallery,type GallerySpace} from './BlogSpaceGallery';
import {blogShowcases,showcaseProfile} from '@/lib/blog-showcase.mjs';

/** Discovery always lists published, discoverable spaces, independently of login. */
export async function BlogSpacesPage({req}:{req:Request}){
 const {t,locale}=await serverI18n();
 const say=(zh:string,en:string,ja:string)=>locale==='en'?en:locale==='ja'?ja:zh;
 const spaces:GallerySpace[]=publicSpaces(req).map((space:any)=>{
  const profile=localizeProfile(space.profile,locale);
  return {handle:space.handle,name:profile.name||space.handle,intro:profile.intro||'',avatarId:profile.avatarId||'',href:'/blog/'+encodeURIComponent(space.handle),mode:space.mode};
 });
 return <div className="blog-spaces-page" data-blog-spaces>
  <header className="creator-directory-intro">
   <div><h1>{t('博客空间')}</h1><p>{say('每一个主页，都是一个独立的世界。','Every homepage, a world of its own.','一つひとつのホームページに、その人の世界。')}</p></div>
   <Link className="space-btn primary" href="/workspace/blog">{t('创建我的空间')}<Icon name="plus"/></Link>
  </header>
  <BlogSpaceGallery spaces={[...spaces,...blogShowcases.map(item=>showcaseProfile(item.handle,locale)).filter(Boolean) as GallerySpace[]]} labels={{loading:say('正在准备博客空间…','Preparing blog spaces…','ブログスペースを準備中…'),open:t('进入博客空间'),preview:t('博客空间界面预览'),browse:say('向下探索功能','Scroll to explore the features','スクロールして機能を見る'),directory:t('发现博客空间'),previous:say('上一个空间','Previous space','前のスペース'),next:say('下一个空间','Next space','次のスペース'),select:say('走近这个空间','Explore this space','このスペースに近づく'),close:say('返回空间','Back to the spaces','スペースに戻る'),reset:say('重置视角','Reset view','視点をリセット'),overview:say('拖动环顾，点击走近一个空间','Drag to look around. Choose a space to step inside.','ドラッグで見渡して、スペースを選んで近づく')}}/>
  <BlogProductShowcase locale={locale} spaces={spaces} labels={{open:t('进入博客空间'),empty:t('暂时没有公开博客空间。'),emptyBody:t('作品、经历与想法，在这里相遇。')}}/>
 </div>;
}
