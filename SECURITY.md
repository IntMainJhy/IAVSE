# Security reporting / 安全报告

Security reports concerning authentication, authorization, private files, credentials, publication boundaries or sandbox escapes should be handled privately.

涉及鉴权、私有文件、凭据、发布权限或沙箱隔离的问题，请优先私下报告。

## Reporting a vulnerability

1. Visit [GitHub Security Advisories](https://github.com/IntMainJhy/IAVSE/security/advisories). If **Report a vulnerability** is available, use that private reporting form.
2. If private reporting is unavailable, open an [issue](https://github.com/IntMainJhy/IAVSE/issues) asking the maintainer for a private contact channel. Include only a general description of the affected area; omit exploitation steps, private data and proof-of-concept payloads until a private channel is established.
3. Include the affected commit, deployment mode, reproduction using disposable data, expected impact and any suggested fix. Redact all passwords, tokens, email addresses, databases and real uploads.

请勿在公开 Issue、评论或截图中贴出可利用细节、密钥或真实站点数据。使用自己有权测试的本地环境和临时数据复现。

## Maintenance scope

Security fixes are developed against the current `main` branch. This project does not currently promise a long-term support matrix or a response deadline. A local check or test pass does not certify a deployment. Operators should validate their own configuration, backups, origin boundaries and dependencies.

For routine bugs and usage questions, use [SUPPORT.md](SUPPORT.md). Original and third-party license terms remain unchanged.
