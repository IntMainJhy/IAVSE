# IAVSE brand assets

IAVSE stands for **Insight · Artificial Intelligence · Vigilance · Seize · Evolve**. The approved mission is **“Insight through AI. Vigilance for Opportunity. Seize to Evolve.”** Its Chinese presentation is **“以洞察驱动智能，以敏锐发现机遇，以行动实现进化。”**

The mark is an **open aperture**: two solid, oblique facets form an open V silhouette, separated by a clear vertical negative-space slit. The upright slit references the I and the opening references the V in IAVSE. It replaces the retired Folivo lowercase-f mark. It uses original path geometry, with no font-derived outlines or third-party icon artwork.

The five ideas inform the whole visual system: the opening suggests insight, the related geometric facets suggest intelligence, the crisp boundaries suggest vigilance, their direction suggests action, and the unfolding spatial treatment suggests evolution. The favicon does not attempt to encode five tiny letters or pictograms.

## Source and deterministic exports

The source of truth is `src/app/icon.svg`, a 64px grid with white facets on deep indigo `#17234e`. Its central opening remains 8 source units wide, or 2px at 16px output. The final source was inspected at 16, 32, 48 and 64px. The static, solid silhouette retains its shape without glass, gradients, shadows or animation.

Run `npm run brand:icons` after changing the SVG. `scripts/brand-icons.mjs` deterministically generates:

- `public/brand/spaceyew-symbol.svg`: transparent blue navigation mark;
- `src/app/favicon.ico`: 16, 32 and 48px browser-tab icons;
- `src/app/apple-icon.png`: 180px icon flattened onto white;
- `public/brand/spaceyew-icon.png`: 512px metadata/share icon;
- `src/lib/brand-icon.ts`: versioned navigation URL using the first 12 characters of the SVG SHA-256.

The legacy filenames preserve existing links and integrations. SVG, ICO and 512px PNG retain transparent outer corners. PNG exports contain an origin note; no image-generation model is involved in these brand assets. Regenerate and commit the source, exports and URL module together so navigation and browser tabs agree.

## Placement and accessibility

The transparent symbol sits beside the complete IAVSE wordmark. It may be shown white on a dark background or blue on a light background through the site's existing treatment. `BrandMark` retains empty `alt` and `aria-hidden="true"`: the surrounding link takes its accessible name from the visible wordmark. A symbol used alone as a control must have its own accessible name.

Authored portfolio illustrations, résumé images, certificates and screenshots remain content, not reusable brand assets. The archived leaf-traveler character is not part of this mark or the current website.
