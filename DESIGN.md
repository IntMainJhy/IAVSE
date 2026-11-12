---
name: IAVSE
description: White space, black functional controls, frosted navigation and soft teal and blue mist across IAVSE platform surfaces.
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
  header-focus: '#242424'
  glass-header-high: rgb(255 255 255 / .86)
  glass-header-low: rgb(255 255 255 / .65)
  glass-track: rgb(230 230 235 / .27)
  glass-inactive: '#5b5b60'
  glass-selected: '#202022'
  glass-lens-high: rgb(255 255 255 / .76)
  glass-lens-low: rgb(255 255 255 / .47)
  mist-left: '#ace1ca'
  mist-right: '#b6d9f5'
  mist-soft: rgb(214 239 229 / .20)
  mist-right-soft: rgb(217 239 248 / .22)
  home-dark-canvas: '#15191b'
  home-dark-surface: '#201f25'
  home-dark-foreground: '#f2eff5'
  home-dark-body: '#b7b1bf'
  home-dark-action-hover: '#d9d4e0'
  home-dark-border: '#38353f'
  home-dark-soft: '#2b2931'
  home-dark-selection: '#4b435a'
  header-dark-muted: '#c2bbca'
  header-dark-glass-high: rgb(32 32 38 / .5)
  header-dark-glass-low: rgb(24 24 30 / .3)
  header-dark-edge: rgb(255 255 255 / .18)
  header-dark-panel: rgb(37 32 45 / .97)
  header-dark-soft: '#38313f'
  header-dark-on-action: '#201b25'
  glass-dark-track-high: rgb(255 255 255 / .055)
  glass-dark-track-low: rgb(255 255 255 / .02)
  glass-dark-edge: rgb(255 255 255 / .12)
  glass-dark-lens-high: rgb(255 255 255 / .19)
  glass-dark-lens-low: rgb(255 255 255 / .055)
  glass-dark-lens-edge: rgb(255 255 255 / .28)
  glass-dark-highlight: rgb(255 255 255 / .38)
  glass-dark-inactive: '#c7c3cd'
  glass-dark-hover: rgb(255 255 255 / .065)
  glass-dark-selected: rgb(255 255 255 / .13)
  glass-dark-focus: '#e9e5ee'
  glass-dark-track-fallback: '#27272d'
  glass-dark-lens-fallback: '#414147'
  dark-canvas: '#171b1d'
  dark-background: '#202629'
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
    fontSize: clamp(35px, 3.5vw, 48px)
    fontWeight: 400
    lineHeight: 1.32
    letterSpacing: -0.02em
  wordmark:
    fontFamily: '"IAVSE Wordmark", Georgia, serif'
    fontSize: 33px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -0.025em
  section-heading:
    fontFamily: '"IAVSE Display", "Songti SC", serif'
    fontSize: clamp(25px, 2.3vw, 30px)
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.015em
  body:
    fontFamily: '"IAVSE Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji",
      "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.7
  introduction:
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.8
  card-title:
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.55
  card-body:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.8
  action:
    fontSize: 14px
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
    fontSize: 15px
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
  pill: 999px
spacing:
  glass-inset: 4px
  action-gap: 10px
  gutter-small: 16px
  feed-gap: 20px
  card-inset-mobile: 16px 18px
  application-card-inset: 22px
  card-inset-block: 18px
  application-gap: 24px
  card-inset-inline: 22px
  board-gap: 18px
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
    padding: 9px 18px
    height: 44px
  home-button-primary-hover:
    backgroundColor: '{colors.home-action-hover}'
  home-button-secondary:
    backgroundColor: '{colors.background}'
    textColor: '{colors.home-foreground}'
    typography: '{typography.action}'
    rounded: '{rounded.control}'
    padding: 9px 18px
    height: 44px
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
    height: 72px
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
    padding: 18px 22px
  space-card:
    backgroundColor: '{colors.background}'
    textColor: '{colors.home-foreground}'
    rounded: '{rounded.card}'
    padding: 20px 22px
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

