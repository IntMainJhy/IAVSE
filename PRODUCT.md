# IAVSE

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

IAVSE brings community exchange and resource discovery together, with personal blog spaces for publishing work and writing. These priorities were explicitly confirmed by the user in this conversation.

## Capabilities and Constraints

- The existing website offers community sharing, discussion, bookmarks and following; resource directories include UI designs, Skills, documentation, websites and tools.
- Blog spaces use the site's built-in templates, visual editor and publishing workflow.
- Keep source and license information for third-party resources. Existing material must not be presented as universally reusable or officially endorsed.
- Preserve user data, publishing permissions, account flows, real destinations and authored blog appearances.
- The earlier application baseline came from the public [RBP Portfolio repository](https://github.com/DavidHDev/rbp-portfolio), pinned at `1581b9b8e5876f60e5eb844970747506980c4412`. The user has since approved an independently authored purple-white homepage and extended its world to platform frontend surfaces. This is a shared visual migration through existing layouts and controls, not a rewrite of every page. Route-owned workbenches and authored-content boundaries remain explicit in the [platform UI notes](docs/platform-ui.zh-CN.md). Prior implementations remain available through Git history. Third-party design guides in the resource catalog remain learning content, not platform standards.
- Preserve viewport-triggered Scroll Reveal, Fade In Up and bounded Staggered Reveal while retaining functional layouts, keyboard access, reduced-motion support and user-authored content.
- Homepage content uses permission-checked public sources: at most four posts and three public projects from at most four discoverable public spaces. Empty and unavailable states remain truthful. A built-in template fallback must be clearly labeled as a fictional example, not presented as a real member or activity.

## Brand Commitments

Retain the IAVSE name, outlined V identity and mission “Insight through AI. Vigilance for Opportunity. Seize to Evolve.” Functional UI uses neutral black actions, selected labels, icons, links and focus in the light appearance; purple belongs to decorative backgrounds. Dark functional pages retain their corresponding neutral role inversion. Navigation must keep the original brand and real account state.

On 2026-11-10 the user chose two UI implementations: a private Pro UI using individually authorized uiX / React Bits Pro materials, followed by an independently authored public UI using verified open-source components. Both share business behavior, permissions, data and authored-content boundaries. Write the development plan first, then implement step by step. The [dual-UI development plan](docs/dual-ui-development-plan.zh-CN.md) and [task board](docs/dual-ui-task-board.md) govern this future work. This decision supersedes the earlier requirement to preserve the Portfolio composition in future redesigns; it does not assert that the current application has already been replaced.

The private Pro source must stay outside the public Git root and its history. The public UI must build and run without private components or uiX credentials. Restore the blog-space 3D opening in both versions, with accessible directory fallbacks. A purchased catalog subscription is not proof of upstream redistribution rights; each material needs its own evidence. The root PolyForm Noncommercial license remains unchanged. A separate open-source license for newly authored public UI is pending an explicit scope decision.

On 2026-11-10 the user explicitly requested a fresh `desgin` branch and a replacement for the old UI, then approved the independent **“居中开场与社区展板”** concept and instructed that it be applied. The homepage follows centered hero → community filters/content with a resource sidebar → public-space horizontal card → footer. The selected atmosphere is naturally moving soft mist on both sides with a white center; stronger rolling ribbons are not the target.

The subsequent instruction extends the homepage world across platform-owned frontend surfaces: white floating cards, licensed artistic type, pointer response and Scroll Reveal, with black functional primary actions and selected UI. The user replaced the earlier plain transparent header with a frosted glass header and requested a sliding lens that locally enlarges text during functional switching. The current implementation uses native DOM label copies, clipping, counter-translation and scaling, not physical refraction. Shared public chrome is omitted from authored blogs and preview surfaces; administration and the blog editor keep their own workbench chrome without duplicate public navigation. [DESIGN.md](DESIGN.md) and [platform UI notes](docs/platform-ui.zh-CN.md) record current implementation and boundaries. This does not assert that every page has been rewritten or that either complete dual-UI system has shipped.

The user-provided fluid-glass reference was analyzed read only. Its MIT license includes Commons Clause restrictions; it must not be described as plain MIT. The public implementation does not copy that reference's source or models. No local reference path, private Pro material or new license grant is included in the website delivery.

The previous direct Cloudlight migration stays cancelled; future use of any Pro template requires the new selection and authorization process. Authored blogs, saved canvas documents, third-party previews and uploaded images retain their own appearances. All existing third-party licenses remain in force. Geist, Cormorant Garamond and ZCOOL XiaoWei remain licensed third-party typefaces, not original IAVSE fonts.

## Evidence on Hand

Actual resource records live in the existing catalogs; public community content comes from the qualified public feed. Blog template examples are fictional sample content rendered by the site's real template factory. Do not invent customers, testimonials, user totals or engagement figures.

## Open Decisions

The independently authored public UI's license scope, the private build arrangement, individual Pro material authorizations and any third-party delivery of Pro application builds remain pending. No additional audience demographics, growth targets, pricing tiers or commercial claims have been confirmed.
