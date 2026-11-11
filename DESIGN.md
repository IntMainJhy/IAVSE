---
name: IAVSE
description: White space, black functional controls, frosted navigation and soft purple mist across IAVSE platform surfaces.
colors:
  background: '#ffffff'
  foreground: '#19171c'
  secondary: '#5e5965'
  subtle: '#716b78'
  muted: '#f5f4f6'
  border: '#e8e5eb'
  focus: '#353039'
  selection: '#e8e6ec'
  home-foreground: '#202023'
  home-body: '#636369'
  home-action-hover: '#38383d'
  home-border: '#e9e9ed'
  home-soft: '#f4f4f6'
  home-selection: '#e6e6e9'
  home-selection-foreground: '#17171b'
  header-foreground: '#242424'
  header-muted: '#67676d'
  header-focus: '#303034'
  glass-header-high: rgb(255 255 255 / .86)
  glass-header-low: rgb(255 255 255 / .65)
  glass-track: rgb(230 230 235 / .27)
  glass-inactive: '#5b5b60'
  glass-selected: '#202022'
  glass-lens-high: rgb(255 255 255 / .76)
  glass-lens-low: rgb(255 255 255 / .47)
  mist-left: '#d4c3f1'
  mist-right: '#ddccf5'
  mist-soft: '#eee7fb'
  dark-canvas: '#17141c'
  dark-background: '#242029'
  dark-foreground: '#f5f2f8'
  dark-secondary: '#ccc5d3'
  dark-subtle: '#aaa1b4'
  dark-muted: '#302b36'
  dark-border: '#443b4d'
  dark-focus: '#e0d9e8'
  dark-selection: '#51475e'
  success: '#21613d'
  error: '#b42318'
  dark-success: '#83d4a1'
  dark-error: '#ffb4ab'
typography:
  display:
    fontFamily: '"IAVSE Display", "Songti SC", serif'
    fontSize: clamp(44px, 4.5vw, 60px)
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: -0.02em
  wordmark:
    fontFamily: '"IAVSE Wordmark", Georgia, serif'
    fontSize: 33px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -0.025em
  section-heading:
    fontFamily: '"IAVSE Display", "Songti SC", serif'
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: -0.01em
  body:
    fontFamily: '"IAVSE Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji",
      "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.7
  introduction:
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.8
  card-title:
    fontSize: 21px
    fontWeight: 600
    lineHeight: 1.55
  card-body:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.8
  action:
    fontSize: 15px
    fontWeight: 500
  label:
    fontSize: 14px
    fontWeight: 400
  metadata:
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  home-body:
    fontFamily: '"IAVSE Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji",
      "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
  application-heading:
    fontSize: 36px
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: -0.02em
  application-display:
    fontFamily: '"IAVSE Display", "Songti SC", serif'
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.4
  glass-label:
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
rounded:
  tool: 8px
  preview: 10px
  control: 12px
  card: 16px
  account-menu: 18px
  mobile-menu: 26px
  pill: 999px
spacing:
  glass-inset: 4px
  action-gap: 12px
  gutter-small: 16px
  feed-gap: 20px
  card-inset-mobile: 21px
  application-card-inset: 22px
  card-inset-block: 23px
  application-gap: 24px
  card-inset-inline: 26px
  board-gap: 26px
  space-inset: 28px
  gutter: 40px
