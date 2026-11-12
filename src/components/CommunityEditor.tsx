'use client';
import {useLocale} from './LocaleProvider';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {CoverField,PostCover} from './PostCover';
import {FeedAvatar} from './FeedAvatar';
import {AccountPolicyConsent} from './RegistrationConsent';
import {api,post} from '@/lib/client';
import {usePageSeed} from './PageResources';
import {useUnsaved} from './useUnsaved';
import {Badge,CommunityBackBar,CommunityField,CommunityText,Doc,Notice,ReviewNotes,Retry,Loading,primary,secondary,date} from './CommunityUI';
const blank={coverId:'',coverAlt:'',title:'',summary:'',body:'',category:'',tags:[] as string[],sourceName:'',sourceUrl:'',url:'',basis:'original',license:'',note:''};
export function CommunityEditor({id='',config,user,onPoliciesAccepted}:{id?:string,config:Doc,user:Doc,onPoliciesAccepted:(user:Doc)=>void}){const {t:tr,locale}=useLocale();
 const seed=usePageSeed('/api/community/submissions/'+id),initial=seed?.data,router=useRouter(),[row,setRow]=useState<any>(initial||null),[value,setValue]=useState<typeof blank>(initial?.draft||initial?.revisions[0]?.data||{...blank,category:config.taxonomy.categories.includes('技术笔记')?'技术笔记':config.taxonomy.categories[0]||''}),[loading,setLoading]=useState(!!id&&!seed),[loadError,setLoadError]=useState(seed?.error||''),[message,setMessage]=useState(''),[error,setError]=useState(''),[errorStatus,setErrorStatus]=useState(0),[busy,setBusy]=useState(false),[dirty,setDirty]=useState(false),[rightsConfirmed,setRightsConfirmed]=useState(false),[nonce,setNonce]=useState(0),[coverBusy,setCoverBusy]=useState(false);
 useEffect(()=>{let live=true;if(!id||seed&&nonce===0){setLoading(false);return}setLoading(!row);api('/api/community/submissions/'+id).then(r=>{if(live){setRow(r);setValue(r.draft||r.revisions[0]?.data||{...blank,category:config.taxonomy.categories.includes('技术笔记')?'技术笔记':config.taxonomy.categories[0]||''});setLoadError('')}}).catch(e=>{if(live)setLoadError(e.message)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[id,nonce]);
 useUnsaved(dirty);
 function change(key:string,next:any){setValue(v=>({...v,[key]:next}));setDirty(true);setMessage('')}
 const needsConsent=user.needsPolicyAcceptance??user.verification==='pending';
 async function save(submit=false){
  if(busy||coverBusy||submit&&(!rightsConfirmed||needsConsent||!user.canPublish||config.paused))return;
  setBusy(true);setError('');setErrorStatus(0);setMessage('');
  let draftSaved=false;
  try{
   const saved=await post('/api/community/submissions',{id:row?.id,version:row?.version,data:value});
   setDirty(false);setRow(saved);draftSaved=true;
   const result=submit?await post('/api/community/submissions/'+saved.id,{action:'submit',version:saved.version,policyVersion:config.policyVersion,policyHash:config.policyHash}):saved;
   setRow(result);setValue(result.draft||result.revisions?.[0]?.data||value);
   if(submit)setRightsConfirmed(false);
   else setMessage('草稿已保存到服务器。');
   if(!id)router.replace('/workspace/submissions/'+saved.id);
  }catch(e:any){
   setErrorStatus(e.status||0);
   setError(tr(e.message)+' '+tr(draftSaved?'草稿已保存，可稍后继续发布。':'填写内容仍保留在此页，可重试保存。'));
  }finally{setBusy(false)}
 }
 async function action(action:string){setBusy(true);setError('');setErrorStatus(0);try{const result=await post('/api/community/submissions/'+id,{action,version:row.version});setRow(result);setValue(result.draft||result.revisions?.[0]?.data||value);setDirty(false);setMessage(action==='withdraw'?'已撤回，可继续修改。':action==='offline'?'内容已下架，重新公开需要审核。':'已创建修订草稿。')}catch(e:any){setErrorStatus(e.status||0);setError(e.message)}finally{setBusy(false)}}
 if(loading)return <Loading/>;if(loadError)return <Retry error={tr(loadError)} refresh={()=>setNonce(n=>n+1)}/>;

 const pending=!!row?.pending_revision,canEdit=!pending&&user.status==='active',canPublish=canEdit&&user.canPublish===true&&!needsConsent&&!config.paused,latest=row?.revisions?.[0];
 const sourceFields=<> <CommunityField name="source-name" label={tr("原作者或机构")} value={value.sourceName} onChange={v=>change('sourceName',v)} required={value.basis!=='original'} maxLength={120}/>
 <CommunityField name="source-url" label={tr("正式来源页")} type="url" value={value.sourceUrl} onChange={v=>change('sourceUrl',v)} required={value.basis!=='original'} help={tr("仅限完整 HTTPS 公共链接，不接受短链、网盘或不明下载地址。")}/>
 <CommunityField name="target-url" label={tr("访客访问的目标链接")} type="url" value={value.url} onChange={v=>change('url',v)} required={value.basis!=='original'}/>
 <CommunityField name="source-license" label={tr("许可名称、出处或授权说明")} value={value.license} onChange={v=>change('license',v)} required={value.basis!=='original'} area maxLength={1000} help={tr("免费不代表可转载；介绍官方页面也需说明许可。")}/>
</>;
 return <section className="community-editor-page"><CommunityBackBar label="" href="/workspace" backLabel={tr("返回我的投稿")}/><header className="community-heading community-editor-heading"><div><h1>{id?tr("编辑分享"):tr("写一份分享")}</h1></div>{row&&<div className="community-status-pair"><Badge value={row.visibility}/>{latest&&latest.status!=='approved'&&<Badge value={latest.status}/>}</div>}</header><div className="community-editor-identity"><FeedAvatar name={user.displayName||user.nickname} avatarId={user.avatarId}/><div><strong>{user.displayName||user.nickname}</strong><small role="status">{dirty?tr("有未保存的修改"):row?tr("最近保存于 ")+date(row.updated,locale):tr("尚未保存草稿")}</small></div></div>
 {pending&&<Notice><strong>{tr("本次分享已进入人工复核。")}</strong> {row.pending?.reason&&<span><ReviewNotes reason={row.pending.reason}/> </span>}{tr("需要修改时，可以撤回这一版。")}</Notice>}
 {row?.visibility==='public'&&<Notice>{tr(pending||row.draft?'上一版仍公开展示。':'已发布到社区。')} <Link href={'/community/'+row.id}>{tr("查看公开页面")}</Link></Notice>}
 {user.status!=='active'&&<Notice>{tr("账号已受限，仍可查看历史并申诉。")}</Notice>}
 {user.status==='active'&&needsConsent&&<AccountPolicyConsent key={config.policyHash} config={config} onSaved={onPoliciesAccepted}/>}
 <div className="community-editor-layout"><form className="community-editor-main" onSubmit={e=>{e.preventDefault();void save(true)}}>
 <fieldset className="community-editor-fields" disabled={!canEdit||busy||coverBusy}><legend className="community-sr">{tr("分享内容")}</legend>
 <CommunityField name="submission-body" label={tr("分享内容")} value={value.body} onChange={v=>change('body',v)} required area maxLength={10000} help={tr("支持段落、## 标题和代码块。")}/>
 <details className="community-extra-options"><summary>{tr("更多选项")}</summary> <CommunityField name="submission-title" label={tr("标题")} value={value.title} onChange={v=>change('title',v)} maxLength={80} help={tr("选填；留空时从正文生成标题。")}/>
 <CoverField id={value.coverId||''} alt={value.coverAlt||''} disabled={!canEdit||busy||!user.canPublish} onBusy={setCoverBusy} onChange={(coverId,coverAlt)=>{change('coverId',coverId);change('coverAlt',coverAlt)}}/>
 <CommunityField name="submission-summary" label={tr("摘要")} value={value.summary} onChange={v=>change('summary',v)} area maxLength={300} help={tr("选填；留空时从正文生成摘要。")}/>
 <div className="field-row"><div className="field"><label htmlFor="submission-category">{tr("分类 *")}</label><select id="submission-category" value={value.category} onChange={e=>change('category',e.target.value)} required><option value="">{tr("请选择分类")}</option>{config.taxonomy.categories.map((c:string)=><option key={c} value={c}>{tr(c)}</option>)}</select></div><div className="field"><label htmlFor="submission-basis">{tr("权利依据 *")}</label><select id="submission-basis" value={value.basis} onChange={e=>change('basis',e.target.value)}><option value="original">{tr("本人原创")}</option><option value="authorized">{tr("已获授权")}</option><option value="open">{tr("开源或开放许可")}</option><option value="official">{tr("仅介绍官方链接")}</option></select></div></div>
 <fieldset className="community-tag-options"><legend>{tr("标签（最多 5 项）")}</legend>{config.taxonomy.tags.map((t:string)=><label key={t}><input type="checkbox" checked={value.tags.includes(t)} onChange={e=>change('tags',e.target.checked?[...value.tags,t]:value.tags.filter(x=>x!==t))}/>{tr(t)}</label>)}</fieldset>
 <section className="community-source-fields">{value.basis==='original'?<details className="community-source-disclosure"><summary>{tr("补充来源与许可（选填）")}</summary>{sourceFields}</details>:<><h2 className="community-form-section">{tr("来源与许可")}</h2>{sourceFields}</>}</section>
 <CommunityField name="review-note" label={tr("审核补充（不公开）")} value={value.note} onChange={v=>change('note',v)} area maxLength={2000} help={tr("不要填写身份证件、密码或无关个人信息。")}/>
</details>
 {canEdit&&<label className="community-check"><input type="checkbox" checked={rightsConfirmed} onChange={e=>setRightsConfirmed(e.target.checked)}/><span>{tr("我确认有权公开分享这些内容。")}</span></label>}
 </fieldset>
 <p className="submission-policy-note">{canEdit&&<>{tr(config.moderation?.mode==='manual'?"当前为人工审核模式，通过后公开。":"普通原创文字可直接发布。含外链、图片或需要核对的内容会进入复核。")} </>}<Link href="/legal/community" target="_blank">{tr("社区规则")}</Link></p>
 <div className="community-sticky-actions">{message&&<Notice>{tr(message)}</Notice>}{error&&<Notice error>{tr(error)}{errorStatus===401&&<> <Link href="/login" target="_blank">{tr("重新登录")}</Link></>}</Notice>}{canEdit&&<><button type="button" className={secondary} disabled={busy||coverBusy} onClick={()=>void save(false)}>{busy?tr("正在保存…"):tr("保存草稿")}</button><button className={primary} disabled={busy||coverBusy||!rightsConfirmed||!canPublish}>{busy?tr("正在处理…"):tr(config.moderation?.mode==='manual'?"提交审核":"发布分享")}</button></>}{pending&&<button type="button" className={secondary} disabled={busy||coverBusy} onClick={()=>void action('withdraw')}>{tr("撤回并继续编辑")}</button>}{row&&!pending&&!row.draft&&user.status==='active'&&<button type="button" className={secondary} disabled={busy||coverBusy} onClick={()=>void action('revise')}>{tr("创建新修订")}</button>}{row?.visibility==='public'&&<button type="button" className={secondary} disabled={busy||coverBusy} onClick={()=>{if(confirm(tr("下架后将停止公开，再次公开需要审核。继续吗？")))void action('offline')}}>{tr("主动下架")}</button>}</div>
 </form><aside className="community-editor-aside"><details className="community-preview"><summary>{tr("预览分享")}</summary><h3>{value.title||tr("尚未填写标题")}</h3><p>{value.summary}</p><PostCover id={value.coverId} alt={value.coverAlt}/><CommunityText body={value.body}/><p>{tr("来源：")}{value.sourceName||(value.basis==='original'?(user.displayName||user.nickname):tr("待填写"))}</p></details></aside></div>
 {row?.revisions?.length>0&&<section className="community-history"><h2>{tr("版本记录")}</h2>{row.revisions.map((r:Doc)=><div className="community-history-row" key={r.id}><div><strong>{tr("版本 ")}{r.number}</strong> <Badge value={r.status}/><p>{date(r.created,locale)}{r.reason&&<> · <ReviewNotes reason={r.reason}/></>}</p></div>{['returned','rejected','removed'].includes(r.status)&&<Link className="organic-text-link" href={'/report?kind=appeal&post='+row.id}>{tr("对此决定申诉")}</Link>}</div>)}</section>}
 {row?.cases?.length>0&&<section className="community-history"><h2>{tr("相关处理与申诉")}</h2>{row.cases.map((c:Doc)=><div className="community-history-row" key={c.id}><div><strong>{c.kind==='rights'?tr("权利通知"):tr("内容处理")}</strong> <Badge value={c.status}/><p>{c.response||tr("工作人员正在核查。")}</p><small>{tr("回执 ")}{c.id}</small></div>{c.kind==='rights'&&<CounterNotice item={c}/>}</div>)}</section>}
 </section>;
}
function CounterNotice({item}:{item:Doc}){const {t:tr}=useLocale();const[text,setText]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);return <details className="community-counter"><summary>{tr("提交不侵权声明")}</summary><p>{tr("请在私密材料中提供真实身份、联系渠道及不侵权的初步证据。负责人将依法核查、转送，不会自动恢复内容。")}</p><form onSubmit={async e=>{e.preventDefault();setBusy(true);try{await post('/api/community/counter-notice',{id:item.id,version:item.version,statement:text,truthful:true});setMessage("声明已提交，请等候负责人跟进。")}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}}><CommunityField label={tr("私密声明与证据")} name={'counter-'+item.id} value={text} onChange={setText} area required maxLength={6000}/><label className="community-check"><input type="checkbox" required/>{tr("我确认提交的声明与证据真实，并了解必要材料会依法转送。")}</label><button className={secondary} disabled={busy}>{tr("提交声明")}</button>{message&&<Notice>{tr(message)}</Notice>}</form></details>}
