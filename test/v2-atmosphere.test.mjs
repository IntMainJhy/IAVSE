import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {homePixelBudget} from '../src/lib/home-render-budget.ts';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/V2Atmosphere.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function mount({reduced=false,savedReduced=false,width=1400,height=900,loading=false,failed=false,animated=false,mode='home',reveal=false,journey=false,retireHero=false,cpuRenderMs=0,navigationPending=false}={}){
 let cpuClock=0;
 class Target extends EventTarget{
  listeners=new Set();attributes=new Set();hasAttribute(name){return this.attributes.has(name)}setAttribute(name){this.attributes.add(name)}removeAttribute(name){this.attributes.delete(name)}dataset={};style={getPropertyValue(name){return this[name]||''},setProperty(name,value){this[name]=value},removeProperty(name){delete this[name]}};
  addEventListener(name,fn,options){super.addEventListener(name,fn,options);this.listeners.add(name)}
  removeEventListener(name,fn){super.removeEventListener(name,fn);this.listeners.delete(name)}
  rectReads=0;getBoundingClientRect(){this.rectReads++;return{left:0,top:this.top||0,width,height}}
 }
 const preference=Object.assign(new Target(),{matches:reduced}),root=new Target(),host=new Target(),document=Object.assign(new Target(),{hidden:false,documentElement:root}),window=Object.assign(new Target(),{devicePixelRatio:3,matchMedia:()=>preference,localStorage:{getItem:()=>savedReduced?'reduce':'full'}});
 if(navigationPending)root.setAttribute('data-iavse-transition');
 const surface=new Target(),canvas=Object.assign(new Target(),{parentElement:surface,closest:selector=>['.v2-home','.v2-site'].includes(selector)?host:null});
 const panel=Object.assign(new Target(),{dataset:{glassReveal:'stage'},getBoundingClientRect:()=>({left:100,top:500,right:1100,bottom:860,width:1000,height:360})});
 const sections=[{id:'blog',top:1800,height:1260,side:'left'},{id:'editor',top:3300,height:1260,side:'right'}].map(item=>Object.assign(new Target(),{dataset:{homeStory:item.id,homeSide:item.side},documentTop:item.top,sectionHeight:item.height,getBoundingClientRect(){this.rectReads++;const top=this.documentTop-(window.scrollY||0);return{left:0,top,bottom:top+this.sectionHeight,width,height:this.sectionHeight};}}));
 if(journey)window.scrollY=0;
 host.querySelectorAll=selector=>selector.includes('data-home-story')?(journey?sections:[]):reveal?[panel]:[];
 host.getAttribute=key=>key==='data-journey-motion'?host.dataset.journeyMotion:null;
 host.querySelector=selector=>{assert.equal(selector,'.home-stories');return host.track||null;};
 const draws=[],sizes=[],reveals=[],journeys=[];let releases=0,createCalls=0,resolve,reject,signal,opticalLive=animated;
 const adapter={get animated(){return opticalLive},get interactive(){return retireHero?opticalLive:undefined},resize:(...args)=>sizes.push(args),setReveals:value=>reveals.push(value),render:(...args)=>{draws.push(args);cpuClock+=cpuRenderMs;if(retireHero)opticalLive=args[3]<1.3||!!reveals.at(-1)?.length;},dispose:()=>releases++};
 if(journey)adapter.setJourney=value=>journeys.push(JSON.parse(JSON.stringify(value)));
 let resize,intersection,theme,now=0,id=0;const frames=new Map();
 class Resize{constructor(fn){this.fn=fn;this.targets=new Set();resize=this}observe(target){this.targets.add(target)}disconnect(){this.disconnected=true;this.targets.clear()}}
 class Intersection{constructor(fn){this.fn=fn;intersection=this}observe(){}disconnect(){this.disconnected=true}set(value){this.fn([{isIntersecting:value}])}}
 class Mutation{constructor(fn){this.fn=fn;theme=this}observe(){}disconnect(){this.disconnected=true}}
 const exports={};
 vm.runInNewContext(source,{exports,window,document,AbortController,Math,performance:{now:()=>cpuClock},ResizeObserver:Resize,IntersectionObserver:Intersection,MutationObserver:Mutation,requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:key=>frames.delete(key),require:name=>{
  if(name==='react')return{useEffect(){},useRef(){}};
  if(name==='react/jsx-runtime')return{jsx(){}};
  if(name==='@/lib/home-render-budget')return{homePixelBudget};
  throw Error('Unexpected dependency '+name);
 }});
 const cleanup=exports.mountV2Atmosphere(canvas,(_,abortSignal)=>{
  createCalls++;signal=abortSignal;
  if(failed)return Promise.reject(Error('Model or WebGL unavailable'));
  return loading?new Promise((a,b)=>{resolve=a;reject=b}):Promise.resolve(adapter);
 },{mode});
 const step=(ms=35)=>{now+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now))};
 const move=(x=width,y=height,pointerType='mouse')=>host.dispatchEvent(Object.assign(new Event('pointermove'),{clientX:x,clientY:y,pointerType}));
 return{canvas,surface,host,panel,sections,window,document,root,preference,get resize(){return resize},intersection,theme,frames,draws,sizes,reveals,journeys,cleanup,step,move,get signal(){return signal},get createCalls(){return createCalls},adapter,get releases(){return releases},resolve:()=>resolve(adapter),reject:()=>reject(Error('Load failed'))};
}
const flush=async()=>{await Promise.resolve();await Promise.resolve()};
const navigation=(s,pending)=>s.window.dispatchEvent(Object.assign(new Event('iavse-navigation-pending'),{detail:{pending}}));