components:
  button-primary:
    backgroundColor: '{colors.foreground}'
    textColor: '{colors.background}'
    rounded: '{rounded.control}'
    padding: 10px 16px
    height: 44px
  button-secondary:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.control}'
    padding: 10px 16px
    height: 44px
  home-button-primary:
    backgroundColor: '{colors.home-foreground}'
    textColor: '{colors.background}'
    typography: '{typography.action}'
    rounded: '{rounded.control}'
    padding: 11px 23px
    height: 48px
  home-button-primary-hover:
    backgroundColor: '{colors.home-action-hover}'
  home-button-secondary:
    backgroundColor: '{colors.background}'
    textColor: '{colors.home-foreground}'
    typography: '{typography.action}'
    rounded: '{rounded.control}'
    padding: 11px 23px
    height: 48px
  navigation:
    textColor: '{colors.header-foreground}'
    typography: '{typography.glass-label}'
    rounded: '{rounded.pill}'
    padding: 6px
  header-frame:
    backgroundColor: transparent
    textColor: '{colors.header-foreground}'
    typography: '{typography.label}'
    padding: 8px 0
    height: 70px
  glass-switch:
    backgroundColor: '{colors.glass-track}'
    textColor: '{colors.glass-inactive}'
    typography: '{typography.glass-label}'
    rounded: '{rounded.pill}'
    padding: 4px
  glass-switch-item:
    textColor: '{colors.glass-inactive}'
    rounded: '{rounded.pill}'
    padding: 9px 16px
    height: 42px
  glass-switch-selected:
    textColor: '{colors.glass-selected}'
  application-card:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.card}'
  community-card:
    backgroundColor: '{colors.background}'
    textColor: '{colors.home-foreground}'
    rounded: '{rounded.card}'
    padding: 23px 26px
  space-card:
    backgroundColor: '{colors.background}'
    textColor: '{colors.home-foreground}'
    rounded: '{rounded.card}'
    padding: 28px
  application-input:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.control}'
    padding: 10px 14px
    height: 44px
  filter-selected:
    backgroundColor: '{colors.muted}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.pill}'
---

# Design System: IAVSE

## Overview

**Creative North Star: "White space, black controls, purple mist"**

IAVSE pairs a white, spacious platform with black functional controls, licensed artistic headings, floating cards and naturally moving purple mist at both sides. The center stays quiet and white. The shared header has a transparent three-column frame: brand at left, a separately centered frosted navigation capsule, and real account state at right, outside the capsule. A travelling lens briefly enlarges the text beneath it. Purple belongs to decorative backgrounds; primary actions, selected labels, icons and links use neutral ink.

This specification records the implemented **shared visual migration**, not a claim that every page was rewritten. [The landing stylesheet](src/app/iavse-landing.css) owns homepage variants; [application styles](src/app/iavse-application.css), [glass controls](src/app/glass-controls.css) and [platform shell placement](src/app/iavse-shell.css) carry the shared world through existing functional layouts. The older [base integration](src/app/iavse-system.css) and [host bridge](src/app/rbp-bridge.css) remain implementation support; their superseded blue-gray palette is not a second current design direction. [Platform coverage and mechanisms](docs/platform-ui.zh-CN.md) record the actual route and content boundaries. The retained local homepage brief holds its task-specific composition decisions.

The earlier application baseline retains its [RBP Portfolio attribution](docs/portfolio-frontend.md), pinned at `1581b9b8e5876f60e5eb844970747506980c4412`. The shared glass controls and analytic mist are independently authored public website code. The user-provided fluid-glass reference was read only; its MIT license includes Commons Clause restrictions and must not be called plain MIT. No reference source or model is included in this implementation. [PRODUCT.md](PRODUCT.md) owns business, permission and license boundaries. Authored bodies, blog themes, canvas content and third-party previews retain their appearance and rights.

**Key Characteristics:**

- White space, black functional controls and soft purple mist at both sides, with a white center.
- Licensed ZCOOL XiaoWei headings, Cormorant wordmark and readable Geist body text.
- A centered frosted navigation capsule, with the original brand left and real account state right outside it.
- Sliding glass selection with local text magnification and one accessible interactive label layer.
- Floating white cards, fine-pointer hover and bounded viewport entry within existing workflows.
- Explicit route, authored-content, accessibility and source/license boundaries.

## Colors

The light platform uses neutral ink and white surfaces. Purple is reserved for the atmosphere and decorative background grounds; it is not a functional accent. The frontmatter owns the extracted values, including the small homepage/header variants used in the current CSS.

### Primary

- **Neutral Ink:** light-theme primary action fill, selected text, links and functional icons. Homepage and shared header ink variants reflect their actual scoped styles.
- **Neutral Focus:** visible keyboard focus for application, homepage and header contexts.
- **Success / Error:** existing semantic feedback roles, including dark variants. Destructive and feedback colors remain distinct from ordinary actions.

### Secondary

