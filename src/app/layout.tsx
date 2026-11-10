import type {Metadata,Viewport} from 'next';
import {cookies} from 'next/headers';
import {NavigationIntent} from '@/components/NavigationIntent';
import {NavigationTransition} from '@/components/NavigationTransition';
import {PortfolioRuntime} from '@/components/portfolio/PortfolioRuntime';
import {LocaleProvider} from '@/components/LocaleProvider';
import {SiteAnnouncementsProvider,type SiteAnnouncements} from '@/components/SiteAnnouncement';
import {readSiteAnnouncements} from '@/lib/site-announcements.mjs';
import {normalizeLocale,htmlLocale} from '@/lib/i18n.mjs';
import './globals.css';
import './brand.css';
import './site-chrome.css';
import './site-announcement.css';
import './organic.css';
import './quantum-pointer.css';
import './navigation-transition.css';
import './portfolio-foundation.css';
import './rbp-template.css';
import './rbp-bridge.css';
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export const metadata:Metadata={applicationName:'IAVSE',title:'IAVSE',description:'Projects, experience, and shared resources.'};
export default async function RootLayout({children}:{children:React.ReactNode}){
  const jar=await cookies(),locale=normalizeLocale(jar.get('site-locale')?.value);
  const colorMode=jar.get('site-color-mode')?.value==='dark'?'dark':'light';
  let announcements:SiteAnnouncements={enabled:false,items:[]};try{announcements=readSiteAnnouncements({publicOnly:true})}catch{}
  return <html data-frontend="portfolio" data-site-announcements={announcements.enabled&&announcements.items.length?'enabled':'disabled'} lang={htmlLocale(locale)} data-ui="x-social" data-color-mode={colorMode} data-color-preference={colorMode}><body><template id="public-design-contract" dangerouslySetInnerHTML={{__html:'<!-- IAVSE frontend based on DavidHDev/rbp-portfolio. Original Hero / Projects / ContactCard and About composition, original Motion timing, nav and Lenis; only IAVSE content and destinations change. Existing author content, publishing and account permissions remain. -->'}}/><LocaleProvider initialLocale={locale}><SiteAnnouncementsProvider initial={announcements}><PortfolioRuntime/>{children}<NavigationIntent/><NavigationTransition/></SiteAnnouncementsProvider></LocaleProvider></body></html>
}
