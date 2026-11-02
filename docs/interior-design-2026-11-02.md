# IAVSE interior visual alignment

This pass carries the approved homepage's navy, cobalt and optical white palette into the existing product surfaces. It changes presentation and motion, not account, publication, storage or moderation rules.

## Surface ownership

- `iavse-interiors.css`: shared public tokens, resource discovery, community feed, readers, policies, downloads and authentication. Deep blue headings identify destinations; white reading surfaces keep longer content legible.
- `iavse-blogs.css`: the public blog discovery flight and directory. Its native GLB panels, real published content and click destinations remain intact. Navy transitions into daylight with the scroll camera; navigation ink changes at the same transition.
- `iavse-workspace.css`: account settings, community identity, notifications and submissions. Blog editor styling is limited to toolbars, layers and properties; authored page geometry and themes remain independent.
- `iavse-admin.css`: blue navigation, white work panels, tables, forms and governance. Success, warning, destructive and disabled states retain distinct meanings.

Shared values: ink `#152d50`, body `#3e5672`, muted `#5c708a`, cobalt `#285fd4`, canvas `#edf3fa`, line `#d5e0ee`. Headers use 30–44 px light typography, content headings 21–26 px, body text 14–16 px. Horizontal resource controls scroll on compact screens; reading and settings surfaces become single-column.

## Motion and cost

Public discovery cards enter once with an 18 px translation, opacity and a short stagger. IntersectionObserver schedules visible cards; GSAP contexts, observers and added-content observers are released on route changes. The blog editor is excluded. Reduced-motion preference removes these animations and presents the blog flight as a static preview with its real directory. Interior WebGL retains its existing pixel budget, on-demand rendering and GPU disposal; no dependency, model or large image was added.

## Verification

- Production build and TypeScript checks passed.
- The full unit run passed 349 of 350 initially; its one obsolete interior-palette assertion was updated. The four interior checks then passed, alongside 17 scene and route-motion checks.
- Ego browser review at 1536 px and 390 px covered resources, community, documents, account, administration and blog discovery. Search, language switching, mobile menu, native blog scene scrolling and reduced-motion fallback were exercised.
- Production smoke checks covered resource/Skill discovery and detail, community/members, document reading, notifications and administrative content/settings/files/governance. These routes showed no document overflow, missing loaded images, console errors or unhandled rejections.
- The scope detector returned no findings; rendered pages were also reviewed directly. Existing authored blog pages and actual content were retained.

Desktop download availability still follows the real configured release URLs; an unconfigured release keeps its disabled “coming soon” state.
