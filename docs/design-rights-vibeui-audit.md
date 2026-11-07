# VibeUI 示例 UI 的来源与许可复核

核查日期：2026-11-08。范围为 VibeUI 的 112 条 UI 设计目录，不含 Skill、图片或视频目录。本文记录公开证据能支持的结论；标注来源与取得复制授权是两个不同问题。

## 核查结论

| 条目 | 可核对的上游项目 | 示例是怎样产生的 | 本站处理 |
| --- | --- | --- | --- |
| 54 个品牌设计研究，108 个浅色/深色预览 | VoltAgent/awesome-design-md 的历史版本 | 从真实品牌官网提取设计规范，再用规范生成示例 UI；不是品牌官网原页面、官方模板或 VibeUI 原创 | 分开展示规范与示例来源、品牌参考站、收录站；保留 MIT 全文；允许远程预览 |
| 58 个 UI/UX Pro Max 风格示例 | yuanfu8899/uiuxskillProMax | 原项目 README 称由 UI/UX Pro Max Skill 生成；不是 VibeUI 原创 | 未确认开放许可；仅保留原创摘要、事实目录和原作者外链，停止自动 iframe 嵌入 |

以上结论确认的是公开项目间的文件来源关系和项目自己的制作、许可声明。它不能证明相关仓库已经取得全部品牌、图片、字体等第三方权利，也不能保证任何后续使用都没有侵权风险。

## 文件来源的证据

核对使用三个固定提交的完整 Git tree；GitHub API 返回的 `truncated` 均为 `false`。比较对应文件的 Git blob SHA，未以名称相似、页面长得相似或仓库总许可证代替文件核验。

