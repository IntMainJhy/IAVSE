import '@/app/route-styles/blog.css';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {showcasePageData} from '@/lib/blog-showcase.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {PublicBlogTheme} from '@/components/BlogThemeBoundary';
import {BlogTheme} from '@/components/BlogTheme';
export const metadata={title:'Portfolio · IAVSE Spaces',robots:{index:false,follow:false}};
export default async function ShowcasePage({params,searchParams}:{params:Promise<{handle:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const {locale}=await serverI18n(),data=showcasePageData((await params).handle,locale);if(!data)notFound();
 const embed=(await searchParams).embed==='gallery';
 if(embed)return <div className="blog-public-shell blog-gallery-embed"><BlogTheme data={data} preview embedded staticPreview/></div>;
 return <div className="showcase-full-page"><header className="showcase-platform-bar"><Link href="/blogs">← IAVSE Spaces</Link><span>{locale==='zh'?'主页设计展廊':'Portfolio gallery'}</span></header><PublicBlogTheme data={data} preview embedded/></div>;
}
