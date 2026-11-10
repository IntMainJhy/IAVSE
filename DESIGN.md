---
name: "IAVSE"
description: "An expressive purple-white home for discovering resources, sharing practice and publishing work."
colors:
  background: "#ffffff"
  foreground: "#241c35"
  body: "#665d76"
  purple: "#7446d9"
  purple-deep: "#6433c7"
  border: "#e8e0f0"
  soft: "#f3edfd"
  selection: "#e1d1ff"
  selection-foreground: "#352055"
  navigation: "transparent"
  navigation-foreground: "#242424"
  legacy-canvas: "#f7f9fc"
  legacy-background: "#ffffff"
  legacy-foreground: "#172b3a"
  legacy-secondary: "#4d6171"
  legacy-subtle: "#607180"
  legacy-muted: "#eef3f7"
  legacy-border: "#dce5ed"
  legacy-focus: "#1266a4"
  legacy-sky: "#e5f2fb"
  legacy-sage: "#e9f3ee"
  legacy-warm: "#fff2e7"
  legacy-selection: "#d6eafb"
  legacy-dark-canvas: "#0b141e"
  legacy-dark-background: "#111e2b"
  legacy-dark-foreground: "#edf5fc"
  legacy-dark-secondary: "#b8c6d3"
  legacy-dark-subtle: "#9cafbf"
  legacy-dark-muted: "#182b3b"
  legacy-dark-border: "#2b4255"
  legacy-dark-focus: "#86c9ef"
  legacy-dark-sky: "#163448"
  legacy-dark-sage: "#203d35"
  legacy-dark-warm: "#3b3029"
  legacy-dark-selection: "#284e67"
  legacy-success: "#21613d"
  legacy-error: "#b42318"
  legacy-dark-success: "#83d4a1"
  legacy-dark-error: "#ffb4ab"
typography:
  display:
    fontFamily: '"IAVSE Display", "Songti SC", serif'
    fontSize: "clamp(44px, 4.5vw, 60px)"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  wordmark:
    fontFamily: '"IAVSE Wordmark", Georgia, serif'
    fontSize: "33px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.025em"
  section-heading:
    fontFamily: '"IAVSE Display", "Songti SC", serif'
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  body:
    fontFamily: '"IAVSE Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  introduction:
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.8
  card-title:
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.55
  card-body:
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  action:
    fontSize: "15px"
    fontWeight: 500
  label:
    fontSize: "14px"
    fontWeight: 400
  metadata:
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  legacy-application-body:
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  legacy-application-heading:
    fontSize: "clamp(32px, 3.2vw, 44px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.025em"
rounded:
  preview: "10px"
  control: "12px"
  menu: "14px"
  card: "16px"
  legacy-card: "20px"
  pill: "999px"
spacing:
  action-gap: "12px"
  gutter-mobile: "16px"
  feed-gap: "20px"
  card-inset-mobile: "21px"
  card-inset-block: "23px"
  card-inset-inline: "26px"
  board-gap: "26px"
  space-inset: "28px"
  gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.background}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "11px 23px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.purple-deep}"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "11px 23px"
    height: "48px"
  navigation:
    backgroundColor: "{colors.navigation}"
    textColor: "{colors.navigation-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "9px 13px 9px 24px"
    height: "68px"
  community-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "23px 26px"
  filter-pill:
    backgroundColor: "{colors.navigation}"
    textColor: "{colors.body}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
    height: "40px"
  filter-pill-selected:
    backgroundColor: "{colors.background}"
    textColor: "{colors.purple-deep}"
  space-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "28px"
  legacy-application-input:
    backgroundColor: "{colors.legacy-background}"
    textColor: "{colors.legacy-foreground}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
    height: "44px"
  legacy-application-button:
    backgroundColor: "{colors.legacy-foreground}"
    textColor: "{colors.legacy-background}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "42px"
  legacy-application-card:
    backgroundColor: "{colors.legacy-background}"
    textColor: "{colors.legacy-foreground}"
    rounded: "{rounded.legacy-card}"
---

# Design System: IAVSE

## Overview

**Creative North Star: "Light, expressive purple-white"**

The user approved a new purple-white visual world and its centered opening with a community board on 2026-11-10, then instructed that it be applied. White space, artistic display type, gentle purple gradients and floating white cards give discovery and sharing an expressive, readable home. After trying the background, the user explicitly selected the original soft mist rather than the stronger ribbon variation, then clarified that the mist should flow on both sides with a white center.

