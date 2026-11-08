# StyleKit 作者与权利复核（2026-11-08）

> 历史来源研究：旧 149/112 项目录已退役。当前发布范围及处理方式见 [模板目录核查](template-catalog-audit-2026-11-08.md)。


这份记录重新核查官方仓库、提交历史、演示源码和独立 Skill 仓库，不把收录站的总许可视为所有第三方素材的授权证明。核查对象是本次已收录的 149 项风格及布局，不是 StyleKit 网站的全部其他资源。

## 结论与证据强度

**可以确认：本站引用的 149 项资料与 SVG 来自 StyleKit 官方项目；其仓库将相关代码与文档以 MIT 发布。149 个在线示例均有 StyleKit 仓库中的演示页面实现。它们不是 Apple、Notion、Stripe 等品牌的官方模板，也不应被称为这些品牌授予的可复制官网。**

**不能确认：149 项设计、美术元素及其所有底层素材都由 AnxForever 独立创作，或不存在任何其他权利。** 维护者将代码提交到自己的仓库、仓库声明 MIT、演示能正常打开，均不足以替所有上游素材作原创性及不侵权担保。MIT 本身亦按现状提供，并不承诺不侵权。

更准确的前台表述是“StyleKit 维护的风格演示／品牌启发研究”，分别展示：演示实现者、参考品牌／设计系统、收录出处、代码／文档许可和素材限制。不要使用“全部原创”“品牌官方模板”或“已保证无侵权”。

## 核查版本与覆盖范围

