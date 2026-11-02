import Link from 'next/link';
import {publicSpaces} from '@/lib/spaces.mjs';
import {localizeProfile} from '@/lib/content-locales.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {FeedAvatar} from './FeedAvatar';
import {Icon} from './Icons';
import {BlogSpaceGallery,type GallerySpace} from './BlogSpaceGallery';
import {blogShowcases,showcaseProfile} from '@/lib/blog-showcase.mjs';

/** Discovery always lists published, discoverable spaces, independently of login. */
export async function BlogSpacesPage({req}:{req:Request}){
 const {t,locale}=await serverI18n();
 const say=(zh:string,en:string,ja:string)=>locale==='en'?en:locale==='ja'?ja:zh;
 const spaces:GallerySpace[]=publicSpaces(req).map((space:any)=>{
  const profile=localizeProfile(space.profile,locale);
  return {handle:space.handle,name:profile.name||space.handle,intro:profile.intro||'',avatarId:profile.avatarId||'',href:'/blog/'+encodeURIComponent(space.handle)};
 });
 return <div className="blog-spaces-page" data-blog-spaces>
  <header className="creator-directory-intro">
   <div><h1>{t('博客空间')}</h1><p>{say('每一个主页，都是一个独立的世界。','Every homepage, a world of its own.','一つひとつのホームページに、その人の世界。')}</p></div>
   <Link className="space-btn primary" href="/workspace/blog">{t('创建我的空间')}<Icon name="plus"/></Link>
  </header>
  <BlogSpaceGallery spaces={[...spaces,...blogShowcases.map(item=>showcaseProfile(item.handle,locale)).filter(Boolean) as GallerySpace[]]} labels={{open:t('进入博客空间'),preview:t('博客空间界面预览'),browse:say('向下探索创作者','Scroll to meet the creators','スクロールしてクリエイターを知る'),directory:t('发现博客空间'),previous:say('上一个空间','Previous space','前のスペース'),next:say('下一个空间','Next space','次のスペース'),select:say('走近这个空间','Explore this space','このスペースに近づく'),close:say('返回空间','Back to the spaces','スペースに戻る'),reset:say('重置视角','Reset view','視点をリセット'),overview:say('拖动环顾，点击走近一个空间','Drag to look around. Choose a space to step inside.','ドラッグで見渡して、スペースを選んで近づく')}}/>
  <section className="creator-directory" id="blog-spaces-directory" data-blog-directory aria-label={t('走进一个新的空间。')}>
   {spaces.length>0?<>
    <header className="creator-directory-heading"><h2>{say('从主页，认识一个人。','Meet the person behind the page.','ホームページから、その人を知る。')}</h2><span>{say(`${spaces.length} 个公开空间`,`${spaces.length} public ${spaces.length===1?'space':'spaces'}`,`${spaces.length} 件の公開スペース`)}</span></header>
    <div className="creator-grid">{spaces.map(space=><article className="creator-entry" key={space.handle}>
     <div className="creator-entry-copy"><div className="creator-identity"><FeedAvatar name={space.name} avatarId={space.avatarId}/><div><h3>{space.name}</h3><span>@{space.handle}</span></div></div>{space.intro&&<p className="creator-description">{space.intro}</p>}<Link className="creator-enter" href={space.href}>{t('进入博客空间')}<Icon name="arrow"/></Link></div>
    </article>)}</div>
   </>:<div className="creator-directory-empty"><h2>{t('暂时没有公开博客空间。')}</h2><p>{t('作品、经历与想法，在这里相遇。')}</p><Link className="space-btn primary" href="/workspace/blog">{t('创建我的空间')}</Link></div>}
  </section>
  <section className="creator-space-about" aria-labelledby="creator-space-about-title">
   <div><span className="creator-space-about-label">IAVSE Spaces</span><h2 id="creator-space-about-title">{say('你的内容。\n你的表达方式。','Your content.\nYour way of showing it.','あなたのコンテンツ。\nあなたらしい表現。')}</h2><Link className="creator-enter" href="/workspace/blog">{t('设置我的空间')}<Icon name="arrow"/></Link></div>
   <div className="creator-space-principles">
    <article><h3>{say('让作品与经历相连','Work, with the story behind it','作品と、その背景を一緒に')}</h3><p>{say('把个人介绍、技术文章、项目与资源整理在同一个主页，让别人看到你做过什么，也了解你如何思考。','Bring your introduction, writing, projects and resources into one homepage. Show what you make and how you think.','自己紹介、記事、プロジェクト、リソースを一つのホームページにまとめ、作ったものと考え方を伝えます。')}</p></article>
    <article><h3>{say('按照自己的想法排版','Make the layout your own','自分らしいレイアウトで')}</h3><p>{say('在画布中调整内容和布局，选择适合自己的样式；也可以上传独立设计的静态主页。','Arrange content on the canvas, choose your own style, or bring a static homepage you have designed yourself.','キャンバスで内容や配置を調整し、スタイルを選べます。自作の静的サイトも公開できます。')}</p></article>
    <article><h3>{say('发布，继续生长','Publish, then keep creating','公開して、育てていく')}</h3><p>{say('公开你的空间，分享一个链接。新的作品、经历与想法，随时都可以加入。','Publish your space and share a single link. Add new work, experiences and ideas whenever you are ready.','スペースを公開して、一つのリンクを共有。新しい作品や経験、アイデアをいつでも追加できます。')}</p></article>
   </div>
  </section>
 </div>;
}