**Creative North Star: "White space, black controls, teal and blue mist"**

IAVSE pairs a white, spacious platform with black functional controls, licensed artistic headings, floating cards and drifting teal and pale blue mist. Teal is strongest at the left and blue at the right. Their translucent edges mix behind the central text. The shared header has a transparent frame: brand at left, a centered frosted navigation capsule with a theme control beside it, and real account state followed by language at right. The same capsule remains visible on every viewport; compact layouts place navigation and theme on a second row. A travelling lens briefly enlarges the text beneath it. Teal and blue color the background. Primary actions, selected labels, icons and links use neutral ink.

This specification records the implemented **shared visual migration**, not a claim that every page was rewritten. [The landing stylesheet](src/app/iavse-landing.css) owns homepage variants; [application styles](src/app/iavse-application.css), [glass controls](src/app/glass-controls.css) and [platform shell placement](src/app/iavse-shell.css) carry the shared world through existing functional layouts. The older [base integration](src/app/iavse-system.css) and [host bridge](src/app/rbp-bridge.css) remain implementation support; their superseded blue-gray palette is not a second current design direction. [Platform coverage and mechanisms](docs/platform-ui.zh-CN.md) record the actual route and content boundaries. The retained local homepage brief holds its task-specific composition decisions.

The earlier application baseline retains its [RBP Portfolio attribution](docs/portfolio-frontend.md), pinned at `1581b9b8e5876f60e5eb844970747506980c4412`. The shared glass controls and analytic mist are independently authored public website code. The user-provided fluid-glass reference was read only; its MIT license includes Commons Clause restrictions and must not be called plain MIT. No reference source or model is included in this implementation. [PRODUCT.md](PRODUCT.md) owns business, permission and license boundaries. Authored bodies, blog themes, canvas content and third-party previews retain their appearance and rights.

**Key Characteristics:**

- White space, black functional controls and a diffuse overlap between teal and blue mist.
- Licensed ZCOOL XiaoWei headings, Cormorant wordmark and readable Geist body text.
- An always-visible frosted navigation capsule and adjacent theme control, with the original brand and real account/language controls outside it.
- Sliding glass selection with local text magnification and one accessible interactive label layer.
- Floating white cards, fine-pointer hover and bounded viewport entry within existing workflows.
- Explicit route, authored-content, accessibility and source/license boundaries.

## Colors

The light platform uses neutral ink and white surfaces. Teal and blue are the decorative background colors. The frontmatter owns the extracted values, including the small homepage/header variants used in the current CSS.

### Primary

- **Neutral Ink:** light-theme primary action fill, selected text, links and functional icons. Homepage and shared header ink variants reflect their actual scoped styles.
- **Neutral Focus:** visible keyboard focus for application, homepage and header contexts.
- **Success / Error:** existing semantic feedback roles, including dark variants. Destructive and feedback colors remain distinct from ordinary actions.

### Secondary

- **Mist Left / Right:** the static teal and blue cores. Mist Soft and Mist Right Soft are the translucent outer color stops of the two overlapping gradients. The WebGL shader mixes its own colors; control tokens do not recolor it automatically.
- **Glass High / Low:** the light capsule and lens use white alpha stops. In dark appearance, the header track uses neutral `rgb(32 32 38 / .5)` → `rgb(24 24 30 / .3)` stops; other switch tracks use white alpha (.055 → .02). Their separate brighter lens uses white alpha (.19 → .055), edge (.28) and inset highlight (.38), keeping the backdrop visible through the frosted layers. Complete gradients, blur and shadows live in the sidecar because those properties do not fit frontmatter component tokens.

### Neutral

