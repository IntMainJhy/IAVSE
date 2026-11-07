import designSeeds from './design-library-seed.json' with {type:'json'};
import vibeuiDesigns from './design-imports/vibeui.json' with {type:'json'};
import stylekitDesigns from './design-imports/stylekit.json' with {type:'json'};
import {importedDesign} from './design-catalog.mjs';
import {randomUUID} from 'node:crypto';
import {isIP} from 'node:net';
import {db,transaction,recordAudit} from './db.mjs';
import {HttpError,requireValue} from './content.mjs';
import {curatedSkills,skillCategories} from './skill-catalog.mjs';
import {normalizeSkillToolNames} from './skill-tool-names.mjs';

const schemas=new WeakSet();
const configKey='resourceDiscovery';
const stamp=()=>new Date().toISOString();
const previewLayouts=['optical','spatial','bento','editorial','workspace','product','developer','portfolio','brutalist'];
const previewAliases={dashboard:'workspace',cinematic:'spatial',minimal:'product'};
const emptySettings={enabled:true,hour:9,timeZone:'Asia/Shanghai',lastScheduledDate:'',heartbeat:''};
function sourceKeyOrNull(value){try{return canonicalSource(value)}catch{return null}}
const catalogDesigns=[...designSeeds.filter(entry=>entry.featured),...vibeuiDesigns.map(importedDesign),...stylekitDesigns.map(importedDesign),...designSeeds.filter(entry=>!entry.featured)];
function seedDesigns(){return catalogDesigns}
export function intakeDb(){
 const d=db();if(schemas.has(d))return d;
 d.exec(`CREATE TABLE IF NOT EXISTS design_intake_entries(
 id TEXT PRIMARY KEY,kind TEXT NOT NULL CHECK(kind IN ('design','skill')),source_key TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','offline')),
 visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','public')),
 version INTEGER NOT NULL DEFAULT 1,draft TEXT NOT NULL,published TEXT,collector TEXT NOT NULL DEFAULT '',
 created TEXT NOT NULL,updated TEXT NOT NULL,reviewed TEXT,reviewer TEXT,reason TEXT NOT NULL DEFAULT '');
 CREATE INDEX IF NOT EXISTS design_intake_queue ON design_intake_entries(status,created);
 CREATE TABLE IF NOT EXISTS design_intake_source_keys(source_key TEXT PRIMARY KEY,entry_id TEXT NOT NULL REFERENCES design_intake_entries(id) ON DELETE CASCADE);
 INSERT OR IGNORE INTO design_intake_source_keys(source_key,entry_id) SELECT source_key,id FROM design_intake_entries;
 INSERT OR IGNORE INTO design_intake_source_keys(source_key,entry_id) SELECT json_extract(published,'$.source.url'),id FROM design_intake_entries WHERE published IS NOT NULL AND json_valid(published) AND json_type(published,'$.source.url')='text';
 CREATE TABLE IF NOT EXISTS design_intake_runs(id TEXT PRIMARY KEY,trigger TEXT NOT NULL,status TEXT NOT NULL,
 started TEXT NOT NULL,finished TEXT,results TEXT NOT NULL DEFAULT '[]');`);
 // A caller may already be inside a transaction. Cache only durable schema creation.
 if(!d.isTransaction)schemas.add(d);return d;
}
const parse=value=>{try{return JSON.parse(value||'{}')}catch{return {}}};
export function discoverySettings(){const value=parse(intakeDb().prepare('SELECT value FROM config WHERE key=?').get(configKey)?.value);return {...emptySettings,...value}}
export function updateDiscoverySettings(changes){const value={...discoverySettings(),...changes};intakeDb().prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(configKey,JSON.stringify(value));return value}

