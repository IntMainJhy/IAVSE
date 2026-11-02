# IAVSE reading and operating surfaces

This document records the user's requested interior redesign. It does not replace the approved homepage film or an author's personal blog design.

## Direction

- Product: an open place for developers and technical creators to publish, share and present their work.
- Character: thoughtful, legible, quietly technical.
- World: a working publication, with cool white surfaces, ink, author portraits and actual project previews.
- Moments: the real creator's project image in the blog directory; authentic content and statistics in other destinations.
- Signature: sparse paper points at the outer page edges, with a small pointer response. Content, navigation and forms remain still.

The old blue banners, glass sculptures, repeated generated text covers and long decorative directory flight were anti-references. Community content leads between a compact navigation rail and a supporting discovery rail. Resource titles and descriptions are immediately readable. Blog discovery presents real creators without a scroll prerequisite. Administration uses a neutral, denser work surface.

## Tokens and layout

Canvas `#f7f8fa`; paper `#ffffff`; ink `#202d42`; body `#536174`; metadata `#687386`; border `#e0e5ec`; restrained homepage blue accent `#3864ac`. Primary actions use deep ink blue; semantic success, warning and destructive colors remain distinct. Use the existing local Inter family, 400–600 weights. Page titles 28–34px, content titles 20–24px, body 14–16px; sustained reading is bounded to about 72ch.

Use the 4px scale: 4/8/12 inside controls, 16/20/24 within groups, 32/40/48 between groups. Public outer spacing is 32px desktop, 16px phone. Community columns are 208px / fluid / 248px with 32px gaps, collapsing at tablet and phone widths. Cards use 12–16px corners, controls 8px, with quiet borders and no colored shadows. Touch actions are at least 44px. Tables may scroll inside their own container.

## Background and performance

`ReadingBackdrop` is a React component using a static CSS dot texture and a bounded Canvas 2D pointer response. It has no Three.js dependency, GLB, texture, particle-pair calculation or continuous idle loop. It draws at most 64 nearby dots, at most 30fps, then sleeps; touch, reduced-motion and background tabs suppress motion. Dense admin surfaces have no decorative canvas. The homepage keeps its own scene.

The former public card IntersectionObserver/MutationObserver reveal loop was removed. Navigation transitions remain short and interruptible. Catalogs request actual supplied images only; decorative generated cover requests were removed.

## Design review provenance

Reviewed using Impeccable layout/Operate/Read guidance and Unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir), CC BY 4.0; https://heydamir.design/unslop). The Unslop audit found decorative hue gradients, nested glass surfaces, arbitrary gaps, pill-heavy controls and repeated title images. The redesign applies spacing, neutral color, existing line icons, truthful content, typography, layout, states, real imagery and restrained motion in that order. No generated images were needed.

## Verification of the shipped pass

- Existing unit suite: 350 checks passed; four additional backdrop lifecycle checks passed. Route-motion checks remained green.
- Production build and TypeScript passed. The design detector returned no findings; rendered desktop (1440px) and phone (390px) pages were reviewed directly.
- The production browser recorded zero decorative GLB or generated-cover requests on community, resources and blog discovery; their former two canvases became one lightweight Canvas 2D surface. Administration mounts no decorative canvas.
- Fixed the phone community rail's vertical constraints (57px bottom navigation), and the search icon's compressed content box.
- Resource search, mobile menu, reduced motion, document reading, account settings, blog canvas and administrative settings/governance were exercised. Checked routes had no document overflow, broken loaded images or captured browser errors.
- Skill HTTP checks covered 30 detail pages, 15 tool lists, six catalog pages and three locales. Blog HTTP checks covered published-directory membership, private/unlisted/restricted/taken-down exclusions, authored/static pages, multilingual sharing and metadata, using isolated test data.
