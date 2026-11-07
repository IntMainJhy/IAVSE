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
 const types:Record<string,string>={projects:'项目',articles:'文章',resources:'资源'};
 const statuses:Record<string,string>={published:'已发布',draft:'草稿',offline:'已下架'};
 return <section className={'admin-overview admin-bento-overview admin-overview-focused '+styles.overview} aria-labelledby="admin-overview-title">
  <header className="admin-overview-heading"><h1 id="admin-overview-title">{t('管理中心')}</h1><StarBorder className="admin-refresh-star admin-focus-refresh" theme={dark?'dark':'light'} backgroundColor="var(--admin-surface)" textColor="var(--admin-ink)" borderColor="var(--admin-line)" color={dark?'#a7c3ff':'#2459d3'} duration={8} sparkle={false} onClick={r.refresh} disabled={r.refreshing} aria-label={t('刷新概览')} title={t('刷新概览')}><Icon name="refresh"/></StarBorder></header>
  {r.error?<div className="app-feedback error" role="alert">{t(r.error)} <button className="btn small" onClick={r.refresh}>{t('重试')}</button></div>:!a?<div className="skeleton" aria-label={t('内容加载中')}/>:<>
   <AnimatedContent trigger="mount" distance={6} initialOpacity={0.9} duration={0.28} className="admin-focus-grid">
    <section className="admin-bento-card admin-bento-primary admin-focus-content" aria-labelledby="admin-content-title">
     <h2 id="admin-content-title">{t('内容管理')}</h2><p>{t('创建、整理和发布网站内容。')}</p>
     <div className="admin-focus-actions"><Link prefetch={false} href="/admin/articles/new" className="admin-focus-create"><Icon name="plus"/>{t('新建{0}',[t('文章')])}</Link><Link prefetch={false} href="/admin/articles" className="admin-focus-manage">{t('内容管理')}<Icon name="arrow"/></Link></div>
    </section>
    <section className="admin-bento-card admin-focus-tools" aria-labelledby="admin-tools-title"><h2 id="admin-tools-title">{t('常用功能')}</h2>
     <nav className="admin-focus-shortcuts" aria-label={t('常用功能')}>{[['projects','项目','folder'],['resources','资源','link'],['files','文件素材','grid']].map(([path,label,icon])=><Link prefetch={false} href={'/admin/'+path} key={path}><SpotlightCard theme={dark?'dark':'light'} spotlightColor={dark?'#a7c3ff':'#2459d3'} intensity={0.08} proximity={0} flare={false} smoothing={0.12} className="admin-focus-shortcut"><Icon name={icon}/><span>{t(label)}</span></SpotlightCard></Link>)}</nav>
     <details className="admin-focus-review" open={pending>0} data-has-work={pending>0}><summary><Icon name="shield"/><span>{t('审核与治理')}</span><span className="admin-focus-badge" aria-label={t('待处理事项')+' '+format(pending)}>{format(pending)}</span><Icon name="chevron-down"/></summary><nav className="admin-focus-queues" aria-label={t('审核与治理')}>{queues.map(([key,label,path,icon])=><Link prefetch={false} key={key} href={'/admin/community/'+path}><Icon name={icon}/><span>{t(label)}</span><strong data-has-work={data.pending[key]>0}>{format(data.pending[key])}</strong><Icon name="arrow"/></Link>)}</nav></details>
    </section>
   </AnimatedContent>
   <section className="admin-bento-card admin-bento-recent admin-focus-recent" aria-labelledby="admin-recent-title"><header><h2 id="admin-recent-title">{t('最近编辑')}</h2><Link prefetch={false} href="/admin/articles" className="admin-bento-create">{t('内容管理')}<Icon name="arrow"/></Link></header>{data.recent.length?<div className="admin-recent-list">{data.recent.map((item:any)=><Link prefetch={false} key={item.id} href={'/admin/'+item.type+'/edit/'+item.id}><div><strong>{item.title||t('未命名内容')}</strong><span>{t(types[item.type])} · {t(statuses[item.status]||item.status)}</span></div><time dateTime={item.updated}>{localeDate(item.updated,locale,true)}</time></Link>)}</div>:<div className="admin-bento-empty"><Icon name="edit"/><p>{t('暂无内容，创建你的第一份内容。')}</p></div>}</section>
   <details className="admin-bento-card admin-focus-statistics"><summary><Icon name="chart"/><span>{t('网站运行概览')}</span><Icon name="chevron-down"/></summary><dl className="admin-focus-metrics">{[['站点内容',format(data.totals.content)],['已发布站点内容',format(a.publicContent)],['已公开主页',format(a.publicSpaces)],['注册用户',format(a.users)],['今日访客',format(a.trafficToday.uv)],['今日浏览',format(a.trafficToday.pv)],['累计浏览',format(a.trafficAll.pv)],['文件存储',bytes(data.totals.bytes)]].map(([label,value])=><div key={label}><dt>{t(label)}</dt><dd>{value}</dd></div>)}</dl><footer><span>{a.timezone}</span><Link prefetch={false} href="/admin/files">{t('管理文件')}<Icon name="arrow"/></Link></footer></details>
  </>}
 </section>;
}
