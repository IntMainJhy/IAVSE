---
name: "IAVSE"
description: "A clear, softly colored workspace for creative discovery, community and publishing."
colors:
  canvas: "#f7f9fc"
  background: "#ffffff"
  foreground: "#172b3a"
  secondary: "#4d6171"
  subtle: "#607180"
  muted: "#eef3f7"
  border: "#dce5ed"
  focus: "#1266a4"
  sky: "#e5f2fb"
  sage: "#e9f3ee"
  warm: "#fff2e7"
  selection: "#d6eafb"
  dark-canvas: "#0b141e"
  dark-background: "#111e2b"
  dark-foreground: "#edf5fc"
  dark-secondary: "#b8c6d3"
  dark-subtle: "#9cafbf"
  dark-muted: "#182b3b"
  dark-border: "#2b4255"
  dark-focus: "#86c9ef"
  dark-sky: "#163448"
  dark-sage: "#203d35"
  dark-warm: "#3b3029"
  dark-selection: "#284e67"
  success: "#21613d"
  error: "#b42318"
  dark-success: "#83d4a1"
  dark-error: "#ffb4ab"
typography:
  display:
    fontFamily: '"IAVSE Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    fontSize: "clamp(34px, 4.1vw, 54px)"
    fontWeight: 500
    lineHeight: 1.16
    letterSpacing: "-0.025em"
  directory-heading:
    fontSize: "clamp(36px, 4vw, 48px)"
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: "-0.02em"
  contact-heading:
    fontSize: "clamp(32px, 3.5vw, 44px)"
    fontWeight: 500
    lineHeight: 1.18
  introduction:
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.6
  card-title:
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  card-body:
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "-0.01em"
  application-body:
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
  preview: "14px"
  card: "20px"
  about-panel: "24px"
  contact-inner: "1.6rem"
  frame: "28px"
  pill: "9999px"
spacing:
  contact-inset: "6px"
  preview-inset: "8px"
  card-inset-mobile: "12px"
  card-inset: "14px"
  control-inline: "20px"
  gutter-mobile: "24px"
  card-gap: "24px"
  panel-padding: "28px"
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
  contact-panel:
    backgroundColor: "{colors.sky}"
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
  language-trigger:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "36px"
---

# Design System: IAVSE

## Overview

**Creative North Star: "Clarity for creative work"**

IAVSE pairs a cool, quiet canvas with white surfaces, readable blue-gray type and pale sky, sage and warm grouping colors. Clear spacing and restrained hierarchy let resources, community activity and publishing tasks remain the focus. A self-hosted Geist face, soft card edges and a light CSS atmosphere give the existing application a coherent IAVSE character.

