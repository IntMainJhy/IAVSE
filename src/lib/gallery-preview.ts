import {galleryLoadOrder,galleryLimit} from './blog-gallery-space.mjs';
import {scheduleGalleryWork} from './gallery-scheduler';

// Only inert, public theme documents are kept in this tab's memory. Static
// authored sites keep their real URL and existing script-capable sandbox.
type Entry={at:number;html?:string;promise:Promise<string|null>};
type Job={key:string;url:string;entry:Entry;resolve:(html:string|null)=>void};
type DocumentJob=Job&{source:string};
const cache=new Map<string,Entry>(),queue:Job[]=[],documents:DocumentJob[]=[],styles=new Set<string>();
const ttl=30000,limit=24,maxDocument=350000;
let active=0,manifest:{locale:string;at:number;promise:Promise<void>}|undefined;
let cancelProcessing:(()=>void)|undefined,listening=false,navigationPending=false;
const valid=(url:string)=>/^\/blog\/[^/?#]+\/preview$/.test(url)||/^\/blogs\/showcase\/[^/?#]+\?embed=gallery$/.test(url);
const keyFor=(url:string,locale:string)=>locale+':'+url;

export function cachedGalleryPreview(url:string,locale:string){
 const entry=cache.get(keyFor(url,locale));
 return entry&&Date.now()-entry.at<ttl?entry.html:undefined;
}

function finish(job:Job,html:string|null){
 if(html!==null){job.entry.html=html;job.entry.at=Date.now();}
 else if(cache.get(job.key)===job.entry)cache.delete(job.key);
 job.resolve(html);
}

function processDocument(html:string){
 const doc=new DOMParser().parseFromString(html,'text/html');
 if(!doc.querySelector('.blog-gallery-embed')||doc.querySelector('.hosted-site'))return null;
 // No hydration or script preload traffic is needed inside a read-only preview.
 doc.querySelectorAll('script,link[as="script"],link[rel="modulepreload"]').forEach(node=>node.remove());
 for(const link of doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')){
  const url=new URL(link.getAttribute('href')!,location.href);
  if(url.origin===location.origin&&url.pathname.startsWith('/_next/static/')&&url.pathname.endsWith('.css')&&!styles.has(url.href)){
   // The theme graph has shared stylesheets. Bound optional warming too.
   if(styles.size>=8)break;styles.add(url.href);
   void fetch(url.href,{cache:'force-cache',credentials:'same-origin'}).catch(()=>styles.delete(url.href));
  }
 }
 return '<!doctype html>'+doc.documentElement.outerHTML;
}

const canProcess=()=>!document.hidden&&!navigationPending&&!document.documentElement.hasAttribute('data-iavse-transition');
const navigation=(event:Event)=>{
 const pending=(event as CustomEvent<{pending:boolean}>).detail?.pending;
 if(typeof pending!=='boolean')return;
 navigationPending=pending;syncProcessing();
};
const visibility=()=>syncProcessing();

function syncProcessing(){
 if(!documents.length){
  cancelProcessing?.();cancelProcessing=undefined;
  if(listening){window.removeEventListener('iavse-navigation-pending',navigation);document.removeEventListener('visibilitychange',visibility);listening=false;navigationPending=false;}
  return;
 }
 if(!listening){
  navigationPending=document.documentElement.hasAttribute('data-iavse-transition');listening=true;
  window.addEventListener('iavse-navigation-pending',navigation);document.addEventListener('visibilitychange',visibility);
 }
 if(!canProcess()){cancelProcessing?.();cancelProcessing=undefined;return;}
 if(cancelProcessing)return;
 // Downloading can finish during the route handoff. Parsing and serializing
 // cannot: yield one document per painted frame, and recheck the live gate in
 // the task so a click/visibility change after RAF cannot steal its next frame.
 cancelProcessing=scheduleGalleryWork(()=>{
  cancelProcessing=undefined;
  if(!canProcess()){syncProcessing();return;}
  const job=documents.shift()!;
  try{finish(job,processDocument(job.source));}catch{finish(job,null);}
  syncProcessing();
 });
}

function pump(){
 while(active<2&&queue.length){
  const job=queue.shift()!;active++;
  void fetch(job.url,{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(8000)})
   .then(async response=>{
    if(!response.ok||!response.headers.get('content-type')?.includes('text/html'))return null;
    const html=await response.text();return html.length>maxDocument?null:html;
   }).catch(()=>null).then(source=>{
    if(source===null)finish(job,null);else{documents.push({...job,source});syncProcessing();}
    active--;pump();
   });
 }
}

export function loadGalleryPreview(url:string,locale:string,priority=false):Promise<string|null>{
 if(!valid(url))return Promise.resolve(null);
 const key=keyFor(url,locale),existing=cache.get(key);
 if(existing&&(existing.html===undefined||Date.now()-existing.at<ttl)){
  const index=queue.findIndex(job=>job.key===key);
  if(priority&&index>0)queue.unshift(...queue.splice(index,1));
  const documentIndex=documents.findIndex(job=>job.key===key);
  if(priority&&documentIndex>0)documents.unshift(...documents.splice(documentIndex,1));
  return existing.promise;
 }
 for(const [key,entry] of cache)if(entry.html!==undefined&&Date.now()-entry.at>=ttl)cache.delete(key);
 if(cache.size>=limit){const oldest=[...cache].find(([,entry])=>entry.html!==undefined);if(!oldest)return Promise.resolve(null);cache.delete(oldest[0]);}
 let resolve!:Job['resolve'];const entry:Entry={at:Date.now(),promise:new Promise(done=>{resolve=done;})};
 cache.set(key,entry);const job={key,url,entry,resolve};if(priority)queue.unshift(job);else queue.push(job);pump();return entry.promise;
}

/** Prepare real documents on navigation intent, without mounting hidden iframes. */
export function warmGalleryPreviews(locale:string):Promise<void>{
 if(manifest?.locale===locale&&Date.now()-manifest.at<ttl)return manifest.promise;
 const promise=fetch('/api/blog-gallery',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(8000)})
  .then(response=>response.ok?response.json():null).then(data=>{
   if(!Array.isArray(data?.previews))return;
   const urls=data.previews.slice(0,galleryLimit);
   for(const index of galleryLoadOrder(urls.length))if(typeof urls[index]==='string')void loadGalleryPreview(urls[index],locale);
  }).catch(()=>{if(manifest?.promise===promise)manifest=undefined;});
 manifest={locale,at:Date.now(),promise};return promise;
}
