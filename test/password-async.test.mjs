import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {randomUUID,scryptSync} from 'node:crypto';
import {setImmediate as immediate} from 'node:timers/promises';

const directory=await mkdtemp(path.join(tmpdir(),'iavse-password-async-'));
const base='http://127.0.0.1:3108',password='async-current-password-2026',replacement='async-replacement-password-2026';
Object.assign(process.env,{APP_DATA_DIR:directory,PUBLIC_URL:base,APP_SURFACE:'combined',INITIAL_ADMIN_PASSWORD:'async-owner-password-2026',COOKIE_SECURE:'false'});
const D=await import('../src/lib/db.mjs'),A=await import('../src/lib/auth.mjs'),E=await import('../src/lib/email-auth.mjs'),C=await import('../src/lib/community.mjs'),API=await import('../src/lib/api.mjs');
const d=D.db(),stored=D.passwordHash(password),replacementStored=D.passwordHash(replacement);
function member(){const id=randomUUID(),token=randomUUID(),username='async_'+id.slice(0,8),email=username+'@example.com';d.prepare("INSERT INTO community_users(id,username,password,nickname,verification,created,updated,email,email_verified_at) VALUES(?,?,?,?,'accepted',?,?,?,?)").run(id,username,stored,'Async member',D.now(),D.now(),email,D.now());d.prepare('INSERT INTO sessions(token,expires,user_id) VALUES(?,?,?)').run(D.hash(token),Date.now()+600000,id);return{id,token,username,email};}
function request(pathname,input,token=''){return new Request(base+pathname,{method:input===undefined?'GET':'POST',headers:{host:new URL(base).host,origin:base,'content-type':'application/json',cookie:token?'site_admin='+token:''},...(input===undefined?{}:{body:JSON.stringify(input)})});}
async function pendingAtNextTurn(job){let settled=false;void job.then(()=>{settled=true},()=>{settled=true});await immediate();assert.equal(settled,false,'password derivation must leave the event loop available');assert.equal(d.isTransaction,false,'password work must not hold a SQLite transaction');}

test('native asynchronous derivation preserves v2 and legacy verifiers without blocking the event loop',async()=>{
 const job=D.passwordHashAsync(password);await pendingAtNextTurn(job);const derived=await job;
 assert.match(derived,/^v2:[a-f0-9]{32}:[a-f0-9]{128}$/);assert.equal(D.passwordMatches(password,derived),true);assert.equal(await D.passwordMatchesAsync(password,stored),true);assert.equal(await D.passwordMatchesAsync('wrong',derived),false);
 const salt='a'.repeat(32),legacy=salt+':'+scryptSync(password,salt,64).toString('hex');assert.equal(await D.passwordMatchesAsync(password,legacy),true);assert.equal(await D.passwordMatchesAsync(password,'malformed'),false);
});

test('HTTP login yields to unrelated reads and rejects credentials reset during derivation',async()=>{
 const user=member(),job=API.handle(request('/api/auth/login',{username:user.username,password}));await pendingAtNextTurn(job);
 const me=await API.handle(request('/api/auth/me',undefined,user.token));assert.equal((await me.json()).user.id,user.id);
 d.prepare('UPDATE community_users SET password=? WHERE id=?').run(replacementStored,user.id);
 assert.equal((await job).status,401);assert.equal(d.prepare('SELECT COUNT(*) n FROM sessions WHERE user_id=?').get(user.id).n,1,'a stale login must not create another session');
 const valid=await API.handle(request('/api/auth/login',{username:user.username,password:replacement}));assert.equal(valid.status,200);assert.match(valid.headers.get('set-cookie'),/^site_admin=/);
 const missing=API.handle(request('/api/auth/login',{username:'no_such_async_user',password}));await pendingAtNextTurn(missing);assert.equal((await missing).status,401);
});

test('HTTP registration hashes outside transactions and rechecks concurrent username claims',async()=>{
 const config=C.communityApi(request('/api/community/config'),['community','config'],{},new URL(base)),input={accepted:true,adult:true,policyRead:['community','disclaimer'],policyVersion:config.policyVersion,policyHash:config.policyHash,username:'async_signup',nickname:'异步注册',email:'async-signup@example.com',password};
 const job=API.handle(request('/api/community/register',input));await pendingAtNextTurn(job);
 const user=member();d.prepare('UPDATE community_users SET username=? WHERE id=?').run(input.username,user.id);
 assert.equal((await job).status,409);assert.equal(d.prepare('SELECT COUNT(*) n FROM community_users WHERE email=?').get(input.email).n,0);
 input.username='async_signup_available';const success=API.handle(request('/api/community/register',input));await pendingAtNextTurn(success);assert.equal((await success).status,200);
 assert.equal(await D.passwordMatchesAsync(password,d.prepare('SELECT password FROM community_users WHERE email=?').get(input.email).password),true);
});

