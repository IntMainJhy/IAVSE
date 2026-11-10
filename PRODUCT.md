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
- The earlier application baseline came from the public [RBP Portfolio repository](https://github.com/DavidHDev/rbp-portfolio), pinned at `1581b9b8e5876f60e5eb844970747506980c4412`. The user has since approved a new independently authored purple-white homepage. Other functional pages retain the existing IAVSE foundation until gradual migration; do not describe the whole site as already replaced. Prior implementations remain available through Git history. Third-party design guides in the resource catalog remain learning content, not platform standards.
- Preserve viewport-triggered Scroll Reveal, Fade In Up and bounded Staggered Reveal while retaining functional layouts, keyboard access, reduced-motion support and user-authored content.
- Homepage content uses permission-checked public sources: at most four posts and three public projects from at most four discoverable public spaces. Empty and unavailable states remain truthful. A built-in template fallback must be clearly labeled as a fictional example, not presented as a real member or activity.

## Brand Commitments

Retain the IAVSE name, outlined V identity and mission “Insight through AI. Vigilance for Opportunity. Seize to Evolve.” The new homepage uses its approved purple focus accent; existing functional pages retain the current blue focus role until migrated. Navigation must keep the original brand and real account state.

On 2026-11-10 the user chose two UI implementations: a private Pro UI using individually authorized uiX / React Bits Pro materials, followed by an independently authored public UI using verified open-source components. Both share business behavior, permissions, data and authored-content boundaries. Write the development plan first, then implement step by step. The [dual-UI development plan](docs/dual-ui-development-plan.zh-CN.md) and [task board](docs/dual-ui-task-board.md) govern this future work. This decision supersedes the earlier requirement to preserve the Portfolio composition in future redesigns; it does not assert that the current application has already been replaced.

The private Pro source must stay outside the public Git root and its history. The public UI must build and run without private components or uiX credentials. Restore the blog-space 3D opening in both versions, with accessible directory fallbacks. A purchased catalog subscription is not proof of upstream redistribution rights; each material needs its own evidence. The root PolyForm Noncommercial license remains unchanged. A separate open-source license for newly authored public UI is pending an explicit scope decision.

On 2026-11-10 the user explicitly requested a fresh `desgin` branch and a replacement for the old UI, then approved the independent **“居中开场与社区展板”** concept and instructed that it be applied. The implemented homepage now follows centered hero → community filters/content with a resource sidebar → public-space horizontal card → footer. Its new world is predominantly white with purple gradients, licensed artistic type, floating shadows, pointer response and Scroll Reveal. The header is transparent and uncolored, without a frosted background, with brand at left and real account controls at right. After actual use, the user selected the original soft mist and specified that it should flow on both sides with a white center; stronger rolling ribbons are not the target. [DESIGN.md](DESIGN.md) records the implemented tokens and the separate scope of existing functional pages. This homepage delivery does not mean either complete dual-UI system has shipped.

The previous direct Cloudlight migration stays cancelled; future use of any Pro template requires the new selection and authorization process. Authored blogs, saved canvas documents, third-party previews and uploaded images retain their own appearances. All existing third-party licenses remain in force. Geist, Cormorant Garamond and ZCOOL XiaoWei remain licensed third-party typefaces, not original IAVSE fonts.

## Evidence on Hand

Actual resource records live in the existing catalogs; public community content comes from the qualified public feed. Blog template examples are fictional sample content rendered by the site's real template factory. Do not invent customers, testimonials, user totals or engagement figures.

## Open Decisions

The independently authored public UI's license scope, the private build arrangement, individual Pro material authorizations and any third-party delivery of Pro application builds remain pending. No additional audience demographics, growth targets, pricing tiers or commercial claims have been confirmed.
