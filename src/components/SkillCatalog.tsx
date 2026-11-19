import {readRequestSkills} from '@/lib/request-catalog';
import type {ReactNode} from 'react';
import Link from 'next/link';
import {skillAiTools,skillCategories,skillFilters,skillFilterHref} from '@/lib/skill-catalog.mjs';
import {filterPublicSkills} from '@/lib/catalog-public-skills.mjs';
import {skillCollectionFilter,skillPage} from '@/lib/skill-import-directory.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {FeaturedPicks} from './FeaturedPicks';
import {skillPick} from '@/lib/creator-picks.mjs';
import {DirectoryFacet} from './DirectoryFacet';
import {CatalogNavigation} from './CatalogNavigation';
import {SkillDirectoryCard} from './SkillDirectoryCard';
import '@/app/catalog-collection.css';
import '@/app/skill-directory-grid.css';
import '@/app/design-library.css';
import '@/app/design-directory.css';
import '@/app/design-catalog-explorer.css';
import '@/app/skill-explorer.css';

export async function SkillCatalog({query={},children}:{query?:Record<string,string|string[]|undefined>;children?:ReactNode}){
 const {t}=await serverI18n(),{category,q,tool}=skillFilters(query),collection=skillCollectionFilter(query),catalog=readRequestSkills(),results=filterPublicSkills(catalog,{category,q,tool,collection},t);
 const {items,page,pages}=skillPage(results,Number(query.page)),href=(nextCategory=category,nextTool=tool,nextCollection=collection,nextPage=1)=>skillFilterHref(nextCategory,q,nextTool,nextCollection,nextPage);
 const recommendations=results.filter(skill=>skill.featured&&skill.recommendation).sort((a,b)=>(a.featuredRank??100)-(b.featuredRank??100)).slice(0,4);
 const categoryScope=filterPublicSkills(catalog,{q,tool,collection},t),toolScope=filterPublicSkills(catalog,{category,q,collection},t);
 const toolOptions=[{id:'all',label:'全部 AI 工具',count:toolScope.length},...skillAiTools.map(item=>({...item,count:toolScope.filter(skill=>skill.tools.some(supported=>supported.id===item.id)).length}))];
 return <section className="skill-directory skill-explorer design-studio design-directory design-explorer" aria-label={t('GitHub Skill 目录')}>
  <div className="directory-toolbar">
   <DirectoryFacet label={t('按 AI 工具筛选')}>
    <CatalogNavigation active={tool} className="skill-filter-options" label={t('按 AI 工具筛选')}>{toolOptions.map(option=><Link prefetch={false} key={option.id} href={href(category,option.id)} scroll={false} aria-current={tool===option.id?'page':undefined}>{t(option.label)}<span>{option.count}</span></Link>)}</CatalogNavigation>
   </DirectoryFacet>
   <DirectoryFacet label={t('Skill 类型')}>
    <CatalogNavigation active={category} className="skill-filter-options" label={t('Skill 类型')}><Link prefetch={false} href={href('all')} scroll={false} aria-current={category==='all'?'page':undefined}>{t('全部类型')}<span>{categoryScope.length}</span></Link>
    {skillCategories.map(type=><Link prefetch={false} key={type.id} href={href(type.id)} scroll={false} aria-current={category===type.id?'page':undefined}>{t(type.label)}<span>{categoryScope.filter(item=>item.category===type.id).length}</span></Link>)}</CatalogNavigation>
   </DirectoryFacet>
  </div>
  <div className="skill-directory-results">{page===1&&recommendations.length>0&&<FeaturedPicks title={t('正在用的 Skills')} groups={[{id:'skills',label:'正在用的 Skills',items:recommendations.map(skillPick)}]}/>}<div className="skill-results-heading"><p role="status">{t('找到 {0} 项 Skill',[results.length])}{results.length>0&&<> · {(page-1)*36+1}–{Math.min(page*36,results.length)}</>}{q&&<> · “{q}”</>}{tool!=='all'&&<> · {skillAiTools.find(item=>item.id===tool)?.label}</>}</p>{(q||category!=='all'||tool!=='all'||collection!=='all')&&<Link prefetch={false} href="/skills" scroll={false}>{t('清除筛选')}</Link>}</div>
   {results.length?<ul className="skill-list skill-results-grid skill-tool-grid">{items.map(skill=>{const detailHref=href(category,tool,collection,page).replace('/skills','/skills/'+skill.slug),type=skillCategories.find(item=>item.id===skill.category);return <SkillDirectoryCard key={skill.id} skill={skill} href={detailHref} categoryLabel={type?t(type.label):skill.category} selectedTool={tool} t={t}/>})}</ul>:<div className="skill-empty"><h2>{t('目录中没有匹配的 Skill')}</h2><p>{t('试试 GSAP、设计、React 或 Obsidian，也可以清除筛选查看全部。')}</p><Link className="space-btn" href="/skills">{t('查看全部 Skill')}</Link></div>}
   {pages>1&&<nav className="skill-pagination" aria-label={t('Skill 目录分页')}>{page>1?<Link prefetch={false} href={href(category,tool,collection,page-1)}>{t('上一页')}</Link>:<span aria-disabled="true">{t('上一页')}</span>}<span>{page} / {pages}</span>{page<pages?<Link prefetch={false} href={href(category,tool,collection,page+1)}>{t('下一页')}</Link>:<span aria-disabled="true">{t('下一页')}</span>}</nav>}
   {children}
   <div className="skill-catalog-note"><p>{t('工具标签对应本站已整理的安装方式；更多兼容性请查看详情或原项目。')}</p><p>{t('按具体 Skill 定义核对来源并合并重复收录；普通模板不计作独立 Skill。普通条目提供原创用途摘要和上游链接；站长精选的四个 Skill 另附保留原始许可的完整下载包。')}</p><p>{t('这里只做用途索引与安装指引。第三方 Skill 和其调用的软件、图片、模型服务分别适用原作者的许可。')}</p></div>
  </div>
 </section>;
}
