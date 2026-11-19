'use client';

import Link, {useLinkStatus} from 'next/link';
import {usePathname} from 'next/navigation';
import {AuthNav} from '@/components/AuthNav';
import {BrandMark} from '@/components/BrandMark';
import {HeaderContact} from '@/components/HeaderContact';
import {Icon} from '@/components/Icons';
import {LanguageSwitcher, useLocale} from '@/components/LocaleProvider';
import {useNavigationPending} from './NavigationLinkFeedback';
import {landingCopy} from '@/lib/landing-copy';
import '@/app/iavse-header.css';

export type IavseHeaderProps = {
  className?: string;
  /** Kept for callers using the previous header API; the bar stays in document flow. */
  floating?: boolean;
};

export function IavseHeader({className = '', floating = false}: IavseHeaderProps) {
  const path = usePathname();
  const {locale} = useLocale();
  const copy = landingCopy(locale);
  const blogLabel = locale === 'en' ? 'Blog spaces' : locale === 'ja' ? 'ブログ空間' : '博客空间';
  const items = [
    {id: 'resources', href: '/', label: copy.resources, compactLabel: copy.resources},
    {id: 'community', href: '/community', label: copy.community, compactLabel: locale === 'en' ? 'Feed' : locale === 'ja' ? '交流' : '社区'},
    {id: 'blogs', href: '/blogs', label: blogLabel, compactLabel: locale === 'en' ? 'Blogs' : locale === 'ja' ? 'ブログ' : '博客'},
    {id: 'about', href: '/about', label: copy.navAbout, compactLabel: copy.navAbout},
  ];
  const active = path === '/' || /^\/(?:resources|docs|skills)(?:\/|$)/.test(path) ? 'resources'
    : /^\/community(?:\/|$)/.test(path) ? 'community'
      : /^\/blogs?(?:\/|$)/.test(path) ? 'blogs'
        : /^\/about(?:\/|$)/.test(path) ? 'about' : null;

  return <header className={`iavse-header iavse-header--plain${floating ? ' iavse-header--floating' : ''} ${className}`.trim()} data-iavse-header>
    <Link className="iavse-header__brand" href="/" prefetch={false} aria-label={copy.home}>
      <BrandMark/><span>IAVSE</span>
    </Link>
    <nav className="iavse-header__nav" aria-label={copy.nav}>
      {items.map(item => <Link key={item.id} href={item.href} prefetch={false} className="iavse-header__link" aria-current={active === item.id ? 'page' : undefined} aria-label={item.label}>
        <HeaderLinkLabel label={item.label} compactLabel={item.compactLabel}/>
      </Link>)}
    </nav>
    <div className="iavse-header__identity">
      <HeaderContact/>
      <a className="header-vibe-ssh" href="https://vibe-ssh.intmainjhy.cn/" target="_blank" rel="noopener noreferrer" aria-label="Vibe SSH" title="Vibe SSH"><Icon name="terminal"/><span>Vibe SSH</span></a>
      <div className="iavse-repository-links">
        <a href="https://github.com/IntMainJhy/IAVSE" target="_blank" rel="noopener noreferrer" aria-label="IAVSE · GitHub" title="GitHub"><img src="/brand/github.svg" alt="" width="19" height="19"/></a>
        <a href="https://atomgit.com/InMainJhy/IAVSE" target="_blank" rel="noopener noreferrer" aria-label="IAVSE · AtomGit" title="AtomGit"><img src="/brand/atomgit.png" alt="" width="20" height="20"/></a>
      </div>
      <div className="iavse-header__account"><AuthNav/></div>
      <LanguageSwitcher/>
    </div>
  </header>;
}

/** The native Next status keeps feedback tied to the destination's actual work. */
function HeaderLinkLabel({label, compactLabel}: {label: string; compactLabel: string}) {
  const {pending} = useLinkStatus();
  useNavigationPending(pending);
  return <span className="iavse-header__link-label" data-nav-pending={pending || undefined} aria-busy={pending || undefined}>
    <span className="iavse-header__full-label">{label}</span>
    <span className="iavse-header__compact-label" aria-hidden="true">{compactLabel}</span>
  </span>;
}
