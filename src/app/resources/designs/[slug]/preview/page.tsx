import {notFound} from 'next/navigation';
import {readPublishedDesigns} from '@/lib/design-intake.mjs';
import {templatePreviewUrl} from '@/lib/template-preview.mjs';
export const dynamic='force-dynamic';
export const metadata={title:'模板预览 · IAVSE',robots:{index:false,follow:false}};
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{variant?:string}>}){
 const{slug}=await params,entry=readPublishedDesigns().find((item:any)=>item.slug===slug);if(!entry)notFound();
 const src=templatePreviewUrl(entry,Number((await searchParams).variant)||0);if(!src)notFound();
 return <iframe src={src} title={entry.title+' · '+entry.creator?.name} referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" allow="camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'" style={{position:'fixed',inset:0,width:'100%',height:'100%',border:0,background:'#fff'}}/>;
}
