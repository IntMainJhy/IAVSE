import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../next.config.mjs';

test('only bundled public assets receive the reusable cache policy',async()=>{
 const rules=(await config.headers()).filter(rule=>rule.headers.some(header=>header.key==='Cache-Control'));
 assert.deepEqual(rules.map(rule=>rule.source).sort(),['/brand/:path*','/fonts/:path*','/images/showcase/:path*','/media/designs/:path*','/media/home/:path*','/media/product/:path*','/models/:path*']);
 for(const rule of rules){
  const policy=rule.headers.find(header=>header.key==='Cache-Control').value;
  assert.equal(policy,'public, max-age=86400, stale-while-revalidate=604800');
  assert.doesNotMatch(policy,/immutable/);
 }
});
