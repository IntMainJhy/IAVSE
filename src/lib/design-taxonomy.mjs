import seed from './design-taxonomy-seed.json' with {type:'json'};

/** StyleKit's explicitly curated facets, combined with VibeUI's industry labels. */
export const SCENARIOS=seed.scenarios;
export const STYLE_TAGS=seed.styleTags;
export const INDUSTRIES=seed.industries;
export const TAXONOMY_PROVENANCE=seed.provenance;
const scenarioIds=new Set(SCENARIOS.map(item=>item.id)),tagIds=new Set(STYLE_TAGS.map(item=>item.id)),industryIds=new Set(INDUSTRIES.map(item=>item.id));
const collectionIds=new Set(['all','studio','vibeui','stylekit','interactions','components']);
const text=value=>typeof value==='string'?value.trim():'';
const normalized=value=>String(value??'').normalize('NFKC').toLocaleLowerCase();
const website=entry=>entry?.studio?.kind==='website'||Boolean(text(entry?.studio?.websiteKey));
const interaction=entry=>entry?.studio?.kind==='page'&&!website(entry);
const component=entry=>entry?.studio?.kind==='component';
const collectionName=entry=>normalized(typeof entry?.collection==='string'?entry.collection:entry?.collection?.name);
const sourceSlug=entry=>{
 const raw=text(entry?.studio?.sourceSlug);
 return raw&&!raw.startsWith('stylekit-')&&Object.hasOwn(seed.styles,raw)?'stylekit-'+raw:raw;
};
const sourceStyle=entry=>{
 const slug=sourceSlug(entry)||text(entry?.slug);
 return slug.startsWith('stylekit-')?seed.styles[slug.slice(9)]:undefined;
};
const isStylekit=entry=>text(entry?.slug).startsWith('stylekit-')||collectionName(entry).includes('stylekit')||(website(entry)&&sourceSlug(entry).startsWith('stylekit-'));
const isVibeui=entry=>text(entry?.slug).startsWith('vibeui-')||collectionName(entry).includes('vibeui');
const ownScenarios={
 'iavse-optical-glass':['marketing','creative'],'iavse-spatial-gallery':['portfolio','blog'],
 'iavse-resource-story':['docs'],'iavse-bento-control':['dashboard','admin'],
};
const ownIndustries={'iavse-optical-glass':'落地页','iavse-spatial-gallery':'设计生产','iavse-resource-story':'通用','iavse-bento-control':'分析仪表'};
const knownValues=(value,allowed)=>Array.isArray(value)?[...new Set(value.filter(item=>typeof item==='string'&&allowed.has(item)))]:undefined;

/** Unknown source memberships stay empty; descriptions are never keyword-classified. */
export function designFacets(entry={}){
 const style=sourceStyle(entry),explicit=entry?.studio||{};
 const scenarios=style?.scenarios??knownValues(explicit.scenarios,scenarioIds)??ownScenarios[entry.slug]??[];
 const tags=style?.tags??knownValues(explicit.tags,tagIds)??(Array.isArray(entry.tags)&&entry.tags.includes('品牌参考')?['brand-inspired']:[]);
 const styleType=style?.styleType||(['visual','layout'].includes(explicit.styleType)?explicit.styleType:'visual');
 const industry=industryIds.has(entry.category)?entry.category:ownIndustries[entry.slug]||'通用';
 return {scenarios:[...scenarios],styleType,tags:[...tags],industry};
}

/** Present one website per source while keeping every original record untouched. */
export function catalogPresentationEntries(entries=[]){
 const candidates=Array.isArray(entries)?entries.filter(entry=>entry&&typeof entry==='object'&&!interaction(entry)&&!component(entry)):[];
 const replacements=new Set(candidates.filter(website).map(sourceSlug).filter(Boolean)),seen=new Set(),seenSources=new Set();
 return candidates.filter(entry=>{
  const slug=text(entry.slug),source=sourceSlug(entry);
  if(!slug||seen.has(slug))return false;
  if(website(entry)&&source){if(seenSources.has(source))return false;seenSources.add(source)}
  else if(replacements.has(slug))return false;
  seen.add(slug);return true;
 });
}

/** Facets combine with AND; comma-separated tags require every selected tag. */
export function filterCatalog(entries=[],filters={},favorites=[]){
 const options=filters&&typeof filters==='object'?filters:{};
 const collection=text(options.collection)||'all',scenario=text(options.scenario),type=text(options.type),industry=text(options.industry),tag=text(options.tag),query=normalized(text(options.q));
 const selectedTags=tag&&tag!=='all'?[...new Set(tag.split(',').map(value=>value.trim()).filter(Boolean))]:[];
 if(!collectionIds.has(collection)||(scenario&&scenario!=='all'&&!scenarioIds.has(scenario))||(type&&type!=='all'&&!['visual','layout'].includes(type))||(industry&&industry!=='all'&&!industryIds.has(industry))||selectedTags.some(value=>!tagIds.has(value)))return [];
 const all=Array.isArray(entries)?entries.filter(entry=>entry&&typeof entry==='object'):[];
 let scoped=collection==='interactions'?all.filter(interaction):collection==='components'?all.filter(component):catalogPresentationEntries(all);
 if(collection==='studio')scoped=scoped.filter(website);
 if(collection==='stylekit')scoped=scoped.filter(isStylekit);
 if(collection==='vibeui')scoped=scoped.filter(isVibeui);
 const saved=new Set(Array.isArray(favorites)?favorites.filter(value=>typeof value==='string'):[]);
 const matches=scoped.filter(entry=>{
  const facets=designFacets(entry);
  if(scenario&&scenario!=='all'&&!facets.scenarios.includes(scenario))return false;
  if(type&&type!=='all'&&facets.styleType!==type)return false;
  if(industry&&industry!=='all'&&facets.industry!==industry)return false;
  if(!selectedTags.every(value=>facets.tags.includes(value)))return false;
  if(options.favorites==='1'&&!saved.has(entry.slug))return false;
  if(!query)return true;
  const values=[entry.slug,entry.title,entry.summary,entry.category,entry.collection?.name,entry.studio?.sourceSlug,...(Array.isArray(entry.tags)?entry.tags:[]),facets.industry,...facets.scenarios.flatMap(id=>[id,SCENARIOS.find(item=>item.id===id)?.label]),...facets.tags.flatMap(id=>[id,STYLE_TAGS.find(item=>item.id===id)?.label])];
  return normalized(values.filter(Boolean).join(' ')).includes(query);
 });
 return options.sort==='name'?[...matches].sort((a,b)=>String(a.title||a.slug).localeCompare(String(b.title||b.slug),'zh-CN',{numeric:true,sensitivity:'base'})):matches;
}
