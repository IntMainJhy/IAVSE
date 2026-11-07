# IAVSE product films

Three separate fourteen-second silent films, rebuilt on 2026-11-08. Home introduces the whole product; Blog Spaces demonstrates a personal canvas and its output; Resources presents the design library, specific Skill recommendations, and the tools directory. Each has its own authored scenes, composition, pacing and MP4. They do not substitute titles into one shared movie.

## Source

- `films/home.html`: optical design examples → actual Skill directory → the published creator homepage.
- `films/blogs.html`: public interactive canvas, including a real text-color edit → three bundled example styles → desktop and phone preview.
- `films/resources.html`: actual design index → enlarged real Skill recommendations → actual website/tool directory.
- `films/shared.css`: shared typography and three independent visual treatments.
- `prepare-films.mjs`: deterministic scene timelines and asset preparation. It writes three editable standalone HyperFrames projects into `.generated/` and refreshes the root home preview.
- `assets/captures/`: public product surfaces captured in Ego Browser. Provenance is recorded alongside the assets. No authenticated workspace, private documents, or invented product controls are included.

The local site's DM Sans font is bundled under OFL. GSAP comes from the site's installed dependency and is copied only to ignored prepared directories. Rendering has no CDN or remote font requirement. Existing site artwork and screenshots retain their original licensing and provenance.

## Reproduce

From the website repository root, with dependencies installed, Node 24+, FFmpeg and HyperFrames 0.9.20:

```sh
node scripts/media/creative-journey/prepare-films.mjs
npx --yes hyperframes@0.9.20 check scripts/media/creative-journey/.generated/home
npx --yes hyperframes@0.9.20 check scripts/media/creative-journey/.generated/blogs
npx --yes hyperframes@0.9.20 check scripts/media/creative-journey/.generated/resources
npx --yes hyperframes@0.9.20 preview scripts/media/creative-journey/.generated/home --background --port 3017
npx --yes hyperframes@0.9.20 snapshot scripts/media/creative-journey/.generated/home --at 2.8,6.8,12.6 --output /tmp/iavse-home-review
npx --yes hyperframes@0.9.20 render scripts/media/creative-journey/.generated/home -o public/media/product/iavse-creative-journey.mp4 --fps 30 --quality high --workers 2 --strict --no-best-effort
npx --yes hyperframes@0.9.20 render scripts/media/creative-journey/.generated/blogs -o public/media/product/iavse-blog-journey.mp4 --fps 30 --quality high --workers 2 --strict --no-best-effort
npx --yes hyperframes@0.9.20 render scripts/media/creative-journey/.generated/resources -o public/media/product/iavse-resource-journey.mp4 --fps 30 --quality high --workers 2 --strict --no-best-effort
ffmpeg -ss 2.8 -i public/media/product/iavse-creative-journey.mp4 -frames:v 1 -c:v libwebp -quality 88 -y public/media/product/iavse-creative-journey.webp
ffmpeg -ss 6.2 -i public/media/product/iavse-blog-journey.mp4 -frames:v 1 -c:v libwebp -quality 88 -y public/media/product/iavse-blog-journey.webp
ffmpeg -ss 2.8 -i public/media/product/iavse-resource-journey.mp4 -frames:v 1 -c:v libwebp -quality 88 -y public/media/product/iavse-resource-journey.webp
```

1280×720, 30 fps, H.264, 14 seconds, no audio. Chapter changes occur at 4.1 and 8.6 seconds. Public video and poster URLs include a stable version query to invalidate previously cached films.

`ProductCinema` retains lazy loading, manual play/pause/replay, seeking, offscreen and hidden-tab suspension, and reduced-motion poster defaults. An independent interactive CSS 3D view has page-specific content. The player lives below the uncropped film, so it does not obscure the footage at desktop or mobile widths. Localized HTML describes every chapter and supplies the real destination links.
