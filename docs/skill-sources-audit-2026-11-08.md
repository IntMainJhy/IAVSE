# VibeUI 与 StyleKit Skills 来源复核

核验日期：2026-11-08。本文记录可读取的上游文件和公开许可，不把“来源可找到”解释为“所有关联素材都获授权”。本次只把名称、路径、许可标识、固定版本链接和自行撰写的简介加入 IAVSE；没有复制任何第三方 `SKILL.md` 正文、图片、字体、模板代码，也没有安装或执行第三方 Skill。

## 收录结果

| 对象 | 本次处理 |
| --- | --- |
| VibeUI 原始目录 | 341 个原收录 ID，逐一保留去向 |
| 可核实的 VibeUI 来源目录 | 221 个独立 Skill 定义、6 个 Skill 合集；共 227 项 |
| 暂未匹配的来源 | 54 个原收录记录归并为 20 个待核实来源索引；与主 Skills 目录分开 |
| 不作为 Skills 收录 | 32 个 HTML 模板条目和 2 个测试样例；共 34 项 |
| StyleKit | 1 个官方 Skill，名称 `stylekit`；风格数量不等于 Skill 数量 |

253 个 VibeUI 原收录记录指向 227 个主目录条目；其中相同定义和根 Skill 的模板变体合并显示。所有 341 个原 ID 均可在 `src/lib/skill-imports/vibeui-audit.json` 查到原链接、处理原因和目标 ID。待核实索引在 `vibeui-references.json`，不会被当成已验证的独立 Skills。

### 原始目录本身存在的问题

- Theme Factory、Brand Guidelines、Canvas Design 原来链接到 `anthropics/claude-code` 的仓库首页。实际文件在 `anthropics/skills/skills/…/SKILL.md`，本次更正为固定版本具体文件。Frontend Design、UI UX Pro Max、Brainstorming、Copywriting 等重复收录按同一定义合并。
- `figma/skills` 本次 GitHub 读取返回 404。同名的 7 个文件可在 `openai/skills` 读取，分别带有 Figma 专用条款；本次标注实际托管仓库和各文件许可，没有把它们归为 OpenAI 或 VibeUI 原创。
- `google-labs-code/skills` 本次读取返回 404；Design.md、Enhance Prompt、Shadcn UI、Stitch Loop 在 `google-labs-code/stitch-skills` 中有可核实文件，已记录更正。
- `nexu-io/html-anything` 的 24 个收录名在 `next/src/lib/templates/skills` 下确有独立 `SKILL.md`。它们是模板型 Skill；文件存在并不证明所有设计元素、参考品牌或输出素材均由该仓库原创。
- `zarazhangrui/beautiful-html-templates` 的固定版本只有 README 与许可证记录，没有 Skill 定义；32 个 HTML 模板不能计为 32 个 Skills，因此仅保留排除映射。
- `lewislulu/html-ppt-skill` 的根 Skill 与其演示模板名称被原目录拆分成多项，本次合并。`Leonxlnx/taste-skill` 中当前可核实的定义也不能证明原目录的全部旧名称都是当前独立 Skill；未对应名称留在待核实记录中。
- `sample-plugin` 是 `tests/fixtures` 下的测试 fixture；`import-smoke-test` 是导入验收样例，均未放入主目录。
- 原目录中的安装命令有错误仓库、未经核实的子命令和占位符。本次没有转抄这些命令，也不根据条目名自行拼接命令。

## 许可处理

VibeUI 来源主目录 227 项中，196 项读取到可识别的公开许可全文（包含 1 项 README 内的完整 MIT 文本），30 项属于专用条款、只有 README 声明或文件声明与仓库许可不同，1 项未找到可适用的许可声明或文本。三种状态分别为 `verified`、`custom`、`unverified`。这些状态独立于 `sourceStatus`：文件来源确认不等于版权授权确认。

需要特别保留的区别：