- **Mist Left / Right / Soft:** static background-fallback colors and the decorative purple world. The WebGL shader mixes its own colors; control tokens do not recolor it automatically.
- **Glass High / Low:** the white alpha stops used by the central navigation capsule, mobile menu trigger and lens. Their complete gradients, blur and shadows live in the sidecar because those properties do not fit frontmatter component tokens.

### Neutral

- **Background / Muted / Border:** white card grounds, quiet neutral insets and fine separators.
- **Secondary / Subtle:** readable supporting copy and metadata.
- **Glass Track / Inactive / Selected:** a neutral translucent switch track, muted labels and black selected labels.
- **Dark roles:** implemented functional-page counterparts invert neutral roles without introducing a purple functional accent. The current homepage and shared header keep their explicit light appearance.

**The Neutral Function Rule.** Use black neutral UI for primary actions, selected labels, links and icons in the light appearance; keep purple in decorative backgrounds and retain semantic feedback colors.

**The Frosted Navigation Rule.** Apply white translucent glass, blur and the bright fine edge to the central navigation capsule or mobile menu trigger. Keep the full header frame transparent, borderless and without a shadow; brand and account controls remain outside the capsule.

**The Source Identity Rule.** Keep authored work and source previews recognizable and attributed. Fictional template fallbacks must remain labeled.

## Typography

**Display Font:** self-hosted ZCOOL XiaoWei (站酷小薇), declared as `IAVSE Display`, with Songti and serif fallbacks. **Wordmark Font:** self-hosted Cormorant Garamond, declared as `IAVSE Wordmark`, with Georgia and serif fallbacks. **Body Font:** self-hosted Geist, declared as `IAVSE Sans`, with system and CJK fallbacks. These aliases do not claim typeface authorship. Preserve the [ZCOOL XiaoWei](public/fonts/zcoolxiaowei-OFL.txt), [Cormorant Garamond](public/fonts/CormorantGaramond-OFL.txt) and [Geist](public/fonts/design-artifacts/voltagent/geist-OFL.txt) SIL OFL notices.

Homepage display, introduction and card roles retain the centered opening's hierarchy. English hero text uses Cormorant at weight (500), with a clamp of (44px, 4.7vw, 62px); Japanese uses Songti / Yu Mincho with a clamp of (36px, 3.7vw, 50px). The default display reaches (66px) on wide screens. Mobile defaults to (40px / 1.4), English (42px) and Japanese (32px); the narrowest default title is (35px). Shared header wordmarks become (29px), then (26px) at the narrowest breakpoint.

Functional pages use the body and application heading roles. Catalog/workspace introductions use artistic headings (40px / 1.4), becoming (32px / 1.45) on mobile; operating section/card headings remain more compact. Directory introductions use (48px / 1.4), becoming (36px). Document reading text keeps its authored structure; the site-owned reader title uses (38px), becoming (31px), and its working measure is (72ch). Glass labels use (14px / 1.4), or compact (13px); mobile header labels may wrap to two balanced lines. The lens measures actual localized label boxes after resize and font loading.

**The Readable Hierarchy Rule.** Verify Chinese, English and Japanese at the real viewport width; local magnification must not replace readable base text or create duplicate accessible names.

## Layout

The homepage retains **centered hero → community filters/content with a resource sidebar → public-space horizontal card → footer**. This is its surface composition, not a requirement to turn operating pages into landing pages. The root runtime owns one persistent fixed header across Home and eligible public routes, preserving the header and travelling lens through navigation. The homepage keeps its local backdrop and reserves the header's actual responsive height: (72px) on desktop, (70px) at or below (940px), and (62px) at or below (650px). The shared capsule links to Home (`/`), Community, Resources, Blog spaces and About (`/about`); Home and About use the existing pages. Brand and real account state keep their working destinations.

The homepage/shared header width is at most (1120px) with (40px) gutters, growing to (1240px) with (50px) gutters from (1500px). At or below (900px), gutters become (24px), then (16px) below (650px). Header top offset is (20px), then (12px). Its transparent outer frame uses equal flexible side columns around an automatic center column (`minmax(0,1fr) auto minmax(0,1fr)`), so the desktop navigation capsule stays centered independently of brand/account widths. Desktop navigation starts at (941px); at (940px) and below, a compact native details-menu capsule occupies the same center column. Its five links form two columns and three rows, with About spanning the last row; brand and account stay separate at the sides. Outside-pointer, route/locale and Escape handling remain; Escape returns focus to the menu trigger. The homepage grid keeps its desktop (2:1) board/sidebar and stacks below (650px).

