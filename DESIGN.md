---
name: "IAVSE · RBP Portfolio Content Port"
description: "The pinned Portfolio layout and normal motion, with IAVSE content and routes."
colors:
  background: "#ffffff"
  foreground: "#0a0a0a"
  muted: "#f5f5f5"
  muted-foreground: "#737373"
  border: "#e5e5e5"
  ring: "#0066ff"
  dark-background: "#0a0a0a"
  dark-foreground: "#fafafa"
  dark-muted: "#171717"
  dark-muted-foreground: "#a3a3a3"
  dark-border: "#262626"
  dark-ring: "#3b82f6"
typography:
  display:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    fontSize: "3.65rem"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    fontSize: "3.5rem"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  hero-body:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  card-title:
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  card-body:
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  label:
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  metadata:
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.025em"
rounded:
  icon: "8px"
  control: "12px"
  preview: "16px"
  card: "24px"
  frame-inner: "1.6rem"
  frame: "32px"
  pill: "9999px"
  native-input: "10px"
spacing:
  frame-inset: "6px"
  control-inline: "20px"
  gutter-mobile: "24px"
  card-gap: "24px"
  card-gap-desktop: "28px"
  gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  navigation:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px"
  project-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "14px"
  feature-chip:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  framed-panel:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.frame}"
    padding: "6px"
  native-input:
    rounded: "{rounded.native-input}"
---

# Design System: IAVSE · RBP Portfolio Content Port

## Overview

**Creative North Star: "Portfolio, with IAVSE content"**

