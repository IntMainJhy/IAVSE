import {ScrollTrigger} from 'gsap/ScrollTrigger';

type Client={root:HTMLElement;dirty:boolean};
const clients=new Set<Client>();
let frame=0,navigating=false;
const blocked=()=>document.hidden||navigating||document.documentElement.hasAttribute('data-iavse-transition')||ScrollTrigger.isScrolling();
const stop=()=>{cancelAnimationFrame(frame);frame=0;};
const schedule=()=>{
 if(frame||blocked()||![...clients].some(client=>client.dirty&&client.root.isConnected))return;
 frame=requestAnimationFrame(()=>{
  frame=0;
  // Scrolling, a route handoff or a visibility change may start after queuing.
  if(blocked())return;
  let refresh=false;
  for(const client of clients){
   if(client.dirty&&client.root.isConnected)refresh=true;
   client.dirty=false;
  }
  if(refresh)ScrollTrigger.refresh();
 });
};
const visibility=()=>{if(document.hidden)stop();else schedule();};
const navigation=(event:Event)=>{
 const pending=(event as CustomEvent<{pending:boolean}>).detail?.pending;
 if(typeof pending!=='boolean')return;
 navigating=pending||document.documentElement.hasAttribute('data-iavse-transition');
 if(navigating)stop();else schedule();
};

/** Both home animation owners share one global refresh per frame. Requests stay
 * dirty during scrolling or route handoff, and disappear with their owner. */
export function homeScrollRefresh(root:HTMLElement){
 const client:Client={root,dirty:false};let live=true;
 if(!clients.size){
  navigating=document.documentElement.hasAttribute('data-iavse-transition');
  window.addEventListener('iavse-navigation-pending',navigation);
  document.addEventListener('visibilitychange',visibility);
  ScrollTrigger.addEventListener('scrollEnd',schedule);
 }
 clients.add(client);
 return{
  request:()=>{if(live&&root.isConnected){client.dirty=true;schedule();}},
  dispose:()=>{
   if(!live)return;live=false;clients.delete(client);
   if(![...clients].some(entry=>entry.dirty&&entry.root.isConnected))stop();
   if(!clients.size){
    window.removeEventListener('iavse-navigation-pending',navigation);
    document.removeEventListener('visibilitychange',visibility);
    ScrollTrigger.removeEventListener('scrollEnd',schedule);
    navigating=false;
   }
  }
 };
}
