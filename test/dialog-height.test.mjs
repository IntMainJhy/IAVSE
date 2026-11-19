import test from 'node:test';
import assert from 'node:assert/strict';
import {observeDialogHeight} from '../src/lib/dialog-height.mjs';

function fixture({reduced=false}={}){
 const listeners=new Map(),mediaListeners=new Map(),animations=[];
 let resize,disconnected=false,visual=null;
 const motion={matches:reduced,addEventListener:(name,fn)=>mediaListeners.set(name,fn),removeEventListener:name=>mediaListeners.delete(name)};
 const view={innerHeight:900,matchMedia:()=>motion,getComputedStyle:element=>({height:visual===null?element.style.height:visual+'px'}),addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name),ResizeObserver:class{constructor(fn){resize=fn;}observe(){}disconnect(){disconnected=true;}}};
 const element={ownerDocument:{defaultView:view},style:{height:''},animate:(frames,options)=>{const animation={frames,options,canceled:false,cancel(){this.canceled=true;visual=null;}};animations.push(animation);return animation;}},content={offsetHeight:400};
 const cleanup=observeDialogHeight(element,content);
 return{element,content,animations,motion,listeners,mediaListeners,resize:()=>resize(),view,cleanup,get disconnected(){return disconnected;},set visual(value){visual=value;}};
}
test('content is measured naturally and only subsequent height changes animate',()=>{
 const f=fixture();assert.equal(f.element.style.height,'400px');assert.equal(f.animations.length,0);
 f.content.offsetHeight=650;f.resize();assert.deepEqual(f.animations[0].frames,[{height:'400px'},{height:'650px'}]);assert.equal(f.element.style.height,'650px');
 f.animations[0].onfinish();assert.equal(f.animations[0].canceled,true);f.cleanup();
});
test('quick reversals continue from the visible height and cancel the older transition',()=>{
 const f=fixture();f.content.offsetHeight=650;f.resize();f.visual=515;f.content.offsetHeight=400;f.resize();assert.equal(f.animations[0].canceled,true);assert.deepEqual(f.animations[1].frames,[{height:'515px'},{height:'400px'}]);f.cleanup();
});
test('long registration documents stay within the viewport and shrinking the viewport cancels motion',()=>{
 const f=fixture();f.content.offsetHeight=1500;f.resize();assert.equal(f.element.style.height,'868px');
 f.view.innerHeight=600;f.listeners.get('resize')();assert.equal(f.element.style.height,'568px');assert.equal(f.animations[0].canceled,true);f.cleanup();
});
test('reduced motion stays immediate and responds to a changed system preference',()=>{
 const f=fixture({reduced:true});f.content.offsetHeight=650;f.resize();assert.equal(f.animations.length,0);assert.equal(f.element.style.height,'650px');
 f.motion.matches=false;f.content.offsetHeight=400;f.resize();assert.equal(f.animations.length,1);f.motion.matches=true;f.mediaListeners.get('change')();assert.equal(f.animations[0].canceled,true);f.cleanup();
});
test('closing restores automatic height and releases observers, listeners and animation',()=>{
 const f=fixture();f.content.offsetHeight=650;f.resize();f.cleanup();assert.equal(f.element.style.height,'');assert.equal(f.disconnected,true);assert.equal(f.listeners.size,0);assert.equal(f.mediaListeners.size,0);assert.equal(f.animations[0].canceled,true);
});
