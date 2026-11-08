'use client';
import {useRouter} from 'next/navigation';
import {skillFilterHref} from '@/lib/skill-catalog.mjs';
import {DirectorySearch} from './DirectorySearch';
import {useLocale} from './LocaleProvider';

export function SkillDirectorySearch({value,category,tool,collection}:{value:string;category:string;tool:string;collection:string}){
 const router=useRouter(),{t}=useLocale();
 return <DirectorySearch action="/skills" fields={{...(category!=='all'?{type:category}:{}),...(tool!=='all'?{tool}:{}),...(collection!=='all'?{collection}:{})}} value={value} label={t('搜索 Skill 名称、用途或技术')} placeholder={t('搜索名称、用途或技术…')} onSearch={query=>router.push(skillFilterHref(category,query,tool,collection),{scroll:false})}/>;
}
