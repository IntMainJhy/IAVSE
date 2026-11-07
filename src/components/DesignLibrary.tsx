import Link from 'next/link';
import Form from 'next/form';
import {notFound} from 'next/navigation';
import {serverI18n} from '@/lib/server-i18n';
import {readPublishedDesigns} from '@/lib/design-intake.mjs';
import {filterDesignEntries} from '@/lib/design-search.mjs';
import {designCategories,designCategory,designCollection,designPage} from '@/lib/design-catalog.mjs';
import type {DesignEntry} from '@/lib/design-types';
import {CatalogSearch} from './CatalogSearch';
import {CatalogNavigation} from './CatalogNavigation';
import {DesignCopy} from './DesignCopy';
import {DesignText} from './DesignText';
import {DesignQuickPreview,type DesignPreviewItem} from './DesignQuickPreview';
import '@/app/design-library.css';
import '@/app/design-directory.css';

const maker=(entry:DesignEntry)=>entry.creator||(entry.external?entry.source:{name:'IAVSE',url:'https://github.com/IntMainJhy/IAVSE'});
const reference=(entry:DesignEntry)=>entry.referenceSite||(!entry.external?entry.source:undefined);
const previewItem=(entry:DesignEntry):DesignPreviewItem=>({slug:entry.slug,title:entry.title,image:entry.image,external:entry.external,previewUrl:entry.previewUrl,previewVariants:entry.previewVariants,websiteUrl:entry.websiteUrl,source:entry.source,collection:entry.collection,preview:entry.preview,palette:entry.palette,creator:maker(entry),referenceSite:reference(entry),production:entry.production,previewPolicy:entry.previewPolicy});
const collections=[{id:'iavse',name:'IAVSE'},{id:'vibeui',name:'VibeUI'},{id:'stylekit',name:'StyleKit'}];
const value=(query:Record<string,string|string[]|undefined>,key:string)=>String(query[key]||'').trim();