test('occlusion-length callback gaps are not mistaken for sustained GPU overload',async()=>{
 const s=mount({animated:true});s.intersection.set(true);await flush();s.step(16);const density=s.sizes.at(-1)[2];
 for(let i=0;i<100;i++)s.step(1000);
 assert.equal(s.sizes.at(-1)[2],density,'browser throttling must not permanently lower visible image quality');assert.equal(s.canvas.dataset.glassQuality,undefined);s.cleanup();
});

test('pending homepage navigation retains its last frame and suppresses every rendering wakeup until released',async()=>{
 const s=mount({animated:true});s.intersection.set(true);await flush();s.step(16);const before=s.draws.length,time=s.draws.at(-1)[5],sizes=s.sizes.length,bounds=s.canvas.rectReads;
 navigation(s,true);assert.equal(s.frames.size,0);assert.equal(s.canvas.style.opacity,'1');
 s.move();s.host.top=-1800;s.window.dispatchEvent(new Event('scroll'));s.resize.fn();s.root.dataset.colorMode='dark';s.theme.fn();s.window.dispatchEvent(new Event('afterprint'));s.intersection.set(true);s.document.dispatchEvent(new Event('visibilitychange'));s.step(10000);
 assert.equal(s.draws.length,before);assert.equal(s.sizes.length,sizes);assert.equal(s.canvas.rectReads,bounds,'pending resize does not read or reallocate the old render target');assert.equal(s.frames.size,0);
 navigation(s,false);assert.equal(s.draws.length,before,'release does not synchronously draw during the route commit');assert.equal(s.frames.size,1);s.step(16);
 assert.equal(s.draws.length,before+1);assert.ok(s.canvas.rectReads>bounds);assert.equal(s.draws.at(-1)[2],true);assert.equal(s.draws.at(-1)[3],2);assert.ok(s.draws.at(-1)[5]-time<.02,'navigation wait time is not replayed');
 navigation(s,true);s.cleanup();const count=s.draws.length;navigation(s,false);s.step();assert.equal(s.draws.length,count);assert.equal(s.releases,1);assert.equal(s.frames.size,0);assert.equal(s.window.listeners.size,0);
});

