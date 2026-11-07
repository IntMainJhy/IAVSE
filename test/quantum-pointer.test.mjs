import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/QuantumPointer.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function mount({reduced=false,embedded=false,path='/',galleryTop=null,scrollY=0}={}){
 const window=Object.assign(new EventTarget(),{scrollY,innerHeight:900}),gallery=galleryTop===null?null:{isConnected:true,documentTop:galleryTop,rectReads:0,getBoundingClientRect(){this.rectReads++;return{top:this.documentTop-window.scrollY};}},document=Object.assign(new EventTarget(),{hidden:false,querySelector:selector=>selector==='[data-home-background="gallery"]'?gallery:null,documentElement:Object.assign(new EventTarget(),{dataset:{},hasAttribute:()=>false})});
 window.self=window;window.top=embedded?{}:window;
 const fine=Object.assign(new EventTarget(),{matches:true}),preference=Object.assign(new EventTarget(),{matches:reduced});
 class Element{constructor(actionable=false,editing=false){this.actionable=actionable;this.editing=editing;this.disabled=false;}closest(selector){if(selector.includes('.blog-canvas-editor'))return this.editing===true||this.editing==='admin'&&selector.includes('[data-admin-layout=control-center]')||this.editing==='film'&&selector.includes('[data-blog-product-film]')||this.editing==='home-product'&&selector.includes('[data-home-product]')||this.editing==='gallery'&&selector.includes('[data-home-background="gallery"]')?this:null;return selector.startsWith('.v2-landing')?null:this.actionable?this:null;}matches(){return this.disabled;}getBoundingClientRect(){return{left:100,top:200,width:80,height:40};}}
 const surfaces=[0,1].map(()=>{const context={arcs:[],totalArcs:0,fills:0,clears:0,paths:0,moves:0,globalAlpha:1,scale(){},clearRect(){this.clears++;this.arcs=[];},beginPath(){this.paths++;},moveTo(){this.moves++;},arc(...args){this.arcs.push(args);this.totalArcs++;},fill(){this.fills++;}};return{style:{},width:0,height:0,getContext:()=>context,context};});
 const [canvas,wave]=surfaces,effects=[],refs=[],exports={},frames=new Map(),mathCalls={exp:0,hypot:0},math=Object.create(Math);let now=100,id=0,refIndex=0,effectIndex=0,scheduled=[],currentPath=path;
 for(const name of ['exp','hypot'])math[name]=(...args)=>{mathCalls[name]++;return Math[name](...args);};
 vm.runInNewContext(source,{exports,window,document,Element,Math:math,devicePixelRatio:2,matchMedia:q=>q.includes('any-hover')?fine:preference,localStorage:{getItem:()=>null},performance:{now:()=>now},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),require:name=>{
  if(name==='react')return{useEffect:(fn,deps)=>{const index=effectIndex++,previous=effects[index];if(!previous||deps.some((value,i)=>value!==previous.deps[i]))scheduled.push({index,fn,deps});},useRef:value=>{const index=refIndex++;return refs[index]??(refs[index]={current:index<2?surfaces[index]:value});}};
  if(name==='next/navigation')return{usePathname:()=>currentPath};
  if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};throw Error(name);
 }});
 const render=()=>{refIndex=effectIndex=0;scheduled=[];exports.QuantumPointer();for(const {index,fn,deps}of scheduled){effects[index]?.cleanup?.();effects[index]={deps,cleanup:fn()};}};
 render();const cleanup=()=>{effects.forEach(effect=>effect?.cleanup?.());};
 const step=(ms=16)=>{now+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));};
 const advance=ms=>{while(ms>0){const interval=Math.min(ms,16);step(interval);ms-=interval;}};
 const dispatch=(target,type,values)=>target.dispatchEvent(Object.assign(new Event(type),values));
 const move=(x=600,y=400,type='mouse',target)=>{const event=Object.assign(new Event('pointermove'),{clientX:x,clientY:y,pointerType:type});if(target)Object.defineProperty(event,'target',{value:target});window.dispatchEvent(event);};
 const button=new Element(true),editorButton=new Element(true,true),adminButton=new Element(true,'admin'),filmButton=new Element(true,'film'),homeProductButton=new Element(true,'home-product'),galleryButton=new Element(true,'gallery'),gallerySpace=new Element(false,'gallery');
 const click=(detail=1,target=button)=>{const event=new Event('click');Object.defineProperty(event,'target',{value:target});Object.assign(event,{button:0,detail,clientX:300,clientY:320});document.dispatchEvent(event);};
 const navigation=pending=>dispatch(window,'iavse-navigation-pending',{detail:{pending}});
 const navigate=next=>{currentPath=next;render();},scroll=value=>{window.scrollY=value;window.dispatchEvent(new Event('scroll'));};
 return{window,document,fine,preference,frames,canvas,wave,gallery,mathCalls,step,advance,move,click,button,editorButton,adminButton,filmButton,homeProductButton,galleryButton,gallerySpace,navigation,navigate,scroll,cleanup};
}
const extent=s=>Math.max(...s.wave.context.arcs.map(([x,y])=>Math.hypot(x-320,y-320)));
const gridDistance=value=>Math.abs(value-Math.round(value/18)*18);

