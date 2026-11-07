# IAVSE 资源与设计库：来源和编排记录

核对日期：2026-11-07。此文记录本轮编辑研究，不是对外站代码或素材的授权声明。

## 交付边界

本轮首批目录有 20 套设计、24 个 Skill 和 12 个网站工具入口。前四套设计属于 IAVSE：光学玻璃首页、空间画廊、资源产品介绍、中性 Bento 后台。其余设计是依据公开来源重新归纳的风格练习。设计规范、提示词和本地预览均为本项目原创，颜色数值是实施建议，不能被表述为原站完整官方 tokens 或像素级副本。

设计项包含来源、核对日期、布局、字体、动效、长提示词、Markdown 规范以及显式颜色 tokens。palette 是色彩样本，不能直接把第 N 项当成文本或表面角色；预览应使用 tokens.background / surface / text / muted / accent。

每个来源仅提炼结构或原则，规范中的响应式断点、性能策略与验收清单由 IAVSE 独立制定。没有下载外站图片、模型、字体或插图并加入本站；站内预览应明确标注“原创风格演示”，不能标注为原站截图。

## 用户提供的参考站

- [VibeUI](https://vibeui.top/?lang=zh)：参考目录的通栏卡片、类别切换、来源与预览入口。网页 HTML 可公开读取，标题为 Awesome DESIGN.md Index，并引用 designs.js、hotkeys-skills.js 数据资源。本轮没有复制其条目文案、数据库或截图。
- [StyleKit / Notion 风格](https://www.stylekit.top/zh/styles/notion-style)：参考风格详情的提示词、配色、说明与独立 Showcase 入口。网页 HTML 可公开读取。本站的 Notion 方向回到 [Notion 原站](https://www.notion.com/) 归纳，不转载 StyleKit 的原文。

这两个站点在搜索工具中一度不能直接打开，之后通过普通 HTTPS GET 确认页面；没有绕过登录或访问控制。

## 设计原始来源

| 方向 | 来源 | 本轮提炼重点 |
| --- | --- | --- |
| 静物产品舞台 | [Apple MacBook Air](https://www.apple.com/macbook-air/) | 大物件、留白、分章节介绍 |
| 纸感知识空间 | [Notion](https://www.notion.com/) | 内容层级、轻量工具与文档预览 |
| 精密项目工作台 | [Linear](https://linear.app/) | 任务状态、低对比边界、工作流演示 |
| 流动基础设施 | [Stripe](https://stripe.com/) | 产品、工程与柔和光谱的叙事 |
| 黑白工程网格 | [Vercel Geist](https://vercel.com/geist/introduction) | 网格、字体与一致基础组件 |
| 理性信息网格 | [IBM Carbon](https://www.carbondesignsystem.com/) | 企业界面结构与基础规范 |
| 安静的运营台 | [Shopify Polaris](https://shopify.dev/docs/api/polaris) | 管理任务与表单组织；当前入口重定向到 Shopify 开发文档 |
| 清晰公共服务 | [GOV.UK 原则](https://www.gov.uk/guidance/government-design-principles) | 任务优先、清楚语言与可访问性 |
| 创作画布 | [Figma](https://www.figma.com/) | 画布、协作与创作表达 |
| 作品编辑部 | [Framer](https://www.framer.com/) | 作品展示与页面编辑节奏 |
| 温暖探索目录 | [Airbnb](https://www.airbnb.com/) | 分类、图像与比较信息 |
| 自适应色彩系统 | [Material Design](https://m3.material.io/) | 语义角色与跨屏布局；页面依赖 JS，未把建议值宣称为实时抓取 tokens |
| 空间叙事工作室 | [Lusion About](https://lusion.co/about/) | 空间探索、镜头节奏与创意交互 |
| 开发者协作界面 | [GitHub Primer](https://primer.style/) | 开发者信息结构、状态与无障碍基础 |
| 团队任务中心 | [Atlassian Design](https://atlassian.design/) | 团队任务、语义状态与统一系统 |
| 精致组件实验室 | [Radix UI](https://www.radix-ui.com/) | 可操作组件预览与主题原语 |

外部网页不能证明其全部内部实现。尤其不把 Lusion 的视觉效果直接描述为实时光线追踪，也不声称提取了它的 Blender 工程。IAVSE 自身的光学 GLB 与 CSS 3D 画廊有源码证据，已在公开指南中区分。

## Skills 选择与安装核对

原 10 个独立技能保留，新增加 14 个，共 24 个。选择标准是任务明确、来源可追踪、安装路径可说明、能提供实用示例。没有按未经验证的“最好”“下载第一”或星标数字排序。featured 与 recommendedFor 表示编辑推荐的适用任务。

### Anthropic 官方仓库

[anthropics/skills](https://github.com/anthropics/skills) 中以下路径的 SKILL.md 与各自 LICENSE.txt 已通过原始文件逐一读取：

- frontend-design、canvas-design、theme-factory、brand-guidelines
- webapp-testing、mcp-builder、skill-creator
- docx、pdf、pptx、xlsx

本次读取的 11 份 LICENSE.txt 均为 Apache License 2.0。目录链接到每项实际许可文件，避免用仓库级推断替代。brand-guidelines 只用于明确需要 Anthropic 品牌视觉的场景，不宣传为通用品牌生成器，也不暗示获得商标权。

安装以 [Skills CLI 支持的 Agent](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) 为依据，命令为 npx skills add anthropics/skills --skill 实际名称 -a 目标工具。仅提供命令和来源，不自动执行未知技能安装。脚本依赖、账号权限与具体模型表现另按上游说明检查。

### Vercel 与 Superpowers

- [Vercel web-design-guidelines](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md)：实际 name 是 web-design-guidelines，安装命令不能加 vercel- 前缀；现有 react-best-practices / composition-patterns 仍使用各自原名称映射。
- [Superpowers brainstorming](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md) 与 [writing-plans](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md)：通过原仓库完整插件入口安装，与已有 debugging / TDD 一致。

新增条目均有两条功能、适用任务、前提、实际工作流示例与两套可编辑提示词，并补齐中文、英文、日文。示例是使用建议，不是已执行结果。

## 网站工具来源

resource-websites.mjs 保存 MDN、Apple HIG、GSAP、Three.js、React Bits、shadcn/ui、Radix、Geist、Figma Community、Awwwards、VibeUI 与 StyleKit 的原始链接。官方项目的用途取自官方介绍；社区/灵感站仅作为索引入口，其作品许可需逐项检查。Figma Community 的抓取被搜索工具限制，因此不记录未经验证的条目或数量。

## IAVSE 实现证据

- 首页：home-glass.ts、V2Atmosphere.tsx、home-render-budget.ts；两份 optical-surface GLB。材质、相机、像素预算与可取消加载来自实际代码。
- 博客空间：blog-gallery-space.mjs、gallery-scheduler.ts、gallery-frame-ready.ts；固定卡片、相机移动、近裁面保护与最多两个并行预览。
- 网站源码内未发现原始 .blend。公开指南给出可重建的建模步骤，不声称恢复了原始 Blender 操作历史。
- 产品短片指南区分实时交互和离线视频，并记录 ProductCinema、HyperFrames 源工程与两份实际 MP4。交付为 16:9；9:16 是后续制作建议，不列为已完成。

## 验证记录

技能目录测试覆盖安装名称映射、各项许可链接、语言翻译、提示词占位符、筛选和每种工具的安装入口。后续新收集内容必须进入审核；本文件中的编辑精选项不改变自动采集的审核要求。
