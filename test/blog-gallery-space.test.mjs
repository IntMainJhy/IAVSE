import test from 'node:test';
import assert from 'node:assert/strict';
import {gallerySpacePose,galleryCameraPose,gallerySceneMetrics,galleryViewDepth,galleryDepthExtent,galleryLoadOrder,galleryLimit} from '../src/lib/blog-gallery-space.mjs';

test('twelve equal-sized homepages occupy independent world positions with deep separation',()=>{
 assert.equal(galleryLimit,12);
 for(const [width,height] of [[1280,700],[700,680],[358,680]]){
  const poses=Array.from({length:12},(_,i)=>gallerySpacePose(i,12,width,height));
  assert.equal(new Set(poses.map(p=>[p.x,p.y,p.z].join(','))).size,12);
  assert.ok(Math.max(...poses.map(p=>p.z))-Math.min(...poses.map(p=>p.z))>1000);
  for(let selected=0;selected<12;selected++){
   const camera=galleryCameraPose(selected,12,width,height),page=gallerySpacePose(selected,12,width,height,selected),metrics=gallerySceneMetrics(width);
   assert.equal(page.x+camera.x,0);assert.equal(page.y+camera.y,0);
   assert.ok(Math.abs(galleryViewDepth(page,camera)-metrics.focusZ)<1e-8);
   assert.equal(page.ry,0);assert.ok(metrics.focusZ<metrics.perspective-220);
   for(let i=0;i<12;i++){const other=gallerySpacePose(i,12,width,height,selected);assert.equal(other.x,poses[i].x);assert.equal(other.y,poses[i].y);assert.equal(other.z,poses[i].z);}
  }
 }
});
test('viewpoint rotation produces depth-dependent parallax and reset restores the camera',()=>{
 const pose=gallerySpacePose(0,12,1280,700),rest=galleryCameraPose(-1,12,1280,700),turned=galleryCameraPose(-1,12,1280,700,16,5);
 assert.notEqual(galleryViewDepth(pose,turned),galleryViewDepth(pose,rest));
 assert.deepEqual(rest,{x:0,y:0,z:0,yaw:0,pitch:0});
});
test('load order prioritizes selected and near pages without dropping or duplicating pages',()=>{
 for(let count=1;count<=12;count++)for(let selected=-1;selected<count;selected++){
  const order=galleryLoadOrder(count,selected);assert.equal(order.length,count);assert.equal(new Set(order).size,count);if(selected>=0)assert.equal(order[0],selected);
 }
});

test('near-plane culling reserves space for the closest tilted corner',()=>{
 const camera={x:0,y:0,z:0,yaw:0,pitch:0};
 assert.equal(galleryDepthExtent({rx:0,ry:0,rz:0},camera,400),18);
 assert.ok(galleryDepthExtent({rx:0,ry:48,rz:0},camera,400)>160);
 for(let i=0;i<12;i++){const page=gallerySpacePose(i,12,1280,700,i),camera=galleryCameraPose(i,12,1280,700);assert.ok(galleryViewDepth(page,camera)+galleryDepthExtent(page,camera,400)<1000-300);}
});