Functional page layouts stay task-oriented: the shared organic container uses (1240px) maximum width and (40px) insets, with route-specific catalog limits retained where present; mobile insets become (20px), then (16px) below (480px). Account settings use two columns and then one. Real login/registration forms use (480px / 560px) maximum widths and (34px) card padding, becoming (28px 22px) on mobile. The reader uses library/content/outline columns, hides the outline below (1100px), and stacks on mobile. Administration keeps its sidebar and (1440px) main maximum. Community keeps its mobile rail, search and compose workflow. Editor workspaces keep their toolbars and canvas controls. The 404 page uses the platform PublicFrame and a raised return-home card.

Route guards preserve authored blog pages, built-in showcase previews and resource-design preview pages. Administration receives the atmosphere and migrated site controls without a second public header. The blog editor workspace keeps its own working chrome and does not receive the public header or atmosphere. Only the narrow IAVSE return bar/footer on authored pages is platform chrome. The [coverage table](docs/platform-ui.zh-CN.md) defines these boundaries. Shared runtime no longer mounts the old Portfolio capsule, PageBackdrop or Lenis enhancer.

## Elevation & Depth

The mist uses independently phased left/right `mist` fields, soft side anchors, domain-warped `sheetA` / `sheetB` and `opening`, with time multiplier (0.12). Both sides change shape naturally while the center stays white; top clearance begins with approximately (100px) of white and fades into color through (320px). It is an analytic approximation of flowing color, not a physical fluid solver. The homepage backdrop is (1000px), other platform shells (1100px), and mobile (1120px). Static fallback also uses separate left/right purple fields and a white center. [The background note](docs/purple-landing-background.zh-CN.md) records lifecycle and limits.

White cards float on ambient shadows. Homepage rest uses (`0 14px 38px -10px rgb(32 32 35 / .10)`); fine-pointer hover lifts by (6px) over (260ms). Functional card rest uses (`0 14px 38px -16px rgb(65 43 92 / .16)`); resource/design/Skill cards lift by (4px) over (240ms), with their stronger hover shadow. Exact hover, control and dark shadows are in the sidecar. Homepage feature images scale to (1.025) over (350ms); hero actions lift (2px) over (180ms).

Only the central desktop navigation capsule and compact mobile menu trigger combine the white alpha gradient, blur (24px), saturation (1.12), fine white border and edge shadows. The transparent outer header has no shared surface or shadow. The travelling lens uses blur (7px), saturation (1.1), a bright edge and a smaller shadow. GlassSwitch clips an inert duplicate-label layer, counter-translates its full track, then scales it locally around the moving lens center. Cubic ease-out travel accumulates approximately (390–540ms) of active animation-frame time, based on measured distance, starting at the first delivered frame and limiting each following interval to (50ms). Busy route work may extend wall-clock completion while preserving the visible journey. Magnification rises during travel to at most (1.15), then settles at (1). Observer or font notifications with unchanged destination geometry preserve the active journey; real geometry changes retarget it from the current visual position. This is native DOM magnification with glass styling, not physical optical refraction. The original controls retain their labels, hit areas and focus.

Homepage reveal, including its empty-state card, remains opacity (0 → 1), travel (24px → 0), duration (650ms), threshold (0.1), easing (`cubic-bezier(.22,1,.36,1)`) and (70ms) observer-batch staggering capped at (210ms). Existing functional reveal uses (12px), (550ms), threshold (0.12), root margin (`0px 0px -6% 0px`) and the same bounded stagger; delay restarts for each semantic group within an observer batch. The blog product story explicitly opts (25) short readable chunks into this existing reveal through scope/group/item markers; the header, gallery, static diagram and whole tall sections remain outside it. Authored content keeps its own motion. Retained template FadeIn uses (800ms). Keyboard focus reveals pending content immediately. Reduced motion cancels travel, zoom pulses, reveals and hover transforms; the background is static. Hidden/offscreen backgrounds pause, and the switch settles geometry on visibility changes. WebGL failure/context loss leaves CSS mist; unsupported backdrop blur leaves an opaque readable glass fallback. Cleanup releases frames, observers, listeners and GPU resources.