test('all mouse movement retains the small bounded field, batches events, and stops at rest',()=>{
 const s=mount();assert.equal(s.frames.size,0);
 for(let i=0;i<20;i++)s.move(500+i,300);
 assert.equal(s.frames.size,1);s.step();assert.ok(s.canvas.context.arcs.length>50,'ordinary document space also receives the point field');
 assert.equal(s.canvas.width,360,'original 240px field with DPR bounded to 1.5');
 for(let i=0;i<120&&s.frames.size;i++)s.step();assert.equal(s.frames.size,0);assert.equal(s.canvas.context.arcs.length,0);
 assert.equal(s.wave.context.clears,0,'pointer-only frames never clear the wave canvas');assert.equal(s.wave.context.fills,0);
 s.cleanup();assert.equal(s.canvas.width,0);assert.equal(s.wave.width,0);
});

test('the real click wave pushes dots outwards without scaling or following the moving cursor',()=>{
 const s=mount();s.click();assert.equal(s.frames.size,1);s.step();const origin=s.wave.style.transform,first=extent(s);
 assert.equal(origin,'translate3d(-20px,0px,0)');assert.doesNotMatch(origin,/scale/);
 assert.ok(s.wave.context.arcs.some(([x,y])=>Math.hypot(gridDistance(x-20),gridDistance(y))>3),'dots actually leave the fixed 18px screen grid');
 s.move(1000,700);s.advance(270);assert.equal(s.wave.style.transform,origin);assert.ok(extent(s)>first+100,'the crest reaches a substantially larger radius');
 s.navigation(true);assert.equal(s.frames.size,1,'only the anchored wave remains after pointer suspension');s.click();assert.equal(s.frames.size,1,'a new click replaces the existing wave RAF');s.step();assert.ok(extent(s)<first+40,'the new pulse restarts near its origin');
 s.advance(743);assert.equal(s.frames.size,1,'the original wave remains alive through 759ms');s.step(1);assert.equal(s.frames.size,0);assert.equal(s.wave.style.opacity,'0');s.cleanup();
});

test('keyboard and reduced-motion feedback stay local, disabled controls and touch movement stay quiet',()=>{
 const s=mount({reduced:true});s.move();assert.equal(s.frames.size,0);s.click(0);s.step();
 assert.equal(s.wave.style.transform,'translate3d(-180px,-100px,0)');assert.ok(s.wave.context.arcs.length>0);assert.ok(extent(s)<65,'reduced feedback stays local to the focused control');
 assert.ok(s.wave.context.arcs.every(([x,y])=>Math.hypot(gridDistance(x-180),gridDistance(y-100))<.001),'reduced motion does not displace the dot grid');
 s.advance(163);assert.equal(s.frames.size,1,'quiet feedback retains its 180ms duration');s.step(1);assert.equal(s.frames.size,0);
 const fills=s.wave.context.fills;s.button.disabled=true;s.click();assert.equal(s.frames.size,0);assert.equal(s.wave.context.fills,fills);s.cleanup();
 const touch=mount();touch.move(300,400,'touch');assert.equal(touch.frames.size,0);assert.equal(touch.wave.context.clears,0);touch.cleanup();
});

test('navigation suspends the pointer while its click wave still travels, and cancellation permits fresh movement',()=>{
 const s=mount();s.move();s.step();s.navigation(true);assert.equal(s.frames.size,0);assert.equal(s.canvas.context.arcs.length,0);
 s.move();s.click();assert.equal(s.frames.size,1);s.step();const first=extent(s),pointerFills=s.canvas.context.fills;
 s.advance(270);assert.ok(extent(s)>first+100,'navigation cannot erase the original outward feedback');assert.equal(s.canvas.context.fills,pointerFills,'the pointer yields throughout navigation');
 s.navigation(false);s.step();assert.equal(s.canvas.context.fills,pointerFills,'arrival does not spontaneously wake a pointer');s.move();assert.equal(s.frames.size,2);s.step();assert.ok(s.canvas.context.arcs.length>50);s.cleanup();assert.equal(s.frames.size,0);
});

