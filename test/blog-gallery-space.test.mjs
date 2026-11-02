import test from 'node:test';
import assert from 'node:assert/strict';
import {gallerySpacePose} from '../src/lib/blog-gallery-space.mjs';

test('overview gives pages stable, distinct positions at different depths; focus comes forward',()=>{
 for(const [width,height] of [[1280,640],[700,520],[358,520]]){
  const poses=Array.from({length:5},(_,i)=>gallerySpacePose(i,5,width,height));
  assert.equal(new Set(poses.map(p=>p.z)).size,5);
  assert.ok(Math.max(...poses.map(p=>p.y))-Math.min(...poses.map(p=>p.y))>height*.5);
  assert.ok(poses.every(p=>p.scale<.6));
  for(let selected=0;selected<5;selected++){
   const focused=gallerySpacePose(selected,5,width,height,selected);
   assert.equal(focused.x,0);assert.equal(focused.ry,0);assert.ok(focused.scale>poses[selected].scale*1.5);
   for(let i=0;i<5;i++)if(i!==selected){const behind=gallerySpacePose(i,5,width,height,selected);assert.ok(behind.z<focused.z);assert.ok(behind.opacity<focused.opacity);}
   assert.deepEqual(gallerySpacePose(selected,5,width,height),poses[selected]);
  }
 }
});
test('single homepage starts small and can be inspected without a carousel',()=>{
 const initial=gallerySpacePose(0,1,1200,600);assert.equal(initial.x,0);assert.equal(initial.y,0);assert.ok(initial.scale<.6);
 assert.ok(gallerySpacePose(0,1,1200,600,0).scale>initial.scale);
});
