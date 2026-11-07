// Public implementation notes, based on the IAVSE source inspected on 2026-11-07.
export const iavseDesignGuides = [
 {
  slug:'iavse-design-system',title:'IAVSE 设计系统：从界面到空间',summary:'统一透明导航、浅色产品叙事、通栏资源目录与中性 Bento 后台，并给出可复用的完整提示词。',
  body:`# IAVSE 设计系统：从界面到空间

IAVSE 把作品、知识与个人空间放在同一个网站。首页负责建立印象，博客空间负责探索，资源首页负责解释功能，目录负责查找，后台负责处理任务。它们共用字体、颜色与控件，但不需要具有相同的信息密度。

## 视觉基础

- 公共页面以白色和浅灰为主；正文接近 #1d1d1f，辅助文字接近 #6e6e73，操作使用克制的品牌蓝。色值是本次设计建议，实际以项目语义变量为准。
- 排版使用系统无衬线字体。产品主标题用 clamp 控制在 44–88px，正文 17–19px，辅助信息 12–14px。标题行数预先确定，字体加载与动画不改变文字布局。
- 间距以 4px 为基础；主要章节采用 64–120px 的留白，目录卡片采用 16–24px 间隔。控件与图标尺寸在各页面一致。
- 导航与公告分层：非首页公告在最上方，以黑底白字展示真实更新，可关闭；导航是透明表面与背景模糊；首页顶端保持轻量，向下滚动后增加模糊以保证文字可读。
- 后台使用中性背景与 16px 圆角 Bento 卡片。主要待办面积最大，次要统计缩小，低频功能收进侧栏。

## 信息结构

资源首页说明文档、Skill、UI 设计与网站工具能帮用户完成什么。具体条目进入对应目录后展示：通栏网格、横向分类、紧凑可展开搜索、明确来源与可复制内容。不要把完整目录再次塞回产品介绍首页。

UI 设计条目由本地原创预览、风格摘要、配色、排版、布局、动效、完整提示词和设计规范组成。外部灵感标注原始站点；本地示例不是外站截图。Skill 的推荐依据是具体任务适配，不宣称存在对所有任务都最好的技能。

## 动效规则

交互的响应先于装饰。按钮反馈约 120–180ms，面板约 200–280ms，章节入场约 500–700ms。优先 transform 和 opacity；大面积模糊保持静态，不逐帧改变 blur 半径。页面保留原生滚动与后退，不要求用户逐屏停留。

GSAP 动画在组件范围内创建，并在卸载时 revert；ScrollTrigger 只更新必要进度。默认不对英雄标题分字、逐行移位或反复重播。reduced-motion 下直接显示最终内容。快速滚动越过章节时及时落到最终状态。

## 可直接复制的总提示词

为 [项目名称] 创建一个以作品、知识与个人空间为中心的网站。沿用 IAVSE 的浅色、留白与光学质感，使用自己的内容、标志和素材。

建立五类页面：建立印象的首页、可探索的空间画廊、介绍能力的资源产品页、便于筛选的通栏目录、聚焦待办的 Bento 后台。公共页面使用系统无衬线字体，中性白灰与少量品牌色。统一图标、控件、焦点和错误状态。非首页将黑色可关闭公告放在透明导航上方；首页滚动后导航获得模糊表面。

首页以真实有厚度的玻璃模型作为主视觉；空间画廊使用 CSS 3D 页面卡片与移动相机；资源介绍用原创可交互场景解释文档、Skill、设计与工具。每个场景只表达一个主题。内容持续处于正常文档流，用户能直接滚到底。动态视觉离屏暂停，手机降低像素与场景复杂度，reduced-motion 保留完整信息。

先输出信息架构、语义 design tokens 和主要状态，再实现代码。验证 390、768、1440px，浅色、深色、刷新、路由返回、键盘和快速滚动。不要使用虚构用户评价、业务数据或失效下载按钮。最后交付实际修改、测量方法及仍需人工确认的素材。

## 落地顺序

1. 建立 surface、text、border、accent、focus、danger 等语义 tokens，公共页与后台可映射到不同表面。
2. 先完成无动画版本的结构与真实功能，再加轻量反馈和空间场景。
3. 为图片、视频、卡片预留尺寸；搜索展开时只改变控件占用，不让页头跳动。
4. 用真实路由检查刷新、返回与筛选恢复；主题切换同时覆盖 Portal 中的弹窗和菜单。
5. 在目标设备录制帧时间与长任务；根据测量降低像素、材质复杂度或可见预览数量。

## 来源与核对

本说明基于 IAVSE 项目中的 home-glass.ts、V2Atmosphere.tsx、blog-gallery-space.mjs、gallery-scheduler.ts 与现有页面结构整理，核对日期 2026-11-07。外部原则参考 [Apple HIG](https://developer.apple.com/design/human-interface-guidelines)、[GSAP 文档](https://gsap.com/docs/v3/) 与 [Three.js](https://threejs.org/)。
`
 },
 {
  slug:'iavse-optical-glass-reproduction',title:'复现 IAVSE 首页的 Blender 光学玻璃',summary:'从闭合镜片建模、GLB 导出到 Three.js 折射、灯光与按需渲染，区分现有参数与重建建议。',
  body:`# 复现 IAVSE 首页的 Blender 光学玻璃

当前首页使用真实 GLB 几何体与 Three.js 实时材质。它不是把一张玻璃背景图铺满屏幕，也不是浏览器里运行 Blender。Blender 负责离线形体；WebGL 负责实时显示与交互。

## 当前项目已经有什么

模型位于 public/models/iavse-optical-surface.glb 与 iavse-optical-surface-mobile.glb。材质、灯光与场景入口在 src/lib/home-glass.ts，生命周期与交互调度在 src/components/V2Atmosphere.tsx。网站源码内有导出的 GLB；本指南未发现随源码交付的原始 .blend 或完整原始建模脚本，因此下面是可重建同类效果的方法，不声称能从提示词恢复原作者的全部制作过程。

当前实现采用 PerspectiveCamera，FOV 40°、近远裁面 0.1/100、相机 z=8.2，颜色输出为 sRGB，ACESFilmicToneMapping，exposure=1。模型主面与含 PolishedRolledEdge 名称的边缘材质分开处理：

| 参数 | 主面 | 卷边 |
| --- | --- | --- |
| transmission | 1 | 1 |
| ior | 1.46 | 1.5 |
| thickness | 0.58 | 0.42 |
| roughness | 0.014 | 0.010 |
| dispersion | 0.26 | 0.8 |
| metalness | 0 | 0 |

材质为白色，attenuationColor 为 #e9f4ff，attenuationDistance 为 24。参数依赖模型单位、光照与相机，换模型后需要重新校准。项目还通过定制 shader 控制局部高光与边缘光谱，不应只复制数字便认为画面会完全相同。

## Blender 重建步骤

1. 创建一片横向延展的非对称曲面。正面轮廓应大而平缓，中心区域允许文字叠加，曲率重点放在远端与边缘。
2. 为表面增加真实厚度并闭合边界。检查法线朝外、避免自相交和零厚度，玻璃折射需要正确的前后表面。
3. 制作窄而圆润的卷边，分配独立材质并命名 PolishedRolledEdge。边缘负责细光谱，主面负责广阔的透明感。
4. 使用足够细分获得平滑轮廓，再检查是否可以通过法线和平滑降低顶点数。应用必要的变换，保证导出单位一致。
5. 输出桌面和手机两套 GLB。手机版本保留轮廓与卷边，减少无助于外观的内部细节。先验证原始导出，再考虑压缩。
6. 在中性环境下查看折射与高光。不要依赖仅存在于 Blender 离线渲染器中的节点来定义浏览器必须保留的效果。

## 可直接复制的建模与前端提示词

为 [网站名称] 制作原创光学玻璃首页。先在 Blender 中建立一片有真实厚度、法线一致的闭合非对称镜片，主曲面柔和，卷边很窄，整体从画面左下伸展至右上。将卷边材质命名 PolishedRolledEdge，与主面独立。视觉是透明镜片、细腻色散和局部太阳高光，不是蓝色透明矩形。中心留出稳定可读的文案安全区。

导出桌面和移动 GLB，并写出导出设置、模型单位和简化记录。在前端用 Three.js 动态加载 GLB，建立 sRGB 输出、ACES tone mapping 和 PerspectiveCamera。以 transmission=1、ior 约 1.46–1.5、roughness 约 0.01–0.02 为起点，根据模型厚度校准；用自有渐变环境生成 PMREM。为窄卷边与主体设置不同色散，不使用他人 HDR 或模型。

指针仅缓慢改变光源或小角度姿态，滚动连续映射场景进度。文字先呈现且不逐行跳动；页面保留原生滚动。场景离屏、标签页隐藏、用户暂停时停止绘制。模型下载支持 AbortSignal，路由离开释放 GPU 对象。低性能与 reduced-motion 使用静态后备。交付建模文件、两份 GLB、渲染组件、材质解释与真实设备性能记录。

## 加载与性能

当前实现缓存 GLB 的 ArrayBuffer，不跨页面缓存活的 WebGLRenderer 或 GPU 材质。加载可取消，解析和 GPU 初始化之间主动让出主线程，避免切回首页时集中阻塞。

当前像素预算是桌面约 400 万、宽度小于 768px 的移动约 180 万；像素比受设备 DPR、上限 2 与预算共同限制。帧循环按脏状态、连续运动与可见性启动，停止时取消 requestAnimationFrame。不要用固定 30fps 掩盖输入延迟，也不要给所有设备强制最高像素比。

已有 shader 优化包含针对特定 Three.js 版本的防护。升级库时重新验证，不能盲目把 ShaderChunk 字符串替换应用到任意版本。

## 验收

冷启动先看到稳定文本和后备画面；玻璃出现时不改变内容尺寸。快速滚到底后停止场景绘制，返回首屏能恢复。反复进出页面不累积 renderer、纹理或事件监听器。检查移动横竖屏、显卡上下文丢失、网络中断与 reduced-motion。

## 来源

本项目源码核对日期 2026-11-07。基础参考：[Blender 灯光](https://docs.blender.org/manual/en/latest/render/lights/light_object.html)、[Three.js 文档](https://threejs.org/docs/)。本方案为 IAVSE 自有实现说明，不提供其他网站的模型或纹理。
`
 },
 {
  slug:'iavse-spatial-gallery-reproduction',title:'复现博客空间的可交互纵深画廊',summary:'固定卡片、移动相机，用 CSS 3D 与渐进预览实现可拖动、可聚焦的浅色空间。',
  body:`# 复现博客空间的可交互纵深画廊

当前 IAVSE 博客空间主要使用 CSS 3D、卡片与隔离的主页预览。它与首页的 Blender/Three.js 玻璃是两种实现。卡片固定分布在世界坐标中，相机移动；点击某张卡片时，相机靠近它。

## 实际结构

src/lib/blog-gallery-space.mjs 保存空间布局、移动端布局、相机与裁面计算。gallery-scheduler.ts 和 gallery-frame-ready.ts 管理预览加载。桌面和移动各有一组最多 12 个卡片位置，位置包含 x/y/z 与俯仰、偏航、翻滚角。

宽度小于 720px 时使用紧凑模式，透视距离 760px；其余为 1000px。紧凑卡片宽度取 min(视口宽度×0.58,280px)，桌面取 min(视口宽度×0.31,400px)。聚焦宽度分别取 min(视口宽度×0.9,800px) 和 min(视口宽度×0.68,800px)。这些数值针对现有舞台，可按新内容调整。

聚焦深度遵循 perspective×(1−cardWidth/focusWidth)。近裁面保护要计算旋转后各角点的深度，不能只检查卡片中心；否则倾斜卡片靠近镜头时会突然被裁掉。

## 可直接复制的提示词

为 [博客或作品集合] 创建一个浅色 CSS 3D 空间画廊。顶部导航与下方产品展示仍然在普通文档流中。舞台有清晰的进入、拖动、聚焦与退出方式，不锁住整个页面滚动。

把最多 12 张真实页面预览固定放入不同深度，保持适度倾斜，中央卡片清晰，远端卡片较小。通过移动相机实现拖动与聚焦，不要每帧重新布局所有卡片。桌面透视约 1000px，手机约 760px，并提供独立的手机排布。点击卡片时相机平稳靠近，Escape 或返回控件回到浏览位置。移动端保留纵向滚动；无精细指针时不要强依赖 hover。

预览有固定尺寸的静态后备，真实 iframe 隔离加载，优先当前选择与首排，每次最多初始化两个。页面切换后取消旧请求与动画。键盘 Tab 可遍历卡片并按 Enter 聚焦，所有控件有清楚名称，reduced-motion 直接切换最终视角。用户可以随时直接滚到下方功能介绍与页脚。

完成后测试快速拖动、连续点选、滚出视口、返回页面、横竖屏与网络缓慢。输出空间参数、状态模型、生命周期和实际测得的问题。

## 实施步骤

1. 先实现静态卡片和普通列表后备，验证卡片内容与目标链接。
2. 舞台建立 perspective，世界容器启用 preserve-3d。根据容器尺寸计算世界坐标，窗口尺寸变化时重新计算一次。
3. 分离 pointer intent 与绘制状态。移动事件只记录目标，相机在 requestAnimationFrame 内阻尼趋近；不在每个事件中读取卡片边界。
4. 区分浏览、拖动、聚焦与预览交互。拖动超过阈值后取消点击，避免抬手误打开页面。
5. 预览调度与相机动画分开。当前卡片优先，远处仅加载后备；预览就绪替换时保持外层尺寸。
6. 下方产品章节使用普通滚动入场，不让画廊的事件处理蔓延到整个 document。

## 性能与可访问性

少量 CSS 3D 图层也可能消耗 GPU 内存。只为必要对象保留 will-change，离屏停止相机动画，预览页面限制动画与嵌套背景。iframe 有可读 title，加载失败时保留卡片链接；手机提供直接访问的入口。动画不能代替内容与导航。

## 来源

IAVSE 当前实现，核对日期 2026-11-07。概念参考：[MDN CSS transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)、[Lusion About](https://lusion.co/about/) 的空间探索方式。IAVSE 的布局、卡片、源码与提示词独立整理，不使用 Lusion 的资产。
`
 },
 {
  slug:'iavse-motion-production',title:'把产品展示做成可交互短片',summary:'把实时交互与可导出的产品短片分开设计，建立分镜、动画时间线、播放控制和轻量加载方案。',
  body:`# 把产品展示做成可交互短片

产品叙事需要可理解的节奏。一个场景说明一种能力，一个转场连接前后关系。实时交互负责让用户探索，预渲染短片负责稳定的镜头和细节，两者共享视觉语言但不必使用同一条运行时。

## 当前已实现的短片与交互

本次已交付原创 HyperFrames 产品短片，组件为 src/components/ProductCinema.tsx，样式为 src/app/product-cinema.css。源工程位于 scripts/media/creative-journey，包含 index.html、DESIGN.md、README.md 和生成资源版本的 prepare-resources.mjs。

短片长 14 秒，1280×720、30fps、静音，采用白银摄影棚与三章叙事：设计方向、文档与 Skill、个人空间。资源首页版本把第三章改成网站与工具。两份部署文件分别为 public/media/product/iavse-creative-journey.mp4 和 iavse-resource-journey.mp4，并各有 WebP 封面。这里的分层空间是 CSS 3D 与 GSAP 确定性时间线，不是 Blender 模型，也不是外站录屏。

网页可切换“看短片”和“探索 3D”。短片支持播放、暂停、进度拖动、章节与重播；实时空间支持拖转、章节选择、键盘可操作的角度滑杆与重置。下载接近视口且允许动态时开始，离屏与隐藏时暂停，默认播放结束后停止。reduced-motion 默认保留静态封面，用户仍可主动播放。说明文字与链接在视频外以 HTML 提供。

## 分镜模板

| 时间 | 画面 | 用户理解 |
| --- | --- | --- |
| 0–3 秒 | 一张文档从空白进入清晰排版 | 整理知识 |
| 3–6 秒 | Skill 连接到文档旁的任务 | 把方法交给 AI |
| 6–10 秒 | 设计规范映射成可预览的页面 | 让方向变成界面 |
| 10–14 秒 | 页面进入个人空间，镜头拉开 | 将作品发布到自己的主页 |

时间是制作建议；正式短片应根据实际内容与配音调整。场景素材使用自己的组件、文字和图像，示例数据明确为示例。

## 可直接复制的提示词

为 [产品名称] 制作一段约 14 秒、静音也能理解的产品展示。视觉沿用白色与浅灰背景、透明玻璃、少量品牌蓝。用原创界面演示文档、Skill、设计规范和个人空间之间的工作流程。

先交付分镜与每个镜头表达的信息，再使用 HyperFrames 的 HTML 组件和 GSAP 时间线制作。固定 16:9 主画幅，同时设计 9:16 的重新构图，不直接裁掉关键内容。标题一次只出现一句，正文保持可读；几何、镜头与界面过渡有连续性，避免快速闪白、突然缩放与无意义粒子。

网站同时提供视频 poster、播放/暂停、重播和 reduced-motion 静态替代。首屏信息先由 HTML 呈现，不等待视频；进入视口附近才加载或播放，离屏暂停。短片只负责说明功能，真正按钮仍使用 HTML 并能被键盘访问。输出源时间线、字体与素材清单、WebM/MP4、手机版本和封面，说明实际渲染成功的文件。

## 从源工程重新导出

先准备 Node 24+、FFmpeg 与 HyperFrames 0.9.20。在仓库根目录运行：

    npx --yes hyperframes@0.9.20 check scripts/media/creative-journey
    npx --yes hyperframes@0.9.20 snapshot scripts/media/creative-journey --at 2.8,7.1,12.6 --output /tmp/iavse-film-review
    npx --yes hyperframes@0.9.20 render scripts/media/creative-journey -o public/media/product/iavse-creative-journey.mp4 --fps 30 --quality high --workers 2 --strict --no-best-effort
    node scripts/media/creative-journey/prepare-resources.mjs
    npx --yes hyperframes@0.9.20 render scripts/media/creative-journey/.generated/resources -o public/media/product/iavse-resource-journey.mp4 --fps 30 --quality high --workers 2 --strict --no-best-effort

完整封面提取命令与渲染检查记录在源工程 README。重新导出后检查每章关键帧和最终停留帧，不能只检查进程退出成功。独立 9:16 短片是上面提示词的制作建议；当前交付为响应式展示的 16:9 文件，未声称已输出竖屏版本。

## 与网页交互连接

短片采用有开始和结束的时间线，用户可暂停与重播；网页则通过按压、拖动、切换示例等操作让能力真实可试。不要把按钮画进视频后宣称它是可交互控件。对少量关键参数进行实时映射，例如玻璃光源、画廊相机或规范主题；其余内容交给预渲染镜头。

如果使用 GSAP，显式指定每个场景的开始和结束，场景结束后清理临时图层。不要让多个独立无限循环同时占用主线程。滚动速度不应决定用户能否读完关键内容。

## 交付与验收

保存源文件及依赖版本，视频与封面预留固定比例。检查快速滚动时不重复下载、标签页隐藏时暂停、返回页面后按钮状态正确。手机在慢速网络下先显示封面和文字。自动播放只能静音且可暂停；有语音的信息附字幕或文字稿。

本页同时记录可复用方法与本次实际源工程。电影内容是原创功能示意，完整产品交互仍以站内实际页面为准。核对日期 2026-11-07。
`
 }
];
export default iavseDesignGuides;