test('temporary navigation suspension preserves manual pause and reduced-motion preferences',async()=>{
 const paused=mount({animated:true});paused.intersection.set(true);await flush();paused.step(16);paused.window.dispatchEvent(Object.assign(new Event('iavse-scene-control'),{detail:{action:'paused',value:true}}));const time=paused.draws.at(-1)[5];navigation(paused,true);paused.step(5000);navigation(paused,false);paused.step(16);assert.equal(paused.draws.at(-1)[5],time);assert.equal(paused.frames.size,0,'navigation completion cannot override manual pause');paused.cleanup();
 const reduced=mount({animated:true});reduced.intersection.set(true);await flush();navigation(reduced,true);const before=reduced.draws.length;reduced.window.dispatchEvent(Object.assign(new Event('iavse-scene-control'),{detail:{action:'reduced',value:true}}));reduced.preference.dispatchEvent(Object.assign(new Event('change'),{matches:false}));assert.equal(reduced.draws.length,before);navigation(reduced,false);reduced.step(16);assert.equal(reduced.draws.at(-1)[4],true);assert.equal(reduced.frames.size,0);reduced.cleanup();
});

test('a scene prepared during navigation waits for a free frame and interior rendering remains independent',async()=>{
 const s=mount({animated:true,loading:true});s.intersection.set(true);navigation(s,true);s.resolve();await flush();assert.equal(s.draws.length,0);assert.equal(s.sizes.length,0);assert.equal(s.frames.size,0);navigation(s,false);s.step(16);assert.equal(s.draws.length,1);assert.equal(s.sizes.length,1);s.cleanup();
 const interior=mount({animated:true,mode:'interior'});interior.intersection.set(true);await flush();navigation(interior,true);assert.equal(interior.frames.size,1);interior.step(16);assert.ok(interior.draws.length>1);interior.cleanup();
});

test('homepage mounted mid-transition defers its scene until the root handoff releases',async()=>{
 const s=mount({animated:true,navigationPending:true});s.intersection.set(true);await flush();
 assert.equal(s.createCalls,0);assert.equal(s.frames.size,0);assert.equal(s.draws.length,0);
 navigation(s,false);assert.equal(s.createCalls,0,'stale page cleanup cannot release the root transition');
 s.root.removeAttribute('data-iavse-transition');navigation(s,false);await flush();
 assert.equal(s.createCalls,1);assert.equal(s.draws.length,1);assert.equal(s.frames.size,1);
 navigation(s,false);assert.equal(s.createCalls,1,'completion is idempotent');s.cleanup();assert.equal(s.signal.aborted,true);assert.equal(s.releases,1);
});

test('abandoning a deferred homepage never starts GPU work and leaves no event listeners',async()=>{
 const s=mount({navigationPending:true});s.intersection.set(true);s.cleanup();s.root.removeAttribute('data-iavse-transition');navigation(s,false);await flush();
 assert.equal(s.createCalls,0);assert.equal(s.draws.length,0);assert.equal(s.releases,0);assert.equal(s.frames.size,0);
 assert.equal(s.host.listeners.size+s.canvas.listeners.size+s.document.listeners.size+s.window.listeners.size,0);
});

test('an in-flight scene remains paused through a newer transition and is disposed once if abandoned',async()=>{
 const s=mount({loading:true,animated:true});s.intersection.set(true);navigation(s,true);s.root.setAttribute('data-iavse-transition');navigation(s,false);s.resolve();await flush();
 assert.equal(s.createCalls,1);assert.equal(s.draws.length,0);assert.equal(s.sizes.length,0);assert.equal(s.frames.size,0);
 s.cleanup();s.root.removeAttribute('data-iavse-transition');navigation(s,false);assert.equal(s.releases,1);assert.equal(s.signal.aborted,true);assert.equal(s.draws.length,0);
 const interior=mount({navigationPending:true,mode:'interior'});interior.intersection.set(true);await flush();assert.equal(interior.createCalls,1);assert.equal(interior.draws.length,1);interior.cleanup();
});

