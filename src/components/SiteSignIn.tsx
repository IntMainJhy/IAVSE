'use client';

import {lazy,Suspense,useCallback,useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {usePathname,useRouter} from 'next/navigation';
import {platformDestination} from '@/lib/navigation.mjs';
import {signInRequest} from '@/lib/sign-in-navigation.mjs';
import {usePlatformAccount} from './PlatformAccount';
import {useLocale} from './LocaleProvider';
import {BrandMark} from './BrandMark';
import {Icon} from './Icons';
import '@/app/sign-in-dialog.css';

const Form=lazy(()=>import('./SignInForm'));
type Request={next:string;trigger:HTMLElement};

function SignInDialog({request,close,complete}:{request:Request;close:()=>void;complete:()=>void}){
 const {t}=useLocale(),{access}=usePlatformAccount(),router=useRouter(),id=useId(),dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const element=dialog.current;if(!element)return;
  const overflow=document.body.style.overflowY;document.body.style.overflowY='hidden';element.showModal();
  return()=>{
   element.close();document.body.style.overflowY=overflow;
   const targets=[request.trigger,...document.querySelectorAll<HTMLElement>('[data-auth-trigger],.iavse-mobile-dock button[aria-haspopup="dialog"]')];
   queueMicrotask(()=>targets.find(target=>target.isConnected&&target.getClientRects().length)?.focus({preventScroll:true}));
  };
 },[request]);
 const current=/^\/(?:login|join)(?:\/|$)/.test(location.pathname)?'/':location.pathname+location.search+location.hash;
 const done=()=>{
  window.dispatchEvent(new Event('auth-session-changed'));
  const destination=platformDestination(request.next,current,access?.surface);
  complete();
  if(destination!==location.pathname+location.search+location.hash)window.location.assign(destination);
  else router.refresh();
 };
 return createPortal(<dialog ref={dialog} id="site-sign-in-dialog" className="sign-in-dialog" aria-modal="true" aria-labelledby={id+'-title'} onClose={event=>{if(!event.currentTarget.open)close();}} onClick={event=>{
  if(event.target!==event.currentTarget)return;const rect=event.currentTarget.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();
 }}>
  <div className="sign-in-dialog-body"><button className="sign-in-close" type="button" aria-label={t('关闭登录窗口')} onClick={close}><Icon name="close"/></button>
   <header><span className="sign-in-brand" aria-hidden="true"><BrandMark/></span><h2 id={id+'-title'}>{t('登录 IAVSE')}</h2></header>
   <Suspense fallback={<p className="sign-in-loading" role="status">{t('加载中…')}</p>}><Form onSuccess={done} onClose={close} next={request.next||current} registration={access?.registration===true}/></Suspense>
  </div>
 </dialog>,document.body);
}

/** One controller serves header, mobile sheet and in-content sign-in links. */
export function SiteSignIn(){
 const path=usePathname(),{user}=usePlatformAccount(),accountFocus=useRef(false),[request,setRequest]=useState<Request|null>(null),close=useCallback(()=>setRequest(null),[]);
 const complete=useCallback(()=>{accountFocus.current=true;close();},[close]);
 useEffect(()=>{
  if(!user||!accountFocus.current)return;
  const target=[...document.querySelectorAll<HTMLElement>('[data-iavse-header] .site-account-menu>summary,.iavse-mobile-dock button[aria-haspopup="dialog"]')].find(node=>node.getClientRects().length);
  if(target){accountFocus.current=false;target.focus({preventScroll:true});}
 },[user]);
 useEffect(()=>{close();},[path,close]);
 useEffect(()=>{
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   const target=signInRequest(link,location.href);if(!link||!target)return;
   event.preventDefault();window.dispatchEvent(new Event('iavse-navigation-cancel'));setRequest({...target,trigger:link});
  };
  document.addEventListener('click',click,true);window.addEventListener('popstate',close);
  return()=>{document.removeEventListener('click',click,true);window.removeEventListener('popstate',close);};
 },[close]);
 return request?<SignInDialog request={request} close={close} complete={complete}/>:null;
}
