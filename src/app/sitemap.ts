import {LEGAL_CONSULTATION_PATH} from '@/lib/legal-consultation.mjs';
import {readPublicSkills} from '@/lib/catalog-public-skills.mjs';
import {readPublishedDesigns} from '@/lib/design-intake.mjs';
import {iavseDesignGuides} from '@/lib/iavse-design-guides.mjs';
import {publicSpaces,publicSpace} from '@/lib/spaces.mjs';
import {guides} from '@/lib/learning.mjs';
import {publicContent} from '@/lib/db.mjs';
export const dynamic='force-dynamic';
export default function sitemap(){
 const base=(process.env.PUBLIC_URL||'http://localhost:3008').replace(/\/$/,''),req=new Request(base),boards=publicSpaces(req);
 const entries=[
  ...boards.flatMap((x:any)=>{const space=publicSpace(req,x.handle);if(space.layout.indexable===false)return[];return[{url:base+'/blog/'+x.handle},...space.content.map((item:any)=>({url:base+'/blog/'+x.handle+'/'+item.type+'/'+encodeURIComponent(item.slug),lastModified:item.updated}))]}),
  ...['','/docs',...guides.map(guide=>'/docs/'+guide.slug),...iavseDesignGuides.map(guide=>'/docs/'+guide.slug),'/docs/connect','/skills',...readPublicSkills().map(skill=>'/skills/'+skill.slug),'/blogs','/about','/career','/projects','/articles','/resources',...readPublishedDesigns().map(design=>'/resources/designs/'+design.slug),LEGAL_CONSULTATION_PATH].map(route=>({url:base+route})),
  ...['projects','articles','resources'].flatMap(type=>publicContent(type).map((item:any)=>({url:base+'/'+type+'/'+encodeURIComponent(item.slug),lastModified:item.updated})))
 ];
 return [...new Map(entries.map(entry=>[entry.url,entry])).values()];
}