- Figma 的 7 项使用各目录中的 **Figma Developer Terms**，不能套用 `openai/skills` 中其他文件的 Apache 许可。
- Color Expert 和 Creative Director 的上游许可为 **CC BY 4.0**；Guizang PPT 的上游为 **AGPL-3.0**，不能统一标成 MIT。
- OpenDesign 的 12 个插件规范示例在文件中声明 MIT，而本次读取的仓库许可为 Apache-2.0。两份声明的适用关系没有被本次索引擅自判定；条目标为 `custom` 并解释差异。
- 目录级许可证优先于根目录许可证。若只有仓库级条款，`licenseScope` 会记录 `repository`，不扩张为其中每份外部素材的授权。
- Web Design Guidelines、Full Page Screenshot、Dexter 的两项和 inference.sh 的三项，只在 README 找到 MIT 声明；以 `custom` 和 `readme-declaration` 记录，不声称读到了许可全文。Composio 的四项也只记录仓库 README 的 Apache 声明，同时保留该 README 对各 Skill 可能采用其他许可的说明。NanoBanana PPT 的 README 含完整 MIT 文本，使用 `readme-license-text`。
- Remotion Best Practices 的固定版本未找到可适用的许可声明或全文，仍为 `unverified`；产品本身的许可、同仓库其他 Skill 的讨论均不能替代此文件的授权证据。
- 无法核实的许可保留空 `licenseUrl` 与“待核实”状态；不补写许可证、不提供源代码副本或自动安装指令。

本次不分发 Skill 正文，因此没有将上游许可证正文混入 IAVSE 自身许可。用户后续访问上游、复制代码、安装或使用第三方素材时，应遵循对应原始条款。公开许可证、来源链接和署名也不能单独消除商标、肖像、专利或第三方素材权利问题。

## StyleKit 的实际发布形式

[StyleKit 主仓库固定 README](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/README.md) 直接链接独立的 [stylekit-skill 仓库](https://github.com/AnxForever/stylekit-skill)。本次读取的 Skill 固定版本为 `93b9c1de903a6c3f6f7944224b26d154b325e1eb`：

- [根 SKILL.md](https://github.com/AnxForever/stylekit-skill/blob/93b9c1de903a6c3f6f7944224b26d154b325e1eb/SKILL.md) 名称是 `stylekit`。
- [LICENSE](https://github.com/AnxForever/stylekit-skill/blob/93b9c1de903a6c3f6f7944224b26d154b325e1eb/LICENSE) 为 MIT，版权声明为 2026 AnxForever。
- [README](https://github.com/AnxForever/stylekit-skill/blob/93b9c1de903a6c3f6f7944224b26d154b325e1eb/README.md) 明确提供 `npx skills@latest add AnxForever/stylekit-skill`，因此仅此条目展示已核实的安装命令。命令未执行；运行它会读取上游当时的版本，并非自动固定到此次审计版本。
- 脚本要求 Python 3.10+。这个 Skill 读取风格目录与公开规格，一个风格名称不对应一个独立 Skill。Skill 的 MIT 许可也不自动覆盖它引用的其他组件、品牌与素材。

## 可追溯文件

- `scripts/skill-import/vibeui-manifest.json`：341 个原 ID、固定 commit、匹配路径与处置理由。不保存原目录的宣传描述和安装命令。
- `scripts/skill-import/build.py`：从上述审查结果及固定版本文件生成元数据；`--refresh` 只请求文本，不执行上游代码。
- `src/lib/skill-imports/vibeui.json`、`stylekit.json`：供网站主目录使用。
- `src/lib/skill-imports/vibeui-references.json`：待核实的来源线索，不计入主目录。
- `src/lib/skill-imports/vibeui-audit.json`：原收录到规范条目的完整映射。
- `src/lib/skill-imports/evidence.json`：352 份已读取文件的固定版本 URL 与 SHA-256；不包含文件正文。

原始 VibeUI 快照：[Charlo-O/awesome-design-md / hotkeys-skills.js](https://github.com/Charlo-O/awesome-design-md/blob/fa4175f8d5c06683d70d05a4544e466e77fa2544/site-assets/hotkeys-skills.js)。原目录的作者字段与命令仅作为待核验线索，没有当成权利证明。
