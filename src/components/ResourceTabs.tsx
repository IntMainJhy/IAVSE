import '@/app/resource-frame.css';
import Link from 'next/link';
import {serverI18n} from '@/lib/server-i18n';
import {LEGAL_CONSULTATION_PATH} from '@/lib/legal-consultation.mjs';
import type {CatalogQuery} from './SharedCatalog';
import {CatalogNavigation} from './CatalogNavigation';

export async function ResourceTabs({active='all',query={}}:{active?:string;query?:CatalogQuery}){
 const {t}=await serverI18n(),q=String(query.q||'').trim();
 const tabHref=(id:string)=>{if(id==='all')return '/resources';if(id==='legal')return LEGAL_CONSULTATION_PATH;const search=new URLSearchParams({type:id,...q?{q}:{}}).toString();return '/resources?'+search};
 return <CatalogNavigation active={active} label={t('资源类型')}>{[['all','概览'],['designs','UI 设计'],['docs','文档'],['skills','Skill'],['resources','网站与工具'],['legal','法律咨询']].map(([id,label])=><Link key={id} href={tabHref(id)} prefetch={false} scroll={false} aria-current={active===id?'page':undefined}>{t(label)}</Link>)}</CatalogNavigation>;
}
