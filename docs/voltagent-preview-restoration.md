# VoltAgent 预览恢复记录

日期：2026-11-08。

54 项来自 [VoltAgent/awesome-design-md 的固定版本](https://github.com/VoltAgent/awesome-design-md/tree/f6f44a9159d09e13fa0b5d3d9f15c20a9fbb3be1/design-md)，共 108 份浅色／深色 HTML。它们是 MIT 授权的设计规范预览，包含颜色、字体、按钮、卡片等示例；不能计为 54 个完整业务网站。品牌是参考对象，HTML 作者是 VoltAgent，VibeUI 是收录方。完整 MIT 与原作者版权随每项 `LICENSE.txt` 和页尾保留。

VibeUI 原 112 项中，其余 58 份开发者生成预览没有覆盖实际 HTML 的开源许可，已从本次可收录名单排除。技能仓库的许可不能推定为这些输出文件的许可。逐项来源证据保留在 [当前来源清单](template-source-audit.json)。

## 恢复范围

从已核对 Git blob SHA 的原始 108 份文件重新生成本地副本，删除前轮增加的研究工具条、章节选择器、颜色选择状态、通用按钮反馈、表单反馈脚本以及全局响应式／焦点／动态覆盖样式。没有新增业务操作。108 份预览均为 0 脚本，与上游静态示例性质一致。

保留原始标题、章节、示例文字、组件与 CSS 结构。保留以下必要本地适配：

- 远程 Google Fonts 替换为已逐项核验 OFL 的本地 WOFF2；原有字体版权与许可文件不变。未分发专有字体。Zapier 与 Stripe 中失效的专有 `local()` 字体声明移除，使用已有 Inter／系统回退。
- 导航与页尾图形品牌标记继续使用纯文字研究身份，未重新引入未经授权的标记或图片。
- 外部来源链接定位到本页来源说明；原始占位链接与静态控件保持示例性质。Apple 的 `#cards` 修复为存在的 `#cards-dark`。
- 末尾保留来源、完整 MIT 与独立修改说明。源码及规范链接由外层目录提供。

## 限定的深色可读性修复

原始 CSS 继续保留；下列修复作为独立样式块追加。未重排章节、修改尺寸、加入交互或重新设计页面。

### BMW：`public/design-artifacts/vibeui-bmw/dark.html`

上游把 `--white` 改成深色背景 `#1a1a1a`，但标题、导航和若干深色示例仍以它作文字色，造成文字与背景同色。只调整这些文字与描边的颜色：

```css
.nav-brand,.nav-links a,.nav-cta,.hero,.btn-blue,.btn-outline{color:#f5f5f5}
.hero p{color:#b8b8b8}
.btn-outline{border-color:#e0e0e0}
.button-item>span[style],.card[style],.card[style] h3,.elevation-card[style]{color:#f5f5f5!important}
.card[style] p{color:#b8b8b8!important}
```

实际浏览器复核：标题从 `rgb(26,26,26)` 改为 `rgb(245,245,245)`，背景仍为 `rgb(26,26,26)`。新截图已确认标题、导航、按钮清晰可见。

### MongoDB：`public/design-artifacts/vibeui-mongodb/dark.html`

同类问题：上游 `--white` 已变成森林色背景 `#001e2b`，标题主体与背景相同。只修复对应前景文字，保留标题中原来的绿色品牌参考文字：

```css
.nav-brand,.nav-cta,.nav-links a:hover,.hero,.btn-green,.btn-outline-light,.section-dark,.btn-outline-dark{color:#e8edeb}
.section-dark .card[style],.section-dark .card[style] h3{color:#e8edeb!important}
```

实际浏览器复核：标题主体从 `rgb(0,30,43)` 改为 `rgb(232,237,235)`，背景仍为 `rgb(0,30,43)`。新截图已确认。

### 原始 Dark Mode 标签：43 个深色文件

原始标签固定在右上 `top:16px`，遮挡导航 CTA。保留标签原来的色彩、字体、尺寸和文字，追加类名并改到导航下方的首屏空白区域：

```css
.iavse-theme-badge{position:absolute!important;top:80px!important;right:16px!important}
```

涉及以下 `public/design-artifacts/vibeui-<名称>/dark.html`：elevenlabs、minimax、opencode-ai、x-ai、cursor、linear-app、lovable、mintlify、posthog、raycast、resend、sentry、supabase、superhuman、vercel、warp、zapier、composio、hashicorp、mongodb、sanity、stripe、airtable、cal、clay、framer、intercom、miro、notion、pinterest、webflow、coinbase、kraken、revolut、wise、airbnb、apple、bmw、ibm、nvidia、spacex、spotify、uber。

43 页逐一重载与截图；标签包围盒均不再与导航包围盒相交。Runway 经独立原尺寸截图与计算样式核对，原本就是白色标题／黑色背景，未对它作多余颜色修改。

## 验证与封面

- 原始内容检查覆盖全部 108 文件：正文文字保留（审查过的导航／页尾身份替换除外），原始 CSS 块保留（已记录的字体替代除外）；限定深色修复另行追加。
- 108 文件在共享浏览器空间 29、页面 p3 实际加载，1440×960 视口。字体加载后截图；无字体加载错误、外部资源请求、横向溢出、旧工具条或新增脚本。43 页定位修复后再次检查。
- 54 张浅色封面来自真实浏览器顶端视口，原图 1440×960，导出 720×480 WebP。路径为 `public/template-covers/voltagent-<原目录名称>.webp`；共 741,300 字节。没有生成插画或重构截图内容。
- 验证范围是本地静态预览的桌面加载、字体、内容保留和上述定位／可读性修复；静态示例不因此具有账号、支付或业务提交功能。

机器记录、逐页源文件与本地 SHA、实际截图、每页追加 CSS 及封面哈希位于 [预览适配清单](voltagent-preview-cleanup.json)、`voltagent-source-preservation.json`、`voltagent-browser-checks.json`、`voltagent-cover-manifest.json`。原始来源副本仍保留，未改动目录 registry。
