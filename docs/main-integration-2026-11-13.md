# 2026-11-13 主线整合与维护交接

[开发进度](development-status.zh-CN.md) · [功能验收](acceptance-2026-11-13.md) · [本地运行](getting-started.md)

## 整合范围

按用户明确要求，将公开网站 `desgin` 的 24 个提交完整合入 `main`：原主线为 `ddfb91df094584a8d903f45a34b0a77b0c26f9f8`，功能验收提交为 `3b943f3af28be819cd4dd3a973b09137c62a11b7`。主线是设计分支的祖先，因此使用快进合并，没有冲突、压缩提交或改写历史。随后增加本次主线交接文档。

`main` 是当前公开网站的维护基线。`desgin` 保留原设计历史，名称保持原拼写，不删除或重命名。首页、公共导航、社区、资源、博客画廊、后台、编辑器外壳和发布规则的具体交付见功能验收与开发进度。Pro 私有 UI、客户端和真实数据不属于本次公开交付。

## 文档与检查

README 中英版本、文档入口、开发状态、架构、运行指南、产品说明、双 UI 计划、任务表和协作规则已统一主线状态。旧截图、旧审计和功能验收保留原日期及来源，不改写成新做的测试。

本次整合不修改运行时代码。功能基线已有 724 项单元测试、23 组 HTTP 回归、生产构建、类型与桌面／手机验收。主线交接再次核对单元测试、类型、文档链接、差异和源码一致性；不把复用已有构建证据描述为重新构建，也不将本地通过等同生产验收。

原有未提交的 `public/skills/iavse-post.tar.gz` 单独保留并逐字节核对，不纳入提交。真实环境文件、数据库、上传、测试凭据和私有 Pro 文件未纳入整合。正式部署和客户端发行未执行，许可与署名保持不变。

## 仓库同步

- GitHub `IntMainJhy/IAVSE` 是可写主仓库，推送目标为 `main`。
- AtomGit `InMainJhy/IAVSE` 当前是只读镜像。直接 push 会被仓库规则拒绝（`CH.00905401`）；应使用其已有的上游镜像同步能力，不能擅自改为普通仓库、强推或重建。
- 同步前 AtomGit 的 `main` 仍为 `ddfb91d`，`desgin` 为 `45a4acf`，不能把“镜像可访问”当作最新版已更新。
- 实际完成以本地、GitHub 和 AtomGit 的 `refs/heads/main` 完整提交号一致为准。最终文档提交号由 Git 历史和远端核对结果确定，避免在文档中循环修改自己的提交号。

维护者可在仓库根目录运行以下只读核对：

```sh
git branch --show-current
git rev-parse HEAD
git ls-remote origin refs/heads/main
git ls-remote atomgit refs/heads/main
git status --short
```

## 后续维护与回退

从 `main` 建立范围明确的工作分支，完成对应验证后再合回主线。保留真实数据目录的绝对路径，不因换分支初始化或覆盖旧库。代码与数据库版本兼容性需要独立判断，不能用历史 UI 的回退替代数据恢复。

本次快进保留所有功能提交，后续若需撤销某项功能，应在新分支针对具体提交建立可审查的 revert 并验证；不要对已公开主线使用 reset 后强推。备份与恢复说明见[部署维护](../deploy/README-split.md)。生产环境、SMTP、身份核验与运营待办仍以开发进度为准。

## English handoff

The maintained public baseline is `main`, integrating all 24 commits from `desgin` through `3b943f3` without rewriting history. The design branch is retained. This handoff changes documentation only; functional evidence remains in the dated acceptance record. The pre-existing local Skill archive is preserved outside the commit. GitHub is the writable upstream; AtomGit remains a read-only mirror and must be synchronized through its supported mechanism, then verified by matching full `main` SHAs. No deployment, client release, data migration or license change is included.
