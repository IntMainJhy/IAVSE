'use client';
import {useEffect,useLayoutEffect,useRef,type RefObject} from 'react';

export function useAdminEffects(root:RefObject<HTMLElement|null>,readyKey:string){
 useLayoutEffect(()=>{
  const host=root.current;if(!host||!readyKey||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const stage=host.querySelector<HTMLElement>('.admin-route-content');if(!stage)return;
  if(stage.querySelector('.admin-task-cards'))return; // React Bits handles the overview itself.
  const animations=[stage.animate([{opacity:.82},{opacity:1}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'})];
  return()=>animations.forEach(animation=>animation.cancel());
 },[root,readyKey]);

}

export function useAdminDrawer(drawer:RefObject<HTMLDialogElement|null>){
 const animation=useRef<Animation|null>(null);
 const open=()=>{
  const node=drawer.current;if(!node||node.open&&!animation.current)return;
  const from=node.open?{transform:getComputedStyle(node).transform,opacity:getComputedStyle(node).opacity}:{transform:'translateX(-100%)',opacity:.7};
  animation.current?.cancel();animation.current=null;if(!node.open)node.showModal();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const entry=node.animate([from,{transform:'translateX(0)',opacity:1}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'});
   animation.current=entry;entry.onfinish=()=>{if(animation.current===entry)animation.current=null};
  }
 };
 const close=(immediate=false)=>{
  const node=drawer.current;if(!node?.open){animation.current?.cancel();animation.current=null;return;}
  const from={transform:getComputedStyle(node).transform,opacity:getComputedStyle(node).opacity};
  animation.current?.cancel();animation.current=null;
  if(immediate||matchMedia('(prefers-reduced-motion: reduce)').matches){node.close();return;}
  const exit=node.animate([from,{transform:'translateX(-100%)',opacity:.7}],{duration:160,easing:'cubic-bezier(.4,0,1,1)'});
  animation.current=exit;exit.onfinish=()=>{if(animation.current===exit){node.close();animation.current=null}};
 };
 useEffect(()=>{const node=drawer.current;if(!node)return;const cancel=(event:Event)=>{event.preventDefault();close()};node.addEventListener('cancel',cancel);return()=>{animation.current?.cancel();node.removeEventListener('cancel',cancel)}},[drawer]);
 return{open,close};
}
