'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {IavseHeader} from '../IavseHeader';
import {IavseMobileDock} from '../IavseMobileDock';
import {SiteAnnouncement} from '../SiteAnnouncement';
import {PlatformAccountProvider} from '../PlatformAccount';
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
  if(!chrome.atmosphere&&!chrome.header)return null;
  const publicNotice=chrome.header && /^\/(?:$|(?:about|community|resources|docs|skills|blogs|downloads)(?:\/|$))/.test(path);
  return <div className="iavse-platform-shell" data-site-chrome={publicNotice?'platform':undefined} data-iavse-platform={path==='/'?'home':chrome.header?'public':'tools'}>
    {chrome.atmosphere&&<div className="iavse-shell-atmosphere"><IavseFlowBackdrop/></div>}
    {chrome.header&&<PlatformAccountProvider>
      {publicNotice&&<SiteAnnouncement/>}
      <div className="iavse-header-anchor"><div className="iavse-shell-header"><IavseHeader/></div></div>
      <IavseMobileDock path={path}/>
    </PlatformAccountProvider>}
  </div>;
}
