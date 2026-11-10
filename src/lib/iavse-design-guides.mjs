/** Platform design documentation. RBP is the only active platform standard. */
export const iavseDesignGuides=[
 {slug:'iavse-rbp-design-system',title:'IAVSE 的 RBP Portfolio 设计规范',summary:'统一的黑白表面、系统字体、胶囊导航、卡片与控件。',body:`# IAVSE 的 RBP Portfolio 设计规范

当前平台只采用 DavidHDev/rbp-portfolio 的设计语言，固定参考提交为 1581b9b8e5876f60e5eb844970747506980c4412。

## 统一基础

浅色背景 #ffffff、正文 #0a0a0a、次级表面 #f5f5f5、边界 #e5e5e5。深色背景 #0a0a0a、正文 #fafafa、次级表面 #171717、边界 #262626。字体匹配示例网站实际使用的 system-ui，根字号 16px。颜色只能从共享语义变量读取。

首页保留 Hero、四张 Projects 卡片、Contact 的结构。公共导航沿用居中的三链接胶囊。资源、社区、账号和管理界面以相同的字体、边界、按钮和表面组织各自功能。

卡片使用 24px 圆角，Contact 外框 32px，控件 12px，导航和筛选使用胶囊。主操作为前景色实心按钮，次操作为底色加细边界。页面标题与内容保持原有层级，不为统一外观删除表单、筛选或管理功能。

## 源文件

DESIGN.md 是规范入口。src/app/rbp-system.css 管理平台语义变量及应用控件；src/styles/rbp-template.input.css 保留原模板工具类；src/components/rbp 是模板组件。资源目录收录的第三方规范是学习内容，不是 IAVSE 平台皮肤。

来源：https://github.com/DavidHDev/rbp-portfolio
`},
 {slug:'iavse-rbp-scroll-reveal',title:'滚动入场、上移淡入与交错动画',summary:'沿用 RBP 缓动，在首次进入视口时触发，支持减少动态和键盘访问。',body:`# 滚动入场动画

滚动入场（Scroll Reveal）在内容进入可视区域时开始，而不是页面加载时提前播放。首次入场后不再反复隐藏内容。

## 三种效果

淡入（Fade In）把透明度从 0 变为 1。上移淡入（Fade In Up）同时从下方 12px 回到原位置。同组卡片采用交错入场（Staggered Reveal），相邻元素间隔 70ms，总延迟最多 210ms。

沿用模板的 cubic-bezier(.22,1,.36,1) 缓动。模板内容入场为 800ms；功能页面为 550ms。首屏标题、图片保留原模板入场，导航弹簧、主题圆形展开和图片悬停变形各自保持独立。

## 可用性

减少动态偏好下直接显示内容。聚焦到隐藏区域时立即显示，避免键盘用户等待。路由切换取消未完成动画，释放观察器。没有 JavaScript 时正文仍然可见；滚动动画不接管表单或画布手势。

共享参数在 src/lib/rbp-motion.mjs，模板组件在 motion-primitives.tsx，业务页面增强在 application-reveal.tsx。
`},
 {slug:'iavse-rbp-page-integration',title:'为页面接入统一 RBP 样式',summary:'页面布局、编辑器外壳、内容边界及验收方法。',body:`# 页面接入方式

公共页面通过 PublicFrame 接入，资源筛选通过 ResourceHub 接入，管理中心通过 AdminApp 接入。业务区域使用 rbp-application，共享 RBP 的字体、颜色、卡片、控件和反馈。

## 页面内容

详情、法律条款和文档优先保证可读性；资源目录保留搜索、筛选和来源；社区保留讨论与账号操作；管理中心保留导航、表格和审核；编辑器保留保存、预览、发布及未保存离开保护。

编辑画布中的用户作品、第三方网站预览、用户上传图片与已发布博客主题属于内容。平台样式在这些内容边界停止，不覆盖作者保存的数据或第三方品牌。

## 验收

检查桌面与手机、浅色与深色、键盘焦点、快速滚动、返回页面、筛选结果和系统减少动态设置。不能用虚构的用户、帖子或统计填充页面。历史平台皮肤从加载入口移除，历史实现通过 Git 历史追溯。
`}
];
export default iavseDesignGuides;
