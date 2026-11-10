import Link from 'next/link';
import {serverI18n} from '@/lib/server-i18n';
import {Icon} from './Icons';
import '@/app/resource-introduction.css';

export async function ResourceIntroduction(){
 const {locale}=await serverI18n();
 const en=locale.startsWith('en'),ja=locale.startsWith('ja');
 const copy=(zh:string,enText:string,jaText:string)=>en?enText:ja?jaText:zh;
 const features=[
  {id:'designs',label:'UI DESIGN',title:copy('先看见，再创造。','See it. Then make it.','見つけて、つくる。'),text:copy('从画面到设计语言。预览不同风格，带走配色、排版、动效规则和一份可以直接使用的提示词。','Explore visual directions, then take the palette, typography, motion rules and an original prompt into your next project.','スタイルをプレビューし、配色・文字組み・動きのルールとプロンプトを次の制作へ。'),link:copy('探索 UI 设计','Explore UI designs','UI デザインを見る'),href:'/resources?type=designs',art:'design'},
  {id:'docs',label:'DOCUMENTS',title:copy('好方法，值得留下来。','Good methods deserve a home.','よい方法を、残そう。'),text:copy('从第一次发布，到玻璃材质和空间场景的实现。把实践整理成文档，让每一步都有迹可循。','From your first publication to optical glass and spatial scenes. Practical guides make each step repeatable.','初めての公開からガラス表現、空間シーンの実装まで。実践を次につながるガイドに。'),link:copy('阅读文档','Read the guides','ガイドを読む'),href:'/resources?type=docs',art:'docs'},
  {id:'skills',label:'SKILLS',title:copy('让你的工具，多一种能力。','Give your tools a new ability.','ツールに、新しい力を。'),text:copy('设计、开发、测试、文档。按任务找到适合的 Skill，了解来源和使用方式，把熟悉的工作流接起来。','Design, develop, test and document. Find Skills by task, check their sources and connect them to your workflow.','デザイン、開発、テスト、ドキュメント。目的に合う Skill と使い方を見つけよう。'),link:copy('发现 Skill','Discover Skills','Skill を探す'),href:'/skills',art:'skills'},
  {id:'websites',label:'WEBSITES & TOOLS',title:copy('灵感之外，还有好工具。','From inspiration to making.','ひらめきから、制作へ。'),text:copy('设计系统、交互组件、创意工具与参考网站。保留原始来源，把值得再来的地方收在一起。','Design systems, interactive components and creative tools. Useful places, with a clear path back to the original source.','デザインシステム、インタラクション、制作ツール。出典とともに、また訪れたい場所を。'),link:copy('浏览网站与工具','Browse websites & tools','サイトとツールを見る'),href:'/resources?type=resources',art:'tools'}
 ];
 return <div className="resource-introduction">
  <header className="resource-intro-heading"><h1>{copy('从灵感，走到作品。','Ideas become things.','アイデアを、かたちに。')}</h1><p>{copy('设计、知识和工具，在这里相遇。','Design, knowledge and tools. Together.','デザイン、知識、ツール。ここで、つながる。')}</p><nav aria-label={copy('探索资源','Explore resources','リソースを探す')}>{features.map(f=><a href={'#resource-'+f.id} key={f.id}>{f.label}<Icon name="chevron-down"/></a>)}</nav></header>
  <div className="portfolio-resource-grid">{features.map(f=><section className="portfolio-resource-card" id={"resource-"+f.id} key={f.id}><h2>{f.title}</h2><p>{f.text}</p><Link href={f.href}>{f.link}<Icon name="arrow"/></Link></section>)}</div>
  <footer className="resource-intro-end"><h2>{copy('不止展示。把方法也交给你。','Take the method with you.','方法も、あなたの手に。')}</h2><p>{copy('从本站的设计出发，了解玻璃、空间与动效如何实现。','See how the glass, space and motion of IAVSE are built.','IAVSE のガラス、空間、動きのつくり方。')}</p><Link href="/docs/iavse-design-system">{copy('阅读 IAVSE 设计方法','Explore the IAVSE design guide','IAVSE デザインガイドを読む')}<Icon name="arrow"/></Link></footer>
 </div>;
}
