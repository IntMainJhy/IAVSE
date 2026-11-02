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

真实作者继续使用其已公开的页面、主题和排版，内容不会替换为展示资料。既有模板 CSS、字体、栏目、配色和许可说明保持原样；此前另造的 `ShowcasePortfolio` 组件已删除。展示档案关闭模板自身的入场、交互与跑马灯动效，空间中的移动由外层场景统一控制。

## 数据与预览边界

- 真实成员仍从 `publicSpaces` 获取，并且只在原有 `data-blog-directory` 列表中展示已公开、可发现的成员。资格、下架、私有草稿与访问控制不变。
- 四套内置资料不创建用户、注册记录、关注、发布或互动数据，不计入公开成员数量。资料包含不同的姓名、职业、简介、技能、项目与笔记，均为网站的静态展示内容。
- 展示详情使用 `/blogs/showcase/:handle` 独立地址，保留“主页设计展廊”上下文，元数据 `noindex, nofollow`。不存在的档案返回 404，不占用真实成员的 `/blog/:handle` 地址。
- `?embed=gallery` 使用已有 `.blog-gallery-embed` 包装及相同的 `PublicBlogTheme`，不包含平台导航，也不记录访问。嵌入的真实桌面视口由展廊 iframe 提供；原有 embed 样式负责隐藏文档外层滚动条。
- 中间件与 Next 响应头只为明确的 `/blog/:handle?embed=gallery` 和 `/blogs/showcase/:handle?embed=gallery` 开放同源 framing。其他页维持 `frame-ancestors 'none'` 与 `X-Frame-Options: DENY`。

## 手绘头像

四张头像来自 DiceBear Notionists / Zoish（CC0 1.0），本地提供，见 [showcase-avatars.md](showcase-avatars.md)。模板头像仅额外接受四个固定 `/images/showcase/*.svg` 路径；真实上传头像仍优先使用现有 `/media/:avatarId`。不接受外部网址、任意文件路径、查询参数或路径穿越。

## 空间交互方向

初态全部主页缩小，以前后层次和错落位置散布在空间中；前景较大、后景较小，各自保持轻微悬浮。点击某个主页后才前移放大，查看完成可返回空间总览。正文以真实 DOM iframe 展示，始终使用原模板，不将页面压成图片，也不做左右轮播。

## 检查

`test/blog-showcase.test.mjs` 验证既有模板/主题选择、数据边界、头像路径白名单、实际 BlogTheme embed 及 noindex/404；`test/blog-gallery-preview.test.mjs` 验证同源嵌入白名单和真实作者预览规则。原有公开目录 HTTP 测试继续覆盖私有、未列出、受限和下架成员的排除。场景几何与交互检查由独立的场景模块测试负责。

完成验证：类型检查、生产构建、383 项单元测试与隔离数据库的 homepage HTTP 检查通过。浏览器验证桌面/390px 手机布局、远景卡片直接点选、放大与返回、连续选择、Esc 焦点恢复及减少动态效果；390px 无水平溢出，切换保留原有 iframe，不重新加载正文。场景只更新 transform/opacity，鼠标视差在稳定后停止逐帧更新，离开视口与后台时暂停悬浮。
