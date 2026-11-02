# Shared glass navigation and 3D quantum background

This update follows the user's request to restore the homepage's liquid frosted navigation on Community, Blog spaces and Resources while giving these reading destinations a real interactive 3D point background. Documents and Skills inherit the same treatment as resource destinations. Existing content layouts, author designs and administration remain independent.

`QuantumBackdrop` owns a lazily imported Three.js renderer in React. `quantum-field.ts` creates a perspective camera and two transparent passes (Points and fine LineSegments) using procedural BufferGeometry and a vertex/fragment shader. Depth, three flowing particle currents, fine connecting strands, pointer displacement and camera parallax are calculated in the scene, rather than baked into an image. There is no GLB, texture, external image or post-processing stack. Procedural geometry is more suitable than a Blender asset for these deforming currents.

Rendering is capped at 30fps on desktop and 24fps on phones, with 10,368/3,600 points and a 1.4M/0.65M backing-pixel budget. Geometry and shader objects are reused; animation changes uniforms and the camera only. Hidden pages stop their frame loop. Reduced motion renders a static 3D view, and WebGL failure exposes a lightweight CSS fallback. Abort, late imports, context loss and unmount release resources.

`iavse-quantum.css` scopes the glass navigation to these destinations. It restores the homepage's centered navigation, logo and typography, with a bounded backdrop blur, progressively masked transparency and no boundary line. Scrolled content becomes visible through the top bar without reducing control legibility. Menus use a more opaque surface; reduced-transparency and unsupported-filter fallbacks are provided.

The review also fixed a community hydration race: PageMotion no longer writes indicator styles into streamed server navigation during initial hydration. CSS supplies the initial active state; navigation and resize transitions remain animated after a route change.

Validation includes shader/geometry, quality-budget, lifecycle, reduced-motion, pause/visibility, asynchronous disposal and route-motion tests, TypeScript and a production build. Desktop and phone browser checks cover all three destinations, real WebGL rendering, header blur, scroll state, menus and resource search.
