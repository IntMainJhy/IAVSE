'use client';

import Link from 'next/link';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {MouseEvent} from 'react';
import '@/app/glass-controls.css';

export type GlassSwitchItem = {
  id: string;
  label: string;
  /** Short visual label on small screens; the full label remains accessible. */
  compactLabel?: string;
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
type Measurement = 'target' | 'layout' | 'settle';
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
const sameBox = (left: Lens | null, right: Lens) => left &&
  Math.abs(left.x - right.x) < .5 && Math.abs(left.y - right.y) < .5 &&
  Math.abs(left.width - right.width) < .5 && Math.abs(left.height - right.height) < .5;

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
  const destination = useRef<Lens | null>(null);
  const frame = useRef(0);
  const measure = useRef<(reason: Measurement) => void>(() => {});
  const intentTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [intent, setIntent] = useState<{value: string; from: string | null} | null>(null);
  const target = intent?.from === value ? intent.value : value;
  const layoutKey = JSON.stringify(items.map(item => [item.id, item.label, item.compactLabel, item.disabled]));

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
    measure.current = reason => {
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
        cancelAnimationFrame(frame.current);
        frame.current = 0;
        delete element.dataset.moving;
        delete element.dataset.lensReady;
        current.current = null;
        destination.current = null;
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
      // Observer delivery and fonts.ready can run after a click or route commit
      // without changing any boxes. Keep that journey alive in either direction.
      if (reason !== 'settle' && previous && sameBox(destination.current, next)) return;
      const travelling = frame.current !== 0;
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      delete element.dataset.moving;
      destination.current = next;
      element.dataset.lensReady = 'true';
      const animate = reason === 'target' || (reason === 'layout' && travelling);
      if (!animate || !previous || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        write(next);
        return;
      }
      const distance = Math.abs(previous.x - next.x) + Math.abs(previous.width - next.width);
      if (sameBox(previous, next)) {
        write(next);
        return;
      }
      const duration = Math.min(540, 390 + distance * .45);
      let elapsed = 0;
      let lastFrame: number | null = null;
      element.dataset.moving = 'true';
      const tick = (now: number) => {
        // Route mounts and scene setup can block the main thread between frames.
        // Count presented motion from the first frame, bounding each step so a
        // long task cannot consume the entire journey before it can be seen.
        if (lastFrame !== null) elapsed += Math.min(50, Math.max(0, now - lastFrame));
        lastFrame = now;
        const progress = Math.min(1, elapsed / duration);
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
    measure.current('target');
  }, [target, layoutKey]);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const resize = () => measure.current('layout');
    const settle = () => measure.current('settle');
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(element);
    for (const control of controls.current.values()) observer?.observe(control);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const visibility = () => { if (document.hidden) settle(); };
    window.addEventListener('resize', resize, {passive: true});
    preference.addEventListener('change', settle);
    document.addEventListener('visibilitychange', visibility);
    document.fonts?.addEventListener('loadingdone', resize);
    let disposed = false;
    document.fonts?.ready.then(() => { if (!disposed) resize(); });
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      preference.removeEventListener('change', settle);
      document.removeEventListener('visibilitychange', visibility);
      document.fonts?.removeEventListener('loadingdone', resize);
    };
  }, [layoutKey]);

  useLayoutEffect(() => () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    measure.current = () => {};
  }, []);

  useEffect(() => {
    // Once a real route commits, an old optimistic click must not reappear when
    // browser Back later returns to the route it originally came from.
    if (intentTimeout.current) clearTimeout(intentTimeout.current);
    intentTimeout.current = null;
    setIntent(null);
  }, [value]);

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
      intentTimeout.current = null;
      if (item.id === value) setIntent(null);
      else {
        setIntent({value: item.id, from: value});
        intentTimeout.current = setTimeout(() => {
          intentTimeout.current = null;
          setIntent(null);
        }, 1400);
      }
    }
    onValueChange?.(item.id);
  };

  return <div ref={root} role="group" aria-label={ariaLabel} className={`glass-switch glass-switch--${size} ${className}`.trim()}>
    {items.map(item => {
      const selected = value === item.id;
      const shared = {
        className: 'glass-switch__item',
        'aria-label': item.compactLabel ? item.label : undefined,
        'data-selected': selected,
        onClick: (event: MouseEvent<HTMLElement>) => activate(item, event),
      };
      const label = switchLabel(item);
      return item.href ? <Link {...shared} key={item.id} href={item.href} prefetch={item.prefetch} scroll={item.scroll} aria-current={selected ? 'page' : undefined} aria-disabled={item.disabled || undefined} tabIndex={item.disabled ? -1 : undefined} ref={node => { if (node) controls.current.set(item.id, node); else controls.current.delete(item.id); }}>{label}</Link>
        : <button {...shared} key={item.id} type="button" disabled={item.disabled} aria-pressed={selected} ref={node => { if (node) controls.current.set(item.id, node); else controls.current.delete(item.id); }}>{label}</button>;
    })}
    <div className="glass-switch__lens" aria-hidden="true" inert>
      <div className="glass-switch__countertrack"><div className="glass-switch__magnification">
        {items.map(item => <span key={item.id} className="glass-switch__copy-item" ref={node => { if (node) copies.current.set(item.id, node); else copies.current.delete(item.id); }}>{switchLabel(item)}</span>)}
      </div></div>
    </div>
  </div>;
}

function switchLabel(item: GlassSwitchItem) {
  return <span className="glass-switch__label">{item.compactLabel ? <><span className="glass-switch__full-label">{item.label}</span><span className="glass-switch__compact-label" aria-hidden="true">{item.compactLabel}</span></> : item.label}</span>;
}
