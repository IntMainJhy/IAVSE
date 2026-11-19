'use client';

import {useEffect,useId,useRef,useState} from 'react';
import {api} from '@/lib/client';
import {useLocale} from './LocaleProvider';
import {RegistrationConsent} from './RegistrationConsent';
import {PolicyLinks} from './CommunityUI';
import {Icon} from './Icons';

type Config={mode:string;paused?:boolean;policyHash:string;policyVersion:string;policyReady:boolean};

export default function SignUpForm({onRegistered,autoFocus=false}:{onRegistered:(email:string)=>void;autoFocus?:boolean}){
 const {t}=useLocale(),id=useId(),request=useRef<AbortController|null>(null);
 const [config,setConfig]=useState<Config|null>(null),[loadError,setLoadError]=useState(''),[attempt,setAttempt]=useState(0),[policyRead,setPolicyRead]=useState<string[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{
  const controller=new AbortController();setLoadError('');
  api('/api/community/config',{signal:controller.signal}).then(value=>setConfig(value)).catch(reason=>{if(!controller.signal.aborted)setLoadError(reason.message)});
  return()=>controller.abort();
 },[attempt]);
 useEffect(()=>()=>request.current?.abort(),[]);
 if(loadError)return <div className="sign-in-config-error"><p className="sign-in-error" role="alert">{t(loadError)}</p><button type="button" onClick={()=>setAttempt(value=>value+1)}>{t('重试')}</button></div>;
 if(!config)return <p className="sign-in-loading" role="status">{t('加载中…')}</p>;
 const available=['local','public'].includes(config.mode)&&config.policyReady&&!config.paused;
 return <form method="post" className="sign-in-form sign-up-form" aria-busy={busy} onSubmit={async event=>{
  event.preventDefault();if(request.current||!available||policyRead.length!==2)return;
  const data=new FormData(event.currentTarget);setError('');
  if(data.get('password')!==data.get('confirm')){setError('两次新密码输入不一致');return;}
  const controller=new AbortController();request.current=controller;setBusy(true);
  try{
   await api('/api/community/register',{method:'POST',signal:controller.signal,body:JSON.stringify({email:data.get('email'),nickname:data.get('nickname'),password:data.get('password'),adult:data.get('adult')==='on',accepted:data.get('accepted')==='on',policyRead,policyVersion:config.policyVersion,policyHash:config.policyHash})});
   if(!controller.signal.aborted)onRegistered(String(data.get('email')||'').trim());
  }catch(reason:any){if(!controller.signal.aborted)setError(reason.message);}
  finally{request.current=null;if(!controller.signal.aborted)setBusy(false);}
 }}>
  <fieldset className="sign-in-fields" disabled={busy||!available}>
   <div className="sign-up-identity">
    <label htmlFor={id+'-email'}>{t('邮箱')}<input id={id+'-email'} name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} autoFocus={autoFocus} required/></label>
    <label htmlFor={id+'-nickname'}>{t('昵称')}<input id={id+'-nickname'} name="nickname" autoComplete="nickname" minLength={2} maxLength={40} required/></label>
   </div>
   <div className="sign-up-passwords">
    <label htmlFor={id+'-password'}>{t('密码')}<input id={id+'-password'} name="password" type="password" autoComplete="new-password" minLength={12} maxLength={256} placeholder={t('至少 12 位')} required/></label>
    <label htmlFor={id+'-confirm'}>{t('确认密码')}<input id={id+'-confirm'} name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={256} required/></label>
   </div>
   <RegistrationConsent key={config.policyHash} policyHash={config.policyHash} onRead={setPolicyRead}/>
   <label className="sign-up-check"><input name="adult" type="checkbox" required/><span>{t(config.mode==='local'?'我已成年（本地测试）':'我已成年')}</span></label>
   <label className="sign-up-check"><input name="accepted" type="checkbox" disabled={policyRead.length!==2} required/><span>{t('我同意 ')}<PolicyLinks/></span></label>
   {error&&<p className="sign-in-error" role="alert">{t(error)}</p>}
   <button type="submit" className="sign-in-submit" disabled={busy||!available||policyRead.length!==2}><span>{t(busy?'正在处理…':'创建账号')}</span>{busy?<span className="sign-in-spinner" aria-hidden="true"/>:<Icon name="arrow"/>}</button>
  </fieldset>
  {!available&&<p className="sign-in-error" role="status">{t('注册暂未开放，请稍后再试。')}</p>}
 </form>;
}
