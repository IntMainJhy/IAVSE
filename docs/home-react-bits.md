# 历史记录：IAVSE 首页的 React Bits 混合参考方案

> 本文仅记录已被替换的首页版本。当前整套前端以公开 RBP Portfolio 仓库为基础，见[当前实现](portfolio-frontend.md)。下文文件、参数与验收结论对应历史版本；部分旧组件已从当前源码移除。

本轮只替换首页。资源目录、社区、博客编辑器、账号及管理页面沿用已有功能与样式。首页展示实际目录精选、合格的公开社区内容和网站内置博客模板；没有添加虚构用户、客户或增长数字。

## 参考站如何制作

| 官方参考 | 关键技术 | IAVSE 的对应实现 |
| --- | --- | --- |
| [Cloudlight](https://pro.reactbits.dev/docs/templates/cloudlight-template) | WebGL2 云层、干涉场、滚动导航、响应鼠标的元素 | 明亮蓝色首屏、居中标题与操作、可实际使用的资源工作台；采用 Silk 流动场，不声称复刻其云层算法 |
| [Portfolio](https://pro.reactbits.dev/docs/templates/portfolio-template) · [公开源码](https://github.com/DavidHDev/rbp-portfolio) | WebGL flow shader、磁吸变形肖像、Lenis、Motion、主题切换 | 流动背景、轻量磁吸按钮、资源悬浮反馈、持久化深浅外观；保留原生页面滚动 |
| [Security](https://pro.reactbits.dev/docs/templates/security-template) | Canvas ASCII 波浪、WebGL 帷幕、滚动固定画廊 | 页尾独立编写的字符波浪与 IAVSE 字标；没有导入付费模板的帷幕或样例数据 |

这里的流动光影主要由片元着色器逐像素计算，不依赖复杂的 Blender 场景。ASCII 波浪则在二维 Canvas 上将连续波场映射为不同密度的字符。布局、字体、留白和交互节奏同样决定最终观感。

## 代码与许可

- `src/components/react-bits/Silk.tsx` / `Silk.css`：官方开放组件，保留 MIT + Commons Clause 原许可与版权，见 [第三方声明](../THIRD_PARTY_NOTICES.md)。组件嵌入应用，不作为组件包单独再分发。
- `HomeBitsAtmosphere.tsx`：IAVSE 色彩参数、外观偏好 Cookie、系统减少动态效果适配。
- `HomeBitsMotion.tsx` / `src/lib/home-bits.mjs`：独立 ASCII 波场、限帧和可见性控制、按钮反馈。
- `PlatformHome.tsx` / `HomeProductShowcase.tsx` / `src/app/home-react-bits.css`：首页结构与限定范围的样式。没有导入 React Bits Pro 付费模板源码。

Portfolio 的源码公开且允许用于个人及商业项目，但模板本身的转售、再分发仍受上游条款限制。其源码用于本次技术分析；应用中的第三方背景来自单独许可的开放 Silk 组件。本项目原创部分继续遵循仓库原有非商业许可。

## 行为与降级

资源分类支持鼠标与方向键切换，搜索支持 Escape 关闭，博客示例可以切换真实模板截图。正文、链接与原生 FAQ 在服务端输出；动画不承载必须读取的信息。

WebGL2 不可用时保留浅蓝或深蓝背景与全部内容。系统启用减少动态效果时，背景和字符场静止，按钮磁吸停用。后台标签页和离开可见区域的场景停止连续绘制，组件卸载时释放监听器、观察器与 GPU 资源。Silk 像素比限制为 1，字符场限制为 1.5，并以约 28 fps 上限绘制。

外观按钮写入现有 `site-color-mode` 偏好，刷新时由服务端读取。样式通过 `.rb-home` 与 `:has(.rb-home)` 限定首页，离开首页后不改变其他页面的布局。
