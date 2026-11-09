---
name: IAVSE Homepage
description: Flowing blue light around real resource discovery, community exchange, and personal work.
colors:
  paper: "#f8fafc"
  ink: "#122536"
  body: "#405569"
  panel: "#fff"
  soft: "#f0f5f9"
  line: "#dbe5ed"
  dark-paper: "#09121c"
  dark-ink: "#eaf4ff"
  dark-body: "#aec2d4"
  dark-panel: "#12202d"
  dark-soft: "#192a39"
  dark-line: "#314556"
  atmosphere: "#deeffb"
  dark-atmosphere: "#102539"
  action-hover: "#285477"
  focus: "#3274ad"
  closing: "#071e34"
  closing-ink: "#eff7ff"
  closing-body: "#b9cee0"
  signature: "#dceeff"
typography:
  display:
    fontFamily: '"IAVSE Inter", "PingFang SC", sans-serif'
    fontSize: "clamp(42px, 4.6vw, 68px)"
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"IAVSE Inter", "PingFang SC", sans-serif'
    fontSize: "clamp(34px, 3.3vw, 46px)"
    fontWeight: 500
    lineHeight: 1.24
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"IAVSE Inter", "PingFang SC", sans-serif'
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  body:
    fontFamily: '"IAVSE Inter", "PingFang SC", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.85
  compact-body:
    fontFamily: '"IAVSE Inter", "PingFang SC", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: '"IAVSE Inter", "PingFang SC", sans-serif'
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  signature:
    fontFamily: '"IAVSE Signature", serif'
    fontSize: "clamp(130px, 24vw, 340px)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.04em"
  ascii:
    fontFamily: '"IAVSE Mono", monospace'
    fontSize: "10px"
    fontWeight: 400
rounded:
  control: "12px"
  panel: "16px"
  closing: "24px"
  hero: "28px"
  pill: "999px"
spacing:
  compact: "8px"
  control: "12px"
  small: "16px"
  medium: "20px"
  content: "24px"
  panel: "28px"
  gutter: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.panel}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  workbench:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 18px"
  tab-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  resource-card:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  search-field:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    padding: "8px"
  template-tab:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
  template-tab-selected:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
  closing:
    backgroundColor: "{colors.closing}"
    textColor: "{colors.closing-ink}"
    rounded: "{rounded.closing}"
---

# Design System: IAVSE Homepage

## Overview

**Creative North Star: "IAVSE in Flowing Light"**

The built homepage places usable creator tools inside a calm blue field. A centered product statement and two direct actions lead into a real resource workbench. Open community and blog-space sections follow in native reading order. A dark ASCII wave field and large serif IAVSE wordmark close the page. The outlined V, IAVSE blue, and English mission remain the shared identity.

This document governs the current homepage, including its homepage-only treatment of shared chrome. It does not make this composition a template for resource directories, community pages, blog galleries, authored templates, account flows, or administration. Their existing layouts, permissions, and visual rules remain in force. The user's latest Cloudlight, Portfolio, and Security references supersede the former protected glass opening and spatial homepage chapters; those are historical implementations, not current homepage constraints. These references establish a quality bar, not an approved image comp.

Ground truth is [PlatformHome.tsx](src/components/PlatformHome.tsx), [home-react-bits.css](src/app/home-react-bits.css), [HomeBitsAtmosphere.tsx](src/components/HomeBitsAtmosphere.tsx), [HomeBitsMotion.tsx](src/components/HomeBitsMotion.tsx), and the React Bits branch of [HomeProductShowcase.tsx](src/components/HomeProductShowcase.tsx). Existing [resource controls](src/components/HomeResourceExplorer.tsx), [template controls](src/components/HomeSpacePreview.tsx), and [home-experience.css](src/app/home-experience.css) supply the retained product behavior. [Reference and license notes](docs/home-react-bits.md) distinguish the licensed open Silk component from the visual references; no paid Pro template source is bundled.

**Key Characteristics:**

- Flowing blue light, cool reading surfaces, dark ink, and an explicit dark appearance.
- A functional resource workbench near the opening, followed by distinct community and template compositions.
- Inter for product content, a restrained serif IAVSE signature, and a decorative mono character field.
- Native scrolling, modest magnetic and lift feedback, and complete content with reduced motion or no WebGL.

## Colors

Blue carries the atmosphere and identity; cool neutrals keep real product content legible. The six light semantic roles map to their `dark-` counterparts when the existing site color mode is dark. Component frontmatter describes the light defaults; runtime custom properties provide the mode mapping.

### Primary

- **Deep Blue Ink** (`colors.ink`): headings, primary actions, selected resource tabs, and product-control focus outlines. In dark appearance, `colors.dark-ink` becomes the foreground and selected fill while `colors.dark-paper` supplies the contrasting action text.
- **IAVSE Action Blue** (`colors.action-hover`) and **Focus Blue** (`colors.focus`): hero primary hover and the opening/theme-control keyboard outline.

### Neutral

