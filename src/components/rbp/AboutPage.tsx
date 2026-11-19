// IAVSE's Sea breeze introduction, combined with the existing About content.
// Retained Experience, Stack and Contact components preserve their RBP attribution.
import Link from 'next/link';
import './about/studio.css';
import '@/app/about-sea-breeze.css';
import {Experience} from './about/experience';
import {Stack} from './about/stack';
import {ContactCard} from './contact/contact-card';
import {AboutSeaBreeze} from '../AboutSeaBreeze';
import {Icon} from '../Icons';
import {FadeIn} from './ui/motion-primitives';

export function AboutPage({locale='zh'}:{locale?:string}){
 const say=(zh:string,en:string,ja:string)=>locale==='en'?en:locale==='ja'?ja:zh;
 const channels=[
  {href:'/resources?type=designs',icon:'layers',title:say('从一个好设计开始','Start with good design','よいデザインから'),text:say('对照真实模板与设计规范，在原项目中核对来源和许可。','Explore real templates and design systems, with original sources and licenses.','実際のテンプレートやデザイン規範を、出典とライセンスとともに。')},
  {href:'/resources?type=skills',icon:'code',title:say('让工具成为助力','Find a useful tool','制作を助けるツール'),text:say('找到适合当前任务的 AI Skill，让想法往前再走一步。','Find an AI Skill for the task in front of you.','今の制作に役立つ AI Skill を見つける。')},
  {href:'/resources?type=docs',icon:'file',title:say('把方法留在文档里','Keep the knowledge','方法を記録する'),text:say('顺着指南动手做，也把实践中的发现留下来。','Follow a guide, try it out, and keep what you learn.','ガイドを試し、制作中に学んだことを残す。')}
 ];
 return <div className="about-page" data-iavse-about>
  <AboutSeaBreeze/>
  <section className="about-letter about-content-frame" id="about-letter" aria-labelledby="about-letter-title">
   <div><h2 id="about-letter-title">{say('关于 IAVSE，','About IAVSE,','IAVSE について、')}<br/>{say('写给正在创作的你。','for people who create.','つくるあなたへ。')}</h2><span className="about-letter-signature">IAVSE</span></div>
   <div data-iavse-about-intro><p className="about-letter-lead">{say('一个好工具，往往藏在某个人的实践笔记里。','A useful tool often hides in someone’s working notes.','役立つツールは、誰かの制作ノートに隠れていることがあります。')}</p><p>{say('IAVSE 把这些线索整理到同一个地方：你可以按用途查看界面设计、文档与 AI Skill，回到原项目核对来源和使用许可，再决定是否用于自己的作品。','IAVSE brings designs, documentation and AI skills together by purpose. Each entry points back to its source so you can check the license before using it in your work.','IAVSE はデザイン、ドキュメント、AI Skill を用途から探し、元のプロジェクトで出典とライセンスを確かめられる場所です。')}</p><p>{say('社区用来记录试过的方法、踩过的坑和值得再用的工具。想把零散的经验整理成作品集时，可以建立个人博客，把项目、文章和资源放在自己的地址下。博客空间的画廊，则给这些主页留了一个展示位置。','The community is a place for field notes, experiments and tools worth revisiting. A personal blog brings projects, articles and resources together at one address. The space gallery gives those homepages a place to be discovered.','試した方法や制作中の発見をコミュニティに記録し、個人ブログに作品や記事をまとめられます。ギャラリーは、そんなホームページに出会う場所です。')}</p></div>
  </section>
  <section className="about-resources about-content-frame" aria-labelledby="about-resources-title">
   <div className="about-section-heading"><h2 id="about-resources-title">{say('发现，动手，然后分享。','Discover. Make. Share.','見つけて、つくって、共有する。')}</h2><Link href="/resources">{say('浏览资源目录','Browse the directory','リソース一覧を見る')}</Link></div>
   <div className="about-channel-grid">{channels.map(channel=><Link href={channel.href} className="about-channel" key={channel.href}><Icon name={channel.icon}/><h3>{channel.title}</h3><p>{channel.text}</p><span>{say('去看看','Explore','見てみる')}<Icon name="arrow"/></span></Link>)}</div>
  </section>
  <section className="about-community about-content-frame" aria-labelledby="about-community-title">
   <figure><img src="/media/product-story/studio.webp" srcSet="/media/product-story/studio-960.webp 960w, /media/product-story/studio.webp 1536w" sizes="(max-width:767px) 100vw, 50vw" alt={say('创作工作室的插画','An illustrated creative studio','制作スタジオのイラスト')} width={1536} height={1024} loading="lazy"/></figure>
   <div><h2 id="about-community-title">{say('创作的路上，','Along the way,','制作の途中で、')}<br/>{say('总能遇见同路人。','find your people.','仲間に出会う。')}</h2><p>{say('分享做过的事，讨论正在尝试的方法。从一条实践笔记开始，让经验在彼此之间流动。','Share what you have made and the methods you are trying. Start with a field note and keep the conversation going.','つくったものや試している方法を共有。小さな制作ノートから、会話を続けよう。')}</p><Link className="platform-primary" href="/community">{say('去社区看看','Visit the community','コミュニティへ')}</Link></div>
  </section>
  <section className="about-space-invitation about-content-frame" aria-labelledby="about-space-title"><div><h2 id="about-space-title">{say('让作品和文字，','Your work and words,','作品と言葉に、')}<br/>{say('有个自己的地方。','in a place of your own.','自分だけの場所を。')}</h2><p>{say('选择内置模板，整理介绍、作品与经历。调整内容和布局，预览后再发布。','Choose a built-in template for your introduction, projects and experience. Edit the layout, preview, then publish.','内蔵テンプレートで自己紹介や作品を整理。内容とレイアウトを調整して、確認してから公開。')}</p></div><div className="about-space-actions"><Link className="platform-primary" href="/workspace/blog">{say('创建我的空间','Create my space','スペースをつくる')}</Link><Link href="/blogs">{say('探索 3D 空间画廊','Explore the 3D gallery','3D ギャラリーを見る')}<Icon name="arrow"/></Link></div></section>
  <section className="about-foundations about-content-frame" aria-label={say('使用方式与技术','How it works and the technology','使い方と技術')}><FadeIn><Experience locale={locale}/></FadeIn><FadeIn><Stack locale={locale}/></FadeIn></section>
  <ContactCard locale={locale}/>
 </div>;
}
