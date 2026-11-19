import Link from 'next/link';
import {Icon} from './Icons';

/** A small diagram of the task, rather than a repeated full-size category cover. */
function SkillMark({category}:{category:string}){
 return <span className="skill-card-mark" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
  {category==='design'?<><rect x="9" y="10" width="30" height="28" rx="5"/><path d="M9 19h30M17 25h14M17 30h8"/><circle className="skill-mark-accent" cx="34" cy="34" r="6"/></>:category==='motion'?<><circle cx="24" cy="24" r="15" strokeDasharray="3 5"/><path className="skill-mark-accent" d="m21 16 11 8-11 8z"/></>:category==='knowledge'?<><path d="M13 9h17l7 7v23H13zM30 9v8h7M19 24h12M19 30h8"/><path className="skill-mark-accent" d="m9 15-3 2v24h24l2-2"/></>:category==='agents'?<><path d="M16 16h17M16 16l8 18 9-18"/><circle cx="14" cy="14" r="6"/><circle cx="35" cy="14" r="5"/><circle className="skill-mark-accent" cx="24" cy="35" r="7"/></>:category==='testing'?<><rect x="10" y="9" width="28" height="31" rx="6"/><path d="M17 17h14M17 23h6"/><path className="skill-mark-accent" d="m18 31 4 4 9-10"/></>:<><path d="m16 14-9 10 9 10M32 14l9 10-9 10"/><path className="skill-mark-accent" d="m28 10-8 28"/></>}
 </svg></span>;
}

export function SkillDirectoryCard({skill,href,categoryLabel,selectedTool,t}:{skill:any;href:string;categoryLabel:string;selectedTool:string;t:(value:string)=>string}){
 const tools=[...skill.tools].sort((a,b)=>Number(b.id===selectedTool)-Number(a.id===selectedTool));
 return <li className="skill-tool-card" data-skill-category={skill.category}>
  <div className="skill-card-top"><SkillMark category={skill.category}/><span>{categoryLabel}</span>{skill.featured&&<span className="skill-card-featured"><span aria-hidden="true">✦</span>{t('精选')}</span>}</div>
  <h2 className="skill-card-title"><Link prefetch={false} href={href}>{skill.name}</Link></h2>
  <p className="skill-card-summary">{t(skill.summary)}</p>
  <div className="skill-card-tags" aria-label={t('支持的 AI 工具')}>{tools.slice(0,3).map((tool:any)=><span key={tool.id} data-selected={tool.id===selectedTool||undefined}>{tool.label}</span>)}{tools.length>3&&<span title={tools.slice(3).map((tool:any)=>tool.label).join(', ')}>+{tools.length-3}</span>}</div>
  <div className="skill-card-bottom"><a href={'https://github.com/'+skill.repo} target="_blank" rel="noopener noreferrer" aria-label={'GitHub · '+skill.name}><Icon name="link"/><span>{skill.repo}</span></a><Link className="skill-card-open" prefetch={false} href={href} aria-label={t('查看详情')+' · '+skill.name}><Icon name="arrow"/></Link></div>
  <div className="skill-card-actions"><Link prefetch={false} href={href+(skill.origin==='imported'?'#source':'#installation')}>{t(skill.origin==='imported'?'来源与许可':'安装方法')}</Link>{skill.licenseUrl?<a href={skill.licenseUrl} target="_blank" rel="noopener noreferrer">{t(skill.license)}</a>:<span>{t(skill.license)}</span>}</div>
 </li>;
}
