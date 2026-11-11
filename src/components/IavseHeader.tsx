'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useId, useRef, useState} from 'react';
import {Menu, UserRound, X} from 'lucide-react';
import {AuthNav} from '@/components/AuthNav';
import {BrandMark} from '@/components/BrandMark';
import {useLocale} from '@/components/LocaleProvider';
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
  const menu = useRef<HTMLDetailsElement>(null);
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const items = [
    {id: 'community', href: '/community', label: copy.community},
    {id: 'resources', href: '/resources', label: copy.resources},
    {id: 'blogs', href: '/blogs', label: copy.blogs},
  ];
  const active = /^\/community(?:\/|$)/.test(path) ? 'community'
    : /^\/(?:resources|docs|skills)(?:\/|$)/.test(path) ? 'resources'
      : /^\/blogs?(?:\/|$)/.test(path) ? 'blogs' : null;
  const close = () => { if (menu.current) menu.current.open = false; };

  useEffect(() => {
    close();
  }, [path, locale]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector('summary')?.focus();
      }
    };
    const desktop = matchMedia('(min-width: 821px)');
    const resize = () => { if (desktop.matches && menu.current) menu.current.open = false; };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    desktop.addEventListener('change', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
      desktop.removeEventListener('change', resize);
    };
  }, []);

  return <header className={`iavse-header${floating ? ' iavse-header--floating' : ''} ${className}`.trim()} data-iavse-header>
    <Link className="iavse-header__brand" href="/" aria-label={copy.home}><BrandMark/><span>IAVSE</span></Link>
    <nav className="iavse-header__desktop" aria-label={copy.nav}>
      <GlassSwitch items={items} value={active} ariaLabel={copy.nav}/>
    </nav>
    <details className="iavse-header__mobile" ref={menu} onToggle={event => setOpen(event.currentTarget.open)} onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) close(); }}>
      <summary aria-label={open ? copy.closeNav : copy.openNav} aria-controls={menuId}>
        {open ? <X size={19} aria-hidden="true"/> : <Menu size={19} aria-hidden="true"/>}
      </summary>
      <nav id={menuId} aria-label={copy.nav}>
        <GlassSwitch items={items} value={active} ariaLabel={copy.nav} onValueChange={close}/>
      </nav>
    </details>
    <div className="iavse-header__identity"><AuthNav/><Link href="/login" className="iavse-header__guest" aria-label={copy.account}><UserRound size={18} aria-hidden="true"/></Link></div>
  </header>;
}
