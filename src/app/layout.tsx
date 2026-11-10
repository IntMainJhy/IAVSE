import {Suspense} from 'react';
import type {Metadata,Viewport} from 'next';
import {cookies} from 'next/headers';
import {NavigationIntent} from '@/components/NavigationIntent';
import {NavigationTransition} from '@/components/NavigationTransition';
import {ApplicationReveal} from '@/components/rbp/ui/application-reveal';
import {PortfolioRuntime} from '@/components/portfolio/PortfolioRuntime';
import {LocaleProvider} from '@/components/LocaleProvider';
import {SiteAnnouncementsProvider,type SiteAnnouncements} from '@/components/SiteAnnouncement';
import {readSiteAnnouncements} from '@/lib/site-announcements.mjs';
import {normalizeLocale,htmlLocale} from '@/lib/i18n.mjs';
import './globals.css';
import './brand.css';
import './site-announcement.css';
import './organic.css';
import './quantum-pointer.css';
import './navigation-transition.css';
import './iavse-system.css';
import './rbp-template.css';
import './rbp-bridge.css';
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export const metadata:Metadata={applicationName:'IAVSE',title:'IAVSE',description:'Projects, experience, and shared resources.'};
export default async function RootLayout({children}:{children:React.ReactNode}){
  const jar=await cookies(),locale=normalizeLocale(jar.get('site-locale')?.value);
  const colorMode=jar.get('site-color-mode')?.value==='dark'?'dark':'light';
  let announcements:SiteAnnouncements={enabled:false,items:[]};try{announcements=readSiteAnnouncements({publicOnly:true})}catch{}
  return <html data-frontend="portfolio" data-site-announcements={announcements.enabled&&announcements.items.length?'enabled':'disabled'} lang={htmlLocale(locale)} data-ui="x-social" data-color-mode={colorMode} data-color-preference={colorMode}><body><noscript><style>{'[data-rbp-entry],[data-rbp-reveal]{opacity:1!important;transform:none!important;filter:none!important}'}</style></noscript><template id="public-design-contract" dangerouslySetInnerHTML={{__html:'<!-- THESIS: IAVSE brings community, resources and personal publishing together. OWN-WORLD: the homepage uses white, lavender and purple; artistic lettering; clear capsule navigation; soft raised cards. STORY: discover public work, join discussions, find resources, visit personal spaces. FIRST VIEWPORT: centered introduction above a community board and resource rail. FORM: user-approved centred layout, direction seed ccb2345b, original public implementation. Other routes retain the existing shared foundation; authored pages retain their own design. No Pro template source, shader or assets are included. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->'}}/><LocaleProvider initialLocale={locale}><SiteAnnouncementsProvider initial={announcements}><PortfolioRuntime/><Suspense fallback={null}><ApplicationReveal/></Suspense>{children}<NavigationIntent/><NavigationTransition/></SiteAnnouncementsProvider></LocaleProvider></body></html>
}