test('hidden documents cancel both effects and embedded previews allocate neither field nor wave',()=>{
 const s=mount();s.move();s.click();s.step();s.document.hidden=true;s.document.dispatchEvent(new Event('visibilitychange'));assert.equal(s.frames.size,0);assert.equal(s.wave.style.opacity,'0');assert.equal(s.wave.context.arcs.length,0);
 s.document.hidden=false;s.document.dispatchEvent(new Event('visibilitychange'));assert.equal(s.frames.size,0);s.cleanup();s.move();s.click();assert.equal(s.frames.size,0);assert.equal(s.canvas.width,0);assert.equal(s.wave.width,0);
 const embedded=mount({embedded:true});embedded.move();embedded.click();assert.equal(embedded.frames.size,0);assert.equal(embedded.canvas.width,0);assert.equal(embedded.wave.width,0);assert.equal(embedded.mathCalls.exp,0);
});

test('feedback paints synchronously and survives a route that blocks longer than the full wave duration',()=>{
 const s=mount();s.click();assert.ok(s.wave.context.fills>0,'acknowledge before any RAF or route commit');const first=extent(s);
 s.navigation(true);s.step(1200);assert.equal(s.wave.style.opacity,'1');assert.ok(s.wave.context.arcs.length>0);assert.ok(extent(s)>first,'the first delayed frame advances instead of discarding the wave');
 s.step(1200);assert.equal(s.frames.size,1,'a second busy frame cannot silently consume the rest either');s.advance(664);assert.equal(s.frames.size,0);s.cleanup();
});

test('a surviving wave changes ink when the dark homepage is replaced by a light route',()=>{
 const s=mount();const dark={closest:()=>true},light={closest:()=>null};s.document.querySelector=()=>dark;s.click();assert.equal(s.wave.context.fillStyle,'rgb(174,211,255)');
 s.document.querySelector=()=>light;s.navigation(true);s.step();assert.equal(s.wave.context.fillStyle,'rgb(62,124,210)');assert.ok(s.wave.context.arcs.length>0);s.cleanup();
});

test('batching reduces fill calls while preserving the original continuous 60Hz and 120Hz wave',t=>{
 // Per-dot fill counts recorded from the previous real-wave implementation using
 // these same click coordinates and display intervals, before batching.
 const previousFills={60:17686,120:35481};
 for(const fps of [60,120]){
  const s=mount();s.click();const exp=s.mathCalls.exp,hypot=s.mathCalls.hypot;let elapsed=0,frames=0,maxFills=0;
  while(s.frames.size&&frames<200){const before=s.wave.context.fills;s.step(1000/fps);elapsed+=1000/fps;frames++;const fills=s.wave.context.fills-before;maxFills=Math.max(maxFills,fills);assert.ok(fills<=16,'one frame submits at most sixteen wave fills');if(elapsed<760)assert.ok(s.frames.size,'every display interval keeps the continuous wave alive');}
  assert.ok(elapsed>=760&&elapsed<760+1000/fps+.001);assert.equal(frames,Math.ceil(760/(1000/fps)));assert.equal(s.mathCalls.exp,exp,'Gaussian samples are prepared before animation');assert.equal(s.mathCalls.hypot,hypot,'grid distances are prepared once per click');
  assert.ok(s.wave.context.fills<previousFills[fps]*.05,'batching removes at least 95% of per-dot fill submissions');assert.ok(Math.abs(s.wave.context.totalArcs-previousFills[fps])<previousFills[fps]*.02,'the full visible point field is retained');
  t.diagnostic(JSON.stringify({fps,frames,maxFillsPerFrame:maxFills,waveFills:s.wave.context.fills,previousPerDotFills:previousFills[fps],drawnDots:s.wave.context.totalArcs}));s.cleanup();
 }
});

