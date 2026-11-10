# IAVSE 前端：基于 RBP Portfolio 的适配

当前整套前端以 [DavidHDev/rbp-portfolio](https://github.com/DavidHDev/rbp-portfolio) 和[示例网站](https://rbp-portfolio.vercel.app/)为基础，固定参考版本为 `1581b9b8e5876f60e5eb844970747506980c4412`。平台采用其黑白色彩、Geist 字体、胶囊导航、流动背景和图像变形效果，并接入 IAVSE 原有的资源、社区、博客、账号、管理与编辑功能。

这次范围包含共享前端体系。首页采用左右分栏，资源介绍和博客目录使用清晰的内容卡片；社区、账号、管理和编辑器保留各自的操作布局。作者发布的博客主题、内置模板和资源预览继续保留其自身外观。旧的首页专属 Silk、海面、Gradient Bars 和 ASCII 方案已被替换。

## 上游源码与本地文件

| 上游文件 | IAVSE 实现与适配 |
| --- | --- |
| `components/shaders/shader-flow.tsx` | [`ShaderFlow.tsx`](../src/components/portfolio/ShaderFlow.tsx)：保留流动场算法，加入主题观察、减少动态、可见性判断与 WebGL 失败回退 |
| `components/hero/portrait-morph.tsx` | [`PortraitMorph.tsx`](../src/components/portfolio/PortraitMorph.tsx)：使用 IAVSE 内置博客模板截图；触屏与减少动态初始化使用静态图片，结束变形后停止连续绘制 |
| `components/hero/hero.tsx`、`hero-ctas.tsx` | [`PortfolioHero.tsx`](../src/components/portfolio/PortfolioHero.tsx)：分栏比例、入场节奏和图像框架，配合实际资源/社区入口与品牌使命 |
| `components/layout/nav.tsx` | [`PortfolioNavigation.tsx`](../src/components/portfolio/PortfolioNavigation.tsx)：弹簧活动指示器、圆形主题揭示；沿用 IAVSE 路由、当前页面语义与外观 cookie |
| `components/layout/smooth-scroll.tsx` | [`PortfolioRuntime.tsx`](../src/components/portfolio/PortfolioRuntime.tsx)：Lenis 时长和缓动、按路由创建/销毁、保留触屏与编辑操作 |
| `components/contact/contact-card.tsx` | [`PortfolioCardBackdrop.tsx`](../src/components/portfolio/PortfolioCardBackdrop.tsx)：收尾卡片的流动场，并使用 IAVSE 艺术字与实际入口 |
| 上游全局视觉基础 | [`portfolio-foundation.css`](../src/app/portfolio-foundation.css)：共享颜色、字体、导航、卡片、响应式与深浅外观，适配已有应用样式 |

应用继续使用 Next.js 15.5.28 和 React 19.2.8，未将网站后端迁移到模板的框架版本。新前端的动画依赖为 Motion 14.11.1、Lenis 1.3.27 和 OGL 1.0.11；锁定结果见 [`package-lock.json`](../package-lock.json)。现有 GSAP 依赖仍供原有模块使用，新 Portfolio 基础不通过 ScrollTrigger 驱动页面。

## 页面与真实内容

- [`layout.tsx`](../src/app/layout.tsx) 挂载共享运行时；[`PublicSite.tsx`](../src/components/PublicSite.tsx) 接入胶囊导航、外观按钮和原有账号/语言入口。
- [`PlatformHome.tsx`](../src/components/PlatformHome.tsx) 组合分栏首屏与 [`HomeProductShowcase.tsx`](../src/components/HomeProductShowcase.tsx)。资源分类、搜索、社区状态、模板切换和 FAQ 均使用现有产品组件。
- [`ResourceIntroduction.tsx`](../src/components/ResourceIntroduction.tsx) 用卡片和实际分类链接介绍资源；目录的数据、筛选、来源和许可不变。
- [`BlogSpacesPage.tsx`](../src/components/BlogSpacesPage.tsx) 将公开成员与明确标识的内置示例放入目录。仅展示符合现有公开条件的成员，不创建虚构账号或活动。
- 管理中心、账号和画布采用共同的字体、色彩与控件基础，保留权限、数据、编辑、保存及发布行为。独立博客主题仍由现有模板/主题工厂渲染。

首屏两张方形图片位于 [`public/media/portfolio/`](../public/media/portfolio/)，由实际内置模板页面拍摄，旁边的 JSON 保存来源和拍摄记录。它们是示例页面截图，非生成的人物照片或真实用户背书。图片悬停变形时，目标链接随当前展示的模板同步。

## 滚动、动效与回退

Lenis 仅在合适的公共路由运行：`/blog/*`、`/blogs/showcase/*`、`/admin` 及其子路由、`/workspace` 及其子路由排除。配置为 `duration: 1.6`、`smoothWheel: true`、`syncTouch: false`；表单、指定原生滚动区域与打开的详情组件不被接管。进入排除路由或卸载时销毁实例并取消其帧循环。

系统减少动态设置变化时，Lenis 会停止或重新初始化，流动背景改为静态帧。图像变形组件在挂载时检查减少动态和悬停能力；符合回退条件时保留静态图片。导航和主题转换也遵守减少动态设置。主题写入已有 `site-color-mode` cookie，刷新后保持选择。

流动背景像素比上限为 1，图像变形为 1.5。流动场在后台标签页或离开可视区域时跳过绘制；图像变形结束后停止连续帧。卸载释放监听器、观察器、帧任务和 WebGL 上下文，异步图片加载受销毁标记保护。WebGL 初始化失败时，文本、图片、链接与产品功能仍可使用；背景是装饰，不承载必要信息。

## 验证与学习入口

本轮主任务记录了 667 项测试通过与生产构建通过；最后的组件/导航定向测试 12 项通过。浏览器验收覆盖首页桌面/手机/深色外观，以及资源、社区、博客目录、账号、管理和准备完成的编辑画布。截图、设备范围与具体拍摄版本见[截图说明](screenshots/README.md)。这些是本地实现验证，不代表生产环境、邮件或公开运营已完成验收。

从 [`PortfolioRuntime.tsx`](../src/components/portfolio/PortfolioRuntime.tsx) 学习路由生命周期与滚动增强，从 [`PortfolioNavigation.tsx`](../src/components/portfolio/PortfolioNavigation.tsx) 学习布局测量和主题转换，再阅读两个上游着色器组件。全局视觉约定见 [DESIGN.md](../DESIGN.md)，产品边界见 [PRODUCT.md](../PRODUCT.md)。

## 来源与许可

上游 README 允许在个人和商业项目中使用模板，并禁止转售或再分发模板本身。IAVSE 将选定组件适配为自己的应用界面，保留作者、固定版本和[上游声明](licenses/RBP-Portfolio.txt)，不作为独立模板重新包装。Lenis 的 MIT 原文见 [Lenis.txt](licenses/Lenis.txt)；字体及其他第三方声明见 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)。未包含付费 Gradient Bars 组件源码。IAVSE 原创部分继续遵循原有 [PolyForm Noncommercial 1.0.0](../LICENSE) 和 [NOTICE](../NOTICE)。