- **Background / Muted / Border:** white card grounds, quiet neutral insets and fine separators.
- **Secondary / Subtle:** readable supporting copy and metadata.
- **Glass Track / Inactive / Selected:** a neutral translucent switch track, muted labels and black selected labels.
- **Dark roles:** functional pages, homepage cards and filters, and the shared header invert their neutral foreground and surface roles. The `home-dark-*`, `header-dark-*` and `glass-dark-*` frontmatter entries describe only scoped landing and glass-control roles; they do not replace the application palette. Homepage actions use its dark foreground over its dark surface; the header reuses the application dark foreground with its own translucent glass and panel roles. Dark switches use inactive labels (`#c7c3cd`), selected labels (`#f5f2f8`), hover white alpha (.065) and focus (`#e9e5ee`). Before a lens is ready, white alpha (.13) keeps the selected control visible.

**The Neutral Function Rule.** Use neutral ink for light-theme actions, selections, links and icons. Reserve teal and blue for decorative surfaces and use semantic colors for feedback.

**The Frosted Navigation Rule.** Apply translucent glass, blur and a fine edge to the always-visible central navigation capsule, using its scoped light or dark roles. Keep the full header frame transparent, borderless and without a shadow; brand, account and language controls remain outside the capsule, with theme beside it.

**The Source Identity Rule.** Keep authored work and source previews recognizable and attributed. Fictional template fallbacks must remain labeled.

## Typography

**Display Font:** self-hosted ZCOOL XiaoWei (站酷小薇), declared as `IAVSE Display`, with Songti and serif fallbacks. **Wordmark Font:** self-hosted Cormorant Garamond, declared as `IAVSE Wordmark`, with Georgia and serif fallbacks. **Body Font:** self-hosted Geist, declared as `IAVSE Sans`, with system and CJK fallbacks. These aliases do not claim typeface authorship. Preserve the [ZCOOL XiaoWei](public/fonts/zcoolxiaowei-OFL.txt), [Cormorant Garamond](public/fonts/CormorantGaramond-OFL.txt) and [Geist](public/fonts/design-artifacts/voltagent/geist-OFL.txt) SIL OFL notices.

The homepage opens with a two-line title and balanced introductory text. The Chinese title scales from 35 to 48px, the English Cormorant title from 40 to 54px, and the Japanese serif title from 32 to 43px. At 740px and below, the respective ranges are 28–36px, 33–44px and 27–35px. The introduction uses 15px type on desktop and 14px on phones. Shared header wordmarks become (29px) at or below (650px), then (26px) at or below (360px).

Functional pages use the body and application heading roles. Catalog/workspace introductions use artistic headings (40px / 1.4), becoming (32px / 1.45) on mobile; operating section/card headings remain more compact. Directory introductions use (48px / 1.4), becoming (36px). Document reading text keeps its authored structure; the site-owned reader title uses (38px), becoming (31px), and its working measure is (72ch). Glass labels use (14px / 1.4), or compact (13px). The header uses short visible labels at or below (650px) with (12px) type, then (11.5px) at or below (360px); the full localized names remain in `aria-label`. The lens measures the actual visible label boxes after resize and font loading.

**The Readable Hierarchy Rule.** Verify Chinese, English and Japanese at the real viewport width; local magnification must not replace readable base text or create duplicate accessible names.

## Layout

The opening section is at least one dynamic viewport high. The headline and introduction sit above a centered liquid-glass capsule with two links, Community (`/community`) and Resources (`/resources`). The group leaves room for the fixed header on short screens. Below it, the homepage follows **community feed → expandable resource selections → the featured author’s published homepage → footer and mission**. The earlier resource-sidebar/horizontal-space-card composition is historical. This is a homepage composition, not a requirement to turn operating pages into landing pages. At or below (740px), the community feed and the personal homepage preview each stack beneath their heading. Visitors can open any of the four resource categories in place.

The root runtime owns one persistent fixed header and one `GlassSwitch` across Home and eligible public routes, preserving the header and travelling lens during navigation. Home keeps its local backdrop and reserves the actual header height: (72px) above (1100px), (122px) at or below (1100px), and (110px) at or below (650px). On non-home routes only, `PublicFrame` receives additional clearance of (52px) or (48px) at those compact breakpoints. The shared capsule links to Home (`/`), Community, Resources, Blog spaces and About (`/about`); brand and account destinations remain real.

