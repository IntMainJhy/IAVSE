import vibeui from './design-imports/vibeui.json' with {type:'json'};
import stylekit from './design-imports/stylekit.json' with {type:'json'};
import {familyFor,studioLayouts} from './design-studio/families.mjs';
import {studioComponents,componentPrompt} from './design-studio/components.mjs';
export {studioComponents,componentPrompt};
export const studioResearch=[
 {name:'VibeUI',url:'https://vibeui.top/?lang=zh',focus:'紧凑目录、品牌参考与明暗版本'},
 {name:'StyleKit',url:'https://www.stylekit.top/zh/styles',focus:'风格规则、整页示例与使用提示词'},
 {name:'Carbon',url:'https://www.carbondesignsystem.com/',focus:'企业数据结构与组件状态'},
 {name:'GOV.UK Design System',url:'https://design-system.service.gov.uk/',focus:'可读表单、错误恢复与任务流程'},
 {name:'Atlassian Design',url:'https://atlassian.design/components/',focus:'工作区、导航和协作反馈'},
 {name:'Radix Primitives',url:'https://www.radix-ui.com/primitives/docs/overview/accessibility',focus:'键盘、焦点与可访问语义'},
 {name:'Material Design',url:'https://m3.material.io/',focus:'自适应布局与控件层级'},
 {name:'Shopify Polaris',url:'https://shopify.dev/docs/api/polaris',focus:'经营任务与数据操作'},
 {name:'shadcn/ui',url:'https://ui.shadcn.com/docs/components',focus:'组件组织与组合方式'},
 {name:'Awwwards',url:'https://www.awwwards.com/',focus:'作品呈现与空间节奏；仅作发现入口'},
 {name:'Curated Design',url:'https://www.curated.design/',focus:'独立网站的构图与排版；仅作发现入口'},
 {name:'Page Flows',url:'https://pageflows.com/',focus:'任务流程与状态衔接；仅作发现入口'},
 {name:'Hover.dev',url:'https://www.hover.dev/',focus:'交互反馈和有边界的动效'},
];
const root='https://github.com/IntMainJhy/IAVSE';
const ordered=['editorial','glassmorphism','neo-brutalist','bento-grid','dashboard-layout','natural-organic','pixel-art','swiss-style','notion-style','art-deco','cyberpunk-neon','minimalist-flat'];
const colorRgb=hex=>/^#[\da-f]{6}$/i.test(hex)?[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255):null;
export function studioLuminance(hex){const c=colorRgb(hex);return c?c.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0):1}
export function studioContrast(a,b){const [x,y]=[studioLuminance(a),studioLuminance(b)].sort((a,b)=>b-a);return(x+.05)/(y+.05)}
export function studioTheme(source,family){
 const colors=(source.palette||[]).filter(c=>colorRgb(c));
 const accent=colors.find(c=>{const v=colorRgb(c);return Math.max(...v)-Math.min(...v)>.15&&studioContrast(c,family.bg)>2})||family.accent;
 const dark=/dark|gothic|noir|cyber|neon|terminal|arcade/.test(source.slug)||studioLuminance(family.bg)<.15;
 const bg=dark?(studioLuminance(family.bg)<.15?family.bg:'#171b24'):family.bg,ink=dark?'#edf2f6':family.ink;
 return{bg,ink,accent,accentInk:studioContrast(accent,'#ffffff')>=4.5?'#ffffff':'#000000',surface:dark?'#202535':'#ffffff',muted:dark?'#bbc6d3':'#555b61',radius:family.radius,border:family.border,font:family.font,dark};
}
function ownEntry(source,index,selectedFamily){
 const family=selectedFamily||familyFor(source.slug),theme=studioTheme(source,family),slug='studio-'+source.slug,brand=source.referenceSite?.name;
 const title=source.title+(brand?' · 风格研究':''),scene=studioLayouts[family.layout];
 const summary=`${family.name}：${family.rule.split('；')[0]}。以「${source.title}」为对照，重新编写演示与复现方法。`;
 const entry={id:slug,slug,title,summary,category:source.category,tags:['IAVSE 自研',family.name,brand?'品牌启发':'风格研究'],palette:[theme.bg,theme.ink,theme.accent,theme.surface],typography:theme.font==='serif'?'Georgia / 系统衬线 + 系统无衬线':theme.font==='mono'?'系统等宽 + 系统无衬线':'IAVSE Sans / 系统无衬线',layout:scene,motion:'交互反馈 160–240ms；离屏停止持续工作；prefers-reduced-motion 时保持静态。',source:{name:'IAVSE · 独立实现',url:root+'/blob/main/src/components/DesignStudioPreview.tsx'},creator:{name:'IAVSE',url:root},collection:{name:'IAVSE 自研',url:'/resources?type=designs&collection=studio'},websiteUrl:'/resources/designs/'+slug+'/preview',previewUrl:'/resources/designs/'+slug+'/preview',image:'',external:false,preview:{theme:theme.dark?'dark':'light',layout:'product',accent:theme.accent},production:'IAVSE 独立实现的风格研究；当前共享 16 个视觉族和 13 种结构，使用虚构品牌、自有文案和程序化几何，未验证逐项像素保真。',license:{name:'IAVSE 项目许可',url:root+'/blob/main/LICENSE',status:'project'},provenance:{verifiedAt:'2026-11-08',evidenceUrl:'/resources/designs/'+source.slug,note:'保留原收录条目作为对照。本站这份描述、提示词、组件行为与演示实现单独编写；通用设计语言和参考品牌的权利各自保留。'},referenceSite:source.referenceSite,referenceUrls:[{name:'原收录对照 · '+source.title,url:'/resources/designs/'+source.slug},...(source.referenceSite?[source.referenceSite]:[])],studio:{family:family.id,layout:family.layout,theme,rule:family.rule,originSlug:source.slug,originCollection:source.collection.name,index,kind:'page'}};
 entry.prompt=`为「[产品名称]」制作一个可运行的「${title}」网站，目标用户为[目标用户]，核心任务为[核心任务]。\n\n视觉目标\n${family.rule}\n使用背景 ${theme.bg}、正文 ${theme.ink}、强调色 ${theme.accent}、表面 ${theme.surface}。标题采用${entry.typography}；边框 ${theme.border}px，基础圆角 ${theme.radius}px。参考「${source.title}」的通用视觉语言，具体构图以本条目的信息结构为准；使用自有品牌、内容与素材实现。\n\n信息结构\n${scene}。首屏呈现清楚的任务和一个真实可操作入口，后续每节有不同信息密度。\n\n交互\n实现搜索／筛选、选中状态、明暗主题、一个可编辑的工作示例与操作反馈；全部按钮有实际行为。数据明确为演示，不连接真实付费或外部账号。\n\n组件\n按钮、输入、标签、导航、内容列表与反馈沿用同一组 token。为加载、空结果、错误、禁用和 focus-visible 分别设计可观察状态。\n\n响应式与可访问性\n390px 单列，768px 适配分栏，1440px 展开主体；触控目标至少44px。正文对比度达到4.5:1。使用原生语义，保留键盘访问、对话框焦点恢复及减少动态效果。\n\n交付\n使用现有项目技术栈，输出完整页面、作用域样式、token 与示例数据。只使用自有文字、品牌和已获授权素材。逐项说明怎样检查布局、状态和手机适配。`;
 entry.specification=`# ${title} · IAVSE 实现说明\n\n## 构图与阅读顺序\n${scene}。\n\n## 视觉规则\n${family.rule}\n\n## 颜色\n| 角色 | 值 |\n| --- | --- |\n| 背景 | ${theme.bg} |\n| 正文 | ${theme.ink} |\n| 强调 | ${theme.accent} |\n| 表面 | ${theme.surface} |\n\n## 排版与尺寸\n标题桌面40–80px、手机32–44px；正文15–18px、行高1.6；以4px为间距步长，主要节距48–96px。圆角${theme.radius}px，边框${theme.border}px。${entry.typography}。\n\n## 行为\n本地示例实现筛选与选中反馈；输入保留标签，结果变化可被辅助技术读取。明暗切换仅作用于演示。组件区可逐个检查真实状态。\n\n## 响应式\n主体最大宽1280px，手机侧距20px；390px禁止页面横向溢出，数据表和代码块可以独立滚动。\n\n## 动效\n${entry.motion}\n\n## 内容与参考\n描述、提示词与代码由 IAVSE 单独实现；通用风格不是本项目首创。对照条目：/resources/designs/${source.slug}。不包含对照站的提示词正文、示例源码、品牌标志、照片或字体文件。`;
 return entry;
}
const originals=[...stylekit].sort((a,b)=>{const ai=ordered.indexOf(a.slug.replace('stylekit-','')),bi=ordered.indexOf(b.slug.replace('stylekit-',''));return(ai<0?999:ai)-(bi<0?999:bi)}).concat(vibeui);
const extraSpecs=[
 ['enterprise-data','企业数据台','分析仪表','dashboard',2],['public-service','公共服务表单','通用','minimal',3],['team-workspace','团队项目台','企业消费','workspace',4],['accessible-components','组件说明书','设计生产','minimal',5],['adaptive-reading','自适应阅读','通用','editorial',6],['merchant-console','商家经营台','企业消费','dashboard',7],['component-workbench','组合组件工作台','开发工具','workspace',8],['motion-portfolio','动效作品集','设计生产','gallery',12],
];
const extra=extraSpecs.map(([slug,title,category,family,ref],i)=>{const source={slug:'iavse-'+slug,title,category,palette:[],collection:{name:studioResearch[ref].name}};const base=familyFor(family),f=slug==='public-service'?{...base,layout:'service',rule:'以任务为中心组织单列表单；标签、帮助和错误信息与字段紧邻。先收集信息，再确认，最后显示完成状态。'}:base;const e=ownEntry(source,261+i,f);e.studio={...e.studio,family:f.id,layout:f.layout,theme:studioTheme(source,f),rule:f.rule,originSlug:null,originCollection:null};if(['accessible-components','component-workbench'].includes(slug))e.studio.initialView='components';e.referenceUrls=[studioResearch[ref]];e.specification=e.specification.replace('对照条目：/resources/designs/'+source.slug+'。','研究参考：'+studioResearch[ref].url+'。');e.provenance={verifiedAt:'2026-11-08',evidenceUrl:studioResearch[ref].url,note:'研究公开设计系统的任务结构与交互规范，描述、代码和演示内容由 IAVSE 单独编写。'};return e});
export const studioPages=[...originals.map((source,index)=>ownEntry(source,index)),...extra];
export const studioComponentEntries=studioComponents.map((c,i)=>{
 const base=studioPages.find(e=>e.studio.family==='minimal')||studioPages[0],slug='studio-component-'+c[0];
 const e={...base,id:slug,slug,title:c[1],summary:c[3],category:'设计生产',tags:['IAVSE 自研','单个组件',c[2]],websiteUrl:'/resources/designs/'+slug+'/preview',previewUrl:'/resources/designs/'+slug+'/preview',referenceSite:undefined,referenceUrls:[studioResearch[5],studioResearch[2]],studio:{...base.studio,kind:'component',component:c[0],index:i,originSlug:null,originCollection:null},provenance:{verifiedAt:'2026-11-08',evidenceUrl:studioResearch[5].url,note:'独立编写的组件示例；参考公开交互语义与可访问规范。'}};
 e.prompt=componentPrompt(e,c);e.specification=`# ${c[1]}\n\n## 用途\n${c[3]}\n\n## 交互约定\n${c[4]}\n\n## 状态与适配\n提供默认、选中、禁用与焦点状态；390px与1440px可操作。\n\n## 实现边界\n代码与演示内容由 IAVSE 单独编写，没有导入参考项目的组件源码。`;return e;
});
export const studioDesigns=[...studioPages,...studioComponentEntries];
