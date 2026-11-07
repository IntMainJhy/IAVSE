#!/usr/bin/env node
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
process.chdir(root);
for(const file of ['.env.local','.env'])if(existsSync(path.join(root,file)))process.loadEnvFile(path.join(root,file));
const {claimScheduledDiscovery}=await import('../src/lib/design-intake.mjs');
const {collectDiscovery}=await import('../src/lib/design-intake-collector.mjs');
const mode=process.argv[2]||'--scheduled';
if(!['--once','--scheduled','--daemon'].includes(mode)){console.error('Usage: node scripts/discover-resources.mjs [--once|--scheduled|--daemon]');process.exit(1)}
let busy=false;
async function tick(){
 if(busy)return;busy=true;
 try{
  if(mode==='--once'||claimScheduledDiscovery()){
   const result=await collectDiscovery({trigger:mode==='--once'?'cli':'scheduled'});
   console.log(JSON.stringify({at:new Date().toISOString(),run:result.id,status:result.status,added:result.added,results:result.results}));
   if(mode!=='--daemon'&&result.status==='failed')process.exitCode=1;
  }
 }catch(error){console.error('[resource-discovery]',error.status||'error',error.message);if(mode!=='--daemon')process.exitCode=1}
 finally{busy=false}
}
await tick();
if(mode==='--daemon'){
 const interval=setInterval(()=>void tick(),60000);
 const stop=()=>{clearInterval(interval);process.exitCode=0};process.once('SIGTERM',stop);process.once('SIGINT',stop);
 console.log('[resource-discovery] Active. Daily at 09:00 Asia/Shanghai; all discoveries remain private until owner approval.');
}