test('glass follows every display frame with damping, bounds resolution, and stops when idle or outside the viewport',async()=>{
 const s=mount();s.intersection.set(true);await flush();
 assert.ok(1400*900*s.sizes.at(-1)[2]**2<=8000001);assert.equal(s.draws.length,1);assert.equal(s.frames.size,0,'no continuous idle GPU loop');
 s.move();s.step(16);assert.ok(s.draws.at(-1)[0]>0&&s.draws.at(-1)[0]<1,'smooth rather than instant camera motion');
 const first=s.draws.length;s.step(1000/144);assert.equal(s.draws.length,first+1,'144Hz pointer movement is not skipped by a 30fps ceiling');
 for(let i=0;i<100;i++)s.step();assert.equal(s.frames.size,0,'settled camera sleeps');
 s.host.dispatchEvent(new Event('pointerleave'));assert.equal(s.frames.size,1);
 s.intersection.set(false);assert.equal(s.frames.size,0);
 const offscreen=s.draws.length;s.move(0,0);s.theme.fn();assert.equal(s.draws.length,offscreen);
 s.intersection.set(true);assert.equal(s.frames.size,1);
 s.document.hidden=true;s.document.dispatchEvent(new Event('visibilitychange'));assert.equal(s.frames.size,0);
 s.document.hidden=false;s.document.dispatchEvent(new Event('visibilitychange'));assert.equal(s.frames.size,1);
 s.window.dispatchEvent(new Event('beforeprint'));assert.equal(s.frames.size,0);
 s.window.dispatchEvent(new Event('afterprint'));assert.equal(s.frames.size,1);
 s.root.dataset.colorMode='dark';s.theme.fn();assert.equal(s.draws.at(-1)[2],true);
 s.cleanup();assert.equal(s.releases,1);assert.equal(s.signal.aborted,true);assert.equal(s.frames.size,0);
 assert.ok(s.resize.disconnected&&s.intersection.disconnected&&s.theme.disconnected);
 assert.equal(s.host.listeners.size+s.canvas.listeners.size+s.document.listeners.size+s.window.listeners.size+s.preference.listeners.size,0);
});

test('touch and reduced motion keep the glass static, including preference changes during movement',async()=>{
 const s=mount({reduced:true,width:390,height:844});s.intersection.set(true);await flush();
 assert.deepEqual(s.sizes.at(-1),[390,844,2]);assert.equal(s.draws.length,1);s.move();assert.equal(s.frames.size,0);
 s.preference.matches=false;s.preference.dispatchEvent(new Event('change'));s.move(390,844,'touch');assert.equal(s.frames.size,0);
 s.move();s.step();assert.ok(s.draws.at(-1)[0]>0);
 s.preference.matches=true;s.preference.dispatchEvent(new Event('change'));
 assert.deepEqual(s.draws.at(-1),[0,0,false,0,true]);assert.equal(s.frames.size,0);s.cleanup();
});

test('scrolling below the hero redraws the same viewport canvas and coalesces scroll events, including reduced motion',async()=>{
 const s=mount({reduced:true});s.intersection.set(true);await flush();
 s.host.top=-1800;for(let i=0;i<12;i++)s.window.dispatchEvent(new Event('scroll'));
 assert.equal(s.frames.size,1,'scroll events share one pending frame');
 const before=s.draws.length;s.step();assert.equal(s.draws.length,before+1);
 assert.deepEqual(s.draws.at(-1),[0,0,false,2,true],'reading colors update without enabling spatial motion');
 assert.equal(s.frames.size,0);assert.deepEqual(s.sizes.at(-1).slice(0,2),[1400,900],'GPU target stays viewport-sized');
 s.window.dispatchEvent(new Event('scroll'));s.step(1000/144);assert.equal(s.draws.length,before+2,'a fresh scroll update paints on the next high-refresh callback');s.step(19);assert.equal(s.draws.length,before+2,'static reduced-motion content sleeps again after the update');
 s.intersection.set(false);s.host.top=-2700;s.window.dispatchEvent(new Event('scroll'));s.step();assert.equal(s.draws.length,before+2);
 s.intersection.set(true);assert.equal(s.draws.at(-1)[3],3);s.cleanup();assert.equal(s.window.listeners.size,0);
});

