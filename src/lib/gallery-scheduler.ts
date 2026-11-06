/** Admit document work after a painted frame, never inside a load/React cascade. */
export function scheduleGalleryWork(work:()=>void){
 let live=true,timer:ReturnType<typeof setTimeout>|undefined;
 const frame=requestAnimationFrame(()=>{timer=setTimeout(()=>{if(live)work();},0);});
 return()=>{live=false;cancelAnimationFrame(frame);clearTimeout(timer);};
}
