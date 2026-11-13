# 架构与学习导览 / Architecture and code tour

[返回文档中心 / Documentation](README.md)

IAVSE uses Next.js App Router for pages and same-origin APIs, React for interactive components, TypeScript for the UI and JavaScript modules for much of the server logic. Node.js SQLite and a private filesystem hold site data. This guide describes the current public website implementation; dated design records describe earlier iterations.

IAVSE 以 Next.js App Router 组织页面与同源接口，React 承载交互，TypeScript 用于界面，大部分服务端逻辑使用 JavaScript 模块。数据保存在 Node.js SQLite 与私有文件目录。本页对应当前公开网站实现；历史设计记录保留原验证范围。

```text
Browser / 浏览器
  ├── Public pages / 首页、社区、博客、资源
  ├── Member workspace / 私有草稿与编辑器
  └── Administration / 审核、账号与运营
            │
       Next.js pages + APIs
            │
       src/lib domain modules
            │
       SQLite + private files

Authorized AI tool / 授权的 AI 工具
  └── IAVSE Skill or stdio MCP bridge → scoped REST API → same domain modules
```

## 按一条真实路径阅读 / Follow a real request

| Layer | Entry point | What to inspect / 阅读重点 |
| --- | --- | --- |
| Page composition | [AppPage.tsx](../src/components/AppPage.tsx) | Route, authentication and page assembly / 页面分发与鉴权上下文 |
| Shared public shell | [PortfolioRuntime.tsx](../src/components/portfolio/PortfolioRuntime.tsx), [IavseHeader.tsx](../src/components/IavseHeader.tsx), [IavseMobileDock.tsx](../src/components/IavseMobileDock.tsx) | Persistent navigation, mobile dock and route boundaries / 持续顶栏、手机底部导航与路由边界 |
| Homepage | [PlatformHome.tsx](../src/components/PlatformHome.tsx), [IavseLanding.tsx](../src/components/landing/IavseLanding.tsx) | Public content, product overview and getting-started FAQ / 公开内容、产品说明与使用问答 |
| Spatial interaction | [BlogSpaceGallery.tsx](../src/components/BlogSpaceGallery.tsx) | CSS perspective gallery, bounded iframe loading and accessible list / 透视画廊、有界预览与普通列表 |
| Blog editing | [BlogEditor.tsx](../src/components/BlogEditor.tsx), [BlogCanvas.tsx](../src/components/BlogCanvas.tsx) | Saved data, canvas state, preview and publication / 保存数据、画布状态、预览与发布 |
| Community | [CommunityApp.tsx](../src/components/CommunityApp.tsx), [community.mjs](../src/lib/community.mjs) | Feed, account context, moderation and public data / 动态、账号、审核与公开数据 |
| Storage | [db.mjs](../src/lib/db.mjs), [spaces.mjs](../src/lib/spaces.mjs) | SQLite, account ownership, revisions and file references / 数据库、归属、版本与文件引用 |
| Catalog | [ResourceHub.tsx](../src/components/ResourceHub.tsx), [design-catalog-query.mjs](../src/lib/design-catalog-query.mjs) | Category routing, bounded queries and filters / 分类入口、分批查询与筛选 |
| AI bridge | [iavse-mcp.mjs](../integrations/iavse-mcp.mjs), [API reference](../integrations/iavse-post/references/api.md) | Scopes, save/submit separation and idempotency / 权限范围、保存提交分离与幂等 |

## 需要一起理解的边界 / Boundaries to read together

- **Private draft → public snapshot.** Saving and publishing differ. Review requirements depend on content type; see [publication rules](public-launch.en.md) and the [editor guide](blog-editor.md). Site-owner save behavior has its own documented exception.
- **Account ownership.** A page being visible in a browser does not grant access to its draft, uploaded original or management endpoint. Trace server checks, not only disabled UI controls.
- **Website package sandbox.** Hosted HTML/ZIP packages run with constrained browser capabilities. Read the [hosting guide](blog-hosting.md) before changing preview or asset behavior.
- **AI authorization.** A token's scope limits what a tool can do. Saving content does not grant publication permission. The bridge uses the same server-side workflow as manual editing.
- **Public examples.** Bundled showcase profiles are presentation data. They do not create accounts, community activity or registered-user counts.

## 从测试验证理解 / Learn through tests

Use the relevant `test/*.test.mjs` beside the module you are reading. Write-oriented HTTP suites start independent processes and use temporary data. Read-only catalog suites require an explicitly selected disposable server; see the setup guide. Existing tests exercise authentication, origin checks, publication snapshots, file ownership, recovery, catalogs and UI interactions. A historical test count is not a guarantee for the current tree; run the checks.

先读一个模块及对应测试，修改一个明确行为，再运行相关检查。HTTP 测试使用独立进程与临时目录，不用真实账号和站点数据练习。运行命令见[本地指南](getting-started.md)。

## 当前实现补充 / Current implementation notes

`HomeProductShowcase`、`HomeSpatialShowcase` 和 `home-glass.ts` 保留历史源码，当前首页不挂载它们。画廊的后台选择由 `GallerySettings`、`/api/admin/spaces/gallery` 和 `publicGallery` 共同处理；列表仍只暴露合格公开主页。目录共用 `DirectorySearch` 与 `DirectoryFacet`。完整发布类型表、尚未接入的身份核验服务及上线边界见[开发进度](development-status.zh-CN.md)。
