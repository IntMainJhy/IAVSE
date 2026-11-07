import '@/app/resource-bento.css';
import '@/app/resource-frame.css';
import '@/app/resource-display.css';
import Link from 'next/link';
import Form from 'next/form';
import {headers} from 'next/headers';
import {serverI18n} from '@/lib/server-i18n';
import {publicCatalog} from '@/lib/catalog.mjs';
import {publicContent} from '@/lib/db.mjs';
import {localizeContent} from '@/lib/content-locales.mjs';
import {guides} from '@/lib/learning.mjs';
import {curatedSkills,filterSkills,skillFilters} from '@/lib/skill-catalog.mjs';
import {legalConsultationResource,LEGAL_CONSULTATION_PATH} from '@/lib/legal-consultation.mjs';
import {DocsPage,SkillsPage} from './LearningPages';
import {ResourcesPage,CatalogCards,type CatalogQuery} from './SharedCatalog';
import {Icon} from './Icons';
import {CatalogSearch} from './CatalogSearch';
import {CatalogNavigation} from './CatalogNavigation';

export async function ResourceTabs({active='all',query={}}:{active?:string;query?:CatalogQuery}){
 const {t}=await serverI18n(),q=String(query.q||'').trim();
 const tabHref=(id:string)=>{if(id==='legal')return LEGAL_CONSULTATION_PATH;const search=new URLSearchParams({...id!=='all'?{type:id}:{},...q?{q}:{}}).toString();return '/resources'+(search?'?'+search:'')};
 return <CatalogNavigation active={active} label={t('资源类型')}>{[['all','全部'],['docs','文档'],['skills','Skill'],['resources','网站与工具'],['legal','法律咨询']].map(([id,label])=><Link key={id} href={tabHref(id)} prefetch={true} scroll={false} aria-current={active===id?'page':undefined}>{t(label)}</Link>)}</CatalogNavigation>;
}

async function ResourceOverview({query,baseUrl}:{query:CatalogQuery;baseUrl:string}){
 const {t,locale}=await serverI18n(),q=String(query.q||'').trim();
 const published=publicCatalog({summary:true,kind:''},new Request(baseUrl,{headers:await headers()})).items;
 const docs=[...guides.map(item=>({id:'guide-'+item.slug,title:t(item.title),summary:t(item.summary),category:t('使用指南'),url:'/docs/'+item.slug})),{id:'connect',title:'Connect API & MCP',summary:t('让 AI 直接发布文档、Skill 和其他资源。'),category:t('AI 工作流'),url:'/docs/connect'},...publicContent('articles').map((item:any)=>({...localizeContent(item,locale),url:'/docs/articles/'+encodeURIComponent(item.slug),authorName:'IAVSE'})),...published.filter((item:any)=>item.kind==='docs')];
 const skills=[...curatedSkills.map(item=>({id:'skill-'+item.id,title:item.name,summary:t(item.summary),category:'Skill',authorName:item.repo,url:'/skills/'+item.id})),...published.filter((item:any)=>item.kind==='skills')];
 const resources=[legalConsultationResource(locale),...published.filter((item:any)=>item.kind==='resources'),...publicContent('resources').map((item:any)=>({...localizeContent(item,locale),url:'/resources/'+encodeURIComponent(item.slug)}))];
 const matchedCurated=new Set(filterSkills({q:skillFilters(query).q},t).map((skill:any)=>'skill-'+skill.id));
 const groups=[{kind:'docs',label:t('文档'),items:docs},{kind:'skills',label:'Skill',items:skills},{kind:'resources',label:t('网站与工具'),items:resources}].map(group=>({...group,items:group.items.filter((item:any)=>group.kind==='skills'&&item.id?.startsWith('skill-')?matchedCurated.has(item.id):!q||[item.title,item.summary,item.category].join(' ').toLowerCase().includes(q.toLowerCase()))}));
 const resultCount=groups.reduce((total,group)=>total+group.items.length,0);
 return <div className="resource-overview" data-resource-query={!!q}>
  <header className="catalog-page-heading resource-bento-heading resource-display-heading"><div><h1>{t('资源')}</h1><p>{t('教程、Skill、网站与工具，在一个地方发现。')}</p></div><div className="resource-display-actions"><Form action="/resources" scroll={false} role="search"><CatalogSearch value={q} label={t('搜索全部资源')}/></Form><Link className="resource-share-link" href="/resources?compose=1"><Icon name="plus"/>{t('分享资源')}</Link></div></header>
  <div className="resource-overview-index"><nav className="resource-index-stats" aria-label={t('资源类型')}>{groups.map(group=><Link key={group.kind} href={'/resources?'+new URLSearchParams({type:group.kind,...(q?{q}:{})})} scroll={false}><span>{group.label}</span><strong>{new Intl.NumberFormat(locale).format(group.items.length)}</strong></Link>)}</nav>{q&&<div className="resource-query-summary"><span role="status">{t('搜索结果')} · {new Intl.NumberFormat(locale).format(resultCount)}</span><Link href="/resources" scroll={false}>{t('清除筛选')}</Link></div>}</div>
  {groups.filter(group=>group.items.length).map(group=><section className="resource-overview-group" key={group.kind}><header><h2>{group.label}<span className="resource-group-count">{group.items.length}</span></h2><Link className="space-link" href={'/resources?'+new URLSearchParams({type:group.kind,...(q?{q}:{})})}>{t('浏览全部')}<Icon name="arrow"/></Link></header><CatalogCards items={group.items.slice(0,q?12:3)} kind={group.kind}/></section>)}
  {!groups.some(group=>group.items.length)&&<div className="catalog-empty"><p>{t('没有匹配的资源。')}</p><Link href="/resources" scroll={false}>{t('清除筛选')}</Link></div>}
  {!q&&<aside className="resource-overview-support"><Link href="/docs/connect"><div><h2>Connect API &amp; MCP</h2><p>{t('让 AI 直接发布文档、Skill 和其他资源。')}</p></div><Icon name="arrow"/></Link></aside>}
 </div>;
}

export async function ResourceHub({query={},baseUrl}:{query?:CatalogQuery;baseUrl:string}){
 const requested=String(query.type||''),kind=['docs','skills','resources'].includes(requested)?requested:query.category?'resources':'all';
 return <div className="resource-hub resource-bento resource-page-frame" data-resource-kind={kind}><ResourceTabs active={kind} query={query}/><div data-resource-panel>{kind==='skills'?<SkillsPage baseUrl={baseUrl} query={query}/>:kind==='docs'?<DocsPage path={['docs']} query={query}/>:kind==='resources'?<ResourcesPage query={query}/>:<ResourceOverview query={query} baseUrl={baseUrl}/>}</div></div>;
}
