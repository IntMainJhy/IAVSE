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
  for(const selector of rule.selectors.filter(value=>value.endsWith(receiver)))rule.walkDecls(declaration=>{
   let value=declaration.value;if(property==='padding-top'&&declaration.prop==='padding')value=value.split(/\s+/)[0];else if(declaration.prop!==property)return;
   const rank=[declaration.important?1:0,...specificity(selector),order++];if(!result||compare(rank,result.rank)>0)result={value,rank};
  });
 });return result?.value;
}

test('final homepage typography and opening geometry survive legacy styles loaded after client navigation',()=>{
 const legacy=['glass-studio.css','iavse-home.css'];
 for(const files of [[...legacy,'iavse-platform.css'],['iavse-platform.css',...legacy],['glass-studio.css','iavse-platform.css','iavse-home.css']])for(const [width,height]of[[1440,1000],[900,1000],[390,844]]){
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