// Source links are never fetched by the server. Fetching is restricted separately to fixed feed URLs.
export function canonicalSource(value){
 requireValue(typeof value==='string'&&value.length<=2048&&!/[\\\x00-\x20\x7f]/.test(value),'来源链接格式无效');
 let url;try{url=new URL(value)}catch{throw new HttpError(400,'来源链接格式无效')}
 const host=url.hostname.toLowerCase();
 requireValue(url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&host.includes('.')&&!isIP(host)&&!host.startsWith('[')&&!/(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host),'请填写公开网站的 HTTPS 链接');
 url.hash='';for(const key of [...url.searchParams.keys()])if(/^(?:utm_|fbclid$|gclid$)/i.test(key))url.searchParams.delete(key);
 url.searchParams.sort();url.pathname=url.pathname.replace(/\/+$/,'')||'/';if(host==='github.com')url.pathname=url.pathname.toLowerCase();
 return url.href;
}
function text(value,max,fallback=''){requireValue(value===undefined||typeof value==='string','文本格式无效');return (value??fallback).trim().slice(0,max)}
function list(value,max=16){return Array.isArray(value)?[...new Set(value.map(v=>text(v,60)).filter(Boolean))].slice(0,max):[]}
const hex=value=>/^#[\da-f]{6}$/i.test(value||'');
export function normalizeDraft(input,kind,id){
 requireValue(input&&typeof input==='object'&&!Array.isArray(input),'内容格式无效');
 const source={name:text(input.source?.name,120),url:canonicalSource(input.source?.url)};
 const title=text(input.title||input.name,140);requireValue(title.length>=2,'请填写标题');
 let slug=text(input.slug,100)||`${kind}-${id.slice(0,12)}`;
 requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),'标识仅支持小写英文、数字和连字符');
 const thumbnail=text(input.thumbnail||input.image,2048);if(thumbnail)requireValue(/^\/(?:design-previews|media\/designs)\/[a-zA-Z0-9/_-]+\.(?:webp|png|jpg|svg)$/.test(thumbnail),'缩略图请使用站内 /media/designs/ 或 /design-previews/ 下的图片');
 const preview=input.preview||{},palette=list(input.palette,8).filter(hex);
 const base={id,slug,title,summary:text(input.summary,900),category:text(input.category,60,kind==='design'?'product':'engineering'),tags:list(input.tags),source,palette,thumbnail,image:thumbnail,
  typography:text(input.typography,2000),layout:text(input.layout,3000),motion:text(input.motion,3000),prompt:text(input.prompt,20000),specification:text(input.specification,30000),
  preview:{theme:preview.theme==='dark'?'dark':'light',layout:previewLayouts.includes(preview.layout)?preview.layout:previewAliases[preview.layout]||'editorial',accent:hex(preview.accent)?preview.accent:'#0071e3'},
  featured:input.featured===true};
 if(kind==='skill'){
  const repo=text(input.repo,160);requireValue(!repo||/^[\w.-]+\/[\w.-]+$/.test(repo),'仓库格式应为 owner/repo');
  const installCommand=text(input.installCommand,1000);requireValue(!/[\r\n]/.test(installCommand),'安装命令只允许一行文本');
  return {...base,name:title,repo,installCommand,installUrl:input.installUrl?canonicalSource(input.installUrl):source.url,sourceUrl:source.url,license:text(input.license,100),licenseUrl:input.licenseUrl?canonicalSource(input.licenseUrl):'',tools:normalizeSkillToolNames(list(input.tools,8)).map(tool=>tool.id),recommended:input.recommended===true,recommendation:text(input.recommendation,600)};
 }
 return base;
}
function publicationReady(draft,kind){
 requireValue(draft.source.name&&draft.summary.length>=30,'发布前请完善来源名称及介绍（至少 30 字）');
 if(kind==='design'){
  requireValue(draft.prompt.length>=120&&draft.specification.length>=180,'发布前请填写可复用提示词（至少 120 字）和设计规范（至少 180 字）');
  requireValue(draft.palette.length>=3&&draft.typography.length>=15&&draft.layout.length>=30&&draft.motion.length>=15,'发布前请完善配色、字体、布局和动效规范');
 }else {requireValue(skillCategories.some(category=>category.id===draft.category),'请选择目录支持的 Skill 分类');requireValue(draft.repo&&draft.installCommand&&draft.license&&draft.tools.length&&draft.recommendation.length>=20,'发布前请补充仓库、安装命令、许可、支持工具及推荐说明（至少 20 字）');}
}
const dto=row=>({...row,draft:parse(row.draft),published:row.published?parse(row.published):null});
export function readPublishedDesigns(){
 const seeds=seedDesigns(),items=intakeDb().prepare("SELECT published FROM design_intake_entries WHERE kind='design' AND visibility='public' AND published IS NOT NULL ORDER BY reviewed DESC").all().map(row=>parse(row.published));
 const seen=new Set(seeds.map(item=>item.slug));return [...seeds,...items.filter(item=>!seen.has(item.slug))];
}
export function readPublishedSkills(){return intakeDb().prepare("SELECT published FROM design_intake_entries WHERE kind='skill' AND visibility='public' AND published IS NOT NULL ORDER BY reviewed DESC").all().map(row=>parse(row.published))}
export function discoveryQueue(params=new URLSearchParams()){
 const d=intakeDb(),status=params.get('status')||'pending',kind=params.get('kind')||'all',q=(params.get('q')||'').slice(0,100),requestedPage=Math.max(1,Math.min(10000,Math.floor(Number(params.get('page')))||1));
 requireValue(['all','pending','approved','rejected','offline'].includes(status)&&['all','design','skill'].includes(kind),'筛选条件无效');
 const where=['(?=\'all\' OR status=?)','(?=\'all\' OR kind=?)',"(?='' OR json_extract(draft,'$.title') LIKE ? ESCAPE '\\' OR json_extract(draft,'$.source.name') LIKE ? ESCAPE '\\')"].join(' AND '),query='%'+q.replace(/[\\%_]/g,'\\$&')+'%',args=[status,status,kind,kind,q,query,query];
 const total=d.prepare('SELECT COUNT(*) n FROM design_intake_entries WHERE '+where).get(...args).n,pages=Math.max(1,Math.ceil(total/24)),page=Math.min(requestedPage,pages);
 return {items:d.prepare('SELECT * FROM design_intake_entries WHERE '+where+' ORDER BY created DESC,id DESC LIMIT 24 OFFSET ?').all(...args,(page-1)*24).map(dto),total,page,pages,counts:d.prepare('SELECT status,COUNT(*) count FROM design_intake_entries GROUP BY status').all(),runs:d.prepare('SELECT * FROM design_intake_runs ORDER BY started DESC LIMIT 10').all().map(row=>({...row,results:parse(row.results)})),settings:discoverySettings()};
}
export function existingDiscoverySources(){const d=intakeDb();return new Set([...d.prepare('SELECT source_key FROM design_intake_source_keys UNION SELECT source_key FROM design_intake_entries').all().map(row=>row.source_key),...seedDesigns().flatMap(item=>{try{return [canonicalSource(item.source.url)]}catch{return []}})])}
export function createDiscoveryDraft(input,{collector='manual',actor=null}={}){
 intakeDb();
 const id=randomUUID(),kind=input.kind;requireValue(['design','skill'].includes(kind),'资源类型无效');const draft=normalizeDraft(input.draft,kind,id),key=canonicalSource(draft.source.url);
 return transaction(()=>{
  requireValue(!existingDiscoverySources().has(key),'这个来源已在资源库或审核队列中',409);const at=stamp();
  intakeDb().prepare('INSERT INTO design_intake_entries(id,kind,source_key,draft,collector,created,updated) VALUES(?,?,?,?,?,?,?)').run(id,kind,key,JSON.stringify(draft),collector,at,at);
  intakeDb().prepare('INSERT INTO design_intake_source_keys(source_key,entry_id) VALUES(?,?)').run(key,id);
  if(actor)recordAudit(actor,'site_discovery_create',id,{kind,source:key});return dto(intakeDb().prepare('SELECT * FROM design_intake_entries WHERE id=?').get(id));
 });
}
export async function discoveryAction(actor,input){
 requireValue(actor?.role==='owner','只有站点所有者可以管理资源采集',403);
 intakeDb();
 if(input.action==='collect'){const {collectDiscovery}=await import('./design-intake-collector.mjs');return collectDiscovery({trigger:'manual',actor})}
 if(input.action==='settings'){requireValue(typeof input.enabled==='boolean','自动采集设置无效');return transaction(()=>{const settings=updateDiscoverySettings({enabled:input.enabled});recordAudit(actor,'site_discovery_settings',configKey,{enabled:input.enabled});return settings})}
 if(input.action==='create')return createDiscoveryDraft(input,{actor});
 requireValue(['save','approve','reject','offline'].includes(input.action),'操作无效');
 return transaction(()=>{
  const d=intakeDb(),row=d.prepare('SELECT * FROM design_intake_entries WHERE id=?').get(String(input.id||''));requireValue(row,'待审核资源不存在',404);
  requireValue(Number.isInteger(input.version)&&row.version===input.version,'内容已被其他窗口修改，请刷新后重试',409);
  const at=stamp(),reason=text(input.reason,1000);let draft=parse(row.draft),published=row.published,visibility=row.visibility,status=row.status;
  if(input.action==='save'){
   draft=normalizeDraft(input.draft,row.kind,row.id);status='pending';
   const key=canonicalSource(draft.source.url);requireValue(!seedDesigns().some(entry=>sourceKeyOrNull(entry.source?.url)===key),'这个来源已在精选设计中',409);
   requireValue(!d.prepare('SELECT entry_id FROM design_intake_source_keys WHERE source_key=? AND entry_id<>?').get(key,row.id),'这个来源已在审核队列中',409);
   d.prepare('INSERT OR IGNORE INTO design_intake_source_keys(source_key,entry_id) VALUES(?,?)').run(key,row.id);
  }else if(input.action==='approve'){
   requireValue(row.status==='pending','请先保存为待审核版本',409);requireValue(input.verified===true&&reason.length>=5,'请核对来源、许可及内容后填写审核说明');publicationReady(draft,row.kind);
   const collision=readPublishedDesigns().some(item=>item.slug===draft.slug&&item.id!==row.id);requireValue(row.kind!=='design'||!collision,'公开资源中已有相同标识',409);
   if(row.kind==='skill'){const duplicate=curatedSkills.some(item=>item.id===draft.slug||item.repo.toLowerCase()===draft.repo.toLowerCase())||readPublishedSkills().some(item=>item.id!==row.id&&(item.slug===draft.slug||item.repo.toLowerCase()===draft.repo.toLowerCase()));requireValue(!duplicate,'公开 Skill 目录已收录相同仓库或地址标识',409)}
   published=JSON.stringify({...draft,verifiedAt:at.slice(0,10)});visibility='public';status='approved';
  }else if(input.action==='reject'){requireValue(row.status==='pending','只有待审核版本可以作出审核决定',409);requireValue(reason.length>=5,'请填写不收录原因（至少 5 字）');status='rejected';}
  else {requireValue(row.published,'该资源还未公开',409);visibility='private';status='offline';}
  d.prepare('UPDATE design_intake_entries SET source_key=?,draft=?,published=?,visibility=?,status=?,version=version+1,updated=?,reviewed=?,reviewer=?,reason=? WHERE id=?').run(canonicalSource(draft.source.url),JSON.stringify(draft),published,visibility,status,at,input.action==='save'?row.reviewed:at,input.action==='save'?row.reviewer:actor.id,reason,row.id);
  recordAudit(actor,'site_discovery_'+input.action,row.id,{kind:row.kind,version:row.version+1,visibility,status,reason});return dto(d.prepare('SELECT * FROM design_intake_entries WHERE id=?').get(row.id));
 });
}

export function claimScheduledDiscovery(at=new Date()){
 intakeDb();
 return transaction(()=>{const settings=discoverySettings(),parts=Object.fromEntries(new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(at).map(p=>[p.type,p.value])),date=`${parts.year}-${parts.month}-${parts.day}`;
  updateDiscoverySettings({heartbeat:at.toISOString()});if(!settings.enabled||Number(parts.hour)<settings.hour||settings.lastScheduledDate===date)return false;
  updateDiscoverySettings({lastScheduledDate:date});return true;
 });
}
