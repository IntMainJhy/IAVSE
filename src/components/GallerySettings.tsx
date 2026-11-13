'use client';
import {useState} from 'react';
import {useLocale} from './LocaleProvider';
import {useResource} from './PageResources';
import {useUnsaved} from './useUnsaved';
import {post} from '@/lib/client';
type Candidate={handle:string;name:string};

export function GallerySettings(){
 const {t}=useLocale(),[query,setQuery]=useState(''),[lookup,setLookup]=useState('');
 const source=useResource('/api/admin/spaces/gallery'+(lookup?'?handle='+encodeURIComponent(lookup):''));
 const [draft,setDraft]=useState<{previous:string[];handles:string[]}|null>(null);
 const [feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false);
 const dirty=!!draft&&JSON.stringify(draft.handles)!==JSON.stringify(draft.previous);
 useUnsaved(dirty);
 if(!source.data)return <p role="status">{t(source.error||'加载中…')}</p>;
 const {selected,options,limit}=source.data as {selected:string[];options:Candidate[];limit:number};
 const handles=draft?.handles??selected;
 function change(next:string[]){setDraft({previous:draft?.previous??selected,handles:next});setFeedback('')}
 const matches=options.filter(item=>(item.name+' '+item.handle).toLowerCase().includes(query.trim().replace(/^@/,'').toLowerCase()));
 async function save(){
  if(!draft||!dirty||busy)return;
  setBusy(true);
  try{const saved=await post('/api/admin/spaces/gallery',draft);setDraft({previous:saved.selected,handles:saved.selected});source.refresh();setFeedback(t('画廊已保存'))}
  catch(e:any){setFeedback(t(e.message))}
  finally{setBusy(false)}
 }
 return <section className="space-panel gallery-curation">
  <header><h2>{t('画廊展示主页')}</h2><p>{t('按选择顺序展示公开主页。清空选择后恢复公开主页与内置示例。')}</p></header>
  <form onSubmit={event=>{event.preventDefault();setLookup(query.trim().replace(/^@/,''))}}><input aria-label={t('搜索公开主页')} placeholder={t('姓名或完整主页地址名')} value={query} onChange={e=>setQuery(e.target.value)}/><button className="space-btn" type="submit">{t('搜索')}</button></form>
  <div className="gallery-options">{matches.map(item=><label key={item.handle}><input type="checkbox" checked={handles.includes(item.handle)} disabled={busy||(!handles.includes(item.handle)&&handles.length>=limit)} onChange={e=>change(e.target.checked?[...handles,item.handle]:handles.filter(h=>h!==item.handle))}/>{item.name} <small>@{item.handle}</small></label>)}{!matches.length&&<p>{t('没有匹配的公开主页')}</p>}</div>
  {handles.length>0&&<ol className="gallery-picked">{handles.map(handle=><li key={handle}>@{handle} <button type="button" disabled={busy} onClick={()=>change(handles.filter(h=>h!==handle))} aria-label={t('移除')+' @'+handle}>×</button></li>)}</ol>}
  <div className="space-actions"><button className="space-btn primary" disabled={busy||!dirty||source.refreshing} onClick={save}>{t('保存展示名单')}</button>{handles.length>0&&<button className="space-btn" disabled={busy} onClick={()=>change([])}>{t('恢复自动展示')}</button>}{dirty&&<button className="space-btn" disabled={busy} onClick={()=>{setDraft(null);source.refresh();setFeedback('')}}>{t('取消')}</button>}</div>
  <span role="status">{feedback}</span>
 </section>;
}
