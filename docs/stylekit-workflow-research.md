# StyleKit 风格提取、编写与演示流程研究

核对日期：2026-11-08。仓库 [AnxForever/stylekit](https://github.com/AnxForever/stylekit)，固定提交 `38058485388d237745ccf58c6750c2ec661a72f4`。本文件记录可见源码行为，不推测每个条目的创作历史。

## 三条不同的实现路径

### 网址提取：生成待审核资料

`app/api/submit/extract/route.ts` 验证调用者与公开 URL，转发到独立提取服务。`services/style-extract/src/extract.ts` 用 Chromium 以 1440×900、减少动态模式打开目标，等待页面和字体，调用 `capturePageStyles` 读取实际计算样式，再调用一组提取脚本获得标准化结果。`lib/submit/extract-to-manifest.ts` 将颜色、字体、间距、圆角、阴影、组件样本与动效等资料转换成提交表单需要的 manifest，并返回 `needsReview`。

代码会对缺少类别、名称、描述、字体、组件或不完整字体资料标记待审核。提取只是测量和准备资料，不是自动确认作者、素材许可或页面复制权。生成规则的技术能力也不等于所有结果已获授权。

核心浏览器脚本（包括 structure-extract、component-detect、state-capture、responsive-extract、replica-blueprint 等）由服务读取 `extractor-scripts`，服务 README 说明从单独的 `style-extractor-dev/scripts` 拷入，该目录被忽略。因此当前仓库并不包含运行这条提取链需要的全部源码。不能声称克隆后即可完整复现，也不能从这个流程推断目录全部 149 项均由该服务生成。

依据：[提取服务](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/services/style-extract/src/extract.ts)、[转换器](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/lib/submit/extract-to-manifest.ts)、[服务说明](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/services/style-extract/README.md)。

### 风格目录：规范与专门编写的预览共同发布

正式风格的组成：

| 层 | 仓库位置 | 内容 |
| --- | --- | --- |
| 风格定义 | `lib/styles/<slug>.ts` | 名称、描述、设计哲学、色彩、应做/避免规则、组件示例、AI 规则、使用提示词 |
| 数值规则 | `lib/styles/<slug>-tokens.ts` | 颜色、字体、间距、圆角、阴影、状态，以及必须/禁止的 Tailwind 类 |
| 组件配方 | `lib/recipes/<slug>.ts` | 按钮、卡片、输入等实际结构、参数、变体和交互状态 |
| 目录预览 | `lib/style-preview/styles/<slug>.tsx` | 专门编写的封面与组件预览 |
| 完整演示 | `app/styles/<slug>/showcase/` | 独立的页面组件与内容，路由通常按需加载 `_content` |
| 发布一致性 | `lib/style-publication/` | 先规划与验证全部文件/注册表，再写入；部分失败回滚 |

编写规范明确要求实际编写并认可的 `previewModule` 和 `coverPreview`；发布器不会替作者构思一个通用预览。发布前检查完整定义、轻量索引、tokens、recipes、cover 和 showcase 是否同 slug 对齐。

依据：[编写指南](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/docs/STYLE_AUTHORING.md)、[新增检查表](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/docs/STYLE_ADDITION_CHECKLIST.md)。

### 基础页面导出：四类骨架与风格注入

`lib/generator/index.ts` 单独注册 landing、portfolio、blog、dashboard 四类模板；`style-injector.ts` 把内置/自定义风格转成 CSS 变量，renderers 输出 HTML、React 或 Next.js 文件。这是另一个基础导出功能，不能当作 149 个独立 showcase 的全部制作方式，更不能据此把同一个骨架换色后计为多个完成网站。

依据：[生成器入口](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/lib/generator/index.ts)、[样式注入](https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/lib/generator/style-injector.ts)。

## IAVSE 当前采用方式

用户在核对开源仓库后调整了方向：撤下此前独立重写的目录，改为直接收录许可明确的原始模板。当前以 `/zh/templates` 的 42 项为范围：5 个独立 GitHub 项目链接原仓库，37 个 StyleKit 模板按 MIT 许可在本站运行。保留原作者、网站、固定源码版本与许可；不将风格目录的 149 种风格计作 149 个完整项目。

37 项的官方导出器 `lib/templates/project.ts` 与 `export.ts` 递归包含真实页面、子路由和依赖，并生成可运行的 Next.js 项目脚手架。本站只适配预览运行环境、路由、字体与隔离样式，原 TSX 和变更记录均保留。详见 [本次模板核查](template-catalog-audit-2026-11-08.md)。