The public composition and interaction baseline comes from [RBP Portfolio](https://github.com/DavidHDev/rbp-portfolio), pinned at `1581b9b8e5876f60e5eb844970747506980c4412`. The current design independently refines its typography, spacing, colors, frames and backdrop. General principles of spacing, type hierarchy, pale surfaces and grouping informed this refinement; the cancelled Cloudlight template migration remains cancelled. No Cloudlight code, shader or assets are included.

This file is the single current platform visual specification. [IAVSE tokens and controls](src/app/iavse-system.css), the [scoped template input](src/styles/rbp-template.input.css) and the [host bridge](src/app/rbp-bridge.css) implement it. [Implementation notes](docs/portfolio-frontend.md) distinguish retained components from independent changes. Community, catalogs, accounts, administration and the editor shell share these primitives within their functional layouts. User-authored canvases, published blog themes, uploaded images and third-party previews retain their own appearance and rights.

**Key Characteristics:**

- Cool light and dark canvases with clear text roles and restrained tinted groups.
- Self-hosted Geist under the CSS alias IAVSE Sans, with system and CJK fallbacks.
- Existing split Hero, four Projects, Contact and capsule navigation as the public baseline.
- Independently refined type, spacing, card surfaces and CSS atmosphere.
- First-viewport upward fades, bounded staggering and accessible motion fallbacks.
- Functional application layouts, truthful content and preserved third-party attribution.

## Colors

The frontmatter records the normative light and dark roles from the IAVSE stylesheet. Dark appearance changes each role rather than applying a filter to the light page.

### Primary

- **Blue-gray Foreground:** headings, text, filled actions and selected filter pills.
- **Focus Blue:** visible keyboard focus, distinct from the foreground action fill.
- **Success / Error:** semantic feedback with separate light and dark values.

### Secondary

- **Sky:** Contact, selected resource tabs, Skill preview areas and the primary administration content group.
- **Sage / Warm:** alternate Skill previews and selected homepage preview grounds, supporting content grouping without replacing source images.

### Neutral

- **Canvas / Background:** the quiet page ground and its distinct card, navigation and field surfaces.
- **Secondary / Subtle:** supporting copy and lower-emphasis metadata, respectively.
- **Muted / Border:** restrained inset fills, dividers and control outlines.
- **Selection:** readable text-selection fills in both appearances.

**The Role Continuity Rule.** Use the same semantic role across public and operating pages; an older feature alias must resolve to the IAVSE palette.

**The Source Identity Rule.** Keep source screenshots, member content and authored themes recognizable and attributed. Examples must remain labeled.

## Typography

**Display and Body Font:** self-hosted Geist, declared as **IAVSE Sans** in CSS, with the fallback stack recorded in the display token. The alias identifies the application's font role; it does not claim authorship of the typeface. The existing [Geist font file](public/fonts/design-artifacts/voltagent/geist-variable.woff2) retains its [SIL OFL notice](public/fonts/design-artifacts/voltagent/geist-OFL.txt). Missing glyphs, including CJK, use available fallback fonts. Both retained sans and serif template utilities resolve to this shared stack. The Cormorant README wordmark remains a separate licensed brand asset.

Hero type uses the display clamp, with a compact brand greeting (16px) and supporting copy limited to (34ch). Hero copy has slightly tightened tracking (-0.01em). Resource and blog-directory titles use the directory-heading role; their introductions use the introduction role and a (38ch) maximum. Contact uses its own heading role and balanced introduction copy with a (38ch) maximum.

Project titles step from (20px) on mobile to the card-title role from the small breakpoint; descriptions step from (14px) to the card-body role. About prose remains (17px / 18px), with line height (1.7). Operating pages use the application roles, section headings at (24px) and card headings at (20px). Navigation and actions keep the compact label scale. Download-page headings use the full mobile header width; the existing Chinese title keeps its two comma-separated phrases intact.

**The Readable Hierarchy Rule.** Preserve the distinction between public introduction copy, application body copy and compact labels. Verify Chinese, English and Japanese wrapping at the actual available width.

## Layout

The root rem base is (16px). The public navigation remains a centered capsule fixed (24px) from the top, with Home, Resources, About and a theme control. Account and language controls remain in Contact. Administration, editors and authored-blog pages retain their route-specific navigation.

The homepage order remains **Hero → four Projects → Contact**, followed by a bottom spacer. Main public containers have a maximum width of (1100px), with horizontal gutters of (24px / 40px). The split hero becomes two columns from medium width. Its top padding is (144px), increasing to (192px) from the small breakpoint; bottom padding is (80px / 112px). Its square visual preview has a desktop maximum of (420px).

Projects retain single-column / two-column CSS columns at the medium breakpoint, gaps of (24px / 28px), and intact cards within each column. A thin separator and top padding of (24px) on mobile and (40px) on desktop identify the project region. Resource overview and blog directory retain the ProjectsPage sequence of centered introduction, Projects and Contact. Their title section now uses the same (144px / 192px) top spacing, with (64px / 80px) bottom spacing.

Operating resource containers use a maximum width of (1180px) and gutters of (40px), reduced to (24px) below medium. Administration retains its sidebar and content grid, with a (1440px) content maximum and a single-column mobile layout. Mobile community navigation stays at the bottom, with its compose action above it. The editor keeps its working toolbar. Download-page title and action groups stack below medium width so the heading receives the available width.

About keeps six tilted dotted polaroids, an introduction, expandable rows, usage rows, feature chips, a draggable technology stack and Contact. Prose and lists use a (640px) maximum; the polaroid strip container uses (1248px). These sections explain the product and its actual technologies.

**The Existing Workflow Rule.** Refine hierarchy and surfaces within the existing public composition and functional layouts. Keep search, publishing, account, moderation and editor controls in their working flows.

## Elevation & Depth

Depth comes primarily from tonal layers, fine borders and nested frames. The independently authored page atmosphere uses CSS radial color fields, with a masked fade into the canvas. Its height is (830px), reduced to (780px) below medium. Browsers supporting CSS scroll timelines can move the field upward by (60px) and reduce opacity to (0.25) over the first (900px) of scroll. It is static under reduced motion or without scroll-timeline support. The current page and Contact do not mount ShaderFlow.

Project and operating cards share the restrained resting shadow (`0 3px 12px -9px #173c5f36`). Project hover retains the existing shadow and (4px) lift; its image scales to (1.06). The preview frame uses `0 18px 48px -35px #193f5b99`. Contact has no outer shadow. Dialogs use `0 16px 48px -24px #0005`; sidebars and navigation panels remain flat or use their existing capsule shadow. Exact retained hover variants live in the sidecar and scoped template CSS.

Content enters once on first viewport appearance using `cubic-bezier(0.22, 1, 0.36, 1)`: template FadeIn moves upward from (12px) over (800ms), while operating content uses (550ms). Hero explicitly keeps mount entry. Group delays are capped at (210ms). Keyboard focus reveals pending operating content immediately. Reduced motion, missing browser APIs and no-JavaScript fallbacks keep content readable. Authored canvas content is excluded from application entry motion.

## Shapes

Control corners use the compact radius; project and operating cards use the card radius, with smaller preview corners inside project cards. The hero preview and Contact use the frame radius, while the preview's inner clipping uses the card radius. The preview inset is (8px); Contact keeps its (6px) inset and nested clipped wrapper. Contact's details panel uses the card radius. The white About introduction uses the about-panel radius. Capsules and chips remain fully rounded, while six tilted polaroids preserve their (3:4) framing. These distinctions keep controls, content and signature surfaces legible.

## Components

### Navigation

The three-link capsule is mounted by PortfolioRuntime and persists across eligible route changes. The active pill uses a spring (stiffness 380, damping 32), with immediate initial measurement. The adjacent theme control uses the retained circular reveal (700ms) where View Transitions are supported, and changes directly under reduced motion or without that API. The existing `site-color-mode` cookie records preference.

### Actions and fields

Primary actions use foreground fill and background-colored text; secondary actions use a background fill and a fine border. The source-copy button keeps its (44px) height and expands its repository label on hover or keyboard focus. Its layout transition is (0.55s), label transition (0.35s), copied-icon transition (0.2s), and copied feedback resets after (1600ms). Its actual action copies the IAVSE repository URL.

Application fields use a fine (1px) border, control corners, minimum height (44px), type size (14px) and padding (10px 14px). Standard application actions have a minimum height of (42px) and padding (10px 16px). Placeholder text uses the subtle role. Keyboard focus uses the shared (2px) focus outline with a (4px) offset. Functional components retain their labels, validation, disabled states and permissions. The avatar chooser keeps its accessible native input and visible button label.

### Cards, filters and Contact

Project cards keep an icon label, source preview, title, description and metadata, with (12px / 14px) insets. Four homepage destinations lead to UI designs, AI Skills, community and blog spaces. Resource overview and blog directory reuse the Projects component and existing discovery rules. Bundled examples remain visibly identified.

Operating cards use the shared surface, border, shadow and card corners. Account and login panels use (28px) padding, reduced to (24px) below medium. Filter pills use muted surfaces and secondary text, with foreground/background inversion for selected filter states. The resource category capsule instead uses the sky tint for its active tab. Contact uses a sky outer surface and a separate background-colored details panel, preserving working account, community, repository and language destinations.

### About and portrait

About keeps the dotted polaroids, pointer springs, partial-row reveal and expandable list behavior from the baseline. Feature chips describe current capabilities. The Matter.js stack represents installed technologies, supports dragging and reset, and becomes static wrapped labels under reduced motion.

The retained portrait morph uses actual built-in template screenshots as a visual preview. Its visible frame loop continues after the blend settles; a hidden browser tab pauses it. Initialization under reduced motion or without hover leaves a static fallback image, and WebGL failure leaves the content readable. Existing route and unmount cleanup release listeners, observers, frame work and GPU resources. Lenis remains limited to eligible public routes and preserves native operating scroll regions.

### Content boundaries

Template utility resets stop at the operating boundary. Shared application styling stops at authored blog roots, saved canvas blocks, personal homepages, authored themes and React Flow viewports. The platform return bar uses IAVSE type and colors; authored work, third-party previews and uploads retain their own appearance. Historical `rbp-*` file names and guide slugs preserve source mapping and existing links; they do not establish a competing current design system.

## Do's and Don'ts

- Do use the shared IAVSE semantic tokens and font role across platform UI.
- Do preserve the existing public composition and working application flows while applying the documented refinements.
- Do use pale tints to group content and preserve source images inside previews.
- Do verify heading and introduction wrapping in Chinese, English and Japanese on desktop and mobile.
- Do trigger viewport entry once, cap group delays at 210ms and reveal keyboard-focused content immediately.
- Do retain labeled examples, actual empty states, attribution and accessible motion fallbacks.
- Don't import Cloudlight code, shaders or assets, or revive the cancelled direct template migration.
- Don't claim the refined type, spacing and surfaces are an exact reproduction of RBP's original geometry.
- Don't apply the platform skin or entry animation inside authored canvas documents or third-party previews.
- Don't stop the visible portrait's normal frame loop after its hover blend settles.
- Don't invent users, posts, endorsements or engagement totals to fill a layout.
- Don't present the RBP template as MIT-licensed, claim authorship of Geist or expand third-party permissions.
