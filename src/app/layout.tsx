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
import {HomeStyleProvider, type HomeStyle} from '@/components/landing/HomeStyleProvider';
import {HOME_STYLE_COOKIE, normalizeHomeStyle, homeStyleColorMode} from '@/lib/home-style.mjs';
import './home-style-controls.css';
import './globals.css';
import './brand.css';
import './site-announcement.css';
import './organic.css';
import './quantum-pointer.css';
import './navigation-transition.css';
import './iavse-system.css';
import './rbp-template.css';
import './rbp-bridge.css';
import './site-styles.css';
import './platform-refresh.css';
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export const metadata:Metadata={applicationName:'IAVSE',title:'IAVSE',description:'Projects, experience, and shared resources.'};
export default async function RootLayout({children}:{children:React.ReactNode}){
  const jar=await cookies(),locale=normalizeLocale(jar.get('site-locale')?.value);
  const homeStyle=normalizeHomeStyle(jar.get(HOME_STYLE_COOKIE)?.value) as HomeStyle;
  const colorMode=homeStyleColorMode(homeStyle,jar.get('site-color-mode')?.value);
  let announcements:SiteAnnouncements={enabled:false,items:[]};try{announcements=readSiteAnnouncements({publicOnly:true})}catch{}
  return <html data-site-style={homeStyle} data-home-style={homeStyle} data-frontend="portfolio" data-site-announcements={announcements.enabled&&announcements.items.length?'enabled':'disabled'} lang={htmlLocale(locale)} data-ui="x-social" data-color-mode={colorMode} data-color-preference={colorMode}><body><noscript><style>{'[data-rbp-entry],[data-rbp-reveal]{opacity:1!important;transform:none!important;filter:none!important}'}</style></noscript><LocaleProvider initialLocale={locale}><HomeStyleProvider initialStyle={homeStyle}><SiteAnnouncementsProvider initial={announcements}><PortfolioRuntime/><Suspense fallback={null}><ApplicationReveal/></Suspense>{children}<NavigationIntent/><NavigationTransition/></SiteAnnouncementsProvider></HomeStyleProvider></LocaleProvider></body></html>
}
