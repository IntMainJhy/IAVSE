"use client";

// Source: DavidHDev/rbp-portfolio @ 1581b9b8e5876f60e5eb844970747506980c4412.
// IAVSE content adaptation; upstream layout and normal-motion values retained. See docs/licenses/RBP-Portfolio.txt.


import { Atom, Box, Braces, Code2, Layers3, MousePointer2, Move, RotateCcw, TextCursorInput, Triangle, Zap } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { aboutLabels } from "./copy";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

type Chip = {
  label: string;
  slug: string;
  bg: string;
  fg: string;
  icon: ComponentType<{ className?: string; color?: string }>;
};

const CHIPS: Chip[] = [
  { label: "React", slug: "react", bg: "#1FB6CB", fg: "#ffffff", icon: Atom },
  { label: "Next.js", slug: "nextjs", bg: "#1f1f1f", fg: "#ffffff", icon: Triangle },
  { label: "TypeScript", slug: "typescript", bg: "#2F74C0", fg: "#ffffff", icon: Braces },
  { label: "Motion", slug: "motion", bg: "#5b54ff", fg: "#ffffff", icon: Move },
  { label: "Lenis", slug: "lenis", bg: "#111111", fg: "#ffffff", icon: MousePointer2 },
  { label: "OGL", slug: "ogl", bg: "#1f1f1f", fg: "#ffffff", icon: Box },
  { label: "Three.js", slug: "threejs", bg: "#181717", fg: "#ffffff", icon: Layers3 },
  { label: "GSAP", slug: "gsap", bg: "#0AE448", fg: "#0a0a0a", icon: Zap },
  { label: "Tiptap", slug: "tiptap", bg: "#0a0a0a", fg: "#ffffff", icon: TextCursorInput },
  { label: "Node.js", slug: "nodejs", bg: "#2F7742", fg: "#ffffff", icon: Code2 },
];

const CHIP_RADIUS = 14;
const ICON_RADIUS = 10;
const WALL_PAD = 16;

type ChipState = {
  chip: Chip;
  body: Matter.Body;
  width: number;
  height: number;
};

