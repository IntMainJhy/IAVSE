# 模板目录：来源、许可与本地运行

核查日期：2026-11-08。按用户最新要求，删除此前“本站重写、授权引用、VibeUI、StyleKit”四组旧目录，移除批量重写的预览、旧 149 风格卡片、旧 112 来源卡片及相关渲染代码。当前目录只由 `src/lib/template-library.json` 发布，共 96 项：5 个完整开源项目、37 个原始页面/应用示例模板、54 个设计规范预览。

## StyleKit 的 42 项模板

核对 [线上模板目录](https://www.stylekit.top/zh/templates) 与 [固定提交 catalog](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/lib/templates/catalog.ts)，名称、数量和链接全部对应。

| 项目 | 原仓库 | 许可及处理 |
| --- | --- | --- |
| AnxForever 个人站与博客 | [AnxForever/anx-portfolio](https://github.com/AnxForever/anx-portfolio) | MIT，派生自 [ncdai/chanhdai.com](https://github.com/ncdai/chanhdai.com)，保留双方版权；肖像、品牌和身份内容受 TRADEMARK.md 单独限制。原站禁止内嵌，提供原站入口。 |
| AstroPaper 技术博客 | [satnaing/astro-paper](https://github.com/satnaing/astro-paper) | MIT，完整 Astro 项目；链接原项目并提供原站预览。 |
| Fuwari 图文博客 | [saicaca/fuwari](https://github.com/saicaca/fuwari) | MIT 软件；不复制其未单独确认权利的动漫图片。原站预览保留在原域。 |
| AstroWind 多页企业站 | [arthelokyo/astrowind](https://github.com/arthelokyo/astrowind) | MIT，保留 onWidget 版权。原演示地址当前 HTTP 402，目录明确提示，不伪装为可用预览。 |
| NextDevTpl | [evepupil/NextDevTpl](https://github.com/evepupil/NextDevTpl) | 完整 SaaS 脚手架；已直接核对原仓库 LICENSE 为 MIT，保留原作者与演示入口。 |

其中 4 项由其他维护者提供，Anx 个人站由 StyleKit 同一维护者维护，但也是基于其他开源项目的改造，不能称为完全原创项目。每项的精确仓库、分支、文件路径、原作者与许可链接见 [机器可读来源记录](template-source-audit.json)。

其余 **37 项由 StyleKit 仓库维护，MIT 许可**。35 项是单路由页面/应用示例，2 项保留多路由，总计 47 个 `page.tsx` 路由文件；不会将其全部称为生产级多页业务系统。官方导出包含 Next.js 脚手架与依赖，下载入口保留为官方 `/api/templates/<slug>/download`。

本地预览直接引入固定版本的原 TSX，保存在 `vendor/stylekit-templates/originals/`。`runtime/` 只进行可审计的平台适配：移除原站返回工具条、转换本地链接、适配 Next 路由/图片/字体接口、在独立 React 文档中挂载；完整原设计与原交互保留。变更及 SHA-256 见 `vendor/stylekit-templates/transforms.json`，使用 `npm run build:template-sites` 可重建。

`/template-sites/<slug>` 不继承 IAVSE 平台 CSS、光标或页面布局；模板按需加载独立入口和共享模块。原文件没有远程照片/视频或导出二进制素材；字体逐项保留 OFL、原链接和哈希，Lucide/Feather 保留 ISC/MIT 声明。设计提示词与令牌直接引用原模板关联的 StyleKit 风格资料，明确标为原项目参考规则，不冒称逐像素测量结果。

## VibeUI 的来源链

按用户提供的旧 112 项快照逐文件核对：

- **54 项、108 个浅色/深色 HTML** 与 [VoltAgent 固定历史版本](https://github.com/VoltAgent/awesome-design-md/tree/f6f44a9159d09e13fa0b5d3d9f15c20a9fbb3be1) 对应，MIT 声明及文件 Git blob 已核对。它们从品牌官网提取规范后生成示例，属于设计系统文档/组件预览，不是品牌官网原页面、官方模板或完整应用。本站单独分类、保留原文规范及 MIT，字体自托管，不添加泛化的假交互。
- **58 项** 来自 [yuanfu8899/uiuxskillProMax](https://github.com/yuanfu8899/uiuxskillProMax/tree/5c1fb49813069920bdc3fcbb8aee02cd6e8f5157)。README 声称由 Skill 生成，但该树没有覆盖这些 HTML 的许可证；未收录、未复制，也没有用本站批量页面替代。
- `hotkeys.design` 在索引中对应 Skill 资料；`awesome-gpt-image-2` 对应图像/提示词资料。它们不是额外网站模板。图像项目的应用代码 MIT 不等于其第三方图片与提示词全部获得同一授权。

本次重新打开的 VibeUI 在线首页已显示 **54 项 UI 设计、108 个预览**；用户的 112 项是之前快照。核查仍覆盖旧 112 项，避免把删减或来源变化遗漏。详细文件关系保留于 [历史证据记录](design-rights-vibeui-audit.md)，当前处理以本文为准。

## 性能与使用边界

目录卡片仅加载懒加载的静态封面。首次渲染 24 项，滚动接近底部追加，直到全部 96 项，没有页码、上一页或下一页。全目录共享一个按需挂载的预览对话框，关闭即卸载 iframe；目录和详情链接关闭自动预取，避免同时下载大量模板。模板代码、字体及大篇幅设计文档不进入目录的客户端数据。

第三方代码继续按 MIT/ISC/OFL 许可使用，不被 IAVSE 的非商业许可覆盖。复制模板需保留对应版权与许可；原项目个人资料、商标及另行授权的媒体不因仓库 MIT 自动变成可任意复用素材。这里记录实际许可证据和处理范围，不作绝对无侵权保证。

## 本地验收记录

37 个模板入口已在 1440、768、390 三种宽度实际打开；47 个路由文件对应的 54 个实际示例 URL 均能渲染。36 个模板的原有状态或路由交互已经检查，CRM 原项目仅有静态界面与原生输入，目录明确注明没有 New Deal 业务逻辑。移动侧栏、窄屏标签、被遮挡的菜单及博客插图高度等限定修复保留在 vendor 变更清单，原始文件未覆盖。

108 个 VoltAgent 浅色/深色预览实际检查字体、资源和横向布局，并保留 [预览适配与暗色修复记录](voltagent-preview-restoration.md)。目录已实测 24→48→72→96，空闲 iframe 为 0；预览关闭、Esc 和焦点返回、收藏、搜索、历史返回、手机视口均已验证。封面加载竞态和模板资源缓存版本问题在复核中发现并修正。

代码验证：`npm test` 659 项、类型检查、生产构建和 243 项生产 HTTP 检查全部通过；源文件与适配文件的哈希、字体及 OFL、独立文档路由和退役目录排除均有自动检查。独立复核覆盖目录、代表性模板交互、原站嵌入限制及三个源码 ZIP，未发现尚未解决的 P1；这不表示逐一验证了所有第三方业务控件。GitHub 同步不等于公网部署。
