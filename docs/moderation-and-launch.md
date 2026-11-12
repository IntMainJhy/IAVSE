# Shared publishing and moderation / 共享发布与审核

This build is a local evaluation, not approval for public operation in mainland China. Production accounts, publishing and Connect retain the explicit deployment/origin gates. Email verification and invitations do not establish legally required real-identity verification.

本版本仍用于本地验证，并不表示已满足中国大陆网站正式运营条件。邮箱验证、邀请注册和本地测试资格不替代依法需要的真实身份信息认证。

## What is implemented / 已实现

- Members own separate drafts and revisions for documents, Skills and other resources. Published versions appear in their catalog and one linked community share; updates reuse that share. Withdrawal, takedown, complaints and account restrictions are checked before public access.
- In automatic mode, original text posts can go live immediately. External links, third-party sources, cover images, risk signals and revisions requiring follow-up go to review. Manual mode queues every community post. Documents and their revisions require independent review. Homepages, projects, resources, Skills, comments and replies publish directly. Optional rule-based signals help moderators inspect content; approved snapshots remain separate from pending changes. Reports, restrictions, removals and appeals remain available.
- Static HTML/ZIP blogs stay in the existing isolated sandbox and are published explicitly by their authors. The platform does not execute server builds or private client binaries.
- Scoped, revocable AI credentials use the same validation and review service. Submission requires publish scope, explicit user intent, current policy acceptance and an idempotency key. AI cannot approve reviews.

## Before opening publicly / 正式开放前

Automatic screening reduces repetitive review but cannot guarantee compliance. Current rules are not a semantic AI moderation provider or an exhaustive illegal-content detector. Before removing the local gate, the operator must complete and verify real-identity and account management, appropriate content/media/link review coverage, staff and escalation ownership, recurring inspection, incident handling, complaints and appeals, evidence/log retention, privacy notices and necessary information-security measures. Configure actual contact details and effective policy versions. Determine whether the concrete service requires additional filings, permits or security assessment with the relevant authorities; ICP filing alone is not a certification of this content-hosting business.

自动筛查只能辅助审核。运营者仍需落实实名核验、审核与巡查人员、举报申诉和应急处置、依法保存记录及报告、隐私保护等责任。静态托管让用户公开发布内容，应结合最终服务范围核对适用备案、许可及安全评估要求；不能仅凭已取得 ICP 备案就认定可以直接开放全部 SaaS 功能。

## 日常处理

账号页和发帖页提供当前社区规则。规则版本或正文发生变化后，作者须重新确认才能继续发布。值班时先看未结举报及冻结工单，再处理待复核帖子；定期抽查已公开内容，记录下架理由，并让作者通过申诉入口提出异议。每日投稿版本上限为每人 5 个，同时待审最多 3 个。既有待审稿继续由原流程处理。

## Primary sources / 核对依据

- [国家网信办《互联网论坛社区服务管理规定》](https://www.cac.gov.cn/2017-08/25/c_1121541921.htm) 列有信息审核、公共信息实时巡查、真实身份信息认证及投诉举报机制等要求。

- [CAC: Provisions on Internet Comment Services (2022)](https://www.cac.gov.cn/2022-11/16/c_1670253725725039.htm): requires real-identity verification, review/patrol/emergency mechanisms, user agreements, reports and complaints; news comments specifically require review before publication.
- [CAC: Provisions on Governance of the Online Information Content Ecosystem](https://www.cac.gov.cn/2019-12/20/c_1578375159509309.htm): platform responsibility, content governance, unlawful/harmful content handling, records and reporting, accessible complaints, and governance reporting.

These are the verified core sources for this implementation, not an exhaustive legal analysis. Operational review must follow the final deployment model, scale and current applicable rules.
