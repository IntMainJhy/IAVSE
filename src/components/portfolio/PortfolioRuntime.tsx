'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {IavseHeader} from '../IavseHeader';
import IavseFlowBackdrop from '../landing/IavseFlowBackdrop';
import {platformChrome} from '@/lib/platform-chrome';
import '@/app/iavse-shell.css';

/** Shared platform chrome. Member-authored pages keep their own visual world. */
export function PortfolioRuntime(){
  const path=usePathname();
  const chrome=platformChrome(path);
  useEffect(()=>{
    const sync=()=>document.querySelectorAll('.rbp-surface').forEach(node=>node.classList.toggle('dark',document.documentElement.dataset.colorMode==='dark'));
    sync();
    const observer=new MutationObserver(sync);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-color-mode']});
    return()=>observer.disconnect();
  },[path]);
  if(!chrome.atmosphere)return null;
  return <div className="iavse-platform-shell" data-iavse-platform={chrome.header?'public':'tools'}>
    <div className="iavse-shell-atmosphere"><IavseFlowBackdrop/></div>
    {chrome.header&&<div className="iavse-shell-header"><IavseHeader/></div>}
  </div>;
}
