import '@/app/showcase-portfolio.css';
import '@/app/route-styles/blog.css';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {showcasePageData} from '@/lib/blog-showcase.mjs';
import {showcasePortfolioData} from '@/lib/blog-showcase-stories.mjs';
import {blogTemplates} from '@/lib/blog-templates.mjs';
import {blogAppearance} from '@/lib/blog-appearances.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {BlogTheme} from '@/components/BlogTheme';
import {ShowcasePortfolio} from '@/components/ShowcasePortfolio';
export const metadata={title:'Portfolio · IAVSE Spaces',robots:{index:false,follow:false}};
export default async function ShowcasePage({params,searchParams}:{params:Promise<{handle:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const {locale}=await serverI18n(),{handle}=await params,query=await searchParams,embedded=query.embed==='gallery';
 // Explicit template previews keep using the editor's actual template factory.
 // The spatial gallery and the full original homepage share the same renderer.
 if(query.template==='builtin'){
  const data=showcasePageData(handle,locale);if(!data)notFound();
  const theme=<BlogTheme data={data} preview embedded={embedded} staticPreview={embedded}/>;
  if(embedded)return <div className="blog-public-shell blog-gallery-embed" lang={locale==='zh'?'zh-CN':locale}>{theme}</div>;
  const zh=locale==='zh',design=data.layout.blog.design,template=blogTemplates.find(item=>item.id===design.template)!,appearance=blogAppearance(design.appearance);
  return <div className="blog-public-shell v2-site"><header className="blog-platform-bar"><div className="blog-platform-bar-inner"><Link className="blog-platform-logo" href="/blogs">IAVSE · {zh?'示例模板':locale==='ja'?'テンプレート例':'Template example'}</Link><nav className="blog-platform-actions" aria-label={zh?'示例导航':'Example navigation'}><Link href="/blogs">{zh?'返回博客空间':locale==='ja'?'ブログスペースへ':'Back to blog spaces'}</Link><Link href="/workspace/blog">{zh?'创建我的空间':locale==='ja'?'スペースを作成':'Create my space'}</Link></nav></div></header>{theme}<footer className="blog-platform-footer"><p>{zh?'虚构人物 · 内置模板示例':locale==='ja'?'架空の人物 · 内蔵テンプレートの例':'Fictional creator · built-in template example'} · {zh?template.zh:template.en} · {zh?appearance.zh:appearance.en}</p></footer></div>;
 }
 const data=showcasePortfolioData(handle,locale);if(!data)notFound();
 return embedded?<div className="blog-public-shell blog-gallery-embed" lang={locale==='zh'?'zh-CN':locale}><ShowcasePortfolio data={data} embedded/></div>:<ShowcasePortfolio data={data}/>;
}
