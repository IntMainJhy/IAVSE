'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import {DEFAULT_HOME_STYLE, HOME_STYLE_COOKIE, CLASSIC_COLOR_COOKIE, normalizeHomeStyle, homeStyleColorMode} from '@/lib/home-style.mjs';

export type HomeStyle = 'fly' | 'brand' | 'anime' | 'classic';
function syncDocument(style: HomeStyle) {
  const root = document.documentElement;
  let classicMode = root.dataset.siteStyle === 'classic' ? root.dataset.colorMode : 'light';
  if (root.dataset.siteStyle !== 'classic') try {classicMode = document.cookie.split(';').some(item => item.trim() === `${CLASSIC_COLOR_COOKIE}=dark`) ? 'dark' : 'light';} catch {}
  root.dataset.homeStyle = style; root.dataset.siteStyle = style;
  root.dataset.colorMode = homeStyleColorMode(style, classicMode);
  root.dataset.colorPreference = root.dataset.colorMode;
}
const Context = createContext<{style: HomeStyle; select: (style: HomeStyle) => void; saved: boolean}>({style: DEFAULT_HOME_STYLE as HomeStyle, select: () => {}, saved: true});

export function HomeStyleProvider({initialStyle, children}: {initialStyle: HomeStyle; children: React.ReactNode}) {
  const [style, setStyle] = useState(initialStyle);
  const [saved, setSaved] = useState(true);
  useEffect(() => {syncDocument(style);}, [style]);
  function select(value: HomeStyle) {
    const next = normalizeHomeStyle(value) as HomeStyle;
    if (document.documentElement.dataset.siteStyle === 'classic') try {document.cookie = `${CLASSIC_COLOR_COOKIE}=${document.documentElement.dataset.colorMode}; Path=/; Max-Age=31536000; SameSite=Lax`;} catch {}
    syncDocument(next);
    setStyle(next);
    try {
      document.cookie = `site-color-mode=${document.documentElement.dataset.colorMode}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.cookie = `${HOME_STYLE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      setSaved(document.cookie.split(';').some(item => item.trim() === `${HOME_STYLE_COOKIE}=${next}`));
    } catch {setSaved(false);}
  }
  return <Context.Provider value={{style, select, saved}}>{children}</Context.Provider>;
}
export const useHomeStyle = () => useContext(Context);
