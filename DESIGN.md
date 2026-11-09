---
name: IAVSE Homepage Product Presentation
description: A light, source-led presentation for community exchange, resource discovery, and personal work.
colors:
  ink: "#1d1d1f"
  body: "#626269"
  line: "#dedee3"
  surface: "#f5f5f7"
  paper: "#fff"
  quiet-line: "#e9e9ed"
typography:
  display:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif'
    fontSize: "clamp(42px, 4.7vw, 66px)"
    fontWeight: 600
    lineHeight: 1.17
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif'
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif'
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.9
  compact-body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif'
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  surface: "16px"
  pill: "999px"
  spatial-stage: "0px"
  spatial-panel: "22px"
spacing:
  compact: "8px"
  control: "12px"
  small: "16px"
  medium: "20px"
  content: "24px"
  roomy: "32px"
  gutter: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 23px"
  button-primary-hover:
    backgroundColor: "#3c3c3f"
    textColor: "{colors.paper}"
  link-secondary:
    textColor: "{colors.ink}"
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
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
  search-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "8px"
  template-tab:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
  template-tab-selected:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
---

# Design System: IAVSE Homepage Product Presentation

## Overview

**Creative North Star: "Light Apple Spatial Showroom"**

The user-selected Apple-like direction becomes a light spatial showroom within the approved opening’s continuous blue-silver optical environment. Resource discovery, community exchange, and blog spaces share one perspective camera. Native document scrolling moves the current surface into focus while neighboring surfaces recede with clear separation. Black chapter controls remain fixed in place. System typography and actual product content stay readable in the foreground.

This document governs only `.home-experience`, from the first product section below the approved blue opening through the final invitation. It does not redefine the shared navigation, outlined V mark, blue glass opening, account flows, other pages, or the visual identities inside resource and template screenshots. The outlined V remains the shared identity asset described in [PRODUCT.md](PRODUCT.md), outside this boundary.

Ground truth is [home-experience.css](src/app/home-experience.css), [HomeProductShowcase.tsx](src/components/HomeProductShowcase.tsx), [HomeResourceExplorer.tsx](src/components/HomeResourceExplorer.tsx), [HomeSpacePreview.tsx](src/components/HomeSpacePreview.tsx), and [home-experience.mjs](src/lib/home-experience.mjs). [PlatformHome.tsx](src/components/PlatformHome.tsx) establishes the protected opening before this boundary; [the direction contract](docs/home-product-redesign.md) explains the approved scope. The spatial layout extends this boundary in place; this document describes the implemented artifact.

**Key Characteristics:**

- A continuous blue-silver environment, pale reading surfaces, dark text, and black primary actions.
- Generous section spacing with distinct resource, community, and template compositions.
- Rounded controls and restrained surface corners; separated product planes establish depth without obscuring foreground text.
- Real catalog records, qualified public content, and visibly identified fictional template examples.

## Colors

The palette is neutral and slightly cool; the primary action uses the same dark ink as headings rather than introducing a separate brand accent.

The sidecar's eight-step OKLCH tonal strips are synthesized panel previews, not additional runtime palette tokens.

### Primary

- **Ink** (`colors.ink`): headings, black primary actions, selected resource tabs, arrows, and keyboard focus outlines.

### Neutral

- **Body Gray** (`colors.body`): supporting copy, inactive tabs, metadata, and screenshot captions.
- **Paper** (`colors.paper`): reading surfaces, search fields, and the selected template tab. The presentation itself is transparent so the existing optical environment remains visible.
- **Soft Surface** (`colors.surface`): resource cards, community section field, search trigger, and template switcher track.
- **Divider Gray** (`colors.line`): resource toolbar, reading-card borders, search underline, and usage-note separators.
- **Quiet Divider** (`colors.quiet-line`): community panel header and public-post separators.

**The Black Action Rule.** Within this boundary, primary actions and selected resource categories use Ink; blue belongs to the separately approved opening, not these action states.

**The Source Color Rule.** Colors inside actual catalog and template screenshots belong to the depicted source; they do not expand this presentation's token palette.

## Typography

**Display Font:** the system stack in the frontmatter, beginning with the Apple system font and including PingFang SC for Chinese.

**Body Font:** the same system stack. There is no separate display family, imported webfont, or mono voice in this boundary.

**Character:** Clear, restrained, and direct. Weight and scale carry hierarchy; generous line height keeps Chinese, English, and Japanese supporting copy readable.

### Hierarchy

