# StyleKit 设计目录来源与许可

核验日期：2026-11-08。本次导入官方目录全部 **149 项**：131 个视觉风格、18 个布局。条目使用 `stylekit-` 前缀，避免与本站自己的研究或 VibeUI 条目重名。

## 已核实的一手来源

- [StyleKit 中文风格目录](https://www.stylekit.top/zh/styles)：浏览与作者展示入口。
- [官方目录 API](https://www.stylekit.top/api/styles)：149 个条目的名称、分类、简介和封面地址。
- [完整设计规则 API](https://www.stylekit.top/api/styles/all.json)：全部设计规则、设计变量、建议/禁用清单，并明确返回 `license: "MIT"`。
- [官方仓库](https://github.com/AnxForever/stylekit)：AnxForever/stylekit，核验提交 `38058485388d237745ccf58c6750c2ec661a72f4`。
- [固定版本 MIT 许可](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/LICENSE)：Copyright (c) 2026 AnxForever。
- [官方完整 API 实现](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/app/api/styles/all.json/route.ts)：源码说明这一接口面向第三方工具，允许一次请求读取、镜像和引用完整目录。

官方 API 的 `licenseUrl` 当前使用 `main` 分支；仓库实际默认分支是 `dev`。本站不沿用可能失效的分支链接，统一指向已核实提交中的 LICENSE。

## 导入内容与署名

导入的设计说明、AI 设计规则、设计变量、建议与禁用清单来自上述官方 API。卡片封面来自同一仓库的 `public/styles/{slug}.svg`。所有 149 个文件均为自包含 SVG，没有远程图片、内嵌位图、脚本或 `foreignObject`。其中 scandinavian、cel-shading、wabi-sabi 的目录当前选择 JPEG，本站选择同仓库中对应的官方 SVG 版本。没有下载或再分发展示站中的第三方照片、视频和字体文件。

每项的 `source` 链接到具体 StyleKit 风格页，而非目录首页；`collection` 标记发现来源；`provenance.evidenceUrl` 链接到固定提交的具体风格源文件；`referenceUrls` 单独标注来源文件明确提及的品牌、设计系统、原型或素材来源。提示词和规范保留 StyleKit 作者、源页面、固定版本仓库地址与 MIT 许可全文。

StyleKit 的模板实现可以根据其 MIT 许可使用，但这不把 Apple、Notion、GitHub 等品牌的商标、官方页面或第三方素材变成 StyleKit 所有。本站将这些条目表述为 **StyleKit 的风格实现/研究**，没有标注为品牌官方模板。未发现独立第三方模板作者的条目仅记录“当前来源文件未声明”，不声称完成了全互联网原创性鉴定。

### 另行保留的原来源

| StyleKit 条目 | 上游明确提及的设计/素材来源 |
| --- | --- |
| notion-style | [Notion](https://www.notion.com/) |
| stripe-style | [Stripe](https://stripe.com/) |
| apple-style、macos-vibrancy、launch-keynote、immersive-photo | [Apple](https://www.apple.com/)；macOS 条目链接到 [macOS](https://www.apple.com/macos/) |
| liquid-glass | [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) |
| material-design | [Google Material Design](https://m3.material.io/) |
| fluent-design | [Microsoft Fluent](https://fluent2.microsoft.design/) |
| github-style | [GitHub Primer](https://primer.style/) |
| linear-style | [Linear](https://linear.app/) |
| shopify-clean | [Shopify](https://www.shopify.com/) |
| distill-style | [Distill](https://distill.pub/) |
| studio-bold | [Pentagram](https://www.pentagram.com/)、[IDEO](https://www.ideo.com/) |
| ghibli-style | [Studio Ghibli](https://www.ghibli.jp/) |
| kinetic-typography | [Studio Dumbar](https://studiodumbar.com/) |
| scrollytelling | [The New York Times](https://www.nytimes.com/interactive/)、[The Pudding](https://pudding.cool/)、[Reuters Graphics](https://www.reuters.com/graphics/) |
| luxe-lookbook | [Celine](https://www.celine.com/)、[The Row](https://www.therow.com/)、[Jacquemus](https://www.jacquemus.com/) |
| quantized-line-field | [Simple Icons 的图标路径](https://github.com/simple-icons/simple-icons/tree/develop/icons)，另列 [Apple](https://www.apple.com/)、[Google](https://www.google.com/)、[Tesla](https://www.tesla.com/) 标志所属品牌 |

上述设计灵感链接不是“下载的原模板”或转授权证明。`quantized-line-field` 是实际存在额外素材来源的特殊条目：[StyleKit 原始说明](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/lib/prompts/canvas-line-cards.ts)明确声明品牌路径来自 Simple Icons；其 [CC0 许可](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md)全文已经随附，并进入该条目的提示词和规范。CC0 不授予商标权。

## 预览与真实体验

本地放大预览使用上述授权 SVG；“进入设计体验”打开每项独立的 `https://www.stylekit.top/zh/styles/{slug}/showcase`，保留真实交互和原作者站点。StyleKit 返回 `X-Frame-Options: SAMEORIGIN`，因此不使用会被浏览器阻止的跨域 iframe。完整交互页面仍由原站提供，本站未复制其运行代码与第三方媒体。

2026-11-08 已逐项请求 149 个体验地址，全部返回 HTTP 200，全部声明 `X-Frame-Options: SAMEORIGIN`；同时核对了固定提交中每项独立的 showcase 页面源码。外站之后的内容或可用性仍可能变化。

131 个视觉风格与 18 个布局完整保留在标签中。主分类适配本站统一的九类应用场景：AI、开发工具、基建与云、设计生产、金融加密、企业消费、通用、落地页、分析仪表。没有明确应用场景的通用美学归到“通用”；原始 `styleType`、`sourceCategory` 与标签仍可查。

## 文件与复现

- 生成结果：`src/lib/design-imports/stylekit.json`。
- 149 个封面、MIT、Simple Icons CC0 与逐文件 SHA-256 来源清单：`public/design-imports/stylekit/`。
- 原始官方 API 快照：`scripts/design-import/stylekit-source.json.gz`，包含 `{ catalog, index }`，gzip 时间戳固定为 0。
- 原始 Simple Icons CC0 许可：`scripts/design-import/stylekit-simple-icons-CC0.txt`。
- 导入器：`scripts/design-import/stylekit.mjs`。默认读取已核实快照，不依赖当日 API 返回内容。

在网站仓库执行：

```sh
git clone https://github.com/AnxForever/stylekit.git /tmp/stylekit-import
git -C /tmp/stylekit-import checkout 38058485388d237745ccf58c6750c2ec661a72f4
node scripts/design-import/stylekit.mjs --source /tmp/stylekit-import
```

导入器会核对提交、MIT 作者、149 项数量、18 项布局、每项互动页源码、SVG 安全内容与唯一 slug，生成稳定结果。更新版本时应先重新核实目录与许可，再有意更新固定提交、快照和核验日期；不得仅绕过数量或许可校验。

MIT 适用于上述第三方材料；IAVSE 原创代码继续遵循项目原有许可。
