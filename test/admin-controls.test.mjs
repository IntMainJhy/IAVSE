import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';

const element=React.createElement;
const translate=(text,values=[])=>values.reduce((value,item,index)=>value.replaceAll('{'+index+'}',item),text);
const wrapper=({children})=>element('div',null,children);
const empty=()=>null;
const field=({name,label,value})=>element('label',null,label,element('input',{name,defaultValue:value??''}));
function load(name,extra={},globals={}){
 const source=ts.transpileModule(readFileSync(new URL('../src/components/'+name+'.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const modules={
  react:React,'react/jsx-runtime':jsxRuntime,'next/link':{default:({href,children,...props})=>element('a',{href,...props},children)},
  './LocaleProvider':{useLocale:()=>({t:translate,locale:'zh'})},
  './AdminApp':{Field:field,useUnsaved(){}},
  '@/lib/client':{api:async()=>({}),post:async()=>({}),bytes:value=>String(value)},
  './ResumeImport':{ResumeImport:empty},'./EmailSettings':{EmailSettings:empty},
  './ContentLanguageTabs':{ContentLanguageTabs:empty},
  './Upload':{FileChoice:({label,mode,value})=>element('label',null,label,element('input',{'data-kind':mode,defaultValue:value??''})),Upload:empty},
  './Icons':{Icon:empty},'./PageResources':{useResource:()=>({})},
  './HomeFlowBackground':{HomeFlowBackground:empty},'./CatalogAdmin':{CatalogAdmin:empty},
  './CaseContentLink':{CaseContentLink:empty},'./SpaceModeration':{SpaceModeration:empty},
  './SiteTools':{SiteTools:empty},'./PageMotion':{PageMotion:wrapper},
  './CommunityCommentsAdmin':{CommunityCommentsAdmin:empty},'./PostCover':{PostCover:empty},
  ...extra
 };
 if(name==='AdminForms')modules['./DesktopDownloadsSettings']=load('DesktopDownloadsSettings',extra);
 const exports={};vm.runInNewContext(source+(name==='AdminForms'?'\nexports.testUseDraft=useDraft;':''),{exports,Date,...globals,require:key=>{if(!(key in modules))throw Error('Unmocked dependency '+key);return modules[key]}});return exports;
}

test('settings only offers controls consumed by the website and retains real download, cover and PDF settings',()=>{
 const {SettingsForm}=load('AdminForms');
 const value={name:'UNUSED_BRAND_VALUE',tagline:'UNUSED_TAGLINE_VALUE',description:'UNUSED_SUMMARY_VALUE',shareImageId:'shared-cover',resumeId:'public-pdf',promotionBar:{enabled:true,items:[{title:'UNRENDERED_PROMOTION',url:'https://example.com',kind:'ad'}]},desktopDownloads:{macos:{url:'https://example.com/app.dmg',version:'1.2'},windows:{url:'https://example.com/app.exe',version:'2.0'}}};
 const html=renderToStaticMarkup(element(SettingsForm,{value,max:10000000,notify(){},refresh(){}}));
 for(const label of ['网站名称','网站简介','默认分享摘要','顶部推广条','添加推广内容','UNRENDERED_PROMOTION','UNUSED_BRAND_VALUE','UNUSED_TAGLINE_VALUE','UNUSED_SUMMARY_VALUE'])assert.ok(!html.includes(label),label+' is not an active public setting');
 for(const value of ['默认分享封面','shared-cover','附加简历 PDF','public-pdf','桌面应用下载','https://example.com/app.dmg','https://example.com/app.exe','保存设置'])assert.ok(html.includes(value),value+' remains functional');
 assert.equal(value.promotionBar.items[0].title,'UNRENDERED_PROMOTION','removing an editor does not delete stored compatibility data');
});

function members({singleOwner=true,history=true,embedded=false}={}){
 const official={id:'official',username:'operator',nickname:'Operator',role:'owner',status:'active',verification:'local_test',created:'2026-01-01'};
 const ordinary={id:'member',username:'member',nickname:'Member',role:'member',status:'active',verification:'pending',created:'2026-01-01'};
 const current={...official,id:singleOwner?'official':'owner',ownerAccount:singleOwner};
 const resources={
  '/api/auth/me':{user:current,access:{registration:true}},
  '/api/community/config':{mode:'local'},
  '/api/admin/community/accounts':{items:[official,ordinary]},
  '/api/admin/community/invites':{items:history?[{id:'historic',label:'Previously shared invitation',expires:Date.now()+600000,created:'2026-01-01',revoked:false}]:[]}
 };
 const ui={useResource:key=>({data:resources[key],refresh(){}}),Badge:({value})=>element('span',null,value),CommunityField:field,CommunityText:empty,Empty:({title,children})=>element('section',null,title,children),Notice:wrapper,Retry:empty,Loading:empty,Logout:empty,primary:'primary',secondary:'secondary',date:String};
 const {CommunityAdmin}=load('CommunityAdmin',{'./CommunityUI':ui});
 return renderToStaticMarkup(element(CommunityAdmin,{path:['accounts'],embedded}));
}

test('unique-owner member management removes ineffective role and invitation creation controls while preserving real moderation and revocation',()=>{
 const html=members();
 for(const label of ['创建一次性邀请','生成邀请码','分配社区角色','账号与邀请'])assert.ok(!html.includes(label),label+' is unavailable in the current account model');
 assert.ok(html.includes('成员管理'));assert.ok(html.includes('member-action-member'),'another member can still be moderated');
 assert.ok(!html.includes('member-action-official'),'the current owner is managed through the personal account instead of a form that always returns 403');
 assert.ok(html.includes('href="/workspace/account"'));
 assert.ok(html.includes('Previously shared invitation'));assert.ok(html.includes('撤销邀请'),'previously issued invitations remain revocable');
});

test('the unconfigured legacy administration mode retains real reviewer delegation and an empty invitation history stays out of the page',()=>{
 assert.ok(members({singleOwner:false}).includes('分配社区角色'));
 const html=members({history:false});assert.ok(!html.includes('最近邀请记录（'));assert.ok(html.includes('member-action-member'));
});

test('embedded community management retains controls without nesting a second dashboard shell',()=>{
 const html=members({embedded:true});assert.ok(html.includes('admin-community-nav'));assert.ok(html.includes('member-action-member'));
 for(const shell of ['class="admin-shell"','class="admin-side"','class="admin-main"','返回内容后台'])assert.ok(!html.includes(shell),shell+' belongs to the parent control center');
});
test('settings group panels retain the real form controls and separate password submission from site configuration',()=>{
 const {SettingsForm}=load('AdminForms');const html=renderToStaticMarkup(element(SettingsForm,{value:{desktopDownloads:{},shareImageId:'',resumeId:''},max:10000000,notify(){},refresh(){}}));
 for(const id of ['admin-settings-page','admin-settings-downloads','admin-settings-security'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/id="admin-settings-downloads" hidden=""/);assert.match(html,/id="admin-settings-security" hidden=""/);
 assert.ok(html.includes('form="admin-site-settings"'));assert.ok(html.indexOf('</form>')<html.indexOf('name="current"'),'the password form is outside the public-site form');
});

test('reverting a settings draft removes its cached edit instead of restoring it again on refresh',()=>{
 const cells=[],storage=new Map(),effects=[],layouts=[];let cursor=0;
 const fakeReact={...React,useRef:initial=>{const i=cursor++;return cells[i]??={current:initial}},useState:initial=>{const i=cursor++;if(!(i in cells))cells[i]=initial;return[cells[i],next=>{cells[i]=typeof next==='function'?next(cells[i]):next}]},useLayoutEffect:fn=>{if(!layouts.length)layouts.push(fn)},useEffect:fn=>effects.push(fn)};
 const {testUseDraft}=load('AdminForms',{react:fakeReact},{sessionStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)}});
 const initial={shareImageId:'original'},render=()=>{cursor=0;effects.length=0;const draft=testUseDraft('settings',initial);for(const effect of effects)effect();return draft};
 let draft=render();layouts[0]();draft=render();draft.setData({shareImageId:'changed'});draft=render();assert.equal(draft.dirty,true);assert.ok(storage.has('settings'));
 draft.setData(initial);draft=render();assert.equal(draft.dirty,false);assert.equal(storage.has('settings'),false);
});
