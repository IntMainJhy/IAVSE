'use client';

import Link from 'next/link';
import {useEffect,useId,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {gsap} from 'gsap';
import {Icon} from './Icons';
import '@/app/product-cinema.css';

type Variant='home'|'blogs'|'resources';
type Mode='film'|'space';
const duration=14;
const mediaByVariant:Record<Variant,string>={home:'iavse-creative-journey',blogs:'iavse-blog-journey',resources:'iavse-resource-journey'};
const clock=(seconds:number)=>`00:${Math.floor(seconds).toString().padStart(2,'0')}`;
const starts=[.2,4.8,9.4];
const text={
 zh:{titles:{home:'每个想法，都值得一个开始。',blogs:'让你的作品，拥有自己的空间。',resources:'好想法，需要好工具。'},bodies:{home:'找到设计的方向，用知识和工具付诸实践，再把创造分享给世界。',blogs:'从一张画布开始。安排作品、写下故事，让每个细节成为你的表达。',resources:'设计规范给你方向，文档帮你理解，Skill 与实用网站让下一步更轻松。'},film:'看短片',space:'探索 3D',play:'播放短片',pause:'暂停短片',replay:'重新播放',seek:'短片进度',rotate:'转动视角',reset:'重置视角',hint:'拖动探索空间，或选择一个章节。',touchHint:'左右拖动或使用滑杆转动，向下滑动继续浏览。',unavailable:'短片暂时无法播放，可以继续探索 3D 空间。',view:'进入探索',chapters:['设计的方向','实用的知识','自己的空间'],details:['从配色、字体到动效，找到适合项目的设计语言。','文档、Skill 和实用工具，把灵感变成具体的下一步。','把作品与经历放在一起，用自己的方式被看见。'],resourcesChapters:['UI 设计','文档与 Skill','网站与工具'],resourcesDetails:['带预览、来源与可复制规范的设计参考。','从操作方法到工作流，把好经验变成可复用的能力。','发现值得收藏的网站，让每一次探索都有收获。'],links:['浏览 UI 设计','探索文档与 Skill','发现博客空间'],resourceLinks:['浏览 UI 设计','探索文档与 Skill','发现网站与工具'],labels:['设计语言','文档 / SKILL','个人空间'],resourcesLabels:['设计语言','文档 / SKILL','实用工具'],designTitle:'清晰，本身就是风格。',docTitle:'把想法，变成方法。',spaceTitle:'你的名字。你的故事。',toolTitle:'好的工具，一起发现。',transcript:'短片内容',transcriptText:'设计方向、文档与 Skill、个人发布空间依次展开。从寻找灵感，到动手创造，再分享作品。短片没有声音。'},
 en:{titles:{home:'Every idea deserves a beginning.',blogs:'Your work. In its own space.',resources:'Good ideas deserve good tools.'},bodies:{home:'Find a direction. Build with thoughtful tools. Give what you create a place in the world.',blogs:'Begin with a canvas. Arrange your work, tell your story, and make every detail your own.',resources:'Design systems give you direction. Guides bring clarity. Skills and useful sites help you take the next step.'},film:'Watch the film',space:'Explore in 3D',play:'Play film',pause:'Pause film',replay:'Replay film',seek:'Film progress',rotate:'Rotate the view',reset:'Reset view',hint:'Drag to explore, or choose a chapter.',touchHint:'Drag sideways or use the slider to rotate. Scroll down to keep exploring.',unavailable:'The film is unavailable. You can still explore the 3D space.',view:'Explore',chapters:['Find a direction','Put ideas to work','Make it yours'],details:['Color, typography and motion. Find a visual language for your next project.','Documents, skills and useful tools turn inspiration into a clear next step.','Bring your work and experience together. Tell your story your way.'],resourcesChapters:['UI design','Guides & skills','Sites & tools'],resourcesDetails:['Design references with previews, sources and reusable specifications.','From practical guides to workflows, turn good ideas into repeatable capabilities.','Find useful websites worth keeping close. Make every discovery count.'],links:['Explore UI design','Explore guides & skills','Discover blog spaces'],resourceLinks:['Explore UI design','Explore guides & skills','Discover sites & tools'],labels:['DESIGN LANGUAGE','DOCUMENTS / SKILLS','YOUR SPACE'],resourcesLabels:['DESIGN LANGUAGE','DOCUMENTS / SKILLS','USEFUL TOOLS'],designTitle:'Less noise. More meaning.',docTitle:'From a thought to a method.',spaceTitle:'Your name. Your story.',toolTitle:'Good tools, found together.',transcript:'Film description',transcriptText:'A design direction, documents and skills, and a personal publishing space unfold in three chapters. Find inspiration, make something, and share your work. The film has no audio.'},
 ja:{titles:{home:'すべてのアイデアに、始まりを。',blogs:'あなたの作品に、あなたの空間を。',resources:'よいアイデアに、よい道具を。'},bodies:{home:'デザインの方向を見つけ、知識と道具で形にして、世界へ届けましょう。',blogs:'一枚のキャンバスから。作品を並べ、物語を書き、細部まで自分らしく。',resources:'デザイン仕様で方向を、ガイドで理解を。Skill と便利なサイトが次の一歩を助けます。'},film:'短編を見る',space:'3D で探索',play:'短編を再生',pause:'短編を停止',replay:'もう一度再生',seek:'再生位置',rotate:'視点を回転',reset:'視点を戻す',hint:'ドラッグするか、チャプターを選んで探索。',touchHint:'左右にドラッグ、またはスライダーで回転。下にスクロールして続きを見られます。',unavailable:'動画を再生できません。3D 空間は引き続き探索できます。',view:'探索する',chapters:['方向を見つける','知識を活かす','自分の空間へ'],details:['配色、書体、動き。次のプロジェクトに合う表現を見つけましょう。','ドキュメント、Skill、便利な道具で、ひらめきを具体的な一歩に。','作品と経験をひとつに。あなたらしい方法で物語を伝えましょう。'],resourcesChapters:['UI デザイン','ガイドと Skill','サイトと道具'],resourcesDetails:['プレビュー、出典、再利用できる仕様を備えたデザイン資料。','ガイドからワークフローまで、よい経験を繰り返し使える力に。','手元に置いておきたいサイトを発見。探索を成果につなげます。'],links:['UI デザインを見る','ガイドと Skill を見る','ブログ空間を見る'],resourceLinks:['UI デザインを見る','ガイドと Skill を見る','サイトと道具を見る'],labels:['デザイン言語','ガイド / SKILL','あなたの空間'],resourcesLabels:['デザイン言語','ガイド / SKILL','便利な道具'],designTitle:'明快さが、スタイルになる。',docTitle:'ひらめきを、方法に。',spaceTitle:'あなたの名前。あなたの物語。',toolTitle:'よい道具を、一緒に。',transcript:'動画の説明',transcriptText:'デザイン、ガイドと Skill、個人の発信空間が順番に展開します。ひらめきから制作、作品の共有までを描いた音声のない短編です。'}
};

const blogStory={
 zh:{chapters:['搭建画布','编排作品','预览与发布'],details:['从个人介绍开始，在画布上安排文字、图片与内容区块。','把作品和经历放到合适的位置，让浏览顺序讲清楚你的故事。','在桌面与手机视图中检查效果，准备好后再发布自己的主页。'],links:['开始搭建主页','编排我的作品','预览我的主页'],labels:['自由画布','作品编排','多端预览'],titles:['从空白，到自己的表达。','让作品成为主角。','准备好，再分享。'],transcript:'在公开画布示例中修改文字颜色，浏览三种示例主页，再对照桌面与手机的展示效果。短片没有声音。',parts:['个人介绍','图片','作品','经历'],preview:'桌面与手机',draft:'预览后发布'},
 en:{chapters:['Build a canvas','Arrange your work','Preview & publish'],details:['Start with an introduction. Arrange text, images and content blocks on your canvas.','Give your work and experience the space they need. Let the reading order tell your story.','Check desktop and mobile views. Publish your personal page when it is ready.'],links:['Start your page','Arrange your work','Preview your page'],labels:['YOUR CANVAS','YOUR WORK','RESPONSIVE PREVIEW'],titles:['A blank canvas. Your expression.','Put your work in focus.','Ready when you are.'],transcript:'Change text color in the public canvas demo, browse three example page styles, then compare desktop and mobile views. The film has no audio.',parts:['Introduction','Image','Projects','Experience'],preview:'Desktop & mobile',draft:'Preview, then publish'},
 ja:{chapters:['キャンバスを作る','作品を並べる','確認して公開'],details:['自己紹介から始め、文字、画像、コンテンツをキャンバスに配置します。','作品と経験を見やすく並べ、読む順番であなたの物語を伝えます。','パソコンとスマートフォンで表示を確認。準備ができたら公開しましょう。'],links:['ページを作る','作品を並べる','ページを確認する'],labels:['自由なキャンバス','作品の配置','表示を確認'],titles:['白紙から、自分らしく。','作品を、主役に。','準備できたら、届けよう。'],transcript:'公開キャンバスのデモで文字色を変更し、3 つのサンプルページを紹介。パソコンとスマートフォンの表示を比較する、音声のない短編です。',parts:['自己紹介','画像','作品','経験'],preview:'パソコンとスマートフォン',draft:'確認してから公開'}
};

/** A seekable film plus an independently usable CSS 3D product space. No scroll ownership. */
export function ProductCinema({locale,variant='home'}:{locale:string;variant?:Variant}){
 const language=locale.toLowerCase().startsWith('zh')?'zh':locale.toLowerCase().startsWith('ja')?'ja':'en';
 const c=text[language],id=useId();
 const root=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null),camera=useRef<HTMLDivElement>(null),orbit=useRef<HTMLDivElement>(null);
 const [mode,setMode]=useState<Mode>('film'),[chapter,setChapter]=useState(0),[loaded,setLoaded]=useState(false),[near,setNear]=useState(false),[visible,setVisible]=useState(false),[hidden,setHidden]=useState(true),[reduced,setReduced]=useState(true),[globalPaused,setGlobalPaused]=useState(false),[requested,setRequested]=useState(false),[paused,setPaused]=useState(false),[playing,setPlaying]=useState(false),[ended,setEnded]=useState(false),[failed,setFailed]=useState(false),[time,setTime]=useState(0),[rotation,setRotation]=useState(0);
 const pendingSeek=useRef<number|null>(null),progress=useRef(0),drag=useRef<{id:number;x:number;y:number;angle:number}|null>(null),lastAngle=useRef(0),orbitTo=useRef<((x:number,y:number)=>void)|null>(null);
 const resource=variant==='resources',blog=variant==='blogs',b=blogStory[language];
 const media='/media/product/'+mediaByVariant[variant],mediaVersion='?v=20261108-2';
 const chapters=blog?b.chapters:resource?c.resourcesChapters:c.chapters,details=blog?b.details:resource?c.resourcesDetails:c.details,links=blog?b.links:resource?c.resourceLinks:c.links,labels=blog?b.labels:resource?c.resourcesLabels:c.labels;
 const description=blog?b.transcript:resource?(language==='zh'?'先浏览设计参考与规范，再打开文档和 Skill，最后按分类发现实用网站。短片没有声音。':language==='ja'?'デザイン資料と仕様、ガイドと Skill、カテゴリー別の便利なサイトを順番に紹介する音声のない短編です。':'Browse design references and specifications, open guides and skills, then discover useful sites by category. The film has no audio.'):c.transcriptText;
 const destinations=blog?['/workspace/blog','/workspace/blog','/workspace/blog']:['/resources?type=designs','/resources?type=skills',resource?'/resources?type=resources':'/blogs'];
 const mayLoad=mode==='film'&&(requested||(near&&!reduced&&!globalPaused&&!hidden));
 const mayPlay=loaded&&mode==='film'&&visible&&!hidden&&!globalPaused&&!paused&&!ended&&(!reduced||requested)&&!failed;

 useEffect(()=>{
  const host=root.current;if(!host)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion=()=>{let saved=false;try{saved=localStorage.getItem('iavse-background-motion')==='reduce';}catch{}setReduced(preference.matches||saved);};
  const syncVisibility=()=>setHidden(document.hidden);
  const control=(event:Event)=>{const detail=(event as CustomEvent<{action:string;value?:boolean}>).detail;if(detail?.action==='reduced'){setReduced(preference.matches||Boolean(detail.value));setRequested(false);}if(detail?.action==='paused')setGlobalPaused(Boolean(detail.value));};
  syncMotion();syncVisibility();
  const nearby=new IntersectionObserver(entries=>setNear(entries[0].isIntersecting),{rootMargin:'240px 0px'});
  const onscreen=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting&&entries[0].intersectionRatio>.15),{threshold:[0,.15,.4]});
  nearby.observe(host);onscreen.observe(host);
  preference.addEventListener('change',syncMotion);document.addEventListener('visibilitychange',syncVisibility);window.addEventListener('iavse-scene-control',control);
  return()=>{nearby.disconnect();onscreen.disconnect();preference.removeEventListener('change',syncMotion);document.removeEventListener('visibilitychange',syncVisibility);window.removeEventListener('iavse-scene-control',control);};
 },[]);
 useEffect(()=>{if(mayLoad)setLoaded(true);},[mayLoad]);
 useEffect(()=>{const element=video.current;if(!element)return;let disposed=false;
  if(mayPlay){const play=element.play();play?.catch(()=>{if(!disposed)setPlaying(false);});}else element.pause();
  return()=>{disposed=true;element.pause();};
 },[mayPlay]);
 useEffect(()=>{
  const view=camera.current;if(!view||mode!=='space')return;
  const positions=[{x:165,rotationY:-18,rotationX:4},{x:0,rotationY:0,rotationX:0},{x:-165,rotationY:18,rotationX:4}];
  const tween=gsap.to(view,{...positions[chapter],duration:reduced||!visible||hidden?0:1.15,ease:'power3.inOut',overwrite:true});
  // Keep the current camera between rapid chapter changes; reverting here would snap it back.
  return()=>{tween.kill();};
 },[chapter,mode,reduced,visible,hidden]);
 useEffect(()=>{
  const target=orbit.current;if(!target||mode!=='space')return;
  const x=gsap.quickTo(target,'rotationY',{duration:reduced?0:.35,ease:'power2.out'}),y=gsap.quickTo(target,'rotationX',{duration:reduced?0:.35,ease:'power2.out'});
  orbitTo.current=(angle,tilt)=>{x(angle);y(tilt);};
  gsap.set(target,{rotationY:lastAngle.current,rotationX:0});
  return()=>{orbitTo.current=null;drag.current=null;x.tween.kill();y.tween.kill();gsap.set(target,{clearProps:'transform'});};
 },[mode,reduced]);
 useEffect(()=>{if(!visible||hidden){drag.current=null;orbitTo.current?.(lastAngle.current,0);}},[visible,hidden]);
 const seek=(value:number)=>{const next=Math.max(0,Math.min(duration,value));pendingSeek.current=next;setTime(next);setChapter(next>=8.6?2:next>=4.1?1:0);setEnded(false);const element=video.current;if(element&&element.readyState>=1){element.currentTime=next;pendingSeek.current=null;}};
 const select=(index:number)=>{setChapter(index);if(mode==='film'){setLoaded(true);setPaused(true);seek(starts[index]);}else{pendingSeek.current=starts[index];setTime(starts[index]);}};
 const togglePlayback=()=>{if(playing){setPaused(true);return;}if(ended)seek(0);setRequested(true);setPaused(false);setGlobalPaused(false);setLoaded(true);};
 const rotate=(angle:number)=>{const next=Math.max(-32,Math.min(32,angle));lastAngle.current=next;setRotation(next);orbitTo.current?.(next,0);};
 const beginDrag=(event:ReactPointerEvent<HTMLDivElement>)=>{if(event.button!==0||mode!=='space')return;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,angle:lastAngle.current};event.currentTarget.setPointerCapture(event.pointerId);};
 const moveDrag=(event:ReactPointerEvent<HTMLDivElement>)=>{const start=drag.current;if(!start||start.id!==event.pointerId)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(event.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12){drag.current=null;return;}const angle=Math.max(-32,Math.min(32,start.angle+dx*.13));lastAngle.current=angle;orbitTo.current?.(angle,Math.max(-9,Math.min(9,-dy*.045)));};
 const finishDrag=()=>{if(drag.current){drag.current=null;setRotation(lastAngle.current);orbitTo.current?.(lastAngle.current,0);}};
 const switchMode=(value:Mode)=>{if(value===mode)return;if(value==='space'){pendingSeek.current=video.current?.currentTime??time;video.current?.pause();setPlaying(false);}else setPaused(true);setMode(value);};

 return <section className="product-cinema" data-cinema-variant={variant} data-cinema-reduced={reduced} ref={root} aria-labelledby={id+'-title'}>
  <header className="product-cinema-heading"><h2 id={id+'-title'}>{c.titles[variant]}</h2><div className="product-cinema-intro"><p>{c.bodies[variant]}</p><div className="product-cinema-modes" role="group" aria-label={c.view}><button type="button" aria-pressed={mode==='film'} onClick={()=>switchMode('film')}><Icon name="play"/>{c.film}</button><button type="button" aria-pressed={mode==='space'} onClick={()=>switchMode('space')}><Icon name="layers"/>{c.space}</button></div></div></header>
  <div className="product-cinema-stage" data-mode={mode}>
   {mode==='film'?<div className="product-cinema-film"><div className="product-cinema-film-frame"><img src={media+'.webp'+mediaVersion} alt="" width={1280} height={720} loading="lazy" decoding="async"/>{loaded&&!failed&&<video ref={video} src={media+'.mp4'+mediaVersion} poster={media+'.webp'+mediaVersion} muted playsInline preload="metadata" aria-label={description} onLoadedMetadata={()=>{if(pendingSeek.current!==null&&video.current){video.current.currentTime=pendingSeek.current;pendingSeek.current=null;}}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>{setEnded(true);setPlaying(false);}} onError={()=>{setFailed(true);setPlaying(false);}} onTimeUpdate={()=>{const next=video.current?.currentTime||0;if(Math.abs(next-progress.current)<.18)return;progress.current=next;setTime(next);setChapter(next>=8.6?2:next>=4.1?1:0);}}/>}</div>{failed&&<p className="product-cinema-error" role="status">{c.unavailable}</p>}<div className="product-cinema-player"><button type="button" onClick={togglePlayback} disabled={failed} aria-label={playing?c.pause:ended?c.replay:c.play}><Icon name={playing?'pause':ended?'refresh':'play'}/></button><input type="range" min="0" max={duration} step=".1" value={time} aria-label={c.seek} aria-valuetext={`${Math.floor(time)} / ${duration}s`} onChange={event=>{setPaused(true);setRequested(true);setLoaded(true);seek(Number(event.target.value));}}/><span aria-hidden="true">{clock(time)} <span>/</span> {clock(duration)}</span></div></div>:
   <div className="product-cinema-spatial" onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
    <div className="product-cinema-world" aria-hidden="true"><div className="product-cinema-orbit" ref={orbit}><div className="product-cinema-camera" ref={camera}>
     {blog?<>
      <div className="product-cinema-plane cinema-design cinema-blog-canvas" data-selected={chapter===0}><div className="cinema-window-bar"><i/><i/><i/><span>CANVAS / IAVSE</span></div><div className="cinema-blog-body"><small>{labels[0]}</small><h3>{b.titles[0]}</h3><div className="cinema-canvas-layout"><div className="cinema-canvas-tools"><Icon name="cursor"/><Icon name="text"/><Icon name="image"/><Icon name="layers"/></div><div className="cinema-canvas-blocks"><div className="cinema-canvas-title">{b.parts[0]}<span/></div><div className="cinema-canvas-image"><Icon name="image"/>{b.parts[1]}</div><div className="cinema-canvas-project">{b.parts[2]}<i/><i/></div></div><Icon name="cursor"/></div></div></div>
      <div className="product-cinema-plane cinema-document cinema-blog-work" data-selected={chapter===1}><div className="cinema-window-bar"><i/><i/><i/><span>PORTFOLIO / IAVSE</span></div><div className="cinema-blog-body"><small>{labels[1]}</small><h3>{b.titles[1]}</h3><div className="cinema-work-preview"><img src="/media/blog-product/portfolio.webp" alt="" width={1280} height={900} loading="lazy" decoding="async"/></div><div className="cinema-work-sections"><span>{b.parts[2]}</span><span>{b.parts[3]}</span></div></div></div>
      <div className="product-cinema-plane cinema-space cinema-blog-publish" data-selected={chapter===2}><div className="cinema-window-bar"><i/><i/><i/><span>PREVIEW / IAVSE</span></div><div className="cinema-blog-body"><small>{labels[2]}</small><h3>{b.titles[2]}</h3><div className="cinema-device-pair"><div className="cinema-preview-desktop"><img src="/media/blog-product/portfolio.webp" alt="" width={1280} height={900} loading="lazy" decoding="async"/></div><div className="cinema-preview-phone"><img src="/media/blog-product/portfolio-mobile.webp" alt="" width={390} height={844} loading="lazy" decoding="async"/></div></div><div className="cinema-publish-label"><Icon name="eye"/><span>{b.draft}</span></div></div></div>
     </>:<>
      <div className="product-cinema-plane cinema-design" data-selected={chapter===0}><div className="cinema-window-bar"><i/><i/><i/><span>DESIGN / IAVSE</span></div><div className="cinema-design-body"><small>{labels[0]}</small><h3>{c.designTitle}</h3><div className="cinema-orb"/><div className="cinema-swatches"><i/><i/><i/><i/></div><span className="cinema-type-specimen">Aa</span></div></div>
      <div className="product-cinema-plane cinema-document" data-selected={chapter===1}><div className="cinema-window-bar"><i/><i/><i/><span>KNOWLEDGE / IAVSE</span></div><div className="cinema-document-body"><span className="cinema-file-icon"><Icon name="file"/></span><small>{labels[1]}</small><h3>{c.docTitle}</h3><div className="cinema-content-line"/><div className="cinema-content-line is-short"/><div className="cinema-code"><span>{'{'} design, build, refine {'}'}</span><span>→ your next idea</span></div><div className="cinema-skill-tag"><Icon name="layers"/><span>Skills</span></div></div></div>
      <div className="product-cinema-plane cinema-space" data-selected={chapter===2}><div className="cinema-window-bar"><i/><i/><i/><span>{resource?'TOOLS':'SPACE'} / IAVSE</span></div><div className="cinema-space-body"><small>{labels[2]}</small><h3>{resource?c.toolTitle:c.spaceTitle}</h3>{resource?<div className="cinema-tool-directory"><div className="cinema-tool-search"><Icon name="search"/><span>{c.resourcesChapters[2]}</span></div>{c.resourcesChapters.map((name,index)=><div className="cinema-tool-row" key={name}><Icon name={['grid','file','link'][index]}/><span>{name}</span><Icon name="arrow"/></div>)}</div>:<><div className="cinema-space-art"><span/><span/><span/></div><div className="cinema-content-line"/><div className="cinema-content-line is-short"/></>}</div></div>
     </>}
    </div></div></div>
    <div className="product-cinema-spatial-note"><Icon name="hand"/><span className="cinema-desktop-hint">{c.hint}</span><span className="cinema-touch-hint">{c.touchHint}</span></div>
   </div>}
  </div>
  <div className="product-cinema-navigation">
   <div className="product-cinema-chapters" role="group" aria-label={c.view}>{chapters.map((name,index)=><button key={name} type="button" aria-pressed={chapter===index} onClick={()=>select(index)}><span aria-hidden="true">0{index+1}</span><b>{name}</b><i aria-hidden="true"/></button>)}</div>
   {mode==='space'&&<div className="product-cinema-orbit-control"><input type="range" min="-32" max="32" value={rotation} step="1" onChange={event=>rotate(Number(event.target.value))} aria-label={c.rotate}/><button type="button" onClick={()=>rotate(0)} aria-label={c.reset}><Icon name="refresh"/></button></div>}
  </div>
  <div className="product-cinema-caption"><p>{details[chapter]}</p><Link href={destinations[chapter]}>{links[chapter]}<Icon name="arrow"/></Link></div>
  <details className="product-cinema-transcript"><summary>{c.transcript}</summary><p>{description}</p></details>
 </section>;
}