- **Display:** the opening product statement uses the `display` role, split into explicit lines. At the mobile breakpoint it becomes (42px / 1.2), then (36px) below (359px).
- **Headline:** the current product-space heading uses (23px / 1.35) in the spatial stage and (26px) in document flow. The closing invitation retains its observed desktop range (34–48px / 1.3) and mobile size (32px).
- **Title:** visual resource cards use `title`. Reading-oriented cards enlarge their titles to (24px); visual card titles become (18px) on mobile.
- **Body:** section descriptions use `body`, generally limited to (32–36ch) on desktop. The discovery introduction uses (17px / 1.9), becoming (15px) on mobile. Compact resource and community summaries use the `compact-body` role; visual resource summaries begin at (13px).
- **Label:** tabs and supporting actions use `label`, with control-specific line height where implemented. Sources and captions use smaller supporting text (11–12px), increasing to (12px) on mobile.

**The Heading Line Rule.** Preserve the authored heading line groups and tight tracking; supporting prose wraps naturally within its measured width.

## Layout

The centered-width introduction sits directly in the shared optical environment and leads into `.hs-journey`, a three-chapter product stage. On viewports at least 1100px wide and 900px tall, with no reduced-motion preference, the journey occupies 270svh (minimum 2250px). Its shell sticks 86px from the viewport top. The open stage spans the viewport without a separate background box; its visible window is at most 710px tall, bounded by the available viewport height.

All three product surfaces have the same width: min(930px, viewport width minus 350px). Their horizontal distance is one surface width plus 96px, preserving a real gap. The selected surface starts 24px below the stage top and is aligned to whole pixels. Resource, community and space controls keep their actual behavior inside that surface. The blog preview shrinks on shorter spatial viewports so every action remains visible. The spatial community view shows the newest public post when present; the full-flow version can show two. Empty and unavailable states remain truthful.

The chapter navigation has three fixed-position pill controls. Scrolling selects the nearest chapter from cached document geometry; the page never captures wheel input or substitutes its own scrolling. The native previous/next actions and keyboard arrows/Home/End reach the same three chapters. Only the current surface is interactive; inactive surfaces use `inert` and `aria-hidden`.

Below 1100px width or 900px height, before enhancement, in reduced-motion mode, and when printing, every chapter remains in normal reading order. There is no fixed-length scroll journey or perspective transform in this fallback. The mobile chapter navigation and underlying resource controls retain touch targets of at least 44px. The original compact resource, source metadata, template screenshot, disclosure and closing-action patterns remain in use.

## Elevation & Depth

The stage uses the opening’s existing WebGL optical environment and a CSS perspective distance of 1800px. The outer journey registers as `data-home-story="products"`, using stable document bounds rather than the moving product planes. The existing renderer transitions from the glass opening into blue-silver refracted daylight; no second canvas or independent gray ground is introduced. The active surface has no blur or depth scale; its top and left positions are pixel-aligned for clear text. Neighboring surfaces recede by 130px and turn by 10 degrees per chapter offset, with slight blur and reduced opacity. They stay outside the foreground surface instead of crossing over its content. Near-white surfaces at 95% opacity, a fine top highlight, and soft blue-gray downward shadows connect the reading planes to the same light. There is no separate floor-shadow layer. The foreground remains unblurred and controls stay black.

Camera transitions use 0.7s transform easing, with 0.5s opacity and blur transitions. Scrolling within a chapter updates only a small progress transform. Reduced motion removes the spatial presentation and transitions, exposing the full readable document. Actual template screenshots keep their existing modest preview shadow.

## Shapes

Controls use the pill radius; search triggers are circular (44px). Resource cards, search-empty panels, and template screenshots use the surface radius. The community reading panel has a slightly larger observed corner (20px). Fields and usage notes remain straight and understated, with bottom dividers rather than inset rounded boxes. Images clip to their parent surface. Thin SVG strokes, usually (19px) with stroke width (1.6), support labels without becoming decorations.

## Components

### Buttons

Confident and compact. Primary links are black pills with white text, (48px) minimum height, (14px / 1.6) text at weight (500), and a (14px) gap to a line-arrow icon. Hover changes only the background to the frontmatter's primary-hover variant over (0.2s). Secondary actions are dark text with an arrow, (48px) minimum height, and no filled container; hover underlines them on hover-capable devices. All interactive controls receive the same visible keyboard outline (2px Ink, offset 5px).

### Resource tabs and search

Resource categories behave as a real tab list. Inactive tabs are transparent gray-text pills; selection fills the pill with Ink and uses white text. Controls have (44px) minimum height. Arrow keys cycle categories; Home and End select the first or last tab, and focus moves with selection.

