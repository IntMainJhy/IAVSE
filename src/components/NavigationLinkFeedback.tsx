'use client';

import {useEffect} from 'react';
import {useLinkStatus} from 'next/link';

// Native links share the existing work gate. Overlapping requests must not let
// an old completion resume preview parsing while a newer destination is pending.
const pendingLinks=new Set<object>();
export function useNavigationPending(pending:boolean){
 useEffect(()=>{
  if(!pending)return;
  const token={};pendingLinks.add(token);
  if(pendingLinks.size===1)window.dispatchEvent(new CustomEvent('iavse-navigation-pending',{detail:{pending:true}}));
  return()=>{if(pendingLinks.delete(token)&&pendingLinks.size===0)window.dispatchEvent(new CustomEvent('iavse-navigation-pending',{detail:{pending:false}}));};
 },[pending]);
}
export function NavigationLinkFeedback(){
 const {pending}=useLinkStatus();useNavigationPending(pending);return null;
}
