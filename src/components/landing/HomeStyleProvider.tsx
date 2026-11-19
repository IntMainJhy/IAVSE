'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import {DEFAULT_HOME_STYLE, HOME_STYLE_COOKIE, normalizeHomeStyle, homeStyleColorMode} from '@/lib/home-style.mjs';

/** Legacy scene values remain typed for independently retained scene modules. */
export type HomeStyle = 'fly' | 'brand' | 'anime' | 'classic';
function syncDocument(style: HomeStyle) {
  const root = document.documentElement;
  const appearance = normalizeHomeStyle(style);
  root.dataset.homeStyle = appearance; root.dataset.siteStyle = appearance;
  root.dataset.colorMode = homeStyleColorMode(appearance);
  root.dataset.colorPreference = root.dataset.colorMode;
}
const Context = createContext<{style: HomeStyle; select: (style: HomeStyle) => void; saved: boolean}>({style: DEFAULT_HOME_STYLE as HomeStyle, select: () => {}, saved: true});

export function HomeStyleProvider({initialStyle, children}: {initialStyle: HomeStyle; children: React.ReactNode}) {
  const [style, setStyle] = useState(() => normalizeHomeStyle(initialStyle) as HomeStyle);
  const [saved, setSaved] = useState(true);
  useEffect(() => {syncDocument(style);}, [style]);
  function select(value: HomeStyle) {
    const next = normalizeHomeStyle(value) as HomeStyle;
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
