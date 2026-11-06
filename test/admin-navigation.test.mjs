import test from 'node:test';
import assert from 'node:assert/strict';
import {inlineAdminPath} from '../src/lib/admin-navigation.mjs';
const base='https://admin.example/admin';
test('community queues and shared reviews open as in-page control-center views',()=>{
 for(const section of ['','spaces','catalog','reviews','comments','reports','accounts','audit'])assert.deepEqual(inlineAdminPath('/admin/community'+(section?'/'+section:''),base),['community',...(section?[section]:[])]);
 assert.deepEqual(inlineAdminPath('/admin/catalog',base),['community','catalog']);
 assert.deepEqual(inlineAdminPath('/admin/community/comments/',base),['community','comments']);
});
test('the community overview can return to the same control center without capturing ordinary administration routes',()=>{
 assert.deepEqual(inlineAdminPath('/admin',base,['community','comments']),[]);
 for(const path of ['/admin','/admin/settings','/admin/articles/new','/admin/blog','/admin/community/unknown','/admin/community/reviews/extra'])assert.equal(inlineAdminPath(path,base),null);
});
test('external origins, public community links, downloads and query-bearing URLs keep their normal navigation',()=>{
 for(const href of ['https://outside.example/admin/community','/community','/download/item','javascript:alert(1)','/admin/community?filter=pending','/admin/community#help'])assert.equal(inlineAdminPath(href,base),null);
});
