import '@/app/resource-bento.css';
import '@/app/resource-frame.css';
import '@/app/resource-display.css';
import Link from 'next/link';
import {serverI18n} from '@/lib/server-i18n';
import {LEGAL_CONSULTATION_PATH} from '@/lib/legal-consultation.mjs';
import {DocsPage,SkillsPage} from './LearningPages';
import {ResourcesPage,type CatalogQuery} from './SharedCatalog';
import {CatalogNavigation} from './CatalogNavigation';
import {ResourceIntroduction} from './ResourceIntroduction';
import {DesignLibrary} from './DesignLibrary';

export async function ResourceTabs({active='all',query={}}:{active?:string;query?:CatalogQuery}){
 const {t}=await serverI18n(),q=String(query.q||'').trim();
 const tabHref=(id:string)=>{if(id==='all')return '/resources';if(id==='legal')return LEGAL_CONSULTATION_PATH;const search=new URLSearchParams({type:id,...q?{q}:{}}).toString();return '/resources?'+search};
 return <CatalogNavigation active={active} label={t('资源类型')}>{[['all','概览'],['designs','UI 设计'],['docs','文档'],['skills','Skill'],['resources','网站与工具'],['legal','法律咨询']].map(([id,label])=><Link key={id} href={tabHref(id)} prefetch={true} scroll={false} aria-current={active===id?'page':undefined}>{t(label)}</Link>)}</CatalogNavigation>;
}

export async function ResourceHub({query={},baseUrl}:{query?:CatalogQuery;baseUrl:string}){
 const requested=String(query.type||''),kind=['docs','skills','resources','designs'].includes(requested)?requested:query.category?'resources':'all';
 return <div className="resource-hub resource-bento resource-page-frame" data-resource-kind={kind}><ResourceTabs active={kind} query={query}/><div data-resource-panel>{kind==='designs'?<DesignLibrary query={query}/>:kind==='skills'?<SkillsPage baseUrl={baseUrl} query={query}/>:kind==='docs'?<DocsPage path={['docs']} query={query}/>:kind==='resources'?<ResourcesPage query={query}/>:<ResourceIntroduction/>}</div></div>;
}
