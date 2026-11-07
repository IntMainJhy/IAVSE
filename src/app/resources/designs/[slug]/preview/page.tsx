import {notFound,redirect} from 'next/navigation';
import {readPublishedDesigns} from '@/lib/design-intake.mjs';
import {DesignPreview} from '@/components/DesignPreview';
import {studioComponents} from '@/lib/design-studio/components.mjs';
import {ReferencedDesignPreview} from '@/components/ReferencedDesignPreview';
import {DesignStudioPreview} from '@/components/DesignStudioPreview';
import {externalPreviewUrl} from '@/lib/design-catalog.mjs';
export const dynamic='force-dynamic';
export const metadata={title:'设计预览 · IAVSE',robots:{index:false,follow:false}};
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{variant?:string;component?:string}>}){
 const{slug}=await params,entry=readPublishedDesigns().find((x:any)=>x.slug===slug);if(!entry)notFound();
 if(entry.studio){const component=(await searchParams).component,selected=studioComponents.some(c=>c[0]===component)?component:undefined;if(entry.studio.referenceKey&&!selected)return <ReferencedDesignPreview entry={entry}/>;return <DesignStudioPreview entry={entry} initialComponent={selected}/>;}
 if(entry.external){
  if(entry.image)redirect(entry.previewUrl||entry.websiteUrl||entry.source.url);
  const src=externalPreviewUrl(entry,Number((await searchParams).variant));if(!src)notFound();
  return <iframe src={src} title={entry.title+' · '+entry.source.name} referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" style={{position:'fixed',inset:0,width:'100%',height:'100%',border:0,background:'#fff'}}/>;
 }
 return <DesignPreview entry={entry}/>;
}
