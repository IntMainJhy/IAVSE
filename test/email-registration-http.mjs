import assert from 'node:assert/strict';
import {mkdtemp,readdir,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {startServer,stopServer} from './server.mjs';
const directory=await mkdtemp(path.join(tmpdir(),'iavse-register-http-'));
let server;
try{
 server=await startServer(directory,3181,1048576,{APP_SURFACE:'platform',PLATFORM_LOGIN_MODE:'password',REGISTRATION_ENABLED:'true',SITE_DEMO:'false',DEMO_SKIP_LOGIN:'false'});
 const call=(url,body,cookie='')=>fetch(server.base+url,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{Origin:server.base,'Content-Type':'application/json',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});
 for(const [locale,title] of [['zh','邮箱注册'],['en','Email registration'],['ja','メール登録']]){
  const response=await call('/join',undefined,'site-locale='+locale);assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes(title));assert.ok(html.includes('name="confirm"'));assert.ok(!html.includes('name="code"'));assert.ok(html.includes('registration-consent'));assert.doesNotMatch(html,/id="community-invite"/);
 }
 assert.ok((await(await call('/login')).text()).includes('href="/join"'));
 const email='registration-fixture@example.com',password='registration-fixture-password-2026';
 const policy=await(await call('/api/community/config')).json();const input={email,password,nickname:'Registration fixture',policyRead:['community','disclaimer'],accepted:true,adult:true,policyVersion:policy.policyVersion,policyHash:policy.policyHash};
 for(const name of input.policyRead){const document=await(await call('/api/community/policies/'+name)).json();assert.equal(document.hash,policy.policyHash);assert.ok(document.text.length>100)}
 assert.equal((await call('/api/community/register',{...input,policyRead:[]})).status,409);
 assert.equal((await call('/api/community/register',{...input,policyHash:'outdated'})).status,409);
 let response=await call('/api/community/register',input);assert.equal(response.status,200);assert.equal((await call('/api/community/register',input)).status,409);
 response=await call('/api/auth/login',{email,password});assert.equal(response.status,200);const cookie=response.headers.get('set-cookie').split(';')[0];assert.match(cookie,/^site_platform=/);
 const user=(await(await call('/api/auth/me',undefined,cookie)).json()).user;assert.equal(user.authentication,'password');assert.equal(user.email,email);assert.equal(user.emailVerifiedAt,null);assert.equal(user.verification,'accepted');assert.equal(user.canPublish,true);
 const mine=await call('/api/spaces/mine',undefined,cookie);assert.equal(mine.status,200);assert.equal((await mine.json()).profile.name,'Registration fixture');
 assert.equal((await call('/api/spaces/mine')).status,401);assert.equal((await call('/api/admin/bootstrap',undefined,cookie)).status,404);
 console.log('PASS: bilingual/trilingual registration UI, mail-free registration, required document acknowledgment and version-bound consent, real email sign-in, private blog draft and admin isolation.');
 if(process.env.REGISTRATION_UI==='true'){
  console.log('UI fixture ready at '+server.base+'/join');await new Promise(resolve=>process.once('SIGTERM',resolve));
 }
}finally{if(server)await stopServer(server);await rm(directory,{recursive:true,force:true});}