## Shapes

Shared floating cards use (16px) corners, actions and inputs (12px), preview grounds (10px) and compact editor tools (8px). The central navigation capsule and switch remain fully rounded (999px); the outer header frame has square, unpainted bounds. Account dropdowns use (18px), and mobile navigation panels (26px). Homepage card-content padding stays (23px 26px), or (21px) on mobile. Functional card insets commonly use (22px / 24px / 28px) according to density; these differences preserve content and operating context. Avatars stay circular. Authored artboards, saved blocks and third-party preview clipping retain their own shapes.

## Components

### Shared header and real account identity

Use `IavseHeader` as a transparent three-column frame. The original outlined V and licensed wordmark sit at the left edge; real `AuthNav` controls and avatar sit at the right edge, outside the centered navigation capsule. Home and eligible public pages share the same fixed header instance owned by the root runtime. The frame minimum height is (70px) with padding (8px 0), becoming (62px) with (7px 0) on mobile. Desktop navigation has its own glass capsule with (6px) inset; mobile uses a compact glass menu trigger in the center. Login actions stay black with white text. Account and open mobile panels use their own frosted surfaces. Header focus uses a (2px) neutral outline with (4px) offset; switch focus remains inset. Homepage content focus uses (3px / 5px), while functional controls use (2px / 4px).

### Sliding switch

`GlassSwitch` is implemented in the central header capsule, homepage Discover/Work/Discussions filters, resource-type navigation and community All/Following navigation. Links keep real `href`, `aria-current`, modifier-key behavior and route truth; buttons keep `aria-pressed` and native disabled behavior. A brief link-intent lens response does not change `aria-current` before the route changes. The real value change clears that intent and its timer, so browser Back cannot revive an old click. Label copies are `aria-hidden`, inert and pointer-transparent. Measurements account for localized text, flex compression, wrapped mobile labels, resize and font loading. Unchanged destination geometry keeps an active animation running; changed geometry retargets from its current position. Without a ready lens, the selected control keeps a visible white fallback; reduced motion places the lens directly with no zoom pulse.

### Actions, inputs and cards

Light-theme functional primary actions use black fill and white text; secondary actions use white fill and black text. Dark functional pages use the corresponding neutral role inversion. Destructive actions retain semantic red. Standard actions and inputs have a (44px) minimum height, with (12px) corners; homepage hero actions use (48px), becoming (45px) on mobile. Functional fields retain their labels, validation, focus and disabled states. White floating cards preserve the actual content, source imagery, metadata and destinations; hover and reveal decorate rather than rearrange the workflow.

### Truthful homepage content and resource discovery

The homepage server DTO includes up to four qualified public posts and three public projects from at most four discoverable public spaces. Discover shows the first work or post with available discussion content; Work and Discussions expose their bounded lists. Use actual authors and counts, real empty/unavailable states and working retry/destinations. A missing cover uses a decorative ground. With no discoverable space, the built-in template screenshot remains labeled **“内置模板预览 · 虚构人物”**, localized as appropriate, and links to the directory. Resource links retain original source/license detail; neither styling nor examples imply endorsement or unrestricted reuse.

### Content, editor and source boundaries

Shared styling stops before authored bodies, blog themes, saved canvas blocks, artboards, rich text, React Flow viewports and third-party/template previews. Platform bars, toolbars and controls may migrate; member content and color swatches retain their values. Search, follow, publishing, moderation, account and permission behavior remain intact. Private Pro code, assets, prompts and credentials remain outside the public repository and build. The read-only reference analysis does not import its code/models or enlarge any license.

### Blog spaces and original homepage examples