This is the current visual specification, with an explicit implementation boundary: the new world is implemented on the homepage; other functional pages retain their existing IAVSE foundation until they are migrated deliberately. Homepage tokens are implemented by [the landing stylesheet](src/app/iavse-landing.css) and [landing components](src/components/landing/IavseLanding.tsx). Tokens prefixed `legacy-` document the existing functional-page foundation in [iavse-system.css](src/app/iavse-system.css), [the scoped template input](src/styles/rbp-template.input.css) and [the host bridge](src/app/rbp-bridge.css). They are scoped implementation facts, not a second homepage direction. The [homepage brief](.impeccable/surfaces/src-components-homeproductshowcase-tsx.md) owns its composition.

The earlier application baseline retains its [RBP Portfolio source attribution](docs/portfolio-frontend.md), pinned at `1581b9b8e5876f60e5eb844970747506980c4412`. The new homepage and its analytic background are independently authored public website code; they do not revive the cancelled Cloudlight migration or incorporate private Pro materials. [PRODUCT.md](PRODUCT.md) owns business, permission and license boundaries. Authored blog themes, canvas documents, uploaded images and third-party previews keep their own appearance and rights.

**Key Characteristics:**

- A white homepage with purple actions, deep plum text, soft mist on both sides and a white center.
- Artistic licensed display and wordmark faces paired with readable Geist body text.
- Transparent, uncolored navigation with the original brand at left and real account state at right.
- White floating content cards, fine-pointer response and bounded viewport entry.
- Explicit legacy scope for functional pages pending gradual migration.
- Truthful public content, labeled examples and accessible motion fallbacks.

## Colors

The homepage palette uses purple for actions and focus while keeping the page predominantly white. The frontmatter owns the actual token values.

### Primary

- **Purple / Deep Purple:** filled actions, focus outlines, selected filter text and destination links. The deeper role is the primary action's hover fill.
- **Legacy Focus Blue / Success / Error:** existing functional-page focus and feedback roles, with their recorded dark variants. They do not recolor the new homepage.

### Secondary

- **Soft Purple:** small icon grounds and supporting surfaces. The decorative WebGL and CSS gradients have their own mixed purple colors; changing an action token does not automatically recolor them.
- **Legacy Sky / Sage / Warm:** retained grouping colors on existing functional and Portfolio-based pages.

### Neutral

- **White / Plum Foreground / Muted Body:** page and card grounds, headings and supporting text.
- **Border / Selection:** quiet separators and a readable purple selection pair.
- **Transparent Navigation / Neutral Navigation Foreground:** the header has no background fill and no backdrop blur; its neutral text and fine border remain readable above the top white clearance.
- **Legacy roles:** existing blue-gray light and dark foundations remain limited to pages that still use them. The homepage explicitly uses a light color scheme.

**The Transparent Header Rule.** Keep the homepage header uncolored and transparent, without a frosted layer; its white appearance comes from the page below it.

**The Source Identity Rule.** Keep source previews and authored work recognizable and attributed. A template fallback must remain visibly labeled as a fictional example.

## Typography

**Display Font:** self-hosted ZCOOL XiaoWei (站酷小薇), declared as `IAVSE Display`, with Songti and serif fallbacks. **Wordmark Font:** self-hosted Cormorant Garamond, declared as `IAVSE Wordmark`, with Georgia and serif fallbacks. **Body Font:** self-hosted Geist, declared as `IAVSE Sans`, with system and CJK fallbacks. These are application aliases, not claims of original font authorship. Preserve their [ZCOOL XiaoWei](public/fonts/zcoolxiaowei-OFL.txt), [Cormorant Garamond](public/fonts/CormorantGaramond-OFL.txt) and [Geist](public/fonts/design-artifacts/voltagent/geist-OFL.txt) SIL OFL notices.

The display face gives Chinese headings a literary character; the Cormorant wordmark supports the existing outlined V without changing its geometry. English hero text uses Cormorant at weight (500), with a clamp of (44px, 4.7vw, 62px); Japanese uses the available Songti / Yu Mincho serif stack with a clamp of (36px, 3.7vw, 50px). The default display grows to (66px) at the wide breakpoint. Mobile uses (40px / 1.4), English (42px) and Japanese (32px); the narrowest default title becomes (35px). Section headings become (28px) on mobile. The wordmark becomes (28px), then (25px) at the narrowest breakpoint.

