# IAVSE 博客空间展示

2026-11-02，开发分支 `design/iavse-blog-space-showcase`。这部分保留在独立分支，未将博客空间改动合入主分支。

## 使用现有博客模板

展示人物只有内容资料，不携带另一套作品集模板。页面通过网站已有的 `defaultBlogDesign → applyBlogTemplate → applyBlogAppearance` 创建配置，并使用真实公开页的 `PublicBlogTheme → BlogDesignedPage → BlogDesignBlock → AnxPortfolio` 渲染链。

| 展示档案 | 现有页面排版 | 现有视觉主题 |
| --- | --- | --- |
| Lin Chen | 杂志叙事 `editorial` | 铅笔手绘 `sketch` |
| Maya Zhou | 作品画廊 `portfolio` | 薄荷书页 `mint-serif` |
| Leo Park | 清晰简历 `resume` | 深夜唱片 `night-player` |
| Aki Mori | Anx 原版 `anx` | 玻璃空间 `glass-space` |
| 李予安 | 成长时间线 `timeline` | 清新文档 `mint-docs` |
| Nora Kim | 作品画廊 `portfolio` | 孟菲斯 `memphis` |
| Sam Rivera | 双栏履历 `columns` | 深空终端 `volt-terminal` |
| Kei Tanaka | 杂志叙事 `editorial` | 深夜唱片 `night-player` |
| Anika Rao | 清晰简历 `resume` | 原版 `original` |
| Elena Rossi | 双栏履历 `columns` | 薄荷书页 `mint-serif` |
| 吴澄 | 成长时间线 `timeline` | 玻璃空间 `glass-space` |

真实作者继续使用其已公开的页面、主题和排版，内容不会替换为展示资料。既有模板 CSS、字体、栏目、配色和许可说明保持原样；此前另造的 `ShowcasePortfolio` 组件已删除。展示档案关闭模板自身的入场、交互与跑马灯动效，空间中的移动由外层场景统一控制。

## 数据与预览边界

- 真实成员仍从 `publicSpaces` 获取，并且只在原有 `data-blog-directory` 列表中展示已公开、可发现的成员。资格、下架、私有草稿与访问控制不变。
- 十一套内置资料不创建用户、注册记录、关注、发布或互动数据，不计入公开成员数量。资料包含不同的姓名、职业、简介、技能、项目与笔记，均为网站的静态展示内容。
- 展示详情使用 `/blogs/showcase/:handle` 独立地址，保留“主页设计展廊”上下文，元数据 `noindex, nofollow`。不存在的档案返回 404，不占用真实成员的 `/blog/:handle` 地址。
- `?embed=gallery` 使用已有 `.blog-gallery-embed` 包装及相同的 `PublicBlogTheme`，不包含平台导航，也不记录访问。嵌入的真实桌面视口由展廊 iframe 提供；原有 embed 样式负责隐藏文档外层滚动条。
- 中间件与 Next 响应头只为明确的 `/blog/:handle?embed=gallery` 和 `/blogs/showcase/:handle?embed=gallery` 开放同源 framing。其他页维持 `frame-ancestors 'none'` 与 `X-Frame-Options: DENY`。

## 手绘头像

十一张头像来自 DiceBear Notionists / Zoish（CC0 1.0），本地提供，见 [showcase-avatars.md](showcase-avatars.md)。模板头像仅额外接受十一个固定 `/images/showcase/*.svg` 路径；真实上传头像仍优先使用现有 `/media/:avatarId`。不接受外部网址、任意文件路径、查询参数或路径穿越。

## 空间交互方向

展示区最多 12 个主页，真实公开主页优先，静态资料补足。主页具有相同的物理宽度，分布于跨度超过 1000px 的固定世界坐标；近大远小由透视投影形成。所有页面共享一个视点，点击时平移视点并沿 Z 轴靠近目标，目标转正，其他主页保留原坐标。总览时卡片按各自观看射线朝向观看者，叠加小幅侧倾与不超过 1° 的滚转，避免侧立成窄条或上下倒斜。返回时恢复总览与先前拖动的视角。

鼠标移动产生轻微视差，横向拖动可以环顾；手机保留纵向页面滚动，横向拖动不误触打开。页片保留四个侧面和背板，展廊使用透明背景，直接融入站点既有背景，不额外覆盖矩形底色或地面网格。近裁面预留旋转后卡片角点的深度范围，避免卡片穿过观看位置产生巨大投影。减少动态效果时立即进入目标状态并停用浮动及拖动。

12 个原模板预览以最多两个并发顺序加载，先近景后远景；选中的待加载主页优先。加载失败有超时释放，资料更新会移除过时队列项；已完成的 iframe 在切换时保留。场景由一个 tween 每帧统一绘制，避免每张卡片各自重绘全场。键盘方向键在固定的作者选择区保留焦点，Esc 返回对应主页。

## 检查

`test/blog-showcase.test.mjs` 验证既有模板/主题选择、数据边界、头像路径白名单、实际 BlogTheme embed 及 noindex/404；`test/blog-gallery-preview.test.mjs` 验证同源嵌入白名单和真实作者预览规则。原有公开目录 HTTP 测试继续覆盖私有、未列出、受限和下架成员的排除。场景几何与交互检查由独立的场景模块测试负责。

完成验证：类型检查、生产构建、385 项单元测试与隔离数据库的 homepage HTTP 检查通过。浏览器验证桌面/390px 手机布局、远景卡片直接点选、放大与返回、连续选择、Esc 焦点恢复及减少动态效果；390px 无水平溢出，切换保留原有 iframe，不重新加载正文。场景只更新 transform/opacity，鼠标视差在稳定后停止逐帧更新，离开视口与后台时暂停悬浮。

第二轮运行时验收：12 个 iframe 全部成功加载；远景主页聚焦宽度约 800px，切换保留所有 iframe。320/375/414/768px 四种视口均无水平溢出，作者选择按钮最小 44px；390px 下焦点预览约 322px。实际触摸拖动能改变视角，松手后不误选主页。系统减少动态效果会关闭浮动、即时聚焦。全部 11 个样例的主题/同源嵌入/noindex、11 张 SVG、未知档案 404 与真实公开目录计数均通过 HTTP 验收。

第三轮外观调整：按 CSS Rx·Ry·Rz 顺序计算朝向观看射线的基准，再叠加桌面 6–11°、手机 4–8° 的轻微侧倾；滚转不超过 1°。正面变宽后自动预留两侧空间。删除展廊独立的浅蓝渐变与地面网格，保留站点原背景、12 个主页及原相机动画。6 项相关测试、类型检查及生产构建通过；实测 320/390/768/1440px 均无水平溢出，手机卡片两侧约 16px 以上留白，聚焦预览约 800px，所有 iframe 保持已加载。
