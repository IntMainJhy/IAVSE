// Display content only: these compositions do not create accounts or publication records.
import {defaultBlogDesign,applyBlogTemplate} from './blog-design.mjs';
import {applyBlogAppearance} from './blog-appearances.mjs';
export const blogShowcases=[
 {handle:'lin-studio',name:'Lin Chen',role:'Product designer',template:'editorial',appearance:'sketch',avatarSrc:'/images/showcase/lin.svg',intro:'我设计日常使用的数字产品，也记录让生活更清楚的小想法。',introEn:'I design everyday digital products and collect ideas that make life a little clearer.',projectTitle:'Field Notes',projectSummary:'为城市漫步设计的一本数字手帐',projectSummaryEn:'A digital journal for taking the long way home.',tags:['Product design','Prototyping','Everyday objects'],notes:[['从一张车票开始','把旅途中的碎片，整理成可以重访的故事。'],['界面的分寸','关于留白、触感与恰到好处的反馈。']],notesEn:[['It started with a train ticket','Collecting fragments of a journey into a story worth revisiting.'],['A sense of proportion','Notes on space, touch and just enough feedback.']]},
 {handle:'maya-lab',name:'Maya Zhou',role:'Creative developer',template:'portfolio',appearance:'mint-serif',avatarSrc:'/images/showcase/maya.svg',intro:'在代码与自然的交界处，制作可交互的实验。',introEn:'Interactive experiments at the meeting point of code and the natural world.',projectTitle:'Growth Studies',projectSummary:'用生成算法观察一片叶子的生长',projectSummaryEn:'An interactive study of the way a leaf grows.',tags:['Creative coding','WebGL','Generative systems'],notes:[['沿着叶脉走','从真实的生长规律出发，寻找生成系统的节奏。'],['让参数可触摸','用交互理解抽象的算法。']],notesEn:[['Following a leaf vein','Finding a rhythm for generative systems in the way living things grow.'],['Making parameters tangible','Using interaction to understand an abstract algorithm.']]},
 {handle:'leo-park',name:'Leo Park',role:'Independent developer',template:'resume',appearance:'night-player',avatarSrc:'/images/showcase/leo.svg',intro:'做轻巧、可靠的小工具，把复杂的事情一点点理顺。',introEn:'Small, dependable tools that make complicated things feel a little simpler.',projectTitle:'Commonplace',projectSummary:'给灵感与参考资料留一个位置',projectSummaryEn:'A quiet home for ideas, references and things worth keeping.',tags:['TypeScript','Local-first','Interaction'],notes:[['工具应该安静一点','关于不打断思考的产品设计。'],['本地优先的日常','写下、归档，再把注意力还给眼前。']],notesEn:[['Tools should be quieter','Designing products that leave a train of thought intact.'],['An everyday local-first workflow','Write it down, file it away, and return to the moment.']]},
 {handle:'aki-notes',name:'Aki Mori',role:'Illustrator & writer',template:'anx',appearance:'glass-space',avatarSrc:'/images/showcase/aki.svg',intro:'画画、写字，收藏那些很容易被错过的日常。',introEn:'Drawings, words and a growing collection of easily overlooked everyday things.',projectTitle:'Sunday Objects',projectSummary:'十二件日常物品的观察练习',projectSummaryEn:'Twelve small studies of objects from everyday life.',tags:['Illustration','Writing','Visual journals'],notes:[['星期天的物品','杯子、枝叶和窗边的一点光。'],['在日常里停一下','把熟悉的事物重新看一遍。']],notesEn:[['Objects on a Sunday','A cup, a branch, and a little light by the window.'],['Pausing in the everyday','Taking another look at things that have become familiar.']]},
];
const avatarPaths=new Set(['/images/showcase/lin.svg','/images/showcase/maya.svg','/images/showcase/leo.svg','/images/showcase/aki.svg']);
// Static bundled art is accepted only from these exact paths; user uploads keep their media IDs.
export const showcaseAvatarSrc=value=>typeof value==='string'&&avatarPaths.has(value)?value:'';
export function showcaseProfile(handle,locale='en'){
 const item=blogShowcases.find(item=>item.handle===handle);if(!item)return null;
 return {handle:item.handle,name:item.name,role:item.role,template:item.template,intro:locale==='zh'?item.intro:item.introEn,avatarSrc:item.avatarSrc,avatarId:'',href:'/blogs/showcase/'+item.handle,showcase:true};
}
/** Use the same template factory, appearance and public renderer as the blog editor. */
export function showcasePageData(handle,locale='en'){
 const item=blogShowcases.find(item=>item.handle===handle);if(!item)return null;
 const zh=locale==='zh',notes=zh?item.notes:item.notesEn;
 const profile={name:item.name,alias:item.role,avatarId:'',avatarSrc:item.avatarSrc,intro:zh?item.intro:item.introEn,skills:[...item.tags],email:'',github:'',socials:[],experiences:[],resume:{version:1,updated:'',resumeId:'',metrics:[],certificates:[],gallery:[],sections:[
  {id:'work',title:zh?'作品与实践':'Selected work',items:[{title:item.projectTitle,subtitle:item.tags.join(' · '),period:'',description:zh?item.projectSummary:item.projectSummaryEn}]},
  {id:'notes',title:zh?'最近写下的':'From the notebook',items:notes.map(([title,description])=>({title,description,subtitle:'',period:''}))}
 ]}};
 const layout={coverId:'',blog:{mode:'theme',theme:'anx',title:'',description:'',sections:[],showLegacyContent:false}};
 const design=applyBlogAppearance(applyBlogTemplate(defaultBlogDesign(profile,layout,[]),item.template),item.appearance);
 // These are design samples, not an animation demo. The surrounding gallery owns all movement.
 design.motion={entrance:false,interactions:false,marquee:false};
 return {owner:'showcase',siteOwner:false,handle:item.handle,profile,layout:{...layout,blog:{...layout.blog,design}},content:[],legacyContent:[]};
}