Feature titles use the card-title role; discussion titles use (18px), becoming (17px) on mobile. Feature titles become (19px) on mobile. Supporting card copy is clamped to two lines; author names truncate within the available width. Hero introduction becomes (14px) with a (27ch) maximum on mobile. Existing functional pages retain their application hierarchy and input labels.

**The Readable Hierarchy Rule.** Verify Chinese, English and Japanese wrapping at the actual viewport width; keep body copy and compact metadata distinct from artistic headings.

## Layout

The homepage follows **centered hero → community filters and content with a resource sidebar → public-space horizontal card → footer**. This sequence belongs to the homepage brief, not every future page. The header is sticky, with brand at left, community/resources/blog-space links in the center and real account controls at right. It sits (20px) from the top, or (12px) on mobile. The root rem base remains (16px); the homepage uses native scrolling rather than the retained Portfolio Lenis enhancement.

The main container is at most (1120px), with (40px) side gutters; at a minimum width of (1500px), it grows to (1240px) with (50px) gutters. At or below (900px), gutters become (24px); at or below (650px), they become (16px). The desktop board uses a (2:1) content/sidebar grid, with a sidebar minimum of (280px) and a (26px) gap. The intermediate grid uses (1.7:1), a (240px) sidebar minimum and a (20px) gap. Mobile stacks the sidebar after content, with a (22px) gap, and lays out its four resource links in two columns.

The hero has (62px) top and (50px) bottom padding, expands to (76px / 62px) on wide screens and uses (43px / 35px) on mobile. The public-space card has a (190px) preview column, flexible copy and a destination link; it reduces to two columns at the intermediate breakpoint and one on mobile. Mobile navigation uses a native details menu, closes on outside pointer input or Escape, and returns focus to its trigger on Escape.

Existing functional layouts retain their working structure: resource containers use the current (1180px) maximum, administration uses its sidebar and (1440px) maximum, community keeps mobile navigation, and editors keep their working toolbars. The retained Portfolio capsule and page atmosphere belong to eligible non-home routes. Migration must preserve search, publishing, accounts, moderation and editor behavior.

## Elevation & Depth

The homepage combines a softly varying purple field with floating white cards and subtle pointer highlights. The user explicitly selected the original soft mist, then requested it on both sides with a white center. Its original analytic WebGL shader evaluates `mist` separately from each side, with different phases and vertical domains. Each uses domain-warped `sheetA` / `sheetB` and `opening`; soft side anchors preserve the two-sided composition on desktop and mobile. The time multiplier remains (0.065), with gentle pointer deformation. It is an approximation of flowing color, not a physical fluid solver. Preserve broad soft color regions, gentle boundaries and central white space; stronger, high-contrast rolling ribbons are not an acceptance requirement. The [background implementation note](docs/purple-landing-background.zh-CN.md) records its mechanism and limits.

The decorative backdrop is (1000px) tall, or (1120px) on mobile. Its first approximately (100px) remain white, colors appear gradually through (320px), and the bottom fades into white. The header has a fine neutral border and its observed shadow (`0 7px 25px -12px rgb(0 0 0 / .12), inset 0 1px 0 rgb(255 255 255 / .6)`), while its background stays transparent. Card rest uses (`0 14px 38px -10px rgb(77 43 125 / .14)`). Fine-pointer hover lifts cards by (6px), with (`0 27px 55px -12px rgb(77 43 125 / .23)`) over (260ms); the local radial highlight follows the pointer. Feature images scale to (1.025) over (350ms). Primary actions lift by (2px), with their purple shadow deepening over (180ms). Exact action, filter and menu shadows are in the sidecar.

Homepage Scroll Reveal runs once on first viewport entry: opacity (0 → 1), upward travel (24px → 0), duration (650ms), easing (`cubic-bezier(.22,1,.36,1)`), threshold (0.1), and observer-batch stagger (70ms), capped at (210ms). Keyboard focus cancels a pending reveal. Content remains present without the observer, animation API or JavaScript; no persistent hidden state is required. Reduced motion cancels reveals, transitions, hover transforms and pointer tracking. The background draws a static frame, fixes time and clears pointer motion; a hidden tab or offscreen background pauses frame work. WebGL failure or context loss leaves the static purple-white CSS gradient. Touch input retains automatic atmosphere and native scrolling.

