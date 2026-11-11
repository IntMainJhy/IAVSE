'use client';

// Shares the existing public Portfolio appearance behavior and transition contract.
// Retained upstream attribution: docs/licenses/RBP-Portfolio.txt.

import {useRef, useSyncExternalStore} from 'react';
import {Moon, Sun} from 'lucide-react';
import {useLocale} from '@/components/LocaleProvider';

const subscribe = (callback: () => void) => {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-color-mode']});
  return () => observer.disconnect();
};
const read = () => document.documentElement.dataset.colorMode === 'dark';
const mountedSubscribe = () => () => {};

/** Uses the same document state and persistent cookie as the public appearance. */
export function ThemeToggle() {
  const {locale} = useLocale();
  const mounted = useSyncExternalStore(mountedSubscribe, () => true, () => false);
  const dark = useSyncExternalStore(subscribe, read, () => false);
  const active = useRef<{skipTransition: () => void} | null>(null);
  const intent = useRef<boolean | null>(null);
  const generation = useRef(0);
  const label = locale === 'en' ? (mounted ? dark ? 'Switch to light theme' : 'Switch to dark theme' : 'Toggle theme')
    : locale === 'ja' ? (mounted ? dark ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え' : 'テーマを切り替え')
      : mounted ? dark ? '切换浅色外观' : '切换深色外观' : '切换外观';
  return <button className="iavse-theme-toggle" type="button" data-dark={mounted && dark} aria-label={label} title={label} aria-pressed={mounted ? dark : undefined} onClick={event => {
    active.current?.skipTransition();
    const request = ++generation.current;
    const root = document.documentElement, next = (intent.current ?? read()) ? 'light' : 'dark';
    intent.current = next === 'dark';
    const apply = () => {
      if (request !== generation.current) return;
      root.dataset.colorMode = next;
      root.dataset.colorPreference = next;
      document.cookie = `site-color-mode=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    };
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion:reduce)').matches) {apply(); active.current = null; intent.current = null; delete root.dataset.themeAnim; return;}
    const box = event.currentTarget.getBoundingClientRect(), x = box.left + box.width / 2, y = box.top + box.height / 2;
    root.style.setProperty('--theme-cx', `${x}px`);
    root.style.setProperty('--theme-cy', `${y}px`);
    root.style.setProperty('--theme-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    root.dataset.themeAnim = '1';
    const transition = document.startViewTransition(apply);
    active.current = transition;
    transition.finished.catch(() => {}).finally(() => {if (active.current === transition) {active.current = null; intent.current = null; delete root.dataset.themeAnim;}});
  }}><Sun className="iavse-theme-toggle__sun" size={18} aria-hidden="true"/><Moon className="iavse-theme-toggle__moon" size={18} aria-hidden="true"/></button>;
}
