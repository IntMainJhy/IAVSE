import '@/app/route-styles/blog.css';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {serverI18n} from '@/lib/server-i18n';
import {publicSpace} from '@/lib/spaces.mjs';
import {BlogTheme} from '@/components/BlogTheme';

export const dynamic='force-dynamic';
export const runtime='nodejs';
export const metadata={title:'Portfolio preview · IAVSE',robots:{index:false,follow:false}};

/** The gallery's read-only document has its own route graph. Public pages keep
 * their lazy theme boundary and do not load this renderer until it is needed. */
export default async function BlogGalleryPreview({params}:{params:Promise<{handle:string}>}){
 const {handle}=await params,{locale}=await serverI18n();
 const req=new Request(new URL('/blog/'+encodeURIComponent(handle),process.env.PUBLIC_URL||'http://localhost:3008'),{headers:await headers()});
 let data;try{data=publicSpace(req,handle);}catch{notFound();}
 // Authored static sites retain the original script-capable sandbox and route.
 if(data.owner!=='owner'&&data.layout.blog?.mode==='static')notFound();
 return <div className="blog-public-shell blog-gallery-embed" lang={locale==='zh'?'zh-CN':locale}><BlogTheme data={data} preview embedded staticPreview/></div>;
}
