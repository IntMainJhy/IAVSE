import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';

const read=name=>fs.readFileSync(new URL('../src/app/'+name,import.meta.url),'utf8');
const specificity=selector=>[(selector.match(/#[\w-]+/g)||[]).length,(selector.match(/\.[\w-]+|\[[^\]]+\]/g)||[]).length,(selector.match(/(?:^|[\s>+~])[a-z][\w-]*/gi)||[]).length];
const compare=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];return 0;};
// These receivers use simple selectors. Check their actual parsed declarations,
// specificity and media conditions with the legacy sheets appended last.
function winner(files,receiver,property,width,height){let result=null,order=0;
 for(const file of files)postcss.parse(read(file)).walkRules(rule=>{
  for(let parent=rule.parent;parent;parent=parent.parent)if(parent.type==='atrule'&&parent.name==='media'){
   if(/print|prefers-reduced-motion/.test(parent.params))return;
   for(const match of parent.params.matchAll(/(min|max)-(width|height):\s*(\d+)px/g)){const actual=match[2]==='width'?width:height;if(match[1]==='min'?actual<Number(match[3]):actual>Number(match[3]))return;}
  }
  for(const selector of rule.selectors.filter(value=>typeof receiver==='function'?receiver(value):value.endsWith(receiver)))rule.walkDecls(declaration=>{
   let value=declaration.value;if(property==='padding-top'&&declaration.prop==='padding')value=value.split(/\s+/)[0];else if(declaration.prop!==property)return;
   const rank=[declaration.important?1:0,...specificity(selector),order++];if(!result||compare(rank,result.rank)>0)result={value,rank};
  });
 });return result?.value;
}

test('final homepage typography and opening geometry survive legacy styles loaded after client navigation',()=>{
 const legacy=['gallery-backgrounds.css','glass-studio.css','iavse-home.css','home-product-showcase.css'];
 for(const files of [[...legacy,'iavse-platform.css'],['iavse-platform.css',...legacy],['glass-studio.css','iavse-platform.css','gallery-backgrounds.css','iavse-home.css']])for(const [width,height]of[[1440,1000],[900,1000],[390,844]]){
  const mobile=width<=767,label=files.join(' → ')+' @ '+width;
  assert.equal(winner(files,'.v2-hero-copy h1','font-size',width,height),mobile?'clamp(21px,5.4vw,26px)':'clamp(26px,2.25vw,32px)',label);
  assert.equal(winner(files,'.v2-hero-copy h1','font-weight',width,height),'400',label);
  assert.equal(winner(files,'.v2-hero-copy h1','line-height',width,height),mobile?'1.4':'1.34',label);
  assert.equal(winner(files,'.v2-hero-copy h1','max-width',width,height),mobile?'100%':'700px',label);
  assert.equal(winner(files,'.v2-hero-intro','min-height',width,height),'100svh',label);
  assert.equal(winner(files,'.v2-hero-intro','padding-top',width,height),mobile?'104px':'112px',label);
  assert.equal(winner(files,'.v2-hero-intro','align-items',width,height),'center',label);
 }
});

test('homepage overrides own the real landing root without raising shared interior selectors',()=>{
 const root=postcss.parse(read('iavse-platform.css'));
 root.walkRules(rule=>{for(const selector of rule.selectors)if(/\.(?:v2-home|home-scene-nav|v2-invitation|iavse-cinema)/.test(selector))assert.ok(selector.startsWith('html[data-ui][data-color-mode] .v2-site.v2-landing '),selector);});
 assert.ok(read('iavse-platform.css').includes('html[data-ui][data-color-mode] .v2-site .organic-header-inner{'));
});

test('the creator avatar keeps its intended dimensions before and after community styles load',()=>{
 const home=['member-avatars.css','v2.css','glass-studio.css','iavse-home.css','iavse-platform.css'];
 const avatar=selector=>selector.endsWith('.v2-stage-profile .feed-avatar')||['.feed-avatar','html[data-ui] .feed-avatar','html[data-ui] .organic-site .feed-avatar'].includes(selector);
 const image=selector=>selector.endsWith('.v2-stage-profile .feed-avatar>img')||selector==='html[data-ui] .organic-site .feed-avatar img';
 for(const files of [home,[...home,'community-feed.css'],['community-feed.css',...home],['member-avatars.css','v2.css','community-feed.css',...home.slice(2)]])for(const [width,height]of[[1440,1000],[900,1000],[390,844],[320,640]]){
  const size=width<=767?'48px':'56px',label=files.join(' → ')+' @ '+width;
  assert.equal(winner(files,avatar,'display',width,height),'inline-flex',label+' never leaves the avatar as an unsized inline span');
  for(const property of ['width','height','flex-basis'])assert.equal(winner(files,avatar,property,width,height),size,label);
  assert.equal(winner(files,avatar,'align-items',width,height),'center',label);assert.equal(winner(files,avatar,'justify-content',width,height),'center',label);assert.equal(winner(files,avatar,'line-height',width,height),'1',label);
  assert.equal(winner(files,avatar,'margin-bottom',width,height),'12px',label);
  assert.equal(winner(files,image,'display',width,height),'block',label);assert.equal(winner(files,image,'width',width,height),'100%',label);assert.equal(winner(files,image,'height',width,height),'100%',label);assert.equal(winner(files,image,'object-fit',width,height),'cover',label+' contains a tall source portrait within the avatar');
 }
});

test('product showcase geometry and readable copy survive late legacy and editor styles at every breakpoint',()=>{
 const legacy=['home-showcase.css','home-blog-canvas-demo.css','glass-studio.css','iavse-home.css','iavse-platform.css'],product='home-product-showcase.css',background='gallery-backgrounds.css';
 // Match the selectors that can receive these concrete elements, including
 // their older generic class names. Discovery-only rules cannot match blog.
 const receives=(endings,exclude)=>selector=>endings.some(ending=>selector.endsWith(ending))&&!exclude?.test(selector);
 const container=receives(['.home-stories','.home-product']);
 const primary=receives(['.home-story','.home-story.is-reverse','.home-story-primary']);
 const primaryCopy=receives(['.home-story-copy','.home-story.is-reverse>.home-story-copy','.home-story-primary>.home-story-copy'],/home-story-discovery/);
 const primaryVisual=receives(['.home-story-visual','.home-story.is-reverse>.home-story-visual','.home-story-primary>.home-story-visual'],/home-story-discovery/);
 const editor=receives(['.home-story-visual','.home-story-visual.home-story-editor','.home-story-editor'],/home-story-discovery/);
 const blog=receives(['.home-story-visual','.home-identity-stage'],/home-story-discovery|is-reverse/);
 const paragraph=receives(['.home-story-copy p'],/home-story-discovery/);
 for(const files of [[...legacy,product,background],[background,product,...legacy],['home-showcase.css',product,background,...legacy.slice(1)]])for(const [width,height]of[[1440,1000],[900,1000],[390,844],[320,640]]){
  const mobile=width<=767,tablet=width<=1000,label=files.join(' → ')+' @ '+width;
  assert.equal(winner(files,container,'gap',width,height),mobile?'64px':tablet?'80px':'104px',label);
  assert.equal(winner(files,primary,'display',width,height),mobile?'flex':'grid',label);
  assert.equal(winner(files,primary,'gap',width,height),mobile?'24px':'28px 64px',label);
  assert.equal(winner(files,primaryCopy,'display',width,height),mobile?'block':'grid',label);
  assert.equal(winner(files,primaryCopy,'grid-column',width,height),'1/-1',label);
  assert.equal(winner(files,primaryVisual,'grid-column',width,height),'1/-1',label+' keeps the editor wide despite its legacy reverse class');
  assert.equal(winner(files,primaryVisual,'grid-row',width,height),'auto',label);
  assert.equal(winner(files,blog,'height',width,height),width<360?'340px':mobile?'400px':tablet?'540px':'600px',label);
  assert.equal(winner(files,editor,'height',width,height),'auto',label+' lets the larger editor window determine height');
  assert.equal(winner(files,'.home-editor-window','height',width,height),mobile?'500px':tablet?'540px':'560px',label);
  assert.equal(winner(files,paragraph,'overflow',width,height),'visible',label);
  assert.equal(winner(files,paragraph,'-webkit-line-clamp',width,height),'unset',label+' never truncates explanatory copy');
  assert.equal(winner(files,'.hbd-stage','overflow',width,height),'hidden',label+' passes wheel scrolling to the page');
  assert.equal(winner(files,'.hbd-stage','overscroll-behavior',width,height),'auto',label);
 }
});

test('spatial canvases remain decorative layers without changing content geometry or interactive transforms',()=>{
 const css=read('gallery-backgrounds.css'),root=postcss.parse(css),home='.home-gallery-background',paper='[data-reading-background=paper]';
 assert.doesNotMatch(css,/url\s*\(/i,'the spatial background uses a rendered canvas rather than an image');
 root.walkRules(rule=>{for(const selector of rule.selectors){
  assert.ok(selector.startsWith('html:root[data-ui][data-color-mode] body .organic-site.v2-site')||selector.startsWith('.spatial-backdrop'),selector);
  assert.ok(selector.includes(home)||selector.includes(paper)||selector.startsWith('.spatial-backdrop'),selector+' has an explicit background boundary');
  assert.doesNotMatch(selector,/v2-hero|home-cinema|creator-stage|v2-home-atmosphere|hbd-node|home-resource-(?:canvas|sculpture)/,'background styles do not reach optical or interactive renderers');
  assert.ok(!selector.includes(home+'::'),'the home scene belongs to a real canvas surface');
  rule.walkDecls(decl=>{
   if(!selector.includes('.spatial-backdrop'))assert.doesNotMatch(decl.prop,/^(?:transform|translate|scale|rotate|scroll-timeline(?:-.+)?)$/,'background styles never overwrite interactive content transforms');
   if(decl.prop==='background-attachment')assert.notEqual(decl.value,'fixed');
   if(selector.includes(home)&&!selector.includes('.spatial-backdrop')&&!selector.includes('::'))assert.doesNotMatch(decl.prop,/^(?:height|min-height|max-height|width|max-width|overflow(?:-.+)?|contain|grid(?:-.+)?|flex(?:-.+)?|gap)$/,'the scene wrapper adds no dimensions or clipping to its content');
   if(selector.includes(paper)&&!selector.includes('::')&&/\.(?:feed-|community-)/.test(selector))assert.doesNotMatch(decl.prop,/^(?:display|position|inset|top|right|bottom|left|height|min-height|max-height|width|min-width|max-width|margin(?:-.+)?|padding(?:-.+)?|overflow(?:-.+)?|grid(?:-.+)?|flex(?:-.+)?|gap)$/,'community backgrounds preserve the existing navigation and feed layout');
  });
 }});
 for(const [width,height]of[[1440,1000],[390,844]]){
  const files=['gallery-backgrounds.css','glass-studio.css','iavse-home.css','iavse-platform.css','home-showcase.css','home-product-showcase.css'],galleryScene=home+'>.spatial-backdrop',communityScene=paper+'>.spatial-backdrop';
  assert.equal(winner(files,home,'position',width,height),'relative');assert.equal(winner(files,home,'isolation',width,height),'isolate');assert.equal(winner(files,home,'display',width,height),'flow-root');
  assert.equal(winner(files,galleryScene,'position',width,height),'sticky');assert.equal(winner(files,galleryScene,'pointer-events',width,height),'none');assert.equal(winner(files,galleryScene,'height',width,height),'100svh');assert.equal(winner(files,galleryScene,'margin-bottom',width,height),'-100svh','the decorative scene has no net height in the document flow');
  assert.equal(winner(files,communityScene,'position',width,height),'fixed');assert.equal(winner(files,communityScene,'inset',width,height),'0');assert.equal(winner(files,communityScene,'pointer-events',width,height),'none');
  for(const scene of [galleryScene,communityScene])assert.equal(winner(files,scene,'z-index',width,height),'-1','the scene stays behind interactive content');
  assert.equal(winner(files,'.spatial-backdrop>canvas','display',width,height),'block');assert.equal(winner(files,'.spatial-backdrop>canvas','width',width,height),'100%');assert.equal(winner(files,'.spatial-backdrop>canvas','height',width,height),'100%');
 }
});

test('product styles are locally scoped below the optical opening and leave standalone canvas gestures intact',()=>{
 const root=postcss.parse(read('home-product-showcase.css'));
 root.walkRules(rule=>{for(const selector of rule.selectors){
  assert.ok(selector.startsWith('html:root[data-ui][data-color-mode] body .organic-site.v2-site.v2-landing .v2-home '),selector);
  assert.match(selector,/\.(?:home-product|v2-invitation\[data-home-product\])/);assert.doesNotMatch(selector,/v2-hero|home-cinema|v2-home-atmosphere/);
  rule.walkDecls(decl=>{if(decl.prop==='overflow'&&selector.endsWith('.hbd-stage'))assert.match(selector,/\.home-blog-demo\[data-page-scroll=true\]/);if(decl.prop==='touch-action'&&selector.endsWith('.hbd-node')){assert.match(selector,/\.home-blog-demo\[data-page-scroll=true\]/);assert.equal(decl.value,'pan-y');}});
 }});
 assert.equal(winner(['home-blog-canvas-demo.css'],'.hbd-stage','overflow',390,844),'auto','standalone public pages retain their internal scroll mode');
 assert.equal(winner(['home-blog-canvas-demo.css'],selector=>selector.endsWith('.hbd-node')&&!selector.includes('[data-preview=true]'),'touch-action',390,844),'none','standalone edit-mode canvas nodes retain dragging');
 assert.equal(winner(['home-product-showcase.css','home-blog-canvas-demo.css'],'.hbd-node','touch-action',390,844),'pan-y','homepage nodes yield touch scrolling even when the shared editor stylesheet loads last');
});
