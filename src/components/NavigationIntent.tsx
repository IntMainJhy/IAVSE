'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useLocale} from './LocaleProvider';
import {preloadCommunity} from './RouteClients';

const destinations=new Set(['/','/community','/blogs','/resources','/about']);
const mainNavigation='.organic-header .organic-desktop-nav>a,.organic-header .organic-mobile-menu>nav>a,[data-iavse-header] .iavse-header__nav a[href],[data-iavse-header] a.iavse-header__brand,.iavse-mobile-dock a.iavse-mobile-dock__tab';
const catalogNavigation='.resource-hub-tabs .resource-tab-link[href]';
const catalogTypes=new Set(['designs','docs','skills','resources']);
type Connection={saveData?:boolean;effectiveType?:string};

/** Prepare public route data and its critical module; never intercept a click. */
export function NavigationIntent(){
 const router=useRouter(),{locale}=useLocale();
 useEffect(()=>{
  const warmed=new Map<string,number>();
  const idleQueue=['/resources?type=skills','/community','/blogs','/about','/resources?type=docs','/resources?type=resources','/'].filter(href=>href!==location.pathname+location.search);
  let timer:ReturnType<typeof setTimeout>|undefined,idleTimer:ReturnType<typeof setTimeout>|undefined,idle:number|undefined;
  let hovered:HTMLAnchorElement|null=null,disposed=false,navigationPending=false;
  const allowed=()=>{const connection=(navigator as Navigator&{connection?:Connection}).connection;return !connection?.saveData&&!['slow-2g','2g','3g'].includes(connection?.effectiveType||'');};
  const cancel=()=>{clearTimeout(timer);timer=undefined;hovered=null;};
  const cancelIdle=()=>{clearTimeout(idleTimer);idleTimer=undefined;if(idle!==undefined)window.cancelIdleCallback?.(idle);idle=undefined;};
  const destination=(link:HTMLAnchorElement)=>{
   if(link.target&&link.target!=='_self'||link.hasAttribute('download'))return null;
   let url:URL;try{url=new URL(link.href,location.href);}catch{return null;}
   if(url.origin!==location.origin||url.hash)return null;
   const href=url.pathname+url.search;if(href===location.pathname+location.search)return null;
   if(link.matches(mainNavigation)&&destinations.has(url.pathname)&&!url.search)return href;
   if(!link.matches(catalogNavigation))return null;
   if(url.pathname==='/resources/legal-consultation'&&!url.search)return href;
   if(url.pathname!=='/resources'||[...url.searchParams.keys()].some(key=>!['type','q'].includes(key)))return null;
   return (!url.search||catalogTypes.has(url.searchParams.get('type')||'')&&(url.searchParams.get('q')||'').length<=160)?href:null;
  };
  const warm=(href:string)=>{
   if(!allowed()||document.hidden||href===location.pathname+location.search)return;
   const now=Date.now();for(const [key,at]of warmed)if(now-at>=30000)warmed.delete(key);
   if(warmed.has(href))return;
   try{
    router.prefetch(href);
    if(warmed.size>=16)warmed.delete(warmed.keys().next().value!);
    warmed.set(href,now);
    // React.lazy otherwise starts this chunk only after the destination responds.
    if(href==='/community')void preloadCommunity().catch(()=>{});
   }catch{}
  };
  const scheduleIdle=(delay=1200)=>{
   if(disposed||idleTimer!==undefined||idle!==undefined||!idleQueue.length||!allowed()||document.hidden||navigationPending)return;
   if(!document.querySelector('[data-iavse-header]'))return;
   idleTimer=setTimeout(()=>{
    idleTimer=undefined;
    const run=()=>{idle=undefined;if(disposed||document.hidden||navigationPending||!allowed())return;const href=idleQueue.shift();if(href)warm(href);scheduleIdle();};
    if(window.requestIdleCallback)idle=window.requestIdleCallback(run,{timeout:2500});else run();
   },delay);
  };
  const prepare=(event:Event)=>{
   const input=event as PointerEvent;
   if(event.defaultPrevented||input.metaKey||input.ctrlKey||input.shiftKey||input.altKey)return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   const href=link&&destination(link);if(!link||!href)return;
   if(event.type!=='pointerover'){cancel();warm(href);return;}
   if(link===hovered)return;
   cancel();hovered=link;timer=setTimeout(()=>{cancel();warm(href);},120);
  };
  const leave=(event:PointerEvent)=>{if(hovered&&!(event.relatedTarget instanceof Element&&event.relatedTarget.closest('a[href]')===hovered))cancel();};
  const interaction=(event?:Event)=>{cancel();cancelIdle();if(event)prepare(event);scheduleIdle(1800);};
  const navigation=(event:Event)=>{navigationPending=!!(event as CustomEvent<{pending:boolean}>).detail?.pending;if(navigationPending){cancel();cancelIdle();}else scheduleIdle();};
  const visibility=()=>{if(document.hidden){cancel();cancelIdle();}else scheduleIdle();};
  const loaded=()=>scheduleIdle(900);
  if(document.readyState==='complete')loaded();else window.addEventListener('load',loaded,{once:true});
  document.addEventListener('pointerover',prepare,{passive:true});
  document.addEventListener('pointerout',leave,{passive:true});
  document.addEventListener('pointerdown',interaction,{passive:true});
  document.addEventListener('focusin',prepare);
  document.addEventListener('touchstart',prepare,{passive:true});
  document.addEventListener('visibilitychange',visibility);
  window.addEventListener('iavse-navigation-pending',navigation);
  return()=>{disposed=true;cancel();cancelIdle();window.removeEventListener('load',loaded);document.removeEventListener('pointerover',prepare);document.removeEventListener('pointerout',leave);document.removeEventListener('pointerdown',interaction);document.removeEventListener('focusin',prepare);document.removeEventListener('touchstart',prepare);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('iavse-navigation-pending',navigation);};
 },[router,locale]);
 return null;
}