The homepage content width is capped at (1000px) with (40px) gutters, growing to (1080px) with (50px) gutters from (1500px). Its gutters become (24px) at or below (1000px), (20px) at or below (740px), and (16px) at or below (380px). The fixed header instead grows from (1120px) to (1240px) at (1500px); its gutters become (24px) at or below (900px) and (16px) at or below (650px). Header top offset is (20px), then (12px) at or below (650px). Above (1100px), equal flexible side columns around an automatic center column (`minmax(0,1fr) auto minmax(0,1fr)`) center the navigation/theme group independently of brand/account widths. At or below (1100px), brand remains upper left, real account/avatar and language upper right, with the same visible navigation capsule and theme control centered below. There is no hamburger or disclosure navigation.

Functional page layouts stay task-oriented: the shared organic container uses (1240px) maximum width and (40px) insets, with route-specific catalog limits retained where present; mobile insets become (20px), then (16px) below (480px). Account settings use two columns and then one. Real login/registration forms use (480px / 560px) maximum widths and (34px) card padding, becoming (28px 22px) on mobile. The reader uses library/content/outline columns, hides the outline below (1100px), and stacks on mobile. Administration keeps its sidebar and (1440px) main maximum. Community keeps its mobile rail, search and compose workflow. Editor workspaces keep their toolbars and canvas controls. The 404 page uses the platform PublicFrame and a raised return-home card.

Route guards preserve authored blog pages, built-in showcase previews and resource-design preview pages. Administration receives the atmosphere and migrated site controls without a second public header. The blog editor workspace keeps its own working chrome and does not receive the public header or atmosphere. Only the narrow IAVSE return bar/footer on authored pages is platform chrome. The [coverage table](docs/platform-ui.zh-CN.md) defines these boundaries. Shared runtime no longer mounts the old Portfolio capsule, PageBackdrop or Lenis enhancer.

## Elevation & Depth

The two mist fields have different phases and overlap across a broad, slowly shifting area. Their relative densities set the local color. A horizontal gesture shifts the balance toward the incoming pigment, and pointer energy briefly draws the two colors closer to an even mix. The mist fades in between 100px and 320px from the top and fades out at the bottom. The shared platform atmosphere spans one visible viewport (`100dvh`, with a `100vh` fallback). On Home it sits inside the full-width opening section and scrolls away with it. The sections below use the page canvas. Time advances at `uTime * 0.12`. The shared atmosphere uses 0.24 opacity in dark mode. The CSS fallback layers two broad radial gradients with translucent outer stops. [Background behavior and parameters](docs/purple-landing-background.zh-CN.md).

White cards float on ambient shadows. Homepage rest uses (`0 14px 38px -10px rgb(32 32 35 / .10)`); fine-pointer hover lifts by (6px) over (260ms). Functional card rest uses (`0 14px 38px -16px rgb(65 43 92 / .16)`); resource/design/Skill cards lift by (4px) over (240ms), with their stronger hover shadow. Exact hover, control and dark shadows are in the sidecar. Homepage feature images scale to (1.025) over (350ms). Filled homepage actions lift (2px) over (180ms).

