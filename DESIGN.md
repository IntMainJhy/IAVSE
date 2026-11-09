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
    fontSize: "clamp(34px, 4vw, 54px)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.035em"
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

**Creative North Star: "Light Apple Product Presentation"**

The user-selected Apple-like direction becomes a quiet white and neutral-gray surface: large, tightly spaced headings, black actions, light controls, and actual product content. The system gives resources, public sharing, and personal work room to be understood without decorative interface chrome. System typography is an explicit part of this chosen direction.

This document governs only `.home-experience`, from the first product section below the approved blue opening through the final invitation. It does not redefine the shared navigation, outlined V mark, blue glass opening, account flows, other pages, or the visual identities inside resource and template screenshots. The outlined V remains the shared identity asset described in [PRODUCT.md](PRODUCT.md), outside this boundary.

Ground truth is [home-experience.css](src/app/home-experience.css), [HomeProductShowcase.tsx](src/components/HomeProductShowcase.tsx), [HomeResourceExplorer.tsx](src/components/HomeResourceExplorer.tsx), [HomeSpacePreview.tsx](src/components/HomeSpacePreview.tsx), and [home-experience.mjs](src/lib/home-experience.mjs). [PlatformHome.tsx](src/components/PlatformHome.tsx) establishes the protected opening before this boundary; [the direction contract](docs/home-product-redesign.md) explains the approved scope. The recorded review disposition is **ship**, with no requested fixes; this document describes the implemented artifact.

**Key Characteristics:**

- White and soft-gray fields, dark text, and black primary actions.
- Generous section spacing with distinct resource, community, and template compositions.
- Rounded controls and restrained surface corners; depth is reserved for the template preview and selected template control.
- Real catalog records, qualified public content, and visibly identified fictional template examples.

## Colors

The palette is neutral and slightly cool; the primary action uses the same dark ink as headings rather than introducing a separate brand accent.

The sidecar's eight-step OKLCH tonal strips are synthesized panel previews, not additional runtime palette tokens.

### Primary

- **Ink** (`colors.ink`): headings, black primary actions, selected resource tabs, arrows, and keyboard focus outlines.

### Neutral

- **Body Gray** (`colors.body`): supporting copy, inactive tabs, metadata, and screenshot captions.
- **Paper** (`colors.paper`): the presentation background, community reading panel, search field, and selected template tab.
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
- **Headline:** community and space headings use the `headline` role and explicit line spans. On mobile they become (35px / 1.28). The closing invitation has its own observed desktop range (34–48px / 1.3) and mobile size (32px).
- **Title:** visual resource cards use `title`. Reading-oriented cards enlarge their titles to (24px); visual card titles become (18px) on mobile.
- **Body:** section descriptions use `body`, generally limited to (32–36ch) on desktop. The discovery introduction uses (17px / 1.9), becoming (15px) on mobile. Compact resource and community summaries use the `compact-body` role; visual resource summaries begin at (13px).
- **Label:** tabs and supporting actions use `label`, with control-specific line height where implemented. Sources and captions use smaller supporting text (11–12px), increasing to (12px) on mobile.

**The Heading Line Rule.** Preserve the authored heading line groups and tight tracking; supporting prose wraps naturally within its measured width.

## Layout

The centered container is capped at (1280px), including horizontal padding. Desktop gutters are (48px), narrowing to (32px) at (1100px), (24px) at (767px), and (20px) below (359px). Repeated small spacing steps live in the frontmatter; section spacing deliberately extends beyond that compact scale.

The discovery section has (96px) above and (104px) below. Its introduction is a two-column grid (1.12fr / 1fr) with a (70px) gap; the resource shelf is a three-column grid with a (24px) gap. The community section is a full-width soft-gray band with (104px) vertical padding and an internal two-column grid (1fr / 1.12fr), separated by (90px). The space section reverses the emphasis toward the large preview (0.85fr / 1.2fr) with an (80px) gap and (116px / 90px) vertical padding. Usage notes narrow to (960px). The centered closing invitation has (116px / 110px) vertical padding.

