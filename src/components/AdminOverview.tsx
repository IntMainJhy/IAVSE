'use client';

import Link from 'next/link';
import {useLocale} from './LocaleProvider';
import {useResource} from './PageResources';
import {Icon} from './Icons';
import {bytes} from '@/lib/client';
import {localeDate} from '@/lib/locale-format.mjs';
import styles from './AdminOverview.module.css';

const shortcuts = [
  {path: 'articles', label: '文章', icon: 'edit'},
  {path: 'projects', label: '项目', icon: 'folder'},
  {path: 'resources', label: '资源', icon: 'link'},
  {path: 'files', label: '文件素材', icon: 'grid'},
];
const queues = [
  {key: 'catalog', label: '共享内容审核', path: 'catalog', icon: 'file'},
  {key: 'posts', label: '投稿审核', path: 'reviews', icon: 'edit'},
  {key: 'comments', label: '评论审核', path: 'comments', icon: 'comment'},
  {key: 'spaces', label: '博客内容待复核', path: 'spaces', icon: 'grid'},
  {key: 'reports', label: '举报与投诉', path: 'reports', icon: 'folder'},
];
const types: Record<string,string> = {projects: '项目', articles: '文章', resources: '资源'};
const statuses: Record<string,string> = {published: '已发布', draft: '草稿', offline: '已下架'};
const newArticle = {zh: '新建文章', en: 'New article', ja: '記事を作成'};
type RecentItem = {id: string; type: string; title: string; status: string; updated: string};

export function AdminOverview() {
  const {t,locale} = useLocale();
  const overview = useResource('/api/admin/overview');
  const data = overview.data, audience = data?.audience;
  const numbers = new Intl.NumberFormat(locale);
  const pending = queues.reduce((sum, queue) => sum + (data?.pending[queue.key] || 0), 0);

  return <section className={styles.overview} aria-labelledby="admin-overview-title" data-rbp-reveal-scope>
    <header className={styles.heading}>
      <h1 id="admin-overview-title">{t('管理中心')}</h1>
      <div className={styles.commands}>
        <Link prefetch={false} className={styles.create} href="/admin/articles/new"><Icon name="plus"/>{newArticle[locale]}</Link>
        <button className={styles.refresh} type="button" onClick={overview.refresh} disabled={overview.refreshing} aria-label={t('刷新概览')} title={t('刷新概览')}><Icon name="refresh"/></button>
      </div>
    </header>
    {overview.error ? <div className="app-feedback error" role="alert">{t(overview.error)} <button className="btn small" onClick={overview.refresh}>{t('重试')}</button></div>
      : !audience ? <div className="skeleton" role="status" aria-label={t('内容加载中')}/>
      : <>
        <dl className={styles.facts} aria-label={t('网站运行概览')}>
          {[
            ['站点内容', data.totals.content], ['注册用户', audience.users],
            ['今日访客', audience.trafficToday.uv], ['今日浏览', audience.trafficToday.pv],
          ].map(([label,value]) => <div key={label}><dt>{t(label)}</dt><dd>{numbers.format(value)}</dd></div>)}
        </dl>
        <div className={styles.workArea}>
          <div className={styles.editorial}>
            <nav className={styles.shortcuts} aria-labelledby="admin-tools-title">
              <h2 id="admin-tools-title">{t('内容管理')}</h2>
              <div className={styles.shortcutGrid}>{shortcuts.map(({path,label,icon}) =>
                <Link key={path} href={'/admin/'+path} prefetch={false}><Icon name={icon}/><span>{t(label)}</span><Icon name="arrow"/></Link>
              )}</div>
            </nav>
            <section className={styles.recent} aria-labelledby="admin-recent-title" data-rbp-reveal-item>
              <h2 id="admin-recent-title">{t('最近编辑')}</h2>
              {data.recent.length ? <ul className={styles.recentList}>
                {data.recent.map((item: RecentItem) => <li key={item.id}>
                  <Link prefetch={false} href={'/admin/'+item.type+'/edit/'+item.id}>
                    <span className={styles.recentCopy}><strong>{item.title || t('未命名内容')}</strong><small>{t(types[item.type])} · {t(statuses[item.status] || item.status)}</small></span>
                    <time dateTime={item.updated}>{localeDate(item.updated,locale,true)}</time>
                  </Link>
                </li>)}
              </ul> : <p className={styles.empty}><Icon name="edit"/>{t('暂无内容，创建你的第一份内容。')}</p>}
            </section>
          </div>
          <div className={styles.operations}>
            <details className={styles.disclosure} open={pending>0} data-rbp-reveal-item>
              <summary><Icon name="shield"/><span>{t('审核与治理')}</span><strong className={styles.count} data-has-work={pending>0} aria-label={t('待处理事项')+' '+numbers.format(pending)}>{numbers.format(pending)}</strong><Icon name="chevron-down"/></summary>
              <nav className={styles.queues} aria-label={t('审核与治理')}>
                {queues.map(({key,label,path,icon}) => <Link prefetch={false} key={key} href={'/admin/community/'+path}>
                  <Icon name={icon}/><span>{t(label)}</span><strong className={styles.count} data-has-work={data.pending[key]>0}>{numbers.format(data.pending[key])}</strong>
                </Link>)}
              </nav>
            </details>
            <details className={styles.disclosure} data-rbp-reveal-item>
              <summary><Icon name="chart"/><span>{t('网站运行概览')}</span><Icon name="chevron-down"/></summary>
              <dl className={styles.detailsList}>{[
                ['已发布站点内容', numbers.format(audience.publicContent)], ['已公开主页', numbers.format(audience.publicSpaces)],
                ['累计浏览', numbers.format(audience.trafficAll.pv)], ['文件存储', bytes(data.totals.bytes)],
              ].map(([label,value]) => <div key={label}><dt>{t(label)}</dt><dd>{value}</dd></div>)}</dl>
              <footer className={styles.files}><span>{audience.timezone}</span><Link prefetch={false} href="/admin/files">{t('管理文件')}<Icon name="arrow"/></Link></footer>
            </details>
          </div>
        </div>
      </>}
  </section>;
}
