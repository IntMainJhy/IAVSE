'use client';
import {createContext,startTransition,use,useId,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {htmlLocale} from '@/lib/locale-format.mjs';
import {localeTranslator} from '@/lib/client-i18n.mjs';
export type Locale='en'|'zh'|'ja';
const Context=createContext<{locale:Locale;t:<T>(text:T,values?:unknown[])=>T;select:(locale:Locale)=>void;notice:string}|null>(null);
export function LocaleProvider({initialLocale,children}:{initialLocale:Locale;children:React.ReactNode}){
 const[locale,setLocale]=useState(initialLocale),[notice,setNotice]=useState('');const router=useRouter();
 const translate=use(localeTranslator(locale));
 const t=useCallback(<T,>(text:T,values:unknown[]=[])=>translate(locale,text,values) as T,[locale,translate]);
 useEffect(()=>{document.documentElement.lang=htmlLocale(locale)},[locale]);
 function select(next:Locale){if(next===locale)return;document.documentElement.lang=htmlLocale(next);let saved=false;try{document.cookie=`site-locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;saved=document.cookie.split('; ').includes(`site-locale=${next}`)}catch{}setNotice(saved?'语言偏好已保存。':'语言已切换，但浏览器未允许保存偏好。');startTransition(()=>{setLocale(next);if(saved)router.refresh();});}
 return <Context.Provider value={{locale,t,select,notice}}>{children}</Context.Provider>;
}
export function useLocale(){const context=useContext(Context);if(!context)throw new Error('LocaleProvider is missing');return context;}
const languages=[{value:'en' as const,label:'English',lang:'en'},{value:'zh' as const,label:'中文',lang:'zh-CN'},{value:'ja' as const,label:'日本語',lang:'ja'}];
export function LanguageSwitcher(){
 const{locale,select,t,notice}=useLocale(),id=useId(),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),[open,setOpen]=useState(false),[focus,setFocus]=useState(0);
 const selected=Math.max(0,languages.findIndex(item=>item.value===locale));
 const close=(restore=false)=>{setOpen(false);if(restore)trigger.current?.focus();};
 useEffect(()=>{
  if(!open)return;
  root.current?.querySelectorAll<HTMLButtonElement>('[role=option]')[focus]?.focus();
 },[open,focus]);
 useEffect(()=>{
  const outside=(event:PointerEvent)=>{if(root.current&&!root.current.contains(event.target as Node))setOpen(false);};
  document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);
 },[]);
 return <div ref={root} className="language-control" data-open={open} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setOpen(false);}}>
  <button ref={trigger} id={id+'-trigger'} type="button" className="language-trigger" aria-label={t('界面语言')} aria-haspopup="listbox" aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>{setFocus(selected);setOpen(value=>!value);}} onKeyDown={event=>{
   if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setFocus(selected);setOpen(true);}
   if(event.key==='Escape')close(true);
  }}><span lang={languages[selected].lang}>{languages[selected].label}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button>
  {open&&<div className="language-menu" id={id} role="listbox" aria-labelledby={id+'-trigger'} onKeyDown={event=>{
   if(event.key==='Escape'){event.preventDefault();close(true);}
   else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setFocus(value=>(value+(event.key==='ArrowDown'?1:languages.length-1))%languages.length);}
   else if(event.key==='Home'||event.key==='End'){event.preventDefault();setFocus(event.key==='Home'?0:languages.length-1);}
  }}>{languages.map((item,index)=><button key={item.value} type="button" role="option" aria-selected={locale===item.value} tabIndex={focus===index?0:-1} lang={item.lang} onPointerMove={()=>setFocus(index)} onClick={()=>{select(item.value);close(true);}}><span>{item.label}</span>{locale===item.value&&<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>}</button>)}</div>}
  <span className="community-sr" role="status">{t(notice)}</span>
 </div>;
}
