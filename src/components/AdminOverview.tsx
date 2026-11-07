'use client';
import SpotlightCard from './react-bits/SpotlightCard';
import StarBorder from './react-bits/StarBorder';
import AnimatedContent from './react-bits/AnimatedContent';
import {useAdminAppearance} from './AdminAppearance';
import Link from 'next/link';
import {useLocale} from './LocaleProvider';
import {useResource} from './PageResources';
import {Icon} from './Icons';
import {bytes} from '@/lib/client';
import {localeDate} from '@/lib/locale-format.mjs';
import styles from './AdminOverview.module.css';

export function AdminOverview(){
 const {dark}=useAdminAppearance(),{t,locale}=useLocale(),r=useResource('/api/admin/overview'),data=r.data,a=data?.audience;
 const format=(n:number)=>new Intl.NumberFormat(locale).format(n||0);
 const queues=[['catalog','共享内容审核','catalog','file'],['posts','投稿审核','reviews','edit'],['comments','评论审核','comments','comment'],['spaces','博客主页审核','spaces','grid'],['reports','举报与投诉','reports','folder']];
 const pending=queues.reduce((sum,[key])=>sum+(data?.pending[key]||0),0);
 const firstQueue=queues.find(([key])=>data?.pending[key]>0)||queues[0];
 const types:Record<string,string>={projects:'项目',articles:'文章',resources:'资源'};
 const statuses:Record<string,string>={published:'已发布',draft:'草稿',offline:'已下架'};
 return <section className={'admin-overview admin-bento-overview '+styles.overview} aria-labelledby="admin-overview-title">
  <header className="admin-overview-heading"><div><h1 id="admin-overview-title">{t('管理中心')}</h1><p className="admin-overview-description">{t('网站运行概览')}</p></div><StarBorder className="admin-refresh-star" theme={dark?'dark':'light'} backgroundColor="var(--admin-surface)" textColor="var(--admin-ink)" borderColor="var(--admin-line)" color={dark?'#a7c3ff':'#2459d3'} duration={8} sparkle={false} onClick={r.refresh} disabled={r.refreshing}>{t('刷新概览')}</StarBorder></header>
  {r.error?<div className="app-feedback error" role="alert">{t(r.error)} <button className="btn small" onClick={r.refresh}>{t('重试')}</button></div>:!a?<div className="skeleton" aria-label={t('内容加载中')}/>:<>
   <AnimatedContent trigger="mount" distance={10} initialOpacity={0.8} duration={0.45} className="admin-bento-top">
    <Link prefetch={false} href={'/admin/community/'+firstQueue[2]} className="admin-bento-card admin-bento-primary">
     <div className="admin-bento-primary-heading"><h2>{t('待办与治理')}</h2><Icon name="arrow"/></div>
     <div className="admin-bento-pending"><strong>{format(pending)}</strong><span>{t('待处理事项')}</span></div>
     <p>{t('内容审核、评论与投诉，集中处理。')}</p>
     <dl className="admin-bento-published"><div><dt>{t('已公开主页')}</dt><dd>{format(a.publicSpaces)}</dd></div><div><dt>{t('已发布站点内容')}</dt><dd>{format(a.publicContent)}</dd></div></dl>
     <span className="admin-bento-action">{t('查看待办')}<Icon name="arrow"/></span>
    </Link>
    <div className="admin-bento-card admin-bento-stat"><Icon name="user"/><strong>{format(a.users)}</strong><h2>{t('注册用户')}</h2></div>
    <div className="admin-bento-card admin-bento-stat admin-bento-visitors"><Icon name="eye"/><strong>{format(a.trafficToday.uv)}</strong><h2>{t('今日访客')}</h2></div>
    <div className="admin-bento-card admin-bento-traffic"><div><h2>{t('今日浏览')}</h2><strong>{format(a.trafficToday.pv)}</strong></div><div><h2>{t('累计浏览')}</h2><strong>{format(a.trafficAll.pv)}</strong></div><span>{a.timezone}</span></div>
   </AnimatedContent>
   <section className="admin-task-section" aria-label={t('待办与治理')}><AnimatedContent trigger="mount" distance={10} initialOpacity={0.8} duration={0.45} className="admin-task-cards admin-bento-queues">{queues.map(([key,label,path,icon])=><Link prefetch={false} key={key} href={'/admin/community/'+path} className="admin-bento-card admin-bento-queue"><SpotlightCard theme={dark?'dark':'light'} spotlightColor={dark?'#a7c3ff':'#2459d3'} intensity={0.1} proximity={0} flare={false} smoothing={0.12} className="admin-bento-spotlight"><div className="admin-bento-queue-heading"><Icon name={icon}/><h3>{t(label)}</h3><Icon name="arrow"/></div><strong className={data.pending[key]>0?'has-work':''}>{format(data.pending[key])}</strong><span>{t('待处理')}</span></SpotlightCard></Link>)}</AnimatedContent></section>
   <div className="admin-bento-work">
    <section className="admin-bento-card admin-bento-recent" aria-labelledby="admin-recent-title"><header><h2 id="admin-recent-title">{t('最近编辑')}</h2><Link prefetch={false} href="/admin/articles/new" className="admin-bento-create">{t('创建内容')}<Icon name="plus"/></Link></header>{data.recent.length?<div className="admin-recent-list">{data.recent.map((item:any)=><Link prefetch={false} key={item.id} href={'/admin/'+item.type+'/edit/'+item.id}><div><strong>{item.title||t('未命名内容')}</strong><span>{t(types[item.type])} · {t(statuses[item.status]||item.status)}</span></div><time dateTime={item.updated}>{localeDate(item.updated,locale,true)}</time></Link>)}</div>:<div className="admin-bento-empty"><Icon name="edit"/><p>{t('暂无内容，创建你的第一份内容。')}</p></div>}</section>
    <Link prefetch={false} href="/admin/files" className="admin-bento-card admin-bento-storage"><div><Icon name="folder"/><Icon name="arrow"/></div><strong>{bytes(data.totals.bytes)}</strong><h2>{t('文件存储')}</h2><span>{t('管理文件')}</span></Link>
   </div>
  </>}
 </section>;
}
