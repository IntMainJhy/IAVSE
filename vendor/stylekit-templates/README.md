# StyleKit template source distribution

These 37 templates are imported from https://github.com/AnxForever/stylekit at commit `38058485388d237745ccf58c6750c2ec661a72f4`, under MIT. They are not the earlier independent IAVSE design rewrites.

- `originals/`: exact upstream files, including shared source/typography evidence.
- `runtime/`: source with recorded platform changes and eight narrowly scoped layout repairs.
- `adapters/`: local route anchors, font mapping, image primitive, responsive drawer behavior and React mounting.
- `transforms.json`: source/runtime SHA-256 and each applied change.
- `fonts.json`: local font files, primary source URLs, SHA-256 and OFL notices.
- `licenses/`: original MIT, runtime dependency notices and each font OFL.
- `catalog.json`: only the 37 actual templates; original associated style rules are separately attributed.

Run `npm run build:template-sites` to rebuild independent assets and the route manifest. These assets load only inside `/template-sites/<slug>` documents. Two templates retain their child page routes. The document route bypasses IAVSE RootLayout and does not change the template into an IAVSE-styled page.

The current site’s repository license does not replace these third-party MIT/ISC/OFL terms. See `public/template-site-assets/THIRD_PARTY_LICENSES.txt` for distributed notices. Upstream sample text and branding remain sample content; real account, purchase or publishing services are not added.

The local build uses content-hashed JavaScript and CSS Module filenames, content-versioned shared stylesheets, and revalidated HTML. It removes stale generated entries/chunks after a successful build while retaining licensed fonts and notices.

The published verification scope and limitations are recorded in [the catalog audit](../../docs/template-catalog-audit-2026-11-08.md); detailed local screenshots and `qa.json` are not distributed. The original repository has several illustrative controls without implementation; the CRM template is a static interface with editable native inputs. No backend, real purchase, account, email-send or publishing service is implied. The limited repairs are listed per file in `transforms.json`; exact upstream originals remain unchanged.

Compiled JS/CSS, the generated route manifest and local QA evidence are excluded from Git. `npm run dev`, `npm test`, `npm run typecheck` and `npm run build` rebuild the required preview assets first. Original TSX, adapters, transformation records and licensed font source files remain in Git.
