// Request-scoped preload keys ignore query ordering, without caching account data globally.
export function resourceKey(path){const url=new URL(path,'http://site.local');for(const key of new Set(url.searchParams.keys()))if(url.searchParams.getAll(key).every(value=>value===''))url.searchParams.delete(key);url.searchParams.sort();return url.pathname+(url.searchParams.size?'?'+url.searchParams:'')}

// Search/paging can retain visible rows; changing the content collection cannot.
export function resourceFamily(path){
 if(!path)return '';
 const url=new URL(path,'http://site.local');
 return url.pathname==='/api/admin/content'?url.pathname+'?'+new URLSearchParams({type:url.searchParams.get('type')||'',trash:url.searchParams.get('trash')==='1'?'1':'0'}):url.pathname;
}
