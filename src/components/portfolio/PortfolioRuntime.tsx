'use client';

// Adapted from DavidHDev/rbp-portfolio, commit 1581b9b8e5876f60e5eb844970747506980c4412.
// Upstream scroll parameters and backdrop are retained; IAVSE editors keep native scrolling.
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {Nav} from '../rbp/layout/nav';
import {useLocale} from '../LocaleProvider';
import {PageBackdrop} from '../rbp/layout/page-backdrop';
import 'lenis/dist/lenis.css';

const LENIS_OPTIONS = {
  duration: 1.6,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical' as const,
  gestureOrientation: 'vertical' as const,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
};

export function PortfolioRuntime(){
  const path = usePathname();
  const {locale,t} = useLocale();
  const chromeEnabled = !/^\/(?:blog(?:\/|$)|blogs\/showcase\/|admin(?:\/|$))/.test(path);
  const navItems = [
    {href:'/',label:t('首页'),active:path==='/'},
    {href:'/resources',label:t('资源'),active:/^\/(?:resources|docs|skills)(?:\/|$)/.test(path)},
    {href:'/about',label:locale==='en'?'About':locale==='ja'?'紹介':'关于',active:path==='/about'},
  ];
  const enabled = !/^\/(?:blog\/|blogs\/showcase\/|admin(?:\/|$)|workspace(?:\/|$))/.test(path);

  useEffect(() => {
    const sync = () => document.querySelectorAll('.rbp-surface').forEach(node => node.classList.toggle('dark',document.documentElement.dataset.colorMode==='dark'));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-color-mode']});
    return () => observer.disconnect();
  },[path]);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let generation = 0;
    let stop = () => {};
    const media = matchMedia('(prefers-reduced-motion: reduce)');

    const setup = () => {
      const attempt = ++generation;
      stop();
      stop = () => {};
      if (media.matches) {
        document.documentElement.dataset.portfolioMotion = 'reduced';
        return;
      }
      import('lenis').then(({default: Lenis}) => {
        if (disposed || media.matches || attempt !== generation) return;
        const lenis = new Lenis({
          ...LENIS_OPTIONS,
          prevent: node => !!node.closest('input,textarea,select,[data-lenis-prevent],details[open]'),
        });
        let frame = 0;
        const tick = (time: number) => {
          lenis.raf(time);
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        const handleAnchorClick = (event: MouseEvent) => {
          if (event.defaultPrevented || !(event.target instanceof Element)) return;
          const anchor = event.target.closest('a[href^="#"]');
          const href = anchor?.getAttribute('href');
          if (!href || href === '#') return;
          let element: HTMLElement | null = null;
          try { element = document.querySelector<HTMLElement>(href); } catch { return; }
          if (!element) return;
          event.preventDefault();
          lenis.scrollTo(element, {offset: -100});
        };
        document.addEventListener('click', handleAnchorClick);
        document.documentElement.dataset.portfolioMotion = 'lenis';
        stop = () => {
          cancelAnimationFrame(frame);
          document.removeEventListener('click', handleAnchorClick);
          lenis.destroy();
        };
      }).catch(() => {
        if (!disposed && attempt === generation) document.documentElement.dataset.portfolioMotion = 'native';
      });
    };

    setup();
    media.addEventListener('change', setup);
    return () => {
      disposed = true;
      stop();
      media.removeEventListener('change', setup);
      delete document.documentElement.dataset.portfolioMotion;
    };
  }, [enabled, path]);

  return <div className="rbp-surface" data-portfolio-runtime>{enabled && <PageBackdrop />}{chromeEnabled && <Nav items={navItems} locale={locale} label={t("主导航")}/>}</div>;
}
