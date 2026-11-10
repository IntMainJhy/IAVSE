# 双 UI 第一阶段：来源盘点与 Pro 候选

[开发计划](dual-ui-development-plan.zh-CN.md) · [任务表](dual-ui-task-board.md) · [第三方声明](../THIRD_PARTY_NOTICES.md)

核查日期：2026-11-10。代码基线：`65e09e8eb807f16e4c38c880cf476a609c0a7ec7`。

本次完成 UI 来源和主要直接依赖的第一轮盘点，以及有限的 Pro 元数据选材。未领取新素材、未集成新 Pro 源码、未恢复运行中的 3D 入口。以下结论不覆盖全量传递依赖、资源目录中的所有第三方项目、所有字体图片或用户内容，也不是对既有公开历史的完整授权结论。

## 1. 现有 UI 来源与处理

| 材料 | 来源、作者与版本证据 | 当前使用情况 | 两版处理 |
| --- | --- | --- | --- |
| RBP Portfolio 适配 | David Haz / DavidHDev，`1581b9b8e5876f60e5eb844970747506980c4412`；[本地声明](licenses/RBP-Portfolio.txt) | 首页 Hero/Projects/Contact、站点导航、关于页及肖像效果仍有引用；保留的流场 shader 已不由页面背景挂载 | README 许可不等于 MIT。新公开 UI 不复制这套适配；Pro 也需核对应用使用及分发边界，不把移入私有仓库当作扩大授权 |
| React Bits 三个组件及样式 | David Haz，版权标注 2026；来源为官方 TS-CSS registry；[实际保留许可](licenses/React-Bits.txt) | `AnimatedContent`、`SpotlightCard`、`StarBorder` 共五个文件；本次未找到其他源码对这三个组件的直接 import | MIT + Commons Clause，不能记为纯 MIT；严格开源 UI 暂不采用。尚未固定到确切上游提交，不能把本地引入提交当作上游版本 |
| 博客 3D 展廊 | 本地实现 `BlogSpaceGallery.tsx` 与 `blog-gallery-space.mjs`；本地首次引入提交 `ad790e4159a9c4b72c146858a525fbf4e3ca89e7` | 组件仍在，含真实博客预览、选择与入口；当前 `BlogSpacesPage.tsx` 只装配 `ProjectsPage`，没有挂载该展廊 | 优先保留已有数据、预览与交互契约；公开版改用已核准的开源或原生动效。恢复挂载和视觉验收仍未完成 |
| 应用入场动效与 CSS 氛围背景 | 当前仓库实现 `rbp/ui/application-reveal.tsx`、`rbp/layout/page-backdrop.tsx` | 入场动效采用 IntersectionObserver 与 Web Animations API，仍需遵循现有原创代码许可 | 不能因为目录名含 rbp 就把所有文件判为上游源码；也不能因独立实现就直接改标 MIT |
| Anx portfolio 适配 | Chánh Đại、Anx，`a7434847797658402d50fba29827eef246102bb7`，MIT；[保留声明](licenses/anx-portfolio-MIT.txt) | 博客模板适配；仍需分别处理品牌、作者内容和 GSAP 依赖 | 可作为保留署名的候选，MIT 不覆盖其全部依赖和外部内容 |
| SocialKit 配色与头像哈希 | AnxForever，MIT；[保留声明](licenses/SocialKit-MIT.txt) | `FeedAvatar.tsx`；本轮未补齐确切上游提交 | 保留许可，可复用权利明确的部分；补齐上游版本记录 |

RBP 的主要检查位置为 `src/components/rbp/`、`src/components/portfolio/`、`src/app/layout.tsx`、`src/components/PlatformHome.tsx`、`PublicSite.tsx`、`ResourceIntroduction.tsx` 与 `BlogSpacesPage.tsx`。来源注释扫描发现 20 个带 RBP 标记的文件，其中也有来源目录数据文件；该数字不是“20 个均属于受限代码”的法律判定。`rbp/` 目录另含独立实现与装配文件，须逐文件判断。

### 博客开场为什么消失

本次定位到的是装配入口变化：博客列表页现在把真实公开博客与明确标注的内置示例映射为 `ProjectsPage` 卡片，未使用仍然保留的 `BlogSpaceGallery`。没有据此认定博客数据或旧展廊源码丢失。

恢复时保留已有预览调度、同源与 sandbox 规则、真实链接、键盘操作、减少动态及普通目录回退。Infinite Gallery 的图片式 3D 预览不能证明它直接支持现有 iframe 博客预览；需要实际交付后确认适配成本。

## 2. 主要依赖的版本与许可

以下版本和声明来自本次实际安装包的 `package.json`；锁文件为版本 3。首次采用或升级时还需核对包内完整 LICENSE 与 NOTICE。

