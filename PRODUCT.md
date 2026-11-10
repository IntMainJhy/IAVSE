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
- The latest user instruction makes the public [RBP Portfolio repository](https://github.com/DavidHDev/rbp-portfolio), pinned at `1581b9b8e5876f60e5eb844970747506980c4412`, the sole platform design authority. All platform pages share its typography, neutral palette, cards, controls and navigation language. Existing platform skin styles and competing design guides have been removed; prior implementations remain available through Git history. Third-party design guides in the resource catalog remain learning content, not platform standards.
- Add viewport-triggered Scroll Reveal, Fade In Up and bounded Staggered Reveal across platform content while preserving functional layouts, keyboard access, reduced-motion support and user-authored content.

## Brand Commitments

Retain the IAVSE name, existing outlined V identity, blue focus accent and English mission “Insight through AI. Vigilance for Opportunity. Seize to Evolve.” The user's binding visual direction is: “动效也要保持不变呀，还有排版，都跟这个开源仓库保持一致，就是内容合并过来.” For the template-backed public pages, preserve the pinned RBP Portfolio composition, spacing, responsive behavior and interaction parameters, replacing the sample content with actual IAVSE content and applying the requested viewport-entry enhancement. The published reference's computed system-ui font stack, including its serif-class fallback, is the typography authority.

The public shell has the original centered, fixed three-link capsule and theme control; account and language access are in Contact. The homepage is Hero → four Projects → Contact; About and the resource/blog overviews use the upstream About and Projects page structures. Community, catalogs, accounts, administration and the editor shell use the same RBP font, surfaces, buttons, pills and fields while keeping their working hierarchy. Administration and the editor retain their own navigation, using RBP controls; the public capsule is omitted from the editor to avoid covering its toolbar. These operational pages have no upstream page equivalent, so this commitment does not claim pixel identity for them. User-authored canvas documents, published blog themes, uploads and third-party previews remain content with their own appearances. The sole visual specification is [DESIGN.md](DESIGN.md); [Portfolio implementation notes](docs/portfolio-frontend.md) explain its source mapping and integration. Existing identity assets remain available without changing the template composition.

## Evidence on Hand

Actual resource records live in the existing catalogs; public community content comes from the qualified public feed. Blog template examples are fictional sample content rendered by the site's real template factory. Do not invent customers, testimonials, user totals or engagement figures.

## Open Decisions

No additional audience demographics, growth targets or commercial claims have been confirmed.
