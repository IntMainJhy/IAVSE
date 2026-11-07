'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {post} from '@/lib/client';
import {useResource} from './PageResources';
import {useUnsaved} from './useUnsaved';
import {Icon} from './Icons';
import './DesignIntakeAdmin.css';

type Entry={id:string;kind:'design'|'skill';status:string;visibility:string;version:number;draft:Record<string,any>;reason:string;created:string;updated:string;collector:string;published?:Record<string,any>|null};
const names:Record<string,string>={pending:'待审核',approved:'已收录',rejected:'不收录',offline:'已下架'};
const blank={title:'',summary:'',category:'product',slug:'',source:{name:'',url:''},tags:[],palette:['#f5f5f7','#1d1d1f','#0071e3'],typography:'',layout:'',motion:'',prompt:'',specification:'',thumbnail:'',preview:{theme:'light',layout:'editorial',accent:'#0071e3'},featured:false};
const date=(value:string)=>value?new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}):'尚未运行';

export function DesignIntakeAdmin(){
 const [status,setStatus]=useState('pending'),[kind,setKind]=useState('all'),[selected,setSelected]=useState<Entry|null>(null),[draft,setDraft]=useState<Record<string,any>|null>(null),[creating,setCreating]=useState(false),[newKind,setNewKind]=useState('design'),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(''),[message,setMessage]=useState(''),[reason,setReason]=useState(''),[verified,setVerified]=useState(false),[page,setPage]=useState(1);
 const editorRef=useRef<HTMLElement>(null),editorHeadingRef=useRef<HTMLHeadingElement>(null),[editorOpenRequest,setEditorOpenRequest]=useState(0);
 const resource=useResource('/api/admin/discovery?'+new URLSearchParams({status,kind,page:String(page)})),data=resource.data;
 useUnsaved(dirty);
 useEffect(()=>{if(data&&!resource.refreshing&&data.page!==page)setPage(data.page)},[data,page,resource.refreshing]);
 useEffect(()=>{
  if(!editorOpenRequest)return;
  const frame=requestAnimationFrame(()=>{
   const editor=editorRef.current,heading=editorHeadingRef.current;if(!editor||!heading)return;
   editor.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   heading.focus({preventScroll:true});
  });
  return()=>cancelAnimationFrame(frame);
 },[editorOpenRequest]);
 const guard=()=>!dirty||confirm('有尚未保存的修改，仍要切换吗？');
 function open(row:Entry){if(!guard())return;setSelected(row);setDraft(structuredClone(row.draft));setCreating(false);setDirty(false);setReason('');setVerified(false);setMessage('');setEditorOpenRequest(request=>request+1)}
 function change(key:string,value:any){setDraft(previous=>({...previous,[key]:value}));setDirty(true);setVerified(false)}
 function create(){if(!guard())return;setSelected(null);setDraft(structuredClone(blank));setCreating(true);setNewKind('design');setDirty(true);setReason('');setVerified(false);setMessage('');setEditorOpenRequest(request=>request+1)}
 async function run(action:string){
  if(busy)return;setBusy(action);setMessage('');
  try{
   const result=await post('/api/admin/discovery',action==='collect'?{action}:action==='settings'?{action,enabled:!data.settings.enabled}:creating?{action:'create',kind:newKind,draft}:{action,id:selected?.id,version:selected?.version,draft,reason,verified});
   if(['create','save','approve','reject','offline'].includes(action)){setSelected(result);setDraft(structuredClone(result.draft));setCreating(false);setDirty(false);setVerified(false);setReason('')}
   setMessage(action==='collect'?`本次新增 ${result.added} 项待审核资源${result.status==='partial'?'，部分来源暂时不可用，可在记录中查看。':'。'}`:action==='approve'?'审核通过，已发布到资源库。':action==='reject'?'已标记不收录。':action==='offline'?'已从公开资源库下架。':action==='settings'?'采集设置已更新。':'草稿已保存，公开内容需要单独审核发布。');resource.refresh();
  }catch(error:any){setMessage(error.message)}finally{setBusy('')}
 }
 function filter(key:'status'|'kind',value:string){if(!guard())return;key==='status'?setStatus(value):setKind(value);setPage(1);setSelected(null);setDraft(null);setCreating(false);setDirty(false)}
 const count=(value:string)=>data?.counts?.find((item:any)=>item.status===value)?.count||0;
 const active=!!data?.settings?.heartbeat&&Date.now()-new Date(data.settings.heartbeat).getTime()<180000;
 const currentKind=creating?newKind:selected?.kind;
 const field=(key:string,label:string,rows=1,placeholder='')=><label className="intake-field" key={key}><span>{label}</span>{rows>1?<textarea rows={rows} value={draft?.[key]||''} onChange={event=>change(key,event.target.value)} placeholder={placeholder}/>:<input value={draft?.[key]||''} onChange={event=>change(key,event.target.value)} placeholder={placeholder}/>}</label>;
 return <div className="design-intake">
  <header className="page-head"><div><h1>资源采集与审核</h1><p>发现新的设计与 Skill，由你决定值得收录的内容。</p></div><div className="actions"><button className="btn" onClick={create} disabled={!!busy}>手动添加</button><button className="btn primary" onClick={()=>void run('collect')} disabled={!!busy}>{busy==='collect'?'正在采集…':'立即采集'}</button></div></header>
  {message&&<div className="app-feedback" role="status">{message}</div>}
  <section className="intake-schedule" aria-label="自动采集设置"><div><strong>每天 09:00 自动发现</strong><p>Asia/Shanghai · 采集只进入待审核，不会自动发布。</p></div><div className="intake-service"><span data-active={active}>{active?'调度服务运行中':'调度服务未连接'}</span><button className="btn small" disabled={!!busy||!data} aria-pressed={!!data?.settings.enabled} onClick={()=>void run('settings')}>{data?.settings.enabled?'暂停每日采集':'开启每日采集'}</button></div></section>
  <div className="intake-toolbar"><div className="intake-tabs" role="group" aria-label="审核状态">{Object.entries(names).map(([value,label])=><button key={value} type="button" aria-pressed={status===value} onClick={()=>filter('status',value)}>{label}<span>{count(value)}</span></button>)}</div><label className="intake-kind"><span className="sr-only">资源类型</span><select value={kind} onChange={event=>filter('kind',event.target.value)}><option value="all">全部类型</option><option value="design">UI 设计</option><option value="skill">Skill</option></select></label></div>
  {resource.error?<div className="app-feedback error" role="alert">{resource.error}<button className="btn small" onClick={resource.refresh}>重试</button></div>:!data?<div className="intake-loading" role="status">正在读取审核队列…</div>:<>
   <div className="intake-list" aria-busy={resource.refreshing}>{data.items.map((item:Entry)=><button key={item.id} type="button" className="intake-row" aria-pressed={selected?.id===item.id} onClick={()=>open(item)}><span className="intake-kind-mark">{item.kind==='design'?'UI':'SK'}</span><span className="intake-row-copy"><strong>{item.draft.title}</strong><small>{item.draft.source?.name} · {item.collector==='manual'?'手动添加':'自动发现'}</small></span><span className="intake-row-status">{names[item.status]}<small>{item.visibility==='public'?'当前有公开版本':'仅后台可见'}</small></span><span className="intake-row-edit" aria-hidden="true"><Icon name="edit"/></span></button>)}{!data.items.length&&<div className="intake-empty"><strong>{status==='pending'?'审核队列已清空':'这里暂时没有资源'}</strong><p>可以立即采集，或手动添加需要整理的设计来源。</p></div>}</div>
   {data.pages>1&&<nav className="pagination" aria-label="审核队列分页"><button className="btn small" disabled={data.page===1||resource.refreshing} onClick={()=>{if(guard())setPage(data.page-1)}}>上一页</button><span>{data.page} / {data.pages}</span><button className="btn small" disabled={data.page>=data.pages||resource.refreshing} onClick={()=>{if(guard())setPage(data.page+1)}}>下一页</button></nav>}
  </>}
  {draft&&<section ref={editorRef} className="intake-editor" aria-labelledby="intake-editor-title"><div className="intake-editor-heading"><div><h2 ref={editorHeadingRef} id="intake-editor-title" tabIndex={-1}>{creating?'添加资源':draft.title}</h2></div><button className="btn small" onClick={()=>{if(guard()){setDraft(null);setSelected(null);setCreating(false);setDirty(false)}}}>收起</button></div>
   {selected?.visibility==='public'&&<p className="intake-note">编辑后保存为待审核版本，已公开版本会保留。需要立即隐藏时请选择下架。</p>}
   <form onSubmit={event=>{event.preventDefault();void run(creating?'create':'save')}}><fieldset disabled={!!busy}>
    <div className="intake-fields">
     {creating&&<label className="intake-field"><span>资源类型</span><select value={newKind} onChange={event=>{setNewKind(event.target.value);change('category',event.target.value==='skill'?'engineering':'product')}}><option value="design">UI 设计</option><option value="skill">Skill</option></select></label>}
     {field('title','标题')}{field('slug','地址标识（可留空自动生成）',1,'editorial-workspace')}
     <label className="intake-field"><span>原始来源名称</span><input value={draft.source.name} onChange={event=>change('source',{...draft.source,name:event.target.value})}/></label>
     <label className="intake-field"><span>原始来源链接（HTTPS）</span><input type="url" required value={draft.source.url} onChange={event=>change('source',{...draft.source,url:event.target.value})}/></label>
     {currentKind==='skill'?<label className="intake-field"><span>分类</span><select value={draft.category||'engineering'} onChange={event=>change('category',event.target.value)}>{[['engineering','开发工程'],['design','界面设计'],['testing','测试排错'],['motion','动效交互'],['knowledge','知识管理'],['agents','沟通协作']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>:field('category','分类')}
     <label className="intake-field"><span>标签（逗号分隔）</span><input value={(draft.tags||[]).join(', ')} onChange={event=>change('tags',event.target.value.split(/[,，]/).map(item=>item.trim()))}/></label>
    </div>
    {field('summary','资源介绍 · 至少 30 字',3)}
    {currentKind==='design'?<>
     <div className="intake-fields"><label className="intake-field"><span>配色（至少 3 个 HEX 颜色，逗号分隔）</span><input value={(draft.palette||[]).join(', ')} onChange={event=>change('palette',event.target.value.split(/[,，]/).map(item=>item.trim()))}/></label>{field('thumbnail','预览图片（可选站内图片路径）',1,'/media/designs/example.webp')}
      <label className="intake-field"><span>安全预览模板</span><select value={draft.preview?.layout||'editorial'} onChange={event=>change('preview',{...draft.preview,layout:event.target.value})}>{[['optical','光学玻璃'],['spatial','空间叙事'],['bento','Bento 卡片'],['editorial','编辑式排版'],['workspace','工作台'],['product','产品展示'],['developer','开发工具'],['portfolio','作品集'],['brutalist','实验排版']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label className="intake-field"><span>预览色调</span><select value={draft.preview?.theme||'light'} onChange={event=>change('preview',{...draft.preview,theme:event.target.value})}><option value="light">浅色</option><option value="dark">深色</option></select></label>
      <label className="intake-field"><span>预览强调色</span><input type="color" value={draft.preview?.accent||'#0071e3'} onChange={event=>change('preview',{...draft.preview,accent:event.target.value})}/></label>
     </div>
     {field('typography','字体与文字层级',3)}{field('layout','布局与响应式',4)}{field('motion','动效、交互与减少动态模式',3)}{field('prompt','可复制的复刻提示词 · 至少 120 字',7)}{field('specification','完整设计规范 · 至少 180 字',9)}
     <p className="intake-note">模板预览使用本站组件渲染，不运行来源网站的 HTML 或脚本。图片留空时使用所选模板作为封面。</p>
    </>:<><div className="intake-fields">{field('repo','GitHub 仓库',1,'owner/repo')}{field('installUrl','安装说明链接')}{field('license','许可证')}{field('licenseUrl','许可证链接')}<label className="intake-field"><span>支持工具 · Codex、Claude Code、Cursor、Gemini CLI、OpenCode（逗号分隔）</span><input value={(draft.tools||[]).join(', ')} onChange={event=>change('tools',event.target.value.split(/[,，]/).map(item=>item.trim()))}/></label></div>{field('installCommand','安装命令 · 仅作为可复制文本展示',2)}{field('recommendation','推荐理由与适合任务 · 至少 20 字',4)}<label className="intake-check"><input type="checkbox" checked={!!draft.recommended} onChange={event=>change('recommended',event.target.checked)}/><span>加入精选推荐</span></label></>}
    <div className="intake-save"><button className="btn primary" type="submit" disabled={!dirty}>{busy==='save'||busy==='create'?'正在保存…':'保存待审核版本'}</button>{draft.source.url.startsWith('https://')&&<a className="btn" href={draft.source.url} target="_blank" rel="noopener noreferrer">打开原始来源 ↗</a>}</div>
   </fieldset></form>
   {!creating&&selected&&<div className="intake-decision"><h3>审核决定</h3><p>核对来源、许可和预览，并确认提示词及规范可实际使用后再发布。</p><label className="intake-field"><span>审核说明 / 不收录原因</span><textarea rows={2} value={reason} onChange={event=>setReason(event.target.value)} placeholder="记录核验结果，至少 5 字" disabled={!!busy}/></label><label className="intake-check"><input type="checkbox" checked={verified} onChange={event=>setVerified(event.target.checked)} disabled={!!busy||dirty}/><span>已核对原始来源、许可及可复用内容</span></label>{dirty&&<p className="intake-note">请先保存当前修改，再审核发布。</p>}<div className="actions"><button className="btn primary" onClick={()=>void run('approve')} disabled={!!busy||dirty||selected.status!=='pending'||!verified||reason.trim().length<5}>通过并发布</button><button className="btn" onClick={()=>void run('reject')} disabled={!!busy||dirty||selected.status!=='pending'||reason.trim().length<5}>不收录</button>{selected.visibility==='public'&&<button className="btn" onClick={()=>void run('offline')} disabled={!!busy||dirty}>下架公开版本</button>}{selected.visibility==='public'&&<Link className="btn" href={selected.kind==='design'?'/resources/designs/'+(selected.published?.slug||selected.draft.slug):'/skills/'+(selected.published?.slug||selected.draft.slug)} target="_blank" rel="noopener noreferrer">查看公开页 ↗</Link>}</div></div>}
  </section>}
  <details className="intake-runs"><summary>采集记录与服务状态</summary><div className="intake-runs-body"><p>最近心跳：{date(data?.settings?.heartbeat)} · 调度时间：每天 09:00（Asia/Shanghai）</p><p>服务安装：<code>node scripts/install-discovery-service.mjs install</code>。开启采集开关后，需保持调度服务运行；电脑休眠时会在唤醒后补做当天采集。</p>{data?.runs?.length?data.runs.map((run:any)=><article key={run.id}><strong>{date(run.started)} · {{complete:'已完成',partial:'部分完成',failed:'失败',running:'进行中',interrupted:'已中断'}[run.status as string]||run.status}</strong>{run.results.map((item:any)=><p key={item.source}>{item.source}：新增 {item.added} · 重复 {item.duplicates}{item.error&&<span> · {item.error}</span>}</p>)}</article>):<p>尚无采集记录。</p>}</div></details>
 </div>;
}
