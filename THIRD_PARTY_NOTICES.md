# Third-party notices / 第三方材料与许可

## English

The repository's restrictive license applies only to original material for which the author holds the relevant rights. Third-party code, dependencies and derived portions retain their original licenses and the rights those licenses grant.

### SocialKit

The color palette and name-hashing approach in `src/components/FeedAvatar.tsx` are adapted from SocialKit by AnxForever, licensed under MIT.

The full notice is preserved in [docs/licenses/SocialKit-MIT.txt](docs/licenses/SocialKit-MIT.txt). The original MIT-licensed material remains under MIT; this project's restrictive license does not override it.

### Anx portfolio

`src/components/AnxPortfolio.tsx` and `src/app/anx-portfolio.css` adapt the profile-header / panel composition, handwritten arrow and layered SVG extrusion from [AnxForever/anx-portfolio](https://github.com/AnxForever/anx-portfolio) at commit `a7434847797658402d50fba29827eef246102bb7`, by Chánh Đại and Anx (MIT). The adapted portions remain under MIT; IAVSE's restrictive license does not override those rights.

The complete [MIT notice](docs/licenses/anx-portfolio-MIT.txt) and [upstream brand policy](docs/licenses/anx-portfolio-BRAND.md) are retained. Original author names, portraits, wordmarks, personal facts and contribution data are replaced by the signed-in member's content and IAVSE's original pixel alphabet. This is an IAVSE template adaptation, not the complete upstream Next.js application or an endorsement.

### React Flow

The blog editor uses `@xyflow/react` (MIT) for viewport gestures, node selection and dragging. Copyright and full MIT notice are preserved in [docs/licenses/React-Flow-MIT.txt](docs/licenses/React-Flow-MIT.txt). The public portfolio layout remains independent of canvas coordinates.

### Three.js

The homepage glass renderer uses Three.js, GLTFLoader and the procedural RoomEnvironment (MIT). The [complete license](docs/licenses/Three.js-MIT.txt) is retained. The reading-page point backdrop uses Three.js camera/math modules and its linear-to-sRGB transfer formula with two native WebGL draw passes. The glass GLB is an original extrusion of IAVSE's existing folded-plane symbol; no Ego Lite model or environment image is included.

### npm dependencies

`package.json` and `package-lock.json` record website dependencies and versions. Dependencies are installed through npm; `node_modules` is not distributed in this repository. Their licenses, copyright notices and usage conditions are governed by each package and upstream project, including GSAP's upstream terms. This project's license neither grants nor restricts independent rights in those dependencies.

### Images and demo content

`public/images/` contains original project SVGs and AI-generated demo images. Demo images do not represent real members, photographed experiences or third-party endorsements. Publication of this repository grants no additional rights to third-party user content, personal profiles, brand identifiers or content at linked destinations.

macOS and Windows client source code, installers and proprietary assets are not published in this repository.

## 简体中文

本仓库的限制性许可仅适用于作者拥有相应权利的原创部分。第三方代码、依赖及其衍生部分继续适用原许可，不因本仓库的许可而失去原有权利。

### SocialKit

`src/components/FeedAvatar.tsx` 中的配色和名称哈希方案改编自 SocialKit，原作者为 AnxForever，原许可为 MIT。

完整声明保留于 [docs/licenses/SocialKit-MIT.txt](docs/licenses/SocialKit-MIT.txt)。其中受 MIT 许可的原始材料继续按 MIT 许可使用；本项目不以限制性许可覆盖这些材料。

### Anx portfolio

`src/components/AnxPortfolio.tsx` 与 `src/app/anx-portfolio.css` 改编自 [AnxForever/anx-portfolio](https://github.com/AnxForever/anx-portfolio) 的头像与标题布局、Panel 组合、手绘箭头及分层 SVG 立体效果，固定来源提交为 `a7434847797658402d50fba29827eef246102bb7`，原作者为 Chánh Đại、Anx，许可为 MIT。改编部分仍适用 MIT，本项目的限制性许可不覆盖其原有权利。

完整保留 [MIT 声明](docs/licenses/anx-portfolio-MIT.txt) 与 [上游品牌政策](docs/licenses/anx-portfolio-BRAND.md)。原作者的头像、字标、个人事实与贡献记录没有引入；替换为当前成员自己的内容与 IAVSE 原创像素字母。此处为适配后的平台模板，不代表完整上游 Next.js 应用或原作者背书。

### React Flow

博客编辑器使用 MIT 许可的 `@xyflow/react` 实现画布平移、缩放、卡片选择与拖动。完整版权及许可保留于 [docs/licenses/React-Flow-MIT.txt](docs/licenses/React-Flow-MIT.txt)。公开博客的阅读排版独立于编辑画布坐标。

### Three.js

首页玻璃背景使用 MIT 许可的 Three.js、GLTFLoader 与程序化 RoomEnvironment，保留[完整许可](docs/licenses/Three.js-MIT.txt)。阅读页点阵背景使用 Three.js 相机、数学模块及线性颜色到 sRGB 的转换公式，通过原生 WebGL 绘制两个图层。玻璃 GLB 基于 IAVSE 现有折叠形标志原创建模，未引入 Ego Lite 的模型或环境图片。

### npm 依赖

`package.json` 和 `package-lock.json` 记录网站依赖及版本。依赖通过 npm 安装，`node_modules` 不在本仓库分发；依赖包的许可、版权与使用条件以各包及其上游项目附带的声明为准，包括 GSAP 的上游许可。项目自身的许可不授予或限制这些依赖的独立权利。

### 图片与示例内容

`public/images/` 包含项目自制 SVG 与 AI 生成的示例图片。示例图片不表示真实成员、实拍经历或第三方背书。第三方用户内容、个人资料、品牌标识及链接目标的内容不因本仓库公开而获得额外使用授权。

macOS、Windows 客户端源码、安装包与专有资源不在本仓库发布。

### Notionists creator avatars / 手绘示例头像

`public/avatars/creators/` uses locally hosted Notionists avatars, a remix of
Notionists by Zoish, distributed by DiceBear under CC0 1.0.
Source: https://www.dicebear.com/styles/notionists/
License: https://creativecommons.org/publicdomain/zero/1.0/
The six names and comments accompanying these avatars are illustrative demo
content, not real users or endorsements. No DiceBear request occurs at runtime.

`public/avatars/creators/` 的六个手绘头像来自 DiceBear 的 Notionists（原作者 Zoish，CC0 1.0），
已本地托管。对应名字与评论为明确标注的示例，不代表真实用户或背书。

### React Bits / React Bits 动效

`src/components/react-bits/SpotlightCard`, `StarBorder`, and `AnimatedContent` are sourced from [React Bits](https://reactbits.dev/) by David Haz, copyright 2026, using the official `TS-CSS` registries. Source and styles are included as part of the IAVSE application, with the complete [MIT + Commons Clause license](docs/licenses/React-Bits.txt). IAVSE disables pointer-only spotlight work on touch/reduced-motion devices and leaves AnimatedContent visible during SSR. The administration code configures short mount transitions, no ambient spotlight loop, and one visible StarBorder button; these are application settings, not a component redistribution service. Third-party portions retain their upstream terms.

后台直接使用上述 React Bits 源码组件，补充触屏和减少动态效果适配。完整原许可已保留；本项目的原创部分许可不覆盖这些第三方部分。

### RBP Portfolio frontend foundation

IAVSE adapts selected components from [DavidHDev/rbp-portfolio](https://github.com/DavidHDev/rbp-portfolio), revision `1581b9b8e5876f60e5eb844970747506980c4412`: the OGL flow shader and portrait morph, plus the navigation, hero/contact-card structure, motion easing and Lenis setup. Attribution and the upstream README permission are preserved in [docs/licenses/RBP-Portfolio.txt](docs/licenses/RBP-Portfolio.txt). The upstream template permits use in personal and commercial projects and prohibits resale or redistribution of the template itself. These components are integrated into the IAVSE application with its own content and functional routes; the standalone portfolio template is not repackaged. Adaptations add IAVSE cookie themes, authored-content boundaries, reduced-motion/fallback behavior and lifecycle cleanup.

当前平台前端以这个公开仓库为基础，保留原作者、版本与许可；IAVSE 原创部分和第三方部分分别遵循各自许可。未包含付费 Gradient Bars 源码。

### Lenis / 平滑滚动

The public frontend uses [Lenis](https://github.com/darkroomengineering/lenis) 1.3.27 by darkroom.engineering under the MIT License, preserved in [docs/licenses/Lenis.txt](docs/licenses/Lenis.txt). Its smooth-scroll setup follows the public Portfolio template and uses a route-owned animation loop. Reduced motion disables this enhancement, touch scrolling remains native, and the instance is destroyed when entering an editing, administration or authored-blog route. GSAP retains its own upstream terms as noted above.

## Source website templates and design specifications (2026-11-08)

The current library contains eighteen independently maintained GitHub projects and 54 VoltAgent design-system previews. Four initial projects were discovered through StyleKit; eight additions (Tabler, Hextra, Just the Docs, Clean Blog, Freelancer, Landwind, Bigspring Light and Resume) were verified directly against their original MIT repositories. See [expansion evidence](docs/github-template-expansion-2026-11-08.json). At the user's request, the 37 StyleKit-maintained page templates and AnxForever's portfolio have been removed, together with their vendored source, runtime assets and covers. See the [source and license audit](docs/template-catalog-audit-2026-11-08.md).

- Six additional MIT projects (AdminKit free, Agency, Starlight, Nextra, Jekyll Theme Console and Hugo Blog Awesome) are verified directly at pinned source revisions. See [audit evidence](docs/open-template-expansion-2026-11-08.json) and the retained MIT notices in `public/template-covers/licenses/`. Covers omit raster sample photos and avatars; AdminKit links only to its free MIT demo. Component prompts and Chinese usage notes for these additions are authored for IAVSE.
- Each retained project links to its original repository and MIT license. StyleKit remains credited as a discovery source; its MIT notice is retained for the factual descriptions/taxonomy adapted from that directory.
- The 54 VoltAgent light/dark preview pairs and original `DESIGN.md` text retain [VoltAgent MIT](docs/licenses/VoltAgent-awesome-design-md-MIT.txt). These are design-system studies generated from brand guidelines, not official brand websites or complete applications. The 58 unlicensed UI/UX Pro Max examples remain excluded.
- Fonts in `public/fonts/design-artifacts/` retain their OFL notices and upstream records. Real interface screenshots in `public/template-covers/` retain source and capture records. Fuwari and AstroWind screenshots omit sample raster imagery that lacks separately confirmed reuse permission; the AstroWind screenshot is rendered from the original repository while its online demo is unavailable. Material Symbols retain Apache-2.0, Tabler/Lucide icons retain their MIT/ISC notices, and the Start Bootstrap examples retain Font Awesome attribution and the corresponding icon/font/code licenses. Additional font notices for Montserrat, Muli/Mulish, Saira Extra Condensed, Open Sans and Lora are in the project cover license directory.
- The factual taxonomy in `src/lib/design-taxonomy-seed.json` derives from StyleKit under MIT; only explicit project scenarios participate in the directory.

Third-party portions retain their original rights; IAVSE's PolyForm Noncommercial license does not override MIT, ISC, Apache-2.0 or OFL permissions. Brand names identify references; their trademark rights remain separate.

## Imported Skill directory references (2026-11-08)

`src/lib/skill-imports/` records factual metadata, original purpose summaries,
pinned source links and audit evidence for 227 VibeUI-discovered Skill entries
and one StyleKit Skill. No third-party Skill bodies, executable packages or
associated media are redistributed. Catalog platforms are discovery sources,
not claims of authorship. Each upstream definition retains its own terms,
including Figma Developer Terms, CC BY 4.0 and AGPL-3.0 where applicable.
See the [complete audit](docs/skill-sources-audit-2026-11-08.md) for exclusions,
duplicate mappings and distinctions between license texts and declarations.

Skills 目录仅保存用途摘要、事实元数据、固定版本来源及核查记录，不分发第三方
Skill 正文或源码包。收录站不被视为原作者；每项上游许可分别适用。仅有许可声明、
专用条款或许可未明确的条目不提供自动安装命令。

## Repository wordmark

The README IAVSE lettering is derived from the bundled Cormorant Garamond typeface, copyright 2015 the Cormorant Project Authors, under SIL Open Font License 1.1. The font and its unmodified notice are retained at `public/fonts/CormorantGaramond-Variable.woff2` and `public/fonts/CormorantGaramond-OFL.txt`. `docs/brand/wordmark-light.svg` and `wordmark-dark.svg` contain vector glyph outlines. This font attribution does not change the website code license or grant rights to third-party brand identities.
