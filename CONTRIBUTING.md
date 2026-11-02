# Maintaining IAVSE / 参与维护

IAVSE welcomes bug reports, documentation improvements, translations, accessibility fixes and performance contributions. The original website material uses **PolyForm Noncommercial 1.0.0**, a source-available noncommercial license. It permits the noncommercial uses defined in [LICENSE](LICENSE), including study, deployment, modification and maintenance. Commercial use requires separate permission.

## Attribution and contributions

- Redistributed copies must retain LICENSE (or its official URL) and **both Required Notice lines** from [NOTICE](NOTICE), including IntMainJhy's copyright and the original IAVSE project source.
- Do not present the original project or IntMainJhy's pre-existing material as your own original work. You may identify and credit your own original changes. Contributing does not transfer ownership of pre-existing material to you or assign your own copyright to the maintainer.
- Submit only material you have the right to contribute. Offer your own website contributions under the project's existing PolyForm Noncommercial terms. Identify third-party sources and licenses separately; their original rights remain in force.
- User content and the private macOS/Windows clients are outside this website license. Do not include client code, installers, personal data, uploads, credentials or real environment files in a contribution.

## Making a change

Start from main, describe the problem and resulting behavior, and submit a focused pull request. Include the relevant tests or verification steps. Runtime changes normally need `npm test`, `npm run typecheck` and `npm run build`; documentation-only changes need link, wording and scope checks. Use disposable test data rather than a live database.

## 中文说明

欢迎提交问题反馈、文档、翻译、无障碍、性能和功能维护贡献。IAVSE 网站原创部分采用 **PolyForm Noncommercial 1.0.0**，允许协议定义的非商业学习、部署、修改、维护及再分发，商业用途须另行授权。这属于「源码公开、非商业许可」，不称为 OSI 意义的开源许可。

再分发时须保留 LICENSE（或官方协议地址）及 NOTICE 中的**两条 Required Notice**，明确原作者 IntMainJhy 和原项目 IAVSE 的来源。不得把既有代码或原项目冒称为自己原创；可以署名自己的原创修改。贡献不会把既有作品的版权转给维护者，也不要求贡献者转让自己新增内容的版权。

请只提交有权贡献的内容，自有的网站贡献按现有 PolyForm Noncommercial 条款提供；第三方内容注明来源并保留原许可。不要提交私有客户端、安装包、个人资料、数据库、用户上传、密钥或真实环境文件。

从 main 开始修改，清楚说明修复了什么及如何验证，再提交范围明确的 PR。运行时代码通常执行单元测试、类型检查与构建，纯文档修改检查链接、表述及范围即可。测试使用临时数据，不修改真实站点数据库。

[LICENSE](LICENSE) retains the unmodified official terms and controls the license grants. This guide explains the maintenance workflow and attribution; it does not replace or expand those grants.
