import {designCategory,designCollection} from './design-catalog.mjs';
const normalized=value=>String(value??'').normalize('NFKC').toLowerCase();

/** @param {import('./design-types').DesignEntry[]} entries */
export function filterDesignEntries(entries,{q='',category='',collection=''}={}){
 const keyword=normalized(q).trim();
 return entries.filter(entry=>(!category||entry.category===category||designCategory(entry)===category)&&(!collection||designCollection(entry)===collection)&&(!keyword||normalized([
  entry.title,entry.summary,...entry.tags,entry.source.name,entry.source.url,entry.slug,entry.category,designCategory(entry),entry.collection?.name||'',entry.creator?.name||'',entry.referenceSite?.name||'',entry.referenceSite?.url||'',
 ].join(' ')).includes(keyword)));
}
