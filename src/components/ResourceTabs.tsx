import '@/app/resource-frame.css';
import Link from 'next/link';
import {serverI18n} from '@/lib/server-i18n';
import {LEGAL_CONSULTATION_PATH} from '@/lib/legal-consultation.mjs';
import type {CatalogQuery} from './SharedCatalog';
import {CatalogNavigation} from './CatalogNavigation';

export async function ResourceTabs({active='designs',query={}}:{active?:string;query?:CatalogQuery}){
 const {t}=await serverI18n(),q=String(query.q||'').trim();
 const tabHref=(id:string)=>{if(id==='legal')return LEGAL_CONSULTATION_PATH;const search=new URLSearchParams({type:id,...q?{q}:{}}).toString();return '/resources?'+search};
 const selected=active==='all'?'designs':active;
 const items=[['designs','UI 设计'],['skills','AI Skills'],['docs','文档'],['resources','网站与工具'],['legal','法律咨询']].map(([id,label])=>({id,label:t(label),href:tabHref(id),prefetch:false,scroll:false}));
 return <CatalogNavigation active={selected} label={t('资源类型')} className="resource-hub-tabs resource-tabs"><div className="resource-tab-links">{items.map(item=><Link key={item.id} className="resource-tab-link" href={item.href} prefetch={false} scroll={false} aria-current={selected===item.id?'page':undefined}>{item.label}</Link>)}</div></CatalogNavigation>;
}
