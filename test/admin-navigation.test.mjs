import test from 'node:test';
import assert from 'node:assert/strict';
import {inlineAdminPath,adminLocation} from '../src/lib/admin-navigation.mjs';
const base='https://admin.example/admin';
test('community queues and shared reviews open as in-page control-center views',()=>{
 for(const section of ['','spaces','catalog','reviews','comments','reports','accounts','audit'])assert.deepEqual(inlineAdminPath('/admin/community'+(section?'/'+section:''),base),['community',...(section?[section]:[])]);
 assert.deepEqual(inlineAdminPath('/admin/catalog',base),['community','catalog']);
 assert.deepEqual(inlineAdminPath('/admin/community/comments/',base),['community','comments']);
});
test('the community overview can return to the same control center without capturing ordinary administration routes',()=>{
 assert.deepEqual(inlineAdminPath('/admin',base,['community','comments']),[]);
 for(const path of ['/admin/articles/new','/admin/blog','/admin/community/unknown','/admin/community/reviews/extra'])assert.equal(inlineAdminPath(path,base),null);
});
test('external origins, public community links, downloads and query-bearing URLs keep their normal navigation',()=>{
 for(const href of ['https://outside.example/admin/community','/community','/download/item','javascript:alert(1)','/admin/community?filter=pending','/admin/community#help'])assert.equal(inlineAdminPath(href,base),null);
});

test('all sidebar destinations switch in place, including returning to the address already in the browser',()=>{assert.deepEqual(inlineAdminPath('/admin',base),[]);for(const section of ['projects','articles','resources','files','taxonomy','settings','trash','logs'])assert.deepEqual(inlineAdminPath('/admin/'+section,base,['community','accounts']),[section]);});


test('workspace location restores selected views, editors and filters from the real URL',()=>{
 assert.deepEqual(adminLocation('/admin'),{path:[],query:{}});
 assert.deepEqual(adminLocation('/admin/articles/?page=2&q=React'),{path:['articles'],query:{page:'2',q:'React'}});
 assert.deepEqual(adminLocation('/admin/resources/edit/item-id'),{path:['resources','edit','item-id'],query:{}});
 assert.deepEqual(adminLocation('/admin/catalog?filter=pending'),{path:['community','catalog'],query:{filter:'pending'}});
 assert.equal(adminLocation('/administrator'),null);assert.equal(adminLocation('/admin/%ZZ'),null);
});