test('HTTP member changes remain atomic and revoke sessions; closure also yields',async()=>{
 const user=member(),key=randomUUID();d.prepare('INSERT INTO connect_keys(id,actor,name,hash,scopes,expires,created) VALUES(?,?,?,?,?,?,?)').run(key,user.id,'Async key',D.hash(key),'["library"]',Date.now()+600000,D.now());
 d.exec("CREATE TEMP TRIGGER reject_async_revoke BEFORE UPDATE ON connect_keys BEGIN SELECT RAISE(ABORT,'async revocation failed');END");
 try{const failed=API.handle(request('/api/community/account',{action:'password',current:password,password:replacement},user.token));await pendingAtNextTurn(failed);assert.equal((await failed).status,500);assert.equal(d.prepare('SELECT password FROM community_users WHERE id=?').get(user.id).password,stored);assert.equal(A.currentUser(request('/api/auth/me',undefined,user.token)).id,user.id);}finally{d.exec('DROP TRIGGER reject_async_revoke');}
 const changed=API.handle(request('/api/community/account',{action:'password',current:password,password:replacement},user.token));await pendingAtNextTurn(changed);assert.equal((await changed).status,200);assert.equal(A.currentUser(request('/api/auth/me',undefined,user.token)),null);assert.equal(d.prepare('SELECT revoked FROM connect_keys WHERE id=?').get(key).revoked,1);
 const closing=member(),close=API.handle(request('/api/community/account',{action:'close',current:password,confirm:true},closing.token));await pendingAtNextTurn(close);assert.equal((await close).status,200);assert.equal(d.prepare('SELECT status FROM community_users WHERE id=?').get(closing.id).status,'closed');
});

test('member password changes cannot overwrite a concurrent reset or survive logout',async()=>{
 const user=member(),job=C.communityApiAsync(request('/api/community/account',{},user.token),['community','account'],{action:'password',current:password,password:replacement},new URL(base));await pendingAtNextTurn(job);
 d.prepare('UPDATE community_users SET password=? WHERE id=?').run(replacementStored,user.id);
 await assert.rejects(job,error=>error.status===409);assert.equal(d.prepare('SELECT password FROM community_users WHERE id=?').get(user.id).password,replacementStored);
 const loggedOut=member(),closing=C.communityApiAsync(request('/api/community/account',{},loggedOut.token),['community','account'],{action:'close',current:password,confirm:true},new URL(base));await pendingAtNextTurn(closing);d.prepare('DELETE FROM sessions WHERE user_id=?').run(loggedOut.id);await assert.rejects(closing,error=>error.status===401);assert.equal(d.prepare('SELECT status FROM community_users WHERE id=?').get(loggedOut.id).status,'active');
});

test('owner password HTTP path yields and invalidates old sessions',async()=>{
 const loggedOut=A.login(request('/api/auth/login'),{username:'admin',password:process.env.INITIAL_ADMIN_PASSWORD}),stale=A.changePasswordAsync({current:process.env.INITIAL_ADMIN_PASSWORD,password:replacement},request('/api/auth/password',{},loggedOut));await pendingAtNextTurn(stale);d.prepare('DELETE FROM sessions WHERE token=?').run(D.hash(loggedOut));await assert.rejects(stale,error=>error.status===403);
 const token=A.login(request('/api/auth/login'),{username:'admin',password:process.env.INITIAL_ADMIN_PASSWORD}),job=API.handle(request('/api/auth/password',{current:process.env.INITIAL_ADMIN_PASSWORD,password:replacement},token));await pendingAtNextTurn(job);assert.equal((await job).status,200);assert.equal(A.currentUser(request('/api/auth/me',undefined,token)),null);assert.equal(await D.passwordMatchesAsync(replacement,d.prepare('SELECT password FROM admins WHERE id=1').get().password),true);
});

