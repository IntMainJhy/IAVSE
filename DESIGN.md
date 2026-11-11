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
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: 8px 12px 8px 24px
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

IAVSE pairs a white, spacious platform with black functional controls, licensed artistic headings, floating cards and naturally moving purple mist at both sides. The center stays quiet and white. The user extended the approved homepage world to platform frontend surfaces, replaced the earlier plain transparent header with frosted glass, and requested a travelling lens that briefly enlarges the text beneath it. Purple belongs to decorative backgrounds; primary actions, selected labels, icons and links use neutral ink.

This specification records the implemented **shared visual migration**, not a claim that every page was rewritten. [The landing stylesheet](src/app/iavse-landing.css) owns homepage variants; [application styles](src/app/iavse-application.css), [glass controls](src/app/glass-controls.css) and [platform shell placement](src/app/iavse-shell.css) carry the shared world through existing functional layouts. The older [base integration](src/app/iavse-system.css) and [host bridge](src/app/rbp-bridge.css) remain implementation support; their superseded blue-gray palette is not a second current design direction. [Platform coverage and mechanisms](docs/platform-ui.zh-CN.md) record the actual route and content boundaries. The retained local homepage brief holds its task-specific composition decisions.

The earlier application baseline retains its [RBP Portfolio attribution](docs/portfolio-frontend.md), pinned at `1581b9b8e5876f60e5eb844970747506980c4412`. The shared glass controls and analytic mist are independently authored public website code. The user-provided fluid-glass reference was read only; its MIT license includes Commons Clause restrictions and must not be called plain MIT. No reference source or model is included in this implementation. [PRODUCT.md](PRODUCT.md) owns business, permission and license boundaries. Authored bodies, blog themes, canvas content and third-party previews retain their appearance and rights.

**Key Characteristics:**

- White space, black functional controls and soft purple mist at both sides, with a white center.
- Licensed ZCOOL XiaoWei headings, Cormorant wordmark and readable Geist body text.
- A frosted header with the original brand at left and real account state at right.
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
- **Glass High / Low:** the white alpha stops used by the frosted header and lens. Their complete gradients, blur and shadows live in the sidecar because those properties do not fit frontmatter component tokens.

### Neutral

- **Background / Muted / Border:** white card grounds, quiet neutral insets and fine separators.
- **Secondary / Subtle:** readable supporting copy and metadata.
- **Glass Track / Inactive / Selected:** a neutral translucent switch track, muted labels and black selected labels.
- **Dark roles:** implemented functional-page counterparts invert neutral roles without introducing a purple functional accent. The current homepage and shared header keep their explicit light appearance.

**The Neutral Function Rule.** Use black neutral UI for primary actions, selected labels, links and icons in the light appearance; keep purple in decorative backgrounds and retain semantic feedback colors.

**The Frosted Header Rule.** Use the shared white translucent glass header with blur and a bright fine edge. The user's newer glass direction supersedes the earlier plain transparent header requirement.

**The Source Identity Rule.** Keep authored work and source previews recognizable and attributed. Fictional template fallbacks must remain labeled.

## Typography

**Display Font:** self-hosted ZCOOL XiaoWei (站酷小薇), declared as `IAVSE Display`, with Songti and serif fallbacks. **Wordmark Font:** self-hosted Cormorant Garamond, declared as `IAVSE Wordmark`, with Georgia and serif fallbacks. **Body Font:** self-hosted Geist, declared as `IAVSE Sans`, with system and CJK fallbacks. These aliases do not claim typeface authorship. Preserve the [ZCOOL XiaoWei](public/fonts/zcoolxiaowei-OFL.txt), [Cormorant Garamond](public/fonts/CormorantGaramond-OFL.txt) and [Geist](public/fonts/design-artifacts/voltagent/geist-OFL.txt) SIL OFL notices.

Homepage display, introduction and card roles retain the centered opening's hierarchy. English hero text uses Cormorant at weight (500), with a clamp of (44px, 4.7vw, 62px); Japanese uses Songti / Yu Mincho with a clamp of (36px, 3.7vw, 50px). The default display reaches (66px) on wide screens. Mobile defaults to (40px / 1.4), English (42px) and Japanese (32px); the narrowest default title is (35px). Shared header wordmarks become (29px), then (26px) at the narrowest breakpoint.

Functional pages use the body and application heading roles. Catalog/workspace introductions use artistic headings (40px / 1.4), becoming (32px / 1.45) on mobile; operating section/card headings remain more compact. Directory introductions use (48px / 1.4), becoming (36px). Document reading text keeps its authored structure; the site-owned reader title uses (38px), becoming (31px), and its working measure is (72ch). Glass labels use (14px / 1.4), or compact (13px); mobile header labels may wrap to two balanced lines. The lens measures actual localized label boxes after resize and font loading.