export function Stack({ locale = "zh" }: { locale?: string }): ReactNode {
  const quiet = useReducedMotion();
  const labels = aboutLabels(locale);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure || quiet) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const Matter = await import("matter-js");
      if (cancelled) return;

      const {
        Engine,
        Runner,
        World,
        Bodies,
        Body,
        Mouse,
        MouseConstraint,
        Events,
      } = Matter;

      const measureChildren = Array.from(measure.children) as HTMLElement[];
      const dims = measureChildren.map((el) => {
        const r = el.getBoundingClientRect();
        return { w: Math.max(80, r.width), h: Math.max(28, r.height) };
      });

      let width = container.clientWidth;
      let height = container.clientHeight;

      const engine = Engine.create();
      engine.gravity.y = 1;
      const world = engine.world;

      const wallThickness = 400;
      const floor = Bodies.rectangle(
        width / 2,
        height - WALL_PAD + wallThickness / 2,
        width * 3,
        wallThickness,
        { isStatic: true }
      );
      const leftWall = Bodies.rectangle(
        WALL_PAD - wallThickness / 2,
        height / 2,
        wallThickness,
        height * 4,
        { isStatic: true }
      );
      const rightWall = Bodies.rectangle(
        width - WALL_PAD + wallThickness / 2,
        height / 2,
        wallThickness,
        height * 4,
        { isStatic: true }
      );
      World.add(world, [floor, leftWall, rightWall]);

      const states: ChipState[] = CHIPS.map((chip, i) => {
        const dim = dims[i] ?? { w: 120, h: 36 };
        const { w, h } = dim;
        const halfW = w / 2;
        const minX = WALL_PAD + halfW + 4;
        const maxX = width - WALL_PAD - halfW - 4;
        const x = minX + Math.random() * Math.max(1, maxX - minX);
        const y = -80 - i * 60 - Math.random() * 120;
        const body = Bodies.rectangle(x, y, w, h, {
          chamfer: { radius: CHIP_RADIUS },
          restitution: 0.35,
          friction: 0.5,
          frictionAir: 0.025,
          density: 0.0018,
          angle: (Math.random() - 0.5) * 0.4,
        });
        World.add(world, body);
        return { chip, body, width: w, height: h };
      });

      const mouse = Mouse.create(container);

      const wheelTarget = mouse.element as HTMLElement & {
        mousewheel?: EventListener;
      };
      if (wheelTarget.mousewheel) {
        wheelTarget.removeEventListener("wheel", wheelTarget.mousewheel);
        wheelTarget.removeEventListener(
          "DOMMouseScroll",
          wheelTarget.mousewheel
        );
      }

      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.2,
          damping: 0.2,
          render: { visible: false },
        },
      });
      World.add(world, mouseConstraint);

      Events.on(mouseConstraint, "startdrag", () => {
        container.style.cursor = "grabbing";
      });
      Events.on(mouseConstraint, "enddrag", () => {
        container.style.cursor = "grab";
      });

      const runner = Runner.create();
      Runner.run(runner, engine);

      let raf = 0;
      const tick = (): void => {
        for (let i = 0; i < states.length; i++) {
          const s = states[i];
          const el = chipRefs.current[i];
          if (!s || !el) continue;
          const { x, y } = s.body.position;
          el.style.transform = `translate3d(${x - s.width / 2}px, ${y - s.height / 2}px, 0) rotate(${s.body.angle}rad)`;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const onResize = (): void => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        if (newW === width && newH === height) return;
        Body.setPosition(floor, {
          x: newW / 2,
          y: newH - WALL_PAD + wallThickness / 2,
        });
        Body.setPosition(leftWall, {
          x: WALL_PAD - wallThickness / 2,
          y: newH / 2,
        });
        Body.setPosition(rightWall, {
          x: newW - WALL_PAD + wallThickness / 2,
          y: newH / 2,
        });
        width = newW;
        height = newH;
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(container);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        Runner.stop(runner);
        World.clear(world, false);
        Engine.clear(engine);
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [resetKey, quiet]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 max-md:justify-center">
        <h3 className="text-foreground text-[15px] font-semibold tracking-tight">
          {labels.stack}
        </h3>
      </div>

      <div className="border-foreground/5 bg-foreground/2 dark:bg-foreground/5 relative h-40 overflow-hidden rounded-4xl border sm:h-64" style={quiet ? { height: "auto", minHeight: 160 } : undefined}>
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          aria-label={labels.reset}
          className="focus-ring border-foreground/8 bg-background text-foreground/70 hover:text-foreground absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors"
        >
          <RotateCcw
            className="h-4 w-4"
            strokeWidth={2.25}
            aria-hidden="true"
          />
        </button>

        <div
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute top-0 left-0 flex flex-wrap gap-2"
        >
          {CHIPS.map((chip) => (
            <ChipPill key={`m-${chip.label}`} chip={chip} />
          ))}
        </div>

        <div
          ref={containerRef}
          className="absolute inset-0 cursor-grab select-none"
          style={quiet ? { touchAction: "auto", position: "relative", display: "flex", flexWrap: "wrap", gap: 8, padding: "56px 16px 16px" } : { touchAction: "none" }}
        >
          {CHIPS.map((chip, i) => (
            <div
              key={`${resetKey}-${chip.label}`}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              data-stack-chip
              className="pointer-events-none absolute top-0 left-0 will-change-transform"
              style={quiet ? { position: "relative", transform: "none" } : { transform: "translate3d(-9999px, -9999px, 0)" }}
            >
              <ChipPill chip={chip} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChipPill({ chip }: { chip: Chip }): ReactNode {
  const Icon = chip.icon;
  return (
    <div
      className="dark:ring-1 dark:ring-white/15 inline-flex items-center gap-2 p-1 pr-2 text-[15px] font-medium tracking-tight sm:text-[16px]"
      style={{
        backgroundColor: chip.bg,
        color: chip.fg,
        borderRadius: `${CHIP_RADIUS}px`,
      }}
    >
      <span
        className="inline-flex h-8 w-8 items-center justify-center bg-white/95"
        style={{ borderRadius: `${ICON_RADIUS}px` }}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" color="#0a0a0a" aria-hidden="true" />
      </span>
      <span>{chip.label}</span>
    </div>
  );
}