test('visible optical motion follows 60/120/144Hz callbacks without changing animation speed',async()=>{
 for(const hz of[60,120,144]){
  const s=mount({animated:true});s.intersection.set(true);await flush();const start=s.draws.length;
  for(let i=0;i<hz*2;i++)s.step(1000/hz);
  assert.equal(s.draws.length-start,hz*2,'every visible callback renders at '+hz+'Hz');
  assert.ok(Math.abs(s.draws.at(-1)[5]-2)<.02,'active seconds remain wall-clock based at '+hz+'Hz');
  s.cleanup();assert.equal(s.frames.size,0);
 }
});

test('sustained missed frames or expensive submissions adapt pixels rather than skipping high-refresh callbacks',async()=>{
 const s=mount({animated:true,width:2560,height:1440});s.intersection.set(true);await flush();
 assert.ok(2560*1440*s.sizes.at(-1)[2]**2<=8000001,'large displays retain a high-resolution total pixel budget');
 const start=s.draws.length;for(let i=0;i<600;i++){s.window.dispatchEvent(new Event('scroll'));s.step(1000/60);}
 assert.equal(s.draws.length-start,600,'display callbacks are never discarded by a software frame ceiling');
 const before=s.draws.at(-1)[5],dpr=s.sizes.at(-1)[2];for(let i=0;i<30;i++){s.window.dispatchEvent(new Event('scroll'));s.step(100);}
 assert.ok(s.draws.at(-1)[5]-before>2.8,'visible animation time does not slow to half speed when frames are late');
 assert.ok(s.sizes.at(-1)[2]<dpr&&s.sizes.at(-1)[2]>=dpr*.72,'sustained late frames use a bounded reduction that preserves fine edges');
 const sizes=s.sizes.length;s.resize.fn();assert.equal(s.sizes.length,sizes,'unchanged bounds do not rebuild render targets');s.cleanup();
 const costly=mount({animated:true,cpuRenderMs:10});costly.intersection.set(true);await flush();const initial=costly.sizes.at(-1)[2],beforeFrames=costly.draws.length;
 for(let i=0;i<60;i++)costly.step(1000/144);
 assert.equal(costly.draws.length-beforeFrames,60);assert.ok(costly.sizes.at(-1)[2]<initial,'render work exceeding the observed display budget lowers pixel cost');costly.cleanup();
});

test('observed 120/144Hz displays adapt pixels when sustained callbacks miss every other refresh',async()=>{
 for(const hz of[120,144]){
  const s=mount({animated:true});s.intersection.set(true);await flush();const initialDpr=s.sizes.at(-1)[2];
  for(let index=0;index<60;index++)s.step(1000/hz);
  assert.equal(s.sizes.at(-1)[2],initialDpr,'healthy high-refresh callbacks preserve optical resolution');
  const before=s.draws.length;
  for(let index=0;index<48;index++)s.step(2000/hz);
  assert.equal(s.draws.length-before,48,'every late callback still renders instead of imposing another frame cap');
  assert.ok(s.sizes.at(-1)[2]<initialDpr,'sustained missed high-refresh intervals reduce GPU pixels even below 25ms');s.cleanup();
 }
});

test('one short callback does not misclassify display cadence and sustained headroom restores clarity',async()=>{
 const s=mount({animated:true});s.intersection.set(true);await flush();const full=s.sizes.at(-1)[2];
 for(let i=0;i<60;i++)s.step(1000/60);s.step(1);for(let i=0;i<90;i++)s.step(1000/60);
 assert.equal(s.sizes.at(-1)[2],full,'a scheduling outlier cannot permanently lower resolution');
 for(let i=0;i<36;i++)s.step(100);const reduced=s.sizes.at(-1)[2];assert.ok(reduced<full);
 for(let i=0;i<600;i++)s.step(1000/60);assert.ok(s.sizes.at(-1)[2]>reduced,'healthy rendering recovers quality with hysteresis');assert.ok(s.sizes.at(-1)[2]<=full);s.cleanup();
});

