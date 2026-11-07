const normalized=value=>String(value??'').normalize('NFKC').toLowerCase();

/** @param {import('./design-types').DesignEntry[]} entries */
export function filterDesignEntries(entries,{q='',category=''}={}){
 const keyword=normalized(q).trim();
 return entries.filter(entry=>(!category||entry.category===category)&&(!keyword||normalized([
  entry.title,entry.summary,...entry.tags,entry.source.name,entry.source.url,entry.slug,entry.category,
 ].join(' ')).includes(keyword)));
}