| 依赖 | 实际版本 | 包声明与初步处理 |
| --- | --- | --- |
| Next.js / React | 15.5.28 / 19.2.8 | MIT；保留上游声明 |
| Motion | 12.23.26 | MIT；公开 UI 动效候选 |
| Three.js | 0.187.0 | MIT；有真实 WebGL 需求时使用 |
| GSAP | 3.15.0 | Standard “no charge” 自定义许可；不能按开源许可处理 |
| Lenis | 1.3.23 | MIT |
| OGL | 1.0.11 | Unlicense |
| Matter.js | 0.20.0 | MIT |
| lucide-react | 0.562.0 | ISC；保留相关 Feather MIT 声明 |
| @xyflow/react | 12.12.0 | MIT |
| Tailwind CSS | 4.1.18 | MIT |
| @tiptap/core | 3.32.0 | MIT；不代表其他扩展自动同许可 |
| JSZip | 3.10.2 | MIT OR GPL-3.0-or-later；采用 MIT 路径并保留相应声明 |
| pdfjs-dist | 5.4.296 | Apache-2.0；保留所需声明 |
| sanitize-html | 2.18.1 | MIT |
| sharp | 0.35.5 | Apache-2.0；二进制及附属依赖另行检查 |

源码静态扫描找到 15 个直接导入 GSAP 的文件：`AnxPortfolio`、`BlogCanvas`、`BlogEditor`、`BlogPreview`、`BlogProductMotion`、`BlogSignatureThemes`、`BlogSpaceGallery`、`CreatorStage`、`HomeCinema`、`HomeMotion`、`NavigationTransition`、`PageMotion`、`ProductCinema`、`react-bits/AnimatedContent`，以及 `lib/home-scroll-refresh.ts`。这是引用清单，不代表 15 项都在同一路由运行；公开版替换范围应以实际装配关系为准。

字体、图标、模型和图片不由上述代码许可统一覆盖。Geist 的现有 OFL 声明及其他字体的声明继续保留；后续新增演示图片、模型与音效分别登记，不复用虚构服务承诺或第三方身份内容。

## 3. 首批 Pro 候选（未申请解锁）

通过 uiX 对 `reactbits-pro` 分别搜索 Cloudlight、App Shell、Gallery，每次 limit 为 3；再读取以下三个候选的元数据，没有翻页遍历、申请解锁或下载测试。

| 用途 | 候选与素材 ID | 预览与适配判断 |
| --- | --- | --- |
| 平台首页、导航与首屏动效 | Cloudlight，`reactbits-pro:7eeeac9d7870baf8d4cbb0672c64d946` | [预览页](https://site.txbai.com/reactbits/pro/template-cloudlight-template) · [预览图](https://site.txbai.com/reactbits/assets/pro-preview/template-cloudlight-template.webp)。WebGL 云朵与停靠式导航；需改为平台资源、社区和博客入口，不沿用云存储产品文案或承诺。交付类型 package |
| 社区与资源阅读框架 | App Shell 5，`reactbits-pro:e7499eea98c8917cd10668ff39f0aa4b` | [预览页](https://site.txbai.com/reactbits/pro/app-shell-5) · [预览图](https://site.txbai.com/reactbits/assets/pro-preview/app-shell-5.webp)。列表加阅读面板适合浏览／详情任务；手机布局和现有发布操作需适配。交付类型 source |
| 博客空间 3D 开场 | Infinite Gallery，`reactbits-pro:b21d035900e04d7decb73c50c76ab725` | [预览页](https://site.txbai.com/reactbits/pro/infinite-gallery) · [预览图](https://site.txbai.com/reactbits/assets/pro-preview/infinite-gallery.webp)。在 3D 图片场中移动；需检查能否保留真实博客预览、聚焦、进入与目录回退。交付类型 source |

三项元数据均为 `ready: true`、`free: false`。这些标记不证明开源、授权或已交付。原作者为 React Bits Pro 的 David Haz；具体交付版本、依赖及素材附属许可尚未取得，版本不得由预览或本地同名目录推断。

原生工具状态的边界：独立的 Codex 原生 MCP 临时会话已报告 connected，发现 `search_assets`、`get_asset`、`request_unlock`、`unlock_status`、`collect_asset` 五项工具，且完成上述只读调用。当前聊天的直接工具清单尚未暴露这五项；不能把独立会话结果描述成当前聊天已直接加载。继续原生交互前需在新会话核对，不用自制 HTTP 请求替代。

## 4. 私有开发准备与剩余关口

用户已明确要求创建独立私有 Pro 仓库；该仓库已创建并完成首次推送。公开仓库不添加对私有目录的 import，也不存放 Key、MCP 原始响应、交付包或授权凭据。私有仓库初始化只含说明与忽略规则，不等于 Pro 应用已可运行。

后续依次完成：

1. 用户确认具体候选与交付类型；依 uiX 流程逐项验证、领取，每批最多三项。
2. 核实实际授权链、开发席位、交付版本与随包许可；uiX 会员资格不自动等于上游 React Bits Pro 授权。
3. 确认私有 Git 存储与应用开发权限；源码公开、协作者访问、成品交付和部署分别判断。
4. 检查包内脚本但不自动执行，核对字体／图片／模型；之后建立共享视图契约与最小可运行入口。
5. 新公开 UI 另行原创实现；现有公开树与历史中的 RBP / React Bits 适配留待单独处理，不擅自删除历史或扩大许可。

许可依据：[React Bits Pro 官方协议](https://pro.reactbits.dev/license)、[React Bits 当前上游许可](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md)、[GSAP Standard License](https://gsap.com/standard-license/)，以及本仓库固定版本声明。付费、免费、改写与私有化均不能替代实际许可范围判断。
