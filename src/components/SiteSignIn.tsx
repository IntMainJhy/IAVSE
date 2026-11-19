'use client';

import {lazy,Suspense,useCallback,useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {usePathname,useRouter} from 'next/navigation';
import {platformDestination} from '@/lib/navigation.mjs';
import {signInRequest} from '@/lib/sign-in-navigation.mjs';
import {observeDialogHeight} from '@/lib/dialog-height.mjs';
import {usePlatformAccount} from './PlatformAccount';
import {useLocale} from './LocaleProvider';
import {BrandMark} from './BrandMark';
import {Icon} from './Icons';
import '@/app/sign-in-dialog.css';

const Form=lazy(()=>import('./SignInForm'));
const JoinForm=lazy(()=>import('./SignUpForm'));
type Mode='login'|'join';
type Request={next:string;mode:Mode;trigger:HTMLElement};

function SignInDialog({request,close,complete}:{request:Request;close:()=>void;complete:()=>void}){
 const {t}=useLocale(),{access}=usePlatformAccount(),router=useRouter(),id=useId(),dialog=useRef<HTMLDialogElement>(null),body=useRef<HTMLDivElement>(null);
 const [selected,setSelected]=useState<Mode>(request.mode),[switched,setSwitched]=useState(false),[email,setEmail]=useState(''),[registered,setRegistered]=useState(false);
 const registration=access?.registration===true,mode=registration?selected:'login';
 const switchMode=(value:Mode)=>{setSelected(value);setSwitched(true);dialog.current?.scrollTo({top:0});};
 useEffect(()=>{
  const element=dialog.current;if(!element)return;
  const overflow=document.body.style.overflowY;document.body.style.overflowY='hidden';element.showModal();
  return()=>{
   element.close();document.body.style.overflowY=overflow;
   const targets=[request.trigger,...document.querySelectorAll<HTMLElement>('[data-auth-trigger],.iavse-mobile-dock button[aria-haspopup="dialog"]')];
   queueMicrotask(()=>targets.find(target=>target.isConnected&&target.getClientRects().length)?.focus({preventScroll:true}));
  };
 },[request]);
 useEffect(()=>observeDialogHeight(dialog.current,body.current),[request]);
 const current=/^\/(?:login|join)(?:\/|$)/.test(location.pathname)?'/':location.pathname+location.search+location.hash;
 const done=()=>{
  window.dispatchEvent(new Event('auth-session-changed'));
  const destination=platformDestination(request.next,current,access?.surface);
  complete();
  if(destination!==location.pathname+location.search+location.hash)window.location.assign(destination);
  else router.refresh();
 };
 return createPortal(<dialog ref={dialog} id="site-sign-in-dialog" className="sign-in-dialog" data-mode={mode} aria-modal="true" aria-labelledby={id+'-title'} onClose={event=>{if(!event.currentTarget.open)close();}} onClick={event=>{
  if(event.target!==event.currentTarget)return;const rect=event.currentTarget.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();
 }}>
  <div className="sign-in-dialog-body" ref={body}><button className="sign-in-close" type="button" aria-label={t('关闭账号窗口')} onClick={close}><Icon name="close"/></button>
   <div className="sign-in-art" aria-hidden="true">
    <span className="sign-in-art-disc"/>
    <span className="sign-in-art-page"><img src="/illustrations/resources/designs.webp" width="384" height="384" alt=""/></span>
    <span className="sign-in-art-book"><img src="/illustrations/resources/docs.webp" width="384" height="384" alt=""/></span>
    <span className="sign-in-brand"><BrandMark/></span>
   </div>
   <header><h2 id={id+'-title'}>{t(mode==='join'?'加入 IAVSE':'登录 IAVSE')}</h2><p>{t(mode==='join'?'从一个账号，开始收藏与分享。':'把喜欢的灵感，留在你的收藏里。')}</p></header>
   {registration&&<div className="sign-in-tabs" role="tablist" aria-label={t('登录与注册')}>
    <span className="sign-in-tab-indicator" aria-hidden="true" style={{transform:`translateX(${mode==='join'?'100%':'0'})`}}/>
    {(['login','join'] as const).map(value=><button key={value} type="button" role="tab" id={id+'-tab-'+value} aria-selected={mode===value} aria-controls={id+'-panel'} tabIndex={mode===value?0:-1} onClick={()=>switchMode(value)} onKeyDown={event=>{
     if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
     const next=event.key==='Home'?'login':event.key==='End'?'join':mode==='login'?'join':'login';switchMode(next);document.getElementById(id+'-tab-'+next)?.focus({preventScroll:true});
    }}>{t(value==='login'?'登录':'注册')}</button>)}
   </div>}
   <div id={id+'-panel'} role={registration?'tabpanel':undefined} aria-labelledby={registration?id+'-tab-'+mode:undefined} className="sign-in-panel" key={mode}>
    {mode==='login'&&registered&&<p className="sign-in-success" role="status"><Icon name="check"/>{t('注册成功，请登录。')}</p>}
    {!registration&&request.mode==='join'&&<p className="sign-in-error" role="status">{t('注册暂未开放，请稍后再试。')}</p>}
    <Suspense fallback={<p className="sign-in-loading" role="status">{t('加载中…')}</p>}>{mode==='join'?<JoinForm autoFocus={!switched} onRegistered={value=>{setEmail(value);setRegistered(true);setSelected('login');setSwitched(false);dialog.current?.scrollTo({top:0});}}/>:<Form onSuccess={done} email={email} autoFocus={!switched}/>}</Suspense>
   </div>
   <div className="sign-in-footer">{registration&&<button type="button" className="sign-in-mode-link" onClick={()=>switchMode(mode==='join'?'login':'join')}>{t(mode==='join'?'已有账号，前往登录':'没有账号？邮箱注册')}</button>}<button type="button" onClick={close}>{t('暂不登录')}</button></div>
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
