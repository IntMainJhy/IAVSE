'use client';

import Link from 'next/link';
import {useEffect, useId, useRef, useState, type CSSProperties} from 'react';
import {Bell, BookOpen, Bookmark, FileText, House, Layers, MessagesSquare, PenLine, Settings, Shield, UserRound, UsersRound, X} from 'lucide-react';
import {useLocale} from '@/components/LocaleProvider';
import {usePlatformAccount} from '@/components/PlatformAccount';
import {useResource} from '@/components/PageResources';
import {FeedAvatar} from '@/components/FeedAvatar';
import {Logout} from '@/components/CommunityUI';
import {landingCopy} from '@/lib/landing-copy';
import {communityProfileDestination} from '@/lib/navigation.mjs';
import '@/app/iavse-mobile-dock.css';

const personalLinks = [
  {label: '发现成员', href: '/community/members', icon: UsersRound},
  {label: '关注动态', href: '/community?feed=following', icon: MessagesSquare},
  {label: '我的收藏', href: '/workspace/bookmarks', icon: Bookmark},
  {label: '消息通知', href: '/workspace/notifications', icon: Bell},
  {label: '我的投稿', href: '/workspace', icon: FileText},
  {label: '我的博客', href: '/workspace/blog', icon: PenLine},
  {label: '账号与安全', href: '/workspace/account', icon: Settings},
];

function UnreadCount() {
  const {t} = useLocale();
  const {data} = useResource('/api/community/notification-count');
  const count = data?.unread;
  return count > 0 ? <span className="iavse-account-sheet__unread">
    <span aria-hidden="true">{count > 99 ? '99+' : count}</span>
    <span className="iavse-account-sheet__sr">{t('{0} 条未读消息',[count])}</span>
  </span> : null;
}

export function IavseMobileDock({path}: {path: string}) {
  const {locale,t} = useLocale();
  const copy = landingCopy(locale);
  const {user, loading} = usePlatformAccount();
  const panel = useRef<HTMLDialogElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const myPage = /^\/(?:workspace|login|join)(?:\/|$)/.test(path);
  const profile = user ? communityProfileDestination(user) : null;
  const destinations = [
    {href: '/',         label: copy.navHome,   short: copy.navHome,                                      icon: House,          active: path === '/'},
    {href: '/community',label: copy.community, short: locale === 'en' ? 'Feed' : locale === 'ja' ? '交流' : '社区', icon: MessagesSquare, active: /^\/community(?:\/|$)/.test(path)},
    {href: '/resources',label: copy.resources, short: copy.resources,                                    icon: Layers,         active: /^\/(?:resources|docs|skills)(?:\/|$)/.test(path)},
    {href: '/blogs',    label: copy.blogs,     short: locale === 'en' ? 'Blogs' : locale === 'ja' ? 'ブログ' : '博客',icon: BookOpen,     active: path === '/blogs' || path === '/blogs/'},
  ];
  const activeIndex = myPage ? destinations.length : destinations.findIndex(item => item.active);
  const protectedHref = (href: string) => user || loading ? href : '/login?next=' + encodeURIComponent(href);
  const close = () => panel.current?.close();

  useEffect(() => {
    close();
    const desktop = matchMedia('(min-width:768px)');
    const resize = () => { if (desktop.matches) close(); };
    desktop.addEventListener('change', resize);
    return () => desktop.removeEventListener('change', resize);
  }, [path]);

  return <nav className="iavse-mobile-dock" aria-label={locale === 'zh' ? '底部导航' : locale === 'ja' ? '下部ナビゲーション' : 'Bottom navigation'}>
    <div className="iavse-mobile-dock__items" style={{'--dock-index': activeIndex} as CSSProperties}>
      {destinations.map(({href,label,short,icon: Icon,active}) =>
        <Link className="iavse-mobile-dock__tab" key={href} href={href} aria-label={label} aria-current={active ? 'page' : undefined}>
          <Icon size={22} aria-hidden="true"/><span>{short}</span>
        </Link>
      )}
      <button className="iavse-mobile-dock__tab" type="button" aria-label={t('我的账号与更多功能')} aria-controls={panelId}
        aria-haspopup="dialog" aria-expanded={open} aria-current={myPage ? 'page' : undefined}
        onClick={() => { panel.current?.showModal(); setOpen(true); }}>
        <UserRound size={22} aria-hidden="true"/><span>{t('我的')}</span>
      </button>
      {activeIndex >= 0 && <span className="iavse-mobile-dock__indicator" aria-hidden="true"/>}
    </div>
    <dialog ref={panel} id={panelId} aria-labelledby={panelId+'-title'} className="iavse-account-sheet"
      onClose={event => setOpen(event.currentTarget.open)}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="iavse-account-sheet__body" aria-busy={loading}>
        <header>
          {user && <FeedAvatar name={user.displayName || user.nickname} avatarId={user.avatarId}/>}
          <h2 id={panelId+'-title'}>{user ? user.displayName || user.nickname : t('我的账号')}</h2>
          <button type="button" aria-label={t('关闭我的菜单')} onClick={close}><X size={20} aria-hidden="true"/></button>
        </header>
        <div className="iavse-account-sheet__links">
          {profile?.startsWith('/community/') && <Link href={profile} onClick={close}><UserRound/>{t('社区名片')}</Link>}
          {personalLinks.map(({label,href,icon: Icon}) => <Link key={href} href={href === '/community/members' ? href : protectedHref(href)} onClick={close}>
            <Icon/>{t(label)}
            {href === '/workspace/notifications' && open && user && <UnreadCount key={user.id}/>}
          </Link>)}
          {user && ['owner','reviewer'].includes(user.role) && <Link href={user.role === 'owner' ? '/admin' : '/admin/community'} onClick={close}><Shield/>{t('管理中心')}</Link>}
        </div>
        <div className="iavse-account-sheet__account">
          {!loading && (user ? <Logout/> : <Link href={protectedHref('/workspace/account')} onClick={close}>{t('登录 / 注册')}</Link>)}
        </div>
      </div>
    </dialog>
  </nav>;
}
