'use client';
import Link from 'next/link';
import {useLocale} from './LocaleProvider';
import {useResource} from './PageResources';
import {localeDate} from '@/lib/locale-format.mjs';
import styles from './AdminOverview.module.css';

export function AdminOverview(){
 const {t,locale}=useLocale(),r=useResource('/api/admin/overview'),data=r.data,a=data?.audience;
 const format=(n:number)=>new Intl.NumberFormat(locale).format(n||0);
 const queues=[['catalog','共享内容审核','catalog'],['posts','投稿审核','reviews'],['comments','评论审核','comments'],['spaces','博客主页审核','spaces'],['reports','举报与投诉','reports']];
 const types:Record<string,string>={projects:'项目',articles:'文章',resources:'资源'};
 const statuses:Record<string,string>={published:'已发布',draft:'草稿',offline:'已下架'};
 return <section className={'admin-overview '+styles.overview} aria-labelledby="admin-overview-title">
  <header className="admin-overview-heading"><h1 id="admin-overview-title">{t('管理中心')}</h1><button className="btn small" onClick={r.refresh} disabled={r.refreshing}>{t('刷新概览')}</button></header>
  {r.error?<div className="app-feedback error" role="alert">{t(r.error)} <button className="btn small" onClick={r.refresh}>{t('重试')}</button></div>:!a?<div className="skeleton" aria-label={t('内容加载中')}/>:<>
   <dl className="admin-inline-facts">{[['注册用户',a.users],['今日访客',a.trafficToday.uv],['今日浏览',a.trafficToday.pv],['累计浏览',a.trafficAll.pv]].map(([label,value])=><div key={label}><dt>{t(String(label))}</dt><dd>{format(Number(value))}</dd></div>)}</dl>
   <section className="admin-flat-section" aria-labelledby="admin-tasks-title"><h2 id="admin-tasks-title">{t('待办与治理')}</h2><div className="table-wrap" tabIndex={0} role="region" aria-label={t('待办与治理')}><table className="admin-queue-table"><thead><tr><th>{t('审核队列')}</th><th>{t('待处理')}</th><th><span className="sr-only">{t('操作')}</span></th></tr></thead><tbody>{queues.map(([key,label,path])=><tr key={key}><th scope="row"><Link href={'/admin/community/'+path}>{t(label)}</Link></th><td className={data.pending[key]>0?'has-work':''}>{format(data.pending[key])}</td><td><Link href={'/admin/community/'+path}>{t('查看')}</Link></td></tr>)}</tbody></table></div></section>
   {data.recent.length>0&&<section className="admin-flat-section" aria-labelledby="admin-recent-title"><h2 id="admin-recent-title">{t('最近编辑')}</h2><div className="admin-recent-list">{data.recent.map((item:any)=><Link key={item.id} href={'/admin/'+item.type+'/edit/'+item.id}><div><strong>{item.title||t('未命名内容')}</strong><span>{t(types[item.type])} · {t(statuses[item.status]||item.status)}</span></div><time dateTime={item.updated}>{localeDate(item.updated,locale,true)}</time></Link>)}</div></section>}
  </>}
 </section>;
}
