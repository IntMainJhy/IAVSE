'use client';
import {useEffect,useRef,useState} from 'react';
import {useLocale} from './LocaleProvider';
import {Doc,LegalText,Loading,Notice,PolicyLinks,Retry,primary,useResource} from './CommunityUI';
import {post} from '@/lib/client';
import './registration-consent.css';

function PolicyReader({name,policyHash,onRead}:{name:string;policyHash:string;onRead:(name:string)=>void}){
 const {t}=useLocale(),resource=useResource('/api/community/policies/'+name),box=useRef<HTMLDivElement>(null);
 const [open,setOpen]=useState(false),[reachedEnd,setReachedEnd]=useState(false),[read,setRead]=useState(false);
 const title=name==='community'?'社区规则':'免责声明';
 useEffect(()=>{if(!open||!resource.data)return;const node=box.current;if(node&&node.scrollHeight<=node.clientHeight+8)setReachedEnd(true)},[open,resource.data]);
 return <details className="registration-policy" open={open} onToggle={e=>setOpen(e.currentTarget.open)}>
  <summary><span>{t(title)}</span><span>{t(read?'已阅读':'打开阅读')}</span></summary>
  {open&&<>{resource.loading?<Loading/>:resource.error?<Retry error={resource.error} refresh={resource.refresh}/>:resource.data?.hash!==policyHash?<p role="alert">{t('规则版本已更新，请刷新页面后重新阅读。')}</p>:<>
   <div className="registration-policy-scroll" ref={box} tabIndex={0} role="region" aria-label={t(title)} onScroll={e=>{const n=e.currentTarget;if(n.scrollTop+n.clientHeight>=n.scrollHeight-8)setReachedEnd(true)}}><div lang="zh-CN"><LegalText text={resource.data.text}/></div></div>
   <button type="button" className="registration-policy-confirm" disabled={!reachedEnd||read} onClick={()=>{setRead(true);onRead(name);setOpen(false)}}>{t(read?'已阅读':reachedEnd?'我已阅读此文件':'请阅读至末尾')}</button>
  </>}</>}
 </details>;
}
export function RegistrationConsent({policyHash,onRead,legend='注册前请阅读'}:{policyHash:string;onRead:(names:string[])=>void;legend?:string}){
 const {t}=useLocale(),[read,setRead]=useState<string[]>([]);
 useEffect(()=>{setRead([]);onRead([])},[policyHash,onRead]);
 function finish(name:string){const next=[...new Set([...read,name])];setRead(next);onRead(next)}
 return <fieldset className="registration-consent"><legend>{t(legend)}</legend><p>{t('展开并阅读社区规则和免责声明后，再勾选同意。')}</p>{['community','disclaimer'].map(name=><PolicyReader key={name} name={name} policyHash={policyHash} onRead={finish}/>)}</fieldset>;
}

// The caller keys this form by policyHash so both reading and consent reset with the version.
export function AccountPolicyConsent({config,onSaved}:{config:Doc;onSaved:(user:Doc)=>void}){
 const {t}=useLocale();
 const [policyRead,setPolicyRead]=useState<string[]>([]),[agreed,setAgreed]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const ready=config.policyReady&&policyRead.length===2&&agreed;
 return <form className="account-consent-settings" aria-busy={busy} onSubmit={async event=>{
  event.preventDefault();
  if(!ready||busy)return;
  setBusy(true);setError('');
  try{
   const result=await post('/api/community/accept-policies',{accepted:agreed,policyRead,policyVersion:config.policyVersion,policyHash:config.policyHash});
   onSaved(result.user);
  }catch(cause:any){setError(cause.message)}
  finally{setBusy(false)}
 }}>
  <RegistrationConsent policyHash={config.policyHash} onRead={setPolicyRead} legend="请确认当前社区规则"/>
  <label className="community-check"><input type="checkbox" checked={agreed} disabled={busy||policyRead.length!==2} onChange={event=>setAgreed(event.target.checked)} required/><span>{t('我同意 ')}<PolicyLinks/></span></label>
  {error&&<Notice error>{t(error)}</Notice>}
  <button className={primary} disabled={busy||!ready}>{t(busy?'正在处理…':'确认规则并启用发布')}</button>
 </form>;
}