- **Cool Paper** / **Night Paper** (`colors.paper`, `colors.dark-paper`): page ground.
- **Reading Panel** / **Night Panel** (`colors.panel`, `colors.dark-panel`): workbench, community reading panel, secondary action, and search field.
- **Soft Blue Surface** / **Night Surface** (`colors.soft`, `colors.dark-soft`): resource cards, search trigger, and template track.
- **Slate Body** / **Night Body** (`colors.body`, `colors.dark-body`): supporting copy, inactive controls, source metadata, and captions.
- **Blue Divider** / **Night Divider** (`colors.line`, `colors.dark-line`): quiet control and content separators.
- **Daylight Field** / **Night Field** (`colors.atmosphere`, `colors.dark-atmosphere`): fallback ground beneath the decorative Silk canvas.
- **Closing Navy**, **Closing Frost**, **Closing Body**, and **Signature Frost** (`colors.closing`, `colors.closing-ink`, `colors.closing-body`, `colors.signature`): the closing invitation and serif mark in both appearances.

**The Readable Field Rule.** Keep text above the moving field. The dark hero uses Dark Ink for both headline and supporting copy, with shader opacity capped at (0.32); do not restore the lower-contrast ordinary dark-body color there. The reviewed worst-case white shader composite remains above (4.5:1).

**The Source Color Rule.** Colors and typography inside actual catalog and template screenshots belong to their source, not the homepage token palette. The sidecar's synthesized tonal strips are panel previews, not runtime tokens.

## Typography

**Product Font:** locally served Inter under the `IAVSE Inter` alias, with PingFang SC and sans-serif fallback for Chinese content.

**Signature Font:** locally served Cormorant Garamond under `IAVSE Signature`. The small workbench wordmark uses the same family at (26px / 1), weight (600); the closing uses the `signature` role.

**Decorative Mono:** locally served Geist Mono under `IAVSE Mono`, used by the original ASCII canvas. It carries no required information.

The product voice is direct and measured. Medium display weights and tight tracking carry hierarchy; the serif appears as a brand signature rather than a competing editorial heading system.

### Hierarchy

- **Display:** the two authored opening lines use `display`; mobile uses (clamp(32px, 8.7vw, 48px) / 1.2).
- **Headline:** community and blog-space sections use `headline`, becoming (34px / 1.24) on mobile. The closing heading uses (clamp(32px, 3.2vw, 46px) / 1.25), becoming (31px) on mobile.
- **Title:** visual resource cards use `title`, becoming (18px) on mobile. Reading cards use (24px) on desktop with the retained mobile title treatment.
- **Body:** opening copy uses `body` within (48ch), becoming (14px) within (32ch) on mobile. Section descriptions use (15px / 1.9), becoming (14px). Resource summaries use (13px / 1.85), becoming (14px); community summaries use the compact role.
- **Label:** resource controls use `label`; mobile category labels use (12px). Sources and captions remain supporting text (11–12px), not substitutes for the resource name or action.
- **Signature:** the large closing wordmark uses `signature`; mobile uses (clamp(110px, 28vw, 200px)).

**The Signature Rule.** Keep the outlined V as the shared navigation mark. The serif wordmark belongs to this homepage's workbench and closing; do not replace other routes' identity or authored template fonts with it.

## Layout

The homepage has a cool page ground with an inset rounded hero canvas. Desktop outer padding is (14px); mobile uses (8px). The centered opening copy has a maximum width of (1050px), generous top space, and wrapping action rows. The blue field fades into the page ground behind the workbench. There is no pinned camera, chapter switcher, wheel capture, or custom scroll engine in the active homepage.

The content container is centered at (1240px) with (32px) horizontal gutters, expanding to (1360px) at viewport widths of at least (1800px). The resource workbench is a full-width reading panel: identity and directory action, category/search toolbar, three actual catalog records, and a bounded-selection footer. Community and blog-space sections use a two-column proportion of (0.82fr / 1.18fr) with a (90px) gap. They deliberately pair an open text column with a reading panel or real template screenshot rather than repeating the opening workbench.

Below (1000px), gutters and column gaps tighten. At (767px) and below, community and blog sections stack and resource cards form one column. Controls wrap, the resource workbench label simplifies, and search expands to the toolbar width. Content remains in the same document order in every mode. Usage disclosures sit in a narrower column before the full-width closing invitation. The theme control is fixed at the lower right with a (44px) target; its preference survives reload through the existing site color-mode cookie.

**The Surface Scope Rule.** Carry the palette and interaction care to future homepage work; choose composition from each route's purpose. This homepage's centered opening, workbench, and ASCII ending are not mandatory structures for other pages.

## Elevation & Depth

Depth is quiet and local. The workbench has one broad blue-gray shadow, resource cards gain a small lift on hover, and the actual template screenshot has a restrained ambient shadow. There is no perspective staging in the current homepage. The decorative Silk field supplies atmosphere behind the opening and fades away before the later reading sections.

### Shadow Vocabulary

