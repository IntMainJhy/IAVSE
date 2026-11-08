import seed from './design-taxonomy-seed.json' with {type:'json'};
import catalogTaxonomy from './catalog-taxonomy.json' with {type:'json'};

/** StyleKit's explicitly curated facets, combined with VibeUI's industry labels. */
export const SCENARIOS=seed.scenarios;
export const STYLE_TAGS=seed.styleTags;
export const INDUSTRIES=seed.industries;
export const TAXONOMY_PROVENANCE=seed.provenance;
export const REFERENCE_INDUSTRIES=catalogTaxonomy.industries;
export const VISUAL_STYLES=catalogTaxonomy.visualStyles;
export const CATALOG_TAXONOMY_PROVENANCE=catalogTaxonomy.provenance;
const scenarioIds=new Set(SCENARIOS.map(item=>item.id)),tagIds=new Set(STYLE_TAGS.map(item=>item.id)),industryIds=new Set(INDUSTRIES.map(item=>item.id));
const referenceIndustryIds=new Set(REFERENCE_INDUSTRIES.map(item=>item.id)),visualStyleIds=new Set(VISUAL_STYLES.map(item=>item.id));
export const TEMPLATE_KINDS=['project','page','design-system'];
const collectionIds=new Set(['all',...TEMPLATE_KINDS]);
const text=value=>typeof value==='string'?value.trim():'';
const normalized=value=>String(value??'').normalize('NFKC').toLocaleLowerCase();
const sourceStyle=entry=>{
 const raw=text(entry?.studio?.sourceSlug)||text(entry?.slug);
 const slug=raw.startsWith('stylekit-')?raw.slice(9):raw;
 return seed.styles[slug];
};
const ownScenarios={
 'iavse-optical-glass':['marketing','creative'],'iavse-spatial-gallery':['portfolio','blog'],
 'iavse-resource-story':['docs'],'iavse-bento-control':['dashboard','admin'],
};
const ownIndustries={'iavse-optical-glass':'落地页','iavse-spatial-gallery':'设计生产','iavse-resource-story':'通用','iavse-bento-control':'分析仪表'};
const knownValues=(value,allowed)=>Array.isArray(value)?[...new Set(value.filter(item=>typeof item==='string'&&allowed.has(item)))]:undefined;

/** Unknown source memberships stay empty; descriptions are never keyword-classified. */
export function designFacets(entry={}){
 if(entry?.template){
  // A token/specification preview is not a deployable documentation website.
  const scenarios=entry.template.kind==='design-system'?[]:knownValues(entry.template.scenarios,scenarioIds)??[];
  return {scenarios,industries:knownValues(entry.template.industries,referenceIndustryIds)??[],visualStyles:knownValues(entry.template.visualStyles,visualStyleIds)??[],styleType:'',tags:knownValues(entry.tags,tagIds)??[],industry:entry.category||''};
 }
 const style=sourceStyle(entry),explicit=entry?.studio||{};
 const scenarios=style?.scenarios??knownValues(explicit.scenarios,scenarioIds)??ownScenarios[entry.slug]??[];
 const tags=style?.tags??knownValues(explicit.tags,tagIds)??(Array.isArray(entry.tags)&&entry.tags.includes('品牌参考')?['brand-inspired']:[]);
 const styleType=style?.styleType||(['visual','layout'].includes(explicit.styleType)?explicit.styleType:'visual');
 const industry=industryIds.has(entry.category)?entry.category:ownIndustries[entry.slug]||'通用';
 return {scenarios:[...scenarios],industries:[],visualStyles:[],styleType,tags:[...tags],industry};
}

/** Only actual template records enter this directory; source discovery rows are not templates. */
export function catalogPresentationEntries(entries=[]){
 const seen=new Set();
 return (Array.isArray(entries)?entries:[]).filter(entry=>{
  if(!entry||typeof entry!=='object'||!TEMPLATE_KINDS.includes(entry.template?.kind))return false;
  const slug=text(entry.slug);if(!slug||seen.has(slug))return false;
  seen.add(slug);return true;
 });
}

/** Template category, explicit scenarios, text and favorites combine with AND. */
export function filterCatalog(entries=[],filters={},favorites=[]){
 const options=filters&&typeof filters==='object'?filters:{};
 const collection=text(options.collection)||'all',scenario=text(options.scenario),industry=text(options.industry),visual=text(options.visual),query=normalized(text(options.q));
 if(!collectionIds.has(collection)||(scenario&&scenario!=='all'&&!scenarioIds.has(scenario)))return [];
 if((industry&&!referenceIndustryIds.has(industry))||(visual&&!visualStyleIds.has(visual)))return [];
 const saved=new Set(Array.isArray(favorites)?favorites.filter(value=>typeof value==='string'):[]);
 const matches=catalogPresentationEntries(entries).filter(entry=>{
  const facets=designFacets(entry);
  if(collection!=='all'&&entry.template.kind!==collection)return false;
  if(scenario&&scenario!=='all'&&!facets.scenarios.includes(scenario))return false;
  if(industry&&!facets.industries.includes(industry))return false;
  if(visual&&!facets.visualStyles.includes(visual))return false;
  if(options.favorites==='1'&&!saved.has(entry.slug))return false;
  if(!query)return true;
  const values=[entry.slug,entry.title,entry.summary,entry.category,entry.source?.name,entry.creator?.name,entry.template.author,entry.template.kind,entry.license?.name,...(Array.isArray(entry.tags)?entry.tags:[]),...(Array.isArray(entry.template.stack)?entry.template.stack:[]),...(Array.isArray(entry.template.features)?entry.template.features:[]),...facets.scenarios.flatMap(id=>[id,SCENARIOS.find(item=>item.id===id)?.label]),...facets.industries.flatMap(id=>[id,REFERENCE_INDUSTRIES.find(item=>item.id===id)?.label]),...facets.visualStyles.flatMap(id=>[id,VISUAL_STYLES.find(item=>item.id===id)?.label])];
  return normalized(values.filter(Boolean).join(' ')).includes(query);
 });
 return options.sort==='name'?[...matches].sort((a,b)=>String(a.title||a.slug).localeCompare(String(b.title||b.slug),'zh-CN',{numeric:true,sensitivity:'base'})):matches;
}
