import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/gallery-scheduler.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture(){
 const exports={},frames=new Map(),timers=new Map();let next=0;
 const document={hidden:false,documentElement:{hasAttribute:()=>false}};
 vm.runInNewContext(source,{exports,document,requestAnimationFrame:fn=>{frames.set(++next,fn);return next;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:(fn,delay)=>{assert.equal(delay,0);timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id)});
 const paint=()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());};
 const task=()=>{const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());};
 return{...exports,frames,timers,document,paint,task};
}

test('gallery document work yields through a paint and a later task before executing',()=>{
 const s=fixture();let calls=0;s.scheduleGalleryWork(()=>calls++);
 assert.equal(calls,0);assert.equal(s.frames.size,1);assert.equal(s.timers.size,0);
 s.paint();assert.equal(calls,0,'frame callbacks do not parse preview documents');assert.equal(s.timers.size,1);
 s.task();assert.equal(calls,1);assert.equal(s.frames.size+s.timers.size,0);
});

test('cancelling scheduled gallery work before or after the frame suppresses stale tasks',()=>{
 for(const painted of[false,true]){
  const s=fixture();let calls=0;const cancel=s.scheduleGalleryWork(()=>calls++);
  if(painted)s.paint();const late=[...s.frames.values(),...s.timers.values()];cancel();
  assert.equal(s.frames.size+s.timers.size,0);late.forEach(fn=>fn());s.task();assert.equal(calls,0,'already captured callbacks cannot revive unmounted work');cancel();
 }
});

test('a fast completion that schedules another preview cannot drain the queue in one paint',()=>{
 const s=fixture();let count=0;const work=()=>{if(++count<3)s.scheduleGalleryWork(work);};s.scheduleGalleryWork(work);
 for(let expected=1;expected<=3;expected++){s.paint();s.task();assert.equal(count,expected);s.task();assert.equal(count,expected);}
 assert.equal(s.frames.size+s.timers.size,0);
});
