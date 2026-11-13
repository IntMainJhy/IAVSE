'use client';
import Link from 'next/link';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Icon} from './Icons';
import {DirectoryFacet} from './DirectoryFacet';
import {DirectorySearch} from './DirectorySearch';
import {useLocale} from './LocaleProvider';
import {DesignPreviewCard,DesignPreviewDialog,type DesignPreviewItem} from './DesignQuickPreview';
import {SCENARIOS,REFERENCE_INDUSTRIES,VISUAL_STYLES} from '@/lib/design-taxonomy.mjs';
import {CATALOG_FILTER_DEFAULTS,readCatalogFilters,catalogQuery,parseCatalogFavorites} from '@/lib/design-catalog-state.mjs';
import '@/app/design-catalog-explorer.css';

export type CatalogDesign=DesignPreviewItem&{id:string;summary:string;category:string;tags:string[]};
type Filters={collection:string;q:string;scenario:string;industry:string;visual:string;favorites:string;sort:string};
const empty:Filters=CATALOG_FILTER_DEFAULTS;
const groups=[['all','全部资源'],['project','完整网站模板'],['design-system','品牌设计规范']];
const favoriteKey='iavse-design-favorites-v1';
const kindLabel=(kind?:string)=>kind==='project'?'完整开源项目':kind==='design-system'?'设计规范预览':'页面模板';

type CatalogPage={filters:Filters;revision:string;items:CatalogDesign[];total:number;favoriteCount:number;validFavorites:string[];nextCursor:string|null;facets:{counts:Record<string,number>;scenarios:Record<string,number>;industries:Record<string,number>;visualStyles:Record<string,number>}};
const requestKey=(filters:Filters,favorites:string[])=>catalogQuery(filters).toString()+(filters.favorites==='1'?'|'+JSON.stringify([...favorites].sort()):'');

