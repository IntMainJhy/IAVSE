'use client';
import {useEffect} from 'react';
import {useLocale} from './LocaleProvider';

export function useUnsaved(dirty:boolean){
 const {t}=useLocale();
 useEffect(()=>{
  if(!dirty)return;
  const unload=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target instanceof Element?event.target.closest('a'):null;
   if(anchor&&anchor.target!=='_blank'&&!anchor.hasAttribute('download')&&anchor.getAttribute('href')?.startsWith('/')&&new URL(anchor.href).href.split('#')[0]!==location.href.split('#')[0]&&!confirm(t('有尚未保存到服务器的修改，仍要离开吗？'))){event.preventDefault();event.stopImmediatePropagation();window.dispatchEvent(new Event('iavse-navigation-cancel'));}
  };
  const inline=(event:Event)=>{if(!confirm(t('有尚未保存到服务器的修改，仍要离开吗？')))event.preventDefault();};
  window.addEventListener('beforeunload',unload);document.addEventListener('click',click,true);window.addEventListener('iavse-before-inline-navigation',inline);
  return()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true);window.removeEventListener('iavse-before-inline-navigation',inline);};
 },[dirty,t]);
}
