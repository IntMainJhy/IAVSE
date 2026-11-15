'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {platformChrome} from '@/lib/platform-chrome';
import {HomeStyleSwitcher} from './HomeStyleSwitcher';

/** Error states in authored routes still need the platform's navigation tools. */
export function SiteStyleFallbackNav() {
  const path = usePathname();
  if (platformChrome(path).header) return null;
  return <div className="site-style-example-toolbar"><Link href="/">IAVSE</Link><HomeStyleSwitcher className="home-style-switch--inline"/></div>;
}