- 当前官方 `dev` 分支：[`38058485388d237745ccf58c6750c2ec661a72f4`](https://github.com/AnxForever/stylekit/commit/38058485388d237745ccf58c6750c2ec661a72f4)，2026-11-08 通过 GitHub 官方 API 复核，与本次导入固定版本相同。
- 本站 149 项逐项匹配到该版本的 `lib/styles/{slug}.ts`、`app/styles/{slug}/showcase/page.tsx` 和 `app/styles/{slug}/showcase/_content.tsx`，三组都是 **149 / 149**。这支持“仓库维护的演示实现”这一判断，不能单凭文件存在证明排他原创性。
- 对本地已收录的 149 个 SVG 再查外部 `href/src` 和内嵌位图，未发现远程引用或 data 图片。本站没有导入这些 showcase 的运行代码、照片、视频或外部字体文件。
- 现有条目中 19 项已有单独的品牌／设计参考链接；参考链接不是素材下载地址，更不是转授权书。

## 示例 UI 是哪里来的？

1. [官方 README](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/README.md)把产品定义为供 AI 生成网页使用的风格库，每种风格配令牌、配方、规则和整页示例；另明确列出 Apple、Stripe、Notion、GitHub 等“品牌启发”类别。这里的风格方向有既有品牌／设计史来源，不等于该品牌提供了模板。
2. [作者指南](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/docs/STYLE_AUTHORING.md)要求每个风格具备风格定义、令牌、组件配方、封面及 showcase；发布输入还须带经过作者编写和产品确认的预览模块。它说明项目的创作与发布路径，不能代替逐素材权利证明。
3. [2026-02-21 的官方提交](https://github.com/AnxForever/stylekit/commit/506b9f5a1f1b3801aae72e87ff1ffaf07d361934)由 AnxForever 提交，明确重做 33 个风格的独立交互演示，其中含 apple-style、github-style、neo-brutalist、bauhaus 等。提交描述和完整源码支持“项目自己实现／维护的教学演示”，不支持“复制来的品牌官方页面”这一说法；同样没有足够证据声称每行代码都由人手写或从未使用生成工具。
4. [Apple 示例源码](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/app/styles/apple-style/showcase/_content.tsx)包含色板、交互实验、产品陈列研究和返回 StyleKit 的导航，并写明 Apple 风格的学习目标。[Notion 示例源码](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/app/styles/notion-style/showcase/_content.tsx)使用 StyleKit Workspace 及演示数据库。这些是 StyleKit 内部运行的风格展示，不是 Apple Store 或 Notion 产品本身。
5. 一些示例明确使用生成素材。例如 [immersive-photo 源码](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/app/styles/immersive-photo/showcase/_content.tsx)将本地 AVIF／WebP 描述为生成的氛围图；[gallery-dark 源码](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/app/styles/gallery-dark/showcase/_content.tsx)亦提到生成图片，并带通用 Unsplash 署名组件。不能据此把所有图都判为自制、AI 生成或特定摄影师授权。

## 许可支持什么，不能替代什么

- [项目 MIT](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/LICENSE)声明 Copyright (c) 2026 AnxForever，要求复制或分发实质内容时保留版权与许可声明。本站现有 SVG 目录保留全文，导出的提示词／规范也保留全文。
- [完整目录 API 实现](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/app/api/styles/all.json/route.ts)明确以第三方工具为消费对象，输出 MIT 及全部风格规则，支持本次元数据／规则整理的来源与许可判断。
- [使用条款源码](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/app/terms/page.tsx)将提示词、模板、令牌与示例定位为参考，并说明使用者仍须负责自己产品中的使用方式。2026-11-08 官网 `/zh/terms` 通过网页读取工具超时，故此处引用已核实的官方源码，而非声称成功读取线上条款。
- 商标、品牌标志、第三方字体和照片的权利不能由仓库总 MIT 一并推定。StyleKit 的权利声明也不等于它必然拥有所有第三方作品的转授权。

### 已查明的额外素材边界

| 范围 | 官方代码证据 | 本站处理边界 |
| --- | --- | --- |
| quantized-line-field 的 Apple / Google / Tesla 路径 | [canvas-line-cards.ts](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/lib/prompts/canvas-line-cards.ts)明确指向 Simple Icons | 已附 Simple Icons CC0；CC0 不是品牌商标授权。应在该条目额外提醒替换品牌标志后用于自身产品。 |
| split-screen、comic-style 照片 | showcase 源码使用 `picsum.photos` | 本站未导入这些照片或 showcase 代码。原站在线体验不意味着照片可另行复制。 |
| kinetic-typography、parallax-editorial、luxe-lookbook 字体 | showcase 源码引用 `fonts.loli.net` 字体 CSS | 本站未下载或托管字体；复用字体需查具体字体许可证。 |
| editorial、gallery-dark、immersive-photo、cinematic-video-hero 的媒体 | 源码使用各自本地照片、生成氛围图／视频，信息粒度不一 | 本站只保留 SVG 封面和外部体验地址；不推定这些媒体全都具有可再分发授权。 |

对 149 个 `_content.tsx` 的静态扫描发现 8 项含图片／视频元素或资源入口。这个数字只覆盖该层文件的直接引用，不能证明其他导入组件没有媒体，也不是全站第三方资产清单。

## 可收录的官方 Skill

StyleKit 官方主仓库的 README 链接到独立的 [`AnxForever/stylekit-skill`](https://github.com/AnxForever/stylekit-skill)，这是 **一个 Skill** 读取 149 种风格及公开资产规格，并非 149 个独立 Skill。

- 归属：AnxForever / StyleKit。
- Skill 名称：[`stylekit`](https://github.com/AnxForever/stylekit-skill/blob/93b9c1de903a6c3f6f7944224b26d154b325e1eb/SKILL.md)。
- 已核查版本：[`93b9c1de903a6c3f6f7944224b26d154b325e1eb`](https://github.com/AnxForever/stylekit-skill/commit/93b9c1de903a6c3f6f7944224b26d154b325e1eb)，2026-10-07。
- 独立许可：[MIT，Copyright (c) 2026 AnxForever](https://github.com/AnxForever/stylekit-skill/blob/93b9c1de903a6c3f6f7944224b26d154b325e1eb/LICENSE)。未拿主站仓库许可代替 Skill 仓库许可。
- 官方安装说明：`npx skills@latest add AnxForever/stylekit-skill`。本次仅核查、收录说明，不执行安装或 Skill 的自动更新脚本。
- 用途：将用户选择的风格映射到已有项目，读取令牌、实现规格与公开资产元数据，并检查生成结果。
- 脚本要求 Python 3.10+；可配合兼容 Agent Skills 的工具。Skill 与 MCP 是两套可选接入方式，安装 Skill 不等于安装 MCP。
- Skill 会按其说明检查 GitHub 更新；这是上游行为，不能把本站的来源核查写成对所有未来版本或所有自动取得素材的永久安全保证。

## 对本次产品文案的修正建议

- 将“StyleKit 原创设计”收紧为“StyleKit 维护的演示实现”；若称“原创”，须有更具体的逐项作者与素材证据。
- 品牌风格条目明确标记“品牌启发，非品牌官方模板”；来源作者与参考品牌分开显示。
- 将“许可已核实”明确限定为“已核对该版本的代码／文档许可证”，不要暗示所有图片、字体、标志都完成授权验证。
- 保留官方演示体验入口；不自动复制外站示例中的媒体，也不把标注来源当成复制授权。
- 面对“必须保证不侵权”，如实给出已核实范围、未核实范围和采取的限制。没有取得所有权利人的授权文件，不能给出绝对保证。
