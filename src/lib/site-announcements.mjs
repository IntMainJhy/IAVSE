import {db} from './db.mjs';
import {siteAnnouncementsData} from './content.mjs';

export const defaultSiteAnnouncements={enabled:true,items:[{title:'从资源目录开始，发现设计、工具与创作指南。',url:'/resources'}]};

/** Only schema-owned strings reach the public endpoint; drafts stay owner-only. */
export function readSiteAnnouncements({publicOnly=false}={}){
 const row=db().prepare("SELECT value FROM config WHERE key='announcements'").get();
 let value;
 try{value=siteAnnouncementsData(row?JSON.parse(row.value):defaultSiteAnnouncements)}catch{value={enabled:false,items:[]}}
 if(value.items.length===1&&value.items[0].title==='网站更新与公告将在这里发布。'&&!value.items[0].url)value={...value,items:defaultSiteAnnouncements.items};
 return publicOnly&&!value.enabled?{enabled:false,items:[]}:value;
}
