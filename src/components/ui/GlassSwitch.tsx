'use client';

import Link from 'next/link';
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
  /** @deprecated Retained for callers of the former decorative preview. */
  previewLinks?: boolean;
  className?: string;
  size?: 'regular' | 'compact';
};

/** A controlled group of native links and buttons; the caller owns selection. */
export function GlassSwitch({items, value, ariaLabel, onValueChange, className = '', size = 'regular'}: GlassSwitchProps) {
  const activate = (item: GlassSwitchItem, event: MouseEvent<HTMLElement>) => {
    if (item.disabled) {event.preventDefault(); return;}
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    onValueChange?.(item.id);
  };

  return <div role="group" aria-label={ariaLabel} className={`glass-switch glass-switch--${size} ${className}`.trim()}>
    {items.map(item => {
      const selected = value === item.id;
      const shared = {
        className: 'glass-switch__item',
        'aria-label': item.compactLabel ? item.label : undefined,
        'data-selected': selected,
        onClick: (event: MouseEvent<HTMLElement>) => activate(item, event),
      };
      const label = <span className="glass-switch__label">{item.compactLabel ? <><span className="glass-switch__full-label">{item.label}</span><span className="glass-switch__compact-label" aria-hidden="true">{item.compactLabel}</span></> : item.label}</span>;
      return item.href ? <Link key={item.id} {...shared} href={item.href} prefetch={item.prefetch} scroll={item.scroll} aria-current={selected ? 'page' : undefined} aria-disabled={item.disabled || undefined} tabIndex={item.disabled ? -1 : undefined}>{label}</Link>
        : <button key={item.id} {...shared} type="button" disabled={item.disabled} aria-pressed={selected}>{label}</button>;
    })}
  </div>;
}
