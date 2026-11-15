'use client';

import {useEffect, useId, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {Check, ChevronDown, PanelsTopLeft} from 'lucide-react';
import {useLocale} from '../LocaleProvider';
import {useHomeStyle, type HomeStyle} from './HomeStyleProvider';

export function HomeStyleSwitcher({className = '', onOpen}: {className?: string; onOpen?: () => void}) {
  const path = usePathname();
  const {locale} = useLocale();
  const {style, select, saved} = useHomeStyle();
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null), id = useId();
  const [open, setOpen] = useState(false), [focus, setFocus] = useState(0);
  const names = locale === 'en' ? ['Character tide', 'Open IAVSE', 'Sea breeze', 'Original IAVSE'] : locale === 'ja' ? ['文字の潮流', 'IAVSE を開く', '海風の便り', 'オリジナル'] : ['字符潮汐', '打开 IAVSE', '海风来信', '经典原版'];
  const descriptions = locale === 'en' ? ['Flowing characters', 'Sculpted wordmark', 'Daylight by the sea', 'Original layout and flowing mist'] : locale === 'ja' ? ['流れる文字の波', '立体ブランドロゴ', '朝の光と海辺のイラスト', '元のレイアウトと霧の光'] : ['流动的字符波面', '立体品牌与光影', '晨光与海边创作', '原版布局与流动雾光'];
  const styles: HomeStyle[] = ['fly', 'brand', 'anime', 'classic'];
  const label = locale === 'en' ? 'Switch UI' : locale === 'ja' ? 'UI を切り替え' : '切换 UI';
  const previousPath = useRef(path);
  useEffect(() => {if (previousPath.current !== path) {previousPath.current = path; setOpen(false);}}, [path]);
  const close = (restore = false) => {setOpen(false); if (restore) trigger.current?.focus();};
  useEffect(() => {if (open) root.current?.querySelectorAll<HTMLButtonElement>('[role=option]')[focus]?.focus();}, [open, focus]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {if (!root.current?.contains(event.target as Node)) setOpen(false);};
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  return <div className={'home-style-switch'+(className ? ' '+className : '')} ref={root} onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget as Node)) close();}}>
    <button ref={trigger} type="button" className="home-style-trigger" id={id+'-trigger'} aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => {if (!open) onOpen?.(); setFocus(styles.indexOf(style)); setOpen(!open);}} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {event.preventDefault(); onOpen?.(); setFocus(styles.indexOf(style)); setOpen(true);}
      if (event.key === 'Escape') {event.preventDefault(); event.stopPropagation(); close(true);}
    }}><PanelsTopLeft size={16} aria-hidden="true"/><span>{label}</span><ChevronDown size={13} aria-hidden="true"/></button>
    <div className="home-style-menu" id={id} role="listbox" aria-labelledby={id+'-trigger'} hidden={!open} onKeyDown={event => {
      if (event.key === 'Escape') {event.preventDefault(); event.stopPropagation(); close(true);}
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {event.preventDefault(); setFocus(value => (value + (event.key === 'ArrowDown' ? 1 : styles.length - 1)) % styles.length);}
      if (event.key === 'Home' || event.key === 'End') {event.preventDefault(); setFocus(event.key === 'Home' ? 0 : styles.length - 1);}
    }}>{styles.map((value, index) => <button key={value} type="button" role="option" aria-selected={style === value} tabIndex={focus === index ? 0 : -1} data-style-option={value} onClick={() => {select(value); close(true);}}>
      <span className={'home-style-thumb home-style-thumb--'+value} aria-hidden="true">{value === 'fly' ? '01 / + 0' : value === 'brand' || value === 'classic' ? 'IAVSE' : ''}</span><span><strong>{names[index]}</strong><small>{descriptions[index]}</small></span>{style === value && <Check size={16} aria-hidden="true"/>}
    </button>)}</div>
    <span className="community-sr" role="status">{!saved ? locale === 'en' ? 'UI changed. Your browser did not allow saving this preference.' : locale === 'ja' ? 'UI を変更しました。ブラウザが設定の保存を許可していません。' : 'UI 已切换，浏览器未允许保存偏好。' : ''}</span>
  </div>;
}