The confirmed direction is to keep the open repository's layout and motion unchanged and merge IAVSE's content into it. The authority is [DavidHDev/rbp-portfolio](https://github.com/DavidHDev/rbp-portfolio) at `1581b9b8e5876f60e5eb844970747506980c4412`, checked against its rendered demo. Preserve the original composition, responsive spacing, neutral surfaces, fixed capsule navigation, flow shader, image morph and transition parameters. This supersedes the earlier broad visual adaptation.

Template-backed pages use the original Hero, Projects, About and Contact structures. IAVSE supplies real resource destinations, product descriptions and clearly labeled examples. Community, filtered catalogs, account, administration and editor screens retain their existing functional layouts within the application boundary. The upstream template has no matching operating screens; do not describe those screens as pixel-identical ports. Authored blogs and their templates retain their own visual identity.

The sources of truth are [RBP components](src/components/rbp/), [template CSS input](src/styles/rbp-template.input.css), [compiled scoped CSS](src/app/rbp-template.css), [host bridge](src/app/rbp-bridge.css), and [PortfolioRuntime](src/components/portfolio/PortfolioRuntime.tsx). [Implementation notes](docs/portfolio-frontend.md) map the upstream files and integration boundaries. The host [foundation stylesheet](src/app/portfolio-foundation.css) still supplies native operating-surface aliases; it is not the template's geometry or typography authority.

**Key Characteristics:**

- Original public-page composition and normal-motion timing, with IAVSE text, images and routes.
- A centered three-link capsule, a theme button and account/language access in Contact.
- System-ui typography matching the reference's computed output, including serif-class headings.
- Two-column Projects cards, six About polaroids and the original interactive stack.
- Native operating layouts and independent authored blogs, with source attribution and fallbacks.

## Colors

The frontmatter records the template scope's actual light and dark tokens. Foreground opacity supplies most text and border hierarchy: supporting copy uses foreground at (65%), metadata at (50%) and card borders at (8%). These composited roles are intentional and should not be replaced by the older host muted-text aliases.

### Primary

- **Foreground:** headings, text, primary actions and the monochrome interaction vocabulary.
- **Focus Blue:** the existing keyboard-focus role; it does not recolor neutral cards or navigation.

### Neutral

- **Background:** page ground, capsule, project cards and framed panels.
- **Muted Surface / Muted Foreground:** secondary surfaces and supporting semantic roles.
- **Border:** the neutral divider token, supplemented by translucent foreground borders in the original components.

**The Source Identity Rule.** Resource screenshots, genuine member content and authored blog themes retain their source appearance and attribution. Do not imply that template screenshots represent real members or endorsements.

## Typography

The public template's effective font is the system-ui stack recorded in the frontmatter. Both sans and serif utility roles resolve to this stack, matching the published reference. The presence of serif class names does not authorize adding a serif face. Geist and Cormorant font files remain in the repository for native surfaces and existing brand assets; they are not the mounted RBP pages' font selection.

The homepage display uses (2.75rem) below the medium breakpoint, (2.5rem) at medium, and the frontmatter desktop value at large. Its greeting is (20px), and its supporting paragraph is limited to (34ch). Projects section titles step from (2.5rem) to (3rem) to the desktop headline role. Projects-page titles use (2.75rem / 3.25rem / 3.75rem); their introductory text is limited to (33ch).

Project card titles use (20px) on small screens and the frontmatter title role from the small breakpoint; descriptions similarly use (14px / 15px). About prose uses (17px / 18px), line height (1.7), and the original emphasis within each paragraph. Navigation and actions use the compact label role.

**The Computed Type Rule.** Match the pinned reference's rendered type and wrapping. Do not infer a new typeface from a source variable name or replace its typography with a custom brand system.

## Layout

RBP routes restore a (16px) root rem base. The public capsule stays centered and fixed at (24px) from the top, containing Home, Resources, About and the theme control. It stays a compact capsule on mobile. There is no full-width identity/account header. The root runtime persists the navigation across eligible route changes so the active pill can travel between destinations.

The homepage order is **Hero → four Projects → Contact**, followed by the original bottom spacer. Its section gap is (80px), becoming (112px) from the small breakpoint. Main containers are at most (1100px), with horizontal gutters of (24px / 40px). Hero padding is (176px) above and (96px) below, becoming (224px / 128px). The hero becomes two columns at medium width; its preview is square, with a desktop maximum of (420px).

Projects use CSS columns: one below medium and two from medium, with gaps of (24px / 28px) and cards kept intact within a column. Resource overview `/resources` and blog directory `/blogs` use the original ProjectsPage composition, with centered title/intro, Projects and Contact. The title section retains its large desktop top spacing (400px); do not compress it into an application toolbar. Resource filter routes retain the working catalog separately.

About keeps six tilted dotted polaroids, a narrow introduction panel, Experience-style expandable rows, Education-style usage rows, feature chips, the physics stack and Contact, in that order. The main prose/list width is (640px); the polaroid strip container is (1248px). These are product descriptions and usage guidance, not an invented personal biography.

**The Content Port Rule.** Replace content and destinations in the original components. Preserve their structure, dimensions, breakpoints and normal-motion behavior. The operational surfaces that have no upstream equivalent retain their own necessary layouts.

## Elevation & Depth

Original thin borders, nested rounded frames, restrained shadows and shader layers provide depth. The page backdrop is (900px) tall, with opacity (0.5) below medium and (1) from medium. Contact's masked shader uses opacity (0.45) in light appearance and (0.25) in dark appearance. Keep the original mask, shader parameters and stacking; opaque wrapper backgrounds must not hide the negative-z-index flow.

Project cards rest on `0 1px 2px rgb(0 0 0 / 0.04)`. Hover changes the shadow to `0 10px 20px -8px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.08)` and raises the card by (4px). The dark variants retain their stronger original shadows. Frame and capsule shadows use the compiled template utilities, not the earlier custom foundation shadow.

Normal motion uses `cubic-bezier(0.22, 1, 0.36, 1)`. FadeIn starts at (12px) below over (0.8s); ScaleUnblur starts at scale (0.7) and blur (20px) over (1s). Project hover movement lasts (0.4s); image scale reaches (1.06) over (0.7s). Preserve these values. Exact spring, theme, scrolling, polaroid and shader parameters are recorded in the sidecar and implementation notes.

## Shapes

The original rounded scale distinguishes controls, previews, project cards and outer frames. Portrait and Contact frames retain the narrow (6px) inset and inner clipped radius. About panels use the outer-frame radius, while individual list rows use the card radius. Six polaroids retain their (3:4) aspect and tilted framing; the ten technology chips use their original physics-chip shape. Do not replace these with a uniform card radius.

## Components

### Navigation

The three-link capsule is mounted by the root PortfolioRuntime. Links use an active spring pill (stiffness 380, damping 32), measured initially without animation. The adjacent theme button preserves the circular reveal (700ms) where View Transitions are supported; otherwise, or under reduced motion, it changes appearance directly. It writes the existing `site-color-mode` cookie. Native administration and authored-blog routes keep their own chrome.

### Actions

The primary ContactButton copies the IAVSE repository URL. Hover and keyboard focus expand its label; the layout transition is (0.55s), label blur/fade is (0.35s), copied-icon transition is (0.2s), and copied feedback resets after (1600ms). Secondary actions navigate to resources. Keep these original control dimensions and behavior while localizing the text.

### Projects and directories

Four homepage cards lead to UI designs, AI Skills, community and blog spaces. Cards preserve the original media ratios, inset image, icon label, title, description and metadata. Resource overview and blog directory reuse this same Projects component. Directory members come from the existing public discovery rules; bundled examples are visibly labeled. There is no mounted homepage category/search workbench or three-column blog grid.

### About

The six polaroids retain their dotted contents, rotations and pointer springs. Expandable rows retain the original partial-row reveal and height transition. Feature chips describe current capabilities. The Matter.js stack represents the actual installed technologies, supports dragging and reset, and uses a static wrapped layout under reduced motion. It does not assert personal education or employment history.

### Flow and portrait

The page flow, Contact flow and portrait morph retain the upstream normal-motion behavior. The portrait is a visual preview, not a link whose destination switches on hover. Its visible normal-motion frame loop continues after the blend settles; only background-tab visibility pauses that loop. Reduced-motion or no-hover initialization leaves the fallback image, and WebGL failure leaves content readable. Flow skips offscreen/background drawing and uses a static frame under reduced motion. Unmounts release listeners, observers, frame tasks and WebGL contexts.

### Native controls and authored content

Filtered catalogs, community feeds, account forms, administration and editing retain working layouts, permissions, validation and content behavior. Native inputs keep their existing labels and sizes with the host foundation's field radius and color aliases. Template CSS is scoped from `.rbp-surface` to `.rbp-native`; it must not reset an editor or a member-authored theme. Lenis excludes administration, workspace and authored-blog routes. Reduced-motion accommodations are component-specific; do not claim that every Motion transition is disabled globally.

## Do's and Don'ts

- Do preserve the pinned template's composition, responsive geometry and normal-motion parameters.
- Do put real IAVSE content and working destinations into the original component slots.
- Do match the reference's system-ui rendering, including the serif-class fallback.
- Do keep source attribution, labeled examples, real empty states and native operating behavior.
- Do preserve existing reduced-motion fallbacks and route/unmount cleanup.
- Don't reintroduce a full-width brand header, homepage workbench or three-column blog directory.
- Don't substitute custom fonts, new section spacing or new animation timing for the reference.
- Don't stop the visible portrait's normal frame loop after its hover blend settles.
- Don't claim upstream pixel identity for administration, editing or other pages absent from the template.
- Don't present the RBP template as MIT-licensed or extend its permissions to unrelated material.
