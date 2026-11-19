import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import JSZip from 'jszip';
import {creatorSkills} from '../src/lib/creator-skills.mjs';

const project=fileURLToPath(new URL('../',import.meta.url));
const index=process.argv.indexOf('--local-root'),local=index<0?null:path.resolve(process.argv[index+1]);
const output=path.join(project,'public/skills/creator'),date=new Date('2026-11-19T00:00:00Z');
const excluded=name=>name.split('/').some(part=>['.git','node_modules','__pycache__','.DS_Store'].includes(part)||part==='.env'||part.startsWith('.env.'))||/\.(pyc|pyo)$/.test(name);
const get=async url=>{const response=await fetch(url);if(!response.ok)throw Error(`${response.status}: ${url}`);return Buffer.from(await response.arrayBuffer());};
await fs.mkdir(output,{recursive:true});
const manifest=[];
for(const skill of creatorSkills){
 const zip=new JSZip(),folder=zip.folder(skill.id),sourceFolder=skill.skillPath.replace(/\/SKILL\.md$/,'');
 if(local){
  const root=path.join(local,skill.id);
  async function copy(directory,relative=''){
   for(const item of (await fs.readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
    const name=path.posix.join(relative,item.name),target=path.join(directory,item.name);
    if(excluded(name))continue;
    if(item.isSymbolicLink())throw Error('Unexpected symbolic link: '+name);
    if(item.isDirectory())await copy(target,name);
    else if(item.isFile())folder.file(name,await fs.readFile(target),{date});
   }
  }
  await copy(root);
 }else{
  const upstream=await JSZip.loadAsync(await get(`https://codeload.github.com/${skill.repo}/zip/${skill.commit}`));
  const first=Object.keys(upstream.files)[0].split('/')[0],prefix=first+'/'+sourceFolder+'/';
  for(const [name,item]of Object.entries(upstream.files).sort(([a],[b])=>a.localeCompare(b))){
   if(!item.dir&&name.startsWith(prefix)&&!excluded(name.slice(prefix.length)))folder.file(name.slice(prefix.length),await item.async('nodebuffer'),{date});
  }
 }
 if(!zip.file(skill.id+'/SKILL.md'))throw Error('Missing SKILL.md: '+skill.id);
 const base=`https://raw.githubusercontent.com/${skill.repo}/${skill.commit}/`;
 const license=await get(base+skill.licensePath);
 if(!license.toString().includes('MIT License'))throw Error('Unexpected license: '+skill.id);
 folder.file('LICENSE',license,{date});
 if(skill.id==='brand-identity')folder.file('THIRD_PARTY_NOTICES.md',await get(base+'THIRD_PARTY_NOTICES.md'),{date});
 folder.file('SOURCE.json',JSON.stringify({name:skill.name,repository:'https://github.com/'+skill.repo,commit:skill.commit,path:sourceFolder,license:skill.license,licenseUrl:skill.licenseUrl,verifiedAt:skill.verifiedAt,note:'Original upstream skill files. Bundled third-party assets retain their individual licenses.'},null,2)+'\n',{date});
 for(const item of Object.values(zip.files))item.date=date;
 const bytes=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:9},platform:'UNIX'});
 await fs.writeFile(path.join(output,skill.id+'.zip'),bytes);
 const item={id:skill.id,repo:skill.repo,commit:skill.commit,url:skill.packageDownload,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
 manifest.push(item);console.log(skill.id,bytes.length,'bytes');
}
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify({verifiedAt:'2026-11-19',packages:manifest},null,2)+'\n');
