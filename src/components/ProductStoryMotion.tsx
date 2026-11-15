'use client';

import {useEffect} from 'react';

/** Progressive enhancement: static, readable HTML is the default. */
export function ProductStoryMotion({scope, revision = ''}: {scope: string; revision?: string}) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(scope);
    if (!root || !('IntersectionObserver' in window)) return;
    if (!matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)').matches) return;
    let disposed = false;
    let revert: (() => void) | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      // Do not put animation code on the first-screen or navigation critical path.
      void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{gsap}, {ScrollTrigger}]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        revert = () => media.revert();
        media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
          const entrances = Array.from(root.querySelectorAll<HTMLElement>('[data-story-reveal]')).map(node => ({
            node,
            tween: gsap.from(node, {opacity: 0, y: 22, duration: .65, ease: 'power2.out', scrollTrigger: {trigger: node, start: 'top 92%', once: true}}),
          }));
          root.querySelectorAll<HTMLElement>('[data-story-art]').forEach(node => {
            gsap.fromTo(node, {clipPath: 'inset(5% 4% round 24px)'}, {
              clipPath: 'inset(0% 0% round 4px)', ease: 'none',
              scrollTrigger: {trigger: node, start: 'top 88%', end: 'top 20%', scrub: true},
            });
          });
          const focus = (event: FocusEvent) => {
            const entry = entrances.find(({node}) => node.contains(event.target as Node));
            if (entry) {
              entry.tween.scrollTrigger?.kill();
              entry.tween.progress(1).kill();
              gsap.set(entry.node, {clearProps: 'opacity,transform'});
            }
          };
          root.addEventListener('focusin', focus);
          return () => root.removeEventListener('focusin', focus);
        }, root);
      }).catch(() => { revert?.(); });
    }, {rootMargin: '300px 0px'});
    observer.observe(root);
    return () => { disposed = true; observer.disconnect(); revert?.(); };
  }, [scope, revision]);
  return null;
}
