import {notFound} from 'next/navigation';
import {readPublishedDesigns} from '@/lib/design-intake.mjs';
import {DesignPreview} from '@/components/DesignPreview';
export const dynamic='force-dynamic';
export const metadata={title:'设计预览 · IAVSE',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params,entry=readPublishedDesigns().find((x:any)=>x.slug===slug);if(!entry)notFound();return <DesignPreview entry={entry}/>}
