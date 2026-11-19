import {creatorSkills} from './creator-skills.mjs';
import {resourceWebsites} from './resource-websites.mjs';

export function skillPick(skill){
 return{id:skill.id,title:skill.name,summary:skill.recommendation||skill.recommendedFor||skill.summary,href:'/skills/'+(skill.slug||skill.id),source:skill.repo,kind:skill.id==='stageshow'?'cursor':skill.id==='brand-identity'?'palette':skill.id==='dimensional-drawing'?'drawing':'layout',emoji:skill.id==='stageshow'?'🎬':skill.id==='brand-identity'?'🎨':skill.id==='dimensional-drawing'?'📐':'🔥'};
}
export function websitePicks(items=resourceWebsites){
 const preferred=['reactbits','gsap','shadcn','mdn'];
 const selected=[...items.filter(item=>item.featured),...preferred.flatMap(id=>items.find(item=>item.id===id)||[])];
 return selected.filter((item,index)=>selected.findIndex(other=>(other.url||other.href)===(item.url||item.href))===index).slice(0,4).map(item=>({id:item.id,title:item.title,summary:item.summary,href:item.url,source:item.authorName||new URL(item.url).hostname,kind:item.id==='gsap'?'motion':item.id==='mdn'?'code':item.id==='reactbits'?'shapes':'layout',emoji:item.id==='gsap'?'⚡':item.id==='mdn'?'📚':item.id==='reactbits'?'🫧':'🧩'}));
}
export const creatorPicks=creatorSkills.map(skillPick);
