'use client';
import Link from 'next/link';
import {useLocale} from './LocaleProvider';
import {useResource} from './PageResources';
import {bytes} from '@/lib/client';
import {localeDate} from '@/lib/locale-format.mjs';
import styles from './AdminOverview.module.css';

const copy:Record<string,[string,string]>={
 '网站运行概览':['Your platform at a glance','プラットフォームの概要'],
 '注册用户':['Registered users','登録ユーザー'], '累计浏览':['Total page views','累計ページビュー'],
 '今日浏览':['Views today','今日のページビュー'], '今日访客':['Visitors today','今日の訪問者'],
 '不含已注销账号':['Closed accounts excluded','退会済みアカウントを除く'],
 '去重访客':['Unique visitors','ユニーク訪問者'], '今日新增':['Joined today','今日の新規登録'],
 '近7天新增':['Joined in 7 days','過去7日間の新規登録'], '近30天新增':['Joined in 30 days','過去30日間の新規登録'],
 '账号分布':['Account status','アカウント状況'], '正常':['Active','有効'], '受限':['Restricted','制限中'], '封禁':['Banned','禁止'],
 '内容与空间':['Content and spaces','コンテンツとスペース'], '已发布主页':['Published spaces','公開済みスペース'],
 '已发布投稿':['Published submissions','公開済み投稿'], '全部主页':['All spaces','すべてのスペース'],
 '站点内容':['Site content','サイトコンテンツ'], '待办与治理':['Review and moderation','審査と管理'],
 '历史待审评论':['Legacy comment reviews','以前のコメント審査'], '博客内容审核':['Blog content reviews','ブログコンテンツの審査'],
 '账号通知邮件':['Account notification email','アカウント通知メール'],
 '统计口径：上海时区。访客按匿名浏览器标识估算；不计管理员、已识别机器人及拒绝追踪的访问。':['Shanghai time. Visitors are estimated by anonymous browser identifiers; administrators, detected bots and opt-out visits are excluded.','上海時間。匿名ブラウザー識別子で訪問者を推定し、管理者、検出されたボット、追跡拒否の訪問を除外します。'],
 '已注销':['Closed','退会済み'], '刷新概览':['Refresh overview','概要を更新'],
};
export function AdminOverview(){
 const {t,locale}=useLocale(),r=useResource('/api/admin/overview');
 const tr=(text:string)=>locale==='zh'?text:copy[text]?.[locale==='ja'?1:0]||t(text);
 const queues=[['posts','待审投稿','reviews'],['comments','历史待审评论','comments'],['spaces','博客内容审核','spaces'],['reports','待处理反馈','reports']];
 const types:Record<string,string>={projects:'项目',articles:'文章',resources:'资源'};
 const statuses:Record<string,string>={published:'已发布',draft:'草稿',offline:'已下架'};
 const data=r.data,a=data?.audience,format=(n:number)=>new Intl.NumberFormat(locale).format(n||0);
 return <section className={'admin-overview '+styles.overview} aria-labelledby="admin-overview-title">
  <header className="admin-overview-heading"><div><h1 id="admin-overview-title">{t('管理中心')}</h1><p>{tr('网站运行概览')}</p></div><div className={styles.actions}><button className="btn small" onClick={r.refresh}>{tr('刷新概览')}</button><Link className="btn primary" href="/admin/articles/new">{t('新建内容')}</Link></div></header>
  {r.error?<div className="app-feedback error" role="alert">{t(r.error)} <button className="btn small" onClick={r.refresh}>{t('重试')}</button></div>:!data||!a?<div className="skeleton" aria-label={t('内容加载中')}/>:<>
   <dl className="admin-summary-grid">{[
    ['注册用户',a.users,tr('不含已注销账号')],
    ['累计浏览',a.trafficAll.pv,`${format(a.trafficAll.uv)} ${tr('去重访客')}`],
    ['今日浏览',a.trafficToday.pv,'Asia/Shanghai'],
    ['今日访客',a.trafficToday.uv,tr('去重访客')]
   ].map(([label,value,note])=><div key={label}><dt>{tr(String(label))}</dt><dd>{format(Number(value))}</dd><small>{note}</small></div>)}</dl>
   <div className="admin-management-grid"><section aria-labelledby="admin-tasks-title"><h2 id="admin-tasks-title">{tr('待办与治理')}</h2><div className="admin-task-list">{queues.map(([key,label,path])=><Link key={key} href={'/admin/community/'+path}><span>{tr(label)}</span><strong className={data.pending[key]>0?'has-work':''}>{data.pending[key]}</strong></Link>)}</div><div className="admin-quick-links"><Link href="/admin/settings">{t('网站设置')}</Link><Link href="/admin/logs">{t('管理日志')}</Link></div></section>
   <section aria-labelledby="admin-recent-title"><h2 id="admin-recent-title">{t('最近编辑')}</h2>{data.recent.length?<div className="admin-recent-list">{data.recent.map((item:any)=><Link key={item.id} href={'/admin/'+item.type+'/edit/'+item.id}><div><strong>{item.title||t('未命名内容')}</strong><span>{t(types[item.type])} · {t(statuses[item.status]||item.status)}</span></div><time dateTime={item.updated}>{localeDate(item.updated,locale,true)}</time></Link>)}</div>:<p className="admin-empty">{t('还没有内容，从新建内容开始。')}</p>}</section></div>
   <div className={styles.details}>
    <section><h2>{tr('账号分布')}</h2><div className={styles.accountBar} aria-hidden="true">{[['active',a.active],['restricted',a.restricted],['banned',a.banned]].map(([status,count])=><span key={status} className={styles[String(status)]} style={{flexGrow:Number(count)}}/>)}</div><dl className={styles.inlineCounts}>{[['正常',a.active],['受限',a.restricted],['封禁',a.banned],['已注销',a.closed]].map(([label,value])=><div key={label}><dt>{tr(String(label))}</dt><dd>{format(Number(value))}</dd></div>)}</dl><dl className={styles.growth}>{[['今日新增',a.joinedToday],['近7天新增',a.joinedWeek],['近30天新增',a.joinedMonth]].map(([label,value])=><div key={label}><dt>{tr(String(label))}</dt><dd>+{format(Number(value))}</dd></div>)}</dl><Link className={styles.detailLink} href="/admin/community/accounts">{t('成员管理')} <span aria-hidden="true">↗</span></Link></section>
    <section><h2>{tr('内容与空间')}</h2><dl className={styles.contentCounts}>{[['已发布主页',a.publicSpaces],['全部主页',data.totals.spaces],['已发布投稿',a.publishedArticles],['站点内容',data.totals.content]].map(([label,value])=><div key={label}><dt>{tr(String(label))}</dt><dd>{format(Number(value))}</dd></div>)}</dl><div className={styles.storage}><span>{t('文件存储')}</span><strong>{bytes(data.totals.bytes)}</strong></div><Link className={styles.detailLink} href="/admin/files">{t('文件素材')} <span aria-hidden="true">↗</span></Link></section>
   </div>
   <section className="admin-services" aria-labelledby="admin-services-title"><div><h2 id="admin-services-title">{t('服务状态')}</h2><span>{t(data.services.environment==='demo'?'演示环境':'标准环境')}</span></div><dl>{[
    ['社区访问',({local:'仅本机开放',public:'对外开放',paused:'暂停投稿',closed:'暂未开放'} as Record<string,string>)[data.services.community]],
    ['账号通知邮件',({capture:'本地收件箱',smtp:'SMTP 已配置',unconfigured:'未配置'} as Record<string,string>)[data.services.mail]],
    ['macOS 下载',data.services.downloads.macos?'已配置':'未配置'],
    ['Windows 下载',data.services.downloads.windows?'已配置':'未配置']
   ].map(([label,value])=><div key={label}><dt>{tr(label)}</dt><dd>{t(value)}</dd></div>)}</dl></section>
   <p className={styles.scope}>{tr('统计口径：上海时区。访客按匿名浏览器标识估算；不计管理员、已识别机器人及拒绝追踪的访问。')}</p>
  </>}
 </section>;
}
