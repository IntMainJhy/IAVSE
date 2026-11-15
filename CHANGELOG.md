# Changelog / 更新记录

This is a curated record of repository and product changes, not a claim that every `main` commit is a production release. Git history remains the complete record. / 本页记录主要变化，不将每个主线提交视为正式生产发行。

## Unreleased / 待发布

### 2026-11-15 · Image-led template gallery / 模板大图画廊

- Place titles inside images and remove all external card captions. Preserve original image proportions without cropping, stretching or hover zoom; stagger column starts with grid masonry that retains DOM order and existing positions when more entries arrive.
- Expand the directory across the available width, with three image columns on wide screens, two on standard desktops and one at 900px or below. Use transparent frosted controls and design-page navigation surfaces without white fills; remove repository arrows.
- Move long descriptions and classifications out of directory cards while retaining details, source links, bookmarks, filtering and the existing on-demand preview.
- Preserve static lazy-loaded covers, bounded catalog batches and the four shared site appearances.

### 2026-11-15 · Default appearance and repository presentation / 默认界面与仓库展示

- Make Sea breeze the default for new or invalid appearance preferences; retain all four saved UI choices across routes.
- Disable the announcement strip by default and close it on the current local site without leaving a spacer. Keep the owner's explicit announcement configuration available.
- Show one signed-out login entry in the shared header after its account controls load.
- Refresh Chinese and English READMEs, repository descriptions, four-style comparisons, mobile and functional-page screenshots, and the GitHub social preview with actual signed-out production captures.
- Record screenshot provenance and source hashes. Push the same website commits directly to GitHub and GitCode / AtomGit; do not enable repository mirroring.

### 2026-11-15 · Four site styles and navigation / 四套全站 UI 与导航优化

- Restore GitHub and AtomGit links at the upper right across all four shared headers, including phone layouts; remove the separate public light/dark button.
- Keep all four choices reachable in short landscape viewports, and retain the editor switcher within a 320px phone toolbar. Update the original-home preview regression to cover the shared selector without changing embedded author content.
- Preserve the original main-branch layout, flowing mist and light/dark appearance as “经典原版”, alongside the three selected styles in the shared switcher. Keep all styles across routes and refreshes.
- Remove the brand wordmark from functional pages and replace their animated backgrounds with static art or CSS. Keep homepage motion and authored member content.
- Use native navigation links with bounded prefetch and shared pending-work gates; reveal the blog gallery after the first two prepared previews while loading the rest progressively.
- Integrate `background` into `main` while retaining the branch. This is source integration and local preview, not a production deployment.

### 2026-11-13 · Spatial mist study (`background` branch)

- Replace the broad two-color wash with distant light, a soft middle body and denser, slowly deforming edge mist. Keep a stable central clearing and the existing white/neutral UI.
- Add subtle depth-dependent pointer movement and gradient dithering; retain mobile two-sided composition, reduced motion, offscreen pausing and a matching four-layer static fallback. No new dependencies or private assets.
- Keep this study on `background`; the completed `main` baseline is unchanged.

### 2026-11-13 · Main-branch integration / 主线整合

- Integrate all 24 design and functional commits through `3b943f3` into `main` without rewriting history; retain `desgin`.
- Update current branch, handoff, setup, architecture and dual-UI status across the active documentation. Keep dated captures and acceptance evidence unchanged in scope.
- Preserve pre-existing local archive changes outside the commit. GitHub remains the writable source; AtomGit is a read-only downstream mirror and must be verified independently.
- This is a source handoff, not a production deployment, client release or change to the existing noncommercial license.

### 2026-11-13 · Product explanation and development closeout

- Expanded the homepage with three illustrated capability cards and a native getting-started FAQ, with matching Chinese, English and Japanese copy, dark surfaces and repeat reveals.
- Fixed announcement pause/resume action labels in all three languages and verified both state transitions.
- Aligned legacy HTTP assertions with current navigation, publication rules, author binding and showcase routes while retaining permission, visibility and draft isolation checks.
- Reconciled active architecture, administration, catalog, design and setup guides; added current development scope and a dated acceptance matrix. Historical captures remain explicitly dated.
- Local regression covers 724 unit tests and 23 HTTP suites. Upload regression used 64 MiB including a restart, not a fresh 10 GB capacity test. Production, SMTP and identity-verification integration remain separate work.


### 2026-11-09 · Repository presentation / 仓库展示

- Add theme-aware SVG IAVSE wordmarks, a Chinese default README and a full English README.
- Refresh current-branch screenshots, feature descriptions, setup instructions and learning entry points.
- Add support, security reporting, participation guidance, issue forms, a PR template and CI checks.
- Retain PolyForm Noncommercial 1.0.0, original attribution and third-party licenses.

### 2026-11-09 · Homepage product spaces / 首页产品空间

Source through `427cdc9`:

- Present resources, public community sharing and blog spaces as three working product chapters.
- Add featured resource tabs/search and a path to the full directory.
- Display genuine public community content or truthful empty/unavailable states.
- Compare built-in blog examples and link to actual pages and the editor.
- Use native scroll-driven spatial staging on eligible viewports, readable flow on mobile/reduced motion, and one continuous optical homepage environment.

### 2026-11-08 · Catalog, templates and brand / 目录、模板与品牌

- Unify the approved outlined V across navigation, favicons and exported icons.
- Correct gallery readiness and render the actual built-in templates in showcase pages.
- Query the design directory in bounded batches with live cache invalidation.
- Add verified template sources and distinguish project templates from design-system previews.

## Earlier records / 历史记录

- [2026-11-06 cleanup](docs/cleanup-2026-11-06.md)
- [2026-11-04 repository update](docs/release-2026-11-04.md)
- [2026-11-02 audit and release notes](docs/release-2026-11-02.md)
- [Complete commits](https://github.com/IntMainJhy/IAVSE/commits/main/)

Historical validation and performance results retain their original scope and dates.