export function DesignCatalogExplorer({initial}:{initial:CatalogPage}){
 const {t}=useLocale(),params=useSearchParams(),[filters,setFilters]=useState<Filters>(()=>initial.filters),[favorites,setFavorites]=useState<string[]>([]),[storageMessage,setStorageMessage]=useState(''),[favoritesReady,setFavoritesReady]=useState(false),[preview,setPreview]=useState<CatalogDesign|null>(null),previewTrigger=useRef<HTMLButtonElement|null>(null),sentinel=useRef<HTMLDivElement>(null);
 const [filtersOpen,setFiltersOpen]=useState(Boolean(initial.filters.scenario||initial.filters.industry||initial.filters.visual));
 const key=requestKey(filters,favorites),favoriteSignature=JSON.stringify(favorites),queryString=params.toString();
 const [page,setPage]=useState(()=>({...initial,key:requestKey(initial.filters,[])})),[busy,setBusy]=useState<'idle'|'first'|'more'>('idle'),[error,setError]=useState(''),[manualLoad,setManualLoad]=useState(false);
 const criteria=useRef({filters,favorites,key}),request=useRef<AbortController|null>(null),sequence=useRef(0),first=useRef(true),failedCursor=useRef<string|null>(null);criteria.current={filters,favorites,key};
 useEffect(()=>{setFilters(readCatalogFilters(new URLSearchParams(queryString)))},[queryString]);
 useEffect(()=>{
  try{setFavorites(parseCatalogFavorites(localStorage.getItem(favoriteKey)||'[]'))}catch{setStorageMessage(t('浏览器未允许保存，收藏仅在本次访问中保留。'))}setFavoritesReady(true);
  const sync=(event:StorageEvent)=>{if(event.key===favoriteKey||event.key===null)setFavorites(parseCatalogFavorites(event.newValue||'[]'))};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
 },[t]);
 const run=useCallback(async function load(cursor:string|null=null,more=false){
  const {filters,favorites,key}=criteria.current,controller=new AbortController(),token=++sequence.current;request.current?.abort();request.current=controller;
  setBusy(more?'more':'first');setError('');failedCursor.current=cursor;
  try{
   const response=await fetch('/api/design-catalog',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({filters,favorites,cursor}),signal:controller.signal});
   const data=await response.json();if(controller.signal.aborted||sequence.current!==token)return;
   if(response.status===409&&cursor){request.current=null;return load();}
   if(!response.ok)throw new Error(data.error||t('加载失败，请重试。'));
   if(JSON.stringify(criteria.current.favorites)===JSON.stringify(favorites)&&JSON.stringify(data.validFavorites)!==JSON.stringify(favorites)){setFavorites(data.validFavorites);try{localStorage.setItem(favoriteKey,JSON.stringify(data.validFavorites))}catch{setStorageMessage(t('浏览器未允许保存，收藏仅在本次访问中保留。'))}}
   setPage(previous=>{
    if(more&&previous.key===key&&previous.revision===data.revision){const seen=new Set(previous.items.map(item=>item.slug));return{...data,key,items:[...previous.items,...data.items.filter((item:CatalogDesign)=>!seen.has(item.slug))]};}
    // A favorite-count refresh must not collapse an already browsed directory.
    if(!more&&previous.key===key&&previous.revision===data.revision)return{...data,key,items:previous.items,nextCursor:previous.nextCursor};
    return{...data,key};
   });setBusy('idle');
  }catch(reason){if(!controller.signal.aborted&&sequence.current===token){setError(reason instanceof Error?reason.message:t('加载失败，请重试。'));setBusy('idle');}}
  finally{if(request.current===controller)request.current=null;}
 },[t]);
 useEffect(()=>{
  if(!favoritesReady)return;
  const skip=first.current&&key===requestKey(initial.filters,[])&&!favorites.length&&initial.revision===page.revision;first.current=false;
  if(!skip)void run();
  return()=>{sequence.current++;request.current?.abort();request.current=null;};
  // The canonical key covers filters; favorites also refresh the validated count.
 },[key,favoriteSignature,favoritesReady,run,initial.revision]);
 const update=(changes:Partial<Filters>)=>{const next={...filters,...changes};setFilters(next);const query=catalogQuery(next);window.history[Object.hasOwn(changes,'q')?'replaceState':'pushState'](null,'','/resources?'+query.toString())};
 const current=page.key===key,items=current?page.items:[],hasMore=current&&!!page.nextCursor,counts=page.facets.counts,favoriteCount=current?page.favoriteCount:0,waitingForFavorites=filters.favorites==='1'&&!favoritesReady,loading=busy==='first'||!current&&!error;
 const availableScenarios=SCENARIOS.filter(({id}:{id:string})=>page.facets.scenarios[id]);
 const industryChoices=REFERENCE_INDUSTRIES.map(option=>({...option,count:page.facets.industries[option.id]||0})).filter(option=>option.count);
 const visualChoices=VISUAL_STYLES.map(option=>({...option,count:page.facets.visualStyles[option.id]||0})).filter(option=>option.count);
 useEffect(()=>{
  const element=sentinel.current;if(!element||!hasMore||waitingForFavorites||busy!=='idle'||error)return;
  if(!('IntersectionObserver'in window)){setManualLoad(true);return;}
  const observer=new IntersectionObserver(observations=>{if(observations.some(observation=>observation.isIntersecting)&&criteria.current.key===key&&!request.current){observer.disconnect();void run(page.nextCursor,true)}},{rootMargin:'700px 0px'});observer.observe(element);return()=>observer.disconnect();
 },[hasMore,items.length,waitingForFavorites,busy,error,key,run,page.nextCursor]);
 const favorite=(slug:string)=>{if(!favorites.includes(slug)&&favorites.length>=1000){setStorageMessage(t('收藏已达 1000 项，请先移除部分收藏。'));return;}const next=favorites.includes(slug)?favorites.filter(item=>item!==slug):[...favorites,slug];setFavorites(next);try{localStorage.setItem(favoriteKey,JSON.stringify(next));setStorageMessage('')}catch{setStorageMessage(t('浏览器未允许保存，收藏仅在本次访问中保留。'))}};
 const selectedFacetCount=[filters.scenario,filters.industry,filters.visual].filter(Boolean).length;
 const active=filters.q||selectedFacetCount||filters.favorites;
 return <section className="design-studio design-directory design-explorer" id="design-directory">
  <header className="design-library-heading"><div><h1>{t('UI 设计目录')}</h1><p>{t('按网站用途、参考行业和视觉风格，发现有来源与许可的设计。')}</p></div><a href="#design-source-guide">{t('收录说明')} <Icon name="arrow"/></a></header>
  <div className="directory-toolbar">
   <DirectorySearch action="/resources" fields={{type:'designs',collection:filters.collection,scenario:filters.scenario,industry:filters.industry,visual:filters.visual,favorites:filters.favorites,sort:filters.sort}} value={filters.q} label={t('搜索 UI 设计资源')} placeholder={t('名称、行业、风格或技术栈')} onSearch={q=>update({q})}/>
   <DirectoryFacet label={t('内容类型')} value={t(groups.find(([id])=>id===filters.collection)?.[1]||'全部资源')}>
    {groups.map(([id,label])=><button key={id} type="button" onClick={()=>update({collection:id,...(id==='project'?{industry:''}:{}),...(id==='design-system'?{scenario:''}:{})})} aria-pressed={filters.collection===id}>{t(label)} <span>{counts[id]}</span></button>)}
   </DirectoryFacet>
   <button className="dir-action" type="button" aria-expanded={filtersOpen} aria-controls="design-directory-filters" onClick={()=>setFiltersOpen(open=>!open)}>{t('筛选')}{selectedFacetCount>0&&<small>{selectedFacetCount}</small>}<Icon name="chevron-down"/></button>
   <button type="button" className="dir-action dir-favorites" aria-pressed={filters.favorites==='1'} onClick={()=>update({favorites:filters.favorites?'':'1'})}><Icon name="heart"/>{t('收藏')} <small>{favoriteCount}</small></button>
   <DirectoryFacet label={t('排序')} value={t(filters.sort==='name'?'名称 A–Z':'推荐顺序')}>{[['recommended','推荐顺序'],['name','名称 A–Z']].map(([id,label])=><button key={id} type="button" aria-pressed={filters.sort===id} onClick={()=>update({sort:id})}>{t(label)}</button>)}</DirectoryFacet>
   {active&&<button className="dir-action dir-reset" type="button" onClick={()=>update({...empty,collection:filters.collection})}>{t('清除筛选')}</button>}
   <div className="directory-more" id="design-directory-filters" hidden={!filtersOpen}>
    {filters.collection!=='design-system'&&<DirectoryFacet label={t('网站用途')} value={t(SCENARIOS.find(x=>x.id===filters.scenario)?.label||'全部')}>{[{id:'',label:'全部'},...availableScenarios].map(({id,label})=><button key={id} type="button" aria-pressed={filters.scenario===id} onClick={()=>update({scenario:id,...(id?{industry:''}:{})})}>{t(label)}</button>)}</DirectoryFacet>}
    {filters.collection!=='project'&&<DirectoryFacet label={t('参考行业')} value={t(REFERENCE_INDUSTRIES.find(x=>x.id===filters.industry)?.label||'全部参考行业')}>{[{id:'',label:'全部参考行业'},...industryChoices].map(({id,label})=><button key={id} type="button" aria-pressed={filters.industry===id} onClick={()=>update({industry:id,...(id?{scenario:''}:{})})}>{t(label)}</button>)}</DirectoryFacet>}
    <DirectoryFacet label={t('视觉风格')} value={t(VISUAL_STYLES.find(x=>x.id===filters.visual)?.label||'全部视觉风格')}>{[{id:'',label:'全部视觉风格'},...visualChoices].map(({id,label})=><button key={id} type="button" aria-pressed={filters.visual===id} onClick={()=>update({visual:id})}>{t(label)}</button>)}</DirectoryFacet>
   </div>
  </div>
  <div className="design-directory-meta"><p className="design-result" role="status">{waitingForFavorites?t('正在读取收藏…'):loading&&!items.length?t('加载中…'):<>{page.total} {t('项资源')}{hasMore&&<> · {t('已显示')} {items.length}</>}</>}</p><span>{t(filters.collection==='design-system'?'配色、字体与组件规范 · 与完整项目分开收录':'原始实现、项目来源与许可分别列明')}</span></div>
  {storageMessage&&<p className="explorer-storage" role="status">{storageMessage}</p>}
  <div className="design-grid" aria-busy={busy!=='idle'}>{items.map(entry=>{const origin=entry.creator||entry.source,facets={industries:entry.template?.industries||[],scenarios:entry.template?.scenarios||[],visualStyles:entry.template?.visualStyles||[]},labels=[...facets.industries.map(id=>REFERENCE_INDUSTRIES.find(item=>item.id===id)?.label),...facets.scenarios.map(id=>SCENARIOS.find(item=>item.id===id)?.label),...facets.visualStyles.map(id=>VISUAL_STYLES.find(item=>item.id===id)?.label)].filter(Boolean) as string[];return <article className="design-card" key={entry.slug} data-template-slug={entry.slug}>
   <a className="explorer-repository-link" href={entry.template?.kind==='design-system'?entry.source.url:entry.template?.repository||entry.source.url} target="_blank" rel="noopener noreferrer" aria-label={'GitHub · '+entry.title} title={t('原作者')+' · '+origin.name}>GitHub<Icon name="arrow"/></a><DesignPreviewCard entry={entry} onPreview={element=>{previewTrigger.current=element;setPreview(entry)}}/><div className="design-card-copy"><div className="design-card-meta"><span>{t(kindLabel(entry.template?.kind))}</span>{entry.license&&<a href={entry.license.url} target="_blank" rel="noopener noreferrer" aria-label={entry.license.name+' · '+t('使用许可')}>{entry.license.name} ↗</a>}</div><div className="explorer-card-title"><h2><Link prefetch={false} href={'/resources/designs/'+entry.slug}>{entry.title}</Link></h2><button type="button" onClick={()=>favorite(entry.slug)} aria-pressed={favorites.includes(entry.slug)} aria-label={(favorites.includes(entry.slug)?t('取消收藏'):t('收藏'))+' · '+entry.title}><Icon name="heart"/></button></div><p>{entry.summary}</p><ul className="explorer-card-facets" aria-label={t('资源分类')}>{labels.map(label=><li key={label}>{t(label)}</li>)}</ul>{entry.template?.previewNote&&<div className="explorer-preview-note">{entry.previewPolicy==='external-only'?t('在线演示暂不可用，可查看界面截图。'):entry.template.previewNote}</div>}{!!entry.template?.stack?.length&&<ul className="explorer-stack" aria-label={t('技术栈')}>{entry.template.stack.slice(0,4).map(item=><li key={item}>{item}</li>)}</ul>}<div className="design-card-actions"><Link prefetch={false} href={'/resources/designs/'+entry.slug}>{t('模板详情')}</Link><a href={entry.previewPolicy==='external-only'?entry.template?.repository||entry.source.url:entry.websiteUrl||entry.previewUrl||entry.source.url} target="_blank" rel="noopener noreferrer">{t(entry.previewPolicy==='external-only'?'获取源码':'打开演示')} ↗</a></div></div>
  </article>})}</div>
  {!waitingForFavorites&&!loading&&!error&&!items.length&&<div className="design-empty"><Icon name="search"/><h2>{t(filters.favorites==='1'&&!favorites.length?'还没有收藏的模板':'没有匹配这些条件的模板')}</h2><p>{t('试试减少筛选条件，或从全部模板开始浏览。')}</p><button type="button" onClick={()=>update(empty)}>{t('浏览全部资源')}</button></div>}
  {items.length>0&&<div className="explorer-scroll-status" ref={sentinel} role="status" aria-live="polite">{busy==='more'?t('加载中…'):hasMore?t('继续向下浏览，更多模板会自动出现。'):t('已显示全部匹配模板。')}{manualLoad&&hasMore&&!error&&<button type="button" disabled={busy!=='idle'} onClick={()=>void run(page.nextCursor,true)}>{t('继续加载')}</button>}</div>}
  {error&&<div className="explorer-storage" role="alert">{error} <button type="button" className="explorer-reset" onClick={()=>void run(failedCursor.current,!!failedCursor.current)}>{t('重新加载')}</button></div>}
  <details className="design-origin-guide" id="design-source-guide"><summary>{t('这些资源如何收录？')}</summary><div className="explorer-source-columns"><div><h3>{t('完整开源项目')}</h3><p>{t('从原作者 GitHub 仓库收录不同风格的完整项目，包含仪表盘、文档、博客、作品集和品牌网站。每项保留原作者、原仓库、实际演示和对应许可；早期项目发现线索来自 StyleKit。')}</p><a href="https://www.stylekit.top/zh/templates" target="_blank" rel="noopener noreferrer">{t('查看收录线索')} ↗</a></div><div><h3>{t('设计规范预览')}</h3><p>{t('54 项 VoltAgent MIT 示例作为设计规范预览单独收录，保留原项目与许可。这些示例呈现设计规则和组件，不标为完整应用；58 项未确认开放许可的示例不在本目录收录。')}</p><a href="https://github.com/VoltAgent/awesome-design-md/tree/f6f44a9159d09e13fa0b5d3d9f15c20a9fbb3be1/design-md" target="_blank" rel="noopener noreferrer">{t('查看原项目')} ↗</a></div></div><p>{t('VibeUI 的 112 项均已追溯上游：54 项依据 MIT 收录，58 项尚未找到明确许可，暂不导入。')} <a href="/catalog-audits/vibeui-112.json" target="_blank" rel="noopener noreferrer">{t('查看逐项来源与许可清单')} ↗</a></p><p>{t('收录依据实际文件与许可；图片、字体和商标的使用条件请同时查看项目说明。')}</p></details>
  {preview&&<DesignPreviewDialog key={preview.slug} entry={preview} returnFocus={previewTrigger.current} onClose={()=>setPreview(null)}/>}
 </section>;
}
