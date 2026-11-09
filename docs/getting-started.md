# 本地运行与验证 / Local development

[中文首页](../README.md) · [English README](../README.en.md) · [故障排查 / Troubleshooting](troubleshooting.md)

## 环境 / Requirements

- Node.js **24.15+**，包含应用使用的内置 SQLite / includes the SQLite APIs used by the application.
- npm、Git；使用提交的 `package-lock.json` / use the committed lockfile.
- 默认监听 `127.0.0.1:3008` / default loopback address. Native dependencies such as Sharp need a supported Node/OS combination.

## 首次运行 / First run

```sh
git clone https://github.com/IntMainJhy/IAVSE.git
cd IAVSE
npm ci
cp .env.local.example .env.local
node --env-file=.env.local scripts/setup.mjs
npm run dev
```

打开 / Open **http://127.0.0.1:3008/**. The checkout itself is the website root.

已有 `.env.local` 时不要覆盖。复制环境模板仅用于新安装。直接运行 Node 脚本时显式加上 `--env-file=.env.local`；Next.js 会按自身规则读取本地环境文件。

Preserve an existing `.env.local`. Copy the example only for a new installation. Standalone Node scripts need `--env-file=.env.local`; Next.js loads its local environment files.

初始化打印实际数据目录。首次随机管理员凭据保存在该目录的 `initial-admin.txt`；重复运行不会重置现有密码。登录后按管理端提供的方式更改密码。不要把凭据贴进 Issue。

Setup prints the actual data directory. First-run random administrator credentials are stored in its `initial-admin.txt`; running setup again does not reset an existing account. Change the password through administration. Do not include credentials in issues.

## 数据与配置 / Data and configuration

| Setting | Purpose / 用途 |
| --- | --- |
| `APP_DATA_DIR` | Private persistent directory; defaults to `../.site-v1-data` / 私有持久目录，默认在仓库外 |
| `PUBLIC_URL` | Exact browser origin, including port / 与浏览器主机名、协议、端口一致 |
| `COOKIE_SECURE` | `false` for local HTTP; HTTPS production uses secure cookies / 本地与生产分别设置 |
| `REGISTRATION_ENABLED` | Explicitly enable platform registration / 显式启用平台注册 |
| `PUBLIC_FEATURES_ENABLED` | Production public-feature gate; follow deployment requirements / 公网功能开关 |
| SMTP settings | Optional mailbox verification and password recovery / 邮箱验证及密码找回 |

For all examples, use [.env.example](../.env.example), [.env.local.example](../.env.local.example) and the [deployment templates](../deploy/README-split.en.md). Never commit the real environment file.

继续已有站点时固定 `APP_DATA_DIR` 的绝对路径。不同目录意味着不同数据库。先确认路径再恢复备份，避免用空数据覆盖原站点。不要同时用多个进程写同一上传目录。

Pin the existing absolute `APP_DATA_DIR` when continuing a site. A different directory opens a different database. Check the path before restoring, and avoid concurrent writers to the same upload directory.

## 验证 / Validation

```sh
npm run docs:check
npm test
npm run build
npm run typecheck
npm start
```

`npm start` requires a completed build and uses the same default port as `npm run dev`. Stop development before starting production on that port. Do not build into a directory that a development process is actively using; Next.js shares its `.next` output there.

`npm start` 需要先构建，默认端口与开发模式相同。使用同一目录做生产构建前，先停止开发进程，避免共用 `.next` 产物互相影响。

HTTP suites such as `npm run test:homepage:http`, `npm run test:gallery:http` and `npm run test:registration:http` create temporary data. Check their ports and run them against disposable fixtures.

## 接下来 / Next

- [架构与学习导览 / Architecture](architecture.md)
- [博客编辑 / Blog editor](blog-editor.zh-CN.md) · [English](blog-editor.md)
- [AI Skill / MCP / REST](../integrations/iavse-post/references/api.md)
- [分入口部署 / Deployment](../deploy/README-split.md) · [English](../deploy/README-split.en.md)
