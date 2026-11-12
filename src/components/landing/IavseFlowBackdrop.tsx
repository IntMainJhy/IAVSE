"use client";

import { useEffect, useRef } from "react";

// An original, domain-warped colour field. This approximates slowly flowing mist;
// it does not implement a physical fluid solver or use simulation textures.
const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec2 vUv;
uniform vec2 uSize;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uMotion;

// Two intersecting stream waves create a slowly turning, divergence-free warp.
vec2 current(vec2 p, float phase) {
  float wave = cos(p.x * 1.35 - p.y * 1.7 + phase);
  return vec2(
    -1.7 * wave + 0.68 * cos(p.y * 2.2 - phase * 0.73),
    -1.35 * wave + 0.72 * sin(p.x * 1.8 + phase * 0.61)
  );
}

// Each edge has its own diffuse field and phase. A field can change shape
// without a shared gate moving all visible colour to the opposite edge.
vec2 mist(vec2 p, float time, float phase) {
  vec2 q = p;
  q += current(q * 1.15, time * 0.83 + phase) * 0.20;
  q += current(q * 2.30, -time * 0.57 + 1.4 + phase * 0.73) * 0.105;
  q += vec2(
    sin(q.y * 3.8 + time * 0.39 + phase),
    cos(q.x * 3.1 - time * 0.31 + phase * 0.61)
  ) * 0.075;

  float first = q.x + sin(q.y * 2.45 - time * 0.31 + phase * 0.41) * 0.58 - 0.34;
  float second = q.y * 0.86 + sin(q.x * 2.3 + time * 0.27 + phase) * 0.47 - 0.16;
  float sheetA = 1.0 - smoothstep(0.18, 0.94, abs(first));
  float sheetB = 1.0 - smoothstep(0.07, 0.59, abs(second));
  float opening = 0.34 + 0.66 * smoothstep(-0.55, 0.65, sin(q.x * 2.15 - q.y * 1.8 + time * 0.22 + phase));
  float density = clamp((sheetA * 0.78 + sheetB * 0.48) * opening, 0.0, 1.0);
  float tint = 0.5 + 0.5 * sin(q.x * 1.9 + q.y * 2.6 + phase + time * 0.21);
  return vec2(density, tint);
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  float aspect = uSize.x / max(uSize.y, 1.0);
  vec2 p = (uv - vec2(0.5, 0.52)) * vec2(aspect, 1.0);
  float time = uTime * 0.12;

  // The cursor gently bends the existing mist instead of adding a glow on top.
  vec2 cursor = (uPointer - vec2(0.5, 0.52)) * vec2(aspect, 1.0);
  vec2 offset = p - cursor;
  float influence = exp(-dot(offset, offset) * 7.0);
  float turn = uMotion.z * influence * (0.58 + uMotion.x - uMotion.y);
  p += vec2(-offset.y, offset.x) * turn;
  p += uMotion.xy * influence * 0.95;

  vec2 stirred = p / vec2(aspect, 1.0) + vec2(0.5, 0.52);
  // Normalising from each edge gives a phone the same two-sided composition
  // as a desktop. Different phases and vertical domains avoid a mirrored seam.
  vec2 left = mist(vec2(stirred.x / 0.34, (stirred.y - 0.53) * 1.65), time, 0.8);
  vec2 right = mist(vec2((1.0 - stirred.x) / 0.37, (stirred.y - 0.59) * 1.50 + 0.17), time, 3.25);
  float leftAnchor = 1.0 - smoothstep(0.03, 0.42, uv.x);
  float rightAnchor = smoothstep(0.58, 0.97, uv.x);
  float leftHeight = 1.0 - smoothstep(0.24, 0.62, abs(uv.y - 0.56));
  float rightHeight = 1.0 - smoothstep(0.24, 0.62, abs(uv.y - 0.60));
  // A soft density floor belongs to each edge, so neither can disappear at
  // a particular phase. Only the irregular internal diffusion is animated.
  float leftDensity = leftAnchor * leftHeight * (0.32 + 0.68 * left.x);
  float rightDensity = rightAnchor * rightHeight * (0.32 + 0.68 * right.x);

  // Pixel-based clearance keeps the top of the page free of pigment at every size.
  float clearance = smoothstep(100.0, 320.0, uv.y * uSize.y);
  float lowerFade = 1.0 - smoothstep(0.79, 1.0, uv.y);
  float coverage = clearance * lowerFade;

  vec3 mint = mix(vec3(0.78, 0.93, 0.86), vec3(0.61, 0.86, 0.77), left.y);
  vec3 sky = mix(vec3(0.83, 0.92, 0.99), vec3(0.64, 0.82, 0.97), right.y);
  // The two edge fields have disjoint anchors. Premultiplied alpha lets the
  // page supply its own center and the seamless ground beneath the lower fade.
  vec3 pigment = mint * leftDensity + sky * rightDensity;
  gl_FragColor = vec4(pigment * coverage, (leftDensity + rightDensity) * coverage);
}
`;

export default function IavseFlowBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const fallback = fallbackRef.current;
    if (!root || !canvas || !fallback) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const gl = (() => {
      try {
        return canvas.getContext("webgl", {
          alpha: true,
          premultipliedAlpha: true,
          antialias: false,
          depth: false,
          stencil: false,
          powerPreference: "low-power",
        });
      } catch {
        return null;
      }
    })();
    if (!gl) return;

    const compile = (kind: number, source: string) => {
      const shader = gl.createShader(kind);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    if (!vertex || !fragment || !program || !buffer) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
      return;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      return;
    }

    const uniforms = {
      size: gl.getUniformLocation(program, "uSize"),
      time: gl.getUniformLocation(program, "uTime"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      motion: gl.getUniformLocation(program, "uMotion"),
    };
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    let disposed = false;
    let contextLost = false;
    let frameId = 0;
    let previousFrame = 0;
    let elapsed = 0;
    let width = 1;
    let height = 1;
    let inView = false;
    let pendingPointer: { x: number; y: number } | null = null;
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, vx: 0, vy: 0, energy: 0 };

    const stop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      previousFrame = 0;
    };

    const canDraw = () => !disposed && !contextLost && inView && !document.hidden;

    const draw = () => {
      if (!canDraw()) return;
      gl.uniform2f(uniforms.size, width, height);
      gl.uniform1f(uniforms.time, motionPreference.matches ? 0 : elapsed);
      gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
      gl.uniform3f(uniforms.motion, pointer.vx, pointer.vy, pointer.energy);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!fallback.hidden) {
        fallback.hidden = true;
        canvas.style.opacity = "1";
      }
    };

    const updatePointer = (delta: number) => {
      if (pendingPointer) {
        const bounds = root.getBoundingClientRect();
        const x = (pendingPointer.x - bounds.left) / Math.max(bounds.width, 1);
        const y = (pendingPointer.y - bounds.top) / Math.max(bounds.height, 1);
        if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
          const dx = x - pointer.targetX;
          const dy = y - pointer.targetY;
          pointer.vx = Math.max(-0.3, Math.min(0.3, pointer.vx + dx * 1.8));
          pointer.vy = Math.max(-0.3, Math.min(0.3, pointer.vy + dy * 1.8));
          pointer.energy = Math.min(1, pointer.energy + Math.hypot(dx, dy) * 6.0 + 0.035);
          pointer.targetX = x;
          pointer.targetY = y;
        }
        pendingPointer = null;
      }
      const follow = 1 - Math.exp(-delta * 9);
      pointer.x += (pointer.targetX - pointer.x) * follow;
      pointer.y += (pointer.targetY - pointer.y) * follow;
      pointer.vx *= Math.exp(-delta * 3.0);
      pointer.vy *= Math.exp(-delta * 3.0);
      pointer.energy *= Math.exp(-delta * 1.3);
    };

    const animate = (now: number) => {
      frameId = 0;
      if (!canDraw() || motionPreference.matches) return;
      const delta = previousFrame ? Math.min((now - previousFrame) / 1000, 0.05) : 0;
      previousFrame = now;
      elapsed += delta;
      updatePointer(delta);
      draw();
      frameId = window.requestAnimationFrame(animate);
    };

    const syncPlayback = () => {
      stop();
      if (!canDraw()) return;
      draw();
      if (!motionPreference.matches) frameId = window.requestAnimationFrame(animate);
    };

    const checkVisibility = () => {
      const bounds = root.getBoundingClientRect();
      inView = bounds.width > 0 && bounds.height > 0
        && bounds.bottom > 0 && bounds.top < window.innerHeight
        && bounds.right > 0 && bounds.left < window.innerWidth;
    };

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      // The broad colour field stays smooth with fewer fragments on high-DPI screens.
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.65;
      const pixelWidth = Math.max(1, Math.round(width * scale));
      const pixelHeight = Math.max(1, Math.round(height * scale));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        gl.viewport(0, 0, pixelWidth, pixelHeight);
      }
      checkVisibility();
      syncPlayback();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (finePointer.matches && !motionPreference.matches && canDraw() && event.pointerType === "mouse") {
        pendingPointer = { x: event.clientX, y: event.clientY };
      }
    };

    const resetPointer = () => {
      pendingPointer = null;
      pointer.vx = 0;
      pointer.vy = 0;
      pointer.energy = 0;
    };

    const onMotionChange = () => {
      resetPointer();
      syncPlayback();
    };

    const onVisibilityChange = () => {
      resetPointer();
      syncPlayback();
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      fallback.hidden = false;
      canvas.style.opacity = "0";
      stop();
    };

    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0;
      syncPlayback();
    });
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    const onScroll = () => {
      const wasInView = inView;
      checkVisibility();
      if (inView !== wasInView) syncPlayback();
    };

    observer?.observe(root);
    resizeObserver?.observe(root);
    window.addEventListener("resize", resize, { passive: true });
    if (!observer) window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", resetPointer);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onMotionChange);
    finePointer.addEventListener("change", resetPointer);
    canvas.addEventListener("webglcontextlost", onContextLost);
    resize();

    return () => {
      disposed = true;
      fallback.hidden = false;
      canvas.style.opacity = "0";
      stop();
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", resetPointer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", onMotionChange);
      finePointer.removeEventListener("change", resetPointer);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="iavse-flow-backdrop"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <div
        ref={fallbackRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 34% 43% at 0% 56%, #ace1ca, #e5f4ec 48%, transparent), radial-gradient(ellipse 37% 42% at 100% 60%, #b6d9f5, #e8f2fc 48%, transparent)",
          maskImage: "linear-gradient(180deg, transparent 100px, black 320px, black 79%, transparent)",
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
