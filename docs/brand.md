# IAVSE brand assets

IAVSE stands for **Insight · Artificial Intelligence · Vigilance · Seize · Evolve**. The approved mission is **“Insight through AI. Vigilance for Opportunity. Seize to Evolve.”** Its Chinese presentation is **“以洞察驱动智能，以敏锐发现机遇，以行动实现进化。”**

The mark is the **outlined V** approved by the user from the independent exploration page. Several oblique strokes converge into one V silhouette. The exact original path is shared by website navigation, browser-tab icons, touch icons and metadata exports; it contains no font-derived outlines or third-party artwork.

## Source and deterministic exports

The source of truth is `src/app/icon.svg`: a 28-unit viewBox, 2-unit stroke and white linework on graphite `#161617`. Its geometry matches the approved exploration-page symbol. Run `npm run brand:icons` after changing it. `scripts/brand-icons.mjs` generates:

- `public/brand/iavse-symbol.svg`: transparent black navigation/export mark;
- `src/app/favicon.ico`: 16, 32 and 48px browser-tab icons;
- `src/app/apple-icon.png`: 180px touch icon;
- `public/brand/iavse-icon.png`: 512px metadata icon;
- `src/lib/brand-icon.ts`: the versioned URL, viewBox and path used by `BrandMark`.

The component renders the shared path inline with `currentColor`, so it follows black text on Apple-style light surfaces and white text over the approved dark home opening. Generated PNGs retain an embedded origin note. Regenerate and commit the source, exports and module together.

## Placement and accessibility

The abstract symbol is decorative beside the IAVSE wordmark. `BrandMark` uses `aria-hidden="true"` and `focusable="false"`; the surrounding link owns the accessible name. A symbol used alone as a control needs its own accessible label.

User avatars, authored portfolio illustrations and screenshots remain user content. They are not changed by the shared brand update.

## Compatibility identifiers

The public product, authored asset filenames, font aliases, integration and deployment examples use IAVSE. New integrations use `IAVSE_URL`, `IAVSE_TOKEN`, `iavse_*` tools and `integrations/iavse-mcp.mjs`. Old MCP launch paths, tool names and environment variables remain compatibility inputs; old public brand/Skill URLs redirect to their IAVSE equivalents without duplicate assets. Persisted database ownership keys and token formats are unchanged. Existing deployments keep their own service user, paths and data directory; new deployment examples do not migrate a live installation.
