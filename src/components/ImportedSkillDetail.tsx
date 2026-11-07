import Link from 'next/link';
import {serverI18n} from '@/lib/server-i18n';
import {skillCategories,skillFilters,skillFilterHref} from '@/lib/skill-catalog.mjs';
import {skillCollectionFilter,skillCollections} from '@/lib/skill-import-directory.mjs';
import {SkillCopyBlock} from './SkillInstallation';
import {Icon} from './Icons';

export async function ImportedSkillDetail({skill,query}:{skill:Record<string,any>;query:Record<string,string|string[]|undefined>}){
 const {t}=await serverI18n(),{category,q,tool}=skillFilters(query),collection=skillCollectionFilter(query);
 const back=skillFilterHref(category,q,tool,collection,Math.max(1,Number(query.page)||1)),type=skillCategories.find(item=>item.id===skill.category),sources=skillCollections(skill);
 const installable=skill.installCommand&&skill.licenseStatus==='verified';
 return <article className="skills-page skill-detail">
  <Link className="learning-back" href={back}>← {t('返回 Skill 目录')}</Link>
  <header className="learning-heading"><h1>{skill.name}</h1><p>{skill.summary}</p><div className="skill-detail-meta"><span>{t(type?.label||'Skill')}</span><span>{skill.repo}</span><span>{t('资料核对：{0}',[skill.provenance?.verifiedAt||skill.verifiedAt||''])}</span></div><div className="space-actions"><a className="space-btn primary" href={skill.sourceUrl} target="_blank" rel="noopener noreferrer">{t('查看原始 Skill')}<Icon name="link"/></a>{skill.installUrl&&<a className="space-link" href={skill.installUrl} target="_blank" rel="noopener noreferrer">{t('查看上游说明')} ↗</a>}</div></header>
  <div className="skill-detail-layout"><aside className="skill-detail-nav"><nav aria-label={t('详情页目录')}><a href="#source">{t('来源与许可')}</a><a href="#installation">{t('安装与使用')}</a><a href="#collection">{t('收录记录')}</a></nav></aside><div className="skill-detail-body">
   <section id="source"><h2>{t('来源与许可')}</h2><p className="skill-import-note">{skill.provenance?.note||t('此处提供用途索引；完整定义与使用条款由上游项目维护。')}</p><dl className="skill-audit-facts">
    <dt>{t('上游项目')}</dt><dd><a href={'https://github.com/'+skill.repo} target="_blank" rel="noopener noreferrer">{skill.repo} ↗</a></dd>
    <dt>{t('Skill 定义')}</dt><dd><a href={skill.sourceUrl} target="_blank" rel="noopener noreferrer">{skill.skillFile||(skill.kind==='collection'?'README.md':skill.path)||'SKILL.md'} ↗</a></dd>
    <dt>{t('仓库声明许可')}</dt><dd>{skill.licenseUrl?<a href={skill.licenseUrl} target="_blank" rel="noopener noreferrer">{skill.license} ↗</a>:skill.license||t('未确认开放许可')}{skill.licenseNote&&<p className="learning-muted">{skill.licenseNote}</p>}</dd>
    <dt>{t('本站收录内容')}</dt><dd>{t('独立编写的用途摘要、来源链接与核查记录；不包含第三方 Skill 源码包。')}</dd>
   </dl>{skill.provenance?.evidenceUrl&&<a className="space-link" href={skill.provenance.evidenceUrl} target="_blank" rel="noopener noreferrer">{t('查看核查依据')} ↗</a>}<p className="learning-muted">{t('项目声明的许可不自动覆盖其引用的模型、软件、字体、图片或其他第三方材料；具体使用须遵循各自条款。')}</p></section>
   <section id="installation"><h2>{t('安装与使用')}</h2>{installable?<><SkillCopyBlock text={skill.installCommand} title={t('上游公开的安装命令')} copyLabel={t('复制命令')} copyAriaLabel={t('复制安装命令')}/><p>{t('这是上游文档中的命令，本站未执行。安装前请阅读原项目说明并确认依赖及操作范围。')}</p></>:<p>{t('请到原项目核对当前安装方法、依赖和支持工具。未确认开放许可的条目仅作目录索引。')}</p>}{skill.installUrl&&<a className="space-link" href={skill.installUrl} target="_blank" rel="noopener noreferrer">{t('核对官方安装说明')} ↗</a>}{skill.tools?.length>0&&<><h3>{t('文档提及的工具')}</h3><ul className="skill-tool-badges">{skill.tools.map((item:{id:string;label:string})=><li key={item.id}>{item.label}</li>)}</ul></>}</section>
   <section className="skill-detail-source" id="collection"><h2>{t('收录记录')}</h2><ul className="skill-collection-records">{sources.map((source:{name:string;url:string})=><li key={source.name}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name} ↗</a></li>)}</ul><p>{t('收录平台是发现入口；Skill 的定义、维护者及许可以上游项目为准。同一个 Skill 的重复收录已合并。')}</p></section>
  </div></div>
 </article>;
}
