import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsxRuntime from 'react/jsx-runtime';

const compiled=ts.transpileModule(fs.readFileSync(new URL('../src/components/SignUpForm.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const config={mode:'public',policyReady:true,policyHash:'current-policy-hash',policyVersion:'2026-11'};
function formFixture({read=['community','disclaimer'],settings=config,api=async()=>({ok:true})}={}){
 const exports={},effects=[],messages=[],success=[],calls=[],state=[settings,'',0,read,false,''];let slot=0;
 vm.runInNewContext(compiled,{exports,AbortController,JSON,String,FormData:class{constructor(form){this.form=form;}get(name){return this.form[name]??null;}},require:name=>{
  if(name==='react')return{useEffect:fn=>effects.push(fn),useId:()=>':test:',useRef:value=>({current:value}),useState:()=>{const index=slot++;return[state[index],value=>{state[index]=value;messages.push(value);}];}};
  if(name==='react/jsx-runtime')return jsxRuntime;
  if(name.includes('LocaleProvider'))return{useLocale:()=>({t:value=>value})};
  if(name.includes('/client'))return{api:async(...args)=>{calls.push(args);return api(...args);}};
  return{};
 }});
 const form=exports.default({onRegistered:email=>success.push(email)});
 return{form,effects,messages,success,calls,submit:values=>form.props.onSubmit({preventDefault(){},currentTarget:{email:' test@example.com ',nickname:'Test Member',password:'a-valid-test-password',confirm:'a-valid-test-password',adult:'on',accepted:'on',...values}})};
}
test('registration cannot submit until current documents are read or when the service is closed',async()=>{
 for(const options of [{read:[]},{settings:{...config,mode:'closed'}},{settings:{...config,policyReady:false}},{settings:{...config,paused:true}}]){
  const fixture=formFixture(options);await fixture.submit();assert.equal(fixture.calls.length,0);assert.equal(fixture.success.length,0);
 }
});
test('mismatched confirmation does not send credentials or create an account',async()=>{
 const fixture=formFixture();await fixture.submit({confirm:'another-password'});assert.equal(fixture.calls.length,0);assert.ok(fixture.messages.includes('两次新密码输入不一致'));
});
test('registration sends the actual consent version and returns the email for in-dialog sign-in',async()=>{
 const fixture=formFixture();await fixture.submit();assert.equal(fixture.calls.length,1);
 const [url,options]=fixture.calls[0];assert.equal(url,'/api/community/register');assert.equal(options.method,'POST');
 const data=JSON.parse(options.body);assert.deepEqual(data.policyRead,['community','disclaimer']);assert.equal(data.policyHash,config.policyHash);assert.equal(data.policyVersion,config.policyVersion);assert.equal(data.adult,true);assert.equal(data.accepted,true);assert.equal(data.password,'a-valid-test-password');assert.deepEqual(fixture.success,['test@example.com']);
});
test('duplicate submits are blocked and dismissing the form ignores an aborted response',async()=>{
 let resolve;const fixture=formFixture({api:()=>new Promise(done=>resolve=done)}),cleanup=fixture.effects[1]();
 const pending=fixture.submit();await fixture.submit();assert.equal(fixture.calls.length,1);cleanup();assert.equal(fixture.calls[0][1].signal.aborted,true);resolve({ok:true});await pending;assert.equal(fixture.success.length,0);
});
test('a server registration error is displayed without claiming success',async()=>{
 const fixture=formFixture({api:async()=>{throw Error('此邮箱不可用于注册');}});await fixture.submit();assert.ok(fixture.messages.includes('此邮箱不可用于注册'));assert.equal(fixture.success.length,0);
});