The always-visible central navigation capsule combines its scoped alpha gradient, blur (24px), saturation (1.12), fine edge and edge shadows in either appearance. The transparent outer header has no shared surface or shadow. Dark header backdrop brightness is bounded at (0.36) before its translucent fill and lens are composed, preserving neutral-label contrast when bright covers pass beneath the fixed capsule. Dark header theme, language and account control plates share that brightness guard with (18px) blur; their unsupported-blur fallback uses the header panel role. Other dark switch tracks use blur (16px), saturation (1.12) and a white alpha (.12) edge. The travelling lens uses blur (7px) in light appearance and (10px) in dark, saturation (1.1), a bright edge and a smaller shadow. Dark capsule depth is (`0 12px 36px -12px rgb(0 0 0 / .6), 0 1px 2px rgb(0 0 0 / .18), inset 0 1px 0 rgb(255 255 255 / .18)`); the independent dark lens uses (`0 5px 15px -4px rgb(0 0 0 / .4), inset 0 1px 1px rgb(255 255 255 / .38), inset 0 -1px 2px rgb(0 0 0 / .26)`). A selected control awaiting its lens uses (`0 2px 8px rgb(0 0 0 / .24)`). Both standard and WebKit backdrop-filter paths retain these layers; when neither is supported, dark switch tracks use (`#27272d`), header navigation uses its existing panel role and lenses use (`#414147`). GlassSwitch clips an inert duplicate-label layer, counter-translates its full track, then scales it locally around the moving lens center. Cubic ease-out travel accumulates approximately (390–540ms) of active animation-frame time, based on measured distance, starting at the first delivered frame and limiting each following interval to (50ms). Busy route work may extend wall-clock completion while preserving the visible journey. Magnification rises during travel to at most (1.15), then settles at (1). Observer or font notifications with unchanged destination geometry preserve the active journey; real geometry changes retarget it from the current visual position. This is native DOM magnification with glass styling, not physical optical refraction. The original controls retain their labels, hit areas and focus.

Homepage reveal, including its empty-state card, remains opacity (0 → 1), travel (24px → 0), duration (650ms), threshold (0.1), easing (`cubic-bezier(.22,1,.36,1)`) and (70ms) observer-batch staggering capped at (210ms). Existing functional reveal uses (12px), (550ms), threshold (0.12), root margin (`0px 0px -6% 0px`) and the same bounded stagger; delay restarts for each semantic group within an observer batch. The blog product story explicitly opts (21) short readable chunks into this existing reveal through scope/group/item markers; the header, gallery, static diagram and whole tall sections remain outside it. Authored content keeps its own motion. Retained template FadeIn uses (800ms) with controlled scroll entry; explicit mount FadeIn and ScaleUnblur keep their mount behavior. Homepage, functional and scroll FadeIn entries replay after the element fully leaves the physical viewport and re-enters in either scroll direction. Crossing an entry threshold or inset while still visible does not hide content or restart it. Keyboard focus reveals pending content immediately and keeps it readable while focus remains inside. Reduced motion cancels travel, zoom pulses, reveals and hover transforms and shows reveal content; unavailable observation or animation APIs keep content readable. The background is static under reduced motion. Hidden/offscreen backgrounds pause, and the switch settles geometry on visibility changes. WebGL failure/context loss leaves CSS mist; unsupported backdrop blur leaves an opaque readable glass fallback. Cleanup releases frames, observers, listeners and GPU resources.

## Shapes

Shared floating cards use (16px) corners, actions and inputs (12px), preview grounds (10px) and compact editor tools (8px). The central navigation capsule and switch remain fully rounded (999px); the outer header frame has square, unpainted bounds. Account dropdowns use (18px), and language panels (14px). Homepage feed card padding is 18px 22px, reducing to 18px 20px at 1000px and 16px 18px at 380px. When a feed filter is empty, a writing prompt sits on a paper-style panel with a link to start a contribution. Functional card insets commonly use (22px / 24px / 28px) according to density; these differences preserve content and operating context. Avatars stay circular. Authored artboards, saved blocks and third-party preview clipping retain their own shapes.

## Components

### Shared header and real account identity

Use `IavseHeader` as the transparent persistent frame described in Layout. The original outlined V and licensed wordmark sit left; real `AuthNav` controls/avatar followed by the original `LanguageSwitcher` sit right. The capsule remains visible at every width, with a circular theme control beside it. The desktop frame uses padding (8px 0), the two-row tablet frame (6px 0) and phone frame (4px 0). Capsule inset is (6px), then (4px) at or below (650px). Login actions use neutral fill and contrast text in the current appearance; actual account and language panels use their own frosted surfaces. The footer no longer repeats language selection. Header focus uses a (2px) neutral outline with (4px) offset; switch focus remains inset. Homepage content focus uses (3px / 5px), while functional controls use (2px / 4px).

