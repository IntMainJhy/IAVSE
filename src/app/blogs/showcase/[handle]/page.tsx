import '@/app/showcase-portfolio.css';
import {notFound} from 'next/navigation';
import {showcasePortfolioData} from '@/lib/blog-showcase-stories.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {ShowcasePortfolio} from '@/components/ShowcasePortfolio';
export const metadata={title:'Portfolio · IAVSE Spaces',robots:{index:false,follow:false}};
export default async function ShowcasePage({params,searchParams}:{params:Promise<{handle:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const {locale}=await serverI18n(),data=showcasePortfolioData((await params).handle,locale);if(!data)notFound();
 return <ShowcasePortfolio data={data} embedded={(await searchParams).embed==='gallery'}/>;
}
