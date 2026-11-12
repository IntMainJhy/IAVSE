'use client';

import {useLayoutEffect, type RefObject} from 'react';

let lastRail: {y: number; time: number} | null = null;

/** The side rail follows the pointer or keyboard focus, then settles on the current route. */
export function useCommunitySidebarMotion(ref: RefObject<HTMLElement | null>, active: string) {
  useLayoutEffect(() => {
    const nav = ref.current;
    const pill = nav?.querySelector<HTMLElement>('.feed-active-indicator');
    // The older PageMotion shell already animates this same element.
    if (!nav || !pill || nav.closest('[data-page-content]')) return;
    const desktop = matchMedia('(min-width:768px)');
    const reduced = matchMedia('(prefers-reduced-motion:reduce)');
    const current = nav.querySelector<HTMLAnchorElement>(':scope > a[aria-current="page"]');
    let pointed: HTMLAnchorElement | null = null;
    let focused: HTMLAnchorElement | null = null;
    let animation: Animation | undefined;
    let targetY: number | undefined;

    const position = () => pill.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop;
    const place = (animate: boolean, previousY?: number) => {
      const target = focused ?? pointed ?? current;
      if (!desktop.matches || !target || !target.offsetWidth) {
        animation?.cancel();
        targetY = undefined;
        delete nav.dataset.railReady;
        return;
      }
      const y = target.offsetTop;
      const left = target.offsetLeft + 'px', width = target.offsetWidth + 'px', height = target.offsetHeight + 'px';
      // ResizeObserver also delivers on first paint. Keep an in-flight handoff
      // unless the link's geometry actually changed.
      if (targetY === y && pill.style.left === left && pill.style.width === width && pill.style.height === height) return;
      const from = previousY ?? (nav.dataset.railReady ? position() : y);
      animation?.cancel();
      const end = 'translateY(' + y + 'px)';
      Object.assign(pill.style, {left, width, height, transform: end});
      nav.dataset.railReady = 'true';
      targetY = y;
      if (animate && !reduced.matches && Math.abs(from - y) > .5) {
        animation = pill.animate([{transform: 'translateY(' + from + 'px)'}, {transform: end}], {
          duration: Math.min(350, 180 + Math.abs(from - y) * .45), easing: 'cubic-bezier(.22,.8,.24,1)',
        });
      }
    };

    const link = (node: EventTarget | null) => {
      const anchor = node instanceof Element ? node.closest<HTMLAnchorElement>('a[data-nav-key]') : null;
      return anchor?.parentElement === nav ? anchor : null;
    };
    const hover = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !desktop.matches) return;
      const target = link(event.target);
      if (!target) return;
      pointed = target;
      place(true);
    };
    const leave = () => { pointed = null; place(true); };
    const focus = (event: FocusEvent) => {
      const anchor = link(event.type === 'focusout' ? event.relatedTarget : event.target);
      focused = anchor?.matches(':focus-visible') ? anchor : null;
      place(true);
    };
    const resize = () => {
      animation?.cancel();
      pointed = null;
      const anchor = link(document.activeElement);
      focused = anchor?.matches(':focus-visible') ? anchor : null;
      place(false);
    };
    const links = Array.from(nav.querySelectorAll(':scope > a[data-nav-key]'));
    const observer = new ResizeObserver(() => place(false));
    observer.observe(nav);
    links.forEach(item => observer.observe(item));
    const previous = lastRail && performance.now() - lastRail.time < 1000 ? lastRail.y : undefined;
    lastRail = null;
    place(previous !== undefined, previous);

    nav.addEventListener('pointerover', hover);
    nav.addEventListener('pointerleave', leave);
    nav.addEventListener('focusin', focus);
    nav.addEventListener('focusout', focus);
    desktop.addEventListener('change', resize);
    reduced.addEventListener('change', resize);
    return () => {
      lastRail = nav.dataset.railReady ? {y: position(), time: performance.now()} : null;
      animation?.cancel();
      observer.disconnect();
      delete nav.dataset.railReady;
      nav.removeEventListener('pointerover', hover);
      nav.removeEventListener('pointerleave', leave);
      nav.removeEventListener('focusin', focus);
      nav.removeEventListener('focusout', focus);
      desktop.removeEventListener('change', resize);
      reduced.removeEventListener('change', resize);
    };
  }, [ref, active]);
}
