import '@/app/route-styles/catalog.css';
import '@/app/resource-bento.css';
import '@/app/resource-frame.css';
import {PublicFrame} from '@/components/PublicSite';
import {DesignDetail} from '@/components/DesignLibrary';
import {findPublishedDesign} from '@/lib/design-intake.mjs';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params,entry=findPublishedDesign(slug);return entry?{title:entry.title+' · UI 设计 · IAVSE',description:entry.summary,alternates:{canonical:'/resources/designs/'+entry.slug}}:{title:'UI 设计 · IAVSE',robots:{index:false,follow:false}}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;return <PublicFrame path={['resources','designs',slug]}><div className="resource-bento resource-page-frame"><DesignDetail slug={slug}/></div></PublicFrame>}
