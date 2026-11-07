import {curatedSkills,skillAiTools,skillCategories,skillCatalogVerifiedAt} from './skill-catalog.mjs';
import {readPublishedSkills} from './design-intake.mjs';

export {normalizeSkillToolNames as normalizePublicSkillTools} from './skill-tool-names.mjs';
import {normalizeSkillToolNames} from './skill-tool-names.mjs';
const recommendation=skill=>Array.isArray(skill.recommendedFor)?skill.recommendedFor.filter(value=>typeof value==='string').join(' · '):String(skill.recommendedFor||skill.recommendation||'');

/** @typedef {Record<string, any> & {tools:Array<{id:string,label:string}>,tags:Array<string>}} PublicSkill */

/** Merge deterministic editorial entries with owner-approved snapshots, never private drafts.
 * @returns {PublicSkill[]}
 */
export function mergePublicSkills(curated,published){
 const entries=curated.map(skill=>({...skill,slug:skill.id,origin:'curated',recommendation:recommendation(skill),featured:skill.featured===true||skill.recommended===true,verifiedAt:skillCatalogVerifiedAt}));
 const slugs=new Set(entries.map(skill=>skill.slug)),ids=new Set(entries.map(skill=>skill.id)),repos=new Set(entries.map(skill=>skill.repo.toLowerCase()));
 for(const skill of published){
  const slug=String(skill.slug||''),repo=String(skill.repo||'').toLowerCase();
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||!repo||slugs.has(slug)||ids.has(skill.id)||repos.has(repo))continue;
  const tools=normalizeSkillToolNames(skill.tools);if(!tools.length)continue;
  entries.push({...skill,name:skill.name||skill.title,slug,origin:'reviewed',tools,recommendation:recommendation(skill),featured:skill.recommended===true||skill.featured===true,verifiedAt:skill.verifiedAt||''});slugs.add(slug);ids.add(skill.id);repos.add(repo);
 }
 return entries;
}
export function readPublicSkills(){return mergePublicSkills(curatedSkills,readPublishedSkills())}
export function findPublicSkill(id,entries=readPublicSkills()){return entries.find(skill=>skill.slug===id||skill.id===id)||null}
/** @param {PublicSkill[]} entries
 * @returns {PublicSkill[]}
 */
export function filterPublicSkills(entries,{category='all',q='',tool='all'}={},translate=text=>text){
 const terms=q.normalize('NFKC').toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return entries.filter(skill=>{
  if(category!=='all'&&skill.category!==category)return false;
  if(tool!=='all'&&!skill.tools.some(item=>item.id===tool))return false;
  const categoryLabel=skillCategories.find(item=>item.id===skill.category)?.label||'';
  const haystack=[skill.name,skill.slug,skill.repo,skill.summary,translate(skill.summary),skill.recommendation,translate(skill.recommendation||''),categoryLabel,translate(categoryLabel),...(skill.tags||[]),...skill.tools.map(item=>item.label)].join(' ').normalize('NFKC').toLocaleLowerCase();
  return terms.every(term=>haystack.includes(term));
 });
}