The public `/blogs` opening restores the existing shared-camera CSS 3D gallery from the public implementation, with floating extruded page planes, drag-to-look and click-to-approach behavior. It sits over the current purple-white atmosphere and retains the shared header with its centered frosted navigation capsule and external brand/account controls. Functional controls, author selection, links and focus use neutral roles. Route-owned `blog-gallery.css` restores the live gallery structure from public commit `894bf4b`; the existing camera geometry, bounded preview loader and visibility lifecycle remain in use. The plane's (8px) corners and inner radius of (8px minus its 1px border) belong to its preserved material geometry.

Only `publicSpaces(req)` supplies real members; their authored appearance and `/blog/:handle` destination retain authority. The stage is bounded to (12) spaces, while a native expandable list beside Reset view exposes all public members and clearly labeled **“原创主页示例 · 虚构人物”** examples. Its scrollable panel is anchored to the whole toolbar, uses two columns on desktop and one on mobile, and stays available under reduced motion. Escape closes the list and returns focus to its summary; list arrow keys retain native behavior rather than moving the camera. Query-free `/blogs/showcase/:handle` and `?embed=gallery` render the same original homepage example. Explicit `?template=builtin` remains the separate editor-template entry point. Preserve gallery keyboard selection and Escape return, mobile touch scrolling, two outstanding preview admissions, hidden/offscreen pauses and truthful empty states. No fictional example represents member activity or a real résumé.

The gallery's down arrow targets `#blog-space-product`. Beneath it, the locale-only server component [BlogProductShowcase](src/components/BlogProductShowcase.tsx) and [its scoped stylesheet](src/app/blog-space-product.css) present the personal-homepage overview, portfolio/writing/resources/résumé roles, editing explanation, publishing versions, discovery choice, two native FAQ disclosures and real editor/guide actions. This replaces the rendered lower appearance tabs, embedded editor demo, large preview and duplicate member directory; their removal does not change authored content or the gallery renderer. The product story has a (1160px) maximum width. Its intro heading, editor, publishing content and FAQ stack at (820px); content roles, editing features and publishing steps become single-column at (560px). Its editing feature list starts after (30px), or (24px) at and below (820px). It retains the current artistic heading families, neutral actions and white floating surfaces.

The original canvas structure illustration is static, `aria-hidden`, and accompanied by a visible noninteractive caption. Its miniature (7–11px) labels, compact (4–7px) corners and geometric sample colors describe a diagram; they are not new global type, radius or palette tokens. The publishing illustration likewise explains versions rather than acting as a control. Meaningful explanations, FAQ text and actions remain outside the miniature diagrams at normal reading sizes.

## Do's and Don'ts

- Do use white space, black neutral functional UI and purple decorative atmosphere across platform-owned surfaces.
- Do keep the central navigation capsule frosted and independently centered, with real brand and account controls outside it.
- Do keep natural soft mist on both sides, a white center, top clearance and gentle pointer response.
- Do preserve each route's working layout and avoid duplicate public headers in administration or the blog editor.
- Do verify Chinese, English and Japanese, mobile wrapping, focus, reduced motion and static fallbacks.
- Do retain actual public content, useful empty states, labeled fictional examples and original source/license details.
- Don't describe shared visual migration as a rewrite or full visual acceptance of every page.
- Don't restore purple action/selection/icon/link accents or extend the navigation capsule's glass surface across the brand and account areas.
- Don't turn soft mist into mandatory high-contrast ribbons or one-sided color.
- Don't style authored bodies, artboards, color swatches or third-party previews as platform UI.
- Don't expose duplicate interactive labels, invent activity or simulate real account state.
- Don't call DOM label magnification physical refraction, copy reference code/models, or call MIT plus Commons Clause plain MIT.
- Don't import private Pro materials, revive the cancelled Cloudlight migration, expand a license or claim authorship of licensed fonts.

### Community timeline and mobile dock

The community uses a compact white timeline with divided post rows, a persistent search field and the existing glass feed switch. Its own content density differs from the homepage's floating discovery cards. The mobile dock divides its actual visible destinations into three guest slots or five signed-in slots; its decorative lens is out of flow. A single safe-area calculation reserves space for the dock, compose button and bottom content. See [the current platform implementation](docs/platform-ui.zh-CN.md#社区信息流与手机底栏) and [community styles](src/app/community-timeline.css).