The legacy foundation retains its existing card rest shadow (`0 3px 12px -9px #173c5f36`), functional dialogs, light/dark roles and route-specific animation. Those details do not override homepage values.

## Shapes

The homepage uses content-card corners (16px), compact action corners (12px), preview corners (10px), menu corners (14px) and fully rounded filters/header (999px). Card-content padding is (23px 26px), becoming (21px) on mobile; the public-space card uses (28px), becoming (23px). Circles are reserved for avatars and compact discussion marks. Functional pages keep their current (20px) cards and (12px) controls until migrated.

## Components

### Navigation and account identity

Keep the original outlined V with the licensed IAVSE wordmark. Desktop links lead to real community, resource and blog-space routes. `AuthNav` supplies actual account state; signed-in users receive the existing account menu/avatar, and guests retain working login/account destinations. The header itself is transparent with no blur. Account and mobile dropdown panels are separate white surfaces. Language selection remains in the footer. Homepage keyboard focus uses a (3px) purple outline with a (5px) offset.

### Actions and filters

The primary hero link opens the community; the white secondary link opens resources. Their minimum height is (48px), becoming (45px) on mobile. Pressed actions scale to (0.98) unless reduced motion is requested. The three community filters use real buttons and `aria-pressed`; the selected white pill receives a small shadow and deep-purple text. Filtered content announces updates politely. No homepage input component has been added: the input token and sidecar example describe only the existing functional-page field, with its (1px) border, (44px) minimum height, (14px) type and legacy focus treatment.

### Community board and resource rail

The server passes a bounded DTO, not raw source records. It includes up to four qualified public posts and up to three public projects from at most four discoverable public spaces. Discover mode shows the first work (or first post) with the available discussion entry; the Work and Discussions filters expose their respective bounded lists. Author identity and comment counts come from real content. Missing covers use a decorative branded ground; missing or unavailable content uses the actual empty/unavailable state and working destinations, including retry where offered. Never fabricate activity to fill a card.

The resource sidebar links to the existing UI design, AI Skill, documentation and website/tool categories. Its note directs readers to original source and license details. The layout does not imply universal reuse rights or endorsement.

### Public-space card and footer

The first qualified discoverable space supplies the horizontal card, public label and real `/blog/:handle` destination. When no space exists, the existing built-in template screenshot is visibly labeled **“内置模板预览 · 虚构人物”** (localized in English/Japanese) and links to the blog directory. It is not a member record. Footer links preserve About, repository, privacy, account and locale destinations.

### Existing functional controls and authored content

Existing inputs, account flows, publishing permissions, administration controls and editor tools retain their behavior and legacy styling scope. Shared styling stops at authored blog roots, saved canvas blocks, personal homepages, authored themes and React Flow viewports. The platform return bar may use platform styling; authored work and third-party previews keep their own appearance. Private Pro code, assets, prompts and credentials remain outside the public repository and public build.

## Do's and Don'ts

- Do use the purple-white homepage tokens within the new homepage and keep legacy functional-page scope explicit.
- Do keep the homepage header transparent, uncolored and free of backdrop blur.
- Do preserve the user-selected soft mist on both sides, white center, top clearance and gentle pointer response.
- Do verify Chinese, English and Japanese hierarchy and wrapping on desktop and mobile.
- Do reveal content once over 650ms with 24px travel and cap 70ms staggering at 210ms; reveal keyboard-focused content immediately.
- Do retain real public content, meaningful empty states, labeled fictional examples and motion fallbacks.
- Don't describe the whole site or either complete dual-UI version as already migrated.
- Don't replace the accepted mist with a mandatory high-contrast ribbon or rolling-band standard.
- Don't apply the platform skin or entry animation inside authored work or third-party previews.
- Don't invent users, posts, endorsements or engagement totals to fill a layout.
- Don't import private Pro materials, revive the cancelled direct Cloudlight migration or expand any license.
- Don't claim authorship of Geist, Cormorant Garamond or ZCOOL XiaoWei; retain attribution and their existing licenses.
