import type {Metadata,Viewport} from 'next';
import {cookies} from 'next/headers';
import {QuantumBackdrop} from '@/components/QuantumBackdrop';
import {NavigationIntent} from '@/components/NavigationIntent';
import {NavigationTransition} from '@/components/NavigationTransition';
import {QuantumPointer} from '@/components/QuantumPointer';
import {LocaleProvider} from '@/components/LocaleProvider';
import {normalizeLocale,htmlLocale} from '@/lib/i18n.mjs';
import './globals.css';
import './brand.css';
import './organic.css';
import './quantum-pointer.css';
import './navigation-transition.css';
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export const metadata:Metadata={applicationName:'IAVSE',title:'IAVSE',description:'Projects, experience, and shared resources.'};
const designContract='<!-- THESIS: one clear optical space from discovery to creation. OWN-WORLD: original Blender folded glass, blue-to-grey light, local sans, sharp content. STORY: home folds remain in the opening scene; real blog pages pass the camera and settle into a directory; resources and community share this space. FIRST VIEWPORT: centered work and actions, transparent gradient-blur fixed navigation, subtle pointer orbit. FORM: user-selected glass world extended through native-scroll Three.js choreography; one platform appearance, authored blog styling retained. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance. -->';
export default async function RootLayout({children}:{children:React.ReactNode}){
  const locale=normalizeLocale((await cookies()).get('site-locale')?.value);
  return <html lang={htmlLocale(locale)} data-ui="x-social" data-color-mode="light" data-color-preference="light"><body><template id="public-design-contract" dangerouslySetInnerHTML={{__html:designContract}}/><LocaleProvider initialLocale={locale}><QuantumBackdrop/>{children}<NavigationIntent/><NavigationTransition/><QuantumPointer/></LocaleProvider></body></html>
}
