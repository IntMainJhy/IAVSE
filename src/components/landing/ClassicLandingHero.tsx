'use client';

import {lazy,Suspense} from 'react';
import {GlassSwitch} from '@/components/ui/GlassSwitch';
import {useLocale} from '@/components/LocaleProvider';
import {landingCopy} from '@/lib/landing-copy';

// Keep the main-branch hero and isolate its original shader from the other UIs.
const ClassicBackdrop=lazy(()=>import('./ClassicFlowBackdrop'));
export function ClassicLandingHero(){
 const {locale}=useLocale(),c=landingCopy(locale);
 return <section className="iv-hero" data-home-hero="classic">
  <div className="iavse-shell-atmosphere"><Suspense fallback={<div className="classic-flow-static"/>}><ClassicBackdrop/></Suspense></div>
  <div className="iv-container iv-hero-copy" data-landing-reveal>
   <h1 className="iv-title">{c.title.map(line=><span key={line}>{line}</span>)}</h1>
   <p>{c.intro}</p>
   <nav className="iv-actions" aria-label={c.productEntries}><GlassSwitch className="iv-entry-switch" previewLinks value={null} ariaLabel={c.productEntries} items={[{id:'community',label:c.community,href:'/community'},{id:'resources',label:c.resources,href:'/resources'}]}/></nav>
  </div>
 </section>;
}
