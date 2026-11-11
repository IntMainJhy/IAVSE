'use client';

import Link from 'next/link';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {MouseEvent} from 'react';
import '@/app/glass-controls.css';

export type GlassSwitchItem = {
  id: string;
  label: string;
  href?: string;
  prefetch?: boolean;
  scroll?: boolean;
  disabled?: boolean;
};

export type GlassSwitchProps = {
  items: readonly GlassSwitchItem[];
  value: string | null;
  ariaLabel: string;
  onValueChange?: (value: string) => void;
  className?: string;
  size?: 'regular' | 'compact';
};

type Lens = {x: number; y: number; width: number; height: number; zoom: number};
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

/**
 * Real links or pressed buttons remain the only interactive elements. The moving
 * lens clips a second, inert text layer and enlarges it briefly while travelling.
 * This is a DOM magnification treatment, not a physical refraction simulation.
 */
export function GlassSwitch({items, value, ariaLabel, onValueChange, className = '', size = 'regular'}: GlassSwitchProps) {
  const root = useRef<HTMLDivElement>(null);
  const controls = useRef(new Map<string, HTMLElement>());
  const copies = useRef(new Map<string, HTMLSpanElement>());
  const current = useRef<Lens | null>(null);
  const frame = useRef(0);
  const measure = useRef<(animate: boolean) => void>(() => {});
  const intentTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [intent, setIntent] = useState<{value: string; from: string | null} | null>(null);
  const target = intent?.from === value ? intent.value : value;
  const layoutKey = JSON.stringify(items.map(item => [item.id, item.label, item.disabled]));

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const write = (next: Lens) => {
      current.current = next;
      element.style.setProperty('--glass-lens-x', `${next.x}px`);
      element.style.setProperty('--glass-lens-y', `${next.y}px`);
      element.style.setProperty('--glass-lens-width', `${next.width}px`);
      element.style.setProperty('--glass-lens-height', `${next.height}px`);
      element.style.setProperty('--glass-lens-zoom', `${next.zoom}`);
    };
    measure.current = animate => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      delete element.dataset.moving;
      const bounds = element.getBoundingClientRect();
      // Absolute text copies share the controls' measured boxes, including
      // localized labels, flex compression, font loading and two-line menus.
      element.style.setProperty('--glass-track-width', `${element.clientWidth}px`);
      element.style.setProperty('--glass-track-height', `${element.clientHeight}px`);
      for (const [id, control] of controls.current) {
        const copy = copies.current.get(id);
        if (!copy) continue;
        const rect = control.getBoundingClientRect();
        Object.assign(copy.style, {
          left: `${rect.left - bounds.left - element.clientLeft}px`,
          top: `${rect.top - bounds.top - element.clientTop}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        });
      }
      const selected = target ? controls.current.get(target) : null;
      if (!selected || !bounds.width || !bounds.height) {
        delete element.dataset.lensReady;
        current.current = null;
        return;
      }
      const rect = selected.getBoundingClientRect();
      const next: Lens = {
        x: rect.left - bounds.left - element.clientLeft,
        y: rect.top - bounds.top - element.clientTop,
        width: rect.width,
        height: rect.height,
        zoom: 1,
      };
      const previous = current.current;
      element.dataset.lensReady = 'true';
      if (!animate || !previous || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        write(next);
        return;
      }
      const distance = Math.abs(previous.x - next.x) + Math.abs(previous.width - next.width);
      if (distance < .5 && Math.abs(previous.y - next.y) < .5 && Math.abs(previous.height - next.height) < .5) {
        write(next);
        return;
      }
      const start = performance.now();
      const duration = Math.min(540, 390 + distance * .45);
      element.dataset.moving = 'true';
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        // The size pulse happens during travel, rather than only on arrival.
        const restingZoom = mix(previous.zoom, 1, eased);
        const zoom = restingZoom + (1.15 - restingZoom) * Math.sin(Math.PI * eased);
        write({
          x: mix(previous.x, next.x, eased),
          y: mix(previous.y, next.y, eased),
          width: mix(previous.width, next.width, eased),
          height: mix(previous.height, next.height, eased),
          zoom,
        });
        if (progress < 1) frame.current = requestAnimationFrame(tick);
        else {
          frame.current = 0;
          delete element.dataset.moving;
          write(next);
        }
      };
      frame.current = requestAnimationFrame(tick);
    };
    measure.current(true);
    return () => { cancelAnimationFrame(frame.current); frame.current = 0; };
  }, [target, layoutKey]);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const resize = () => measure.current(false);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(element);
    for (const control of controls.current.values()) observer?.observe(control);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const visibility = () => { if (document.hidden) resize(); };
    window.addEventListener('resize', resize, {passive: true});
    preference.addEventListener('change', resize);
    document.addEventListener('visibilitychange', visibility);
    document.fonts?.addEventListener('loadingdone', resize);
    let disposed = false;
    document.fonts?.ready.then(() => { if (!disposed) resize(); });
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      preference.removeEventListener('change', resize);
      document.removeEventListener('visibilitychange', visibility);
      document.fonts?.removeEventListener('loadingdone', resize);
      cancelAnimationFrame(frame.current);
    };
  }, [layoutKey]);

  useEffect(() => () => {
    if (intentTimeout.current) clearTimeout(intentTimeout.current);
  }, []);

  const activate = (item: GlassSwitchItem, event: MouseEvent<HTMLElement>) => {
    if (item.disabled) { event.preventDefault(); return; }
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (item.href) {
      // A link responds immediately while Next resolves its real destination.
      // aria-current continues to describe the actual route, never this intent.
      if (intentTimeout.current) clearTimeout(intentTimeout.current);
      setIntent({value: item.id, from: value});
      intentTimeout.current = setTimeout(() => setIntent(null), 1400);
    }
    onValueChange?.(item.id);
  };

  return <div ref={root} role="group" aria-label={ariaLabel} className={`glass-switch glass-switch--${size} ${className}`.trim()}>
    {items.map(item => {
      const selected = value === item.id;
      const shared = {
        className: 'glass-switch__item',
        'data-selected': selected,
        onClick: (event: MouseEvent<HTMLElement>) => activate(item, event),
      };
      const label = <span className="glass-switch__label">{item.label}</span>;
      return item.href ? <Link {...shared} key={item.id} href={item.href} prefetch={item.prefetch} scroll={item.scroll} aria-current={selected ? 'page' : undefined} aria-disabled={item.disabled || undefined} tabIndex={item.disabled ? -1 : undefined} ref={node => { if (node) controls.current.set(item.id, node); else controls.current.delete(item.id); }}>{label}</Link>
        : <button {...shared} key={item.id} type="button" disabled={item.disabled} aria-pressed={selected} ref={node => { if (node) controls.current.set(item.id, node); else controls.current.delete(item.id); }}>{label}</button>;
    })}
    <div className="glass-switch__lens" aria-hidden="true" inert>
      <div className="glass-switch__countertrack"><div className="glass-switch__magnification">
        {items.map(item => <span key={item.id} className="glass-switch__copy-item" ref={node => { if (node) copies.current.set(item.id, node); else copies.current.delete(item.id); }}><span className="glass-switch__label">{item.label}</span></span>)}
      </div></div>
    </div>
  </div>;
}
