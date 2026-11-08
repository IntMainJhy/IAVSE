import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const vendor=path.join(root,'vendor/stylekit-templates'),runtime=path.join(vendor,'runtime'),out=path.join(root,'public/template-site-assets');
const catalog=JSON.parse(await fs.readFile(path.join(vendor,'catalog.json'),'utf8'));
const fonts=JSON.parse(await fs.readFile(path.join(vendor,'fonts.json'),'utf8'));
await fs.mkdir(path.join(vendor,'entries'),{recursive:true});
await fs.mkdir(out,{recursive:true});
let fontCss='/* Licensed Google Fonts: see vendor/stylekit-templates/fonts.json and licenses/fonts. */\n';
for(const f of fonts)fontCss+=`@font-face{font-family:${JSON.stringify(f.family)};font-style:${f.style};font-weight:${f.weight};font-display:swap;src:url(${JSON.stringify('/'+f.file)}) format('truetype')}\n`;
const families=[...new Map(fonts.map(f=>[f.adapterName,f.family])).entries()];
let fontAdapter='/* next/font/google adapter: same OFL families, served from local assets. */\n';
for(const [identifier,family] of families){const cls='sk-font-'+identifier.toLowerCase();fontCss+=`.${cls}{font-family:${JSON.stringify(family)}}\n`;fontAdapter+=`export const ${identifier}=(_options?:any)=>({className:${JSON.stringify(cls)},style:{fontFamily:${JSON.stringify('"'+family+'"')}},variable:''});\n`}
await fs.writeFile(path.join(vendor,'adapters/fonts.ts'),fontAdapter);
await fs.writeFile(path.join(out,'fonts.css'),fontCss);
const upstreamCss=await fs.readFile(path.join(vendor,'originals/app/globals.css'),'utf8');
const tokens=upstreamCss.slice(upstreamCss.indexOf(':root {'),upstreamCss.indexOf('/* Editorial/Magazine Typography.'));
const body=upstreamCss.slice(upstreamCss.indexOf('body {'),upstreamCss.indexOf('/* The head bootstrap'));
const headings=upstreamCss.slice(upstreamCss.indexOf('h1, h2, h3, h4, h5, h6 {'),upstreamCss.indexOf('/* Style covers'));
const base=`@import "tailwindcss" source(none);\n@source "./runtime";\n@custom-variant dark (&:where(.dark, .dark *));\n${tokens}\n${body}\n${headings}\n:root{--font-public-sans:"Albert Sans";--font-public-display:"Playfair Display";--font-public-mono:"Fragment Mono"}html{scroll-behavior:smooth}body{margin:0}button,a,input,select,textarea{touch-action:manipulation}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}\n`;
await fs.writeFile(path.join(vendor,'template-base.css'),base);
execFileSync(path.join(root,'node_modules/.bin/tailwindcss'),['-i',path.join(vendor,'template-base.css'),'-o',path.join(out,'template-base.css'),'--minify'],{cwd:root,stdio:'inherit'});
async function walk(dir){let result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await walk(p));else result.push(p)}return result}
const entries={},manifest=[];
for(const item of catalog){
 const dir=path.join(runtime,'app/templates',item.slug),files=await walk(dir),pages=files.filter(p=>p.endsWith('/page.tsx')).sort();
 const entry=path.join(vendor,'entries',item.slug+'.tsx');
 let text=`import React from 'react';import {mount} from '../adapters/runtime';\n`;
 const routes=[];
 pages.forEach((p,i)=>{const rel=path.relative(dir,p).replaceAll(path.sep,'/').replace(/\/?page\.tsx$/,'');const url='/template-sites/'+item.slug+(rel?'/'+rel:'');text+=`import Page${i} from ${JSON.stringify(path.relative(path.dirname(entry),p).replaceAll(path.sep,'/'))};\n`;routes.push({path:url,sourcePath:'app/templates/'+item.slug+'/'+path.relative(dir,p).replaceAll(path.sep,'/')})});
 const layout=files.find(p=>p===path.join(dir,'layout.tsx'));if(layout)text+=`import Layout from ${JSON.stringify(path.relative(path.dirname(entry),layout).replaceAll(path.sep,'/'))};\n`;
 text+=`mount([${routes.map((r,i)=>`{path:${JSON.stringify(r.path)},component:Page${i}}`).join(',')}],${layout?'Layout':'undefined'});\n`;
 await fs.writeFile(entry,text);entries['entries/'+item.slug]=entry;
 manifest.push({slug:item.slug,title:item.title,titleEn:item.titleEn,summary:item.summary,routes,entry:'/template-site-assets/entries/'+item.slug+'.js',source:item.repository,commit:item.repositoryCommit,license:'MIT',upstreamDemoUrl:item.upstreamDemoUrl});
}
const adapters={'next/link':'link.tsx','next/navigation':'navigation.ts','next/image':'image.tsx','next/font/google':'fonts.ts'};
const result=await build({entryPoints:entries,outdir:out,bundle:true,splitting:true,format:'esm',platform:'browser',target:['es2022'],jsx:'automatic',minify:true,legalComments:'linked',metafile:true,entryNames:'[dir]/[name]-[hash]',chunkNames:'chunks/[name]-[hash]',assetNames:'assets/[name]-[hash]',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'stylekit-platform',setup(b){b.onResolve({filter:/^next\//},args=>adapters[args.path]?{path:path.join(vendor,'adapters',adapters[args.path])}:null);b.onResolve({filter:/^@\//},args=>({path:path.join(runtime,args.path.slice(2))+ (path.extname(args.path)?'':args.path==='@/components/ui/brutal'?'/index.tsx':args.path==='@/lib/utils'?'.ts':'.tsx')}));}}],logLevel:'warning'});
for(const item of manifest){
 const sourceEntry=path.relative(root,entries['entries/'+item.slug]).replaceAll(path.sep,'/');
 const output=Object.entries(result.metafile.outputs).find(([key,value])=>key.endsWith('.js')&&value.entryPoint===sourceEntry);
 if(!output)throw new Error('Missing template bundle: '+item.slug);
 item.entry='/'+output[0].replace(/^public\//,'');
 item.entrySha256=crypto.createHash('sha256').update(await fs.readFile(path.join(root,output[0]))).digest('hex');
 if(output[1].cssBundle)item.css='/'+output[1].cssBundle.replace(/^public\//,'');
}
const baseCssBytes=await fs.readFile(path.join(out,'template-base.css'));
const css='/template-site-assets/template-base.css?v='+crypto.createHash('sha256').update(baseCssBytes).digest('hex').slice(0,16);
const fontStylesheet='/template-site-assets/fonts.css?v='+crypto.createHash('sha256').update(fontCss).digest('hex').slice(0,16);

await fs.mkdir(path.join(root,'src/lib'),{recursive:true});await fs.writeFile(path.join(root,'src/lib/template-sites-manifest.json'),JSON.stringify({schemaVersion:1,commit:catalog[0].repositoryCommit,css,fontCss:fontStylesheet,templates:manifest},null,2)+'\n');
await fs.writeFile(path.join(vendor,'build-metafile.json'),JSON.stringify(result.metafile,null,2)+'\n');
// Remove only obsolete generated bundles, after the replacement manifest is ready.
const liveOutputs=new Set(Object.keys(result.metafile.outputs).map(file=>path.resolve(root,file)));
for(const directory of ['entries','chunks']){
 for(const file of await walk(path.join(out,directory))){
  if(!liveOutputs.has(path.resolve(file)))await fs.unlink(file);
 }
}

console.log(JSON.stringify({templates:manifest.length,pageRoutes:manifest.reduce((n,x)=>n+x.routes.length,0),fontFamilies:families.length,fontFiles:fonts.length,bundleOutputs:Object.keys(result.metafile.outputs).length}));
