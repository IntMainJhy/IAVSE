'use client';

import {useEffect, useState} from 'react';
import {useHomeStyle} from './HomeStyleProvider';
import {LandingScene} from './LandingScene';

/** The reading pages echo the selected hero without competing with their content. */
export function SiteStyleAtmosphere() {
  const {style} = useHomeStyle();
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPaused(preference.matches); sync();
    preference.addEventListener('change', sync); return () => preference.removeEventListener('change', sync);
  }, []);
  return <div className={'site-style-atmosphere site-style-atmosphere--'+style} data-site-atmosphere={style} aria-hidden="true">
    {style === 'brand' ? <img className="site-style-wordmark" src="/media/home-styles/git-fallback-desktop.webp" alt=""/> : <LandingScene key={style} style={style} paused={paused} opened={false} dusk={false}/>}
    <div className="site-style-veil"/>
  </div>;
}
