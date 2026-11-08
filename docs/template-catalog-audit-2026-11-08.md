# 模板目录：当前范围与来源

核查及更新日期：2026-11-08。根据用户最新要求，移除 37 个 StyleKit 自制模板和同一维护者的 AnxForever 个人站。原 TSX、适配代码、独立模板路由、43 个字体文件和 37 张封面均退出网站源码与发布目录。早期来源研究保留在 Git 历史和 [机器可读来源记录](template-source-audit.json)，不再作为正在收录的内容。

当前注册表共 **66 项**：12 个独立 GitHub 项目、54 个 VoltAgent MIT 设计规范预览。新增 8 项的固定版本、许可、实际演示及内嵌核查见 [GitHub 扩充记录](github-template-expansion-2026-11-08.json)。

| 项目 | 原仓库 | 许可与预览 |
| --- | --- | --- |
| AstroPaper 技术博客 | [satnaing/astro-paper](https://github.com/satnaing/astro-paper) | MIT；真实封面和原站完整预览。 |
| Fuwari 图文博客 | [saicaca/fuwari](https://github.com/saicaca/fuwari) | MIT 软件；真实封面省略未单独确认许可的动漫图片，保留原界面组件；完整预览留在原域。 |
| AstroWind 多页企业站 | [arthelokyo/astrowind](https://github.com/arthelokyo/astrowind) | MIT，保留 onWidget 版权；原演示 HTTP 402。封面从原仓库实际运行后截图，省略示例照片。点击查看明确标为静态截图，源码入口可用。 |
| NextDevTpl | [evepupil/NextDevTpl](https://github.com/evepupil/NextDevTpl) | MIT；保留原作者、真实封面和原站完整预览。 |

StyleKit 作为 [发现线索](https://www.stylekit.top/zh/templates) 继续标注，具体源码与许可直接指向各原始项目。其 MIT 声明仍覆盖本目录沿用的事实性说明与分类资料；这不表示继续发布其自制模板。

新增的完整项目为 Tabler、Hextra、Just the Docs、Clean Blog、Freelancer、Landwind、Bigspring Light、Resume；全部来自各自独立 GitHub 仓库，已核对 MIT 并在本站实际打开内嵌预览。禁止内嵌的 Cara、演示暂停的 Tailwind Blog 与许可未确认的 Cruip 候选未加入。

## VibeUI 来源链

此前对用户提供的旧 112 项快照完成逐文件核对，当前继续保留其中 **54 项、108 个浅色/深色 HTML**，来源为 [VoltAgent 固定历史版本](https://github.com/VoltAgent/awesome-design-md/tree/f6f44a9159d09e13fa0b5d3d9f15c20a9fbb3be1)，保留 MIT 及原始设计文档。它们是品牌启发的设计规范与组件预览，不作为品牌官方模板或完整应用发布。

另 58 项来自 [yuanfu8899/uiuxskillProMax](https://github.com/yuanfu8899/uiuxskillProMax/tree/5c1fb49813069920bdc3fcbb8aee02cd6e8f5157)，未找到覆盖这些 HTML 的许可证，继续排除。`hotkeys.design` 与 `awesome-gpt-image-2` 分别属于 Skill 和图像/提示词资料，不当成额外网站模板导入。历史核对与当前在线数量变化见 [来源研究](design-rights-vibeui-audit.md)。

## 界面、封面与性能

搜索默认收起为按钮，点击后以网格展开、透明度与有限模糊显露输入区。草稿输入不更新结果，点击搜索或 Enter 后提交；Esc 收起并取消未提交草稿。使用场景、收藏和排序沿用站内 Apple 灰阶、动作蓝与圆角控件。

目录桌面默认四列，更宽屏为五列；网格使用等高行与拉伸对齐，底部操作区自动贴底；较长标题或额外说明不会导致卡片底边错位。说明区不设置固定最小高度。卡片使用圆角、轻阴影和 5px 悬浮，原图在下缘经 35px 渐进模糊过渡到清晰的文字面。GitHub 以玻璃按钮置于封面左上方。减少动态时移除位移，减少透明度或缺少 backdrop-filter 时退回实色表面。

全部 66 项均使用有来源记录的真实界面截图；项目封面的拍摄方式、被省略的示例媒体、原仓库版本与相关字体/图标许可见 `public/template-covers/project-covers.sources.json`。未复制 Anx 肖像或任何未确认许可的动漫图、照片。

首次渲染 24 项，接近底部时继续追加，直到全部 66 项，没有分页。卡片仅加载静态封面；仅在点击时挂载一个预览对话框，关闭即卸载并恢复焦点。AstroWind 明确显示原仓库界面截图，不请求已失效的原站 iframe。目录和详情链接关闭自动预取。

第三方代码与字体保留其 MIT、ISC、Apache-2.0、OFL 条款；IAVSE 自身的非商业许可不覆盖第三方原有许可。来源研究与原许可证继续保留。

## 本轮验收

新增八项均在站内的隔离预览文档实际打开，检查到各项目真实正文，而非仅核对 HTTP 200。每条项目封面保存原来源、版本、截图处理范围与许可。657 项自动测试、类型检查、生产构建与 194 项生产 HTTP 检查全部通过。桌面 1453px、手机 390px 及深色模式完成实际检查：四列卡片约 327×377px，悬浮位移 5px，图文交界处渐进模糊；搜索草稿不改变结果，提交、清空、Esc 收起和焦点返回可用。连续浏览实测 24→48→66，空闲 iframe 为 0。12 条项目封面来源、图像及历史许可哈希与相关许可文件均已核查。

卡片等高修复复核：11 项相关目录测试、类型检查与生产构建通过。2048 / 1453 / 1000 / 768 / 390px 五种宽度实测均等高、同排底边一致，无横向溢出；1453px 生产环境下全部 66 张卡片高度为 401.265625px，操作区距卡片底边均为 8px，空闲 iframe 为 0。
