import {createHash} from 'node:crypto';
import templates from './template-library.json' with {type:'json'};
import {intakeDb,readPublishedDesigns} from './design-intake.mjs';
import {designDirectoryEntry} from './design-directory-data.mjs';
import {createCatalogIndex,filterCatalog} from './design-taxonomy.mjs';
import {readCatalogFilters,catalogQuery,parseCatalogFavorites} from './design-catalog-state.mjs';
import {requireValue} from './content.mjs';

export const DESIGN_BATCH_SIZE=24;
const digest=value=>createHash('sha256').update(value).digest('hex').slice(0,24);
const seedRevision=digest(JSON.stringify(templates)),snapshots=new WeakMap();

/** Internal immutable search snapshot. Only the bounded query result crosses RSC/API. */
export function buildDesignCatalogSnapshot(entries,revision){
 const summaries=entries.map(designDirectoryEntry),index=createCatalogIndex(summaries);
 return{entries:summaries,index,slugs:new Set(index.rows.map(row=>row.entry.slug)),revision,facets:{counts:index.counts,scenarios:Object.fromEntries(index.scenarios),industries:Object.fromEntries(index.industries),visualStyles:Object.fromEntries(index.visualStyles)}};
}

/** Read the revision every request. Triggers invalidate edits, withdrawals and deletes
 * across workers. A deferred read transaction keeps revision and rows consistent.
 * An uncommitted caller never populates or reuses the durable snapshot cache. */
export function publishedDesignCatalogSnapshot(){
 const db=intakeDb(),outer=db.isTransaction;
 if(!outer)db.exec('BEGIN');
 let snapshot;
 try{
  const revision=seedRevision+'.'+db.prepare('SELECT CAST(version AS TEXT) version FROM design_catalog_revision WHERE id=1').get().version;
  const cached=outer?null:snapshots.get(db);
  snapshot=cached?.revision===revision?cached:buildDesignCatalogSnapshot(readPublishedDesigns({summary:true}),revision);
  if(!outer)db.exec('COMMIT');
 }catch(error){if(!outer&&db.isTransaction)db.exec('ROLLBACK');throw error;}
 if(!outer)snapshots.set(db,snapshot);
 return snapshot;
}

/** Same filters for SSR and subsequent batches; cursors bind to query and publication
 * revision. Favorite IDs stay in a capped JSON body rather than in shareable URLs. */
export function queryDesignCatalog(input={},snapshot=publishedDesignCatalogSnapshot()){
 requireValue(input&&typeof input==='object'&&!Array.isArray(input),'目录查询格式无效');
 requireValue(input.filters===undefined||input.filters&&typeof input.filters==='object'&&!Array.isArray(input.filters),'筛选条件格式无效');
 const values=Object.entries(input.filters||{}).filter(([,v])=>typeof v==='string');
 requireValue(values.every(([,value])=>value.length<=120),'筛选条件过长');
 const filters=readCatalogFilters(new URLSearchParams(values));
 requireValue(input.favorites===undefined||Array.isArray(input.favorites)&&input.favorites.length<=1000,'收藏查询最多支持 1000 项');
 const favorites=parseCatalogFavorites(input.favorites||[]),validFavorites=favorites.filter(slug=>snapshot.slugs.has(slug)),key=digest(catalogQuery(filters).toString()+(filters.favorites==='1'?'|'+[...favorites].sort().join(','):''));
 let offset=0;
 if(input.cursor){
  requireValue(typeof input.cursor==='string'&&input.cursor.length<=512&&/^[A-Za-z0-9_-]+$/.test(input.cursor),'续读位置无效');
  let value;try{value=JSON.parse(Buffer.from(input.cursor,'base64url').toString('utf8'))}catch{}
  requireValue(Array.isArray(value)&&value.length===3&&typeof value[0]==='string'&&value[1]===key&&Number.isSafeInteger(value[2])&&value[2]>0,'续读位置无效');
  requireValue(value[0]===snapshot.revision,'目录已更新，请重新加载。',409);offset=value[2];
 }
 const matches=filterCatalog(snapshot.entries,filters,favorites,snapshot.index);
 requireValue(offset<=matches.length,'续读位置无效');
 const items=matches.slice(offset,offset+DESIGN_BATCH_SIZE),next=offset+items.length;
 const favoriteCount=validFavorites.length?filterCatalog(snapshot.entries,{collection:filters.collection,favorites:'1'},validFavorites,snapshot.index).length:0;
 return{filters,revision:snapshot.revision,items,total:matches.length,favoriteCount,validFavorites,facets:snapshot.facets,nextCursor:next<matches.length?Buffer.from(JSON.stringify([snapshot.revision,key,next])).toString('base64url'):null};
}
