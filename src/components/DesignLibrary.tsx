import Link from 'next/link';
import {notFound} from 'next/navigation';
import {serverI18n} from '@/lib/server-i18n';
import {readPublishedDesigns} from '@/lib/design-intake.mjs';
import {designCategory} from '@/lib/design-catalog.mjs';
import {DesignCatalogExplorer} from './DesignCatalogExplorer';
import type {DesignEntry} from '@/lib/design-types';
import {DesignCopy} from './DesignCopy';
import {DesignText} from './DesignText';
import {DesignQuickPreview,type DesignPreviewItem} from './DesignQuickPreview';
import '@/app/design-library.css';
import '@/app/design-directory.css';
import {StudioComponentPrompts} from './StudioComponentPrompts';
import {WebsiteDesignFacts} from './WebsiteDesignFacts';

const maker=(entry:DesignEntry)=>entry.creator||(entry.external?entry.source:{name:'IAVSE',url:'https://github.com/IntMainJhy/IAVSE'});
const reference=(entry:DesignEntry)=>entry.referenceSite||(!entry.external&&!entry.studio?entry.source:undefined);
const previewItem=(entry:DesignEntry):DesignPreviewItem=>({studio:entry.studio,slug:entry.slug,title:entry.title,image:entry.image,external:entry.external,previewUrl:entry.previewUrl,previewVariants:entry.previewVariants,websiteUrl:entry.websiteUrl,source:entry.source,collection:entry.collection,preview:entry.preview,palette:entry.palette,creator:maker(entry),referenceSite:reference(entry),production:entry.production,previewPolicy:entry.previewPolicy});
export async function DesignLibrary({query={}}:{query?:Record<string,string|string[]|undefined>}){
 void query;
 const all=readPublishedDesigns() as DesignEntry[];
 const entries=all.map(entry=>({...previewItem(entry),id:entry.id,summary:entry.summary,category:entry.category,tags:entry.tags,studio:entry.studio?{kind:entry.studio.kind,websiteKey:entry.studio.websiteKey,referenceKey:entry.studio.referenceKey,sourceSlug:entry.studio.sourceSlug,scenarios:entry.studio.scenarios,styleType:entry.studio.styleType,tags:entry.studio.tags}:undefined}));
 return <DesignCatalogExplorer entries={entries}/>;
}

export async function DesignDetail({slug}:{slug:string}){
 const {t}=await serverI18n(),entry=(readPublishedDesigns() as DesignEntry[]).find(item=>item.slug===slug);if(!entry)notFound();
 const preview='/resources/designs/'+entry.slug+'/preview',full='# '+entry.title+'\n\n'+entry.prompt+'\n\n'+entry.specification+'\n\n来源：'+entry.source.name+' '+entry.source.url+(entry.collection?'\n收录自：'+entry.collection.name+' '+entry.collection.url:'')+(entry.license?'\n许可：'+entry.license.name+' '+entry.license.url:'');
 return <article className="design-studio design-detail"><Link className="design-back" href="/resources?type=designs">← {t('返回 UI 设计库')}</Link>
  <header className="design-detail-heading"><div><h1>{entry.title}</h1><p>{entry.summary}</p><div className="design-card-tags">{entry.tags.map(tag=><span key={tag}>{tag}</span>)}</div></div><div className="design-detail-actions">{(entry.prompt||entry.specification)&&<DesignCopy text={full} label={t('复制完整提示词与规范')} filename={entry.slug+'-DESIGN.md'}/>}<a className="design-experience-link" href={entry.websiteUrl||entry.source.url} target="_blank" rel="noopener noreferrer">{t(entry.studio?'进入演示网站':'进入真实网站')} ↗</a>{entry.previewUrl&&entry.previewUrl!==entry.websiteUrl&&<a href={entry.previewUrl} target="_blank" rel="noopener noreferrer">{t('打开演示页面')} ↗</a>}</div></header>
  {(entry.studio?.referenceKey||entry.studio?.websiteKey)&&<div className="studio-reference-evidence"><a href={entry.referenceSite?.url} target="_blank" rel="noopener noreferrer">{t('查看参考网站')} · {entry.referenceSite?.name} ↗</a><p>{t('页面按所列具体参考独立实现；示例数据在本地运行，未连接原站账号。')}</p><ul>{entry.studio.observations.map((item:string)=><li key={item}>{item}</li>)}</ul></div>}
  {entry.external?<div className="design-detail-art"><DesignQuickPreview entry={previewItem(entry)}/></div>:<div className="design-preview-shell"><iframe src={preview+'?embed=1'} title={entry.title+'交互预览'} loading="lazy" sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"/><div><span>{t(entry.studio?.websiteKey?'完整网站示例 · 支持实际操作与响应式布局':'可交互预览 · 支持示例操作')}</span><a href={preview} target="_blank" rel="noopener noreferrer">{t('新窗口预览')} ↗</a></div></div>}
  {entry.studio?.websiteKey&&<WebsiteDesignFacts entry={entry}/>}
  {entry.studio&&<StudioComponentPrompts key={entry.slug} entry={entry}/>}
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
