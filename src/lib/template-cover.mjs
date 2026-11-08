/** Small shelf covers use a prebuilt image; expanded image previews keep the original. */
export function templateCoverSrcSet(src,large=false){
 if(large||!/^\/template-covers\/[a-z0-9-]+\.webp\?v=[a-f0-9]{16}$/.test(src||''))return undefined;
 return src.replace('/template-covers/','/template-covers/thumbs/')+' 1x, '+src+' 2x';
}
