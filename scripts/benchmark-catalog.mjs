// Read-only local regression probe; not a production capacity certification.
import {gzipSync} from 'node:zlib';
import {statSync} from 'node:fs';
import entries from '../src/lib/template-library.json' with {type:'json'};
import {createCatalogIndex,filterCatalog} from '../src/lib/design-taxonomy.mjs';
import {buildDesignCatalogSnapshot,queryDesignCatalog} from '../src/lib/design-catalog-query.mjs';
import {designDirectoryEntry} from '../src/lib/design-directory-data.mjs';

const base=new URL(process.argv[2]||'http://127.0.0.1:3008');
if(!['http:','https:'].includes(base.protocol)||base.username||base.password)throw Error('Pass an HTTP(S) base URL without credentials.');
const quantile=(values,p)=>[...values].sort((a,b)=>a-b)[Math.ceil(values.length*p)-1];
async function request(route){const start=performance.now(),response=await fetch(new URL(route,base),{headers:{cookie:'site-locale=zh'},signal:AbortSignal.timeout(15000)});if(!response.ok){await response.body?.cancel();throw Error('HTTP '+response.status+' for '+route+'; stop instead of bypassing rate limits.');}const body=await response.text();return{ms:performance.now()-start,bytes:Buffer.byteLength(body),gzipBytes:gzipSync(body).length};}
const http=[];
for(const route of ['/resources?type=designs','/resources?type=skills','/blogs','/community']){const samples=[];for(let i=0;i<6;i++)samples.push(await request(route));http.push({route,...samples.at(-1),coldMs:samples[0].ms,warmMedianMs:quantile(samples.slice(1).map(x=>x.ms),.5)});}
const latencies=[];
for(let batch=0;batch<4;batch++)await Promise.all(Array.from({length:10},async()=>latencies.push((await request('/resources?type=designs')).ms)));
const fixtures=Array.from({length:10000},(_,i)=>({...entries[i%entries.length],slug:'fixture-'+i})),start=performance.now(),index=createCatalogIndex(fixtures),indexBuildMs=performance.now()-start,times=[];
for(let i=0;i<100;i++){const start=performance.now();filterCatalog(fixtures,{q:['文档','finance','blog','minimal'][i%4]},[],index);times.push(performance.now()-start);}
const covers=entries.filter(x=>x.image).map(entry=>{const src=entry.image.split('?')[0];return{original:statSync(new URL('../public'+src,import.meta.url)).size,thumbnail:statSync(new URL('../public'+src.replace('/template-covers/','/template-covers/thumbs/'),import.meta.url)).size};});
const snapshot=buildDesignCatalogSnapshot(fixtures,'benchmark'),batch=queryDesignCatalog({},snapshot);
console.log(JSON.stringify({scope:'Anonymous local GETs; 40 requests, concurrency 10. Synthetic filters are not visitor counts.',templates:entries.length,http,concurrent:{requests:40,concurrency:10,p50Ms:quantile(latencies,.5),p95Ms:quantile(latencies,.95),maxMs:Math.max(...latencies)},filter:{records:fixtures.length,indexBuildMs,medianMs:quantile(times,.5),p95Ms:quantile(times,.95)},directoryBatch:{records:fixtures.length,initialItems:batch.items.length,allSummariesBytes:Buffer.byteLength(JSON.stringify(fixtures.map(designDirectoryEntry))),firstBatchBytes:Buffer.byteLength(JSON.stringify(batch))},covers:{originalBytes:covers.reduce((sum,x)=>sum+x.original,0),thumbnailBytes:covers.reduce((sum,x)=>sum+x.thumbnail,0)}},null,2));