| 用途 | 固定版本 |
| --- | --- |
| VibeUI 目录及收录文件 | [Charlo-O/awesome-design-md · fa4175f8](https://github.com/Charlo-O/awesome-design-md/tree/fa4175f8d5c06683d70d05a4544e466e77fa2544) |
| 品牌研究与生成示例 | [VoltAgent/awesome-design-md · f6f44a91](https://github.com/VoltAgent/awesome-design-md/tree/f6f44a9159d09e13fa0b5d3d9f15c20a9fbb3be1) |
| UI/UX Pro Max 风格示例 | [yuanfu8899/uiuxskillProMax · 5c1fb498](https://github.com/yuanfu8899/uiuxskillProMax/tree/5c1fb49813069920bdc3fcbb8aee02cd6e8f5157) |

比较结果：

- 54 份 `design-md/{slug}/DESIGN.md` 与 VoltAgent 历史版本逐项一致。
- 108 份 `design-md/{slug}/preview.html`、`preview-dark.html` 与同一 VoltAgent 版本逐项一致。
- VibeUI 的 58 份 `extra/uiuxskillProMax/refstyles/*.html`，去掉 `extra/uiuxskillProMax/` 前缀后，与 yuanfu8899 原项目对应文件逐项一致。
- VoltAgent 的历史 `LICENSE`、VibeUI 收录仓库的根 `LICENSE`、本站保留的 MIT 许可副本具有相同的 Git blob SHA。

部分可重复核对的文件指纹如下；比较覆盖全部 220 个文档和演示文件，不限于下表抽样。

| 文件 | Git blob SHA |
| --- | --- |
| `design-md/claude/DESIGN.md` | `a12d89dcd1d7c7dc4b5392e00619853022c55673` |
| `design-md/claude/preview.html` | `f8323cf3958f45c8da5003bfbb05787ecf542480` |
| `design-md/claude/preview-dark.html` | `13d7c7eb2cfcb87f06073eed6b05ae778979d0ed` |
| `refstyles/01-minimalism.html` | `e238cdf3b61444d5f0b029d32d7598cdbf995493` |
| `LICENSE`（VoltAgent MIT） | `5cea5d78a41df83eafe1fb9fc0710675a5b7acf6` |

Git blob SHA 是含 Git 对象头的内容摘要，不是文件本身的普通 SHA-1。复核时应比较固定提交树中的 `sha` 字段，或使用 `git hash-object`，避免混用算法。

## 示例是原创制作，还是已有官网页面

[VoltAgent 的 Claude 说明页](https://github.com/VoltAgent/awesome-design-md/blob/f6f44a9159d09e13fa0b5d3d9f15c20a9fbb3be1/design-md/claude/README.md)明确区分：设计规范来自公开的 Claude 网站，是第三方提取整理，并非官方设计系统；预览是根据 `DESIGN.md` 制作的示例页面。对应 HTML 也标记为自动生成的设计 token 目录。

因此，品牌官网在这里是**风格参考**，不是这些演示文件的发布者；演示文件可追溯到 **VoltAgent 项目**，VibeUI 是收录方。将 `source` 仅指向品牌官网，或者只写“VoltAgent 编写”而省略官网提取与生成关系，都会让用户误解。本次已经修正。

[yuanfu8899 的 README](https://github.com/yuanfu8899/uiuxskillProMax/blob/5c1fb49813069920bdc3fcbb8aee02cd6e8f5157/README.md)说明这 58 个界面示例由 UI/UX Pro Max Skill 生成，并列出示例页面。生成工具的名称不是这些 HTML 的开放许可，也不足以将文件归给另一个同名 Skill 仓库。本站将它们的作者/维护项目标为 `yuanfu8899 / uiuxskillProMax`，制作说明保留“由 UI/UX Pro Max Skill 生成”。

## 许可范围与未证实的部分

### VoltAgent 的 54 个研究条目

同一历史提交的 [LICENSE](https://github.com/VoltAgent/awesome-design-md/blob/f6f44a9159d09e13fa0b5d3d9f15c20a9fbb3be1/LICENSE)声明 MIT，版权主体为 `Copyright (c) 2026 VoltAgent`。本站的 [MIT 全文副本](licenses/VoltAgent-awesome-design-md-MIT.txt)与该文件一致，54 份可复制或下载的规范也逐份包含完整版权与许可文本。

`license.status: verified` 表示已核对这个仓库、这个版本的许可证声明及对应文件来源，不表示已经完成每一个视觉素材的权利链证明。MIT 不能替第三方品牌、商标、专有图片、人物肖像或字体授予权利。本次没有复制预览 HTML、品牌图片或截图为本站本地资产；提示词要求换用自己的品牌、内容及已获授权的素材。嵌入仍展示第三方远程演示，应按具体用途另行确认涉及的素材权利。

### UI/UX Pro Max 的 58 个风格条目

固定版本的完整 Git tree 未发现 `LICENSE`、`LICENCE` 或 `COPYING` 文件；GitHub 仓库元数据的许可字段为 `null`。README 虽有 License 小节，但该小节只有示例由 Skill 生成的说明，没有明确的授权条款。

因此不能将 VibeUI 根目录的 MIT 自动扩展给这些收集来的 HTML，也不能因使用 AI 生成就视为可以自由复制。本站将这 58 项标为 `unconfirmed`，并设置 `previewPolicy: external-only`。仅保留名称、类别、颜色、原始链接等事实目录及本项目独立写作的中文摘要；不导入原 HTML、脚本、样式、截图、字体、说明正文或规范，不显示自动嵌入与本地复制/下载入口。原作者网站通过外链访问。

## 本轮落地修改与验证

- `source`：54 个条目指向 VoltAgent 固定历史版本的具体 `preview.html`；58 个条目指向 yuanfu8899 固定版本的具体 HTML。
- `creator`：明确示例及规范的上游维护项目；`collection` 单独保留 VibeUI。
- `referenceSite`：54 个条目保留品牌官网，并明确它是风格参考。
- `production`：明确官网提取、生成演示与 Skill 生成的关系。
- `provenance`、许可证与规范页头：改用同一已核对的历史版本，保留完整 MIT，说明核查边界。
- `previewPolicy`：54 项为 `embed`，58 项为 `external-only`。

离线复现导入器并与当前目录数据逐字段比较，112 条记录一致；54 份规范均带完整 MIT 文本，58 项的 `prompt`、`specification`、`typography`、`image` 均为空。导入器语法检查通过。远程演示地址的可达性检测是另外一项检查，HTTP 200 或没有 iframe 限制均不构成许可证明。

以后更新这批数据时，应重新核对固定版本、逐文件来源和许可，不应沿用本轮结论给新增内容自动授予“已核实”状态。