`ThemeToggle` reads the actual document color mode, writes both mode/preference and the existing one-year `site-color-mode` cookie, and keeps its accessible action label and pressed state in sync. It retains the public Portfolio circular View Transition contract (700ms), originating at the control; reduced motion or unsupported View Transitions apply the mode directly. Intent and generation guards preserve the latest activation even before an earlier transition commits. Its retained upstream attribution remains in the source and license notes.

### Sliding switch

The homepage introduction uses two equal-width links in a single capsule. Both destinations are unselected at rest. Hover, keyboard focus or a press reveals the lens over the target. It magnifies the label as it slides. Pressing dims and compresses the lens, which returns to its resting size on release. Reduced motion keeps the tonal feedback and skips the scale change. Activation follows the link with native keyboard and modifier-key behavior.

`GlassSwitch` also powers the central header capsule, homepage Discover/Work/Discussions filters, resource-type navigation and community All/Following navigation. Links keep real `href`, `aria-current`, modifier-key behavior and route truth; buttons keep `aria-pressed` and native disabled behavior. A brief link-intent lens response does not change `aria-current` before the route changes. The real value change clears that intent and its timer, so browser Back cannot revive an old click. Label copies are `aria-hidden`, inert and pointer-transparent. Measurements account for localized full/compact visible text, flex compression, resize and font loading. Unchanged destination geometry keeps an active animation running; changed geometry retargets from its current position. Without a ready lens, the selected control keeps a visible current-appearance fallback; reduced motion places the lens directly with no zoom pulse.

### Actions, inputs and cards

Light-theme functional primary actions use black fill and white text; secondary actions use white fill and black text. Dark functional pages use the corresponding neutral role inversion. Destructive actions retain semantic red. Standard actions and inputs have a (44px) minimum height and (12px) corners. Filled homepage actions have a 44px minimum height. Functional fields retain their labels, validation, focus and disabled states. White floating cards preserve the actual content, source imagery, metadata and destinations; hover and reveal decorate rather than rearrange the workflow.

### Truthful homepage content and resource discovery

The homepage server DTO includes up to four qualified public posts and three public projects from at most four discoverable public spaces. Discover shows the first work or post with available discussion content; Work and Discussions expose their bounded lists. Use actual authors and counts. Empty filters offer a writing prompt or a project prompt, and a failed feed request offers a retry. A missing project or post cover uses a decorative ground. Four native resource disclosures expose selected entries, their sources and their full category links. The personal-homepage section shows the featured author’s published design in a lazy-loaded, read-only preview. The author’s name and avatar share a link to the public homepage. When the featured space is unavailable, an empty state keeps the editor and directory within reach. The section links to the `/workspace/blog` editor and `/blogs` directory and explains manual publishing and article review. Resource links retain original source/license detail; neither styling nor examples imply endorsement or unrestricted reuse.

### Content, editor and source boundaries

Shared styling stops before authored bodies, blog themes, saved canvas blocks, artboards, rich text, React Flow viewports and third-party/template previews. Platform bars, toolbars and controls may migrate; member content and color swatches retain their values. Search, follow, publishing, moderation, account and permission behavior remain intact. Private Pro code, assets, prompts and credentials remain outside the public repository and build. The read-only reference analysis does not import its code/models or enlarge any license.

### Blog spaces and original homepage examples

The public `/blogs` opening restores the existing shared-camera CSS 3D gallery from the public implementation, with floating extruded page planes, drag-to-look and click-to-approach behavior. It sits over the shared teal and blue mist and retains the shared header with its centered frosted navigation capsule and external brand/account controls. Functional controls, author selection, links and focus use neutral roles. Route-owned `blog-gallery.css` restores the live gallery structure from public commit `894bf4b`; the existing camera geometry, bounded preview loader and visibility lifecycle remain in use. The plane's (8px) corners and inner radius of (8px minus its 1px border) belong to its preserved material geometry.

