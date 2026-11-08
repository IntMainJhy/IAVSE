import Link from 'next/link';
import {notFound} from 'next/navigation';
import {serverI18n} from '@/lib/server-i18n';
import {readPublishedDesigns} from '@/lib/design-intake.mjs';
import {DesignCatalogExplorer} from './DesignCatalogExplorer';
import type {DesignEntry} from '@/lib/design-types';
import {DesignCopy} from './DesignCopy';
import {DesignText} from './DesignText';
import {DesignQuickPreview,type DesignPreviewItem} from './DesignQuickPreview';
import '@/app/design-library.css';
import '@/app/design-directory.css';
import '@/app/template-library.css';

const previewItem=(entry:DesignEntry):DesignPreviewItem=>({slug:entry.slug,title:entry.title,image:entry.image,external:entry.external,previewUrl:entry.previewUrl,previewVariants:entry.previewVariants,websiteUrl:entry.websiteUrl,source:entry.source,collection:entry.collection,preview:entry.preview,palette:entry.palette,creator:entry.creator,referenceSite:entry.referenceSite,production:entry.production,previewPolicy:entry.previewPolicy,template:entry.template,license:entry.license});
export async function DesignLibrary({query={}}:{query?:Record<string,string|string[]|undefined>}){
 void query;
 const entries=(readPublishedDesigns() as DesignEntry[]).map(entry=>({...previewItem(entry),id:entry.id,summary:entry.summary,category:entry.category,tags:entry.tags}));
 return <DesignCatalogExplorer entries={entries}/>;
}

export async function DesignDetail({slug}:{slug:string}){
 const {t}=await serverI18n(),entry=(readPublishedDesigns() as DesignEntry[]).find(item=>item.slug===slug);if(!entry)notFound();
 const template=entry.template,author=entry.creator||entry.source;
 const full='# '+entry.title+'\n\n'+entry.prompt+'\n\n'+entry.specification+'\n\n来源：'+entry.source.url+'\n许可：'+(entry.license?.name||'')+' '+(entry.license?.url||'');
 return <article className="design-studio design-detail template-detail">
  <Link className="design-back" href="/resources?type=designs">← {t('返回网站模板库')}</Link>
  <header className="design-detail-heading"><div><p className="template-kind">{t(template?.kind==='project'?'完整开源项目':template?.kind==='page'?'开源页面模板':'设计规范预览')}</p><h1>{entry.title}</h1><p>{entry.summary}</p><div className="design-card-tags">{entry.tags.map(tag=><span key={tag}>{tag}</span>)}</div></div><div className="design-detail-actions">{entry.previewPolicy!=='external-only'&&<a className="design-experience-link" href={entry.websiteUrl||entry.source.url} target="_blank" rel="noopener noreferrer">{t(template?.kind==='design-system'?'打开规范预览':'打开网站预览')} ↗</a>}<a href={template?.repository||entry.source.url} target="_blank" rel="noopener noreferrer">GitHub {t('完整源码')} ↗</a>{template?.downloadUrl&&<a href={template.downloadUrl} target="_blank" rel="noopener noreferrer">{t('下载原始模板')} ↗</a>}</div></header>
  <div className="template-preview-section"><DesignQuickPreview entry={previewItem(entry)}/><div><h2>{t('先看实际页面，再开始使用。')}</h2><p>{template?.previewNote||t(template?.kind==='design-system'?'这里展示配色、字体、间距与组件规范，不是品牌官方网站或可部署的完整业务系统。':'点击封面打开完整预览。代码、使用方法与许可均链接到原项目。')}</p>{template?.features?.length&&<ul>{template.features.map(feature=><li key={feature}>{feature}</li>)}</ul>}{template?.upstreamDemoUrl&&<a href={template.upstreamDemoUrl} target="_blank" rel="noopener noreferrer">{t(entry.previewPolicy==='external-only'?'原作者演示（暂不可用）':'访问原作者演示')} ↗</a>}</div></div>
  <div className="design-detail-layout"><aside><h2>{t('项目来源')}</h2><p>{t('作者 / 维护者')}</p><a href={author.url} target="_blank" rel="noopener noreferrer">{author.name} ↗</a><p>{t('原始仓库')}</p><a href={template?.repository||entry.source.url} target="_blank" rel="noopener noreferrer">{(template?.repository||entry.source.url).replace('https://github.com/','')} ↗</a>{template?.sourcePath&&<><p>{t('源文件位置')}</p><a href={entry.source.url} target="_blank" rel="noopener noreferrer">{template.sourcePath} ↗</a></>}{entry.license&&<><p>{t('开源许可')}</p><a href={entry.license.url} target="_blank" rel="noopener noreferrer">{entry.license.name} ↗</a></>}{entry.collection&&<><p>{t('发现于')}</p><a href={entry.collection.url} target="_blank" rel="noopener noreferrer">{entry.collection.name} ↗</a></>}{template?.stack?.length&&<><p>{t('技术栈')}</p><strong>{template.stack.join(' · ')}</strong></>}{entry.referenceSite&&<><p>{t('设计参考网站')}</p><a href={entry.referenceSite.url} target="_blank" rel="noopener noreferrer">{entry.referenceSite.name} ↗</a></>}{!!entry.palette.length&&<><p>{t('配色')}</p><ul className="design-palette">{entry.palette.map((color,index)=><li key={index}><span style={{background:color}}/><code>{color}</code></li>)}</ul></>}</aside>
   <div>{entry.provenance&&<section className="design-source-note"><h2>{t('来源与使用说明')}</h2><p>{entry.provenance.note}</p><a href={entry.provenance.evidenceUrl} target="_blank" rel="noopener noreferrer">{t('查看原始来源')} ↗</a></section>}
    {entry.prompt&&<section id="design-prompt"><div className="design-section-heading"><h2>{t('设计提示词')}</h2><DesignCopy text={entry.prompt}/></div><pre className="design-prompt-text">{entry.prompt}</pre></section>}
    {entry.specification&&<section id="design-specification"><div className="design-section-heading"><h2>{t('设计与使用文档')}</h2><DesignCopy text={full} label={t('复制完整说明')} filename={entry.slug+'-DESIGN.md'}/></div><DesignText text={entry.specification}/></section>}
    {!entry.prompt&&!entry.specification&&<section className="design-source-note"><h2>{t('从原项目开始')}</h2><p>{t('安装、内容配置与部署方法以仓库 README 为准。使用时保留原作者版权及许可声明；示例中的个人资料、商标与图片请按原项目说明处理。')}</p><a href={template?.repository||entry.source.url} target="_blank" rel="noopener noreferrer">{t('阅读项目文档')} ↗</a></section>}
   </div>
  </div>
 </article>;
}
