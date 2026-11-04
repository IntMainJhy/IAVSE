'use client';
import {lazy,Suspense,type ComponentProps} from 'react';
import {useLocale} from './LocaleProvider';

// Keep the theme boundary separate from the general route clients. Gallery SSR
// also imports this theme directly and must not promote it into every route's chunk.
const LazyTheme=lazy(()=>import('./BlogTheme').then(module=>({default:module.BlogTheme})));
function Loading(){const {t}=useLocale();return <p role="status" className="small-text">{t('加载中…')}</p>;}
export function PublicBlogTheme(props:ComponentProps<typeof import('./BlogTheme').BlogTheme>){return <Suspense fallback={<Loading/>}><LazyTheme {...props}/></Suspense>;}
