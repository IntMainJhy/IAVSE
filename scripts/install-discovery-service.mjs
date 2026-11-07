#!/usr/bin/env node
import {mkdirSync,writeFileSync,existsSync,unlinkSync} from 'node:fs';
import {homedir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// macOS owner-level LaunchAgent, survives web-server restarts and runs after login.
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),label='com.iavse.resource-discovery',domain='gui/'+(process.getuid?.()??0);
const service=path.join(homedir(),'Library','LaunchAgents',label+'.plist'),logs=path.join(homedir(),'Library','Logs','IAVSE');
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
if(process.platform!=='darwin'){console.error('On Linux use the systemd service in deploy/iavse-discovery.service.example.');process.exit(1)}
for(const file of ['.env.local','.env'])if(existsSync(path.join(root,file)))process.loadEnvFile(path.join(root,file));
const dataDirectory=process.env.APP_DATA_DIR?path.resolve(root,process.env.APP_DATA_DIR):path.resolve(root,'..','.site-v1-data');
const action=process.argv[2]||'install';
if(!['install','uninstall','status'].includes(action)){console.error('Usage: node scripts/install-discovery-service.mjs [install|uninstall|status]');process.exit(1)}
if(action==='status'){const result=spawnSync('launchctl',['print',domain+'/'+label],{stdio:'inherit'});process.exit(result.status??1)}
spawnSync('launchctl',['bootout',domain+'/'+label],{stdio:'ignore'});
if(action==='uninstall'){if(existsSync(service))unlinkSync(service);console.log('Resource discovery service removed; collected drafts and published entries preserved.');process.exit(0)}
mkdirSync(path.dirname(service),{recursive:true});mkdirSync(logs,{recursive:true,mode:0o700});
writeFileSync(service,`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array><string>${escape(process.execPath)}</string><string>${escape(path.join(root,'scripts','discover-resources.mjs'))}</string><string>--daemon</string></array>
<key>WorkingDirectory</key><string>${escape(root)}</string>
<key>EnvironmentVariables</key><dict><key>APP_DATA_DIR</key><string>${escape(dataDirectory)}</string></dict>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>30</integer>
<key>StandardOutPath</key><string>${escape(path.join(logs,'discovery.log'))}</string>
<key>StandardErrorPath</key><string>${escape(path.join(logs,'discovery-error.log'))}</string>
</dict></plist>`,{mode:0o600});
const result=spawnSync('launchctl',['bootstrap',domain,service],{stdio:'inherit'});
if(result.status!==0){console.error('Service file prepared but could not be activated:',service);process.exit(result.status??1)}
console.log('Installed:',label,'— daily 09:00 Asia/Shanghai. Review in /admin/discovery.');
