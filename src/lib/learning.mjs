// Guides describe existing workflows; authored tutorials remain in the published article library.
export const guides=[
 {slug:'getting-started',title:'开始使用 IAVSE',summary:'认识社区、博客主页和共享内容栏目。',sections:[
  {title:'登录你的账号',text:'使用网站账号或注册邮箱和密码登录，无需先验证邮箱。注册前请阅读并确认社区规则与免责声明。',href:'/login',action:'前往登录'},
  {title:'选择你的内容栏目',text:'在文档、Skill 或其他资源页面直接发布内容，也可以在该栏目的发布页面查看草稿和审核状态。',href:'/docs',action:'浏览内容栏目'},
  {title:'选择下一步',text:'想介绍自己，从博客主页开始；想分享教程或工具，在对应栏目发布，文章审核后、工具资源直接发布后，也会同步出现在社区。',href:'/docs/showcase',action:'学习搭建主页'}
 ]},
 {slug:'showcase',title:'搭建博客主页',summary:'整理资料、添加内容，预览后再提交公开。',sections:[
  {title:'完善资料与经历',text:'填写愿意公开的昵称、介绍、技能和经历。登录邮箱与公开联系邮箱分开管理。',href:'/workspace/profile',action:'编辑资料'},
  {title:'整理自己的内容',text:'在内容库添加项目、文章或资源，写清楚本人贡献、来源和使用许可。保存草稿后，可继续修改。',href:'/workspace/library',action:'打开内容库'},
  {title:'编排并预览主页',text:'选择内置主题预览自己的资料；也可以上传 HTML 或 ZIP 静态网站，并打开隔离预览检查页面。',href:'/workspace/blog',action:'打开主页编辑器'},
  {title:'确认并发布主页',text:'保存与公开是两个步骤。检查公开资料、隐私和素材使用权后点击发布，当前版本立即公开；继续编辑只更新私人草稿。',href:'/workspace/blog',action:'预览我的主页'}
 ]},
 {slug:'community',title:'在社区分享内容',summary:'写清来源与使用范围，让分享更容易被理解。',sections:[
  {title:'先看看社区',text:'浏览已公开的分享，按分类查找内容，也可以从成员主页了解作者。',href:'/community',action:'进入社区'},
  {title:'写一份有用的分享',text:'写下标题、摘要和正文。介绍第三方内容时，请注明来源和许可。',href:'/workspace/submissions/new',action:'写一份分享'},
  {title:'确认规则并提交',text:'阅读当前社区规则，确认有权分享。自动模式下，普通原创文字帖通过检查即可公开；需要复核时会告知你。',href:'/legal/community',action:'阅读社区规则'},
  {title:'查看处理进度',text:'在“我的投稿”查看状态。修改公开帖子后，新版本将重新检查；复核期间仍展示原公开版本，除非它已被暂停或下架。',href:'/workspace/submissions',action:'查看我的投稿'}
 ]},
 {slug:'desktop',title:'使用桌面客户端',summary:'了解安装入口、服务连接与账号登录。',sections:[
  {title:'获取对应系统的客户端',text:'在下载页查看 macOS 与 Windows 的可用版本。尚未提供安装包时，可以继续使用网页版。',href:'/downloads',action:'查看客户端下载'},
  {title:'连接同一个网站服务',text:'在客户端的连接设置中填写你正在使用的网站地址。网站和客户端必须连接同一套服务，才能共用账号和内容。'},
  {title:'使用网站账号登录',text:'输入网站已有账号和密码。客户端会校验真实密码，不接受任意填写的体验登录；每次启动都需要登录。'},
  {title:'找不到账号或无法连接',text:'先检查服务地址与网络，再确认该服务是否支持客户端登录。本地服务只在运行时可连接；本地与线上服务的账号不会自动互通。'}
 ]}
];

guides.push({slug:'moderation',title:'审核与公开发布',summary:'了解自动筛查、人工复核与正式上线前的准备。',sections:[
 {title:'先检查，再公开',text:'普通原创文字帖可在自动检查后公开。外链、封面和风险提示转人工复核。文档及其修订继续单独审核。'},
 {title:'保留人工判断与申诉',text:'规则命中表示需要复核，不等于违法认定。管理员可以退回、下架和处理投诉，作者可以修改后重新提交或提出申诉。平台仍需持续巡查。',href:'/report',action:'举报与投诉'},
 {title:'账号与发布资格',text:'注册和登录无需邮箱验证码。注册前必须阅读并确认规则；这不代表邮箱或身份已核验。验证邮箱用于密码恢复，依法需要的身份核验仍须按实际运营要求办理。'},
 {title:'核对现行规定',text:'审核机制参考网信办《互联网跟帖评论服务管理规定》和《网络信息内容生态治理规定》。新闻信息的跟帖评论适用先审后发；实际运营需结合服务范围核对全部适用要求。',href:'https://www.cac.gov.cn/2022-11/16/c_1670253725725039.htm',action:'阅读网信办规定'}
]});
