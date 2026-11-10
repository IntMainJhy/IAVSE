---
name: "IAVSE Portfolio Foundation"
description: "A shared monochrome product interface built on the public RBP Portfolio template."
colors:
  paper: "#ffffff"
  ink: "#0a0a0a"
  body: "#424242"
  muted: "#f5f5f5"
  muted-ink: "#575757"
  line: "#e5e5e5"
  focus: "#0066ff"
  dark-paper: "#0a0a0a"
  dark-ink: "#fafafa"
  dark-body: "#dedede"
  dark-muted: "#171717"
  dark-muted-ink: "#b7b7b7"
  dark-line: "#303030"
  dark-focus: "#60a5fa"
typography:
  display:
    fontFamily: "\"Portfolio Geist\", \"PingFang SC\", sans-serif"
    fontSize: "clamp(38px, 4vw, 58px)"
    fontWeight: 500
    lineHeight: 1.13
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "\"Portfolio Geist\", \"PingFang SC\", sans-serif"
    fontSize: "36px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  card-title:
    fontFamily: "\"Portfolio Geist\", \"PingFang SC\", sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "\"Portfolio Geist\", \"PingFang SC\", sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.85
  hero-body:
    fontFamily: "\"Portfolio Geist\", \"PingFang SC\", sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "\"Portfolio Geist\", \"PingFang SC\", sans-serif"
    fontSize: "14px"
    fontWeight: 450
    lineHeight: 1.5
  navigation:
    fontFamily: "\"Portfolio Geist\", \"PingFang SC\", sans-serif"
    fontSize: "13px"
    fontWeight: 450
    lineHeight: "20px"
  signature:
    fontFamily: "\"Portfolio Signature\", serif"
    fontSize: "74px"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.04em"
rounded:
  input: "10px"
  control: "12px"
  card: "16px"
  panel: "20px"
  portrait: "32px"
  pill: "999px"
spacing:
  small: "12px"
  control: "16px"
  card-gap: "20px"
  panel-gap: "24px"
  panel: "28px"
  compact-gutter: "32px"
  gutter: "40px"
  hero-gap: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
    height: "46px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
    height: "46px"
  navigation:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.navigation}"
    rounded: "{rounded.pill}"
    padding: "6px"
  nav-selected:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  category-selected:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  resource-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  space-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "28px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
  closing:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.portrait}"
    padding: "64px 48px"
---

# Design System: IAVSE Portfolio Foundation

## Overview

**Creative North Star: "IAVSE in Portfolio Flow"**

The current frontend uses the public RBP Portfolio repository as its visual and motion foundation: white and charcoal surfaces, Geist typography, a capsule navigation with a spring-driven selection, and a restrained grayscale flow field. Actual IAVSE resources, community activity and editable blog spaces supply the content. The outlined V, IAVSE name, English mission and blue focus accent retain the product identity.

This is the shared application system, not a homepage-only skin. Public pages use the common chrome, palette, typography and controls. Resource and blog directories use readable product cards; community keeps its real feed structure. Account, administration and editor surfaces retain their task-oriented structure with the shared foundation. Authored blog themes and source previews retain their own visual identity. The Portfolio split opening is a homepage composition, not a required layout for every route.

Ground truth is [portfolio-foundation.css](src/app/portfolio-foundation.css), [the Portfolio components](src/components/portfolio/), [PublicSite.tsx](src/components/PublicSite.tsx), and [layout.tsx](src/app/layout.tsx). The [implementation and source mapping](docs/portfolio-frontend.md) records the pinned upstream revision and adaptations. The former Silk, optical tide, gradient bars and ASCII homepage directions are superseded.

**Key Characteristics:**

- Monochrome reading surfaces with IAVSE identity and blue keyboard focus.
- Shared capsule navigation, measured rounded cards and visible real product controls.
- Geist for the application and a restrained Cormorant IAVSE signature.
- Portfolio flow and portrait morph, Motion transitions and route-scoped Lenis scrolling.
- Native editing and authored-content behavior, static fallbacks and reduced-motion support.

## Colors

Paper, Ink and the muted neutral layers carry hierarchy. The light semantic roles map to their `dark-` counterparts through the runtime `--pf-*` tokens. Shared `--site-*` aliases connect existing product surfaces to that foundation.

### Primary

- **Ink** (`colors.ink`): headings, primary actions and high-emphasis controls. The dark mapping reverses action foreground and background.
- **IAVSE Focus Blue** (`colors.focus`): the keyboard focus ring; its dark counterpart stays visible on charcoal surfaces.

### Neutral

- **Paper** (`colors.paper`): application background, navigation and product cards.
- **Body** and **Muted Ink** (`colors.body`, `colors.muted-ink`): supporting content and metadata, with separate dark mappings.
- **Muted Surface** (`colors.muted`): selected navigation, selected categories, sidebar surfaces and the closing card.
- **Fine Divider** (`colors.line`): structural card and control borders.

**The Readable Field Rule.** Flow is decorative and remains behind content. Inner public pages reduce the backdrop opacity to (0.34), or (0.45) in dark appearance; the closing card uses (0.35), or (0.12) in dark appearance. Text, empty states and actions must remain complete when WebGL is unavailable.

**The Source Identity Rule.** Catalog screenshots and authored blog themes retain their source colors and typography. The shared application system must not rewrite content authors' chosen appearance.

## Typography

**Application Font:** locally served Geist under the `Portfolio Geist` alias, with PingFang SC and sans-serif fallbacks. The runtime loads the existing variable font asset and its retained license.

**Signature Font:** locally served Cormorant Garamond under `Portfolio Signature`. It is used for the IAVSE closing wordmark, not as a replacement for interface labels or authored template fonts.

