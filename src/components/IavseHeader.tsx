'use client';

import Link, {useLinkStatus} from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useId, useRef, useState} from 'react';
import {ArrowUpRight, Ellipsis, UserRound, X} from 'lucide-react';
import {AuthNav} from '@/components/AuthNav';
import {BrandMark} from '@/components/BrandMark';
import {LanguageSwitcher, useLocale} from '@/components/LocaleProvider';
import {HomeStyleSwitcher} from './landing/HomeStyleSwitcher';
import {useNavigationPending} from './NavigationLinkFeedback';
import '@/app/glass-controls.css';
import {landingCopy} from '@/lib/landing-copy';

export type IavseHeaderProps = {
  className?: string;
  /** Fixed, centered chrome for routes without a surrounding landing container. */
  floating?: boolean;
};

export function IavseHeader({className = '', floating = false}: IavseHeaderProps) {
  const path = usePathname();
  const {locale, t} = useLocale();
  const copy = landingCopy(locale);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    let previous = false;
    const update = () => {const next = window.scrollY > 80; if (previous !== next) {previous = next; setScrolled(next);}};
    update(); window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const screen = matchMedia('(max-width:767px)');
    const resize = () => { if (!screen.matches) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    screen.addEventListener('change', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      screen.removeEventListener('change', resize);
    };
  }, [open]);
  const short = locale === 'en' ? ['Home', 'Feed', 'Explore', 'Blogs', 'About']
    : locale === 'ja' ? ['ホーム', '交流', '探す', 'ブログ', '紹介'] : ['首页', '社区', '资源', '博客', '关于'];
  const items = [
    {id: 'home', href: '/', label: copy.navHome, compactLabel: short[0]},
    {id: 'community', href: '/community', label: copy.community, compactLabel: short[1]},
    {id: 'resources', href: '/resources', label: copy.resources, compactLabel: short[2]},
    {id: 'blogs', href: '/blogs', label: copy.blogs, compactLabel: short[3]},
    {id: 'about', href: '/about', label: copy.navAbout, compactLabel: short[4]},
  ];
  const active = path === '/' ? 'home' : path === '/about' ? 'about' : /^\/community(?:\/|$)/.test(path) ? 'community'
    : /^\/(?:resources|docs|skills)(?:\/|$)/.test(path) ? 'resources'
      : /^\/blogs?(?:\/|$)/.test(path) ? 'blogs' : null;
  return <header className={`iavse-header${floating ? ' iavse-header--floating' : ''} ${className}`.trim()} data-iavse-header data-site-style-header data-home-header={path === '/' ? true : undefined} data-home-scrolled={scrolled} ref={root}
    onBlur={event => {
      if (open && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
    }}
    onKeyDown={event => {
      if (open && event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    }}>
    <Link className="iavse-header__brand" href="/" prefetch={false} aria-label={copy.home} onClick={() => setOpen(false)}><BrandMark/><span>IAVSE</span></Link>
    <div className="iavse-repository-links iavse-repositories-mobile">
          <a href="https://github.com/IntMainJhy/IAVSE" target="_blank" rel="noopener noreferrer" aria-label="IAVSE · GitHub" title="GitHub"><img src="/brand/github.svg" alt="" width="19" height="19"/></a>
          <a href="https://atomgit.com/InMainJhy/IAVSE" target="_blank" rel="noopener noreferrer" aria-label="IAVSE · AtomGit" title="AtomGit"><img src="/brand/atomgit.png" alt="" width="20" height="20"/></a>
        </div>
    <button type="button" className="iavse-header__more" ref={trigger} aria-label={t('更多选项')}
      aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
      {open ? <X size={21} aria-hidden="true"/> : <Ellipsis size={23} aria-hidden="true"/>}
    </button>
    <div className="iavse-header__controls" id={panelId} data-open={open}>
      <div className="iavse-header__navigation">
        <nav className="iavse-header__nav" aria-label={copy.nav}>
          <div className="glass-switch glass-switch--regular iavse-header__links" role="group" aria-label={copy.nav}>
            {items.map(item => <Link key={item.id} href={item.href} prefetch={false} className="glass-switch__item" data-selected={active === item.id} aria-current={active === item.id ? 'page' : undefined} aria-label={item.label}><HeaderLinkLabel label={item.label} compactLabel={item.compactLabel}/></Link>)}
          </div>
        </nav>
        <span className="iavse-header__setting-label">{t('外观')}</span>
      </div>
      <div className="iavse-header__identity">

        <div className="iavse-repository-links iavse-repositories-wide">
          <a href="https://github.com/IntMainJhy/IAVSE" target="_blank" rel="noopener noreferrer" aria-label="IAVSE · GitHub" title="GitHub"><img src="/brand/github.svg" alt="" width="19" height="19"/></a>
          <a href="https://atomgit.com/InMainJhy/IAVSE" target="_blank" rel="noopener noreferrer" aria-label="IAVSE · AtomGit" title="AtomGit"><img src="/brand/atomgit.png" alt="" width="20" height="20"/></a>
        </div>
        <AuthNav/><Link href="/login" className="iavse-header__guest" aria-label={copy.account}><UserRound size={18} aria-hidden="true"/></Link>
        <span className="iavse-header__setting-label">{t('界面语言')}</span><LanguageSwitcher/>
      </div>
      <Link href="/about" className="iavse-header__about" onClick={() => setOpen(false)}>
        {copy.about}<ArrowUpRight size={16} aria-hidden="true"/>
      </Link>
    </div>
    <HomeStyleSwitcher onOpen={() => setOpen(false)}/>
  </header>;
}

/** Native Next link status gives immediate feedback without measuring a hidden lens. */
function HeaderLinkLabel({label, compactLabel}: {label: string; compactLabel: string}) {
  const {pending} = useLinkStatus();
  useNavigationPending(pending);
  return <span className="glass-switch__label iavse-header__link-label" data-nav-pending={pending || undefined} aria-busy={pending || undefined}><span className="glass-switch__full-label">{label}</span><span className="glass-switch__compact-label" aria-hidden="true">{compactLabel}</span></span>;
}
