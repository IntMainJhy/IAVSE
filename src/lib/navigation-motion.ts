const mainLinks='.organic-header .organic-desktop-nav>a,.organic-header .organic-mobile-menu>nav>a,.organic-header a.organic-brand';
const destinations=new Set(['/','/community','/blogs','/resources']);

/** Resource catalogs and legal consultation share stationary navigation and controls. */
export const resourceFramePath=(path:string)=>/^\/(?:resources(?:\/legal-consultation)?|docs|skills)\/?$/.test(path.split(/[?#]/,1)[0]);

/** Shared ownership rule: only the persistent controller animates these links. */
export function mainNavigationDestination(link:HTMLAnchorElement){
 if(!link.matches(mainLinks)||link.target&&link.target!=='_self'||link.hasAttribute('download'))return null;
 const url=new URL(link.href,location.href);
 return url.origin===location.origin&&destinations.has(url.pathname)&&!url.search&&!url.hash&&url.pathname!==location.pathname+location.search?url.pathname:null;
}

/** Small visible receivers only: never transform a fixed rail, canvas or 3D world. */
export function navigationReceivers(root:HTMLElement,entering=false){
 const candidates=Array.from(root.querySelectorAll<HTMLElement>('.creator-directory-intro,.resource-hub-tabs,.catalog-page-heading,.catalog-search,.resource-overview-search,.resource-overview-group,.community-route-content'));
 return candidates.filter(node=>!candidates.some(parent=>parent!==node&&parent.contains(node)))
  // Next restores scroll after child layout effects; entering headings can still
  // have the previous page's scroll offset here. Bound their count, not visibility.
  .filter(node=>{if(entering)return true;const rect=node.getBoundingClientRect();return rect.bottom>0&&rect.top<innerHeight;}).slice(0,4);
}
