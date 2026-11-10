---
name: "IAVSE · RBP Portfolio"
description: "One RBP Portfolio design system across the IAVSE platform, with viewport entry motion."
colors:
  background: "#ffffff"
  foreground: "#0a0a0a"
  muted: "#f5f5f5"
  secondary: "#666"
  muted-foreground: "#737373"
  border: "#e5e5e5"
  ring: "#0066ff"
  dark-background: "#0a0a0a"
  dark-foreground: "#fafafa"
  dark-muted: "#171717"
  dark-secondary: "#b5b5b5"
  dark-muted-foreground: "#a3a3a3"
  dark-border: "#262626"
  dark-ring: "#3b82f6"
  success: "#21613d"
  error: "#b42318"
  dark-success: "#83d4a1"
  dark-error: "#ffb4ab"
  dark-selection: "#333"
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
  application-body:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  application-heading:
    fontSize: "clamp(32px, 3.2vw, 44px)"
    fontWeight: 500
    lineHeight: 1.2
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
  application-input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  application-button:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  application-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
  filter-pill:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.pill}"
---

# Design System: IAVSE · RBP Portfolio

## Overview

**Creative North Star: "One Portfolio language across IAVSE"**

RBP Portfolio is the sole visual authority for the IAVSE platform. The pinned source is [DavidHDev/rbp-portfolio](https://github.com/DavidHDev/rbp-portfolio) at `1581b9b8e5876f60e5eb844970747506980c4412`, checked against its rendered demo. Public pages preserve the original Hero, Projects, About and Contact composition, responsive spacing, flow shader, portrait morph and interaction parameters. Platform operating pages carry the same system-ui type, grayscale surfaces, rounded cards, pills and controls into their existing functional layouts.

Community, filtered catalogs, account forms, administration and the editor shell share this visual system. Their hierarchy, data, validation and permissions stay functional; the upstream repository supplies no equivalent operating screens, so visual consistency does not imply pixel identity. User-authored canvas documents, published blog themes, uploaded images and third-party previews are content boundaries and retain their own appearance.

This file is the single platform visual specification. [Platform tokens and controls](src/app/rbp-system.css) implement it; [RBP components](src/components/rbp/), [template CSS input](src/styles/rbp-template.input.css) and its [compiled scoped output](src/app/rbp-template.css) retain the template implementation. The [host bridge](src/app/rbp-bridge.css) owns integration only. [Implementation notes](docs/portfolio-frontend.md) document source mapping, route boundaries and entry motion. Earlier platform skins and competing design guides have been removed; third-party catalog studies are reference content.

**Key Characteristics:**

- Original public-page composition and interaction parameters, with real IAVSE content and destinations.
- One system-ui font and light/dark grayscale palette across all platform surfaces.
- Shared rounded cards, monochrome actions, capsule filters and accessible fields.
- First viewport entry with a short upward fade and capped group staggering.
- Functional operating layouts and independent authored content, with source attribution and fallbacks.

## Colors

The frontmatter records the shared light and dark palette. Template supporting copy uses foreground at (65%), metadata at (50%) and card borders at (8%). Operating pages use the shared secondary and subtle text roles. Existing feature aliases resolve to the same palette through the platform stylesheet.

### Primary

- **Foreground:** headings, text, primary actions and the monochrome interaction vocabulary.
- **Focus Blue:** keyboard focus across template and operating controls, with a (2px) outline and (4px) offset. It does not recolor neutral cards or navigation.
- **Success / Error:** semantic feedback only, with separate light and dark values; they are not decorative accents.

### Neutral

- **Background:** page ground, capsule, project cards and framed panels.
- **Muted Surface / Secondary / Muted Foreground:** raised surfaces, supporting copy and subtle text.
- **Dark Selection:** selection fill that keeps light text readable in dark appearance.
- **Border:** the neutral divider token, supplemented by translucent foreground borders in the original components.

**The Source Identity Rule.** Resource screenshots, genuine member content and authored blog themes retain their source appearance and attribution. Do not imply that template screenshots represent real members or endorsements.

## Typography

All platform surfaces use the system-ui stack recorded in the frontmatter. Both sans and serif template utility roles resolve to this stack, matching the published reference. The presence of serif class names does not authorize adding a serif face. Retained Geist and Cormorant assets keep their own licenses and may support existing content or brand assets; they are not the platform font choice.

The homepage display uses (2.75rem) below the medium breakpoint, (2.5rem) at medium, and the frontmatter desktop value at large. Its greeting is (20px), and its supporting paragraph is limited to (34ch). Projects section titles step from (2.5rem) to (3rem) to the desktop headline role. Projects-page titles use (2.75rem / 3.25rem / 3.75rem); their introductory text is limited to (33ch).

Project card titles use (20px) on small screens and the frontmatter title role from the small breakpoint; descriptions similarly use (14px / 15px). About prose uses (17px / 18px), line height (1.7), and the original emphasis within each paragraph. Navigation and actions use the compact label role. Operating pages use the application body and heading roles, with section headings at (24px) and card headings at (20px); their existing information hierarchy remains intact.

**The Computed Type Rule.** Match the pinned reference's rendered type and wrapping. Do not infer a new typeface from a source variable name or replace its typography with a custom brand system.

## Layout

RBP routes restore a (16px) root rem base. The public capsule stays centered and fixed at (24px) from the top, containing Home, Resources, About and the theme control. It stays a compact capsule on mobile. There is no full-width identity/account header. The root runtime persists the navigation across eligible route changes so the active pill can travel between destinations.

The homepage order is **Hero → four Projects → Contact**, followed by the original bottom spacer. Its section gap is (80px), becoming (112px) from the small breakpoint. Main containers are at most (1100px), with horizontal gutters of (24px / 40px). Hero padding is (176px) above and (96px) below, becoming (224px / 128px). The hero becomes two columns at medium width; its preview is square, with a desktop maximum of (420px).

Projects use CSS columns: one below medium and two from medium, with gaps of (24px / 28px) and cards kept intact within a column. Resource overview `/resources` and blog directory `/blogs` use the original ProjectsPage composition, with centered title/intro, Projects and Contact. The title section retains its large desktop top spacing (400px); do not compress it into an application toolbar. Resource filter routes retain their working catalog hierarchy, with a centered capsule category switcher, shared cards and RBP controls.

Operating resource containers use a maximum width of (1180px) and horizontal gutters of (40px), becoming (24px) below medium. Administration retains its sidebar and content grid with a (1440px) content maximum; below medium it becomes one column. Mobile community navigation stays fixed at the bottom, with its compose action above it. The editor keeps its working toolbar and omits the public capsule. These layouts all use the shared palette and control scale.

About keeps six tilted dotted polaroids, a narrow introduction panel, Experience-style expandable rows, Education-style usage rows, feature chips, the physics stack and Contact, in that order. The main prose/list width is (640px); the polaroid strip container is (1248px). These are product descriptions and usage guidance, not an invented personal biography.

**The Content Port Rule.** Replace content and destinations in the original components. Preserve their structure, dimensions, breakpoints and normal-motion behavior. Operating surfaces without an upstream equivalent retain their necessary hierarchy and use the same platform primitives.

## Elevation & Depth

Original thin borders, nested rounded frames, restrained shadows and shader layers provide depth. The page backdrop is (900px) tall, with opacity (0.5) below medium and (1) from medium. Contact's masked shader uses opacity (0.45) in light appearance and (0.25) in dark appearance. Keep the original mask, shader parameters and stacking; opaque wrapper backgrounds must not hide the negative-z-index flow.

Project cards rest on `0 1px 2px rgb(0 0 0 / 0.04)`. Hover changes the shadow to `0 10px 20px -8px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.08)` and raises the card by (4px). The dark variants retain their stronger original shadows. Frame and capsule shadows use the compiled template utilities. Operating cards use the shared subtle shadow (`0 1px 3px #0000000d`), neutral border and card radius; navigation panels remain flat.

Normal motion uses `cubic-bezier(0.22, 1, 0.36, 1)`. Template FadeIn now starts on first viewport entry, moving up from (12px) below over (800ms); Hero explicitly retains mount entry, and ScaleUnblur keeps its original scale (0.7), blur (20px) and duration (1s). Template project delays retain (60ms) per index with a (210ms) cap. Operating content uses the same upward fade over (550ms), staggering each observer batch by (70ms), capped at (210ms). Both entry systems use a viewport threshold of (0.12) and bottom margin of (-6%). Once revealed, content remains visible.

Keyboard focus immediately reveals a pending operating region. Enabling reduced motion cancels pending or active application entries and shows content; no-JavaScript and missing-observer fallbacks also stay readable. Newly inserted results are observed, and route/query cleanup cancels animations and removes observers. Entry motion excludes authored canvas content and elements already managed by template motion. Project hover movement remains (400ms); image scale reaches (1.06) over (700ms). Exact parameters live in the sidecar, [shared motion policy](src/lib/rbp-motion.mjs) and implementation notes.

## Shapes

The original rounded scale distinguishes controls, previews, project cards and outer frames. Portrait and Contact frames retain the narrow (6px) inset and inner clipped radius. About panels use the outer-frame radius, while individual list rows use the card radius. Six polaroids retain their (3:4) aspect and tilted framing; the ten technology chips use their original physics-chip shape. Do not replace these with a uniform card radius.

## Components

### Navigation

The three-link capsule is mounted by the root PortfolioRuntime. Links use an active spring pill (stiffness 380, damping 32), measured initially without animation. The adjacent theme button preserves the circular reveal (700ms) where View Transitions are supported; otherwise, or under reduced motion, it changes appearance directly. It writes the existing `site-color-mode` cookie. Administration and editor routes keep their own navigation using RBP controls; the public capsule is omitted there. Authored-blog routes keep their content chrome, with the platform return bar using RBP colors and type.

### Actions

The primary ContactButton copies the IAVSE repository URL. Hover and keyboard focus expand its label; the layout transition is (0.55s), label blur/fade is (0.35s), copied-icon transition is (0.2s), and copied feedback resets after (1600ms). Secondary actions navigate to resources. Keep these original control dimensions and behavior while localizing the text.

### Projects and directories

Four homepage cards lead to UI designs, AI Skills, community and blog spaces. Cards preserve the original media ratios, inset image, icon label, title, description and metadata. Resource overview and blog directory reuse this same Projects component. Directory members come from the existing public discovery rules; bundled examples are visibly labeled. There is no mounted homepage category/search workbench or three-column blog grid.

### About

The six polaroids retain their dotted contents, rotations and pointer springs. Expandable rows retain the original partial-row reveal and height transition. Feature chips describe current capabilities. The Matter.js stack represents the actual installed technologies, supports dragging and reset, and uses a static wrapped layout under reduced motion. It does not assert personal education or employment history.

### Flow and portrait

The page flow, Contact flow and portrait morph retain the upstream normal-motion behavior. The portrait is a visual preview, not a link whose destination switches on hover. Its visible normal-motion frame loop continues after the blend settles; only background-tab visibility pauses that loop. Reduced-motion or no-hover initialization leaves the fallback image, and WebGL failure leaves content readable. Flow skips offscreen/background drawing and uses a static frame under reduced motion. Unmounts release listeners, observers, frame tasks and WebGL contexts.

### Operating controls and content boundaries

Filtered catalogs, community feeds, account forms, administration and the editor shell share the RBP type, colors, cards, buttons, pills and feedback. Fields have the control radius, a neutral (1px) border, minimum height (44px), font size (14px) and padding (10px 14px). Primary actions use a foreground fill and background-colored text; secondary actions use the page background with a neutral border. Selected filter pills invert foreground and background. Disabled state, labels, validation and permissions remain owned by each functional component. The avatar chooser preserves an accessible native file input and a visible RBP button label with keyboard focus.

Template utility resets stop at the operating boundary. The platform application scope stops at authored blog roots, saved canvas blocks, authored themes and React Flow content; third-party previews and uploaded images keep their source appearance. Lenis excludes administration, workspace and authored-blog routes. Application entry motion enhances existing nodes without wrapping or moving form controls. Other motion accommodations remain component-specific.

## Do's and Don'ts

- Do preserve the pinned template's public composition, responsive geometry and interaction parameters.
- Do use the shared RBP tokens and controls on every platform operating page.
- Do trigger content entry once in the viewport and cap group delays at 210ms.
- Do put real IAVSE content and working destinations into the original component slots.
- Do match the reference's system-ui rendering, including the serif-class fallback.
- Do keep source attribution, labeled examples, real empty states and native operating behavior.
- Do preserve existing reduced-motion fallbacks and route/unmount cleanup.
- Don't reintroduce a full-width brand header, homepage workbench or three-column blog directory.
- Don't reintroduce a competing platform skin, font stack or design specification.
- Don't change the template's public geometry or interaction timing beyond the documented viewport-entry enhancement.
- Don't hide keyboard-focused content or animate authored canvas documents.
- Don't stop the visible portrait's normal frame loop after its hover blend settles.
- Don't claim upstream pixel identity for administration, editing or other pages absent from the template.
- Don't present the RBP template as MIT-licensed or extend its permissions to unrelated material.
