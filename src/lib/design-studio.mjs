// Each page is an individually inspected website study with its own renderer.
// No title/slug loop creates pages from the imported style catalogs.
import workspaces from './design-references/workspaces.json' with {type:'json'};
import products from './design-references/products.json' with {type:'json'};
import creation from './design-references/creation.json' with {type:'json'};
import {studioComponents,componentPrompt} from './design-studio/components.mjs';
export {studioComponents,componentPrompt};
const root='https://github.com/IntMainJhy/IAVSE';
const categoryFor={linear:'开发工具',notion:'设计生产',github:'开发工具',stripe:'金融加密',apple:'企业消费',vercel:'基建与云',claude:'AI',figma:'设计生产',raycast:'开发工具'};
const componentIds={linear:['table','tabs','dialog','badge'],notion:['input','checkbox','table','navigation'],github:['tabs','table','badge','breadcrumbs'],stripe:['input','radio','button','progress'],apple:['select','button','tabs','card'],vercel:['tabs','table','toast','badge'],claude:['input','button','card','navigation'],figma:['slider','select','checkbox','tabs'],raycast:['command','tabs','badge','button']};
const defaultTheme={bg:'#f6f6f4',surface:'#ffffff',ink:'#262626',muted:'#555b61',accent:'#2459d3',accentInk:'#ffffff',radius:8,border:1};
const luminance=color=>{const hex=String(color).replace('#','');if(!/^[0-9a-f]{6}$/i.test(hex))return 1;return[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
function themeFor(reference){const colors=reference.palette||[],bg=colors[0]||defaultTheme.bg,dark=luminance(bg)<.2,accent=colors[2]||defaultTheme.accent;return {...defaultTheme,bg,ink:colors[1]||(dark?'#f1f1f1':defaultTheme.ink),surface:dark?'#202226':'#ffffff',muted:dark?'#bfc1c9':'#555b61',accent,accentInk:contrast(accent,'#ffffff')>=4.5?'#ffffff':'#000000'}}

const order=['linear','stripe','figma','notion','apple','raycast','github','claude','vercel'];
export const referencedStudies=[...workspaces,...products,...creation].sort((a,b)=>order.indexOf(a.key)-order.indexOf(b.key));
export const studioResearch=referencedStudies.map(r=>({name:r.referenceSite.name,url:r.referenceSite.url,focus:r.layout}));
export const studioPages=referencedStudies.map((reference)=>{
 const slug='studio-'+reference.key,previewUrl='/resources/designs/'+slug+'/preview',theme=themeFor(reference);
 const observations=reference.observations||[],pages=reference.referencePages||[reference.referenceSite];
 const own={id:slug,slug,title:reference.title,summary:reference.summary,category:categoryFor[reference.key]||'通用',tags:['网站参考重做',reference.referenceSite.name,'独立页面实现'],palette:reference.palette,typography:reference.typography,layout:reference.layout,motion:'采用参考页面的必要交互反馈；减少动态效果时保持完整可读。',source:{name:'IAVSE · 参考实现',url:root+'/tree/main/src/components/design-references'},creator:{name:'IAVSE',url:root},collection:{name:'网站参考重做',url:'/resources?type=designs&collection=studio'},referenceSite:reference.referenceSite,referenceUrls:[...pages,...(reference.originSlugs||[]).map(origin=>({name:'收录对照 · '+origin.replace(/^(?:vibeui|stylekit)-/,''),url:'/resources/designs/'+origin}))],websiteUrl:previewUrl,previewUrl,image:'',external:false,preview:{theme:'light',layout:'product',accent:theme.accent},production:'按具体参考页面单独实现的界面练习，保留可点击的真实参考站与页面记录；演示内容为本站本地数据，不代表参考品牌的官方服务。',license:{name:'IAVSE 项目许可',url:root+'/blob/main/LICENSE',status:'project'},provenance:{verifiedAt:reference.verifiedAt||'2026-11-08',evidenceUrl:pages[0]?.url||reference.referenceSite.url,note:reference.evidenceNote||'根据所列公开页面的实际结构、排版与控件重新实现；不以同色系通用布局替代来源核对。'},studio:{kind:'page',referenceKey:reference.key,theme,rule:observations.join('；'),observations,componentIds:componentIds[reference.key]||[],originSlugs:reference.originSlugs||[],referencePages:pages,interactions:reference.interactions||[]},prompt:'参考网站：'+reference.referenceSite.name+' '+reference.referenceSite.url+'\n\n'+reference.prompt};
 own.specification=`# ${reference.title}\n\n## 实际参考页面\n主要参考：${reference.referenceSite.name} · ${reference.referenceSite.url}\n${pages.map(p=>'- '+p.name+'：'+p.url).join('\n')}\n\n## 逐项观察\n${observations.map(s=>'- '+s).join('\n')}\n\n## 页面结构\n${reference.layout}\n\n## 字体与颜色\n${reference.typography}\n${reference.palette.join(' / ')}\n\n## 本地操作\n${(reference.interactions||[]).map(s=>'- '+s).join('\n')}\n\n## 复现范围\n${own.provenance.note}\n参考品牌与原页面的权利各自保留；本实现没有访问它们的私有账号或生产数据。`;
 return own;
});
export const studioComponentEntries=studioComponents.map((c)=>{
 const slug='studio-component-'+c[0],previewUrl='/resources/designs/'+slug+'/preview';
 const entry={id:slug,slug,title:c[1],summary:c[3],category:'设计生产',tags:['单个组件',c[2]],palette:['#f6f6f4','#262626','#2459d3'],typography:'系统无衬线',layout:'组件状态实验',motion:'仅操作反馈；支持减少动态效果。',source:{name:'IAVSE · 组件实现',url:root+'/blob/main/src/components/DesignStudioPreview.tsx'},creator:{name:'IAVSE',url:root},collection:{name:'网站参考重做',url:'/resources?type=designs&collection=studio&view=components'},referenceSite:{name:'Radix · 交互语义参考',url:'https://www.radix-ui.com/primitives/docs/overview/accessibility'},referenceUrls:[],websiteUrl:previewUrl,previewUrl,image:'',external:false,preview:{theme:'light',layout:'product',accent:'#2459d3'},license:{name:'IAVSE 项目许可',url:root+'/blob/main/LICENSE',status:'project'},studio:{kind:'component',component:c[0],theme:defaultTheme,rule:c[4]},prompt:'',specification:`# ${c[1]}\n\n## 用途\n${c[3]}\n\n## 行为\n${c[4]}\n\n## 实现\n本地可交互组件；不计作独立的网站风格模板。`};
 entry.prompt=componentPrompt(entry,c);return entry;
});
export const studioDesigns=[...studioPages,...studioComponentEntries];
