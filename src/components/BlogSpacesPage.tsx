import Link from 'next/link';
import {publicSpaces} from '@/lib/spaces.mjs';
import {localizeProfile} from '@/lib/content-locales.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {blogShowcases,showcaseProfile} from '@/lib/blog-showcase.mjs';
import {BlogSpaceGallery,type GallerySpace} from './BlogSpaceGallery';
import {BlogProductShowcase} from './BlogProductShowcase';
import {Icon} from './Icons';

/** Discovery always lists published, discoverable spaces, independently of login. */
export async function BlogSpacesPage({req}:{req:Request}){
 const {t,locale}=await serverI18n();
 const say=(zh:string,en:string,ja:string)=>locale==='en'?en:locale==='ja'?ja:zh;
 const publicLabel=say('公开博客空间','Public blog space','公開ブログ');
 const exampleLabel=say('原创主页示例 · 虚构人物','Original homepage example · fictional person','オリジナルホームページの例 · 架空の人物');
 const spaces:GallerySpace[]=publicSpaces(req).map((space:any)=>{
  const profile=localizeProfile(space.profile,locale);
  return {handle:space.handle,name:profile.name||space.handle,intro:profile.intro||'',avatarId:profile.avatarId||'',href:'/blog/'+encodeURIComponent(space.handle),mode:space.mode};
 });
 // Standalone examples keep their own appearance; template-library URLs remain available elsewhere.
 const examples:GallerySpace[]=blogShowcases.flatMap(item=>{
  const profile=showcaseProfile(item.handle,locale);
  return profile?[{...profile,href:'/blogs/showcase/'+encodeURIComponent(item.handle),role:exampleLabel+' · '+profile.role}]:[];
 });
 const allSpaces=[...spaces,...examples];
 return <div className="blog-spaces-page" data-blog-spaces data-spaces-surface="spatial">
  <header className="creator-directory-intro">
   <h1>{t('博客空间')}</h1>
   <p>{say('每一个主页，都是一个独立的世界。','Every homepage, a world of its own.','一つひとつのホームページに、その人の世界。')}</p>
   <Link className="blog-spaces-create" href="/workspace/blog">{t('创建我的空间')}<Icon name="plus"/></Link>
  </header>
  <p className="blog-spaces-gallery-note">{say('公开空间与原创主页示例在这里相遇。示例中的人物和作品均为虚构。','Explore public spaces alongside original homepage examples. People and work in the examples are fictional.','公開スペースとオリジナルホームページの例を探索できます。サンプルの人物と作品は架空です。')}</p>
  <BlogSpaceGallery spaces={allSpaces} labels={{loading:say('正在准备博客空间…','Preparing blog spaces…','ブログスペースを準備中…'),open:t('进入博客空间'),preview:t('博客空间界面预览'),browse:say('向下探索功能','Scroll to explore the features','スクロールして機能を見る'),directory:t('发现博客空间'),previous:say('上一个空间','Previous space','前のスペース'),next:say('下一个空间','Next space','次のスペース'),select:say('走近这个空间','Explore this space','このスペースに近づく'),close:say('返回空间','Back to the spaces','スペースに戻る'),reset:say('重置视角','Reset view','視点をリセット'),overview:say('拖动环顾，点击走近一个空间','Drag to look around. Choose a space to step inside.','ドラッグで見渡して、スペースを選んで近づく')}}/>
  <details className="blog-spaces-list" data-blog-spaces-list>
   <summary>{say('以列表查看全部空间','View all spaces as a list','すべてのスペースをリストで見る')}<span>{new Intl.NumberFormat(locale).format(allSpaces.length)}</span></summary>
   <ul>{allSpaces.map(space=><li key={(space.showcase?'example:':'member:')+space.handle}><Link href={space.href}><span className="blog-spaces-list-name">{space.name}<small>{space.showcase?exampleLabel:publicLabel+' · @'+space.handle}</small></span><Icon name="arrow"/></Link></li>)}</ul>
  </details>
  <BlogProductShowcase locale={locale} spaces={spaces} labels={{open:t('进入博客空间'),empty:t('暂时没有公开博客空间。'),emptyBody:t('作品、经历与想法，在这里相遇。')}}/>
 </div>;
}
