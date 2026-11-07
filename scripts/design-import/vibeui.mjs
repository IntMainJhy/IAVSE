/**
 * Import factual catalog metadata from VibeUI; preserve its actual upstream owners.
 * Only the 54 MIT-licensed VoltAgent studies include copied documentation.
 * The 58 UI/UX Pro Max templates remain remote links: no source, images or prose copied.
 * Run: node scripts/design-import/vibeui.mjs [--verify-links]
 */
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const revision='fa4175f8d5c06683d70d05a4544e466e77fa2544';
const upstreamRevision='f6f44a9159d09e13fa0b5d3d9f15c20a9fbb3be1';
const templateRevision='5c1fb49813069920bdc3fcbb8aee02cd6e8f5157';
const base=`https://raw.githubusercontent.com/Charlo-O/awesome-design-md/${revision}/`;
const stamp='2026-11-08';
const taxonomy={ai:'AI',dev:'开发工具',infra:'基建与云',design:'设计生产',finance:'金融加密',enterprise:'企业消费',styleGeneral:'通用',styleLanding:'落地页',styleAnalytics:'分析仪表'};
async function text(url){const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`${response.status} ${url}`);return response.text()}
async function parallel(items,fn,concurrency=6){const output=Array(items.length);let cursor=0;await Promise.all(Array.from({length:concurrency},async()=>{while(cursor<items.length){const index=cursor++;output[index]=await fn(items[index],index)}}));return output}
const source=await text(base+'site-assets/designs.js');
const match=source.match(/window\.DESIGNS\s*=\s*(\[[\s\S]*\]);?\s*$/);
if(!match)throw Error('The source format changed; review before importing.');
const entries=JSON.parse(match[1]);
if(entries.length!==112)throw Error('Expected the reviewed 112-entry snapshot.');
const brandDescriptions={
 claude:'用温暖纸色、衬线标题与陶土色强调阅读感，适合观察内容与对话产品的层次。',
 cohere:'以明亮界面、清晰卡片与克制的紫色组织企业 AI 产品信息。',
 elevenlabs:'通过深浅对照与音频相关的视觉节奏，呈现语音产品与创作工具。',
 minimax:'用强对比画面与鲜明强调色组织 AI 产品介绍，突出入口和示例内容。',
 'mistral.ai':'以醒目橙色、简洁文字与模块化内容展示模型平台的品牌语言。',
 ollama:'围绕本地模型使用场景，采用黑白配色和接近终端工具的简约表达。',
 'opencode.ai':'面向编程任务的暗色工具界面，以文字、代码和操作区建立优先级。',
 replicate:'用留白、代码示例与 API 信息组织模型服务，突出开发者的下一步操作。',
 runwayml:'以大幅媒体和深色场景呈现创作工具，适合研究影像产品的展示节奏。',
 'together.ai':'围绕模型基础设施组织技术信息，以克制色彩和清楚的模块边界辅助阅读。',
 voltagent:'深黑背景与绿色强调结合终端语汇，展示 AI Agent 开发工具的视觉方向。',
 'x.ai':'以黑白反差、简洁排版和大面积空间塑造 AI 产品的品牌形象。',
 cursor:'围绕代码编辑与 AI 功能安排界面，采用暗色工作面和清晰的产品示例。',
 expo:'以代码和开发流程为中心，观察移动开发平台如何组织工具与文档入口。',
 'linear.app':'通过精细间距、安静边界与少量强调色建立工程团队工作区的秩序。',
 lovable:'以轻快色彩与容易理解的产品说明，引导用户开始构建应用。',
 mintlify:'围绕文档阅读组织导航、正文和代码，用绿色强调可执行的下一步。',
 posthog:'将产品分析与开发者工具结合，用插画和数据界面构成鲜明的识别度。',
 raycast:'以紧凑命令入口与深色材质表达桌面效率工具的操作方式。',
 resend:'通过克制排版、代码示例和清楚的文档入口展示邮件 API 产品。',
 sentry:'以数据密集的监控视图和高辨识度强调色，组织错误与问题处理信息。',
 supabase:'用深色画布、绿色强调与代码内容展示面向开发者的后端服务。',
 superhuman:'围绕邮件处理和键盘操作呈现效率工具，强调紧凑而清楚的信息层级。',
 vercel:'以黑白、几何排版与代码示例表达前端部署平台的产品体系。',
 warp:'以终端命令块为中心，组织输入、历史和上下文等开发操作。',
 zapier:'通过温暖橙色、流程示例和清楚的步骤说明自动化产品。',
 clickhouse:'以黄色强调、技术文档和数据内容构成分析数据库的视觉语言。',
 composio:'围绕工具连接与集成场景组织界面，用不同色彩区分连接对象。',
 hashicorp:'以严整排版、黑白对比与产品分区呈现基础设施工具体系。',
 mongodb:'围绕数据开发组织产品与文档，通过绿色强调和内容层级引导浏览。',
 sanity:'用鲜明红色、编辑式排版和内容示例介绍可组合的内容平台。',
 stripe:'结合渐变、精细排版和结构化示例，呈现支付与开发者产品。',
 airtable:'以彩色标识和表格结构展示协作数据，适合观察复杂信息的友好呈现。',
 cal:'以中性配色、留白和明确的时间信息组织预约与日程安排。',
 clay:'围绕数据工作流与信息整理，用清楚的模块关系说明产品能力。',
 figma:'通过明亮色块、协作画布与灵活排版展示设计生产工具。',
 framer:'以丰富的页面示例与大幅作品视觉，呈现建站工具的创作能力。',
 intercom:'围绕客服对话和用户支持组织产品信息，强调消息与操作的关联。',
 miro:'以便签、画布与协作内容说明团队工作方式，观察大空间中的信息组织。',
 notion:'以接近文档的界面、克制色彩和清楚的区块层级承载知识与协作。',
 pinterest:'通过连续图像网格和简洁导航组织灵感，突出浏览与发现体验。',
 webflow:'通过作品展示与编辑器示例介绍网页构建工具，连接视觉设计和发布。',
 coinbase:'以明确的蓝色强调、结构化信息与清楚操作组织数字资产产品。',
 kraken:'用鲜明品牌色和对比排版组织交易产品的功能与市场信息。',
 revolut:'以大幅产品画面、紧凑卡片和明确入口展示金融应用的不同场景。',
 wise:'围绕转账与货币信息，用清晰数字、绿色强调和直接操作降低理解成本。',
 airbnb:'以真实场景图像、圆润控件与清楚的搜索路径组织住宿探索。',
 apple:'通过大幅产品视觉、充足留白与分段叙事展示产品细节。',
 bmw:'以影像、精细排版和产品配置入口，组织汽车品牌与车型展示。',
 ibm:'通过严谨网格、技术内容和系统化导航表达企业产品与服务。',
 nvidia:'以黑绿品牌色、硬件图像和技术信息建立计算产品的展示层级。',
 spacex:'以沉浸影像、强对比文字和纵向叙事呈现航天项目。',
 spotify:'以高辨识度色彩、专辑封面与内容分组组织音乐发现。',
 uber:'通过黑白对照、服务场景与明确表单入口组织出行产品。',
};
const styleNotes=[
 ['极简与瑞士风格','用网格、留白和清晰字体组织信息，让内容本身成为视觉中心。'],
 ['新拟物','以同色表面和柔和内外阴影表现控件的凹凸与可操作性。'],
 ['玻璃拟态','用透明层、背景模糊与细边界构成前后层次。'],
 ['野兽派','以直接排版、粗线条和明确对比呈现内容，保留原始界面的力量感。'],
 ['3D 与超写实','把立体物体与真实材质作为视觉主角，观察光照和空间中的内容关系。'],
 ['活力色块','通过鲜明色块和模块组合组织信息，适合需要快速辨识的产品界面。'],
 ['OLED 深色界面','以深黑背景、有限亮色与清楚文字对比组织夜间使用的界面。'],
 ['无障碍与伦理设计','从可读文字、明确反馈和可理解操作出发，观察包容性的界面组织。'],
 ['粘土拟态','通过圆润形体、柔和体积与明亮色彩营造可触摸的控件感。'],
 ['极光界面','以流动色彩与柔和光影为视觉背景，保留清楚的前景内容。'],
 ['复古未来主义','结合早期科技图像与未来感排版，形成带有时代记忆的界面。'],
 ['扁平设计','依靠颜色、间距与几何形状区分层次，减少材质和阴影装饰。'],
 ['拟物设计','借助熟悉物件的材质与结构表达交互，让功能具有现实参照。'],
 ['液态玻璃','以透明度、折射感和流动轮廓呈现空间中的控件与内容。'],
 ['动效驱动','利用转场、入场和状态变化串联信息，观察运动如何解释操作。'],
 ['微交互','聚焦按钮、输入和状态反馈等细节，让操作结果更容易被感知。'],
 ['包容性设计','围绕多样的能力与使用情境安排内容，兼顾清晰表达和替代操作。'],
 ['零界面','减少可见控件，研究自然输入和上下文反馈如何承载任务。'],
 ['柔和界面演进','在轻量阴影、圆角和低饱和配色之间建立亲和而清楚的层次。'],
 ['首屏主视觉','将主要信息和行动入口集中在首屏，用明确视觉引导继续探索。'],
 ['转化导向','围绕用户决策路径安排说明、行动与反馈，强调完成目标所需的信息。'],
 ['丰富功能展示','通过分区和逐层展开呈现多项能力，让复杂产品保持可浏览性。'],
 ['简洁直达','压缩表达路径，让标题、关键说明和主要动作直接呈现。'],
 ['社会证明导向','研究评价与案例的呈现方式；原站演示中的人物和数字不构成真实背书。'],
 ['交互式产品演示','让用户通过可操作示例理解产品，连接介绍文字与实际行为。'],
 ['信任与权威','通过清晰的组织、出处与服务说明建立可信赖的阅读路径。'],
 ['叙事驱动','按故事顺序组织页面内容，将背景、过程和行动串联起来。'],
 ['数据密集仪表板','将多组指标、表格与筛选集中在工作面上，强调扫描与比较效率。'],
 ['热力图','通过颜色密度表达数值差异，帮助发现分布与集中区域。'],
 ['管理概览','集中展示决策所需的核心信息，并保留通往明细的浏览路径。'],
 ['实时监控','围绕持续变化的状态安排指标、趋势与异常反馈。'],
 ['下钻分析','从总体视图逐步进入细分信息，保持筛选条件和返回路径清楚。'],
 ['对比分析','将多个对象放在一致尺度上，帮助用户识别变化与差异。'],
 ['预测分析','区分历史数据与预测结果，让趋势和假设保持可理解。'],
 ['用户行为分析','围绕路径、事件与分布组织使用数据，帮助观察产品中的行为。'],
 ['财务仪表板','以金额、时间与分类组织财务数据，强调数字对齐和可比较性。'],
 ['销售分析','围绕销售阶段、结果和趋势安排信息，便于从概况进入细节。'],
 ['新野兽派','结合高对比色块、粗边框与直接排版，突出页面的结构和个性。'],
 ['便当盒网格','用不同大小但协调对齐的模块容纳信息，让主次关系一目了然。'],
 ['Y2K 风格','以千禧年代的科技语汇、亮色与实验性字体构成视觉表达。'],
 ['赛博朋克','通过深色场景、霓虹强调与技术式排版构成未来都市氛围。'],
 ['有机亲自然','运用自然色彩、柔和轮廓与舒展间距，营造更平静的浏览体验。'],
 ['AI 原生界面','围绕对话、建议与生成结果组织交互，强调状态和用户控制。'],
 ['孟菲斯风格','以几何图案和大胆配色打破单调节奏，突出轻快的图形表达。'],
 ['蒸汽波','结合复古数码色彩与怀旧图像语汇，形成独特的年代感。'],
 ['立体层叠','通过尺度、遮挡与景深建立层次，观察空间关系如何辅助理解。'],
 ['夸张极简','用很少的元素和显著的尺度对比表达重点，放大单一视觉主张。'],
 ['动态字体','让文字的运动、节奏与编排承担叙事，观察可读性与表现力的平衡。'],
 ['视差叙事','通过不同层的移动速度连接段落，让滚动成为叙事的一部分。'],
 ['瑞士现代主义 2.0','延续理性网格与字体秩序，并结合现代屏幕上的灵活布局。'],
 ['科幻 HUD','以仪表、线框与状态信息构成虚构控制界面的视觉语汇。'],
 ['像素艺术','使用离散网格、像素字形和有限色彩呈现复古数字风格。'],
 ['便当式信息网格','通过模块尺寸与内容组合建立清楚层级，适合多类型信息并置。'],
 ['新野兽派变体','以鲜明色块和直接的组件轮廓组织页面，强调明确的操作区域。'],
 ['空间界面','将内容放入具有纵深的场景，研究材质、视角和空间控件的关系。'],
 ['电子墨水与纸感','用接近纸张的底色与高可读文字，形成专注、安静的阅读体验。'],
 ['Z 世代极繁','结合拼贴、贴纸和高密度图形，呈现自由而富有节奏的表达。'],
 ['仿生与有机 2.0','从自然形态和生长节奏提取界面语言，观察流动与结构的配合。'],
];
const docs=await parallel(entries.filter(e=>!e.slug.startsWith('uiuxpro-')),async entry=>[entry.slug,await text(`https://raw.githubusercontent.com/VoltAgent/awesome-design-md/${upstreamRevision}/design-md/${entry.slug}/DESIGN.md`)]);
const docBySlug=new Map(docs);
const licenseText=await text(`https://raw.githubusercontent.com/VoltAgent/awesome-design-md/${upstreamRevision}/LICENSE`);
if(!licenseText.startsWith('MIT License')||!licenseText.includes('2026 VoltAgent'))throw Error('License changed; review required.');
const licenseAppendix='\n\n## VoltAgent MIT 许可\n\n```text\n'+licenseText.trim()+'\n```\n';
const result=entries.map(entry=>{
 const template=entry.slug.startsWith('uiuxpro-'),number=template?Number(entry.slug.split('-')[1]):0;
 const note=template?styleNotes[number-1]:null;
 const slug='vibeui-'+entry.slug.replaceAll('.','-');
 const templatePath=template?entry.files.preview.replace('extra/uiuxskillProMax/',''):'';
 const previewUrl=template?'https://yuanfu8899.github.io/uiuxskillProMax/'+templatePath:'https://vibeui.top/'+entry.files.preview;
 const source=template?{name:'yuanfu8899 · UI/UX Pro Max',url:`https://github.com/yuanfu8899/uiuxskillProMax/blob/${templateRevision}/${templatePath}`}:{name:'VoltAgent · 生成式设计示例',url:`https://github.com/VoltAgent/awesome-design-md/blob/${upstreamRevision}/design-md/${entry.slug}/preview.html`};
 const creator=template?{name:'yuanfu8899 / uiuxskillProMax',url:`https://github.com/yuanfu8899/uiuxskillProMax/tree/${templateRevision}`}:{name:'VoltAgent / awesome-design-md',url:`https://github.com/VoltAgent/awesome-design-md/tree/${upstreamRevision}/design-md/${entry.slug}`};
 const production=template?'由 UI/UX Pro Max Skill 生成的示例 UI；仓库未明确授予开放使用许可。':'从真实官网提取设计规范，再据此生成演示 UI；不是品牌官方模板或官网原页面。';
 const license=template?{name:'未确认开放许可',url:'https://github.com/yuanfu8899/uiuxskillProMax',status:'unconfirmed'}:{name:'MIT · VoltAgent',url:`https://github.com/VoltAgent/awesome-design-md/blob/${upstreamRevision}/LICENSE`,status:'verified'};
 const title=template?note[0]:entry.name;
 const collection={name:'VibeUI',url:'https://vibeui.top/style.html?slug='+encodeURIComponent(entry.slug)+'&lang=zh'};
 return {id:slug,slug,title,summary:template?note[1]:brandDescriptions[entry.slug],category:taxonomy[entry.categoryKey],tags:template?[entry.name,taxonomy[entry.categoryKey],'风格模板']:[entry.name,'品牌参考','浅色 / 深色'],palette:entry.colors,source,creator,...(!template?{referenceSite:{name:entry.name,url:entry.sourceSite.url}}:{}),production,previewPolicy:template?'external-only':'embed',collection,
 previewUrl,websiteUrl:template?previewUrl:entry.sourceSite.url,image:'',license,
 provenance:{verifiedAt:stamp,evidenceUrl:template?`https://github.com/yuanfu8899/uiuxskillProMax/blob/${templateRevision}/README.md`:`https://github.com/VoltAgent/awesome-design-md/blob/${upstreamRevision}/design-md/${entry.slug}/README.md`,note:template?'示例文件可追溯至 yuanfu8899/uiuxskillProMax；其 README 说明页面由 UI/UX Pro Max Skill 生成，但未提供明确开放许可。本站仅提供原创摘要、事实目录和原作者外链，不自动嵌入或复制其源码、图片及说明正文。':'品牌网站是风格参考。VoltAgent 从真实官网提取设计规范，再生成示例 UI，VibeUI 收录了这些文件；已核对历史版本文件内容一致。这不是品牌官网原页面或官方模板。MIT 声明适用于仓库内相应代码与文档，不授予品牌商标、专有图片或字体的使用权，也不构成对全部素材权利的保证。'},
 referenceUrls:template?[]:[{name:'上游规范与示例项目 · VoltAgent',url:`https://github.com/VoltAgent/awesome-design-md/tree/${upstreamRevision}`},{name:'VibeUI 收录版本',url:`https://github.com/Charlo-O/awesome-design-md/tree/${revision}/design-md/${entry.slug}`}],
 previewVariants:[{label:'默认',url:previewUrl},...(entry.files.previewDark?[{label:'深色',url:'https://vibeui.top/'+entry.files.previewDark}]:[])],
 typography:template?'':Object.entries(entry.fonts).filter(([,value])=>value).map(([key,value])=>`${key}: ${value}`).join('\n'),
 prompt:template?'':`参考下方由 VoltAgent 从 ${entry.name} 官网提取整理的设计规范，为我的产品设计一个独立界面。这是第三方生成式设计研究，并非品牌官方模板。保留规范中的布局层次、间距与颜色关系，替换为自己的内容与品牌。不要复制原站商标、人物、专有图片或未获授权的字体。请补齐响应式布局、键盘操作、减少动态效果和真实数据的空状态。设计参考：${entry.sourceSite.url}；规范来源：VoltAgent/awesome-design-md（MIT）。`,
 specification:template?'':`> 本设计研究由 VoltAgent 从品牌官网提取规范，并据此生成演示 UI，VibeUI 收录；不是品牌官方模板或官网原页面。仓库代码和文档声明 MIT 许可，不扩大品牌商标、图片及字体的权利。风格参考站：${entry.sourceSite.url}\n\n${docBySlug.get(entry.slug)}\n\n---\n\n原始规范：https://github.com/VoltAgent/awesome-design-md/blob/${upstreamRevision}/design-md/${entry.slug}/DESIGN.md\n\n生成说明：https://github.com/VoltAgent/awesome-design-md/blob/${upstreamRevision}/design-md/${entry.slug}/README.md\n\n收录版本：https://github.com/Charlo-O/awesome-design-md/tree/${revision}/design-md/${entry.slug}\n\n许可：https://github.com/VoltAgent/awesome-design-md/blob/${upstreamRevision}/LICENSE\n`+licenseAppendix,
 };
});
if(result.some(e=>!e.title||!e.summary))throw Error('Missing authored catalog copy');
if(new Set(result.map(e=>e.slug)).size!==112)throw Error('Duplicate slugs');
const counts=Object.fromEntries(Object.values(taxonomy).map(category=>[category,result.filter(e=>e.category===category).length]));
await mkdir(path.join(root,'src/lib/design-imports'),{recursive:true});
await mkdir(path.join(root,'docs/licenses'),{recursive:true});
await writeFile(path.join(root,'src/lib/design-imports/vibeui.json'),JSON.stringify(result,null,2)+'\n');
await writeFile(path.join(root,'docs/licenses/VoltAgent-awesome-design-md-MIT.txt'),licenseText);
console.log(JSON.stringify({imported:result.length,licensedDocuments:docs.length,remoteOnly:result.length-docs.length,categories:counts},null,2));
if(process.argv.includes('--verify-links')){
 const links=result.flatMap(entry=>entry.previewVariants.map(preview=>preview.url));
 const checks=await parallel(links,async url=>{try{const response=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(20000)});return {url,status:response.status,frameOptions:response.headers.get('x-frame-options'),csp:response.headers.get('content-security-policy')}}catch(error){return {url,status:0,error:String(error)}}});
 const failed=checks.filter(item=>item.status!==200);
 const embeddingRestrictions=checks.filter(item=>item.frameOptions||item.csp?.includes('frame-ancestors'));
 console.log(JSON.stringify({checked:checks.length,failed,embeddingRestrictions},null,2));if(failed.length)process.exitCode=1;
}
