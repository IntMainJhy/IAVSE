/** The iframe load event can precede a streamed React theme. Keep the identity
 * preview visible until the public document replaces its Suspense fallback. */
export function observeGalleryFrame(frame:HTMLIFrameElement,ready:()=>void){
 let observer:MutationObserver|null=null,timer:ReturnType<typeof setTimeout>|undefined,closed=false,waiting=false;
 const stop=()=>{closed=true;observer?.disconnect();if(timer)clearTimeout(timer);};
 let document:Document|null;
 try{document=frame.contentDocument;}catch{return stop;}
 if(!document?.documentElement)return stop;
 const check=()=>{
  if(closed)return;
  const embed=document.querySelector('.blog-gallery-embed');if(!embed)return;
  const hosted=embed.querySelector('.hosted-site');
  const present=hosted?!!hosted.querySelector('iframe')&&!hosted.querySelector('.hosted-loading'):Array.from(embed.children).some(element=>element.matches('div,main,article,section')&&!element.hasAttribute('hidden')&&element.getAttribute('aria-hidden')!=='true');
  if(present&&!waiting){
   waiting=true;
   const reveal=()=>{if(closed)return;stop();ready();};
   // font-display:swap must not replace headings after the whole scene appears.
   if(document.fonts)void document.fonts.ready.then(reveal,reveal);else reveal();
  }
 };
 observer=new MutationObserver(check);observer.observe(document.documentElement,{childList:true,subtree:true});
 timer=setTimeout(stop,15000);check();return stop;
}
