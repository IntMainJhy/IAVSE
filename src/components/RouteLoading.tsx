'use client';
import {useLocale} from './LocaleProvider';

/** Stream a stable, lightweight destination while its authenticated page resolves. */
export function RouteLoading(){
 const {t}=useLocale();
 return <main id="main" className="route-loading" aria-busy="true"><p role="status"><span aria-hidden="true"/>{t('加载中…')}</p><div className="route-loading-layout" aria-hidden="true"><div/><div/><div/><div/></div></main>;
}
