# Skills 元数据导入

输入审查清单固定在 `vibeui-manifest.json`。该清单保留 VibeUI 的 341 个原 ID；修正、合并、排除都必须有理由。不能用清单中的原收录名称推断不存在的 Skill 或安装命令。

重新读取固定版本文本并生成数据：

```sh
python3 scripts/skill-import/build.py --refresh
```

也可使用本机审查时保存的临时文本证据 JSON（不应提交该临时文件）：

```sh
python3 scripts/skill-import/build.py --evidence-file /path/to/evidence.json
```

脚本不安装 npm 包、不执行第三方 Skill 或第三方 Python/JavaScript，不保存 Skill 正文到源码库。输出仅含事实元数据、独立编写简介、固定版本链接、文件哈希和处置映射。

`path` 是 Skill 的目录，根目录为 `""`；`skillFile` 是真实文件路径；`sourceUrl` 是固定 commit 的 GitHub blob 链接。独立定义按 `repo + skillFile` 合并，不能仅按 `repo` 合并不同模块。`kind=collection` 是有 README 可核实的合集入口，不代表独立定义。`kind=reference` 只进入 `vibeui-references.json`。

`sourceStatus` 和 `licenseStatus` 是两个不同判断；来源确认不代表许可授权确认。目录级许可证优先；文件声明与仓库许可不同则标为 `custom`，不擅自选一种。未核实许可不赋予默认 MIT。详情见 `docs/skill-sources-audit-2026-11-08.md`。
