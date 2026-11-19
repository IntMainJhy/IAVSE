import Link from 'next/link';
import {publicGallery} from '@/lib/spaces.mjs';
import {localizeProfile} from '@/lib/content-locales.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {blogShowcases,showcaseProfile} from '@/lib/blog-showcase.mjs';
import {Icon} from './Icons';
import {BlogSpaceGallery,type GallerySpace} from './BlogSpaceGallery';
import {galleryLimit} from '@/lib/blog-gallery-space.mjs';
import '@/app/blog-directory.css';
import '@/app/blog-discovery.css';

type DirectorySpace={handle:string;name:string;intro:string;alias?:string;avatarId?:string;avatarSrc?:string;href:string;example?:boolean};
type DirectoryQuery={q?:string|string[]};
const searchable=(value:string)=>value.normalize('NFKC').toLocaleLowerCase();

/** Discovery always uses the reviewed, public and discoverable directory. */
export async function BlogSpacesPage({req,query={}}:{req:Request;query?:DirectoryQuery}){
 const {t,locale}=await serverI18n();
 const say=(zh:string,en:string,ja:string)=>locale==='en'?en:locale==='ja'?ja:zh;
 const source=publicGallery(req);
 const spaces:DirectorySpace[]=source.directory.map((space:any)=>{
  const profile=localizeProfile(space.profile,locale);
  return {handle:space.handle,name:profile.name||space.handle,intro:profile.intro||'',alias:profile.alias||'',avatarId:profile.avatarId||'',href:'/blog/'+encodeURIComponent(space.handle)};
 });
 const search=((Array.isArray(query.q)?query.q[0]:query.q)||'').trim().slice(0,120);
 const terms=searchable(search).split(/\s+/).filter(Boolean);
 const matches=spaces.filter(space=>{
  const text=searchable([space.name,space.handle,space.alias,space.intro].join(' '));
  return terms.every(term=>text.includes(term));
 });
 const examples:DirectorySpace[]=blogShowcases.flatMap(item=>{
  const profile=showcaseProfile(item.handle,locale);
  return profile?[{handle:profile.handle,name:profile.name,intro:profile.intro,avatarSrc:profile.avatarSrc,href:'/blogs/showcase/'+encodeURIComponent(profile.handle),example:true}]:[];
 });
 // The scene uses the same permission-checked selection and preview order as
 // /api/blog-gallery. Only this small public projection crosses into the client.
 const selected=source.featured.length?source.featured:source.directory;
 const gallerySpaces:GallerySpace[]=selected.map((space:any)=>{
  const profile=localizeProfile(space.profile,locale);
  return {handle:space.handle,name:profile.name||space.handle,intro:profile.intro||'',avatarId:profile.avatarId||'',href:'/blog/'+encodeURIComponent(space.handle),mode:space.mode};
 });
 if(!source.featured.length)for(const item of blogShowcases){
  const profile=showcaseProfile(item.handle,locale);
  if(profile)gallerySpaces.push({...profile,href:'/blogs/showcase/'+encodeURIComponent(profile.handle)});
 }
 const galleryLabels={
  open:say('进入空间','Open space','スペースを開く'),preview:say('空间预览','Space preview','スペースのプレビュー'),
  browse:say('浏览公开空间','Browse public spaces','公開スペースを見る'),directory:say('3D 空间画廊','3D space gallery','3D スペースギャラリー'),
  previous:say('上一个','Previous','前へ'),next:say('下一个','Next','次へ'),select:say('聚焦空间','Focus space','スペースを選択'),
  close:say('返回画廊','Back to gallery','ギャラリーに戻る'),overview:say('拖动探索，点击一张主页，走近它的故事。','Drag to explore. Select a homepage to take a closer look.','ドラッグして探索。ホームページを選んで詳しく見る。'),
  reset:say('重置视角','Reset view','視点をリセット'),loading:say('正在布置空间画廊…','Preparing the gallery…','ギャラリーを準備中…')
 };
 const number=(value:number)=>new Intl.NumberFormat(locale).format(value);
 const card=(space:DirectorySpace)=><li key={space.handle} data-space-kind={space.example?'example':'member'}>
  <Link className="blog-directory-card" href={space.href} prefetch={false}>
   <div className="blog-directory-author">
    <span className="blog-directory-avatar" aria-hidden="true">
     {space.avatarId||space.avatarSrc?<img src={space.avatarId?'/media/'+encodeURIComponent(space.avatarId):space.avatarSrc} alt="" width="44" height="44" loading="lazy" decoding="async"/>:Array.from(space.name)[0]}
    </span>
    <div className="blog-directory-identity"><h3>{space.name}</h3><span>@{space.handle}</span></div>
   </div>
   <p className="blog-directory-intro">{space.intro||say('还没有填写介绍。','No introduction yet.','紹介文はまだありません。')}</p>
   <div className="blog-directory-card-footer">
    <span>{space.example?say('查看示例','View example','作例を見る'):say('进入空间','Open space','スペースを開く')}</span>
    {space.example&&<small>{say('虚构人物','Fictional person','架空の人物')}</small>}
    <Icon name="arrow"/>
   </div>
  </Link>
 </li>;
 return <div className="blog-spaces-page blog-directory-page" data-blog-spaces data-spaces-surface="directory">
  <header className="blog-directory-heading">
   <div><h1>{say('每个空间，都有自己的故事。','Every space has a story.','一つひとつのスペースに、物語がある。')}</h1>
   <p>{say('遇见创作者，也为自己的作品与文字，留一个位置。','Meet the people behind the work. Make a place for your own.','つくり手に出会い、自分の作品と言葉にも居場所を。')}</p></div>
   <Link className="blog-directory-create" href="/workspace/blog"><Icon name="plus"/>{t('创建我的空间')}</Link>
  </header>
  <section className="blog-discovery-gallery" aria-label={galleryLabels.directory}>
   <div className="blog-discovery-caption"><h2>{t('博客空间')}</h2><span>{say('换个视角，认识彼此','A different perspective','視点を変えて、出会う')}</span></div>
   <BlogSpaceGallery spaces={gallerySpaces.slice(0,galleryLimit)} labels={galleryLabels} browseHref="#blog-public-directory"/>
   {!source.featured.length&&<p className="blog-discovery-note">{say('画廊同时展示公开空间与内置虚构模板示例；下方目录仅包含真实公开成员。','The gallery includes public spaces and fictional template examples. The directory below lists real public members only.','ギャラリーには公開スペースと架空のテンプレート作例を含みます。以下の一覧は実在する公開メンバーのみです。')}</p>}
  </section>
  <div className="blog-directory-listing" id="blog-public-directory">
  <form key={search} className="blog-directory-search" action="/blogs" method="get" role="search" aria-label={say('搜索公开博客空间','Search public blog spaces','公開ブログを検索')}>
   <label className="blog-directory-search-field" htmlFor="blog-directory-query"><Icon name="search"/><input id="blog-directory-query" type="search" name="q" defaultValue={search} maxLength={120} placeholder={say('搜索作者、空间或介绍','Search authors, spaces or introductions','作者・スペース・紹介文を検索')} aria-label={say('搜索作者、空间或介绍','Search authors, spaces or introductions','作者・スペース・紹介文を検索')} enterKeyHint="search"/></label>
   <button type="submit">{say('搜索','Search','検索')}</button>
  </form>
  <section className="blog-directory-results" aria-labelledby="blog-directory-title" data-blog-directory>
   <div className="blog-directory-section-heading"><div className="blog-directory-title"><h2 id="blog-directory-title">{search?say('搜索结果','Search results','検索結果'):say('公开空间','Public spaces','公開スペース')}</h2><span className="blog-directory-count">{number(matches.length)}</span></div>{search&&<Link href="/blogs" className="blog-directory-clear">{say('查看全部','View all','すべて表示')}</Link>}</div>
   {matches.length?<ul className="blog-directory-grid">{matches.map(card)}</ul>:<div className="blog-directory-empty">
    <h3>{search?say('没有找到相关空间','No matching spaces','一致するスペースはありません'):say('暂无公开博客空间','No public blog spaces yet','公開ブログはまだありません')}</h3>
    <p>{search?say('换个关键词，或查看全部公开空间。','Try another keyword or view all public spaces.','キーワードを変えるか、すべての公開スペースをご覧ください。'):say('创建博客，记录和分享你的内容。','Create a blog to write and share your work.','ブログを作って、記録や作品を共有しましょう。')}</p>
   </div>}
  </section>
  <details className="blog-directory-examples" data-blog-examples>
   <summary><span>{say('查看内置示例','View built-in examples','内蔵の作例を見る')}</span><span className="blog-directory-example-label">{say('非真实用户','Fictional profiles','実在しないユーザー')}</span><Icon name="plus"/></summary>
   <p>{say('以下为内置虚构示例，用于了解博客的内容与排版。','These built-in fictional profiles show example blog content and layouts.','以下はブログの内容やレイアウトを紹介する、架空の作例です。')}</p>
   <ul className="blog-directory-grid">{examples.map(card)}</ul>
  </details>
  </div>
 </div>;
}
