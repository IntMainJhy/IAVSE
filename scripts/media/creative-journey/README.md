# IAVSE product cinema

Original fourteen-second silent HyperFrames film for Home and Blog Spaces. The resource introduction uses the same visual world with a third chapter about useful sites instead of personal publishing. This directory is the editable source; deployed H.264 MP4s and WebP posters live in `public/media/product`.

The composition is authored HTML/CSS with a deterministic paused GSAP timeline. The foreground interface planes and camera transform in CSS 3D; the three chapters overlap via a short dissolve. The film is not a recording of a third-party site and does not contain external brand assets. It illustrates the site's capabilities rather than a pixel-perfect recording of the current UI.

## Reproduce

From the repository root, using Node 24+, FFmpeg and HyperFrames 0.9.20:

```sh
npx --yes hyperframes@0.9.20 check scripts/media/creative-journey
npx --yes hyperframes@0.9.20 snapshot scripts/media/creative-journey --at 2.8,7.1,12.6 --output /tmp/iavse-film-review
npx --yes hyperframes@0.9.20 render scripts/media/creative-journey -o public/media/product/iavse-creative-journey.mp4 --fps 30 --quality high --workers 2 --strict --no-best-effort
node scripts/media/creative-journey/prepare-resources.mjs
npx --yes hyperframes@0.9.20 check scripts/media/creative-journey/.generated/resources
npx --yes hyperframes@0.9.20 render scripts/media/creative-journey/.generated/resources -o public/media/product/iavse-resource-journey.mp4 --fps 30 --quality high --workers 2 --strict --no-best-effort
ffmpeg -ss 2.8 -i public/media/product/iavse-creative-journey.mp4 -frames:v 1 -c:v libwebp -quality 85 -y public/media/product/iavse-creative-journey.webp
ffmpeg -ss 2.8 -i public/media/product/iavse-resource-journey.mp4 -frames:v 1 -c:v libwebp -quality 85 -y public/media/product/iavse-resource-journey.webp
```

The CLI's current `check` replaces its deprecated separate `lint` / `validate` / `inspect` workflows and includes runtime, layout, motion and contrast checks. `snapshot` provides the animation frame review. The old `animation-map` command is not available in 0.9.20. Generated state, reports and render caches are ignored.

## Design and assets

See `DESIGN.md` for the palette and choreography. DM Sans is the existing site font, copied from `public/fonts/DMSans-Variable.woff2` to make the film independently renderable. Its OFL is in `assets/OFL.txt`. The serif type specimen is a generic serif example, not a third-party logo. No speech, music or soundtrack is included, so the silent autoplay never surprises visitors.

## Website behavior

`ProductCinema` supplies three localized chapter labels, a scrubber, play/pause/replay and a separately usable CSS 3D space. The latter has real depth planes, animated camera positions, mouse/pen or horizontal touch dragging, a keyboard-operable rotation range and reset control. All actions that leave the showcase use real site routes.

Video downloading waits until the section is near the viewport and motion is allowed, or the visitor explicitly requests playback/seeking. Playback pauses when off screen, hidden, paused globally or manually, and ends rather than endlessly looping. Reduced motion defaults to a stable poster; explicit play is still allowed. Decorative spatial content is hidden from assistive technology, with the same information presented in the chapter descriptions and links. Page scrolling stays entirely native.

## Reviewed checks

Both films pass runtime, layout and motion checks and all 54 sampled text contrast checks. The CLI suggests splitting the three scene rows into separate compositions; they intentionally share one compact, seekable timeline. Its small-text craft warning applies to illustrative interface labels; the full chapter narration is also available outside the video as localized text, and the primary film headlines and captions remain large. Critical text occlusion was corrected before rendering. Key frames at 2.8, 7.1, 12.6 and the final hold were visually inspected.