test('load failures, context loss and unmount during a late load preserve the CSS fallback and release resources',async()=>{
 const failed=mount({failed:true});await flush();assert.equal(failed.canvas.dataset.atmosphere,'fallback');assert.equal(failed.host.listeners.size,0);failed.cleanup();
 const pending=mount({loading:true});pending.cleanup();assert.equal(pending.signal.aborted,true);pending.resolve();await flush();assert.equal(pending.releases,1);assert.equal(pending.draws.length,0);
 const lost=mount();lost.intersection.set(true);await flush();lost.move();
 lost.canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));assert.equal(lost.frames.size,0);assert.equal(lost.canvas.style.opacity,'0');assert.equal(lost.canvas.dataset.atmosphere,'fallback');
 lost.cleanup();assert.equal(lost.releases,1);
});

test('the optical studio keeps light motion active while visible and retains an opaque rendered backdrop throughout reading',async()=>{
 const s=mount({animated:true});s.intersection.set(true);await flush();assert.equal(s.draws.at(-1)[5],0);assert.equal(s.frames.size,1);
 s.step();s.step();const time=s.draws.at(-1)[5];assert.ok(time>0);assert.equal(s.frames.size,1,'visible strip-light reflections have a continuing clock');
 s.host.top=-2700;s.window.dispatchEvent(new Event('scroll'));s.step();assert.equal(s.canvas.style.opacity,'1','reading sections retain the optical scene');assert.equal(s.draws.at(-1)[3],3);
 for(const [pause,resume] of[
  [()=>{s.document.hidden=true;s.document.dispatchEvent(new Event('visibilitychange'));},()=>{s.document.hidden=false;s.document.dispatchEvent(new Event('visibilitychange'));}],
  [()=>s.intersection.set(false),()=>s.intersection.set(true)],
  [()=>s.window.dispatchEvent(new Event('beforeprint')),()=>s.window.dispatchEvent(new Event('afterprint'))]
 ]){const before=s.draws.at(-1)[5];pause();assert.equal(s.frames.size,0);s.step(60000);resume();assert.equal(s.draws.at(-1)[5],before,'inactive time is not replayed');s.step();assert.ok(s.draws.at(-1)[5]-before<=.05);}
 s.preference.matches=true;s.preference.dispatchEvent(new Event('change'));assert.equal(s.frames.size,0);const frozen=s.draws.at(-1)[5];s.step(10000);s.theme.fn();s.resize.fn();assert.equal(s.draws.at(-1)[5],frozen);s.cleanup();assert.equal(s.releases,1);
});

test('interior routes keep their independent page-scroll phase without any header promotion API',async()=>{
 const s=mount({mode:'interior'});s.intersection.set(true);await flush();assert.equal(s.draws.at(-1)[3],1.05);s.host.top=0;s.window.scrollY=1800;s.window.dispatchEvent(new Event('scroll'));s.step();assert.equal(s.draws.at(-1)[3],3.05);assert.equal(s.surface.dataset.glassOverlay,undefined);s.cleanup();
});

test('retired hero glass stops continuous work, paints scroll on demand and resumes its clock on return',async()=>{
 const s=mount({animated:true,retireHero:true});s.intersection.set(true);await flush();s.step(1000/144);s.step(1000/144);
 const time=s.draws.at(-1)[5];assert.ok(time>0);assert.equal(s.frames.size,1);
 s.host.top=-1800;s.window.dispatchEvent(new Event('scroll'));s.step(1000/144);const departedTime=s.draws.at(-1)[5];assert.equal(s.frames.size,0,'the empty studio cannot keep an idle ticker');
 const count=s.draws.length;s.move();s.step(1000/144);assert.equal(s.draws.length,count,'pointer movement over reading content does not render invisible glass');
 s.host.top=-2700;s.window.dispatchEvent(new Event('scroll'));s.step(1000/144);assert.equal(s.draws.length,count+1);assert.equal(s.draws.at(-1)[3],3);assert.equal(s.draws.at(-1)[5],departedTime,'dormant draws preserve the active clock instead of resetting the optical phase');assert.equal(s.frames.size,0);
 s.host.top=0;s.window.dispatchEvent(new Event('scroll'));s.step(1000/144);assert.equal(s.draws.at(-1)[5],departedTime);assert.equal(s.frames.size,1);
 const before=s.draws.length;s.step(1000/144);assert.equal(s.draws.length,before+1);assert.ok(s.draws.at(-1)[5]>departedTime);assert.equal(s.surface.dataset.glassOverlay,undefined);s.cleanup();
});