**The Readable Hierarchy Rule.** Verify Chinese, English and Japanese at the real viewport width; local magnification must not replace readable base text or create duplicate accessible names.

## Layout

The homepage retains **centered hero → community filters/content with a resource sidebar → public-space horizontal card → footer**. This is its surface composition, not a requirement to turn operating pages into landing pages. The homepage owns its header/backdrop; eligible other routes receive the shared fixed shell. Brand, community/resources/blog-space navigation and real account state keep their working destinations.

The homepage/shared header width is at most (1120px) with (40px) gutters, growing to (1240px) with (50px) gutters from (1500px). At or below (900px), gutters become (24px), then (16px) below (650px). Header top offset is (20px), then (12px). Header desktop navigation switches to a native details menu at (820px); opening and closing remain keyboard-operable, with outside-pointer, route/locale and Escape handling. Escape returns focus to the menu trigger. The homepage grid keeps its desktop (2:1) board/sidebar and stacks below (650px).

Functional page layouts stay task-oriented: the shared organic container uses (1240px) maximum width and (40px) insets, with route-specific catalog limits retained where present; mobile insets become (20px), then (16px) below (480px). Account settings use two columns and then one. Real login/registration forms use (480px / 560px) maximum widths and (34px) card padding, becoming (28px 22px) on mobile. The reader uses library/content/outline columns, hides the outline below (1100px), and stacks on mobile. Administration keeps its sidebar and (1440px) main maximum. Community keeps its mobile rail, search and compose workflow. Editor workspaces keep their toolbars and canvas controls. The 404 page uses the platform PublicFrame and a raised return-home card.

Route guards preserve authored blog pages, built-in showcase previews and resource-design preview pages. Administration receives the atmosphere and migrated site controls without a second public header. The blog editor workspace keeps its own working chrome and does not receive the public header or atmosphere. Only the narrow IAVSE return bar/footer on authored pages is platform chrome. The [coverage table](docs/platform-ui.zh-CN.md) defines these boundaries. Shared runtime no longer mounts the old Portfolio capsule, PageBackdrop or Lenis enhancer.

## Elevation & Depth

The mist uses independently phased left/right `mist` fields, soft side anchors, domain-warped `sheetA` / `sheetB` and `opening`, with time multiplier (0.12). Both sides change shape naturally while the center stays white; top clearance begins with approximately (100px) of white and fades into color through (320px). It is an analytic approximation of flowing color, not a physical fluid solver. The homepage backdrop is (1000px), other platform shells (1100px), and mobile (1120px). Static fallback also uses separate left/right purple fields and a white center. [The background note](docs/purple-landing-background.zh-CN.md) records lifecycle and limits.

White cards float on ambient shadows. Homepage rest uses (`0 14px 38px -10px rgb(32 32 35 / .10)`); fine-pointer hover lifts by (6px) over (260ms). Functional card rest uses (`0 14px 38px -16px rgb(65 43 92 / .16)`); resource/design/Skill cards lift by (4px) over (240ms), with their stronger hover shadow. Exact hover, control and dark shadows are in the sidecar. Homepage feature images scale to (1.025) over (350ms); hero actions lift (2px) over (180ms).

The frosted header combines a white alpha gradient, blur (24px), saturation (1.12), fine white border and layered edge shadows. Its travelling lens uses blur (7px), saturation (1.1), a bright edge and a smaller shadow. GlassSwitch clips an inert duplicate-label layer, counter-translates its full track, then scales it locally around the moving lens center. Cubic ease-out travel lasts (390–540ms), based on measured distance; magnification rises during travel to at most (1.15), then settles at (1). This is native DOM magnification with glass styling, not physical optical refraction. The original controls retain their labels, hit areas and focus.

Homepage reveal remains opacity (0 → 1), travel (24px → 0), duration (650ms), threshold (0.1), easing (`cubic-bezier(.22,1,.36,1)`) and (70ms) observer-batch staggering capped at (210ms). Existing functional reveal uses (12px), (550ms), threshold (0.12), root margin (`0px 0px -6% 0px`) and the same bounded stagger; retained template FadeIn uses (800ms). Keyboard focus reveals pending content immediately. Reduced motion cancels travel, zoom pulses, reveals and hover transforms; the background is static. Hidden/offscreen backgrounds pause, and the switch settles geometry on visibility changes. WebGL failure/context loss leaves CSS mist; unsupported backdrop blur leaves an opaque readable glass fallback. Cleanup releases frames, observers, listeners and GPU resources.

