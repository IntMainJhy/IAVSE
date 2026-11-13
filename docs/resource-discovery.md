# 资源发现、审核与每日运行

更新：2026-11-13。前台 `/resources` 的统一搜索与筛选见[目录布局](skill-directory-layout.md)。本文描述可选的后台采集，不代表服务已在当前机器或生产安装。自动采集候选仍需站长核验；社区原创文字自动发布不改变这一规则。当前交付边界见[开发进度](development-status.zh-CN.md)。

后台入口为 `/admin/discovery`，侧栏「更多管理 → 资源采集审核」。仅站点所有者可读取队列与执行操作；普通成员和社区审核员没有此权限。

## 从发现到发布

1. 点击「立即采集」，或等待每天 09:00（Asia/Shanghai）的自动采集。程序从固定白名单来源获取候选信息，按规范化后的原始来源链接去重。审核时修改来源后，仍保留旧链接的去重记录，避免次日重新收集同一条目。
2. 新内容始终是私有待审核草稿。自动采集不会把标题和摘要直接发布为完整设计规范，也不会安装候选 Skill。
3. 打开条目，核对原始来源，补充设计配色、字体、布局、动效、可复制提示词和设计规范。选择本站安全预览模板，或指定已有站内图片。Skill 需补充仓库、安装说明、许可证、支持工具及推荐理由。
4. 保存待审核版本，填写审核说明，并勾选来源与许可核验后，点击「通过并发布」。明确通过后才出现在公开资源库。
5. 不适合的候选可标记「不收录」。已公开内容编辑后，其旧的通过版本仍保留；新版需要重新审核。需要立即隐藏公开版本时，使用「下架公开版本」。

待审核、已收录、不收录和已下架都可以筛选。版本号防止两个后台窗口相互覆盖。新增、修改、发布、不收录、下架和开关设置会写入管理日志。

## 采集来源与限制

- [Awwwards](https://www.awwwards.com/feed/) 的公开 RSS。
- [GitHub Search API](https://docs.github.com/en/rest/search/search) 中 `design-system`、`agent-skills` 和 `claude-skills` 主题的公开仓库。
- 每个来源最多读取 12 条候选；单请求 12 秒超时，响应体上限 750 KB，不跟随重定向。一次运行最多 4 个固定请求。
- 不会请求管理员填写的任意网址，因此草稿中的原始来源无法触发服务器内网请求。不读取来源站点的脚本，不运行远程 HTML，不执行安装命令。
- 同时只允许一个采集任务；手动任务最短间隔一分钟。超过 5 分钟没有完成的任务按中断恢复。最近 90 次运行记录保留在数据库中。
- 来源不可用、限流或超时会在后台的采集记录中单独显示；已成功获取的其他来源结果继续保留。网络失败不代表审核队列中的条目已通过。

此程序用于发现候选，不保证覆盖所有网站，也不自动推断来源许可证或承诺像素级复刻。提示词、规范和配图必须经过实际审核。

## macOS：持续运行

使用与网站相同的 Node 24+ 和数据目录。在网站根目录执行：

```sh
node scripts/install-discovery-service.mjs install
node scripts/install-discovery-service.mjs status
```

安装器创建用户级 LaunchAgent `com.iavse.resource-discovery`。它随登录启动，独立于 Next.js 服务运行；每分钟检查一次日程，确保每个上海日期最多自动运行一次。09:00 之后首次启动或电脑从睡眠中恢复，会补做当天任务。电脑关机、退出登录或没有网络时无法保证按时采集。

网站根目录的 `.env.local` / `.env` 会被读取；安装时有效的 `APP_DATA_DIR` 被固定写入 LaunchAgent（不复制密钥）。网站与采集服务必须使用同一数据目录。默认目录与网站一致，为网站目录的上一级 `.site-v1-data`。

日志位置：`~/Library/Logs/IAVSE/discovery.log` 和 `discovery-error.log`。后台会显示最近的调度心跳。开关只控制自动采集；手动采集仍可使用。

移除服务，不删除已收集或发布的资源：

```sh
node scripts/install-discovery-service.mjs uninstall
```

## Linux 与其他部署

参考 `deploy/iavse-discovery.service.example`，把代码路径、Node 路径与 `APP_DATA_DIR` 改成部署实际值后，作为用户级 systemd 服务启用：

```sh
systemctl --user daemon-reload
systemctl --user enable --now iavse-discovery.service
```

退出登录仍需持续运行时，由服务器管理员配置用户 lingering。也可以用进程管理器托管以下命令：

```sh
node scripts/discover-resources.mjs --daemon
```

单次手动运行使用 `--once`；供已有定时任务调用、遵守每日时段与去重使用 `--scheduled`。例如每五分钟调用一次 `--scheduled`，程序内部仍以 Asia/Shanghai 09:00 判断，不依赖服务器本地时区。

## 数据与集成

- `design_intake_entries` 保存草稿、已通过快照、版本、审核状态和公开状态。
- `design_intake_source_keys` 保留来源链接的历史别名，用于跨次采集去重。
- `design_intake_runs` 保存运行结果；`config.resourceDiscovery` 保存开关、当日执行标记和心跳。
- `readPublishedDesigns()` 返回随项目提供的设计加上审核通过的运行时设计。
- `readPublishedSkills()` 返回审核通过的运行时 Skill，由公开技能目录合并展示。
- 公开页面不得缓存旧的审核结果；应在请求时读取，或在发布时主动失效缓存。
- 数据随现有 SQLite 备份一起备份，无须把真实数据库或候选草稿提交到仓库。

测试 `node --test test/design-intake.test.mjs test/admin-navigation.test.mjs` 使用临时数据目录和模拟网络，不触碰真实数据。
