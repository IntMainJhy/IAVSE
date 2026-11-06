// A frame followed by a task lets the current route/ripple paint between the
// expensive driver and geometry phases, including when the chunk was cached.
export function yieldRenderSetup(signal:AbortSignal){
 return new Promise<void>((resolve,reject)=>{
  if(signal.aborted){reject(new DOMException('Aborted','AbortError'));return;}
  let frame=0,timer:ReturnType<typeof setTimeout>|undefined;
  const abort=()=>{cancelAnimationFrame(frame);clearTimeout(timer);signal.removeEventListener('abort',abort);reject(new DOMException('Aborted','AbortError'));};
  signal.addEventListener('abort',abort,{once:true});
  frame=requestAnimationFrame(()=>{frame=0;timer=setTimeout(()=>{signal.removeEventListener('abort',abort);if(signal.aborted)reject(new DOMException('Aborted','AbortError'));else resolve();},0);});
 });
}
