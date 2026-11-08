import {SCENARIOS,REFERENCE_INDUSTRIES,VISUAL_STYLES} from './design-taxonomy.mjs';

export const CATALOG_FILTER_DEFAULTS={collection:'all',q:'',scenario:'',industry:'',visual:'',favorites:'',sort:'recommended'};
const collections=new Set(['all','project','page','design-system']);
const scenarios=new Set(SCENARIOS.map(item=>item.id));
const industries=new Set(REFERENCE_INDUSTRIES.map(item=>item.id)),visualStyles=new Set(VISUAL_STYLES.map(item=>item.id));
const valid=(value,allowed,fallback='')=>allowed.has(value)?value:fallback;

/** Source platforms and pagination are not content categories. Facets have stable IDs. */
export function readCatalogFilters(params=new URLSearchParams()){
 return {collection:valid(params.get('collection'),collections,'all'),q:(params.get('q')||'').slice(0,120),scenario:valid(params.get('scenario'),scenarios),industry:valid(params.get('industry'),industries),visual:valid(params.get('visual'),visualStyles),favorites:params.get('favorites')==='1'?'1':'',sort:params.get('sort')==='name'?'name':'recommended'};
}
export function catalogQuery(filters={}){
 const query=new URLSearchParams({type:'designs'});
 const normalized=readCatalogFilters(new URLSearchParams(Object.entries(filters).filter(([,value])=>typeof value==='string')));
 for(const [key,fallback]of Object.entries(CATALOG_FILTER_DEFAULTS)){const value=normalized[key];if(value&&value!==fallback)query.set(key,value)}
 return query;
}
/** localStorage is untrusted; ignore invalid entries without changing valid saves. */
export function parseCatalogFavorites(value){
 let parsed;try{parsed=typeof value==='string'?JSON.parse(value):value}catch{return []}
 if(!Array.isArray(parsed))return [];
 return [...new Set(parsed.filter(slug=>typeof slug==='string'&&slug.length<=100&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)))];
}
export function readCatalogFavorites(value,validSlugs=[]){
 const known=new Set(validSlugs);
 return parseCatalogFavorites(value).filter(slug=>known.has(slug));
}
