# 故障排查 / Troubleshooting

[本地运行 / Setup](getting-started.md) · [问题反馈 / Support](../SUPPORT.md)

## 页面打不开或端口被占用 / Connection refused or port in use

The website defaults to `127.0.0.1:3008`. Read the terminal URL, confirm the process is still running and stop the previous process before starting another instance. `npm start` needs `npm run build` first. Do not run build and development against the same `.next` directory at the same time.

网站默认 `127.0.0.1:3008`。以终端输出为准，确认进程仍在运行；先停止旧实例。生产模式先构建，不要与开发进程共用正在写入的 `.next`。

## 资料或头像像是丢失了 / Profiles or avatars appear missing

Inspect the actual `APP_DATA_DIR` used by the process. A different checkout or working directory can resolve the default path to another database. Pin the original absolute directory, stop the process and restart. Never replace an existing database with a newly initialized empty one.

先检查实际数据目录。不同工作目录可能让默认路径指向另一份数据库。固定原目录的绝对路径后重启；不要用新建空库覆盖旧数据。

## 登录或保存提示来源不一致 / Sign-in or save rejects the origin

Match the scheme, hostname and port in `PUBLIC_URL` to the browser URL. `localhost` and `127.0.0.1` are different origins. Local HTTP uses `COOKIE_SECURE=false`; production HTTPS uses the deployment settings. Confirm reverse-proxy configuration before enabling trusted proxy headers.

核对 `PUBLIC_URL` 与浏览器地址的协议、主机名和端口。`localhost` 与 `127.0.0.1` 不相同。修改配置后重启。

## 管理员密码在哪里 / First administrator password

Setup prints the private data directory. The first generated password is stored in its `initial-admin.txt`. Running setup again does not reset an existing password. Keep this file private and use the account's supported password-management flow.

初始化会打印私有数据目录，首次凭据保存在其中。不要把密码文件、数据库或真实环境文件提交到仓库或反馈中。

## 注册与邮件问题 / Registration and email

Registration needs its explicit feature gate and current rule acknowledgment. It does not require an email code. Mailbox verification and recovery need valid SMTP settings; an unverified address cannot be used for recovery. Check the [email guide](email-registration.md). Loopback capture mode is for local testing, not real delivery.

邮箱注册不等同于邮箱所有权验证。验证码收不到时检查 SMTP、端口、TLS 和授权码；请勿在 Issue 中发送 SMTP 密码。

## 空间或资源没有公开 / A space or resource is not public

Saving a draft does not publish it. Check visibility, publication status, account restrictions, current policy acceptance and any required review. Publication behavior differs by content type; use the [editor guide](blog-editor.md) and [public deployment guide](public-launch.en.md). Do not change production gates to bypass a blocked account or review.

## 3D 很慢或未加载 / 3D is slow or unavailable

The blog directory uses CSS perspective and bounded iframe previews. Use its complete ordinary list when motion or previews are unsuitable. The mist background has a WebGL implementation and a static fallback; WebGL failure should not prevent reading or navigation. Homepage product cards use ordinary document flow and repeat reveals after fully leaving the viewport. Reduced-motion mode shows content directly.

博客画廊的透视、普通目录与柔雾背景是不同模块。先检查普通列表是否可用，再提供浏览器、视口和无隐私内容的错误信息。后台指定主页下线、关闭发现或账号受限后，应从画廊移除；无选择时回到自动展示，不伪造真实成员。

## 筛选菜单挤在一起或被底栏遮住 / Filter layout

当前目录共用 `DirectoryFacet` 与 `directory-toolbar.css`，菜单条目有独立间距，只有当前项填充。其规则位于 `@layer rbp`，以正确处理旧样式的层叠顺序。检查新构建及缓存，不追加全局胶囊规则覆盖菜单；手机弹层应避开底部导航，并在空间不足时向上展开。

## 公告不滚动或动画不重播 / Motion preferences

纯黑公告条支持暂停和关闭；系统减少动态时不强制跑马灯。滚动入场需元素完整离开视口后再次进入才重播，不是在轻微滚动时持续闪烁。深色导航保留背景模糊、透出及镜片高光；不支持 backdrop-filter 时使用可读的实色降级。

## 构建或原生依赖失败 / Build or native dependency errors

Check `node --version` against Node.js 24.15+, reinstall with `npm ci`, then run the documented commands from the repository root. Preserve the lockfile. Avoid deleting data directories while troubleshooting dependencies. Include the first meaningful error and reproduction steps in a [bug report](https://github.com/IntMainJhy/IAVSE/issues/new/choose).
