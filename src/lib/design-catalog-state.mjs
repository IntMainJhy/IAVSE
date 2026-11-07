import {SCENARIOS,STYLE_TAGS,INDUSTRIES} from './design-taxonomy.mjs';

export const CATALOG_FILTER_DEFAULTS={collection:'all',q:'',scenario:'',type:'',tag:'',industry:'',favorites:'',sort:'recommended'};
const collections=new Set(['all','studio','vibeui','stylekit','interactions','components']);
const scenarios=new Set(SCENARIOS.map(item=>item.id)),tags=new Set(STYLE_TAGS.map(item=>item.id)),industries=new Set(INDUSTRIES.map(item=>item.id));
const valid=(value,allowed,fallback='')=>allowed.has(value)?value:fallback;

/** Public URLs keep only values with a visible matching control. */
export function readCatalogFilters(params=new URLSearchParams()){
 const collection=valid(params.get('collection'),collections,'all');
 return {collection:params.get('view')==='components'&&collection==='studio'?'components':collection,
  q:params.get('q')||'',scenario:valid(params.get('scenario'),scenarios),
  type:valid(params.get('styleType'),new Set(['visual','layout'])),
  tag:[...new Set((params.get('tag')||'').split(',').map(value=>value.trim()).filter(value=>tags.has(value)))].join(','),
  industry:valid(params.get('industry')||params.get('category'),industries),
  favorites:params.get('favorites')==='1'?'1':'',sort:params.get('sort')==='name'?'name':'recommended'};
}
export function readCatalogPage(value){const page=Number(value);return Number.isFinite(page)&&page>=1?Math.floor(page):1}
export function catalogQuery(filters={},page=1){
 const query=new URLSearchParams({type:'designs'});
 for(const [key,fallback]of Object.entries(CATALOG_FILTER_DEFAULTS)){const value=filters[key];if(typeof value==='string'&&value&&value!==fallback)query.set(key==='type'?'styleType':key,value)}
 if(readCatalogPage(page)>1)query.set('page',String(readCatalogPage(page)));
 return query;
}
/** localStorage is untrusted; ignore invalid entries without changing valid saves. */
export function readCatalogFavorites(value,validSlugs=[]){
 let parsed;try{parsed=typeof value==='string'?JSON.parse(value):value}catch{return []}
 if(!Array.isArray(parsed))return [];
 const known=new Set(validSlugs);
 return [...new Set(parsed.filter(slug=>typeof slug==='string'&&known.has(slug)))];
}
