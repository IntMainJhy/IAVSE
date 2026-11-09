# IAVSE 文档 / Documentation

[中文项目首页](../README.md) · [English README](../README.en.md) · [更新记录 / Changelog](../CHANGELOG.md)

IAVSE 将资源发现、实践交流和可编辑博客主页连接在一起。网站原创部分采用 [PolyForm Noncommercial 1.0.0](../LICENSE)，署名和范围见 [NOTICE](../NOTICE)。

IAVSE connects resource discovery, community practice and editable blog homepages. Original website material is source-available under the noncommercial license linked above.

## 开始使用 / Start here

| 要做什么 / Task | Guide |
| --- | --- |
| 在本地运行 / Run locally | [安装与验证 / Getting started](getting-started.md) |
| 了解代码 / Read the implementation | [架构与学习导览 / Architecture](architecture.md) |
| 解决运行问题 / Diagnose a problem | [故障排查 / Troubleshooting](troubleshooting.md) |
| 查看当前页面 / View the current UI | [真实截图与范围 / Captures](screenshots/README.md) |
| 反馈和参与 / Ask or contribute | [Support](../SUPPORT.md) · [Contributing](../CONTRIBUTING.md) |

## 阅读与创作 / Read and create

| 主题 / Topic | English | 简体中文 |
| --- | --- | --- |
| 博客编辑与发布 / Blog editing | [Blog editor](blog-editor.md) | [博客编辑](blog-editor.zh-CN.md) |
| 简历提取与隐私 / Résumé import | [Import guide](resume-import.md) | [简历导入](resume-import.zh-CN.md) |
| 静态网站包 / Static site hosting | [Hosting](blog-hosting.md) | [托管说明](blog-hosting.zh-CN.md) |
| 邮箱与注册 / Registration and mail | [Registration and SMTP](email-registration.md) | 同页含中文说明 |
| 资源发现 / Catalog discovery | [Resource directory](resource-discovery.md) | 同页含实现说明 |
| 法律咨询资料入口 / Legal resource page | [Scope and source](legal-consultation.md) | 同页含中文说明 |

当前编辑器提供六种布局与八种视觉主题，支持内联画布编辑与响应式预览。保存、公开和审核是不同操作；实际权限与类型规则见编辑和部署指南。内置示例不创建账号，也不计入真实成员数量。

The current editor provides six layouts, eight visual themes, inline editing and responsive preview. Saving, publishing and review are distinct. Built-in examples do not create accounts or inflate member counts.

## AI 工具接入 / AI integration

- [IAVSE Skill](../integrations/iavse-post/SKILL.md)
- [REST API、凭据范围与 MCP 配置 / API, scopes and MCP](../integrations/iavse-post/references/api.md)
- [stdio MCP bridge](../integrations/iavse-mcp.mjs)

按范围授权工具，先保存草稿，再按实际授权提交。旧 `/workspace/connect` 地址跳到编辑器，创建凭据请以 API 文档为准。

## 部署与维护 / Deploy and maintain

| 主题 / Topic | English | 简体中文 |
| --- | --- | --- |
| 平台 / 管理端分入口 | [Deployment](../deploy/README-split.en.md) | [部署](../deploy/README-split.md) |
| 管理中心 | [Administration](administration.en.md) | [管理中心](管理中心说明.md) |
| 公开运营边界 | [Public operation](public-launch.en.md) | [公开运营](public-launch.md) |
| 审核与上线准备 | [Moderation and launch](moderation-and-launch.md) | 同页含中文说明 |
| 安全问题 | [Reporting policy](../SECURITY.md) | 同页含中文说明 |
| 许可与署名 | [License guidance](licensing.md) | 同页含中文说明 |
| 第三方材料 | [Notices](../THIRD_PARTY_NOTICES.md) | 以各原始许可为准 |
| 标志与艺术字 | [Brand assets](brand.md) | 共享标志和 README 标题的来源 |

数据库、真实环境文件、上传、邮件、密钥和备份保存在私有存储。客户端不属于此网站源码仓库。当前仓库未声明一个经过生产验收的公开演示地址；本机地址不作为在线演示发布。

## 当前实现与历史记录 / Current design and history

- [当前首页：React Bits 参考与实现 / Current homepage](home-react-bits.md): flowing blue light, working resource controls, native scroll, appearance and reduced-motion behavior.
- [旧版首页产品空间 / Historical spatial homepage](home-product-redesign.md): superseded optical opening and scroll-driven chapters; retained as a historical design record.
- [目录分批查询与性能](catalog-performance-2026-11-08.md): bounded batches, source/license separation and measurement scope.
- [模板与展廊修复](blog-gallery-template-repair-2026-11-08.md).
- [2026-11-06 名称与清理](cleanup-2026-11-06.md).
- [2026-11-04 仓库维护记录](release-2026-11-04.md).
- [2026-11-02 检查记录](release-2026-11-02.md).

带日期的设计、性能和验证记录只描述当时范围，不替代当前代码或运行结果。Latest repository changes are summarized in [CHANGELOG.md](../CHANGELOG.md).

## 仓库入口 / Repositories

- [GitHub · IntMainJhy/IAVSE](https://github.com/IntMainJhy/IAVSE) is the source repository and issue/PR entry point.
- [AtomGit · InMainJhy/IAVSE](https://atomgit.com/InMainJhy/IAVSE) is a downstream mirror. Its synchronization state should be checked independently.

Current description:

> A creator platform for resources, community and editable blog homepages. Visual canvas, spatial gallery, docs, AI Skills and scoped MCP/REST integration. PolyForm Noncommercial 1.0.0.

Chinese introduction:

> IAVSE 是面向开发者与创作者的社区和博客平台，连接资源发现、实践分享与可编辑个人主页，提供可视化画布、空间展廊、文档、AI Skill 和按范围授权的 MCP / REST 接入。网站源码采用 PolyForm Noncommercial 1.0.0，欢迎保留署名的非商业学习与维护。