## Shapes

Shared floating cards use (16px) corners, actions and inputs (12px), preview grounds (10px) and compact editor tools (8px). The header and switch remain fully rounded (999px); account dropdowns use (18px), and mobile navigation panels (26px). Homepage card-content padding stays (23px 26px), or (21px) on mobile. Functional card insets commonly use (22px / 24px / 28px) according to density; these differences preserve content and operating context. Avatars stay circular. Authored artboards, saved blocks and third-party preview clipping retain their own shapes.

## Components

### Shared header and real account identity

Use `IavseHeader` with the original outlined V and licensed IAVSE wordmark. Homepage placement is sticky; eligible other pages use the fixed shell. `AuthNav` supplies actual guest/signed-in state; the account menu and real avatar are preserved. The header minimum height is (70px), becoming (62px) on mobile. Login actions are black with white text. Account and mobile panels use their own frosted white surfaces. Header focus uses a (2px) neutral outline with (4px) offset; switch focus remains inset. Homepage content focus uses (3px / 5px), while functional controls use (2px / 4px).

### Sliding switch

`GlassSwitch` is implemented in the shared header, homepage Discover/Work/Discussions filters, resource-type navigation and community All/Following navigation. Links keep real `href`, `aria-current`, modifier-key behavior and route truth; buttons keep `aria-pressed` and native disabled behavior. A brief link-intent lens response does not change `aria-current` before the route changes. Label copies are `aria-hidden`, inert and pointer-transparent. Measured positions account for localized text, flex compression, wrapped mobile labels, resize and font loading. Without a ready lens, the selected control keeps a visible white fallback; reduced motion places the lens directly with no zoom pulse.

### Actions, inputs and cards

Light-theme functional primary actions use black fill and white text; secondary actions use white fill and black text. Dark functional pages use the corresponding neutral role inversion. Destructive actions retain semantic red. Standard actions and inputs have a (44px) minimum height, with (12px) corners; homepage hero actions use (48px), becoming (45px) on mobile. Functional fields retain their labels, validation, focus and disabled states. White floating cards preserve the actual content, source imagery, metadata and destinations; hover and reveal decorate rather than rearrange the workflow.

### Truthful homepage content and resource discovery

The homepage server DTO includes up to four qualified public posts and three public projects from at most four discoverable public spaces. Discover shows the first work or post with available discussion content; Work and Discussions expose their bounded lists. Use actual authors and counts, real empty/unavailable states and working retry/destinations. A missing cover uses a decorative ground. With no discoverable space, the built-in template screenshot remains labeled **“内置模板预览 · 虚构人物”**, localized as appropriate, and links to the directory. Resource links retain original source/license detail; neither styling nor examples imply endorsement or unrestricted reuse.

### Content, editor and source boundaries

Shared styling stops before authored bodies, blog themes, saved canvas blocks, artboards, rich text, React Flow viewports and third-party/template previews. Platform bars, toolbars and controls may migrate; member content and color swatches retain their values. Search, follow, publishing, moderation, account and permission behavior remain intact. Private Pro code, assets, prompts and credentials remain outside the public repository and build. The read-only reference analysis does not import its code/models or enlarge any license.

## Do's and Don'ts

- Do use white space, black neutral functional UI and purple decorative atmosphere across platform-owned surfaces.
- Do use the current frosted header and measured sliding lens while preserving real brand and account state.
- Do keep natural soft mist on both sides, a white center, top clearance and gentle pointer response.
- Do preserve each route's working layout and avoid duplicate public headers in administration or the blog editor.
- Do verify Chinese, English and Japanese, mobile wrapping, focus, reduced motion and static fallbacks.
- Do retain actual public content, useful empty states, labeled fictional examples and original source/license details.
- Don't describe shared visual migration as a rewrite or full visual acceptance of every page.
- Don't restore purple action/selection/icon/link accents or the superseded plain transparent header as current requirements.
- Don't turn soft mist into mandatory high-contrast ribbons or one-sided color.
- Don't style authored bodies, artboards, color swatches or third-party previews as platform UI.
- Don't expose duplicate interactive labels, invent activity or simulate real account state.
- Don't call DOM label magnification physical refraction, copy reference code/models, or call MIT plus Commons Clause plain MIT.
- Don't import private Pro materials, revive the cancelled Cloudlight migration, expand a license or claim authorship of licensed fonts.
