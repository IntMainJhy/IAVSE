// Individually authored website templates. Source catalogs remain separate records.
import classic from './website-showcases/classic.json' with {type:'json'};
import expressive from './website-showcases/expressive.json' with {type:'json'};
import dark from './website-showcases/dark.json' with {type:'json'};
import sourceStyles from './design-imports/stylekit.json' with {type:'json'};
const sourceCategories=new Map(sourceStyles.map(entry=>[entry.slug,entry.category]));
const root='https://github.com/IntMainJhy/IAVSE';
const order=['apple','editorial','brutalist','stripe','swiss','minimal','glass','bento','organic','pixel','cyber','dark'];
export const websiteReferences=[...classic,...expressive,...dark].sort((a,b)=>order.indexOf(a.key)-order.indexOf(b.key));
const bullet=items=>(items||[]).map(item=>'- '+item).join('\n');
const table=(headers,rows)=>'| '+headers.join(' | ')+' |\n| '+headers.map(()=> '---').join(' | ')+' |\n'+rows.map(row=>'| '+row.map(cell=>String(cell??'').replaceAll('|','／').replaceAll('\n',' ')).join(' | ')+' |').join('\n');
function specification(reference){
 const details=reference.designDetails||{};
 return `# ${reference.title}

## 风格与设计重点
${reference.summary}
${bullet(details.designFocus||reference.observations)}

## 颜色分类与使用角色
${table(['角色','颜色','用法'],(details.colorRoles||[]).map(color=>[color.role,color.hex,color.usage]))}

## 字体与排版
${reference.typography}
${table(['层级','字体','字号','字重','行高'],(details.typography||[]).map(type=>[type.role,type.family,type.size,type.weight,type.lineHeight]))}

## 空间与尺寸
${table(['令牌','数值','用途'],(details.spacing||[]).map(space=>[space.token,space.value,space.usage]))}

## 页面布局
${reference.layout}
${bullet(details.layoutRules)}

## 响应式规则
${bullet(details.responsive)}

## 动效与交互
${bullet(details.motion)}
${bullet(reference.interactions)}

## 应当保留
${bullet(details.do)}

## 应当避免
${bullet(details.dont)}

## 参考与实现范围
设计参考：[${reference.referenceSite.name}](${reference.referenceSite.url})
${bullet((reference.referencePages||[]).map(page=>`[${page.name}](${page.url})`))}
发现入口：[${reference.collectionReference?.name||'StyleKit'}](${reference.collectionReference?.url||'https://www.stylekit.top/zh/styles/'+reference.sourceSlug.replace('stylekit-','')})
${reference.evidenceNote||'本站独立编写页面、示例内容与提示词，参考公开设计语言与设计流派。没有导入收录站的 showcase 源码、原文提示词或其品牌素材。'}
本页面为演示用途，品牌与内容为示例。参考网站不是本模板的作者；项目许可不包含第三方商标及未经授权的素材。`;
}
export const websiteShowcases=websiteReferences.map(reference=>{
 const slug='website-'+reference.key,preview='/resources/designs/'+slug+'/preview',details=reference.designDetails||{};
 const theme=reference.theme||{bg:reference.palette[0],ink:reference.palette[1],accent:reference.palette[2],surface:reference.palette[0],muted:reference.palette[1],accentInk:'#ffffff',radius:8,border:1};
 return {id:slug,slug,title:reference.title,summary:reference.summary,category:reference.category||sourceCategories.get(reference.sourceSlug)||'通用',tags:reference.tags||['网站设计','独立重写'],palette:reference.palette,typography:reference.typography,layout:reference.layout,motion:(details.motion||[]).join('；'),prompt:reference.prompt,specification:specification(reference),source:{name:'IAVSE · 独立网站模板',url:root+'/tree/main/src/components/website-showcases'},creator:{name:'IAVSE',url:root},collection:{name:'本站重写',url:'/resources?type=designs&collection=studio'},referenceSite:reference.referenceSite,referenceUrls:[...(reference.referencePages||[]),reference.collectionReference||{name:'发现入口 · StyleKit',url:'https://www.stylekit.top/zh/styles/'+reference.sourceSlug.replace('stylekit-','')}],production:'依据公开设计语言独立编写的网站模板、设计规范与提示词。示例作者为 IAVSE；参考站与发现平台单独列示。',previewPolicy:'embed',external:false,websiteUrl:preview,previewUrl:preview,image:'',preview:{theme:reference.previewTheme||'light',layout:'editorial',accent:theme.accent},license:{name:'IAVSE 项目许可',url:root+'/blob/main/LICENSE',status:'project'},provenance:{verifiedAt:'2026-11-08',evidenceUrl:root+'/blob/main/docs/design-studio-independent-implementation.md',note:reference.evidenceNote||'与收录站的示例采用不同的内容、结构与自有实现；不将参考品牌或收录平台写成该模板的作者。'},studio:{kind:'website',websiteKey:reference.key,sourceSlug:reference.sourceSlug,scenarios:reference.scenarios,styleType:reference.styleType||'visual',tags:reference.styleTags||[],observations:reference.observations||details.designFocus||[],componentIds:reference.componentIds||Object.keys(reference.componentPrompts||{}),componentPrompts:reference.componentPrompts||{},theme,rule:(details.designFocus||reference.observations||[]).join('；'),designDetails:details,interactions:reference.interactions||[]}};
});