test('continuous pointer movement retains every point while batching fills on all pages',t=>{
 const s=mount();let maxFills=0;
 for(let i=0;i<120;i++){const before=s.canvas.context.fills;s.move(500+i*2,300+i%18);s.step(1000/120);maxFills=Math.max(maxFills,s.canvas.context.fills-before);assert.ok(s.canvas.context.arcs.length>80);}
 assert.ok(maxFills<=16);assert.ok(s.canvas.context.fills<s.canvas.context.totalArcs*.15,'fewer fill submissions do not remove the moving point field');
 assert.equal(s.wave.context.clears,0);t.diagnostic(JSON.stringify({pointerFrames:120,pointPaths:s.canvas.context.totalArcs,batchedFills:s.canvas.context.fills,maxFillsPerFrame:maxFills}));s.cleanup();
});

test('workspaces and product previews stop site particles until the pointer leaves their region',()=>{
 for(const target of ['editorButton','adminButton','filmButton','homeProductButton','galleryButton','gallerySpace']){const s=mount();s.move();s.click();assert.equal(s.frames.size,2);
 s.move(400,300,'mouse',s[target]);assert.equal(s.frames.size,0);assert.equal(s.wave.style.opacity,'0');
 const fills=s.canvas.context.fills+s.wave.context.fills;
 for(let i=0;i<20;i++){s.move(400+i,300,'mouse',s[target]);s.click(i%2,s[target])}
 assert.equal(s.frames.size,0);assert.equal(s.canvas.context.fills+s.wave.context.fills,fills);
 s.move();s.click();assert.equal(s.frames.size,2,'pointer and click feedback resume outside the region');s.step();
 assert.ok(s.canvas.context.fills+s.wave.context.fills>fills,'ordinary page interactions paint again');s.cleanup();}
});

test('all community scenes stay quiet and cancel arriving waves while other reading routes retain feedback',()=>{
 for(const path of ['/community','/community/','/community/post-id','/community/members','/community/members/member-id']){
  const s=mount({path});s.move();s.click();s.click(0);s.navigation(true);s.navigation(false);s.fine.dispatchEvent(new Event('change'));s.step();
  assert.equal(s.frames.size,0,path);assert.equal(s.canvas.context.fills+s.wave.context.fills,0);
  s.navigate('/docs/connect');s.move();s.click();s.step();assert.ok(s.canvas.context.fills+s.wave.context.fills>0,'leaving community restores both original effects');
  s.navigate(path);assert.equal(s.frames.size,0);assert.equal(s.wave.style.opacity,'0');assert.equal(s.canvas.context.arcs.length+s.wave.context.arcs.length,0);
  const fills=s.canvas.context.fills+s.wave.context.fills;s.move();s.click();s.advance(1000);assert.equal(s.canvas.context.fills+s.wave.context.fills,fills,'a route commit clears every lingering RAF');
  s.navigate('/blogs');s.move();s.click();assert.equal(s.frames.size,2);s.cleanup();assert.equal(s.frames.size,0);
 }
});

test('the gallery scene clears header feedback on entry without reading layout during scroll or pointer movement',()=>{
 const s=mount({galleryTop:1800});assert.equal(s.gallery.rectReads,1);s.move();s.click();assert.equal(s.frames.size,2,'the original opening retains its feedback');
 s.scroll(901);assert.equal(s.frames.size,0,'the independent scene entering the viewport retires the header ring too');assert.equal(s.wave.style.opacity,'0');
 const fills=s.canvas.context.fills+s.wave.context.fills,reads=s.gallery.rectReads;
 for(let i=0;i<20;i++){s.move();s.click(i%2);s.scroll(1000+i*30);}
 assert.equal(s.frames.size,0);assert.equal(s.canvas.context.fills+s.wave.context.fills,fills);assert.equal(s.gallery.rectReads,reads,'ordinary scroll and pointer events use cached bounds');
 s.gallery.documentTop=3000;s.window.dispatchEvent(new Event('iavse-journey-layout'));assert.equal(s.gallery.rectReads,reads+1);s.move();s.click();assert.equal(s.frames.size,2,'content layout changes refresh the boundary');
 s.scroll(2200);assert.equal(s.frames.size,0);s.scroll(0);s.move();s.click();assert.equal(s.frames.size,2,'scrolling back to the opening restores the original feedback');
 s.cleanup();const after=s.gallery.rectReads;s.window.dispatchEvent(new Event('resize'));s.window.dispatchEvent(new Event('iavse-journey-layout'));s.scroll(2800);s.move();s.click();s.step();
 assert.equal(s.gallery.rectReads,after);assert.equal(s.frames.size,0,'unmount removes boundary listeners and pending frames');
});