The circular search trigger reveals an underlined field with a short (0.2s ease-out) fade and horizontal reveal. Opening focuses the input. Escape or the close control clears the query, closes the field, and returns focus to the trigger. Search is case-insensitive across title, summary, and source, restricted to the active featured group. A query remains active when changing groups; the footer names the selection and offers the full category directory. No match produces an explicit empty state and clear-search action. On mobile, the open input uses (16px) text and fills the toolbar width. Reduced-motion preference removes the reveal and transitions.

### Cards / Containers

Visual resource cards place real catalog screenshots above title, description, and source/license text on Soft Surface. Titles underline on hover. Reading-oriented categories use white bordered cards without images and allow longer summaries. The full card links to the actual resource, skill, document, or website; external URLs open with `noopener noreferrer`. Resource selection is bounded to three records per group, not a full-directory search.

The community product surface contains a soft-gray reading area within its white spatial pane. The panel header has a quiet separator. Public content is drawn from the qualified public feed, limited to two records; spatial mode displays the latest record and normal document flow can display both. The reviewed state has zero public posts and explicitly says so; an unavailable read has separate copy and a community link. Neither state is replaced with invented activity, engagement figures, or sample public posts. Publishing actions retain the existing submission workflow.

### Built-in template comparison

The two-option pill track uses a white selected segment, the small control shadow, and real tab keyboard behavior. It changes the displayed editorial or résumé screenshot and both full-example links. The large image links to the corresponding existing showcase with `?template=builtin`; the caption identifies fictional creators and actual built-in template screenshots. The screenshot is a product preview, not a customer testimonial or evidence of a public user account.

Shipping rasters are [space-editorial.webp](public/media/home-product/space-editorial.webp) and [space-resume.webp](public/media/home-product/space-resume.webp), each captured at (1280 × 860). Adjacent [editorial provenance](public/media/home-product/space-editorial.webp.json) and [résumé provenance](public/media/home-product/space-resume.webp.json) record their source routes (`/blogs/showcase/lin-studio?embed=gallery` and `/blogs/showcase/leo-park?embed=gallery`), fictional sample content, and rendering through `src/lib/blog-showcase.mjs` and `BlogTheme`. They are actual project screenshots, with no stock asset or generated interface. Resource screenshots come from the existing template-library records and retain their recorded source/license context.

### Usage disclosures

Native `details` / `summary` rows use fine bottom separators, text labels, and a plus SVG that rotates into a close mark while open. Answers remain gray, readable text. This is the presentation's disclosure pattern for source/license, publication, and template explanations; the shared navigation is outside the documented component set.

The spatial presentation was checked in an actual browser at 1671 × 959 and 1100 × 900, including all three focused surfaces. Normal reading flow was checked at 1100 × 850, 390 × 844, and 320 × 780, plus reduced-motion mode. The continuous environment was also checked at 2048 × 978 and 390 × 844, with keyboard chapter navigation and reduced-motion fallback. Local verification captures are not shipping media or approved image comps.

## Do's and Don'ts

### Do:

- **Do** keep this system scoped to the product presentation below the approved opening.
- **Do** pair black primary actions with quieter text actions and visible keyboard focus.
- **Do** preserve source/license metadata, bounded-search wording, truthful empty states, and the fictional-template caption.
- **Do** use actual catalog records and built-in template screenshots, with provenance beside shipping preview rasters.
- **Do** retain working tabs, full-directory routes, native disclosures, and the mobile stacking behavior.

### Don't:

- **Don't** recolor the protected blue opening or shared navigation from this document.
- **Don't** introduce blue primary actions into this neutral product presentation.
- **Don't** turn screenshot colors, fonts, sample people, or internal template layouts into presentation-system primitives.
- **Don't** invent public posts, customer claims, testimonials, user totals, engagement figures, or broader third-party reuse rights.
- **Don't** replace the distinct section compositions with repeated framed browser windows or add shadows to every surface.

## Spatial Implementation

Ground truth for the spatial enhancement is [HomeSpatialShowcase.tsx](src/components/HomeSpatialShowcase.tsx), [home-spatial.css](src/app/home-spatial.css), and [home-spatial.mjs](src/lib/home-spatial.mjs). Resize observation caches stage geometry; scroll work is coalesced into one animation frame. Navigation listeners, resize observation and pending work are released on unmount. No new raster, font, video, or third-party runtime is required by the spatial effect.
