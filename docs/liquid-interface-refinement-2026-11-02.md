# Liquid interface refinement — 2026-11-02

The approved blue/silver homepage remains the reference. The navigation now
uses the full viewport with 28px desktop / 16px phone outer gutters. Reading
and account routes use a downward masked blur without a bottom rule. The
language control is a shared glass listbox with arrow/Home/End selection,
Enter/Space activation, Escape dismissal, focus restoration and the existing
locale cookie/server refresh behavior.

## Community and settings

The mobile community dock is a 72px capsule with five 60px touch targets. A
separate lens moves through WAAPI and resumes its visible position across route
replacement. The selected symbol scales to 1.16. A local SVG displacement map
magnifies the backdrop where supported; blur and surface highlights remain the
fallback. Labels stay outside the backdrop filter. A separate 56px circular
glass action opens the real post editor. Safe-area, reduced motion and reduced
transparency behavior are retained, as are the account sheet and desktop rail.

Account settings have one layer of individual surfaces, with no surrounding
card or shadow. Avatar controls occupy a complete row; email and password use
balanced desktop columns and stack on phones. Upload, save, remove, password,
email, consent and account permissions retain their existing handlers. Controls
are 44px high, with a named native file input behind a compact visible label.

## Homepage

The old WebGL screenshot sculpture is replaced by an interactive resource atlas:
three modes, nine real destinations, selectable document nodes, connecting paths,
a spatial book and live detail links. DOM and CSS3D provide the chapter without
another WebGL renderer or a screenshot texture. Pointer smoothing sleeps when
settled; offstage, hidden, paused and reduced-motion states stop motion.

Two opposing CSS marquee tracks display six explicitly labeled illustrative
creator comments. Names and comments are fictional examples, not endorsements.
Notionists hand-drawn avatars by Zoish (CC0) are locally generated from the
DiceBear packages in a temporary tool directory and checked into
`public/avatars/creators/`; no runtime request or project dependency is added.
Repeated visual groups are hidden from accessibility APIs. A pause button,
hover pause, hidden-tab/offscreen suspension and static scrollable reduced-motion
rows are available. Native horizontal rows can receive keyboard focus.

## Verification

All 374 tests passed, including avatar/account, dock lifecycle, resource
navigation/lifecycle and locale coverage. Production build and TypeScript checks
passed before the local 3009 preview was updated. Ego browser review covers
mobile and desktop chrome, keyboard language selection, actual account geometry,
mobile dock route changes, post-editor destination, resource modes and links,
comment pause and reduced motion. Public resource destinations were verified
with successful HTTP responses. No production user data is changed by UI review.
