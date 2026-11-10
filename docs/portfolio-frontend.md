# IAVSE 前端：统一 RBP Portfolio 设计系统

当前平台只采用 [DavidHDev/rbp-portfolio](https://github.com/DavidHDev/rbp-portfolio) 的设计语言，参考[示例网站](https://rbp-portfolio.vercel.app/)，固定版本 `1581b9b8e5876f60e5eb844970747506980c4412`。[DESIGN.md](../DESIGN.md) 是唯一视觉规范；本文记录源码映射、接入与验证方法。模板页面保留原始组件顺序、几何尺寸、响应式排版和交互参数，内容替换为 IAVSE 的真实文字、图片、数据与目的链接。资源、社区、账号、管理和编辑器外壳共用同一套字体、颜色、卡片、按钮、筛选胶囊与字段。新增的滚动入场规则适用于平台内容。

首页为 **Hero → 四张 Projects 卡片 → Contact**。关于页保留六张点阵拍立得、介绍、可展开列表、使用说明列表、能力标签、物理技术栈与 Contact。资源总览和博客目录使用原始 ProjectsPage 的居中标题、双列卡片与 Contact。业务页面保留必要的搜索、筛选、表格、表单、审核及编辑流程；统一的是视觉系统与控件，不声称这些上游没有的页面逐像素复刻模板。

## 上游源码与本地文件

| 上游文件 | 当前挂载实现 |
| --- | --- |
| `components/hero/hero.tsx`、`hero-ctas.tsx` | [`rbp/hero/`](../src/components/rbp/hero/)：原始分栏、标题比例、方形预览、CTA 布局与入场 |
| `components/projects/projects.tsx` | [`rbp/projects/projects.tsx`](../src/components/rbp/projects/projects.tsx)：原始 CSS columns、卡片层级、图片比例和悬停 |
| `app/projects/page.tsx` | [`rbp/ProjectsPage.tsx`](../src/components/rbp/ProjectsPage.tsx)：原始大留白标题区、Projects 与 Contact |
| `app/about/page.tsx`、`components/about/*` | [`rbp/AboutPage.tsx`](../src/components/rbp/AboutPage.tsx)、[`rbp/about/`](../src/components/rbp/about/)：原始结构与交互，内容为产品介绍、使用说明和实际技术 |
| `components/layout/nav.tsx` | [`rbp/layout/nav.tsx`](../src/components/rbp/layout/nav.tsx)：固定三链接胶囊、活动弹簧指示器和圆形主题揭示 |
| `components/layout/page-backdrop.tsx`、`app/layout.tsx` 中的框架标记 | [`rbp/layout/`](../src/components/rbp/layout/)：原始背景尺寸与透明度；把 layout 中的边框和角部提取为本地 `site-frame.tsx` |
| `components/layout/smooth-scroll.tsx` | [`PortfolioRuntime.tsx`](../src/components/portfolio/PortfolioRuntime.tsx)：保留 Lenis 参数，适配路由生命周期与原生操作区域 |
| `components/contact/*`、`components/ui/*` | [`rbp/contact/`](../src/components/rbp/contact/)、[`rbp/ui/`](../src/components/rbp/ui/)：原始收尾框架、按钮与动效原语 |
| `components/shaders/shader-flow.tsx` | [`ShaderFlow.tsx`](../src/components/portfolio/ShaderFlow.tsx)：原始流场与参数，增加 IAVSE 主题观察、可见性与减少动态回退 |
| `components/hero/portrait-morph.tsx` | [`PortraitMorph.tsx`](../src/components/portfolio/PortraitMorph.tsx)：原始图像变形与持续时间循环，图片替换为实际内置模板截图 |
| `app/globals.css` 与组件工具类 | [`rbp-template.input.css`](../src/styles/rbp-template.input.css) → [`rbp-template.css`](../src/app/rbp-template.css)：编译原始工具类并隔离作用域 |

早期 `PortfolioHero.tsx` 与 `PortfolioNavigation.tsx` 已删除。`PortfolioCardBackdrop.tsx` 仍由未挂载的旧 HomeProductShowcase 引用，当前入口不使用它；它不是当前页面的源码映射或设计依据。

应用仍使用 Next.js 15.5.28、React 19.2.8。当前实际安装版本为 Motion **12.23.26**、Lenis **1.3.23**、OGL **1.0.11**、Matter.js **0.20.0**、Lucide React **0.562.0**；Tailwind CSS 和 CLI **4.1.18** 为样式编译依赖。精确安装树见 [`package-lock.json`](../package-lock.json)。现有 GSAP、Three.js 和编辑器依赖继续服务原有功能。

## 样式、字体与应用边界

[`build-portfolio-styles.mjs`](../scripts/build-portfolio-styles.mjs) 编译模板工具类，输出 `@scope (.rbp-surface) to (.rbp-native)`，让原始排版与重置规则止于原生操作区。`npm run portfolio:styles` 可重建；`predev` 和 `prebuild` 自动运行。修改输入与组件，不手工维护生成文件。

[`rbp-system.css`](../src/app/rbp-system.css) 是全平台语义变量与操作控件的实现入口。它将既有功能模块的颜色别名映射到 RBP 中性色，并统一标题、卡片、按钮、字段、筛选、导航和反馈的外观；浅色和深色共用相同角色。蓝色只承担焦点提示，成功和错误保留语义色。暗色正文选择区域采用可读的深色填充。

[`rbp-bridge.css`](../src/app/rbp-bridge.css) 只解决宿主隔离、根字号、导航不折行与主题映射等接入问题。全平台根字号为 16px，实际字体遵循参考网站计算结果：`ui-sans-serif, system-ui, sans-serif` 及系统 emoji 回退；模板的 `font-serif` 也解析为该栈。保留的 Geist、Cormorant 和艺术字资源有各自用途及许可，不再组成另一套平台字体系统。

旧的 `portfolio-foundation`、`site-chrome`、glass、v2、Apple、liquid 及旧管理皮肤已从加载入口和源码删除。旧平台设计规范文档也已清理；需要了解此前实现时查看 Git 历史。资源目录中第三方项目的设计规范属于学习内容，不能用作 IAVSE 平台皮肤。内置平台说明由 [`iavse-design-guides.mjs`](../src/lib/iavse-design-guides.mjs) 提供当前 RBP 规范、入场与接入三篇导读，具体视觉约束仍以 DESIGN.md 为准。

根 [`layout.tsx`](../src/app/layout.tsx) 挂载 PortfolioRuntime 与 ApplicationReveal。导航跨公共路由持续存在；胶囊只有首页、资源、关于三个链接和外观按钮，账号与语言入口位于 Contact。管理中心和博客编辑器保留各自采用 RBP 控件的导航；编辑器不挂载公共胶囊，避免遮挡工具栏。作者博客和内置博客预览也不挂载该公共导航。

[`PublicSite.tsx`](../src/components/PublicSite.tsx) 的 PublicFrame 把操作区域标为 `.rbp-native.rbp-application`；[`ResourceHub.tsx`](../src/components/ResourceHub.tsx)、[`AdminApp.tsx`](../src/components/AdminApp.tsx) 和 [`CommunityAdmin.tsx`](../src/components/CommunityAdmin.tsx) 也明确接入 `.rbp-application`。`.rbp-native` 只阻止原模板工具类重置继续进入；它不表示操作区域可以保留另一套皮肤。

应用样式在作者博客根、保存的画布块、博客主题、独立个人主页和 React Flow 视口等内容边界停止。已发布博客、内置主题、第三方预览、上传图片和用户作品仍保持自己的外观。这一轮没有写入或删除真实用户数据。平台返回栏属于平台 UI，使用 RBP 字体与色彩；用户作品属于内容。

## 页面与真实内容

- [`PlatformHome.tsx`](../src/components/PlatformHome.tsx) 直接组合 Hero、Projects、Contact，不挂载旧的 HomeProductShowcase。四张项目卡分别连接 UI 设计、AI Skills、社区和博客空间。
- [`ResourceIntroduction.tsx`](../src/components/ResourceIntroduction.tsx) 在 `/resources` 使用原始 ProjectsPage 介绍目录入口；带 `type` 的资源路由保留原有分类、筛选、搜索、来源与许可功能。
- [`BlogSpacesPage.tsx`](../src/components/BlogSpacesPage.tsx) 通过 ProjectsPage 展示符合现有发现条件的公开成员与明确标记的内置示例。卡片为单列/双列 CSS columns，不是三列网格。
- [`rbp/AboutPage.tsx`](../src/components/rbp/AboutPage.tsx) 用原 About 结构承载 IAVSE 产品介绍；Experience/Education 名称是组件来源，不表示虚构的个人任职或学历。十个可拖动技术标签对应现有技术栈。
- [`portfolio-content.ts`](../src/lib/portfolio-content.ts) 和 [`rbp/about/copy.ts`](../src/components/rbp/about/copy.ts) 保存中英日内容。示例人物、模板预览和实际公开成员保持区分。

[`public/media/portfolio/`](../public/media/portfolio/) 中四张图片均为实际页面截图：两张内置模板预览，以及未登录的 Skill 目录和社区。旁边的 JSON 记录各自页面、来源与捕获版本，刷新截图时同步更新这些记录。没有用图片生成补造内容、用户或帖子。Hero 的变形图片是视觉预览，不含随悬停切换的链接。

## 滚动、动效与回退

滚动入场（Scroll Reveal）在元素首次进入可视区域时触发。上移淡入（Fade In Up）从下方 12px、透明度 0 回到原位和完全可见；交错入场（Staggered Reveal）让同批内容依次出现，延迟有上限，避免后面的操作等待过久。

共享策略在 [`rbp-motion.mjs`](../src/lib/rbp-motion.mjs)：缓动 `[0.22, 1, 0.36, 1]`，视口阈值 0.12、底部边距 -6%。[`motion-primitives.tsx`](../src/components/rbp/ui/motion-primitives.tsx) 的 FadeIn 默认使用 `whileInView`、`once: true`，持续 800ms；Hero 显式保留 mount 入场，ScaleUnblur 仍为 `scale: 0.7`、`blur(20px)`、1 秒。Projects 保留每卡 60ms 的索引延迟，由 FadeIn 限制在 210ms 以内。

[`application-reveal.tsx`](../src/components/rbp/ui/application-reveal.tsx) 在现有操作布局上用 IntersectionObserver 和 Web Animations API 增强标题、卡片、列表及面板，不增加包裹层或移动表单控件。每个元素只入场一次，持续 550ms；同一个观察器批次按位置排序，每项间隔 70ms，最大 210ms。MutationObserver 继续发现新增的筛选结果；已有模板动效、可编辑内容和作者画布内容不重复处理。键盘焦点进入隐藏区域时立即显示；实时开启减少动态会取消未完成动画并显示内容。路由或查询变化会清理动画、事件和观察器。缺少观察器或动画 API 时直接显示，没有 JavaScript 时根布局的 noscript 样式保证内容可读。

其他正常模式交互保留原始参数：胶囊活动指示器使用 `stiffness: 380, damping: 32`。主题圆形揭示为 700ms。CTA 布局变化为 0.55 秒，文字变化为 0.35 秒，复制状态图标变化为 0.2 秒。Projects 悬停抬升 4px / 400ms，图片放大至 1.06 / 700ms。

关于页六张拍立得保留原始旋转值和入场：0.9 秒，延迟 `0.05 + index × 0.08` 秒；指针弹簧为 220 / 18 / 0.6。可展开列表使用 0.5 秒高度变化。Matter.js 保留重力 1、恢复系数 0.35、摩擦 0.5、空气摩擦 0.025 与密度 0.0018，支持拖动和重置。内容标签替换不改变物理交互。

Lenis 保留 `duration: 1.6`、`Math.min(1, 1.001 - Math.pow(2, -10 * t))`、纵向滚动、`smoothWheel: true`、`wheelMultiplier: 1`、`touchMultiplier: 2`，锚点偏移为 -100px。`/blog/*`、`/blogs/showcase/*`、`/admin` 与 `/workspace` 及其子路由排除；表单、`data-lenis-prevent` 和展开的详情区域也保留原生滚动。路由变化销毁实例、事件与帧循环。

页面流场保留 900px 高度、亮度 3、10 次迭代与 `[0, 0.1]` 流速；Contact 流场保留 scale 3、brightness 3、原始遮罩及浅/深色透明度。图像变形 DPR 上限为 2，进入/离开刚度分别为 2.4 / 2.0。可见时即使变形已稳定，仍保留原始持续帧循环；后台标签页暂停并在返回后继续。不要重新引入“变形结束即停帧”的优化。

减少动态时，Lenis 停止；流场绘制静态帧；FadeIn、ScaleUnblur、拍立得和展开列表取消对应运动，物理标签变为静态换行列表。应用区域的 CSS 过渡被缩短，入口节点保持可见。主题直接切换；图像组件在初始化时遇到减少动态或无悬停能力则显示静态图。模板其他 Motion 过渡按组件处理。流场跳过后台/离屏绘制；GPU 初始化失败保留可读内容与图片。卸载清理观察器、事件、帧任务和 GPU 上下文。

## 验证与学习入口

代码验证入口为 `npm test`、`npm run build` 与 `npm run docs:check`；滚动入场和主题级联的回归分别见 [`rbp-scroll-reveal.test.mjs`](../test/rbp-scroll-reveal.test.mjs) 与 [`home-css-cascade.test.mjs`](../test/home-css-cascade.test.mjs)。本次最终代码的全量测试 **662/662**、定向回归 **11/11** 通过，生产构建通过。界面验证覆盖首页、关于、资源总览、分类目录、文档、社区、账号、编辑器、管理、文件、法律、下载、博客目录和登录的桌面与手机界面，并检查深色外观、键盘焦点及减少动态。这些结果只对应当前本地代码，不沿用旧版本验收数量。

公开截图只发布未登录界面，设备、来源与版本见[截图说明](screenshots/README.md)及 `captures.json`。账号、编辑器、管理和文件的内部 QA 截图不进入公开截图目录。本地验证不代表生产部署、邮件投递或公开运营已验收。

阅读顺序：RBP Hero/Projects/About/Contact → 作用域编译脚本 → PortfolioRuntime → 两个着色器组件。视觉约定见 [DESIGN.md](../DESIGN.md)，产品约束见 [PRODUCT.md](../PRODUCT.md)。

## 来源与许可

保留[上游 README 声明](licenses/RBP-Portfolio.txt)：模板允许个人和商业项目使用，禁止转售或再分发模板本身。**这不是 MIT 许可声明。** 本实现把来源组件接入 IAVSE 应用并保留作者与固定版本，不作为独立模板重新包装；IAVSE 的原创许可不覆盖或扩大这些条款。

Lenis、Matter.js 与 Tailwind CSS 的实际许可分别保留于 [Lenis.txt](licenses/Lenis.txt)、[Matter.js-MIT.txt](licenses/Matter.js-MIT.txt)、[Tailwind-CSS-MIT.txt](licenses/Tailwind-CSS-MIT.txt)。其他依赖、字体和图标声明见 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)。未包含付费 Gradient Bars 源码。IAVSE 原创部分继续遵循 [PolyForm Noncommercial 1.0.0](../LICENSE) 与 [NOTICE](../NOTICE)。
