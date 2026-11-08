/** Only reviewed registry entries can supply a preview document. */
export function templatePreviewUrl(entry,variant=0){
 if(!entry?.template||entry.previewPolicy==='external-only')return null;
 const index=Number.isInteger(variant)&&variant>=0?variant:0;
 const url=entry.previewVariants?.[index]?.url||entry.previewUrl;
 if(typeof url!=='string')return null;
 if(/^\/design-artifacts\/vibeui-[a-z0-9-]+\/(?:index|dark)\.html$/.test(url))return url;
 try{const parsed=new URL(url);return parsed.protocol==='https:'&&!parsed.username&&!parsed.password&&entry.template.kind==='project'&&entry.template.upstreamDemoUrl===url?url:null}catch{return null}
}
