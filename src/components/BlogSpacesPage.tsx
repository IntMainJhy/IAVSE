import {publicSpaces} from '@/lib/spaces.mjs';
import {localizeProfile} from '@/lib/content-locales.mjs';
import {serverI18n} from '@/lib/server-i18n';
import {portfolioCopy} from '@/lib/portfolio-content';
import {blogShowcases,showcaseProfile} from '@/lib/blog-showcase.mjs';
import {UserRound} from 'lucide-react';
import {ProjectsPage} from './rbp/ProjectsPage';
import type {Project} from './rbp/projects/projects';
/** Published/discoverable members and labeled built-in examples; no synthetic activity. */
export async function BlogSpacesPage({req}:{req:Request}){
 const {locale}=await serverI18n(),c=portfolioCopy(locale),zh=locale==='zh',ja=locale==='ja';
 const members=publicSpaces(req).map((space:any)=>{const p=localizeProfile(space.profile,locale);return {handle:space.handle,name:p.name||space.handle,intro:p.intro||'',avatarId:p.avatarId||'',href:'/blog/'+encodeURIComponent(space.handle),showcase:false,avatarSrc:''};});
 const examples=blogShowcases.map(item=>showcaseProfile(item.handle,locale)).filter(Boolean);
 const items:Project[]=[...members,...examples].map((space:any,index)=>({id:space.handle,icon:UserRound,iconLabel:space.showcase?(zh?'内置模板 · 虚构人物':ja?'内蔵テンプレート · 架空の人物':'Built-in template · fictional example'):(zh?'公开博客空间':ja?'公開ブログ':'Public blog space'),title:space.name,description:space.intro,meta:space.showcase?c.templateAlt:'@'+space.handle,href:space.href,image:space.avatarSrc||(space.avatarId?'/media/'+space.avatarId:'/media/home-product/space-editorial.webp'),imageAlt:space.name,imageRatio:index===0?752/497:1024/768}));
 return <div data-blog-spaces data-spaces-surface="upstream-portfolio"><ProjectsPage title={c.blogsTitle} intro={c.blogsIntro} items={items} locale={locale}/></div>;
}
