import {serverI18n} from '@/lib/server-i18n';
import {portfolioCopy,resourceImage} from '@/lib/portfolio-content';
import {homeResourceSelections} from '@/lib/home-experience.mjs';
import {BookOpen,Compass} from 'lucide-react';
import {ProjectsPage} from './rbp/ProjectsPage';
import {productProjects,type Project} from './rbp/projects/projects';
export async function ResourceIntroduction(){
 const {locale}=await serverI18n(),c=portfolioCopy(locale),zh=locale==='zh',ja=locale==='ja';
 const items:Project[]=[...productProjects(locale).slice(0,2),
  {id:'docs',icon:BookOpen,iconLabel:zh?'教程与文档':ja?'ドキュメント':'Documentation',title:zh?'把做过的过程，留下清楚的方法。':ja?'制作の過程を、わかる方法に。':'Keep a clear record of how things are made.',description:zh?'从安装部署到功能使用，阅读 IAVSE 的操作指南与实现说明。':ja?'インストールから使い方まで、IAVSE のガイドと実装を読む。':'Read IAVSE guides and implementation notes, from installation to everyday use.',meta:'IAVSE · Documentation',href:'/resources?type=docs',imageRatio:1024/768,image:'/media/home-product/space-editorial.webp',imageAlt:c.templateAlt},
  {id:'tools',icon:Compass,iconLabel:zh?'网站与工具':ja?'サイトとツール':'Websites & tools',title:zh?'灵感之外，还有值得收藏的工具。':ja?'ひらめきと、役立つツール。':'Useful tools to turn inspiration into something real.',description:zh?'设计系统、交互组件和参考网站。保留原始来源，回到作品本身。':ja?'デザインシステム、コンポーネント、参考サイトを出典とともに。':'Design systems, interactive components, and reference websites, with their original sources.',meta:zh?'资源目录 · 原始来源':ja?'リソース · 出典':'Resource directory · original sources',href:'/resources?type=resources',imageRatio:1024/768,image:resourceImage(homeResourceSelections[0].items[2]),imageAlt:homeResourceSelections[0].items[2].title},
 ];
 return <ProjectsPage title={c.resourcesTitle} intro={c.resourcesIntro} items={items} locale={locale}/>;
}
