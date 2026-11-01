'use client';
import {useEffect,useRef,useState} from 'react';
import {useLocale} from './LocaleProvider';
import {LegalText,Loading,Retry,useResource} from './CommunityUI';
import './registration-consent.css';

function PolicyReader({name,policyHash,onRead}:{name:string;policyHash:string;onRead:(name:string)=>void}){
 const {t}=useLocale(),resource=useResource('/api/community/policies/'+name),box=useRef<HTMLDivElement>(null);
 const [open,setOpen]=useState(false),[reachedEnd,setReachedEnd]=useState(false),[read,setRead]=useState(false);
 const title=name==='community'?'社区规则':'免责声明';
 useEffect(()=>{if(!open||!resource.data)return;const node=box.current;if(node&&node.scrollHeight<=node.clientHeight+8)setReachedEnd(true)},[open,resource.data]);
 return <details className="registration-policy" open={open} onToggle={e=>setOpen(e.currentTarget.open)}>
  <summary><span>{t(title)}</span><span>{t(read?'已阅读':'打开阅读')}</span></summary>
  {open&&<>{resource.loading?<Loading/>:resource.error?<Retry error={resource.error} refresh={resource.refresh}/>:resource.data?.hash!==policyHash?<p role="alert">{t('规则版本已更新，请刷新注册页面。')}</p>:<>
   <div className="registration-policy-scroll" ref={box} tabIndex={0} role="region" aria-label={t(title)} onScroll={e=>{const n=e.currentTarget;if(n.scrollTop+n.clientHeight>=n.scrollHeight-8)setReachedEnd(true)}}><LegalText text={resource.data.text}/></div>
   <button type="button" className="registration-policy-confirm" disabled={!reachedEnd||read} onClick={()=>{setRead(true);onRead(name);setOpen(false)}}>{t(read?'已阅读':reachedEnd?'我已阅读此文件':'请阅读至末尾')}</button>
  </>}</>}
 </details>;
}
export function RegistrationConsent({policyHash,onRead}:{policyHash:string;onRead:(names:string[])=>void}){
 const {t}=useLocale(),[read,setRead]=useState<string[]>([]);
 useEffect(()=>{setRead([]);onRead([])},[policyHash,onRead]);
 function finish(name:string){const next=[...new Set([...read,name])];setRead(next);onRead(next)}
 return <fieldset className="registration-consent"><legend>{t('注册前请阅读')}</legend><p>{t('展开并阅读社区规则和免责声明后，再勾选同意。')}</p>{['community','disclaimer'].map(name=><PolicyReader key={name} name={name} policyHash={policyHash} onRead={finish}/>)}</fieldset>;
}
