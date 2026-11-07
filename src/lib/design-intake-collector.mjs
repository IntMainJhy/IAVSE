import {randomUUID} from 'node:crypto';
import {Parser} from 'htmlparser2';
import {transaction,recordAudit} from './db.mjs';
import {HttpError,requireValue} from './content.mjs';
import {intakeDb,canonicalSource,existingDiscoverySources,createDiscoveryDraft} from './design-intake.mjs';

// Only these fixed endpoints are fetched. Admin-supplied source links never enter fetch().
export const discoverySources=Object.freeze([
 {id:'awwwards',name:'Awwwards / Web design',kind:'design',format:'rss',url:'https://www.awwwards.com/feed/'},
 {id:'design-systems',name:'GitHub / Design systems',kind:'design',format:'github',url:'https://api.github.com/search/repositories?q=topic%3Adesign-system+stars%3A%3E100+archived%3Afalse&sort=updated&order=desc&per_page=12'},
 {id:'agent-skills',name:'GitHub / Agent skills',kind:'skill',format:'github',url:'https://api.github.com/search/repositories?q=topic%3Aagent-skills+stars%3A%3E30+archived%3Afalse&sort=stars&order=desc&per_page=12'},
 {id:'claude-skills',name:'GitHub / Claude skills',kind:'skill',format:'github',url:'https://api.github.com/search/repositories?q=topic%3Aclaude-skills+stars%3A%3E30+archived%3Afalse&sort=updated&order=desc&per_page=12'}
]);
const maxBytes=750000;
export async function fetchDiscoverySource(source,{fetcher=fetch}={}){
 requireValue(discoverySources.some(item=>item.id===source.id&&item.url===source.url),'采集来源不在白名单中',400);
 const response=await fetcher(source.url,{redirect:'error',signal:AbortSignal.timeout(12000),headers:{Accept:source.format==='rss'?'application/rss+xml, application/xml;q=0.9':'application/vnd.github+json','User-Agent':'IAVSE-ResourceDiscovery/1.0 (+https://github.com/IntMainJhy/IAVSE)'}});
 requireValue(response.ok,`来源响应 HTTP ${response.status}`,502);
 const announced=Number(response.headers.get('content-length')||0);requireValue(announced<=maxBytes,'来源响应超过体积限制',502);
 requireValue(response.body,'来源返回空内容',502);const reader=response.body.getReader(),chunks=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;requireValue(size<=maxBytes,'来源响应超过体积限制',502);chunks.push(value)}}finally{await reader.cancel().catch(()=>{})}
 const content=Buffer.concat(chunks).toString('utf8');return source.format==='rss'?parseFeed(content,source):parseGithub(content);
}
function plain(value,max=900){return String(value||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,max)}
function parseGithub(content){
 let body;try{body=JSON.parse(content)}catch{throw new HttpError(502,'来源返回的 JSON 无效')}
 requireValue(Array.isArray(body.items),'GitHub 响应格式异常',502);
 return body.items.slice(0,12).filter(item=>!item.archived&&/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(item.html_url||'')).map(item=>({title:plain(item.name,140),summary:plain(item.description),source:{name:item.full_name,url:item.html_url},repo:item.full_name,tags:(item.topics||[]).slice(0,8),license:item.license?.spdx_id||'',stars:Number(item.stargazers_count)||0}));
}
function parseFeed(content,source){
 requireValue(/<rss\b/i.test(content),'来源返回的 RSS 格式异常',502);
 const entries=[];let item=null,tag='',buffer='';
 const parser=new Parser({onopentag(name){tag=name;if(name==='item'){item={};}if(item&&['title','link','description'].includes(name))buffer='';},ontext(value){if(item&&['title','link','description'].includes(tag))buffer+=value},onclosetag(name){if(item&&['title','link','description'].includes(name))item[name]=buffer;if(name==='item'&&item){if(item.link&&item.title)entries.push({title:plain(item.title,140),summary:plain(item.description),source:{name:source.name,url:item.link.trim()},tags:['web-design'],category:'product'});item=null;}tag='';}},{xmlMode:true,decodeEntities:true});parser.write(content);parser.end();return entries.slice(0,12);
}
export async function collectDiscovery({trigger='manual',actor=null,fetcher=fetch,clock=()=>new Date()}={}){
 const d=intakeDb(),started=clock().toISOString(),id=randomUUID();
 transaction(()=>{
  // Recover a run whose worker stopped; concurrent tabs/processes share this lock.
  d.prepare("UPDATE design_intake_runs SET status='interrupted',finished=? WHERE status='running' AND started<?").run(started,new Date(clock().getTime()-5*60000).toISOString());
  requireValue(!d.prepare("SELECT id FROM design_intake_runs WHERE status='running'").get(),'采集正在进行，请稍后刷新查看',409);
  const last=d.prepare('SELECT started FROM design_intake_runs ORDER BY started DESC LIMIT 1').get();
  requireValue(!last||clock().getTime()-new Date(last.started).getTime()>=60000,'请稍等一分钟后再采集',429);
  d.prepare("INSERT INTO design_intake_runs(id,trigger,status,started) VALUES(?,?,'running',?)").run(id,trigger,started);
 });
 const results=[],known=existingDiscoverySources();
 try{
  const {curatedSkills}=await import('./skill-catalog.mjs');for(const skill of curatedSkills){for(const url of [skill.sourceUrl,skill.repo?'https://github.com/'+skill.repo:'']){try{known.add(canonicalSource(url))}catch{}}}
  for(const source of discoverySources){
   let found=0,added=0,duplicates=0;
   try{
    const candidates=await fetchDiscoverySource(source,{fetcher});found=candidates.length;
    for(const candidate of candidates){
     let canonical;try{canonical=canonicalSource(candidate.source.url)}catch{continue}
     if(known.has(canonical)){duplicates++;continue}
     try{createDiscoveryDraft({kind:source.kind,draft:{...candidate,category:candidate.category||(source.kind==='skill'?'engineering':'product'),source:{...candidate.source,url:canonical}}},{collector:source.id});known.add(canonical);added++}catch(error){if(error.status===409){duplicates++;known.add(canonical)}else throw error}
    }
    results.push({source:source.name,found,added,duplicates,status:'ok'});
   }catch(error){results.push({source:source.name,found,added,duplicates,status:'error',error:error instanceof HttpError?error.message:error?.name==='TimeoutError'?'请求超时（12 秒）':'来源暂时不可用，已保留其他来源的结果'})}
   d.prepare('UPDATE design_intake_runs SET results=? WHERE id=?').run(JSON.stringify(results),id);
  }
  const finished=clock().toISOString(),status=results.every(item=>item.status==='error')?'failed':results.some(item=>item.status==='error')?'partial':'complete';
  d.prepare('UPDATE design_intake_runs SET status=?,finished=?,results=? WHERE id=?').run(status,finished,JSON.stringify(results),id);
  // A fixed retention limit bounds logs, not the user's review queue.
  d.prepare('DELETE FROM design_intake_runs WHERE id NOT IN (SELECT id FROM design_intake_runs ORDER BY started DESC LIMIT 90)').run();
  if(actor)recordAudit(actor,'site_discovery_collect',id,{status,added:results.reduce((sum,item)=>sum+item.added,0)});
  return {id,status,started,finished,results,added:results.reduce((sum,item)=>sum+item.added,0)};
 }catch(error){d.prepare("UPDATE design_intake_runs SET status='failed',finished=?,results=? WHERE id=?").run(clock().toISOString(),JSON.stringify(results),id);throw error}
}