export async function DesignLibrary({query={}}:{query?:Record<string,string|string[]|undefined>}){
 const {t}=await serverI18n(),all=readPublishedDesigns() as DesignEntry[];
 const q=value(query,'q'),category=value(query,'category'),collection=value(query,'collection');
 const filtered=filterDesignEntries(all,{q,category,collection}),{items,page,pages,total}=designPage(filtered,{page:Number(value(query,'page'))});
 const href=(changes:Record<string,string>={})=>'/resources?'+new URLSearchParams({type:'designs',...(q?{q}:{}),...(category?{category}:{}),...(collection?{collection}:{}),...changes});
 const group=collection?all.filter(entry=>designCollection(entry)===collection):all;
 return <section className="design-studio design-directory" id="design-directory">
  <header className="design-library-heading"><div><h1>{t('设计，从这里开始。')}</h1><p>{t('浏览风格，放大细节，走进真实的网站。')}</p></div><Link href="/docs/iavse-design-system">{t('IAVSE 设计方法')} ↗</Link></header>
  <CatalogNavigation active={collection} className="design-collection-tabs" label={t('收录目录')}><Link href={href({collection:''})} scroll={false} aria-current={!collection?'page':undefined}>{t('全部来源')} <span>{all.length}</span></Link>{collections.map(source=><Link key={source.id} href={href({collection:source.id})} scroll={false} aria-current={collection===source.id?'page':undefined}>{source.name} <span>{all.filter(entry=>designCollection(entry)===source.id).length}</span></Link>)}</CatalogNavigation>
  <div className="design-filter">
   <CatalogNavigation active={category} label={t('设计分类')} className="design-category-tabs"><Link href={href({category:''})} scroll={false} aria-current={!category?'page':undefined}>{t('全部')} <span>{group.length}</span></Link>{designCategories.map((name:string)=><Link key={name} href={href({category:name})} scroll={false} aria-current={category===name?'page':undefined}>{t(name)} <span>{group.filter(entry=>designCategory(entry)===name).length}</span></Link>)}</CatalogNavigation>
   <Form action="/resources" scroll={false} role="search"><input type="hidden" name="type" value="designs"/>{category&&<input type="hidden" name="category" value={category}/>} {collection&&<input type="hidden" name="collection" value={collection}/>}<CatalogSearch value={q} label={t('搜索 UI 设计')} placeholder={t('名称、来源或风格')}/></Form>
  </div>
  <div className="design-directory-meta"><p className="design-result" role="status">{total} {t('个设计')}{total>0&&<> · {(page-1)*36+1}–{Math.min(page*36,total)}</>}</p><span>{t('分类参考 VibeUI · 来源逐项标注')}</span></div>
  <details className="design-origin-guide"><summary>{t('这些示例是谁制作的？')}</summary><p>{t('VibeUI 是收录入口：品牌示例来自 VoltAgent 项目，由官网设计规范生成；另有第三方生成模板。StyleKit 的展示页由其开源仓库维护，部分参考既有品牌和艺术风格。它们不等于品牌官方模板，也不意味着风格由收录站首创。')}</p><p>{t('每项分别标注示例项目、风格参考和收录平台。许可未明确的条目仅保留目录与原站链接，不在本站嵌入或复制其示例。')}</p></details>
  <div className="design-grid">{items.map((entry:DesignEntry)=><article className="design-card" key={entry.id}>
   <DesignQuickPreview entry={previewItem(entry)}/>
   <div className="design-card-copy"><div className="design-card-meta"><span>{t(designCategory(entry))}</span><span>{entry.collection?.name||'IAVSE'}</span></div>
    <h2><Link href={'/resources/designs/'+entry.slug}>{entry.title}</Link></h2><p>{entry.summary}</p>
    <div className="design-swatches" aria-label={t('设计配色')}>{entry.palette.slice(0,5).map((color,index)=><span key={index} style={{background:color}} title={color}/>)}</div>
    <a className="design-card-source" href={maker(entry).url} target="_blank" rel="noopener noreferrer" title={maker(entry).name}>{t('示例项目')} · {maker(entry).name} ↗</a>
    {reference(entry)&&<a className="design-card-source" href={reference(entry)!.url} target="_blank" rel="noopener noreferrer">{t('风格参考')} · {reference(entry)!.name} ↗</a>}
    <div className="design-card-actions"><Link href={'/resources/designs/'+entry.slug}>{t('设计详情')}</Link><a href={entry.websiteUrl||entry.source.url} target="_blank" rel="noopener noreferrer">{t('进入体验')} ↗</a></div>
   </div>
  </article>)}</div>
  {!items.length&&<div className="design-empty"><h2>{t('还没有匹配的设计')}</h2><p>{t('换一个关键词，或浏览全部风格。')}</p><Link href="/resources?type=designs">{t('清除筛选')}</Link></div>}
  {pages>1&&<nav className="design-pagination" aria-label={t('设计目录分页')}>{page>1?<Link href={href({page:String(page-1)})+'#design-directory'}>{t('上一页')}</Link>:<span aria-disabled="true">{t('上一页')}</span>}<span>{page} / {pages}</span>{page<pages?<Link href={href({page:String(page+1)})+'#design-directory'}>{t('下一页')}</Link>:<span aria-disabled="true">{t('下一页')}</span>}</nav>}
  <p className="design-attribution">{t('仓库许可只覆盖相应权利人有权授权的部分，不替代品牌商标、图片、字体等素材的独立许可。来源核查不构成无侵权保证。')}</p>
 </section>;
}

