const communitySections=new Set(['','spaces','catalog','reviews','comments','reports','accounts','audit']);

// Retain real links for deep linking and modified clicks; ordinary clicks switch the workspace.
export function inlineAdminPath(href,base,current=[]){
 let url,origin;
 try{url=new URL(href,base);origin=new URL(base).origin}catch{return null}
 if(url.origin!==origin||url.search||url.hash)return null;
 const path=url.pathname.replace(/\/$/,'');
 if(path==='/admin/catalog')return ['community','catalog'];
 if(path==='/admin'&&['community','catalog'].includes(current[0]))return [];
 const match=path.match(/^\/admin\/community(?:\/([^/]+))?$/);
 return match&&communitySections.has(match[1]||'')?['community',...(match[1]?[match[1]]:[])]:null;
}