Only `publicSpaces(req)` supplies real members; their authored appearance and `/blog/:handle` destination retain authority. The stage is bounded to (12) spaces, while a native expandable list beside Reset view exposes all public members and clearly labeled **“原创主页示例 · 虚构人物”** examples. Its scrollable panel is anchored to the whole toolbar, uses two columns on desktop and one on mobile, and stays available under reduced motion. Escape closes the list and returns focus to its summary; list arrow keys retain native behavior rather than moving the camera. Query-free `/blogs/showcase/:handle` and `?embed=gallery` render the same original homepage example. Explicit `?template=builtin` remains the separate editor-template entry point. Preserve gallery keyboard selection and Escape return, mobile touch scrolling, two outstanding preview admissions, hidden/offscreen pauses and truthful empty states. No fictional example represents member activity or a real résumé.

The gallery's down arrow targets `#blog-space-product`. Beneath it, the locale-only server component [BlogProductShowcase](src/components/BlogProductShowcase.tsx) and [its scoped stylesheet](src/app/blog-space-product.css) present the personal-homepage overview, portfolio/writing/resources/résumé roles, editing explanation, publishing versions, discovery choice, two native FAQ disclosures and real editor/guide actions. This replaces the rendered lower appearance tabs, embedded editor demo, large preview and duplicate member directory; their removal does not change authored content or the gallery renderer. The product story has a (1160px) maximum width. Its intro heading, editor, publishing content and FAQ stack at (820px); content roles, editing features and publishing steps become single-column at (560px). Its editing feature list starts after (30px), or (24px) at and below (820px). It retains the current artistic heading families, neutral actions and white floating surfaces.

The original canvas structure illustration is static, `aria-hidden`, and accompanied by a visible noninteractive caption. Its miniature (7–11px) labels, compact (4–7px) corners and geometric sample colors describe a diagram; they are not new global type, radius or palette tokens. The publishing illustration likewise explains versions rather than acting as a control. Meaningful explanations, FAQ text and actions remain outside the miniature diagrams at normal reading sizes.

## Do's and Don'ts

- Do use white space, neutral black controls and teal and blue mist across platform-owned surfaces.
- Do keep the navigation capsule visible and frosted at every width, with theme beside it and real brand, account and language controls outside it.
- Do let the two sides blend behind the content, with top clearance and gentle mouse or touch response.
- Do preserve each route's working layout and avoid duplicate public headers in administration or the blog editor.
- Do verify Chinese, English and Japanese, compact labels and full accessible names, focus, both appearances, reduced motion and static fallbacks.
- Do retain actual public content, useful empty states, labeled fictional examples and original source/license details.
- Don't describe shared visual migration as a rewrite or full visual acceptance of every page.
- Keep functional controls neutral and confine the frosted navigation surface to the capsule.
- Don't turn soft mist into mandatory high-contrast ribbons or one-sided color.
- Don't style authored bodies, artboards, color swatches or third-party previews as platform UI.
- Don't expose duplicate interactive labels, invent activity or simulate real account state.
- Don't call DOM label magnification physical refraction, copy reference code/models, or call MIT plus Commons Clause plain MIT.
- Don't import private Pro materials, revive the cancelled Cloudlight migration, expand a license or claim authorship of licensed fonts.

### Community timeline and mobile dock

The community uses a compact white timeline with divided post rows, a persistent search field and the existing glass feed switch. Its own content density differs from the homepage's floating discovery cards. The mobile dock divides its actual visible destinations into three guest slots or five signed-in slots; its decorative lens is out of flow. A single safe-area calculation reserves space for the dock, compose button and bottom content. See [the current platform implementation](docs/platform-ui.zh-CN.md#社区信息流与手机底栏) and [community styles](src/app/community-timeline.css).