The system pairs medium display weights and tight tracking with calm, readable body text. The frontmatter records the homepage and recurring card/navigation roles; dense editor and administration text retains its existing functional sizing.

- **Display:** the opening uses `display`; mobile uses (38px). Directory headings share the display rhythm with a (36px) minimum.
- **Headline:** the home community and blog sections use `headline`, reducing to (32px) on mobile.
- **Card title:** public blog-space cards use `card-title`.
- **Body:** section descriptions use `body`; the opening uses `hero-body`, reducing to (17px) on mobile.
- **Navigation and labels:** `navigation` and `label` keep controls compact without replacing their text with unexplained symbols.
- **Signature:** the closing uses `signature`, reducing to (66px) on mobile. The English mission remains small supporting copy (11px / 1.7).

**The Brand Signature Rule.** Keep the outlined V in shared navigation and the artistic IAVSE wordmark in the closing. Real product names and useful labels remain readable text.

## Layout

The shared header has a compact identity on the left, capsule navigation and existing account/locale controls. Its inner padding is (32px) with a minimum height of (84px); mobile uses (18px) and (72px). The mobile menu replaces the desktop capsule while keeping a separate appearance control.

Public product sections use a maximum container of (1100px). Homepage gutters are (40px), tightening to (32px) below (1000px) and (26px) on mobile. Its split opening pairs product copy with a square template preview, then exposes real resource tabs, community content, blog examples, disclosures and a closing invitation. Below (767px), the opening and later paired sections become one column without changing reading order.

The blog directory uses three columns, then two below (1000px), and one on mobile. The resource introduction uses two columns, then one on mobile. Community, account, administration and editing retain their existing functional layout and responsive controls; the resource catalog retains its muted listing surface.

**The Task Layout Rule.** Carry the shared type, palette and control language across the frontend. Choose composition for each route's purpose: browsing, reading or operating. Do not place a marketing hero, hover portrait or scroll enhancement inside an editing canvas.

## Elevation & Depth

Thin borders and quiet neutral shadows separate cards from the page. The live flow field adds background movement; it is not a simulated physical scene. Framed template images show real IAVSE example pages.

- **Shared soft shadow:** `0 12px 36px -22px #0003` under selected content panels.
- **Navigation:** `0 3px 6px -3px #0002` gives the capsule a small separation from its backdrop.
- **Portrait frame:** `0 2px 5px #0002` keeps the square screenshot grounded.
- **Resource and directory hover:** `0 16px 34px -22px #0004` accompanies an upward translation of (4px) on hover-capable devices.

**The Motion Boundary Rule.** Use Motion for interface transitions, OGL for the template's flow and portrait shaders, and Lenis for eligible public-page scrolling. Authored blog, administration and workspace routes keep native scrolling. Reduced motion disables Lenis and movement; the flow renders a static frame, and portrait initialization uses its fallback image when reduced motion or no hover is detected.

## Shapes

Capsules define navigation and selection. Rounded rectangles define controls, cards and previews, using the named radii in the frontmatter. The portrait includes an inner clipped radius of (25px); its outer frame uses `portrait`. The closing card shares that larger radius and reduces to (24px) on mobile. Member avatars remain small circles (58px), distinct from square template previews. Fine borders provide boundaries without glass effects.

## Components

### Actions and fields

Primary actions use Ink on Paper's inverse; secondary actions use Paper, Ink and a Fine Divider. Opening actions have a minimum height of (46px) and use the `label` role. Hover-capable devices lift them by (2px). Shared keyboard focus is a (2px) blue outline with (4px) offset. Administration inputs use `input` corners with existing labels, validation and disabled semantics; existing product search behavior remains in its component.

### Navigation and appearance

The capsule wraps the existing destinations. An active pill moves with a spring (stiffness 380, damping 32); reduced motion resolves the position immediately. `aria-current="page"` identifies a direct match and `location` its parent section. The appearance control writes the existing `site-color-mode` cookie. Supported browsers reveal the new theme with a circle (0.7s); reduced motion or absent View Transition support applies the appearance directly.

### Cards and directories

Resources use bordered `resource-card` surfaces. Blog spaces use `space-card`, showing genuinely public members and clearly marked built-in examples. Their permissions, routes and empty states are product behavior, not decorative fixtures. The resource introduction offers direct links to actual catalog groups. Account and administration panels adopt the same neutral language while keeping their operating affordances.

### Product controls

Resource categories and template choices remain native, keyboard-operable controls. Search stays bounded to its selected featured category and retains its empty state and Escape behavior. Public community content comes from the existing qualified feed. Template previews use actual built-in layouts, with their fictional-example disclosure and real destinations.

### Flow and template portrait

The full-page flow and closing-card shader derive from the pinned upstream Portfolio component. The square opening portrait adapts the upstream image morph to two genuine IAVSE template screenshots; mouse hover changes the preview and its destination together. Touch and reduced-motion initialization show the static image. Server-rendered text, links and the fallback image remain available if GPU setup fails. The animation instances release frames, observers, listeners and GPU contexts on unmount.

## Do's and Don'ts

- Do use the Portfolio foundation for shared application chrome, palette, typography and controls.
- Do preserve actual content, native editing behavior, publishing permissions and source attribution.
- Do keep built-in template examples clearly identified and leave their authored appearance intact.
- Do pair visual state with a working destination, keyboard state or meaningful product behavior.
- Do respect reduced motion, no-WebGL fallbacks and route lifecycle cleanup.
- Don't reintroduce the superseded Silk, Gradient Bars, optical tide or ASCII direction as the current frontend.
- Don't impose the homepage split composition on community feeds, settings, administration or editors.
- Don't replace real empty states with invented members, activity, testimonials or engagement totals.
- Don't treat the public template's permission as a license for paid Pro components or as a replacement for IAVSE's original license.
