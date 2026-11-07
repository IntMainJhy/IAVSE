# IAVSE 自研 UI 工作室

2026-11-08。此版本是供用户并排比较和评审的独立实现；旧目录、提示词、许可声明和外部体验链接全部保留。

## 内容与边界

- 对原有 VibeUI 112 项、StyleKit 149 项建立 261 个一对一参考映射；增加 8 个研究方向，共 269 个整页风格条目。
- 另有 24 个交互组件条目，并为每个风格提供这 24 类组件的独立提示词。
- 目录默认显示 IAVSE 自研；可切换整页／组件、原有 IAVSE、VibeUI、StyleKit，或显示全部。
- 描述、提示词、实现规范、React/CSS、虚构品牌 Oriel、演示文字和程序化几何由本轮单独编写。新实现不调用第三方预览 iframe，不载入外部图片、字体或品牌 Logo，也不读取旧条目的 prompt/specification 作为新内容。
- 通用风格名称、事实性的颜色与参考站链接用于研究映射，不主张风格由 IAVSE 发明。

这一版采用 16 个视觉族、13 种结构和逐项主题／构图参数共享实现，**不是 261 份手工制作的逐像素复刻页面**。同族条目会共享结构与交互。摄影、绘画、影视角色等方向使用自行构造的抽象图形，不重用原示例素材。这是本轮可评审版本的保真范围；不得将其描述为已经做到全部 1:1 或保证无侵权。

重写源代码不能单独证明视觉表达和关联素材均获授权；新演示通过自有内容和几何减少直接复制，品牌启发方向仍标明参考。原目录的许可证和限制继续适用。

## 研究来源

| 来源 | 使用方式 |
| --- | --- |
| [VibeUI](https://vibeui.top/?lang=zh) | 目录分类、浅深预览、品牌参考与规范入口；原来源链见现有审计 |
| [StyleKit](https://www.stylekit.top/zh/styles) | 风格索引、整页演示与提示词的对应关系；不转抄其新提示词或演示源码 |
| [Carbon](https://www.carbondesignsystem.com/) | 企业数据工作面的阅读顺序与状态覆盖 |
| [GOV.UK Design System](https://design-system.service.gov.uk/) | 原生表单、标签、校验与确认流程 |
| [Atlassian Design](https://atlassian.design/components/) | 协作导航、列表与操作反馈 |
| [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) | 键盘、焦点、状态与语义的检查依据 |
| [Material Design](https://m3.material.io/) | 自适应布局研究入口 |
| [Shopify Polaris](https://shopify.dev/docs/api/polaris) | 经营任务与组件组织研究入口 |
| [shadcn/ui](https://ui.shadcn.com/docs/components) | 组件组合和分组的研究入口，未导入其源码 |
| [Awwwards](https://www.awwwards.com/)、[Curated Design](https://www.curated.design/)、[Page Flows](https://pageflows.com/)、[Hover.dev](https://www.hover.dev/) | 扩展构图、网站及流程的发现渠道，不把收集站当成作品作者或素材许可方 |

公开页面的读取不构成版权授权。本轮既有来源审计保留于 design-rights-vibeui-audit.md 与 design-rights-stylekit-audit.md。

## 实现与检查

- `src/lib/design-studio.mjs` 只从旧目录选择名称、分类、颜色和参考链接，生成独立提示词与规范；映射在 `studio.originSlug`。
- `src/lib/design-studio/families.mjs` 保存独立编写的视觉配方与结构说明。
- `src/lib/design-studio/components.mjs` 保存 24 份行为规范及风格化提示词构造器。
- `DesignStudioPreview.tsx` 实现本地交互，`design-studio-preview.css` 隔离演示样式。
- `StudioComponentPrompts.tsx` 支持组件选择、复制／下载提示词和直接打开对应组件。
- 新预览的路径在本站，旧 58 项授权未明的示例继续仅提供外链。
- Skills 前台移除收录平台标签与过滤入口，保留上游项目及其许可。原始核查记录继续存档。
