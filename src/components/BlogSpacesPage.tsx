import Link from 'next/link';
import {publicSpace,publicSpaces} from '@/lib/spaces.mjs';
import {localizeContent,localizeProfile} from '@/lib/content-locales.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {FeedAvatar} from './FeedAvatar';
import {Icon} from './Icons';

type CreatorPreview={handle:string;name:string;intro:string;avatarId:string;coverId:string;href:string;projectTitle?:string;projectSummary?:string};

/** The directory uses the same published, discoverable boundary as public blogs. */
export async function BlogSpacesPage({req}:{req:Request}){
 const {t,locale}=await serverI18n();
 const spaces:CreatorPreview[]=publicSpaces(req).map((space:any,index:number)=>{
  const profile=localizeProfile(space.profile,locale);
  const preview:CreatorPreview={handle:space.handle,name:profile.name||space.handle,intro:profile.intro||'',avatarId:profile.avatarId||'',coverId:space.coverId||'',href:'/blog/'+encodeURIComponent(space.handle)};
  if(index<8)try{
   // Only published, visible project content can supply a directory preview.
   const published=publicSpace(req,space.handle),design=published.layout.blog?.design,visible=new Set((design?.nodes||[]).filter((node:any)=>!node.hidden).map((node:any)=>node.part));
   const section=published.profile.resume?.sections?.find((item:any)=>/project|作品|项目/i.test(item.id+' '+item.title)&&(!design||visible.has('section:'+item.id)));
   const project=section?.items?.find((item:any)=>item.title&&item.coverId)||section?.items?.find((item:any)=>item.title);
   const document=published.content.find((item:any)=>item.type==='projects'&&item.coverId)||published.content.find((item:any)=>item.type==='projects');
   if(project){preview.coverId||=project.coverId||'';preview.projectTitle=project.translations?.[locale]?.title?.trim()||project.title;preview.projectSummary=project.translations?.[locale]?.description?.trim()||project.description||'';}
   else if(document){const localized=localizeContent(document,locale);preview.coverId||=localized.coverId||'';preview.projectTitle=localized.title;preview.projectSummary=localized.summary||'';}
  }catch{/* A concurrent publication change must not turn a directory read into an error. */}
  return preview;
 });
 const [featured,...others]=spaces;
 return <div className="blog-spaces-page" data-blog-spaces>
  <header className="creator-directory-intro">
   <div><h1>{t('博客空间')}</h1><p>{t('发现不同的创作者，走进他们的空间。')}</p></div>
   <Link className="space-btn primary" href="/workspace/blog">{t('创建我的空间')}<Icon name="plus"/></Link>
  </header>
  <section className="creator-directory" id="blog-spaces-directory" data-blog-directory aria-label={t('走进一个新的空间。')}>
   {featured?<article className="creator-feature">
    <figure className={'creator-feature-preview'+(!featured.coverId?' is-profile':'')}>
     <Link href={featured.href} tabIndex={-1} aria-hidden="true">{featured.coverId?<img src={'/media/'+encodeURIComponent(featured.coverId)} alt="" width={960} height={600} fetchPriority="high"/>:<div className="creator-portrait-preview"><FeedAvatar name={featured.name} avatarId={featured.avatarId}/><span>@{featured.handle}</span></div>}</Link>
     {featured.projectTitle&&<figcaption>{featured.projectTitle}</figcaption>}
    </figure>
    <div className="creator-feature-copy">
     <div className="creator-identity"><FeedAvatar name={featured.name} avatarId={featured.avatarId}/><div><h2>{featured.name}</h2><span>@{featured.handle}</span></div></div>
     {featured.intro&&<p className="creator-description">{featured.intro}</p>}
     <Link className="creator-enter" href={featured.href}>{t('进入博客空间')}<Icon name="arrow"/></Link>
    </div>
   </article>:<div className="creator-directory-empty"><h2>{t('暂时没有公开博客空间。')}</h2><p>{t('作品、经历与想法，在这里相遇。')}</p><Link className="space-btn primary" href="/workspace/blog">{t('创建我的空间')}</Link></div>}
   {others.length>0&&<div className="creator-directory-more"><h2>{t('走进一个新的空间。')}</h2><div className="creator-grid">{others.map(space=><article className="creator-entry" key={space.handle}>
    {space.coverId&&<Link className="creator-entry-preview" href={space.href} tabIndex={-1} aria-hidden="true"><img src={'/media/'+encodeURIComponent(space.coverId)} alt="" width={960} height={600} loading="lazy"/></Link>}
    <div className="creator-entry-copy"><div className="creator-identity"><FeedAvatar name={space.name} avatarId={space.avatarId}/><div><h3>{space.name}</h3><span>@{space.handle}</span></div></div>{space.intro&&<p className="creator-description">{space.intro}</p>}<Link className="creator-enter" href={space.href}>{t('进入博客空间')}<Icon name="arrow"/></Link></div>
   </article>)}</div></div>}
  </section>
  <div className="creator-directory-note"><p>{t('作品、经历与想法，在这里相遇。')}</p><Link href="/workspace/blog">{t('设置我的空间')}<Icon name="arrow"/></Link></div>
 </div>;
}