test('resize observes only the optical surface and never measures or tracks navigation layout',async()=>{
 for(const [width,height]of[[390,844],[2048,1055]]){
  const s=mount({width,height});s.intersection.set(true);await flush();assert.equal(s.canvas.dataset.atmosphere,'paused');assert.deepEqual([...s.resize.targets],[s.surface]);
  s.resize.fn();assert.ok(s.draws.length>0,'resizing succeeds without requesting header geometry');assert.equal(s.canvas.dataset.atmosphere,'paused');s.cleanup();
 }
});

test('a reduced-motion change event overrides a stale media-query getter and clears reveal motion',async()=>{
 const s=mount({animated:true,reveal:true});s.intersection.set(true);await flush();s.host.top=-1800;s.window.dispatchEvent(new Event('scroll'));s.step();
 s.preference.dispatchEvent(Object.assign(new Event('change'),{matches:true}));assert.equal(s.preference.matches,false,'the regression keeps the old getter stale');assert.equal(s.draws.at(-1)[4],true);assert.equal(s.frames.size,0);assert.equal(s.panel.dataset.glassMotion,undefined);s.move();s.step();assert.equal(s.frames.size,0,'pointer input cannot restart the reduced-motion loop');
 s.preference.dispatchEvent(Object.assign(new Event('change'),{matches:false}));assert.equal(s.panel.dataset.glassMotion,'active');assert.equal(s.frames.size,1);s.cleanup();
});

test('section reveals coalesce into rendered frames and release every semantic style on failure or reduced motion',async()=>{
 const s=mount({reveal:true});s.intersection.set(true);await flush();assert.equal(s.panel.dataset.glassMotion,'active');assert.ok(Number(s.panel.style['--glass-reveal'])>0&&Number(s.panel.style['--glass-reveal'])<1);assert.equal(s.reveals.at(-1).length,1);const measured=s.reveals.length;
 for(let i=0;i<12;i++)s.window.dispatchEvent(new Event('scroll'));assert.equal(s.reveals.length,measured,'events do not repeatedly deform or remeasure the glass');s.step();assert.equal(s.reveals.length,measured+1);
 s.preference.matches=true;s.preference.dispatchEvent(new Event('change'));assert.equal(s.panel.dataset.glassMotion,undefined);assert.equal(s.panel.style['--glass-reveal'],undefined);assert.equal(s.reveals.at(-1).length,0);s.preference.matches=false;s.preference.dispatchEvent(new Event('change'));assert.equal(s.panel.dataset.glassMotion,'active');s.canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));assert.equal(s.panel.dataset.glassMotion,undefined);assert.equal(s.panel.style['--glass-lift'],undefined);assert.equal(s.panel.style['--glass-tilt'],undefined);assert.equal(s.reveals.at(-1).length,0);s.cleanup();
});


test('background controls pause only its clock, preserve scroll updates, and replay without remounting',async()=>{
 const s=mount({animated:true});s.intersection.set(true);await flush();s.step(100);const time=s.draws.at(-1)[5];assert.ok(time>0);
 const control=(action,value)=>s.window.dispatchEvent(Object.assign(new Event('iavse-scene-control'),{detail:{action,value}}));
 control('paused',true);s.step(16);assert.equal(s.frames.size,0);const before=s.draws.length;s.step(2000);assert.equal(s.draws.length,before);
 s.host.top=-450;s.window.dispatchEvent(new Event('scroll'));s.step(16);assert.equal(s.draws.at(-1)[3],.5);assert.equal(s.draws.at(-1)[5],time,'manual pause retains time during scrolling');
 control('replay');assert.equal(s.draws.at(-1)[5],0);assert.equal(s.releases,0,'replay keeps the current scene and editor state');
 control('paused',false);assert.equal(s.frames.size,1);s.step(30);assert.ok(s.draws.at(-1)[5]>0);s.cleanup();
 const count=s.draws.length;control('replay');assert.equal(s.draws.length,count,'controls are detached on unmount');
});

