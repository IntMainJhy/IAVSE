"use client";

import { useEffect, useRef } from "react";

// An original, layered colour field: distant light, soft body and nearer mist.
// This is procedural atmosphere, not a physical fluid or volumetric simulation.
const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform vec2 uSize;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uMotion;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
}

float cloud(vec2 p) {
  mat2 turn = mat2(0.80, -0.60, 0.60, 0.80);
  float n = noise(p) * 0.57;
  p = turn * p * 2.03 + 4.7;
  n += noise(p) * 0.29;
  p = turn * p * 2.01 + 8.2;
  return n + noise(p) * 0.14;
}

// Two depths share the same billow, but drift at different speeds. Smooth
// density keeps the shape soft; there are no thresholded outlines or ribbons.
vec2 plume(vec2 p, float time, float phase) {
  vec2 drift = vec2(time * 0.16, -time * 0.11);
  vec2 bend = vec2(cloud(p * 1.35 + drift + phase),
                   cloud(p * 1.15 - drift * 0.7 + phase + 9.3)) - 0.5;
  vec2 far = p + bend * 0.32;
  vec2 near = p + bend * 0.85 + vec2(0.10 * sin(time * 0.6 + phase), 0.08 * cos(time * 0.5 + phase));
  float body = exp(-dot(far * vec2(0.90, 0.78), far * vec2(0.90, 0.78)));
  float detail = cloud(near * vec2(1.65, 1.30) - drift * 1.3 + phase);
  vec2 fold = (near - vec2(0.36, 0.10)) * vec2(1.65, 1.05);
  float front = exp(-dot(fold, fold));
  return vec2(body * (0.58 + detail * 0.55), front * (0.15 + smoothstep(0.12, 0.88, detail) * 1.3));
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  float time = uTime * 0.17;
  float aspect = clamp(uSize.x / max(uSize.y, 1.0), 0.45, 2.0);
  vec2 delta = (uv - uPointer) * vec2(aspect, 1.0);
  float influence = exp(-dot(delta, delta) * 9.0);
  vec2 stir = vec2(-delta.y, delta.x) * uMotion.z * influence * 0.16
            + uMotion.xy * influence * 0.24;
  // A very small depth offset follows the pointer; the center never follows it.
  vec2 parallax = (uPointer - 0.5) * 0.025;
  vec2 nearUV = uv + stir + parallax;
  vec2 farUV = uv + parallax * 0.22;

  // Positions are normalized from each edge so both plumes remain on a phone.
  vec2 left = plume(vec2((nearUV.x + 0.055) / 0.31, (nearUV.y - 0.57) / 0.31), time, 1.4);
  vec2 right = plume(vec2((1.055 - nearUV.x) / 0.34, (nearUV.y - 0.63) / 0.34), time, 6.8);
  float leftVeil = exp(-dot((farUV - vec2(0.02, 0.37)) / vec2(0.52, 0.30), (farUV - vec2(0.02, 0.37)) / vec2(0.52, 0.30)));
  float rightVeil = exp(-dot((farUV - vec2(0.98, 0.43)) / vec2(0.50, 0.31), (farUV - vec2(0.98, 0.43)) / vec2(0.50, 0.31)));
  float leftDensity = leftVeil * 0.24 + left.x * 0.46 + left.y * 0.90;
  float rightDensity = rightVeil * 0.24 + right.x * 0.44 + right.y * 0.92;

  // Atmospheric perspective: the far veil is pale, nearer folds hold color.
  vec3 mint = mix(vec3(0.87, 0.95, 0.92), vec3(0.48, 0.75, 0.64), clamp(left.y * 0.82, 0.0, 0.85));
  vec3 sky = mix(vec3(0.89, 0.94, 0.99), vec3(0.45, 0.65, 0.89), clamp(right.y * 0.82, 0.0, 0.85));
  float totalDensity = leftDensity + rightDensity;
  float blueShare = rightDensity / max(totalDensity, 0.001);
  vec3 pigment = mix(mint, sky, blueShare);
  // A diffuse light opening separates the edges without drawing a visible seam.
  float centerLight = exp(-pow((uv.x - 0.5) / 0.255, 2.0));
  float breathingRoom = 1.0 - centerLight * 0.94;
  float clearance = smoothstep(100.0, 300.0, uv.y * uSize.y);
  float lowerFade = 1.0 - smoothstep(0.70, 1.0, uv.y);
  float coverage = clearance * lowerFade;
  float alpha = (1.0 - exp(-totalDensity * 1.55)) * breathingRoom * coverage;
  // Sub-pixel dithering prevents visible contour bands in the pale gradients.
  alpha = clamp(alpha + (hash(gl_FragCoord.xy) - 0.5) * coverage / 255.0, 0.0, 1.0);
  gl_FragColor = vec4(pigment * alpha, alpha);
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
    let touchId: number | null = null;
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

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || !event.isPrimary || motionPreference.matches || !canDraw()) return;
      const bounds = root.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / width;
      const y = (event.clientY - bounds.top) / height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      touchId = event.pointerId;
      pendingPointer = null;
      pointer.x = pointer.targetX = x;
      pointer.y = pointer.targetY = y;
      pointer.vx = pointer.vy = 0;
      pointer.energy = 0.72;
    };

    const onPointerEnd = (event: PointerEvent) => {
      if (event.pointerId === touchId) {
        touchId = null;
        pendingPointer = null;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const canStir = event.pointerId === touchId || (finePointer.matches && event.pointerType === "mouse");
      if (canStir && !motionPreference.matches && canDraw()) {
        pendingPointer = { x: event.clientX, y: event.clientY };
      }
    };

    const resetPointer = () => {
      touchId = null;
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
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerEnd, { passive: true });
    window.addEventListener("pointercancel", onPointerEnd, { passive: true });
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
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
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
          background: [
            "radial-gradient(ellipse 33% 38% at -3% 57%, rgb(143 203 178 / .68), rgb(176 222 202 / .32) 48%, transparent)",
            "radial-gradient(ellipse 36% 40% at 104% 63%, rgb(140 181 225 / .67), rgb(184 210 240 / .30) 48%, transparent)",
            "radial-gradient(ellipse 52% 40% at 2% 37%, rgb(220 243 234 / .64), transparent 90%)",
            "radial-gradient(ellipse 50% 42% at 98% 43%, rgb(224 237 251 / .68), transparent 90%)",
          ].join(", "),
          maskImage: "linear-gradient(180deg, transparent 100px, black 300px, black 70%, transparent)",
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
