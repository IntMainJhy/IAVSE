/** Current IAVSE platform rules; historical slugs remain for link compatibility. */
export const iavseDesignGuides=[
 {slug:'iavse-rbp-design-system',title:'IAVSE 的界面设计规范',summary:'清透的浅色背景、Geist 字体、统一表面、导航与控件。',body:`# IAVSE 的界面设计规范

当前平台在已有 RBP 组件结构上，独立调整 IAVSE 的配色、字体、间距和卡片。Cloudlight 只作为通用设计原则的参考，不包含它的源码、着色器或素材。既有第三方许可保持不变。

## 统一基础

浅色画布 #f7f9fc、表面 #ffffff、正文 #172b3a、次级文字 #4d6171、边界 #dce5ed。深色画布 #0b141e、表面 #111e2b、正文 #edf5fc、边界 #2b4255。平台使用本地 Geist 字体（IAVSE Sans），遵守字体 OFL，根字号 16px。颜色从共享语义变量读取。

首页保留 Hero、四张 Projects 卡片、Contact 的结构。目录介绍区缩短顶部空白，项目区加入细分隔，Skill 展示区使用浅蓝、浅绿、浅暖色辅助分类。公共导航沿用居中的三链接胶囊。资源、社区、账号和管理界面以相同的字体、边界、按钮和表面组织各自功能。

展示卡片使用 20px 圆角，首屏与 Contact 外框 28px，控件 12px，导航和筛选使用胶囊。主操作为前景色实心按钮，次操作为底色加细边界。页面标题与内容保持原有层级，不为统一外观删除表单、筛选或管理功能。

## 源文件

DESIGN.md 是规范入口。src/app/iavse-system.css 管理平台语义变量及应用控件；src/styles/rbp-template.input.css 保留原模板工具类；src/components/rbp 是模板组件。资源目录收录的第三方规范是学习内容，不是 IAVSE 平台皮肤。

RBP 组件来源：https://github.com/DavidHDev/rbp-portfolio；本轮界面细化为 IAVSE 独立实现。
`},
 {slug:'iavse-rbp-scroll-reveal',title:'滚动入场、上移淡入与交错动画',summary:'沿用 RBP 缓动，内容完整离开视口后再次进入时重播，支持减少动态和键盘访问。',body:`# 滚动入场动画

滚动入场（Scroll Reveal）在内容进入可视区域时开始。首页、功能页面与模板的滚动 FadeIn 都在元素完整离开物理视口后，向上或向下再次进入时重播。内容仍有部分可见时，跨过触发阈值或观察区域边距不会重新隐藏或启动，避免边缘闪动。

## 三种效果

淡入（Fade In）把透明度从 0 变为 1。上移淡入（Fade In Up）同时从下方回到原位置：功能页面与模板为 12px，首页为 24px。同组卡片采用交错入场（Staggered Reveal），相邻元素间隔 70ms，总延迟最多 210ms。

沿用模板的 cubic-bezier(.22,1,.36,1) 缓动。模板滚动 FadeIn 为 800ms，功能页面为 550ms，首页为 650ms。显式挂载模式的 FadeIn 与 ScaleUnblur 保留原有挂载入场；导航弹簧、主题圆形展开和图片悬停变形各自保持独立。

## 可用性

减少动态偏好下取消未完成的入场动画并直接显示内容。聚焦到隐藏区域时立即显示，焦点停留期间保持可读，避免键盘用户等待。路由切换取消未完成动画，释放观察器与事件监听。缺少相关观察或动画 API、没有 JavaScript 时，正文仍然可读；滚动动画不接管表单或画布手势。

共享参数在 src/lib/rbp-motion.mjs，模板组件在 motion-primitives.tsx，业务页面增强在 application-reveal.tsx，首页入场在 IavseLanding.tsx。
`},
 {slug:'iavse-rbp-page-integration',title:'为页面接入统一 IAVSE 样式',summary:'页面布局、编辑器外壳、内容边界及验收方法。',body:`# 页面接入方式

公共页面通过 PublicFrame 接入，资源筛选通过 ResourceHub 接入，管理中心通过 AdminApp 接入。业务区域使用 rbp-application，共享 IAVSE 的字体、颜色、卡片、控件和反馈。

## 页面内容

详情、法律条款和文档优先保证可读性；资源目录保留搜索、筛选和来源；社区保留讨论与账号操作；管理中心保留导航、表格和审核；编辑器保留保存、预览、发布及未保存离开保护。

编辑画布中的用户作品、第三方网站预览、用户上传图片与已发布博客主题属于内容。平台样式在这些内容边界停止，不覆盖作者保存的数据或第三方品牌。

## 验收

检查桌面与手机、浅色与深色、键盘焦点、快速滚动、返回页面、筛选结果和系统减少动态设置。不能用虚构的用户、帖子或统计填充页面。历史平台皮肤从加载入口移除，历史实现通过 Git 历史追溯。
`}
];
export default iavseDesignGuides;
