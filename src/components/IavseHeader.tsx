'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {UserRound} from 'lucide-react';
import {AuthNav} from '@/components/AuthNav';
import {BrandMark} from '@/components/BrandMark';
import {LanguageSwitcher, useLocale} from '@/components/LocaleProvider';
import {ThemeToggle} from '@/components/ThemeToggle';
import {GlassSwitch} from '@/components/ui/GlassSwitch';
import {landingCopy} from '@/lib/landing-copy';

export type IavseHeaderProps = {
  className?: string;
  /** Fixed, centered chrome for routes without a surrounding landing container. */
  floating?: boolean;
};

export function IavseHeader({className = '', floating = false}: IavseHeaderProps) {
  const path = usePathname();
  const {locale} = useLocale();
  const copy = landingCopy(locale);
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
  return <header className={`iavse-header${floating ? ' iavse-header--floating' : ''} ${className}`.trim()} data-iavse-header>
    <Link className="iavse-header__brand" href="/" aria-label={copy.home}><BrandMark/><span>IAVSE</span></Link>
    <div className="iavse-header__navigation">
      <nav className="iavse-header__nav" aria-label={copy.nav}>
        <GlassSwitch items={items} value={active} ariaLabel={copy.nav}/>
      </nav>
      <ThemeToggle/>
    </div>
    <div className="iavse-header__identity"><AuthNav/><Link href="/login" className="iavse-header__guest" aria-label={copy.account}><UserRound size={18} aria-hidden="true"/></Link><LanguageSwitcher/></div>
  </header>;
}
