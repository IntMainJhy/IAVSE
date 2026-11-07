/** One identity per upstream definition; different skills in one repository remain distinct. */
export function skillDefinitionKey(skill){
 const repo=String(skill.repo||'').trim().toLowerCase();
 let path=String(skill.skillFile||skill.path||skill.skillPath||'');
 if(!path){try{const url=new URL(skill.sourceUrl||skill.source?.url);const parts=url.pathname.split('/').filter(Boolean);if(url.hostname==='github.com'&&['blob','tree'].includes(parts[2]))path=parts.slice(4).join('/')}catch{}}
 path=path.replace(/^\/+|\/+$/g,'').replace(/(^|\/)SKILL\.md$/i,'');
 return repo&&(path||skill.skillFile||skill.sourceUrl?.endsWith('/SKILL.md'))?repo+'/'+path:repo+'/@'+String(skill.upstreamSkillName||skill.id||skill.slug).toLowerCase();
}
/** @returns {{name:string,url:string}[]} */
export function skillCollections(skill){return skill.collections?.length?skill.collections:skill.collection?[skill.collection]:[{name:'IAVSE',url:'https://github.com/IntMainJhy/IAVSE'}]}
export function skillCollectionIds(skill){return skillCollections(skill).map(source=>source.name.toLowerCase()).map(name=>name.includes('vibeui')?'vibeui':name.includes('stylekit')?'stylekit':'iavse')}
export function skillCollectionFilter(query){return ['iavse','vibeui','stylekit'].includes(query.collection)?query.collection:'all'}
/** @template T @param {T[]} entries @param {number} [page] */
export function skillPage(entries,page=1){const pages=Math.max(1,Math.ceil(entries.length/36)),current=Math.max(1,Math.min(pages,Math.floor(Number(page))||1));return{items:entries.slice((current-1)*36,current*36),page:current,pages,total:entries.length}}
export function mergeImportedSkills(base,imports){
 const entries=base.map(entry=>({...entry,collections:skillCollections(entry)})),byDefinition=new Map(entries.map(entry=>[skillDefinitionKey(entry),entry]));
 const ids=new Set(entries.flatMap(entry=>[entry.id,entry.slug]));
 for(const raw of imports){
  const existing=byDefinition.get(skillDefinitionKey(raw));
  if(existing){
   existing.collections=[...existing.collections,...skillCollections(raw).filter(source=>!existing.collections.some(known=>known.name===source.name))];
   existing.collectionEntries=[...(existing.collectionEntries||[]),...(raw.collectionEntries||[])];
   existing.collectionAudit=raw.provenance;
   for(const field of ['sourceUrl','sourceStatus','commit','license','licenseUrl','licenseStatus','licenseScope','licenseNote','provenance'])if(raw[field]!==undefined)existing[field]=raw[field];
   continue;
  }
  const slug=String(raw.slug||raw.id||'');if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||ids.has(slug)||ids.has(raw.id))throw new Error('Invalid or duplicate imported Skill slug: '+slug);
  const entry={...raw,id:raw.id||slug,slug,origin:'imported',featured:false,recommendation:'',tools:raw.tools||[],tags:raw.tags||[],collections:skillCollections(raw)};
  entries.push(entry);byDefinition.set(skillDefinitionKey(entry),entry);ids.add(entry.id);ids.add(slug);
 }
 return entries;
}
