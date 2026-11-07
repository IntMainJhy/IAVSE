'use client';

import {useEffect,useId,useRef,useState} from 'react';
import {post} from '@/lib/client';
import {useLocale} from './LocaleProvider';
import {useResource} from './PageResources';
import {useUnsaved} from './useUnsaved';

type Announcement={title:string;url:string};
type AnnouncementConfig={enabled:boolean;items:Announcement[]};
type Row=Announcement&{id:number};

export function AnnouncementSettings({notify}:{notify:(message:string)=>void}){
 const {t}=useLocale(),resource=useResource('/api/admin/config?key=announcements');
 if(!resource.data)return <section className="panel form-section" id="admin-settings-announcements" style={{gridColumn:'1 / -1'}}><h2>{t('网站公告')}</h2>{resource.error?<div className="app-feedback error" role="alert"><p>{t(resource.error)}</p><button type="button" className="btn small" onClick={resource.refresh}>{t('重新加载')}</button></div>:<p role="status" className="small-text">{t('正在读取公告…')}</p>}</section>;
 return <AnnouncementEditor initial={resource.data} notify={notify}/>;
}
function AnnouncementEditor({initial,notify}:{initial:AnnouncementConfig;notify:(message:string)=>void}){
 const {t}=useLocale(),prefix=useId(),nextId=useRef(initial.items.length);
 const [enabled,setEnabled]=useState(initial.enabled),[rows,setRows]=useState<Row[]>(()=>initial.items.map((item,index)=>({...item,id:index}))),[baseline,setBaseline]=useState(JSON.stringify(initial)),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const value:AnnouncementConfig={enabled,items:rows.map(({title,url})=>({title,url}))},serialized=JSON.stringify(value),dirty=serialized!==baseline;
 useUnsaved(dirty);
 useEffect(()=>{if(dirty)setSaved(false);},[serialized]);
 const patch=(id:number,field:keyof Announcement,text:string)=>setRows(previous=>previous.map(row=>row.id===id?{...row,[field]:text}:row));
 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setError('');setSaved(false);
  try{
   const result:AnnouncementConfig=await post('/api/admin/config',{key:'announcements',value});
   setEnabled(result.enabled);setRows(result.items.map((item,index)=>({...item,id:rows[index]?.id??nextId.current++})));setBaseline(JSON.stringify(result));setSaved(true);
   notify('网站公告已保存');window.dispatchEvent(new Event('iavse-announcements-updated'));
  }catch(cause:any){setError(cause.message||'公告保存失败，请重试');}finally{setBusy(false);}
 }
 return <section className="panel form-section" id="admin-settings-announcements" style={{gridColumn:'1 / -1'}}>
  <h2>{t('网站公告')}</h2><p className="small-text">{t('显示在首页以外的平台页面。最多 3 条，保存后同步到公告栏。')}</p>
  <form onSubmit={save} inert={busy}>
   <label className="check-line"><input type="checkbox" checked={enabled} onChange={event=>setEnabled(event.target.checked)}/><span>{t('启用网站公告')}</span></label>
   {rows.map((row,index)=><fieldset className="form-section" key={row.id}><legend>{t('公告 {0}',[String(index+1)])}</legend>
    <div className="field"><label htmlFor={prefix+'-title-'+row.id}>{t('公告文字')}</label><input id={prefix+'-title-'+row.id} value={row.title} maxLength={120} required onChange={event=>patch(row.id,'title',event.target.value)}/></div>
    <div className="field"><label htmlFor={prefix+'-url-'+row.id}>{t('跳转链接（选填）')}</label><input id={prefix+'-url-'+row.id} value={row.url} maxLength={2000} placeholder="/resources" aria-describedby={prefix+'-url-help'} onChange={event=>patch(row.id,'url',event.target.value)}/></div>
    <button type="button" className="btn small" onClick={()=>setRows(previous=>previous.filter(item=>item.id!==row.id))}>{t('删除公告 {0}',[String(index+1)])}</button>
   </fieldset>)}
   <p className="small-text" id={prefix+'-url-help'}>{t('链接支持站内路径或完整 HTTPS 网址；留空仅展示文字。关闭公告后，已编辑内容仍会保留。')}</p>
   <div className="actions"><button type="button" className="btn" disabled={rows.length>=3} onClick={()=>setRows(previous=>[...previous,{id:nextId.current++,title:'',url:''}])}>{t('添加公告')}</button><button className="btn primary" disabled={busy||!dirty||enabled&&!rows.length}>{busy?t('正在保存…'):t('保存公告')}</button><span className="small-text" role="status" aria-live="polite">{saved?t('公告已保存'):dirty?t('有未保存的修改'):t('所有更改已保存')}</span></div>
   {enabled&&!rows.length&&<p className="app-feedback" role="status">{t('启用公告时请至少保留一条公告。')}</p>}
   {error&&<p className="app-feedback error" role="alert">{t(error)}</p>}
  </form>
 </section>;
}
