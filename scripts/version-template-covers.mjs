import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'src/lib/template-library.json');
const entries=JSON.parse(await fs.readFile(file,'utf8')),records=[],thumbnails=[];
const thumbnailDir=path.join(root,'public/template-covers/thumbs');
await fs.mkdir(thumbnailDir,{recursive:true});
for(const entry of entries){
 if(!entry.image)continue;
 const pathname=entry.image.split('?')[0];
 if(!/^\/template-covers\/[a-z0-9-]+\.webp$/.test(pathname))throw new Error('Unreviewed template cover path: '+pathname);
 const content=await fs.readFile(path.join(root,'public',pathname)),hash=crypto.createHash('sha256').update(content).digest('hex');
 entry.image=pathname+'?v='+hash.slice(0,16);
 const thumbnail=await sharp(content).resize({width:480,withoutEnlargement:true}).webp({quality:74}).toBuffer();
 const thumbnailPath='/template-covers/thumbs/'+path.basename(pathname);await fs.writeFile(path.join(root,'public',thumbnailPath),thumbnail);
 thumbnails.push({path:thumbnailPath,sha256:crypto.createHash('sha256').update(thumbnail).digest('hex'),source:pathname,sourceSha256:hash,method:'Resize original reviewed cover to at most 480px; WebP quality 74. Rights and attribution follow the original cover source manifest.'});
 if(entry.template.kind!=='project')records.push({path:pathname,sha256:hash,creator:entry.creator.name,source:entry.source.url,captureSource:entry.previewUrl,repository:entry.template.repository,license:entry.license.name,licenseUrl:entry.license.url,method:'Browser screenshot of the locally licensed source preview; no generated replacement imagery.',capturedOn:'2026-11-08'});
}
await fs.writeFile(file,JSON.stringify(entries,null,2)+'\n');
await fs.writeFile(path.join(root,'public/template-covers/local-covers.sources.json'),JSON.stringify({records},null,2)+'\n');
await fs.writeFile(path.join(root,'public/template-covers/thumbnail-covers.sources.json'),JSON.stringify({records:thumbnails},null,2)+'\n');
console.log('Versioned '+entries.filter(entry=>entry.image).length+' actual template covers.');
