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
- The baseline came from the public [RBP Portfolio repository](https://github.com/DavidHDev/rbp-portfolio), pinned at `1581b9b8e5876f60e5eb844970747506980c4412`, the original application baseline. All platform pages now share the independently refined IAVSE tokens and controls. Existing platform skin styles and competing design guides have been removed; prior implementations remain available through Git history. Third-party design guides in the resource catalog remain learning content, not platform standards.
- Add viewport-triggered Scroll Reveal, Fade In Up and bounded Staggered Reveal across platform content while preserving functional layouts, keyboard access, reduced-motion support and user-authored content.

## Brand Commitments

Retain the IAVSE name, outlined V identity, blue focus accent and mission “Insight through AI. Vigilance for Opportunity. Seize to Evolve.”

On 2026-11-10 the user chose two UI implementations: a private Pro UI using individually authorized uiX / React Bits Pro materials, followed by an independently authored public UI using verified open-source components. Both share business behavior, permissions, data and authored-content boundaries. Write the development plan first, then implement step by step. The [dual-UI development plan](docs/dual-ui-development-plan.zh-CN.md) and [task board](docs/dual-ui-task-board.md) govern this future work. This decision supersedes the earlier requirement to preserve the Portfolio composition in future redesigns; it does not assert that the current application has already been replaced.

The private Pro source must stay outside the public Git root and its history. The public UI must build and run without private components or uiX credentials. Restore the blog-space 3D opening in both versions, with accessible directory fallbacks. A purchased catalog subscription is not proof of upstream redistribution rights; each material needs its own evidence. The root PolyForm Noncommercial license remains unchanged. A separate open-source license for newly authored public UI is pending an explicit scope decision.

The currently implemented homepage remains Hero → four Projects → Contact, with the retained RBP composition, independent IAVSE styling and a centered capsule navigation. [DESIGN.md](DESIGN.md) describes that current implementation, not a completed dual-UI system. The previous direct Cloudlight migration stays cancelled; future use of any Pro template requires the new selection and authorization process. Authored blogs, saved canvas documents, third-party previews and uploaded images retain their own appearances. All existing third-party licenses remain in force.

## Evidence on Hand

Actual resource records live in the existing catalogs; public community content comes from the qualified public feed. Blog template examples are fictional sample content rendered by the site's real template factory. Do not invent customers, testimonials, user totals or engagement figures.

## Open Decisions

The independently authored public UI's license scope, the private build arrangement, individual Pro material authorizations and any third-party delivery of Pro application builds remain pending. No additional audience demographics, growth targets, pricing tiers or commercial claims have been confirmed.
