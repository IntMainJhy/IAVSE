import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../..');
const publicMedia=path.join(repo,'public/media');
const css=await readFile(path.join(here,'films/shared.css'),'utf8');
const assets={
 'optical.webp':path.join(publicMedia,'designs/iavse-optical-glass.webp'),
 'gallery.webp':path.join(publicMedia,'designs/iavse-spatial-gallery.webp'),
 'creator.webp':path.join(publicMedia,'home/creator-home.webp'),
 'creator-mobile.webp':path.join(publicMedia,'home/creator-home-mobile.webp'),
 'portfolio.webp':path.join(publicMedia,'blog-product/portfolio.webp'),
 'portfolio-mobile.webp':path.join(publicMedia,'blog-product/portfolio-mobile.webp'),
 'resume.webp':path.join(publicMedia,'blog-product/resume.webp'),
 'editorial.webp':path.join(publicMedia,'blog-product/editorial.webp'),
 'designs.webp':path.join(here,'assets/captures/designs.webp'),
 'skills.webp':path.join(here,'assets/captures/skills.webp'),
 'tools.webp':path.join(here,'assets/captures/tools.webp'),
 'canvas.webp':path.join(here,'assets/captures/canvas.webp'),
 'canvas-color.webp':path.join(here,'assets/captures/canvas-color.webp'),
 'skill-design.webp':path.join(here,'assets/captures/skill-design.webp'),
 'skill-engineering.webp':path.join(here,'assets/captures/skill-engineering.webp'),
 'gsap.min.js':path.join(repo,'node_modules/gsap/dist/gsap.min.js'),
};
const movement={
 home:`
tl.fromTo('.home-art .art-main',{x:105,y:28,opacity:0},{x:0,y:0,opacity:1,duration:1.1,ease:'power3.out'},.15)
 .fromTo('.home-art .art-type',{y:70,opacity:0},{y:0,opacity:1,duration:.9,ease:'power3.out'},.65)
 .fromTo('.home-art .art-strip',{x:50,y:30,opacity:0},{x:0,y:0,opacity:1,duration:.9,ease:'power3.out'},1.15)
 .fromTo('.home-two .screen',{y:90,scale:.95,opacity:0},{y:0,scale:1,opacity:1,duration:1.05,ease:'power3.out'},4.35)
 .fromTo('.home-two .screen img',{y:0},{y:-175,duration:2.1,ease:'power2.inOut'},5.65)
 .fromTo('.home-three .screen',{x:110,opacity:0},{x:0,opacity:1,duration:1.05,ease:'power3.out'},8.85)
 .fromTo('.home-three .phone',{x:80,y:45,opacity:0},{x:0,y:0,opacity:1,duration:.9,ease:'power3.out'},9.6)
 .fromTo('.home-three .screen img',{y:0},{y:-82,duration:1.7,ease:'power2.inOut'},10.7)
 .fromTo('.home-three .wordmark',{opacity:0,y:12},{opacity:1,y:0,duration:.55},11.55);`,
 blogs:`
tl.fromTo('.blog-one .screen',{y:90,scale:.96,opacity:0},{y:0,scale:1,opacity:1,duration:1.15,ease:'power3.out'},.2)
 .fromTo('.blog-one .frame-note',{opacity:0},{opacity:1,duration:.6},1.2)
 .fromTo('.canvas-pointer',{x:45,y:50,opacity:0},{x:0,y:0,opacity:1,duration:.65,ease:'power2.inOut'},1.25)
 .to('.canvas-pointer',{scale:.85,duration:.12},1.95)
 .fromTo('.canvas-after',{opacity:0},{opacity:1,duration:.12},2.07)
 .to('.canvas-pointer',{scale:1,duration:.15},2.07)
 .to('.canvas-pointer',{opacity:0,duration:.2},2.8)
 .fromTo('.blog-triptych .screen',{y:80,opacity:0},{y:0,opacity:1,stagger:.24,duration:.95,ease:'power3.out'},4.35)
 .fromTo('.style-labels span',{y:10,opacity:0},{y:0,opacity:1,stagger:.16,duration:.5},5.3)
 .fromTo('.blog-triptych .screen img',{y:0},{y:-38,duration:1.3,stagger:.2,ease:'power2.inOut'},6.35)
 .fromTo('.blog-three .screen',{scale:.86,y:70,opacity:0},{scale:1,y:0,opacity:1,duration:1.05,ease:'power3.out'},8.85)
 .fromTo('.blog-three .phone',{x:70,y:35,opacity:0},{x:0,y:0,opacity:1,duration:.95,ease:'power3.out'},9.85)
 .fromTo('.blog-three .phone img',{y:0},{y:-100,duration:1.6,ease:'power2.inOut'},10.85)
 .fromTo('.blog-three .wordmark',{opacity:0,y:12},{opacity:1,y:0,duration:.55},11.5);`,
 resources:`
tl.fromTo('.resources-one .screen',{x:180,opacity:0},{x:0,opacity:1,duration:1.15,ease:'power3.out'},.2)
 .fromTo('.index-rail span',{opacity:0,y:10},{opacity:1,y:0,stagger:.15,duration:.5},1.2)
 .fromTo('.resources-two .skill-design',{x:100,opacity:0},{x:0,opacity:1,duration:.95,ease:'power3.out'},4.35)
 .fromTo('.resources-two .skill-engineering',{x:100,opacity:0},{x:0,opacity:1,duration:.95,ease:'power3.out'},5.55)
 .fromTo('.resources-three .screen',{y:100,opacity:0},{y:0,opacity:1,duration:1.1,ease:'power3.out'},8.85)
 .fromTo('.resources-three .screen img',{y:0},{y:-155,duration:2.2,ease:'power2.inOut'},10.2);`
};
for(const variant of ['home','blogs','resources']){
 const markup=await readFile(path.join(here,'films',variant+'.html'),'utf8');
 const html=`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1280,height=720"><title>IAVSE ${variant} film</title><script src="assets/prepared/gsap.min.js"></script><style>${css}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="14" data-width="1280" data-height="720">${markup.replaceAll('src="assets/','src="assets/prepared/').replaceAll('<img ','<img data-layout-allow-overflow ')}</div><script>
window.__timelines=window.__timelines||{};
const tl=gsap.timeline({paused:true});
const scenes=document.querySelectorAll('.scene-inner');
scenes.forEach((scene,index)=>{const start=[0,4.1,8.6][index];if(index)tl.fromTo(scene,{opacity:0},{opacity:1,duration:.45,ease:'power2.inOut'},start);tl.fromTo(scene.querySelector('.headline'),{y:22,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out'},start+.12);if(index<2)tl.to(scene,{opacity:0,duration:.45,ease:'power2.inOut'},[4.1,8.6][index]);});
${movement[variant]}
tl.to({}, {duration:.1},13.9);window.__timelines.main=tl;
</script></body></html>`;
 const target=path.join(here,'.generated',variant);
 await mkdir(path.join(target,'assets/prepared'),{recursive:true});
 await writeFile(path.join(target,'index.html'),html);
 await copyFile(path.join(here,'assets/DM-Sans.woff2'),path.join(target,'assets/DM-Sans.woff2'));
 await copyFile(path.join(here,'hyperframes.json'),path.join(target,'hyperframes.json'));
 const used=new Set([...html.matchAll(/src="assets\/prepared\/([^"/]+)"/g)].map(match=>match[1]));
 await Promise.all([...used].map(name=>copyFile(assets[name],path.join(target,'assets/prepared',name))));
 if(variant==='home'){
  await mkdir(path.join(here,'assets/prepared'),{recursive:true});
  await writeFile(path.join(here,'index.html'),html);
  await Promise.all([...used].map(name=>copyFile(assets[name],path.join(here,'assets/prepared',name))));
 }
 console.log(target);
}