export async function DesignDetail({slug}:{slug:string}){
 const {t}=await serverI18n(),entry=(readPublishedDesigns() as DesignEntry[]).find(item=>item.slug===slug);if(!entry)notFound();
 const preview='/resources/designs/'+entry.slug+'/preview',full='# '+entry.title+'\n\n'+entry.prompt+'\n\n'+entry.specification+'\n\n来源：'+entry.source.name+' '+entry.source.url+(entry.collection?'\n收录自：'+entry.collection.name+' '+entry.collection.url:'')+(entry.license?'\n许可：'+entry.license.name+' '+entry.license.url:'');
 return <article className="design-studio design-detail"><Link className="design-back" href="/resources?type=designs">← {t('返回 UI 设计库')}</Link>
  <header className="design-detail-heading"><div><h1>{entry.title}</h1><p>{entry.summary}</p><div className="design-card-tags">{entry.tags.map(tag=><span key={tag}>{tag}</span>)}</div></div><div className="design-detail-actions">{(entry.prompt||entry.specification)&&<DesignCopy text={full} label={t('复制完整提示词与规范')} filename={entry.slug+'-DESIGN.md'}/>}<a className="design-experience-link" href={entry.websiteUrl||entry.source.url} target="_blank" rel="noopener noreferrer">{t('进入真实网站')} ↗</a>{entry.previewUrl&&entry.previewUrl!==entry.websiteUrl&&<a href={entry.previewUrl} target="_blank" rel="noopener noreferrer">{t('打开演示页面')} ↗</a>}</div></header>
  {entry.external?<div className="design-detail-art"><DesignQuickPreview entry={previewItem(entry)}/></div>:<div className="design-preview-shell"><iframe src={preview} title={entry.title+'交互预览'} loading="lazy" sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"/><div><span>{t('可交互预览 · 支持切换主题与示例操作')}</span><a href={preview} target="_blank" rel="noopener noreferrer">{t('新窗口预览')} ↗</a></div></div>}
  <div className="design-detail-layout"><aside><h2>{t('设计信息')}</h2><p>{t('示例项目')}</p><a href={maker(entry).url} target="_blank" rel="noopener noreferrer">{maker(entry).name} ↗</a>{reference(entry)&&<><p>{t('风格参考')}</p><a href={reference(entry)!.url} target="_blank" rel="noopener noreferrer">{reference(entry)!.name} ↗</a></>}{entry.external&&<><p>{t('源文件或页面')}</p><a href={entry.source.url} target="_blank" rel="noopener noreferrer">{entry.source.name} ↗</a></>}{entry.collection&&<><p>{t('收录平台')}</p><a href={entry.collection.url} target="_blank" rel="noopener noreferrer">{entry.collection.name} ↗</a></>}{entry.license&&<><p>{t('仓库声明许可')}</p>{entry.license.url?<a href={entry.license.url} target="_blank" rel="noopener noreferrer">{entry.license.name} ↗</a>:<span>{entry.license.name}</span>}</>}
   {!!entry.referenceUrls?.length&&<><p>{t('品牌与设计参考')}</p><ul className="design-reference-list">{entry.referenceUrls.map((ref,index)=>{const url=typeof ref==='string'?ref:ref.url,name=typeof ref==='string'?new URL(ref).hostname:ref.name;return <li key={index}><a href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a></li>})}</ul></>}
   <p>{t('配色')}</p><ul className="design-palette">{entry.palette.map(color=><li key={color}><span style={{background:color}}/><code>{color}</code></li>)}</ul><p>{t('适用场景')}</p><strong>{t(designCategory(entry))}</strong><p>{t('预览说明')}</p><span>{t(entry.previewPolicy==='external-only'?'未确认开放许可；本站仅提供原站链接。':entry.external?'第三方项目的示例，非 IAVSE 原创。':'本站原创示例，用于理解风格；并非原网站的截图或官方模板。')}</span>
  </aside><div>{entry.provenance&&<section className="design-source-note"><h2>{t('示例性质与使用范围')}</h2>{entry.production&&<p><strong>{entry.production}</strong></p>}<p>{entry.provenance.note}</p><p>{t('仓库许可只覆盖相应权利人有权授权的部分，不替代品牌商标、图片、字体等素材的独立许可。来源核查不构成无侵权保证。')}</p><a href={entry.provenance.evidenceUrl} target="_blank" rel="noopener noreferrer">{t('查看来源记录')} ↗</a></section>}
   {entry.prompt&&<section id="design-prompt"><div className="design-section-heading"><h2>{t('把风格带进你的项目。')}</h2><DesignCopy text={entry.prompt}/></div><p className="design-help">{t('复制后，把你的产品名称、内容和目标用户补充给 AI 编程工具。')}</p><pre className="design-prompt-text">{entry.prompt}</pre></section>}
   {entry.specification&&<section id="design-specification"><div className="design-section-heading"><h2>{t('设计规范')}</h2><DesignCopy text={entry.specification} label={t('复制设计规范')}/></div><DesignText text={entry.specification}/></section>}
   {!entry.prompt&&!entry.specification&&<section className="design-source-note"><h2>{t('继续探索这个设计')}</h2><p>{t('完整演示与使用说明保留在原作者的网站，点击下方链接查看。')}</p><a href={entry.websiteUrl||entry.source.url} target="_blank" rel="noopener noreferrer">{t('进入体验')} ↗</a></section>}
  </div></div>
 </article>;
}
