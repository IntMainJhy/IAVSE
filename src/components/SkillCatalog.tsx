import type {ReactNode} from 'react';
import Link from 'next/link';
import Form from 'next/form';
import {skillAiTools,skillCategories,skillFilters,skillFilterHref} from '@/lib/skill-catalog.mjs';
import {readPublicSkills,filterPublicSkills} from '@/lib/catalog-public-skills.mjs';
import {skillCollections,skillCollectionIds,skillCollectionFilter,skillPage} from '@/lib/skill-import-directory.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {Icon} from './Icons';
import {CatalogSearch} from './CatalogSearch';
import {CatalogNavigation} from './CatalogNavigation';
import '@/app/skill-directory-grid.css';

export async function SkillCatalog({query={},children}:{query?:Record<string,string|string[]|undefined>;children?:ReactNode}){
 const {t}=await serverI18n(),{category,q,tool}=skillFilters(query),collection=skillCollectionFilter(query),catalog=readPublicSkills(),results=filterPublicSkills(catalog,{category,q,tool,collection},t);
 const {items,page,pages}=skillPage(results,Number(query.page)),href=(nextCategory=category,nextTool=tool,nextCollection=collection,nextPage=1)=>skillFilterHref(nextCategory,q,nextTool,nextCollection,nextPage);
 const collections=[{id:'all',name:'全部来源'},{id:'iavse',name:'IAVSE'},{id:'vibeui',name:'VibeUI'},{id:'stylekit',name:'StyleKit'}];
 const recommendations=results.filter(skill=>skill.featured&&skill.recommendation).slice(0,3);
 const categoryScope=filterPublicSkills(catalog,{q,tool,collection},t),toolScope=filterPublicSkills(catalog,{category,q,collection},t);
 const toolOptions=[{id:'all',label:'全部 AI 工具',count:toolScope.length},...skillAiTools.map(item=>({...item,count:toolScope.filter(skill=>skill.tools.some(supported=>supported.id===item.id)).length}))];
 return <section className="skill-directory skill-directory-cards skill-directory-flat" aria-label={t('GitHub Skill 目录')}>
  <div className="skill-directory-toolbar"><p className="skill-catalog-meta">{t('收录 {0} 项',[catalog.length])} · {t('来源与核对日期见详情')}</p><Form action="/skills" scroll={false} className="skill-filter-form" role="search">
   {category!=='all'&&<input type="hidden" name="type" value={category}/>}
   {tool!=='all'&&<input type="hidden" name="tool" value={tool}/>}
   {collection!=='all'&&<input type="hidden" name="collection" value={collection}/>}
   <CatalogSearch value={q} label={t('搜索 Skill 名称、用途或技术')} placeholder={t('搜索名称、用途或技术…')} maxLength={120}/>
  </Form></div>
  <div className="skill-filter-deck">
  <div className="skill-filter-row"><span>{t('收录平台')}</span><CatalogNavigation active={collection} className="skill-filter-options" label={t('收录平台')}>{collections.map(source=><Link key={source.id} href={href(category,tool,source.id)} scroll={false} aria-current={collection===source.id?'page':undefined}>{t(source.name)}<span>{source.id==='all'?catalog.length:catalog.filter(skill=>skillCollectionIds(skill).some(id=>id===source.id)).length}</span></Link>)}</CatalogNavigation></div>
  <div className="skill-filter-row"><span>{t('按 AI 工具筛选')}</span><CatalogNavigation active={tool} className="skill-filter-options" label={t('按 AI 工具筛选')}>{toolOptions.map(option=><Link key={option.id} href={href(category,option.id)} scroll={false} aria-current={tool===option.id?'page':undefined}>{t(option.label)}<span>{option.count}</span></Link>)}</CatalogNavigation></div>
  <div className="skill-filter-row"><span>{t('Skill 类型')}</span><CatalogNavigation active={category} className="skill-filter-options" label={t('Skill 类型')}>
   <Link href={href('all')} scroll={false} aria-current={category==='all'?'page':undefined}>{t('全部类型')}<span>{categoryScope.length}</span></Link>
   {skillCategories.map(type=><Link key={type.id} href={href(type.id)} scroll={false} aria-current={category===type.id?'page':undefined}>{t(type.label)}<span>{categoryScope.filter(item=>item.category===type.id).length}</span></Link>)}
  </CatalogNavigation></div></div>
  <div className="skill-directory-results">{page===1&&recommendations.length>0&&<section className="skill-task-recommendations" aria-label={t('按任务推荐')}><div><h2>{t('从你的任务开始。')}</h2><p>{t('根据适用场景选择，不按热度排名。')}</p></div><ul>{recommendations.map(skill=><li key={skill.id}><Link href={'/skills/'+skill.slug}><span>{skill.name}<Icon name="arrow"/></span><p>{t(skill.recommendation)}</p></Link></li>)}</ul></section>}<div className="skill-results-heading"><p role="status">{t('找到 {0} 项 Skill',[results.length])}{results.length>0&&<> · {(page-1)*36+1}–{Math.min(page*36,results.length)}</>}{q&&<> · “{q}”</>}{tool!=='all'&&<> · {skillAiTools.find(item=>item.id===tool)?.label}</>}</p>{(q||category!=='all'||tool!=='all'||collection!=='all')&&<Link href="/skills" scroll={false}>{t('清除筛选')}</Link>}</div>
   {results.length?<ul className="skill-list skill-results-grid">{items.map(skill=>{const detailHref=href(category,tool,collection,page).replace('/skills','/skills/'+skill.slug),type=skillCategories.find(item=>item.id===skill.category);return <li key={skill.id} className="skill-entry"><div className="skill-entry-copy"><span className="skill-entry-category">{type?t(type.label):skill.category}{skill.featured?' · '+t('精选'):''}</span><h3><Link href={detailHref}>{skill.name}</Link></h3><span className="skill-upstream">{skill.repo}</span>{skill.origin==='imported'&&<span className="skill-source-collection">{t('收录自')} {skillCollections(skill).map(source=>source.name).join(' · ')}</span>}<p>{t(skill.summary)}</p>{skill.recommendation&&<p className="skill-task-note"><strong>{t('适合任务')}</strong>{t(skill.recommendation)}</p>}{skill.tools.length>0&&<div className="skill-entry-tools"><span>{t('支持工具')}</span><ul className="skill-tool-badges" aria-label={t('支持的 AI 工具')}>{skill.tools.map(item=><li key={item.id} data-selected={item.id===tool?'true':undefined}>{item.label}</li>)}</ul></div>}<ul className="skill-tags" aria-label={t('适用技术')}>{skill.tags.map(tag=><li key={tag}>{tag}</li>)}</ul></div>
     <div className="skill-entry-links"><Link href={detailHref}>{t('查看详情')}<Icon name="link"/></Link><Link href={detailHref+(skill.origin==='imported'?'#source':'#installation')}>{t(skill.origin==='imported'?'来源与许可':'安装方法')}</Link>{skill.licenseUrl?<a className="skill-license" href={skill.licenseUrl} target="_blank" rel="noopener noreferrer" aria-label={t('{0} 的许可：{1}',[skill.name,t(skill.license)])}>{t(skill.license)}</a>:<span className="skill-license">{t(skill.license)}</span>}</div>
    </li>})}</ul>:<div className="skill-empty"><h2>{t('目录中没有匹配的 Skill')}</h2><p>{t('试试 GSAP、设计、React 或 Obsidian，也可以清除筛选查看全部。')}</p><Link className="space-btn" href="/skills">{t('查看全部 Skill')}</Link></div>}
   {pages>1&&<nav className="skill-pagination" aria-label={t('Skill 目录分页')}>{page>1?<Link href={href(category,tool,collection,page-1)}>{t('上一页')}</Link>:<span aria-disabled="true">{t('上一页')}</span>}<span>{page} / {pages}</span>{page<pages?<Link href={href(category,tool,collection,page+1)}>{t('下一页')}</Link>:<span aria-disabled="true">{t('下一页')}</span>}</nav>}
   {children}
   <div className="skill-catalog-note"><p>{t('工具标签对应本站已整理的安装方式；更多兼容性请查看详情或原项目。')}</p><p>{t('按具体 Skill 定义核对来源并合并重复收录；普通模板不计作独立 Skill。仅提供原创用途摘要和上游链接，不打包第三方源码。')}</p><p>{t('这里只做用途索引与安装指引。第三方 Skill 和其调用的软件、图片、模型服务分别适用原作者的许可。')}</p></div>
  </div>
 </section>;
}
