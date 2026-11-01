# Account registration / 账号注册

`/join` asks for email, nickname, password and password confirmation. An email code is **not required** to register or sign in. Before submitting, open both the community rules and disclaimer, read to the end, mark each as read, and actively check the policy/adult acknowledgments. These controls are never preselected. The API requires the current policy version, document hash and both document acknowledgments; missing or stale consent is rejected.

`/join` 使用邮箱、昵称、密码及确认密码。注册和登录不要求邮箱验证码。注册前必须展开社区规则和免责声明，阅读至末尾后分别确认已阅读，再主动勾选协议与成年确认。接口检查当前规则版本、全文哈希及两个文件的阅读确认，缺少确认或使用过期规则不能注册。阅读界面与同意记录不能证明法律身份或保证用户实际理解文件。

## Access / 权限

New accounts have `verification=accepted` and `email_verified_at=NULL`: policy acceptance enables the product's publishing workflow but does not pretend that a mailbox or real identity was verified. Personal homepages, projects, resources, Skills, comments and replies publish directly. Community articles, documents and article revisions require manual review. Private drafts, account ownership, safe markup/URLs, rate limits, reports, restrictions and takedowns remain enforced. Legacy `pending` users can accept current policies in account settings; restricted accounts cannot use that action to restore permissions.

新账号记录为 `accepted`，邮箱核验时间为空。规则确认不冒充邮箱或实名认证。个人主页、作品、资源、Skill、评论和回复直接发布；社区文章、文档及文章修订人工审核后公开。私有草稿、归属隔离、安全格式校验、频率限制、举报、账号限制与下架继续生效。历史待确认账号可在账号设置补充阅读并确认；受限账号不能借此恢复权限。

## Configuration / 配置

Set `REGISTRATION_ENABLED=true` on a combined or platform surface. `false` blocks registration; the admin surface never allows registration. Production HTTPS also requires the existing `PUBLIC_FEATURES_ENABLED=true` gate and configured operating notices (`LEGAL_OPERATOR`, `LEGAL_CONTACT_EMAIL`, `LEGAL_EFFECTIVE_DATE`). See [operating boundaries](public-launch.en.md) / [运营边界](public-launch.md). No environment settings are changed automatically.

Registration works without SMTP. Email delivery is only needed for optional verification of a recovery email and password recovery. An unverified registration address cannot recover a password, because anyone could type an address they do not control. Users can verify their address from account settings using the current password and a single-use email code.

注册不依赖 SMTP。只有主动验证恢复邮箱和找回密码需要邮件服务。未验证的注册邮箱不能用于找回密码，避免通过他人填写的邮箱接管账号。账号设置中的验证仍须提供当前密码及单次邮箱验证码。

```dotenv
MAIL_MODE=smtp
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=your-mailbox@qq.com
SMTP_PASSWORD=your-smtp-authorization-code
SMTP_FROM=your-mailbox@qq.com
```

QQ SMTP uses an authorization code, not the account password; see [official setup help](https://help.mail.qq.com/detail/106/985). Keep actual credentials outside Git. `MAIL_MODE=capture` is restricted to isolated loopback tests; captured messages remain in the private data directory. Binding and recovery codes expire after ten minutes, permit five attempts, are purpose-bound and can only be consumed once. Resets revoke previous sessions and tool keys. Mail request responses do not reveal whether an address belongs to an account.

## Validation / 验证

```sh
npm test
npm run typecheck
npm run build
npm run test:registration:http
```

The HTTP test uses disposable data. It covers registration without email delivery, consent/version checks, account isolation and real password sign-in; it never edits production accounts.
