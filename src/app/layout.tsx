import type {Metadata,Viewport} from 'next';
import {cookies} from 'next/headers';
import {QuantumBackdrop} from '@/components/QuantumBackdrop';
import {NavigationIntent} from '@/components/NavigationIntent';
import {NavigationTransition} from '@/components/NavigationTransition';
import {QuantumPointer} from '@/components/QuantumPointer';
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
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export const metadata:Metadata={applicationName:'IAVSE',title:'IAVSE',description:'Projects, experience, and shared resources.'};
const designContract='<!-- THESIS: one clear optical space from discovery to creation. OWN-WORLD: original Blender folded glass, blue-to-grey light, local sans, sharp content. STORY: the approved home opening remains unchanged; scoped product-showroom sections present a real public homepage, a usable local canvas, directory excerpts, and single-surface desktop/mobile previews; blog themes switch without overlap; real blog pages pass the camera and settle into a directory; community shares this space; admin and resource discovery use user-selected neutral Bento cards, varied grid spans, 16px corners, brand-blue accents and gentle interactive scale. FIRST VIEWPORT: centered work and actions, transparent gradient-blur fixed navigation, subtle pointer orbit. FORM: user-selected glass world extended through native-scroll Three.js choreography; one platform appearance, authored blog styling retained. UI CATALOG: independent GitHub projects and design-system previews with expandable submit search, compact floating glass cards, progressive cover blur and top GitHub links with explicit scenarios, author, repository and license; continuous 24-item batches, lightweight static covers, one full preview iframe mounted only on demand, responsive modal viewports and focus restoration. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance. -->';
export default async function RootLayout({children}:{children:React.ReactNode}){
  const jar=await cookies(),locale=normalizeLocale(jar.get('site-locale')?.value);
  const colorMode=jar.get('site-color-mode')?.value==='dark'?'dark':'light';
  let announcements:SiteAnnouncements={enabled:false,items:[]};try{announcements=readSiteAnnouncements({publicOnly:true})}catch{}
  return <html data-site-announcements={announcements.enabled&&announcements.items.length?'enabled':'disabled'} lang={htmlLocale(locale)} data-ui="x-social" data-color-mode={colorMode} data-color-preference={colorMode}><body><template id="public-design-contract" dangerouslySetInnerHTML={{__html:designContract}}/><LocaleProvider initialLocale={locale}><SiteAnnouncementsProvider initial={announcements}><QuantumBackdrop/>{children}<NavigationIntent/><NavigationTransition/><QuantumPointer/></SiteAnnouncementsProvider></LocaleProvider></body></html>
}
