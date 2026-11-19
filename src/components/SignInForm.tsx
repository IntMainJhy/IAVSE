'use client';

import {useEffect,useId,useRef,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/client';
import {useLocale} from './LocaleProvider';
import {PasswordRecovery} from './EmailSettings';
import {Icon} from './Icons';

export default function SignInForm({onSuccess,onClose,registration,next}:{onSuccess:()=>void;onClose:()=>void;registration:boolean;next:string}){
 const {t}=useLocale(),id=useId(),request=useRef<AbortController|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>()=>request.current?.abort(),[]);
 return <>
  <form method="post" className="sign-in-form" aria-busy={busy} onSubmit={async event=>{
   event.preventDefault();if(request.current)return;
   const form=new FormData(event.currentTarget),controller=new AbortController();request.current=controller;setBusy(true);setError('');
   try{
    await api('/api/auth/login',{method:'POST',body:JSON.stringify({username:form.get('username'),password:form.get('password')}),signal:controller.signal});
    if(!controller.signal.aborted)onSuccess();
   }catch(reason:any){if(!controller.signal.aborted)setError(reason.message);}
   finally{request.current=null;if(!controller.signal.aborted)setBusy(false);}
  }}>
   <fieldset disabled={busy} className="sign-in-fields">
    <label htmlFor={id+'-username'}>{t('邮箱或账号')}<input id={id+'-username'} name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} autoFocus required/></label>
    <label htmlFor={id+'-password'}>{t('密码')}<input id={id+'-password'} name="password" type="password" autoComplete="current-password" maxLength={256} required/></label>
    {error&&<p className="sign-in-error" role="alert">{t(error)}</p>}
    <button type="submit" className="sign-in-submit" disabled={busy}><span>{t(busy?'正在登录…':'登录')}</span>{!busy&&<Icon name="arrow"/>}</button>
   </fieldset>
  </form>
  <PasswordRecovery/>
  <div className="sign-in-footer">{registration&&<Link href={'/join?'+new URLSearchParams({next})} onClick={onClose}>{t('没有账号？邮箱注册')}</Link>}<button type="button" onClick={onClose}>{t('暂不登录')}</button></div>
 </>;
}
