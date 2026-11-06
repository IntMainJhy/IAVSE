import {admin} from './auth.mjs';
import {localRequest,serviceRequest} from './deployment-policy.mjs';
import {db,now,getConfig} from './db.mjs';
import {analytics,today} from './analytics.mjs';
import {emailStatus} from './email-auth.mjs';

export function adminOverview(req){
 admin(req);
 const d=db(),count=(sql,...args)=>d.prepare(sql).get(...args).n,downloads=getConfig('site').desktopDownloads;
 const startToday=new Date(today()+'T00:00:00+08:00').toISOString();
 const weekStart=new Date(new Date(startToday).getTime()-6*86400000).toISOString();
 const monthStart=new Date(new Date(startToday).getTime()-29*86400000).toISOString();
 const traffic=analytics(new URLSearchParams({start:today(),end:today()}));
 const accounts=d.prepare("SELECT status,COUNT(*) count FROM community_users GROUP BY status").all();
 const accountCount=status=>accounts.find(row=>row.status===status)?.count||0;

 return {
  services:{
   environment:'standard',
   community:serviceRequest(req)?getConfig('community').paused?'paused':localRequest(req)?'local':'public':'closed',
   mail:emailStatus(req).mode,
   downloads:{macos:!!downloads?.macos?.url,windows:!!downloads?.windows?.url}
  },
  totals:{
   content:count('SELECT COUNT(*) n FROM content WHERE deleted IS NULL'),
   members:count("SELECT COUNT(*) n FROM community_users WHERE status<>'closed' AND role<>'owner'"),
   spaces:count('SELECT COUNT(*) n FROM spaces'),
   bytes:count('SELECT COALESCE(SUM(size),0) n FROM files')
  },
  audience:{
   users:count("SELECT COUNT(*) n FROM community_users WHERE status<>'closed'"),
   active:accountCount('active'),restricted:accountCount('restricted'),banned:accountCount('banned'),closed:accountCount('closed'),
   joinedToday:count("SELECT COUNT(*) n FROM community_users WHERE role<>'owner' AND status<>'closed' AND created>=?",startToday),
   joinedWeek:count("SELECT COUNT(*) n FROM community_users WHERE role<>'owner' AND status<>'closed' AND created>=?",weekStart),
   joinedMonth:count("SELECT COUNT(*) n FROM community_users WHERE role<>'owner' AND status<>'closed' AND created>=?",monthStart),
   publicSpaces:count("SELECT COUNT(*) n FROM spaces WHERE visibility='public' AND public_release IS NOT NULL"),
   publishedArticles:count("SELECT COUNT(*) n FROM community_posts WHERE visibility='public' AND public_revision IS NOT NULL"),
   publicContent:count("SELECT COUNT(*) n FROM content WHERE deleted IS NULL AND status='published'"),
   trafficToday:traffic.totals,
   trafficAll:d.prepare("SELECT COUNT(*) pv,COUNT(DISTINCT visitor) uv FROM events WHERE kind='view'").get(),
   timezone:'Asia/Shanghai'
  },
  pending:{
   catalog:count("SELECT COUNT(*) n FROM catalog_entries WHERE pending IS NOT NULL"),
   posts:count("SELECT COUNT(*) n FROM community_revisions WHERE status IN ('pending','reviewing')"),
   comments:count("SELECT COUNT(*) n FROM community_comments WHERE status='pending'"),
   spaces:count("SELECT COUNT(*) n FROM space_reviews WHERE status='pending'"),
   reports:count("SELECT COUNT(*) n FROM community_cases WHERE status<>'resolved'")
  },
  recent:d.prepare("SELECT id,type,status,updated,COALESCE(json_extract(COALESCE(draft,published),'$.title'),'') title FROM content WHERE deleted IS NULL AND type IN ('projects','articles','resources') ORDER BY updated DESC,id DESC LIMIT 5").all(),
  updated:now()
 };
}
