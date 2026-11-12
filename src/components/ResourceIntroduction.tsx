import {serverI18n} from '@/lib/server-i18n';
import {portfolioCopy,resourceImage} from '@/lib/portfolio-content';
import {homeResourceSelections} from '@/lib/home-experience.mjs';
import {BookOpen,Compass} from 'lucide-react';
import {ProjectsPage} from './rbp/ProjectsPage';
import {productProjects,type Project} from './rbp/projects/projects';
export async function ResourceIntroduction(){
 const {locale}=await serverI18n(),c=portfolioCopy(locale),zh=locale==='zh',ja=locale==='ja';
 const items:Project[]=[...productProjects(locale).slice(0,2),
  {id:'docs',icon:BookOpen,iconLabel:zh?'教程与文档':ja?'ドキュメント':'Documentation',title:zh?'安装与使用指南':ja?'導入と操作ガイド':'Setup and user guides',description:zh?'部署网站、编辑博客、发布内容。':ja?'サイトの導入、ブログの編集、記事の公開手順。':'Set up the site, edit a blog and publish content.',href:'/resources?type=docs',imageRatio:1024/768,image:'/media/home-product/space-editorial.webp',imageAlt:c.templateAlt},
  {id:'tools',icon:Compass,iconLabel:zh?'网站与工具':ja?'サイトとツール':'Websites & tools',title:zh?'创作工具与参考站点':ja?'制作ツールと参考サイト':'Creative tools and reference sites',description:zh?'浏览设计系统、组件和实用网站。':ja?'デザインシステム、コンポーネント、便利なサイト。':'Explore design systems, components and useful websites.',href:'/resources?type=resources',imageRatio:1024/768,image:resourceImage(homeResourceSelections[0].items[2]),imageAlt:homeResourceSelections[0].items[2].title},
 ];
 return <ProjectsPage title={c.resourcesTitle} intro={c.resourcesIntro} items={items} locale={locale}/>;
}
