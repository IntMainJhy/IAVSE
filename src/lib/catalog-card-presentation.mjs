/** Local identities for directory entries; never fetch third-party favicons. */
export function catalogCardIdentity(item){
 let hostname='';try{hostname=new URL(item.url).hostname.replace(/^www\./,'');}catch{}
 const words=String(item.title||'').trim().split(/\s+/).filter(Boolean);
 const mark=words.length>1?words.slice(0,2).map(word=>Array.from(word)[0]).join(''):Array.from(words[0]||'I').slice(0,2).join('');
 return{hostname,external:!!hostname,mark};
}
