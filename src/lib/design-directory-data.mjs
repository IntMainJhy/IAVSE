/** A browser directory gets display/search metadata, never whole specs or prompts. */
export function designDirectoryEntry(entry){
 const {id,slug,title,summary,category,tags,image,external,previewUrl,previewVariants,websiteUrl,source,preview,palette,creator,previewPolicy,license}=entry;
 const template=entry.template&&Object.fromEntries(['kind','stack','features','repository','scenarios','industries','visualStyles','author','upstreamDemoUrl','previewNote'].filter(key=>entry.template[key]!==undefined).map(key=>[key,entry.template[key]]));
 return{id,slug,title,summary,category,tags,image,external,previewUrl,previewVariants,websiteUrl,source,preview,palette,creator,previewPolicy,license,template};
}
