# VibeUI 设计目录来源记录

核查日期：2026-11-08。导入范围是 [VibeUI 的 UI 设计分类](https://vibeui.top/?lang=zh)，共 **112 个条目、166 个预览**，不包含其 Skill、图片或视频分类。数据位于 `src/lib/design-imports/vibeui.json`。

## 分类与完整性

分类名称和分组保留 VibeUI 的原始编排，包括 Stripe 位于“基建与云”。

| 分类 | 条目 |
| --- | ---: |
| AI | 12 |
| 开发工具 | 14 |
| 基建与云 | 6 |
| 设计生产 | 10 |
| 金融加密 | 4 |
| 企业消费 | 8 |
| 通用 | 40 |
| 落地页 | 8 |
| 分析仪表 | 10 |
| 合计 | 112 |

54 个品牌设计研究各有浅色、深色两个预览，58 个风格模板各有一个预览，合计 166 个。条目全部保留，并未用少量示例代替目录。

## 作者、设计参考与收录站的区别

### 54 个品牌设计研究

- 设计参考是相应品牌的真实网站。`source` 和 `websiteUrl` 指向品牌原站。
- 风格演示与 `DESIGN.md` 规范来自 [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)，以 MIT 许可发布。品牌原站不是这些研究演示的作者；这些演示也不是品牌官方提供的模板。
- VibeUI 使用 [Charlo-O/awesome-design-md](https://github.com/Charlo-O/awesome-design-md) 维护收录版本。`collection` 指向具体条目的 VibeUI 页面，`previewUrl` 指向其公开的演示页面，`referenceUrls` 同时指向 VoltAgent 和收录版本。
- 本次导入了 MIT 许可下的 54 份设计规范，保留每份规范内的原有内容并添加来源说明。完整许可随库保存在 [VoltAgent-awesome-design-md-MIT.txt](licenses/VoltAgent-awesome-design-md-MIT.txt)，且版权与许可全文内嵌于每份 `specification`，确保单独复制或下载规范时仍然携带。
- 简短中文摘要及用于创建独立界面的提示词由本项目编写。提示词明确要求替换内容与品牌、补齐实际界面状态。

MIT 适用于相应开源演示和文档，不自动授予品牌商标、专有图片、字体或其他第三方素材的使用权。未把品牌官网作为可直接复制的开源模板。

### 58 个 UI/UX Pro Max 风格模板

- 真实来源为 [yuanfu8899/uiuxskillProMax](https://github.com/yuanfu8899/uiuxskillProMax)，不是仅因同名就归给其他 UI/UX Pro Max 项目。每条 `source` 指向该作者仓库的具体 HTML 文件。
- [原作者 GitHub Pages](https://yuanfu8899.github.io/uiuxskillProMax/) 提供在线演示。`previewUrl` 和 `websiteUrl` 使用该作者自己的 `refstyles/*.html` 页面，可在浏览器体验其真实网站。
- 核查的原作者仓库没有可确认的开放许可，GitHub 仓库元数据的 `license` 为 `null`。VibeUI 根目录的 MIT 声明不足以确认这些第三方材料已被作者以 MIT 授权。因此每条许可状态为 `unconfirmed`，界面显示“未确认开放许可”。
- 仅整理名称、分类、颜色值及来源链接等事实目录，中文摘要独立编写。未复制模板 HTML、脚本、样式、图片、截图、字体或说明正文；`prompt`、`specification` 和 `typography` 留空。
- 预览是远程作者页面，由前端以受限 iframe 显示；未在本项目重新托管其文件。远程页面可用性不等于再分发授权。

每条 `provenance.note` 均写明实际来源关系。`image` 留空，避免将未核实许可的截图作为本地素材导入。

## 可复核的版本

| 用途 | 仓库 | 本次固定提交 |
| --- | --- | --- |
| 112 条目录与 54 份收录规范 | [Charlo-O/awesome-design-md](https://github.com/Charlo-O/awesome-design-md/tree/fa4175f8d5c06683d70d05a4544e466e77fa2544) | `fa4175f8d5c06683d70d05a4544e466e77fa2544` |
| 品牌研究作者与 MIT 许可 | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md/tree/fcc70284932276d085f01ef9f83edde90b1258cb) | `fcc70284932276d085f01ef9f83edde90b1258cb` |
| 风格模板的原始来源 | [yuanfu8899/uiuxskillProMax](https://github.com/yuanfu8899/uiuxskillProMax/tree/5c1fb49813069920bdc3fcbb8aee02cd6e8f5157) | `5c1fb49813069920bdc3fcbb8aee02cd6e8f5157` |

目录输入是收录仓库的 [`site-assets/designs.js`](https://github.com/Charlo-O/awesome-design-md/blob/fa4175f8d5c06683d70d05a4544e466e77fa2544/site-assets/designs.js)。导入器提取其中的 JSON 数组并解析，不执行远程 JavaScript。输入固定为已核查的提交，更新时必须重新确认条目数量、作者与许可，而不是自动信任收录站的总许可。

## 重建与验证

在网站仓库根目录运行：

```sh
node scripts/design-import/vibeui.mjs --verify-links
```

脚本生成 JSON 与 MIT 许可副本；不复制未确认许可的模板代码。生成过程核对 112 条记录、唯一 slug 与完整的独立摘要。`--verify-links` 会检查全部远程预览的 HTTP 状态和限制嵌入的响应头。

2026-11-08 的结果：**166 / 166 个预览返回 HTTP 200**，未检测到 `X-Frame-Options` 或 CSP `frame-ancestors` 限制。此检查验证当时的页面可达性及响应头，不保证第三方站点将来始终可用。前端仍保留“访问原站”的外部入口。

本次导入没有要求对未确认许可的内容授予再分发权，也没有把来源标注当成复制授权。
