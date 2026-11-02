# IAVSE cinematic discovery refinement

The approved optical blue/silver homepage remains the visual reference. This
iteration gives the opening copy a complete viewport, reduces display type,
and moves the first macOS preview into a distinct scroll-driven approach. Its
opacity, position and perspective are controlled by a scoped GSAP ScrollTrigger;
native scroll, keyboard access and reduced motion remain available.

## Scene and navigation

- Hero display type is capped at 32px; story/closing titles at 34px. Phone titles
  use a smaller responsive scale without reducing normal article text.
- The first preview begins below the opening viewport and reverses naturally
  when scrolling back. Its trigger stays in layout while only the window moves.
- Lower homepage point veils now use 6,048 desktop / 2,016 mobile particles across
  two depth layers within one draw. The approved glass model stays unchanged.
- Reading routes use three flowing 3D particle currents instead of a flat grid.
  They share a single React-owned WebGL canvas, with existing frame/pixel budgets,
  hidden-tab suspension and reduced-motion/failure fallbacks.
- The top bar has no bottom stroke or inset highlight. A 144px desktop / 120px
  phone masked blur transitions continuously into the content beneath it.

## Community

Administration is accessed through the global account menu, for both owner and
reviewer roles. The community rail contains community destinations only. Native
sticky positioning is preserved; a coalesced measurement shortens its internal
navigation area as the footer arrives, preventing the first destination from
being pushed behind the header. Mobile keeps its bottom navigation.

Search uses a single outlined surface with an integrated action, native search
input and visible focus state. Submission, category selection and URL-based
filtering keep their existing behavior.

## Blog exhibition

Each discoverable published space is shown once as a perspective document panel.
It loads the actual author-designed homepage, not a project cover or fabricated
profile. Pointer position and native scroll affect the display plane. The
complete creator directory and an introduction to blog spaces follow below.

Only the nearest three embedded pages are mounted on desktop, two on phones;
off-screen pages unmount. Loading waits for the real theme rather than the
iframe's early load event, with bounded observers and a readable identity
fallback. The full-panel link opens the normal blog, and previews cannot trap
scroll or keyboard input. Saved/system reduced motion removes exhibit motion.

`?embed=gallery` is limited to public blog homepages, allows same-origin framing
only, excludes platform chrome and visit collection, and is marked noindex.
Other routes retain frame denial and existing permission/publication boundaries.

## Verification

The full suite passed after the final iframe-loading review (374 tests).
TypeScript and production build checks passed. Ego browser checks cover desktop
and phone layouts, real authored
preview content, sticky rail at the footer, search submission, header edge
removal, homepage scroll entrance, gallery links and reduced motion. No generated
image assets or new dependencies were added.
