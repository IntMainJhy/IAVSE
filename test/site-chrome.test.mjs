import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';

const app=new URL('../src/app/',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,app),'utf8');
const shared='site-chrome.css';
const legacy=['globals.css','brand.css','organic.css','compact.css','x-social.css','spaces.css','site-unified.css','site-appearance.css','v2.css','glass-platform.css','iavse-platform.css','iavse-interiors.css','iavse-quantum.css','iavse-liquid-controls.css','gallery-backgrounds.css','blog-shell.css','admin-organic.css','iavse-admin.css','admin-control-center.css','admin-react-bits.css'];
const sheets=new Map([...legacy,shared].map(name=>[name,postcss.parse(read(name))]));
const compare=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];return 0;};
function functional(selector){const match=selector.match(/:(is|where)\(/);if(!match)return null;let end=match.index+match[0].length,depth=1;for(;depth;end++){if(selector[end]==='(')depth++;if(selector[end]===')')depth--;}return {start:match.index,end,name:match[1],body:selector.slice(match.index+match[0].length,end-1)};}
function specificity(selector){const fn=functional(selector);if(fn){const rank=specificity(selector.slice(0,fn.start)+selector.slice(fn.end));const inner=fn.name==='where'?[0,0,0]:postcss.list.comma(fn.body).map(specificity).sort(compare).at(-1);return rank.map((value,index)=>value+inner[index]);}const attributes=selector.match(/\[[^\]]+\]/g)||[],plain=selector.replace(/\[[^\]]+\]/g,'').replace(/:not\(([^()]*)\)/g,'$1');return [(plain.match(/#[\w-]+/g)||[]).length,attributes.length+(plain.match(/\.[\w-]+|:(?!:)[\w-]+/g)||[]).length,(plain.match(/(?:^|[\s>+~])[a-z][\w-]*/gi)||[]).length];}
const element=(tag,classes='',attrs={})=>({tag,classes:classes.split(' '),attrs});
const html=mode=>element('html','',{'data-ui':'x-social','data-color-mode':mode});
const body=element('body');
const brand=(classes)=>element('a',classes,{'data-site-brand':''});
const mark=element('img','site-brand-mark');
function fixtures(mode){
 const root=[html(mode),body],publicRoot=element('div','organic-site v2-site v2-landing',{'data-surface':'landing'}),reading=element('div','organic-site v2-site public-content-site',{'data-surface':'reading','data-reading-scene':'quantum'}),admin=element('div','organic-site organic-admin public-content-site',{'data-admin-layout':'control-center'});
 const publicRow=[element('header','organic-header',{'data-site-chrome':'public'}),element('div','organic-container organic-header-inner')],blogRow=[element('header','blog-platform-bar',{'data-site-chrome':'blog'}),element('div','blog-platform-bar-inner')];
 return [
  {name:'home',row:[...root,publicRoot,...publicRow],brand:[...root,publicRoot,...publicRow,brand('organic-brand')]},
  {name:'reading',row:[...root,reading,...publicRow],brand:[...root,reading,...publicRow,brand('organic-brand')]},
  {name:'blog',row:[...root,element('div','blog-public-shell v2-site'),...blogRow],brand:[...root,element('div','blog-public-shell v2-site'),...blogRow,brand('blog-platform-logo')]},
  {name:'admin',chrome:[...root,admin,element('div','admin-shell'),element('main','admin-main'),element('div','admin-topline',{'data-site-chrome':'admin'})],brand:[...root,admin,element('div','admin-shell'),element('aside','admin-side'),brand('brand')]},
  {name:'login',brand:[...root,admin,element('main','login-wrap'),element('section','login-card'),element('form'),element('div','admin-login-toolbar'),brand('brand')]},
 ];
}
// A deliberately limited matcher for these concrete chrome receivers: classes,
// attributes, descendant/child combinators, :root, :is/:where and simple :not.
// None of these fixtures contains the descendants required by legacy :has rules.
function matches(selector,path){
 const fn=functional(selector);if(fn)return postcss.list.comma(fn.body).some(part=>matches(selector.slice(0,fn.start)+part+selector.slice(fn.end),path));
 const pseudo=selector.match(/::(before|after)$/)?.[1]||'';if(pseudo!==(path.at(-1).pseudo||''))return false;if(pseudo)selector=selector.slice(0,-pseudo.length-2);
 if(/:has\(|::|:(?:hover|focus|active|disabled|checked|target|nth-)/.test(selector))return false;
 function simple(token,node){let valid=true;token=token.replace(/:not\(([^()]*)\)/g,(_,inside)=>{if(postcss.list.comma(inside).some(part=>simple(part,node)))valid=false;return '';});if(token.includes(':root')){valid&&=node.tag==='html';token=token.replace(':root','');}token=token.replace(/\[([\w-]+)(?:=["']?([^\]"']*)["']?)?\]/g,(_,name,value)=>{valid&&=Object.hasOwn(node.attrs,name)&&(value===undefined||node.attrs[name]===value);return '';});token=token.replace(/\.([\w-]+)/g,(_,name)=>{valid&&=node.classes.includes(name);return '';});return valid&&(token===''||token==='*'||token===node.tag);}
 const parts=selector.trim().replace(/\s*>\s*/g,' > ').split(/\s+/);
 function receive(index,at){if(at<0||!simple(parts[index],path[at]))return false;if(index===0)return true;if(parts[index-1]==='>')return receive(index-2,at-1);for(let ancestor=at-1;ancestor>=0;ancestor--)if(receive(index-1,ancestor))return true;return false;}
 return receive(parts.length-1,path.length-1);
}
function active(rule,width){for(let parent=rule.parent;parent;parent=parent.parent)if(parent.type==='atrule'){
 if(parent.name==='supports')return false;
 if(parent.name==='media'){if(/print|prefers-reduced-transparency:\s*reduce|prefers-reduced-motion/.test(parent.params))return false;for(const [,bound,pixels]of parent.params.matchAll(/(min|max)-width:\s*(\d+)px/g))if(bound==='min'?width<+pixels:width>+pixels)return false;}
 }return true;}
function valueFor(decl,property){if(decl.prop===property)return decl.value;
 if(property==='flex-basis'&&decl.prop==='flex')return decl.value.trim().split(/\s+/)[2];
 if(property==='font-size'&&decl.prop==='font')return decl.value.match(/\d+(?:\.\d+)?px/)?.[0];
 if(property==='font-weight'&&decl.prop==='font')return decl.value.match(/(?:^|\s)([1-9]00|normal|bold)(?:\s|$)/)?.[1]||'normal';
 if(/^padding-(left|right)$/.test(property)){const parts=decl.value.split(/\s+/);if(decl.prop==='padding-inline')return property==='padding-left'?parts[0]:parts[1]||parts[0];if(decl.prop==='padding')return property==='padding-left'?parts[3]||parts[1]||parts[0]:parts[1]||parts[0];}
}
const matching=new Map();
function winner(files,path,property,width){let result,order=0;const key=JSON.stringify(path);if(!matching.has(key))matching.set(key,new Map());const cache=matching.get(key);
 for(const file of files)sheets.get(file).walkRules(rule=>{if(!active(rule,width))return;const declarations=rule.nodes.filter(node=>node.type==='decl').map(decl=>({decl,value:valueFor(decl,property)})).filter(item=>item.value!==undefined);if(!declarations.length)return;
  for(const selector of rule.selectors){if(!cache.has(selector))cache.set(selector,matches(selector,path));if(!cache.get(selector))continue;for(const {decl,value}of declarations){const rank=[decl.important?1:0,...specificity(selector),order++];if(!result||compare(rank,result.rank)>0)result={value,rank,source:file+': '+selector};}}
 });return result;}

test('platform marks and wordmarks retain one geometry after route CSS arrives in any order',()=>{
 for(const files of [[shared,...legacy],[...legacy,shared],[...legacy.slice(0,8),shared,...legacy.slice(8)]])for(const width of [1440,900,390,320])for(const mode of ['light','dark'])for(const fixture of fixtures(mode)){
  const label=`${fixture.name} ${mode} @ ${width}; shared at ${files.indexOf(shared)}`;
  for(const property of ['width','height','flex-basis']){const actual=winner(files,[...fixture.brand,mark],property,width);assert.equal(actual?.value,'28px',`${label} ${property}; ${actual?.source}`);}
  for(const [property,expected]of [['font-size',width<=767?'20px':'22px'],['font-weight','500'],['letter-spacing','.1em']]){const actual=winner(files,fixture.brand,property,width);assert.equal(actual?.value,expected,`${label} ${property}; ${actual?.source}`);}
  assert.equal(winner(files,fixture.brand,'color',width)?.value,'var(--platform-chrome-ink)',label+' switches the brand directly to the active theme ink');
  const transition=winner(files,fixture.brand,'transition',width)?.value||'all 0s ease 0s';
  assert.doesNotMatch(transition,/\b(?:color|all)\b/,label+' never interpolates brand color during a theme change');
  if(fixture.row)assert.match(transition,/^(?:none|opacity(?:\s+[^,]+)?)$/,label+' permits only opacity motion on public brands');else assert.equal(transition,'none',label+' keeps admin brands motionless');
  if(fixture.row){
   for(const [property,expected]of [['min-height',width<=767?'64px':'72px'],['padding-left',width<=767?'20px':'32px'],['padding-right',width<=767?'20px':'32px']]){const actual=winner(files,fixture.row,property,width);assert.equal(actual?.value,expected,`${label} ${property}; ${actual?.source}`);}
   assert.equal(winner(files,fixture.row.slice(0,-1),'position',width)?.value,fixture.name==='blog'?'sticky':'fixed',label+' retains its existing positioning');
   for(const [property,expected]of [['position','static'],['width','auto'],['height','auto'],['overflow','visible'],['clip-path','none']])assert.equal(winner(files,[...fixture.brand,element('div','site-brand-copy')],property,width)?.value,expected,label+' keeps the complete wordmark visible');
  }
 }
});

test('selector fixtures reject unrelated receiver classes and count attribute specificity',()=>{
 const fixture=fixtures('light')[0];
 assert.equal(matches('.blog-public-shell .site-brand-mark',[...fixture.brand,mark]),false);
 assert.equal(matches('.organic-site.organic-admin .admin-side .brand',fixture.brand),false);
 assert.equal(matches('html[data-color-mode=dark] .site-brand-mark',[...fixture.brand,mark]),false);
 const header=fixture.row.slice(0,-1);assert.equal(matches(':is(.blog-public-shell,.v2-site) .organic-header::before',[...header.slice(0,-1),{...header.at(-1),pseudo:'before'}]),true);
 assert.deepEqual(specificity('html:root[data-ui][data-color-mode] body .organic-site [data-site-brand]>.site-brand-mark'),[0,6,2]);
});

test('reduced motion overrides the same important chrome controls without losing specificity',()=>{
 const normal=[],reduced=[];
 sheets.get(shared).walkRules(rule=>{
  const transition=rule.nodes.find(node=>node.type==='decl'&&node.prop==='transition');if(!transition)return;
  if(rule.parent.type==='root'&&/^opacity\b/.test(transition.value)){assert.ok(transition.important);normal.push(...rule.selectors);}
  if(rule.parent.type==='atrule'&&rule.parent.name==='media'&&/prefers-reduced-motion:\s*reduce/.test(rule.parent.params)){assert.equal(transition.value,'none');assert.ok(transition.important);reduced.push(...rule.selectors);}
 });
 assert.ok(normal.length,'the chrome controls have an explicit opacity transition');
 assert.deepEqual(reduced.sort(),normal.sort(),'the reduced-motion selector has the same specificity and receivers as the base control rule');
});

test('the root loads shared chrome for every route and only platform receivers opt in',()=>{
 assert.match(read('layout.tsx'),/import ['"]\.\/site-chrome\.css['"]/);
 const component=name=>fs.readFileSync(new URL('../src/components/'+name+'.tsx',import.meta.url),'utf8');
 for(const [name,kind]of [['PublicSite','public'],['BlogPublic','blog']])assert.match(component(name),new RegExp(`<header[^>]*data-site-chrome="${kind}"`),name);
 assert.match(component('AdminApp'),/<div className="admin-topline" data-site-chrome="admin"/);
 for(const [name,count]of [['PublicSite',1],['BlogPublic',1],['AdminApp',2]])assert.equal([...component(name).matchAll(/data-site-brand\b/g)].length,count,name+' opts in its platform brand links');
 sheets.get(shared).walkRules(rule=>{if(rule.nodes.every(node=>node.type!=='decl'||node.prop.startsWith('--')))return;for(const selector of rule.selectors){assert.match(selector,/\[data-site-(?:chrome|brand)(?:[=\]])/,selector+' needs an explicit platform owner');assert.doesNotMatch(selector,/anx-portfolio|bd-block|blog-canvas|(?:^|[\s>])canvas\b/,selector+' leaves author canvases alone');}});
});

test('a single bounded backing layer owns neutral glass without filtering navigation controls',()=>{
 for(const mode of ['light','dark'])for(const fixture of fixtures(mode).filter(item=>item.row||item.chrome)){
  const header=fixture.chrome||fixture.row.slice(0,-1),backing=[...header.slice(0,-1),{...header.at(-1),pseudo:'before'}],after=[...header.slice(0,-1),{...header.at(-1),pseudo:'after'}];
  for(const files of [[shared,...legacy],[...legacy,shared]]){
   assert.equal(winner(files,header,'backdrop-filter',390)?.value,'none',fixture.name+' keeps menu positioning outside the blur layer');
   for(const [property,value]of [['background','var(--platform-chrome-surface)'],['backdrop-filter','var(--platform-chrome-filter)'],['-webkit-backdrop-filter','var(--platform-chrome-filter)'],['height','100%'],['inset','0'],['z-index','-1'],['pointer-events','none']])assert.equal(winner(files,backing,property,390)?.value,value,fixture.name+' '+property);
   assert.equal(winner(files,after,'display',390)?.value,'none');
   assert.equal(winner(files,after,'content',390)?.value,'none');
  }
 }
 assert.equal(winner([shared],[html('light')],'--platform-chrome-surface',1440)?.value,'rgb(255 255 255 / .58)');
 assert.equal(winner([shared],[html('dark')],'--platform-chrome-surface',1440)?.value,'rgb(29 29 31 / .68)');
 assert.equal(winner([shared],[html('light')],'--platform-chrome-filter',1440)?.value,'blur(16px) saturate(1.05)');
 for(const [name,condition]of [['media',/prefers-reduced-transparency:\s*reduce/],['supports',/^not .*backdrop-filter/]]){
  let fallback=false;sheets.get(shared).walkAtRules(name,rule=>{if(!condition.test(rule.params))return;const properties={};rule.walkDecls(decl=>{properties[decl.prop]=decl.value;});assert.equal(properties['--platform-chrome-surface'],'var(--platform-chrome-solid)');assert.equal(properties['--platform-chrome-filter'],'none');fallback=true;});assert.ok(fallback,name+' has a solid fallback');
 }
 assert.doesNotMatch(read(shared),/(?:linear|radial|conic)-gradient\(/,'the former oversized gradient layer stays retired');
});
