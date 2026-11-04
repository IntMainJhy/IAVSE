import {appSurface} from './app-access.mjs';
import {randomBytes} from 'node:crypto';
import {db,hash,limited,passwordMatches,passwordHash,passwordMatchesAsync,passwordHashAsync,DATA,getConfig,transaction,isSiteOwnerAccount,ownerAccountConfigured,ownerAccountId} from './db.mjs';
import {requireValue} from './content.mjs';
import {unlinkSync,existsSync} from 'node:fs';
import path from 'node:path';
import {clientIp} from './request-security.mjs';
import {localRequest,serviceRequest,publishingQualified} from './deployment-policy.mjs';
export {clientIp} from './request-security.mjs';
export {localRequest,serviceRequest,publishingQualified} from './deployment-policy.mjs';
export const COOKIE=appSurface()==='platform'?'site_platform':'site_admin';
export function cookie(req,key){const part=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(key+'='));try{return part?decodeURIComponent(part.slice(key.length+1)):''}catch{return ''}}
const delegatedUsers=new WeakMap();
// Only verified server adapters can attach a principal; HTTP headers cannot set this map.
export function delegatedRequest(req,user){const clone=new Request(req.url,{method:req.method,headers:req.headers});delegatedUsers.set(clone,user);return clone}
export function currentUser(req){
 if(delegatedUsers.has(req)){const user=delegatedUsers.get(req);if(ownerAccountConfigured()){if(user.id==='owner')return null;return{...user,role:user.id===ownerAccountId()?'owner':'member'}}return user;}
 const token=cookie(req,COOKIE);if(!token)return null;
 const row=db().prepare("SELECT s.user_id,COALESCE(r.realm,'combined') realm,r.authentication FROM sessions s LEFT JOIN session_realms r ON r.token=s.token WHERE s.token=? AND s.expires>?").get(hash(token),Date.now());
 if(!row||row.realm!==appSurface())return null;
 // Only legacy combined sessions are known to have verified a real password.
 if(row.authentication!=='password'&&!(row.realm==='combined'&&[null,'legacy'].includes(row.authentication)))return null;
 const authentication='password';
 if(!row.user_id){
  if(appSurface()==='platform'||ownerAccountConfigured())return null;
  const profile=getConfig('profile');
  return{id:'owner',...db().prepare('SELECT username,email,email_verified_at AS emailVerifiedAt FROM admins WHERE id=1').get(),nickname:'站长',displayName:profile.name,handle:profile.alias,avatarId:profile.avatarId,role:'owner',status:'active',verification:'owner',siteOwner:isSiteOwnerAccount('owner'),authentication,canPublish:publishingQualified({role:'owner',status:'active'},req)};
 }
 if(!serviceRequest(req))return null;
 const user=db().prepare("SELECT id,username,nickname,role,status,verification,avatar_id AS avatarId,email,email_verified_at AS emailVerifiedAt FROM community_users WHERE id=? AND status<>'closed'").get(row.user_id)||null;
 const role=ownerAccountConfigured()?(user?.id===ownerAccountId()?'owner':'member'):user?.role;
 if(appSurface()==='admin'&&!(ownerAccountConfigured()?role==='owner':['owner','reviewer'].includes(role)))return null;
 if(appSurface()==='platform'&&role!=='member'&&!(ownerAccountConfigured()&&role==='owner'))return null;
 return user?{...user,role,ownerAccount:ownerAccountConfigured()&&role==='owner',siteOwner:isSiteOwnerAccount(user.id),authentication,canPublish:publishingQualified({...user,role},req)}:null;
}
export function session(req){return currentUser(req)?.role==='owner'}
export function admin(req){requireValue(session(req),'请先登录管理后台',401)}
export function origin(req){const allowed=new URL(process.env.PUBLIC_URL||req.url).origin;requireValue(req.headers.get('origin')===allowed,'请求来源无效',403)}
// A random, correctly formatted verifier keeps unknown-account checks at the
// same scrypt cost without doing a blocking derivation when the module loads.
const dummyPassword=`v2:${randomBytes(16).toString('hex')}:${randomBytes(64).toString('hex')}`;
function loginAttempt(req,{username,email,password,authentication}){
 requireValue(authentication===undefined||authentication==='password','登录方式无效');
 const raw=email||username;
 requireValue(typeof raw==='string'&&typeof password==='string'&&password.length<=256,'账号或密码错误',401);
 const identifier=raw.trim().toLowerCase();requireValue(identifier.length>0&&identifier.length<=254,'账号或密码错误',401);
 const d=db(),owner=d.prepare('SELECT * FROM admins WHERE id=1').get();
 const configured=ownerAccountConfigured();
 const row=!configured&&(owner.username.toLowerCase()===identifier||(owner.email_verified_at&&owner.email===identifier))?owner:d.prepare("SELECT * FROM community_users WHERE (username=? COLLATE NOCASE OR email=?) AND status<>'closed'").get(identifier,identifier);
 const key=hash(row?(row===owner?'owner':row.id):identifier),ip=hash(clientIp(req));
 const accountBlocked=limited('login-account:'+key,10,900000),ipBlocked=limited('login-ip:'+ip,50,900000);
 requireValue(!accountBlocked&&!ipBlocked,'尝试次数过多，请15分钟后重试',429);
 return{row,owner,password};
}
function completeLogin(req,row,isOwner){
 const configured=ownerAccountConfigured();
 const selected=configured&&row.id===ownerAccountId();
 requireValue(appSurface()!=='admin'||(configured?selected:isOwner||row.role==='reviewer'&&row.status==='active'),'此账号没有管理权限',403);
 requireValue(appSurface()!=='platform'||!isOwner&&(configured||row.role==='member'),'请使用独立管理网站登录',403);
 requireValue(isOwner||serviceRequest(req),'当前入口尚未开放账号服务',503);
 return createSession(isOwner?null:row.id);
}
export function login(req,input){
 const {row,owner,password}=loginAttempt(req,input),valid=passwordMatches(password,row?.password||dummyPassword);
 requireValue(row&&valid,'账号或密码错误',401);return completeLogin(req,row,row===owner);
}
export async function loginAsync(req,input){
 const {row,owner,password}=loginAttempt(req,input),valid=await passwordMatchesAsync(password,row?.password||dummyPassword);
 requireValue(row&&valid,'账号或密码错误',401);
 const isOwner=row===owner,latest=db().prepare(isOwner?'SELECT * FROM admins WHERE id=1':"SELECT * FROM community_users WHERE id=? AND status<>'closed'").get(...(isOwner?[]:[row.id]));
 // A concurrent reset/closure must not resurrect a session for old credentials.
 requireValue(latest&&latest.password===row.password,'账号或密码错误',401);
 requireValue(!isOwner||!ownerAccountConfigured(),'账号或密码错误',401);
 return completeLogin(req,latest,isOwner);
}
function createSession(userId){
 const token=randomBytes(32).toString('base64url');
 transaction(d=>{
  d.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
  d.prepare('DELETE FROM sessions WHERE user_id IS ? AND token NOT IN (SELECT token FROM sessions WHERE user_id IS ? ORDER BY expires DESC LIMIT 9)').run(userId,userId);
  d.prepare('INSERT INTO sessions(token,expires,user_id) VALUES(?,?,?)').run(hash(token),Date.now()+7*86400000,userId);
  d.prepare('INSERT INTO session_realms(token,realm,authentication) VALUES(?,?,?)').run(hash(token),appSurface(),'password');
 });return token;
}
export function sessionCookie(token,expires=false){const secure=process.env.PUBLIC_URL?.startsWith('https://')||process.env.COOKIE_SECURE==='true'||(process.env.COOKIE_SECURE!=='false'&&process.env.NODE_ENV==='production');return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expires?0:604800}${secure?'; Secure':''}`}
function passwordChangeAttempt(input,req){
 requireValue(typeof input.password==='string'&&input.password.length>=12&&input.password.length<=256,'新密码需要12–256位');requireValue(typeof input.current==='string'&&input.current.length<=256,'当前密码错误',400);
 const user=req?currentUser(req):ownerAccountConfigured()?null:{id:'owner',role:'owner'};
 requireValue(user?.role==='owner','没有此项管理权限',403);
 requireValue(!limited('password-change:'+user.id,10,900000),'尝试次数过多，请15分钟后重试',429);
 const personal=user.id!=='owner',row=db().prepare(personal?'SELECT * FROM community_users WHERE id=?':'SELECT * FROM admins WHERE id=1').get(...(personal?[user.id]:[]));
 requireValue(row,'请先登录',401);return{user,personal,row};
}
function completePasswordChange({user,personal,row},stored,req){
 transaction(d=>{
  const principal=req?currentUser(req):ownerAccountConfigured()?null:{id:'owner',role:'owner'};
  requireValue(principal?.id===user.id&&principal.role==='owner','没有此项管理权限',403);
  const latest=d.prepare(personal?'SELECT password FROM community_users WHERE id=?':'SELECT password FROM admins WHERE id=1').get(...(personal?[user.id]:[]));
  requireValue(latest?.password===row.password,'账号凭据已发生变化，请重新登录后再试',409);
  if(personal)d.prepare('UPDATE community_users SET password=?,updated=? WHERE id=?').run(stored,new Date().toISOString(),user.id);else d.prepare('UPDATE admins SET password=? WHERE id=1').run(stored);
  d.prepare('DELETE FROM sessions WHERE user_id IS ?').run(personal?user.id:null);d.prepare('UPDATE connect_keys SET revoked=1 WHERE actor=?').run(user.id);d.prepare('UPDATE email_challenges SET consumed=1 WHERE actor=?').run(user.id);
 });
 const initial=path.join(DATA,'initial-admin.txt');if(!personal&&existsSync(initial))unlinkSync(initial);
}
export function changePassword(input,req){const attempt=passwordChangeAttempt(input,req);requireValue(passwordMatches(input.current,attempt.row.password),'当前密码错误',400);completePasswordChange(attempt,passwordHash(input.password),req);}
export async function changePasswordAsync(input,req){const attempt=passwordChangeAttempt(input,req);requireValue(await passwordMatchesAsync(input.current,attempt.row.password),'当前密码错误',400);const stored=await passwordHashAsync(input.password);completePasswordChange(attempt,stored,req);}