test('asynchronous tool credential creation rechecks password and session before issuing a token',async()=>{
 const user=member(),input={action:'create',current:password,name:'Async tool',scopes:['library']},job=API.handle(request('/api/spaces/keys',input,user.token));await pendingAtNextTurn(job);
 d.prepare('UPDATE community_users SET password=? WHERE id=?').run(replacementStored,user.id);assert.equal((await job).status,409);assert.equal(d.prepare('SELECT COUNT(*) n FROM connect_keys WHERE actor=?').get(user.id).n,0);
 const valid=API.handle(request('/api/spaces/keys',{...input,current:replacement},user.token));await pendingAtNextTurn(valid);const response=await valid;assert.equal(response.status,200);assert.match((await response.json()).token,/^erg_/);
});

test('asynchronous email binding preserves its session and reset is single-use',async()=>{
 const user=member(),row=d.prepare('SELECT password,email FROM community_users WHERE id=?').get(user.id),scope=D.hash(row.password+':'+row.email),email='async-bound@example.com',binding=E.prepareEmailChallenge(email,'bind',user.id,scope);E.activateEmailChallenge(binding.id);
 const bind=API.handle(request('/api/auth/email/bind',{email,challenge:binding.id,code:binding.code,current:password},user.token));await pendingAtNextTurn(bind);assert.equal((await bind).status,200);assert.equal(A.currentUser(request('/api/auth/me',undefined,user.token)).email,email);
 const resetting=E.prepareEmailChallenge(email,'reset',user.id,D.hash(stored+':'+email));E.activateEmailChallenge(resetting.id);const input={email,challenge:resetting.id,code:resetting.code,password:replacement},reset=API.handle(request('/api/auth/email/reset',input));await pendingAtNextTurn(reset);assert.equal((await reset).status,200);assert.equal(A.currentUser(request('/api/auth/me',undefined,user.token)),null);assert.equal((await API.handle(request('/api/auth/email/reset',input))).status,400);
 const concurrent=member(),challenge=E.prepareEmailChallenge(concurrent.email,'reset',concurrent.id,D.hash(stored+':'+concurrent.email));E.activateEmailChallenge(challenge.id);const job=E.resetEmailPasswordAsync(request('/api/auth/email/reset'),{email:concurrent.email,challenge:challenge.id,code:challenge.code,password:replacement});await pendingAtNextTurn(job);d.prepare('UPDATE community_users SET password=? WHERE id=?').run(replacementStored,concurrent.id);await assert.rejects(job,error=>error.status===409);
});

test('email binding rechecks protected owner assignment after asynchronous password verification',async()=>{
 const assignOwner=user=>{d.prepare("UPDATE community_users SET role='owner' WHERE id=?").run(user.id);d.prepare("INSERT INTO config(key,value) VALUES('ownerAccount',?)").run(JSON.stringify({id:user.id,email:user.email}));assert.equal(D.ownerAccountId(),user.id);};
 const restoreOwner=user=>{d.prepare("DELETE FROM config WHERE key='ownerAccount'").run();d.prepare("UPDATE community_users SET role='member' WHERE id=?").run(user.id);};
 const user=member(),email='protected-owner-bind@example.com',binding=E.prepareEmailChallenge(email,'bind',user.id,D.hash(stored+':'+user.email));E.activateEmailChallenge(binding.id);
 const job=E.bindEmailAsync(request('/api/auth/email/bind',{},user.token),{email,challenge:binding.id,code:binding.code,current:password});await pendingAtNextTurn(job);assignOwner(user);
 try{await assert.rejects(job,error=>error.status===403);assert.equal(D.ownerAccountId(),user.id);assert.equal(d.prepare('SELECT email FROM community_users WHERE id=?').get(user.id).email,user.email);assert.equal(d.prepare('SELECT consumed FROM email_challenges WHERE id=?').get(binding.id).consumed,0);}finally{restoreOwner(user);}
 const sender=member(),previousMode=process.env.MAIL_MODE;process.env.MAIL_MODE='capture';
 try{const requesting=E.requestEmail(request('/api/auth/email/request',{},sender.token),{purpose:'bind',email:'protected-owner-send@example.com',current:password});await pendingAtNextTurn(requesting);assignOwner(sender);
  try{await assert.rejects(requesting,error=>error.status===403);assert.equal(D.ownerAccountId(),sender.id);assert.equal(d.prepare("SELECT COUNT(*) n FROM email_challenges WHERE actor=? AND purpose='bind'").get(sender.id).n,0);}finally{restoreOwner(sender);}
 }finally{if(previousMode===undefined)delete process.env.MAIL_MODE;else process.env.MAIL_MODE=previousMode;}
});

test.after(async()=>{d.close();delete globalThis.__personalSiteDb;await rm(directory,{recursive:true,force:true});});
