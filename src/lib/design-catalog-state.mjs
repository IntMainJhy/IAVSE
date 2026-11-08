import {SCENARIOS} from './design-taxonomy.mjs';

export const CATALOG_FILTER_DEFAULTS={collection:'all',q:'',scenario:'',favorites:'',sort:'recommended'};
const collections=new Set(['all','project','page','design-system']);
const scenarios=new Set(SCENARIOS.map(item=>item.id));
const valid=(value,allowed,fallback='')=>allowed.has(value)?value:fallback;

/** Obsolete source groups, style facets and page offsets are not public template controls. */
export function readCatalogFilters(params=new URLSearchParams()){
 return {collection:valid(params.get('collection'),collections,'all'),q:params.get('q')||'',scenario:valid(params.get('scenario'),scenarios),favorites:params.get('favorites')==='1'?'1':'',sort:params.get('sort')==='name'?'name':'recommended'};
}
export function catalogQuery(filters={}){
 const query=new URLSearchParams({type:'designs'});
 const normalized=readCatalogFilters(new URLSearchParams(Object.entries(filters).filter(([,value])=>typeof value==='string')));
 for(const [key,fallback]of Object.entries(CATALOG_FILTER_DEFAULTS)){const value=normalized[key];if(value&&value!==fallback)query.set(key,value)}
 return query;
}
/** localStorage is untrusted; ignore invalid entries without changing valid saves. */
export function readCatalogFavorites(value,validSlugs=[]){
 let parsed;try{parsed=typeof value==='string'?JSON.parse(value):value}catch{return []}
 if(!Array.isArray(parsed))return [];
 const known=new Set(validSlugs);
 return [...new Set(parsed.filter(slug=>typeof slug==='string'&&known.has(slug)))];
}