test('manual reduced background motion composes with the system preference',async()=>{
 const s=mount({animated:true});s.intersection.set(true);await flush();
 const control=value=>s.window.dispatchEvent(Object.assign(new Event('iavse-scene-control'),{detail:{action:'reduced',value}}));
 control(true);s.step(16);assert.equal(s.draws.at(-1)[4],true);assert.equal(s.frames.size,0);
 s.preference.matches=false;s.preference.dispatchEvent(Object.assign(new Event('change'),{matches:false}));assert.equal(s.draws.at(-1)[4],true,'manual preference remains enabled');
 s.preference.matches=true;control(false);assert.equal(s.draws.at(-1)[4],true,'manual setting cannot override system reduction');
 s.preference.matches=false;s.preference.dispatchEvent(Object.assign(new Event('change'),{matches:false}));assert.equal(s.draws.at(-1)[4],false);assert.equal(s.frames.size,1);s.cleanup();
});

test('saved reduction applies before controls mount and manual changes preserve a system event',async()=>{
 const s=mount({animated:true,savedReduced:true});s.intersection.set(true);await flush();
 assert.equal(s.draws.at(-1)[4],true,'initial render reads the persisted preference without a control event');assert.equal(s.frames.size,0);
 s.preference.dispatchEvent(Object.assign(new Event('change'),{matches:true}));
 s.window.dispatchEvent(Object.assign(new Event('iavse-scene-control'),{detail:{action:'reduced',value:false}}));s.step(16);
 assert.equal(s.preference.matches,false,'media getter stays stale for this regression');assert.equal(s.draws.at(-1)[4],true,'manual full motion cannot erase the system event');assert.equal(s.frames.size,0);s.cleanup();
});

test('cinematic chapter geometry is cached across scroll frames and refreshed only after layout changes',async()=>{
 const s=mount({animated:true,journey:true});s.intersection.set(true);await flush();
 assert.deepEqual(s.journeys.at(-1),[{id:'blog',start:2,end:3.4,side:-1},{id:'editor',start:3300/900,end:4560/900,side:1}]);
 assert.ok(s.resize.targets.has(s.host),'chapter layout changes are observed as well as viewport size');
 const reads=()=>s.host.rectReads+s.canvas.rectReads+s.sections.reduce((sum,section)=>sum+section.rectReads,0),before=reads(),count=s.journeys.length;
 for(let i=1;i<=30;i++){s.window.scrollY=i*60;s.host.top=-s.window.scrollY;s.window.dispatchEvent(new Event('scroll'));s.step(1000/60);}
 assert.equal(reads(),before,'scroll frames use cached section geometry instead of reading layout');assert.equal(s.journeys.length,count);assert.equal(s.draws.at(-1)[3],2);
 s.sections[1].documentTop+=180;for(let i=0;i<12;i++)s.window.dispatchEvent(new Event('iavse-journey-layout'));s.step();
 assert.equal(s.journeys.length,count+1,'layout events share one cache rebuild');assert.equal(s.journeys.at(-1)[1].start,3480/900);
 const refreshed=reads();s.host.dispatchEvent(new Event('load'));s.step();assert.ok(reads()>refreshed,'loaded images can invalidate cached geometry');
 s.cleanup();const after=reads();s.window.dispatchEvent(new Event('iavse-journey-layout'));s.host.dispatchEvent(new Event('load'));s.step();assert.equal(reads(),after,'late events cannot measure a disposed scene');
});


test('sticky film chapters have distinct virtual anchors even while their DOM panels overlap',async()=>{
 const s=mount({journey:true});s.host.dataset.journeyMotion='cinema';s.host.track={getBoundingClientRect:()=>({top:1800,height:4500})};
 s.sections[1].documentTop=1800;s.intersection.set(true);await flush();
 assert.deepEqual(s.journeys.at(-1),[{id:'blog',start:2,end:5,side:-1},{id:'editor',start:4,end:7,side:1}]);
 const initial=s.journeys.length;s.window.scrollY=2000;s.window.dispatchEvent(new Event('scroll'));s.step();assert.equal(s.journeys.length,initial,'normal scroll keeps the cached virtual map');s.cleanup();
});