- **Workbench:** `0 26px 60px -28px #254f7440` beneath the main resource panel.
- **Resource hover:** `0 15px 25px -15px #254f7455` with an upward movement of (5px).
- **Template preview:** `0 20px 44px -22px #254f7440`, with an upward movement of (4px) on hover.
- **Selected template:** `0 3px 10px -4px #18365030` beneath the selected segment.
- **Theme control:** `0 6px 24px -7px #16385666` beneath the floating appearance button.

Magnetic feedback is limited to the two opening actions and uses a short (0.22s) return. Resource and template hover responses use (0.35s) and (0.5s). These use `cubic-bezier(.16,1,.3,1)`. Reduced motion disables translations, transitions, and pointer effects, freezes both decorative fields, and retains native reading order. The canvas work pauses in hidden tabs and outside its visible region; required content is server-rendered independently.

## Shapes

Rounded rectangles establish the hierarchy: hero, large closing field, reading panels, then controls and cards. The desktop radii are named in the frontmatter. Mobile tightens the hero to (20px) and closing to (18px). Resource categories and template segments remain pills; search and appearance triggers are circular. Fine dividers and underlined fields keep the workbench precise. Thin inline SVG arrows and utility icons support labels without becoming decoration.

## Components

### Opening actions and navigation

The opening pairs a filled Ink action to `/resources` with a Panel action to `/community`. Both are real links with (50px) minimum height, becoming (48px) on mobile. Primary hover uses Action Blue; secondary hover uses Soft Blue Surface. They retain a visible (2px) focus outline with (5px) offset. Product-region controls inherit the Ink outline; opening and appearance controls use Focus Blue. The shared navigation keeps its existing destinations, account behavior, locale menu, and outlined V; its homepage-only colors follow the current appearance.

### Resource workbench, tabs, and search

The workbench contains existing product controls rather than a simulated dashboard. Categories are real tabs with (44px) minimum height and arrow/Home/End keyboard navigation. The active tab uses an Ink fill and Paper text, including the dark-mode mapping. The search trigger opens and focuses an underlined field; Escape or close clears the query and returns focus. Search remains bounded to the active featured group, keeps the query on group changes, and offers the full directory. An unmatched search has a truthful empty state and clear action. Mobile input text uses (16px).

Visual resource cards use actual catalog screenshots, descriptions, and source/license metadata. Reading categories use image-free Soft Surface cards. Each complete card links to its actual destination; external links retain `noopener noreferrer`. The selected group contains at most three records, not a fabricated catalog count.

### Community reading panel

A compact Panel reading area sits beside open section copy. It consumes the qualified public feed and can show at most two actual records. Empty and unavailable reads have distinct messages and real community/submission links. The reviewed site has no public posts; this remains a product state, not a place for sample testimonials or invented activity. Publishing behavior remains unchanged.

### Built-in template comparison

Two pill tabs switch the actual editorial and résumé screenshots and corresponding full-example links. The selected segment is a raised Panel on Soft Surface. The caption identifies fictional example creators; the examples render through the site's real template factory and do not imply public member accounts. Existing [editorial](public/media/home-product/space-editorial.webp.json) and [résumé](public/media/home-product/space-resume.webp.json) provenance records remain authoritative. Their source colors and internal layouts stay separate from this homepage system.

### Usage disclosures

Native `details` / `summary` rows use fine bottom rules and a plus icon that rotates when open. Keyboard focus and open state remain native. Answers explain source/license, publishing, and template behavior without introducing a new flow.

### Flowing atmosphere and ASCII closing

The opening embeds the licensed open React Bits Silk component with homepage-specific parameters, a static color fallback, and pixel ratio capped at (1). The closing is an original Canvas character field behind readable text and links, followed by the large IAVSE signature. Its drawing is bounded to about (28fps) with pixel ratio capped at (1.5). Both canvases are decorative and hidden from assistive technology. No paid template source, sample metrics, portraits, or demo claims are included. Reduced motion freezes the fields; no WebGL leaves the complete product content on the blue fallback ground.

## Do's and Don'ts

### Do:

- **Do** scope these tokens and compositions to the homepage; preserve the independent rules of resources, community, blog galleries, account, and admin routes.
- **Do** keep the outlined V, IAVSE blue identity, English mission, real links, and readable content above decorative fields.
- **Do** preserve dark-hero contrast, visible focus, native scrolling, persisted appearance, and reduced-motion behavior.
- **Do** retain actual catalog sources/licenses, qualified public-feed states, and labeled fictional built-in template examples.
- **Do** distinguish the licensed open Silk component, original ASCII work, and reference-only Pro templates in provenance.

### Don't:

- **Don't** restore the discarded glass opening or spatial chapter stage as a current homepage requirement.
- **Don't** turn this homepage composition or the fonts inside screenshots into a template for every route.
- **Don't** make decorative motion necessary to read, navigate, search, or publish.
- **Don't** invent public posts, customers, testimonials, user totals, engagement figures, or broader third-party reuse rights.
- **Don't** bundle paid Pro template source or present this implementation as an exact reproduction of the reference sites.
