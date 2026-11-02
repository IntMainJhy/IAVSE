# IAVSE documentation / 文档导航

[English project introduction](../README.md) · [中文项目介绍](../README.zh-CN.md)

IAVSE combines editable developer blog homepages with shared docs, independent AI Skills and useful resources. Original website code is source-available under [PolyForm Noncommercial 1.0.0](../LICENSE), permitting noncommercial use, modification, deployment and redistribution within its terms. See [NOTICE](../NOTICE) for attribution and scope.

IAVSE 将可编辑的开发者博客主页与共享文档、独立 AI Skill、实用资源连接起来。网站原创源码按 [PolyForm Noncommercial 1.0.0](../LICENSE) 允许非商业使用、修改、部署和再分发，署名与范围见 [NOTICE](../NOTICE)。欢迎非商业学习与维护；保留原作者及项目来源，参与方式见[维护指南](../CONTRIBUTING.md)。

## Read and create / 阅读与创作

| Topic / 主题 | English | 简体中文 |
| --- | --- | --- |
| Email registration / 邮箱与密码注册 | [Registration and SMTP](email-registration.md) | 同页含中文说明 |
| Blog editing and publication / 博客编辑与发布 | [Blog editor](blog-editor.md) | [博客编辑](blog-editor.zh-CN.md) |
| Résumé extraction and privacy / 简历提取与隐私 | [Résumé import](resume-import.md) | [简历导入](resume-import.zh-CN.md) |
| Existing static-site hosting / 已有静态托管 | [Hosting](blog-hosting.md) | [托管说明](blog-hosting.zh-CN.md) |
| AI publishing and scoped credentials / AI 发布与权限凭据 | [REST and stdio MCP reference](../integrations/spaceyew-post/references/api.md) | 同页含凭据配置中文说明 |

The current editor provides six page layouts and eight visual themes, inline canvas editing and responsive preview. Public blog discovery includes the spatial gallery. Saving keeps a private draft; publishing creates an explicit public snapshot. Articles and shared documents require review; blog homepages, projects, Skills and resources publish directly under the existing account and takedown controls.

当前编辑器支持六种排版、八种视觉主题、画布内联编辑与响应式预览；公开博客发现页包含空间展廊。保存保持私有草稿，显式发布生成公开快照。文章与共享文档需审核，博客主页、项目、Skill 和资源按现有账号及下架规则直接发布。

最新维护记录：[2026-11-02 审计与收尾](release-2026-11-02.md)。

## Maintain and operate / 维护与运营

| Topic / 主题 | English | 简体中文 |
| --- | --- | --- |
| Administration / 网站管理 | [Administration](administration.en.md) | [管理中心](管理中心说明.md) |
| Platform/admin deployment / 分入口部署 | [Deployment](../deploy/README-split.en.md) | [部署说明](../deploy/README-split.md) |
| Moderation and launch / 审核与上线 | [Launch checklist](moderation-and-launch.md) | 同页含中文说明 |
| Scoped audit and validation / 审计与验证 | [2026-10-22 audit](audit-2026-10-22.md) | 同页含中文说明 |
| IAVSE identity and generated icons / 站点标识与图标生成 | [Brand assets](brand.md) | 英文技术说明 |
| Third-party attribution / 第三方署名 | [Notices](../THIRD_PARTY_NOTICES.md) | 以原始许可条款为准 |

Production registration and publishing depend on explicit deployment settings. Local rule screening is triage, not a compliance certificate. There is no public production demo URL at present. Application data, real résumé sources and user media belong in private storage; macOS and Windows clients are outside this repository.

公网注册与生产发布由部署配置显式启用；本地规则仅作风险初筛，不代表合规认证。目前没有公开生产演示地址。应用数据、真实简历源文件及用户媒体保存在私有存储，macOS、Windows 客户端不属于此仓库。

## Performance / 性能

[2026-11-03 性能优化与测量记录](performance-2026-11-03.md) · covers shared loading, fonts, catalog reads and editor code splitting.

## Repository presentation / 仓库简介

Current repository description / 当前仓库简介：

> IAVSE: Developer portfolios, spatial blogs, docs and Skills. Noncommercial use and maintenance welcome. Original author credit required. PolyForm Noncommercial 1.0.0.

Suggested topics: `nextjs`, `react`, `typescript`, `sqlite`, `portfolio`, `developer-community`, `agent-skills`, `mcp`, `source-available`.

Both repositories carry the same website commits and license:

- [GitHub · IntMainJhy/IAVSE](https://github.com/IntMainJhy/IAVSE)
- [AtomGit · InMainJhy/IAVSE](https://atomgit.com/InMainJhy/IAVSE)

Do not use a loopback URL or an unlaunched domain as the repository's live Website URL. 更新简介时保持两处一致；未正式上线前，不将本机地址或尚未上线的域名填写为在线演示。
