import Link from 'next/link';
import {Icon} from './Icons';
import {showcaseResources,showcaseSkills} from '@/lib/product-showcase.mjs';
import '@/app/home-discovery-stage.css';

const copy={
 zh:{eyebrow:'交流 · 发现 · 创作',title:['好想法，','值得一起聊聊。'],body:'分享你正在做的事，也找找别人用过的设计、知识和工具。',community:'进入社区',resources:'发现资源',note:'分享经验，交换想法，一起解决问题。',selected:'资源精选',all:'查看全部',kinds:{'template-astro-paper':'技术博客模板','template-adminkit':'数据仪表盘模板'},skill:'用 Skill 打磨你的界面',skillBody:'Impeccable · 排版、响应式与细节优化',empty:'目录正在整理，先看看全部资源。'},
 en:{eyebrow:'CONNECT · DISCOVER · CREATE',title:['Good ideas.','Better together.'],body:'Share what you are working on. Find designs, knowledge, and tools others have put to use.',community:'Join the community',resources:'Discover resources',note:'Share experience. Exchange ideas. Solve problems together.',selected:'From the directory',all:'View all',kinds:{'template-astro-paper':'Technical blog template','template-adminkit':'Dashboard template'},skill:'Refine your interface with Skills',skillBody:'Impeccable · Typography, responsive layout, and polish',empty:'The directory is being prepared. Explore all resources.'},
 ja:{eyebrow:'交流 · 発見 · 制作',title:['いいアイデアを、','一緒に育てよう。'],body:'制作中のことを共有し、誰かが使ったデザインや知識、ツールを見つけよう。',community:'コミュニティへ',resources:'リソースを探す',note:'経験を共有し、意見を交わし、一緒に課題を解く。',selected:'リソースのピックアップ',all:'すべて見る',kinds:{'template-astro-paper':'技術ブログのテンプレート','template-adminkit':'ダッシュボードのテンプレート'},skill:'Skill で画面を磨く',skillBody:'Impeccable · 文字組み、レスポンシブ、細部の調整',empty:'ディレクトリを準備中です。すべてのリソースをご覧ください。'}
};

/** A server-rendered invitation and bounded excerpts of the existing directory. */
export function HomeDiscoveryStage({locale}:{locale:string}){
 const c=copy[locale as keyof typeof copy]||copy.zh;
 const templateNames={'template-astro-paper':'AstroPaper','template-adminkit':'AdminKit'};
 const templates=(showcaseResources.find(category=>category.id==='designs')?.items||[]).filter((item):item is typeof item&{image:string}=>'image' in item&&typeof item.image==='string'&&Object.hasOwn(templateNames,item.id)).slice(0,2);
 const skill=showcaseSkills.flatMap(category=>category.items).find(item=>item.id==='impeccable');
 return <section className="v2-stage home-discovery-stage" aria-labelledby="home-discovery-title">
  <div className="hds-invitation">
   <p className="hds-eyebrow">{c.eyebrow}</p>
   <h2 id="home-discovery-title">{c.title.map(line=><span key={line}>{line}</span>)}</h2>
   <p className="hds-body">{c.body}</p>
   <div className="hds-actions"><Link className="hds-primary" href="/community">{c.community}<Icon name="arrow"/></Link><Link className="hds-text-link" href="/resources">{c.resources}<Icon name="arrow"/></Link></div>
   <p className="hds-note"><Icon name="comment"/>{c.note}</p>
  </div>
  <div className="hds-directory">
   <header><h3>{c.selected}</h3><Link href="/resources?type=designs">{c.all}<Icon name="arrow"/></Link></header>
   {templates.length?<div className="hds-templates">{templates.map(item=><Link href={item.href} key={item.id} className="hds-template"><div className="hds-cover"><img src={item.image} alt="" width={480} height={300} loading="lazy" decoding="async"/></div><div className="hds-template-caption"><div><h4>{templateNames[item.id as keyof typeof templateNames]}</h4><p>{c.kinds[item.id as keyof typeof c.kinds]}</p></div><span>{item.source}</span></div></Link>)}</div>:<p className="hds-empty">{c.empty}</p>}
   {skill&&<Link className="hds-skill" href={skill.href}><span className="hds-skill-icon"><Icon name="layers"/></span><span><strong>{c.skill}</strong><span>{c.skillBody}</span></span><Icon name="arrow"/></Link>}
  </div>
 </section>;
}
