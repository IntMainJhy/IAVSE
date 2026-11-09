# 故障排查 / Troubleshooting

[本地运行 / Setup](getting-started.md) · [问题反馈 / Support](../SUPPORT.md)

## 页面打不开或端口被占用 / Connection refused or port in use

`main` defaults to `127.0.0.1:3008`. Read the terminal URL, confirm the process is still running and stop the previous process before starting another instance. `npm start` needs `npm run build` first. Do not run build and development against the same `.next` directory at the same time.

主分支默认 `127.0.0.1:3008`。以终端输出为准，确认进程仍在运行；先停止旧实例。生产模式先构建，不要与开发进程共用正在写入的 `.next`。

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

Try a current browser with WebGL support, a smaller window or the operating system's reduced-motion setting. Mobile, short viewports and reduced motion use readable document flow for the home product chapters. Report the browser, OS, viewport and any console error without including private content.

## 构建或原生依赖失败 / Build or native dependency errors

Check `node --version` against Node.js 24.15+, reinstall with `npm ci`, then run the documented commands from the repository root. Preserve the lockfile. Avoid deleting data directories while troubleshooting dependencies. Include the first meaningful error and reproduction steps in a [bug report](https://github.com/IntMainJhy/IAVSE/issues/new/choose).