At (1100px), gaps and card padding become tighter. At (850px), the discovery introduction stacks, the resource shelf remains three columns with (16px) gaps, and the space section becomes a single column with a preview capped at (720px). At (767px), resource cards and community columns stack; the shelf loses its desktop minimum height, open search uses the full toolbar width, metadata footers stack, and captions become vertical. Discovery padding becomes (64px / 70px), the community band (70px), space section (72px / 50px), and closing section (74px / 80px).

Actions wrap instead of overflowing. Resource titles and metadata can shrink or wrap inside their grid cells; visual summaries are limited to two lines and reading summaries to four. Catalog screenshots use a wide crop (1.6 ratio, 1.65 on mobile), while built-in template screenshots retain their captured (1280 / 860) ratio. Anchor offsets account for the existing shared navigation. Print removes search and template shadows and reduces section spacing.

**The Distinct Composition Rule.** Keep the resource shelf, community reading panel, and large template comparison visually distinct within this presentation; a repeated framed-browser treatment is not the established pattern.

## Elevation & Depth

The presentation is predominantly flat. White and soft-gray fields, fine dividers, screenshot crops, and generous separation establish depth. Resource cards and the community panel have no resting shadow. The two shadow treatments below are confined to the template comparison.

### Shadow Vocabulary

- **Selected template control** (`0 2px 8px #0000000d`): a small lift distinguishes the white selected segment from its gray track.
- **Template preview** (`0 16px 40px -22px #1d1d1f55`): restrained ambient lift beneath the actual template screenshot.

**The Quiet Depth Rule.** Use tonal separation for ordinary content surfaces; preserve the existing template-specific shadow roles rather than adding shadows to every card.

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

The community composition places explanatory copy beside a white reading panel on the gray band. The panel header has a quiet separator. Public content is drawn from the qualified public feed, limited to two entries. The reviewed state has zero public posts and explicitly says so; an unavailable read has separate copy and a community link. Neither state is replaced with invented activity, engagement figures, or sample public posts. Publishing actions retain the existing submission workflow.

### Built-in template comparison

The two-option pill track uses a white selected segment, the small control shadow, and real tab keyboard behavior. It changes the displayed editorial or résumé screenshot and both full-example links. The large image links to the corresponding existing showcase with `?template=builtin`; the caption identifies fictional creators and actual built-in template screenshots. The screenshot is a product preview, not a customer testimonial or evidence of a public user account.

Shipping rasters are [space-editorial.webp](public/media/home-product/space-editorial.webp) and [space-resume.webp](public/media/home-product/space-resume.webp), each captured at (1280 × 860). Adjacent [editorial provenance](public/media/home-product/space-editorial.webp.json) and [résumé provenance](public/media/home-product/space-resume.webp.json) record their source routes (`/blogs/showcase/lin-studio?embed=gallery` and `/blogs/showcase/leo-park?embed=gallery`), fictional sample content, and rendering through `src/lib/blog-showcase.mjs` and `BlogTheme`. They are actual project screenshots, with no stock asset or generated interface. Resource screenshots come from the existing template-library records and retain their recorded source/license context.

### Usage disclosures

Native `details` / `summary` rows use fine bottom separators, text labels, and a plus SVG that rotates into a close mark while open. Answers remain gray, readable text. This is the presentation's disclosure pattern for source/license, publication, and template explanations; the shared navigation is outside the documented component set.

The supplied review evidence is local, not shipping page media. Full captures: `.impeccable/review/desktop.png` (1425 × 4395), `mobile.png` (390 × 5466), and `user-1671.png` (1656 × 4354 raster for the named 1671px check). Section captures: `desktop-discover.png` (1425 × 973), `desktop-hx-community-title.png` (1425 × 597), `desktop-spaces.png` (1425 × 772), `mobile-discover.png` (390 × 1600), `mobile-hx-community-title.png` (390 × 905), and `mobile-spaces.png` (390 × 872), all under the same review directory. These nine captures are the reported finished-build review set; they are not an approved image comp or a generated visual-world study.

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
