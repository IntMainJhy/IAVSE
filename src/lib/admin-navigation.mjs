const communitySections=new Set(['','spaces','catalog','reviews','comments','reports','accounts','audit']);

// Retain real links for deep linking and modified clicks; ordinary clicks switch the workspace.
export function inlineAdminPath(href,base,current=[]){
 let url,origin;
 try{url=new URL(href,base);origin=new URL(base).origin}catch{return null}
 if(url.origin!==origin||url.search||url.hash)return null;
 const path=url.pathname.replace(/\/$/,'');
 if(path==='/admin/catalog')return ['community','catalog'];
 if(path==='/admin')return [];
 const leaf=path.match(/^\/admin\/(projects|articles|resources|files|taxonomy|settings|trash|logs)$/);
 if(leaf)return [leaf[1]];
 const match=path.match(/^\/admin\/community(?:\/([^/]+))?$/);
 return match&&communitySections.has(match[1]||'')?['community',...(match[1]?[match[1]]:[])]:null;
}

// Native history updates keep the persistent workspace and the router URL in sync.
export function adminLocation(href){
 try{const url=new URL(href,'http://admin.local'),match=url.pathname.match(/^\/admin(?:\/(.*))?$/);if(!match)return null;
  const path=(match[1]||'').split('/').filter(Boolean).map(decodeURIComponent);
  return{path:path.length===1&&path[0]==='catalog'?['community','catalog']:path,query:Object.fromEntries(url.searchParams)};
 }catch{return null}
}
