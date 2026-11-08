# VibeUI 112 项设计：逐项来源与许可复核

核对日期：2026-11-08。范围仅为 VibeUI 的 UI 设计栏目，不包含 Skill、图片和视频栏目。本轮不导入 UUPM 官网演示，也不更改网站自身许可。

## 结果与收录范围

112 项的原始模板文件全部能对应到其他上游仓库，VibeUI 在这些模板文件的来源链中是收录方。其站点外壳、翻译和为条目生成的文档另当别论，不把这些工作说成没有原创内容。

| 来源 | 数量 | 本次证据 | 处理 |
| --- | ---: | --- | --- |
| VoltAgent/awesome-design-md | 54 | 54 份 DESIGN.md、108 份浅深色 HTML 与固定上游版本逐文件 Git blob SHA 一致；该版本附完整 MIT 声明 | 已全部收录，保留原作者、完整许可和参考官网；不重复添加 |
| yuanfu8899/uiuxskillProMax | 58 | 58 份 HTML 与固定上游版本逐文件一致；完整仓库树无 LICENSE/LICENCE/COPYING；README 的 License 节只有生成工具说明 | 许可依据尚未确认，继续排除，不发布原 HTML、截图、原文提示词或自动内嵌 |

本轮补查全部 58 份上游 HTML：每份响应的文件 SHA 与对应树节点一致，未发现 MIT/Apache/Creative Commons/SPDX 等明确许可声明，也未发现指向其他 GitHub 原模板的链接。这只是当前公开证据的结果，不等于作者明确拒绝许可。

公开 MIT 是被许可方复制、修改与分发相应代码及文档的依据，使用时保留版权与许可全文；不伪称另行取得了作者对 IAVSE 的专门书面同意。VibeUI 的根 MIT 或生成工具自身的 MIT 不能代替其他作者对其输出 HTML 的许可。HTTP 可访问或没有 iframe 响应头限制，也不作为授权依据。

## 固定来源与证据

- VibeUI 索引仓库：[Charlo-O/awesome-design-md / fa4175f8](https://github.com/Charlo-O/awesome-design-md/tree/fa4175f8d5c06683d70d05a4544e466e77fa2544)。其 README 明列 54 + 58 项、112 个条目和 166 个预览。
- 品牌设计参考：[VoltAgent / f6f44a91](https://github.com/VoltAgent/awesome-design-md/tree/f6f44a9159d09e13fa0b5d3d9f15c20a9fbb3be1/design-md)；[MIT 全文](https://github.com/VoltAgent/awesome-design-md/blob/f6f44a9159d09e13fa0b5d3d9f15c20a9fbb3be1/LICENSE)，文件 blob SHA `5cea5d78a41df83eafe1fb9fc0710675a5b7acf6`。
- 另一组示例：[yuanfu8899 / 5c1fb498](https://github.com/yuanfu8899/uiuxskillProMax/tree/5c1fb49813069920bdc3fcbb8aee02cd6e8f5157)；[README License 小节](https://github.com/yuanfu8899/uiuxskillProMax/blob/5c1fb49813069920bdc3fcbb8aee02cd6e8f5157/README.md#授權資訊-license)。该分支当前版本与上次审计版本相同。
- [逐项清单](../public/catalog-audits/vibeui-112.json)：完整 112 项的原始文件链接、收录方文件链接、固定版本、Git blob SHA、许可依据、收录/排除决定。没有将未确认许可的正文复制入清单。

三个来源树均未截断。使用 GitHub 的 commit endpoint 固定版本，再读取对应完整递归 tree；不能将提交 SHA、tree SHA、普通文件 SHA-1 和 Git blob SHA 混为一谈。VibeUI `design-md/<slug>/DESIGN.md`、`preview.html`、`preview-dark.html` 直接与 VoltAgent 同路径比较；`extra/uiuxskillProMax/refstyles/*.html` 去掉收录目录前缀后与 yuanfu8899 比较，共核对 220 个文档及演示文件。

MIT 不替第三方品牌、人物、图片、字体等授予权利。当前 54 项的本地预览沿用已审查的字体、许可保留和品牌标识处理，具体见既有 [来源研究](design-rights-vibeui-audit.md)。

## 分类修正

当前发布集合仍是 12 个完整 GitHub 网站项目与 54 项品牌设计规范，共 66 项。112 项授权复核没有产生新的可确认许可条目，因此新增数为 0。

- 内容类型区分“完整网站模板”和“品牌设计规范”。
- 网站用途只描述实际项目功能。Hextra、Just the Docs 属于文档网站；54 项 token/组件规范不再因含有说明文档就被归到文档网站。
- 参考行业仅描述被研究品牌的业务领域，设 11 个明确类别。Stripe 与 Coinbase 等归金融与支付，IBM 归云服务与数据，NVIDIA 归科技硬件。通用博客、文档、作品集项目不强行指定品牌行业。
- 视觉风格为独立的编辑分类，逐条依据已有规范整理，不与模板类型、业务行业、使用场景混合，不采用标题关键词自动推断。全部 66 项保留明确的视觉风格数组。
- 筛选 URL 支持 `collection`、`scenario`、`industry`、`visual`、查询、收藏和排序。交互中选择网站用途会清除参考行业，反之亦然；选择完整网站/品牌规范会清除不适用的相应条件。视觉风格可与两种内容组合。
- 类型选项、用途选项与分类控件位置保持稳定；切换内容类型时不删除或重排控件，不可用的范围明确禁用。卡片显示分类，详情分类链接可返回相应筛选结果。

分类定义见 `src/lib/catalog-taxonomy.json`，逐项字段位于 `src/lib/template-library.json`。原始来源资料和既有许可证未删除。

## 官方 Skill 的 MIT 与示例许可再次区分

用户进一步要求核对 UI/UX Pro Max 的开源协议。本次再次读取 [nextlevelbuilder 官方 Skill 的 LICENSE](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/LICENSE)，确认是 MIT，版权声明为 `2024 Next Level Builder`。但 VibeUI 58 项实际对应的 `yuanfu8899/uiuxskillProMax` 仓库元数据许可仍为 `null`，直接读取根 LICENSE 返回 404，且完整树与全部 HTML 已补查。

官方 Skill 当前完整树中的文件 blob 与这 58 个输出示例的交集为 0；仓库另有 `projects/healthcare-dashboard`、`projects/portfolio-dark`、`projects/saas-landing` 三个示例。这只能证明未找到相同文件，不能据此否认其他派生关系，也不能把生成工具的 MIT 自动赋给另一个作者生成并发布的网页。对这 58 项仍保留“公开许可依据待确认”的结论，而不是声称作者拒绝授权。官方 MIT 仓库中明确发布的代码与文档可按其许可使用；本轮不扩充到原 112 项以外的其他模板。

## 验证结果

666 项单元测试、类型检查、生产构建及 198 项生产 HTTP 检查通过。HTTP 覆盖全部本地许可预览、项目入口、新分类查询和公开逐项清单；检查按请求窗口节流，没有放宽站点限流规则。实际浏览器检查 1453px 桌面、390px 手机与明暗主题：无横向溢出，金融分类卡片等高，空闲 iframe 为 0；文档用途得到 2 个实际文档网站，金融行业得到 5 项规范。行业 + 风格 + 搜索组合、浏览器返回恢复条件、详情分类链接、类型切换清除不适用条件均已验证。手机下清除筛选使用有明确名称的图标按钮，避免新增按钮把排序挤到另一行。顶部公共子导航仍位于桌面 x=32px、手机 x=20px。
