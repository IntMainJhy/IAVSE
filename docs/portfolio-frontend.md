# IAVSE 前端：独立细化的设计系统

[DESIGN.md](../DESIGN.md) 是当前平台唯一视觉规范。现有应用以 [DavidHDev/rbp-portfolio](https://github.com/DavidHDev/rbp-portfolio) 的公开实现为组件基线，固定来源版本为 `1581b9b8e5876f60e5eb844970747506980c4412`。当前 IAVSE 在该应用上独立调整字体、色彩、留白、卡片和背景。Cloudlight 仅作为清晰间距、文字层级、浅色表面与内容分组等通用原则的参考；此前直接迁移模板的方案已取消，未引入其代码、着色器、资产或许可证文件。

下文保留 Portfolio 接入与独立细化的历史记录；首页、共享壳层等后续变化以 [平台共享视觉迁移](platform-ui.zh-CN.md) 和 DESIGN.md 为准。关于页保留六张点阵拍立得、介绍、展开列表、使用说明、能力标签、物理技术栈与 Contact。资源总览在标题下展示四张手绘分类卡，桌面双列、手机单列，卡片下方保留 Contact。博客目录现已恢复原有 3D 空间开场、完整列表和产品功能展示。社区、目录、账号、管理和编辑器外壳共用 IAVSE 字体、颜色与控件，保留搜索、筛选、表格、表单、审核及编辑流程。

## 当前首页与共享顶栏

当前 `/` 由 [`IavseLanding.tsx`](../src/components/landing/IavseLanding.tsx) 呈现：首屏居中的标题、简介及下方的「社区／资源」液态玻璃胶囊 → 社区动态与投稿提示 → 可展开的四类精选资源 → 指定作者的真实公开博客预览与主页入口 → 页脚。旧资源侧栏组合和下文的 Portfolio Hero／Projects／Contact 首页属于历史实现；当前首页保留原有公开内容权限、空态／错误／重试、浮起卡片和入场机制，没有新增媒体或成员数据。

根运行时在首页与合格公共路由保留同一 [`IavseHeader`](../src/components/IavseHeader.tsx) 和单个 `GlassSwitch`。1100px 以上为单行桌面导航，768–1100px 将胶囊与主题置于第二行。767px 及以下，顶部为品牌与「更多」设置，底部为首页、社区、资源、博客和「我的」五项导航。三档顶栏占位分别为 72px、122px 和 56px 加顶部安全区。当前首页和顶栏均使用局部深色角色；主题控件复用现有文档偏好、cookie 和圆形过渡契约，来源归属保留。精确布局、字号、颜色和路由边界见 DESIGN.md 与[平台说明](platform-ui.zh-CN.md)。

## 来源组件与保留实现

| 基线来源 | 当前实现与独立调整 |
| --- | --- |
| `components/hero/hero.tsx`、`hero-ctas.tsx` | [`rbp/hero/`](../src/components/rbp/hero/)：保留分栏、方形预览、CTA 和入场；独立调整品牌问候、标题、正文、顶部留白和预览边框 |
| `components/projects/projects.tsx` | [`rbp/projects/projects.tsx`](../src/components/rbp/projects/projects.tsx)：保留 CSS columns、卡片内容层级、图片比例和悬停；独立调整分隔线、圆角、文字与表面 |
| `app/projects/page.tsx` | [`rbp/ProjectsPage.tsx`](../src/components/rbp/ProjectsPage.tsx)：保留介绍、Projects、Contact 顺序；独立调整标题比例和顶部留白 |
| `app/about/page.tsx`、`components/about/*` | [`rbp/AboutPage.tsx`](../src/components/rbp/AboutPage.tsx)、[`rbp/about/`](../src/components/rbp/about/)：保留拍立得、列表与物理交互；内容为产品介绍、使用说明和实际技术，介绍面板使用 IAVSE 白色表面 |
| `components/layout/nav.tsx` | [`rbp/layout/nav.tsx`](../src/components/rbp/layout/nav.tsx)：历史三链接胶囊与活动弹簧指示器保留源码；当前共享顶栏不挂载此组件，圆形主题揭示契约由新 ThemeToggle 沿用并保留归属 |
| `app/layout.tsx` 的框架标记 | [`site-frame.tsx`](../src/components/rbp/layout/site-frame.tsx)：本地提取的边框和角部组件 |
| `components/layout/smooth-scroll.tsx` | [`PortfolioRuntime.tsx`](../src/components/portfolio/PortfolioRuntime.tsx)：历史 Lenis 参数与生命周期接入见下文；当前运行时不再挂载 Lenis、旧导航或 PageBackdrop |
| `components/contact/*`、`components/ui/*` | [`rbp/contact/`](../src/components/rbp/contact/)、[`rbp/ui/`](../src/components/rbp/ui/)：保留收尾组合、按钮与动效原语；Contact 改为浅天蓝分组和独立详情表面，不再挂载流场 |
| `components/hero/portrait-morph.tsx` | [`PortraitMorph.tsx`](../src/components/portfolio/PortraitMorph.tsx)：保留图像变形与持续帧循环，图片为实际内置模板截图 |
| `app/globals.css` 与组件工具类 | [`rbp-template.input.css`](../src/styles/rbp-template.input.css) → [`rbp-template.css`](../src/app/rbp-template.css)：编译保留的工具类并隔离作用域，语义变量接入 IAVSE |
| IAVSE 独立实现 | [`page-backdrop.tsx`](../src/components/rbp/layout/page-backdrop.tsx) 与 [`iavse-system.css`](../src/app/iavse-system.css)：CSS 径向色场、渐隐遮罩与可选滚动时间线 |

[`ShaderFlow.tsx`](../src/components/portfolio/ShaderFlow.tsx) 仍保留于仓库，当前页面背景和 Contact 均不挂载它。`PortfolioCardBackdrop.tsx` 仍由未挂载的旧 HomeProductShowcase 引用，当前入口也不使用它。保留源码及来源声明不代表当前页面仍在运行这些背景。

应用使用 Next.js 15.5.28、React 19.2.8。当前安装树中的 Motion 为 **12.23.26**、Lenis **1.3.23**、OGL **1.0.11**、Matter.js **0.20.0**、Lucide React **0.562.0**；Tailwind CSS 和 CLI **4.1.18** 为样式编译依赖。精确依赖见 [`package-lock.json`](../package-lock.json)。现有 GSAP、Three.js 和编辑器依赖继续服务各自功能。

## 样式、字体与内容边界

以下颜色说明记录 Portfolio 基线阶段，当前中性黑／白与局部深色角色以 DESIGN.md 及 `iavse-application.css`、`iavse-landing.css`、`glass-controls.css` 为准。基线中的 [`iavse-system.css`](../src/app/iavse-system.css) 替代旧 `rbp-system.css`，是全平台语义变量与操作控件的实现入口。`--iavse-*` 角色区分画布、表面、正文、辅助文字、边框、焦点与浅色分组；既有业务模块颜色别名映射至这些角色。浅色为冷白画布、白色表面和蓝灰文字，深色为深蓝画布与分层表面。sky、sage、warm 用于明确内容分组，成功和错误保留语义色。选择区域在两种外观下均有单独填充。

字体使用已随仓库提供的 Geist 可变字体，CSS 别名为 **IAVSE Sans**，通过 `@font-face` 自托管；系统字体与 CJK 字体仍作为回退。这个别名表示平台字体角色，不表示 IAVSE 创作了字体。字体文件和 [OFL 声明](../public/fonts/design-artifacts/voltagent/geist-OFL.txt) 均保留。模板的 sans 和 serif 工具类解析到同一栈；Cormorant 艺术字继续作为独立品牌资产保留。

[`build-portfolio-styles.mjs`](../scripts/build-portfolio-styles.mjs) 编译模板工具类，输出 `@scope (.rbp-surface) to (.rbp-native)`；`npm run portfolio:styles` 可重建，`predev` 和 `prebuild` 自动运行。修改输入与组件，不手工维护生成文件。[`rbp-bridge.css`](../src/app/rbp-bridge.css) 处理宿主隔离、16px 根字号、导航不折行和主题映射。历史 `rbp-*` 文件名用于来源映射，当前视觉规则以 IAVSE tokens 和 DESIGN.md 为准。

根 [`layout.tsx`](../src/app/layout.tsx) 挂载 PortfolioRuntime 与 ApplicationReveal。历史 Portfolio 胶囊包含首页、资源、关于和外观按钮；当前运行时使用上节的常驻 `IavseHeader`，首页与关于沿用已有页面。桌面和平板沿用导航胶囊，手机使用底部导航。新 [`ThemeToggle`](../src/components/ThemeToggle.tsx) 沿用实际文档模式、持久 cookie 与原公开圆形主题揭示，保留来源注释，并处理减少动态、API 降级及过渡提交前的连续点击。管理中心和博客编辑器保留各自导航，作者博客与内置博客预览不挂公共胶囊。

[`PublicSite.tsx`](../src/components/PublicSite.tsx) 的 PublicFrame 将操作区域标为 `.rbp-native.rbp-application`；[`ResourceHub.tsx`](../src/components/ResourceHub.tsx)、[`AdminApp.tsx`](../src/components/AdminApp.tsx) 和 [`CommunityAdmin.tsx`](../src/components/CommunityAdmin.tsx) 也明确接入该区域。模板工具类重置在原生操作边界停止，IAVSE 应用样式则在作者博客根、保存的画布块、独立个人主页、博客主题和 React Flow 视口等内容边界停止。平台返回栏属于平台 UI；作者作品、第三方预览、上传图片和内置博客主题保留自己的外观。

旧平台皮肤及相互竞争的规范已清理，历史实现保存在 Git 历史。资源目录中的第三方设计规范仍是学习内容。[`iavse-design-guides.mjs`](../src/lib/iavse-design-guides.mjs) 提供当前 IAVSE 规范、入场与接入导读；已有历史 slug 保留以兼容链接。

## 页面与真实内容

- **历史首页：** [`PlatformHome.tsx`](../src/components/PlatformHome.tsx) 组合 Hero、Projects、Contact；四张卡片连接 UI 设计、AI Skills、社区和博客空间。Hero 与目录顶部留白均为手机 144px、small 断点起 192px。
- **历史首页：** Hero 标题使用 `clamp(34px, 4.1vw, 54px)`，正文为 19px / 1.6。方形预览外框 28px、内框 20px；项目卡片 20px、图片 14px。
- [`ResourceIntroduction.tsx`](../src/components/ResourceIntroduction.tsx) 在 `/resources` 以四张手绘分类卡进入 UI 设计、AI Skills、文档和网站与工具。各分类页用同款小插图标记目录标题，并提供筛选、搜索和来源信息。
- [`BlogSpacesPage.tsx`](../src/components/BlogSpacesPage.tsx) 挂载既有 [`BlogSpaceGallery.tsx`](../src/components/BlogSpaceGallery.tsx)，保留可环顾、走近和返回的 3D 空间及原有相机／预览逻辑。真实成员保留 `publicSpaces(req)` 过滤与 `/blog/:handle`，原创主页示例明确标记虚构人物，并使用 `/blogs/showcase/:handle` 及同渲染器的 `?embed=gallery` 预览。重置视角旁的原生展开列表列出全部入口，不受舞台 12 个空间的上限影响；减少动态时保留，Escape 关闭并返回摘要焦点。[`blog-gallery.css`](../src/app/blog-gallery.css) 恢复公开历史 `894bf4b` 中的空间结构，并仅将平台控件与材质接入当前中性角色；不改真实成员的已保存博客外观。显式 `?template=builtin` 继续提供原有编辑器模板示例。
- 画廊下方现由 [`BlogProductShowcase.tsx`](../src/components/BlogProductShowcase.tsx) 和 [`blog-space-product.css`](../src/app/blog-space-product.css) 呈现原创产品介绍，说明个人主页、作品、长文、资源、在线履历、编辑、草稿／发布与可发现性，并提供两项 FAQ 及真实编辑器／指南入口。静态画布结构图明确标注不可交互；旧下方外观切换、嵌入式画布演示、大幅预览和重复成员目录已移出当前渲染组合，相关历史及来源保留。
- Contact 外框为 28px、详情面板为 20px；介绍文字为 19px / 1.6，最大 38ch 并使用均衡换行。目录介绍同为 19px / 1.6。
- [`DesktopDownloadsPage.tsx`](../src/components/DesktopDownloadsPage.tsx) 的手机标题占用完整宽度；现有中文标题按逗号分成两个不拆分的语义短语，保留原文字，英文和日文标题保持原样。
- [`rbp/AboutPage.tsx`](../src/components/rbp/AboutPage.tsx) 的介绍面板为白色表面、24px 圆角。Experience/Education 名称只表示组件来源，不表示虚构的个人任职或学历。十个可拖动技术标签对应现有技术栈。
- [`portfolio-content.ts`](../src/lib/portfolio-content.ts) 与 [`rbp/about/copy.ts`](../src/components/rbp/about/copy.ts) 保存中英日内容。示例人物、模板预览和实际公开成员保持区分。

[`public/media/portfolio/`](../public/media/portfolio/) 中四张图片为实际页面截图：两张内置模板预览，以及未登录的 Skill 目录和社区。旁边的 JSON 记录页面与来源；刷新图片时同步维护来源记录。没有生成虚构用户或帖子。Hero 变形图片是视觉预览，不含随悬停切换的链接。

## 滚动、动效与回退

滚动入场（Scroll Reveal）在元素进入可视区域时触发；元素完整离开物理视口后，再从上方或下方进入会重播。仍可见时跨越入场阈值或根边距不会重新隐藏或重播。上移淡入（Fade In Up）从下方 12px、透明度 0 回到原位和完全可见；交错入场（Staggered Reveal）让同批内容依次出现，并限制等待时长。

共享策略在 [`rbp-motion.mjs`](../src/lib/rbp-motion.mjs)：缓动 `[0.22, 1, 0.36, 1]`，视口阈值 0.12、底部边距 -6%。[`motion-primitives.tsx`](../src/components/rbp/ui/motion-primitives.tsx) 的 FadeIn 默认使用受控滚动入场，持续 800ms，完整离开物理视口后才准备下一次入场；Hero 显式保留 mount 入场，ScaleUnblur 也保留挂载语义，为 `scale: 0.7`、`blur(20px)`、1 秒。Projects 每卡索引延迟为 60ms，由 FadeIn 限制在 210ms 以内。

[`application-reveal.tsx`](../src/components/rbp/ui/application-reveal.tsx) 通过 IntersectionObserver 和 Web Animations API 增强现有标题、卡片、列表及面板，不增加包裹层或移动表单控件。每轮入场持续 550ms，仅在完整离开物理视口后准备重播；同一个观察器批次按位置排序，各语义分组分别从首项计算 70ms 交错延迟，最大 210ms。博客产品介绍通过 `data-rbp-reveal-scope`、`data-rbp-reveal-group` 和 `data-rbp-reveal-item` 明确接入 21 个短小可读内容块，不将顶栏、画廊、静态示意图或完整的长章节设为入场对象。MutationObserver 继续发现新增结果；模板已有动效、可编辑内容和作者画布不重复处理，作者博客与预览边界保留。键盘焦点进入隐藏区域时立即显示，焦点停留期间保持可读。开启减少动态会取消未完成动画并显示内容；缺少相关 API 或 JavaScript 时直接保持可读。路由与查询变化会清理动画、事件和观察器。

历史 Portfolio 胶囊的活动指示器参数为 `stiffness: 380, damping: 32`；当前共享导航改用 GlassSwitch 的测量、滑动镜片与局部文字放大。新主题按钮继续沿用 700ms 圆形揭示契约。CTA 布局变化为 0.55 秒、文字变化 0.35 秒、复制状态图标变化 0.2 秒。Projects 悬停抬升 4px / 400ms，图片放大至 1.06 / 700ms。拍立得入场为 0.9 秒，延迟 `0.05 + index × 0.08` 秒，指针弹簧为 220 / 18 / 0.6；展开列表保留 0.5 秒高度变化。Matter.js 保留重力 1、恢复系数 0.35、摩擦 0.5、空气摩擦 0.025 和密度 0.0018，支持拖动和重置。

历史 Lenis 接入保留的参数为 `duration: 1.6`、`Math.min(1, 1.001 - Math.pow(2, -10 * t))`、纵向滚动、`smoothWheel: true`、`wheelMultiplier: 1`、`touchMultiplier: 2`，锚点偏移 -100px。`/blog/*`、`/blogs/showcase/*`、`/admin`、`/workspace` 及其子路由排除；表单、`data-lenis-prevent` 和展开详情区域保持原生滚动。路由变化销毁实例、事件与帧循环。

保留的历史 PageBackdrop 为独立 CSS 径向色场，高度桌面 830px、手机 780px，使用渐隐遮罩。支持 CSS 滚动时间线且未开启减少动态时，页面前 900px 滚动会将色场上移至 -60px、透明度降至 0.25；其他情况下为静态色场。当前共享运行时不挂载 PageBackdrop 或 Lenis，首页与公共壳层改用独立柔雾；Contact 不运行流场着色器。

PortraitMorph 仍使用 OGL，DPR 上限 2，进入/离开刚度 2.4 / 2.0。可见时即使变形已稳定，仍保留持续帧循环；后台标签页暂停，返回后继续。初始化时检测到减少动态或无悬停能力时显示静态图。WebGL 失败保留图片与可读内容。减少动态同时停止 Lenis、跳过对应入场与展开运动，并将物理标签呈现为静态换行列表。卸载清理事件、观察器、帧任务和 GPU 上下文。

## 验证与学习入口

代码验证入口为 `npm test`、`npm run build` 与 `npm run docs:check`。滚动入场和主题级联的回归分别见 [`rbp-scroll-reveal.test.mjs`](../test/rbp-scroll-reveal.test.mjs) 与 [`home-css-cascade.test.mjs`](../test/home-css-cascade.test.mjs)。视觉验证需覆盖首页、关于、资源总览、分类目录、文档、社区、账号、编辑器、管理、文件、法律、下载、博客目录和登录的桌面与手机界面，并检查深色、键盘焦点、减少动态和实际换行。此前 Portfolio 独立细化一轮的最终代码全量回归 **662/662** 和生产构建通过，包含 Contact 正文均衡换行及下载页中文短语分组的最终修正。验证结果只对应该轮代码与检查范围。

公开截图只发布未登录界面，来源与版本记录见[截图说明](screenshots/README.md)及相邻 `captures.json`。当前细化截图由工作区源码哈希定位，不将捕获前的基线提交称作最终实现版本。账号、编辑器、管理和文件的内部 QA 截图不进入公开截图目录。本地验证不代表生产部署、邮件投递或公开运营已验收。

阅读顺序：IAVSE tokens → Hero/Projects/About/Contact → 作用域编译脚本 → PortfolioRuntime → CSS 氛围背景与 PortraitMorph。产品约束见 [PRODUCT.md](../PRODUCT.md)，设计侧车 [design.json](../.impeccable/design.json) 提供当前控件与面板的独立 HTML/CSS 预览。

## 来源与许可

保留[上游 README 声明](licenses/RBP-Portfolio.txt)：模板允许个人和商业项目使用，禁止转售或再分发模板本身。**这不是 MIT 许可声明。** 本实现保留作者与固定来源版本，接入 IAVSE 应用，不作为独立模板重新包装。独立设计细化不改变已有第三方权利，也不扩大任何模板授权。

Lenis、Matter.js 与 Tailwind CSS 的许可分别保留于 [Lenis.txt](licenses/Lenis.txt)、[Matter.js-MIT.txt](licenses/Matter.js-MIT.txt)、[Tailwind-CSS-MIT.txt](licenses/Tailwind-CSS-MIT.txt)。字体、图标与其他依赖见 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)。未包含付费 Gradient Bars 源码。IAVSE 原创部分继续遵循 [PolyForm Noncommercial 1.0.0](../LICENSE) 与 [NOTICE](../NOTICE)。
