import React from 'react';
export default function Link({href,children,prefetch: _prefetch,replace: _replace,scroll: _scroll,...props}:any){
 const raw=typeof href==='string'?href:(href?.pathname||'#');
 const url=raw==='/templates'?'https://www.stylekit.top/zh/templates':raw.replace(/^\/(?:zh\/|en\/)?templates\//,'/template-sites/');
 const external=/^https?:/.test(url);
 return <a {...props} href={url} {...(external?{target:'_blank',rel:'noopener noreferrer'}:{})}>{children}</a>;
}
