'use client';
import Link from 'next/link';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Icon} from './Icons';
import {DirectorySearch} from './DirectorySearch';
import {useLocale} from './LocaleProvider';
import {DesignPreviewCard,DesignPreviewDialog,type DesignPreviewItem} from './DesignQuickPreview';
import {SCENARIOS,designFacets,filterCatalog} from '@/lib/design-taxonomy.mjs';
import {CATALOG_FILTER_DEFAULTS,readCatalogFilters,catalogQuery,readCatalogFavorites} from '@/lib/design-catalog-state.mjs';
import '@/app/design-catalog-explorer.css';

export type CatalogDesign=DesignPreviewItem&{id:string;summary:string;category:string;tags:string[]};
type Filters={collection:string;q:string;scenario:string;favorites:string;sort:string};
const empty:Filters=CATALOG_FILTER_DEFAULTS;
const groups=[['all','全部模板'],['project','完整开源项目'],['design-system','设计规范预览']];
const favoriteKey='iavse-design-favorites-v1',batchSize=24;
const kindLabel=(kind?:string)=>kind==='project'?'完整开源项目':kind==='design-system'?'设计规范预览':'页面模板';

export function DesignCatalogExplorer({entries}:{entries:CatalogDesign[]}){
 const {t}=useLocale(),params=useSearchParams(),[filters,setFilters]=useState<Filters>(()=>readCatalogFilters(new URLSearchParams(params.toString()))),[favorites,setFavorites]=useState<string[]>([]),[storageMessage,setStorageMessage]=useState(''),[favoritesReady,setFavoritesReady]=useState(false),loadedFavorites=useRef(false),[visibleCount,setVisibleCount]=useState(batchSize),[preview,setPreview]=useState<CatalogDesign|null>(null),previewTrigger=useRef<HTMLButtonElement|null>(null),sentinel=useRef<HTMLDivElement>(null);
 const queryString=params.toString();
 useEffect(()=>{const next=readCatalogFilters(new URLSearchParams(queryString));setFilters(next);setVisibleCount(batchSize)},[queryString]);
 useEffect(()=>{const slugs=entries.map(entry=>entry.slug);if(!loadedFavorites.current){loadedFavorites.current=true;try{setFavorites(readCatalogFavorites(localStorage.getItem(favoriteKey)||'[]',slugs))}catch{setStorageMessage(t('浏览器未允许保存，收藏仅在本次访问中保留。'))}setFavoritesReady(true)}else setFavorites(current=>readCatalogFavorites(current,slugs));const sync=(event:StorageEvent)=>{if(event.key===favoriteKey||event.key===null)setFavorites(readCatalogFavorites(event.newValue||'[]',slugs))};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[entries,t]);
 const update=(changes:Partial<Filters>)=>{const next={...filters,...changes};setFilters(next);setVisibleCount(batchSize);const query=catalogQuery(next);window.history[Object.hasOwn(changes,'q')?'replaceState':'pushState'](null,'','/resources?'+query.toString())};
 const filtered=useMemo(()=>filterCatalog(entries,filters,favorites) as CatalogDesign[],[entries,filters,favorites]),items=filtered.slice(0,visibleCount),hasMore=visibleCount<filtered.length;
 const counts=useMemo(()=>Object.fromEntries(groups.map(([id])=>[id,filterCatalog(entries,{...empty,collection:id}).length])),[entries]);
 const favoriteCount=useMemo(()=>filterCatalog(entries,{...empty,collection:filters.collection,favorites:'1'},favorites).length,[entries,filters.collection,favorites]),waitingForFavorites=filters.favorites==='1'&&!favoritesReady;
 const availableScenarios=useMemo(()=>{const ids=new Set(entries.flatMap(entry=>designFacets(entry).scenarios));return SCENARIOS.filter(({id}:{id:string})=>ids.has(id))},[entries]);
 useEffect(()=>{const element=sentinel.current;if(!element||!hasMore||waitingForFavorites)return;if(!('IntersectionObserver'in window)){setVisibleCount(filtered.length);return}const observer=new IntersectionObserver(observations=>{if(observations.some(observation=>observation.isIntersecting)){observer.disconnect();setVisibleCount(current=>Math.min(current+batchSize,filtered.length))}},{rootMargin:'700px 0px'});observer.observe(element);return()=>observer.disconnect()},[hasMore,visibleCount,filtered.length,waitingForFavorites]);
 const favorite=(slug:string)=>{const next=favorites.includes(slug)?favorites.filter(item=>item!==slug):[...favorites,slug];setFavorites(next);try{localStorage.setItem(favoriteKey,JSON.stringify(next));setStorageMessage('')}catch{setStorageMessage(t('浏览器未允许保存，收藏仅在本次访问中保留。'))}};
 const active=filters.q||filters.scenario||filters.favorites;
 return <section className="design-studio design-directory design-explorer" id="design-directory">
  <header className="design-library-heading"><div><h1>{t('网站模板目录')}</h1><p>{t('发现开源网站与设计规范，查看真实界面、项目源码和使用许可。')}</p></div><a href="#design-source-guide">{t('收录说明')} <Icon name="arrow"/></a></header>
  <nav className="design-collection-tabs explorer-collections" aria-label={t('模板类型')}>{groups.map(([id,label])=><button key={id} type="button" onClick={()=>update({collection:id})} aria-pressed={filters.collection===id}>{t(label)} <span>{counts[id]}</span></button>)}</nav>
  <DirectorySearch action="/resources" fields={{type:'designs',collection:filters.collection,scenario:filters.scenario,favorites:filters.favorites,sort:filters.sort}} value={filters.q} label={t('搜索网站模板')} placeholder={t('名称、技术栈或功能')} onSearch={q=>update({q})}/>
  <div className="explorer-scenarios" role="group" aria-label={t('按使用场景筛选')}><span>{t('使用场景')}</span>{[{id:'',label:'全部'},...availableScenarios].map(({id,label}:{id:string;label:string})=><button type="button" key={id} onClick={()=>update({scenario:id})} aria-pressed={filters.scenario===id}>{t(label)}</button>)}</div>
  <div className="explorer-template-controls"><button type="button" className="explorer-favorites" aria-pressed={filters.favorites==='1'} onClick={()=>update({favorites:filters.favorites?'':'1'})}><Icon name="heart"/>{t('收藏')} ({favoriteCount})</button>{active&&<button className="explorer-reset" type="button" onClick={()=>update({...empty,collection:filters.collection})}>{t('清除筛选')}<Icon name="close"/></button>}<label>{t('排序')}<select value={filters.sort} onChange={event=>update({sort:event.target.value})}><option value="recommended">{t('推荐顺序')}</option><option value="name">{t('名称 A–Z')}</option></select></label></div>
  <div className="design-directory-meta"><p className="design-result" role="status">{waitingForFavorites?t('正在读取收藏…'):<>{filtered.length} {t('个模板')}{hasMore&&<> · {t('已显示')} {items.length}</>}</>}</p><span>{t(filters.collection==='design-system'?'配色、字体与组件规范 · 与完整项目分开收录':'原始实现、项目来源与许可分别列明')}</span></div>
  {storageMessage&&<p className="explorer-storage" role="status">{storageMessage}</p>}
  <div className="design-grid">{items.map(entry=>{const origin=entry.creator||entry.source;return <article className="design-card" key={entry.slug} data-template-slug={entry.slug}>
   <a className="explorer-repository-link" href={entry.template?.repository||entry.source.url} target="_blank" rel="noopener noreferrer" aria-label={'GitHub · '+entry.title} title={t('原作者')+' · '+origin.name}>GitHub<Icon name="arrow"/></a><DesignPreviewCard entry={entry} onPreview={element=>{previewTrigger.current=element;setPreview(entry)}}/><div className="design-card-copy"><div className="design-card-meta"><span>{t(kindLabel(entry.template?.kind))}</span>{entry.license&&<a href={entry.license.url} target="_blank" rel="noopener noreferrer" aria-label={entry.license.name+' · '+t('使用许可')}>{entry.license.name} ↗</a>}</div><div className="explorer-card-title"><h2><Link prefetch={false} href={'/resources/designs/'+entry.slug}>{entry.title}</Link></h2><button type="button" onClick={()=>favorite(entry.slug)} aria-pressed={favorites.includes(entry.slug)} aria-label={(favorites.includes(entry.slug)?t('取消收藏'):t('收藏'))+' · '+entry.title}><Icon name="heart"/></button></div><p>{entry.summary}</p>{entry.template?.previewNote&&<div className="explorer-preview-note">{entry.previewPolicy==='external-only'?t('在线演示暂不可用，可查看界面截图。'):entry.template.previewNote}</div>}{!!entry.template?.stack?.length&&<ul className="explorer-stack" aria-label={t('技术栈')}>{entry.template.stack.slice(0,4).map(item=><li key={item}>{item}</li>)}</ul>}<div className="design-card-actions"><Link prefetch={false} href={'/resources/designs/'+entry.slug}>{t('模板详情')}</Link><a href={entry.previewPolicy==='external-only'?entry.template?.repository||entry.source.url:entry.websiteUrl||entry.previewUrl||entry.source.url} target="_blank" rel="noopener noreferrer">{t(entry.previewPolicy==='external-only'?'获取源码':'打开演示')} ↗</a></div></div>
  </article>})}</div>
  {!waitingForFavorites&&!items.length&&<div className="design-empty"><Icon name="search"/><h2>{t(filters.favorites==='1'&&!favorites.length?'还没有收藏的模板':'没有匹配这些条件的模板')}</h2><p>{t('试试减少筛选条件，或从全部模板开始浏览。')}</p><button type="button" onClick={()=>update(empty)}>{t('浏览全部模板')}</button></div>}
  {items.length>0&&<div className="explorer-scroll-status" ref={sentinel} role="status" aria-live="polite">{hasMore?t('继续向下浏览，更多模板会自动出现。'):t('已显示全部匹配模板。')}</div>}
  <details className="design-origin-guide" id="design-source-guide"><summary>{t('这些模板如何收录？')}</summary><div className="explorer-source-columns"><div><h3>{t('完整开源项目')}</h3><p>{t('从原作者 GitHub 仓库收录不同风格的完整项目，包含仪表盘、文档、博客、作品集和品牌网站。每项保留原作者、原仓库、实际演示和对应许可；早期项目发现线索来自 StyleKit。')}</p><a href="https://www.stylekit.top/zh/templates" target="_blank" rel="noopener noreferrer">{t('查看收录线索')} ↗</a></div><div><h3>{t('设计规范预览')}</h3><p>{t('54 项 VoltAgent MIT 示例作为设计规范预览单独收录，保留原项目与许可。这些示例呈现设计规则和组件，不标为完整应用；58 项未确认开放许可的示例不在本目录收录。')}</p><a href="https://github.com/VoltAgent/awesome-design-md" target="_blank" rel="noopener noreferrer">{t('查看原项目')} ↗</a></div></div><p>{t('收录依据实际文件与许可；图片、字体和商标的使用条件请同时查看项目说明。')}</p></details>
  {preview&&<DesignPreviewDialog key={preview.slug} entry={preview} returnFocus={previewTrigger.current} onClose={()=>setPreview(null)}/>}
 </section>;
}
