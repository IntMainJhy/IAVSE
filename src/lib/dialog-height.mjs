/** Keep a centered dialog at its content's natural height, including lazy forms.
 * Only the small overlay is laid out during the bounded transition; content is never scaled.
 */
export function observeDialogHeight(element,content){
 if(!element||!content)return()=>{};
 const view=element.ownerDocument.defaultView,motion=view.matchMedia('(prefers-reduced-motion: reduce)'),original=element.style.height;
 let animation=null,previous=0;
 function update(animate=true){
  if(!animate||motion.matches){animation?.cancel();animation=null;}
  const available=Math.max(160,Math.min(view.innerHeight,view.visualViewport?.height??view.innerHeight)-32);
  const next=Math.min(content.offsetHeight,available);
  if(!next||Math.abs(previous-next)<1)return;
  const current=parseFloat(view.getComputedStyle(element).height)||next;
  animation?.cancel();animation=null;element.style.height=next+'px';
  if(previous&&animate&&!motion.matches&&Math.abs(current-next)>=1&&typeof element.animate==='function'){
   const active=element.animate([{height:current+'px'},{height:next+'px'}],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'});
   animation=active;active.onfinish=()=>{if(animation===active){animation=null;active.cancel();}};
  }
  previous=next;
 }
 update(false);
 const observer=view.ResizeObserver?new view.ResizeObserver(()=>update()):null;
 observer?.observe(content);
 const resize=()=>update(false);
 view.addEventListener('resize',resize);view.visualViewport?.addEventListener('resize',resize);motion.addEventListener('change',resize);
 return()=>{animation?.cancel();observer?.disconnect();view.removeEventListener('resize',resize);view.visualViewport?.removeEventListener('resize',resize);motion.removeEventListener('change',resize);element.style.height=original;};
}
