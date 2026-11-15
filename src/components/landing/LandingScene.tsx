'use client';

import {useEffect, useRef, useState} from 'react';
import type {HomeStyle} from './HomeStyleProvider';

type Scene = {render: (time: number, x: number, y: number, open?: boolean) => void; resize: (width: number, height: number) => void; dispose: () => void};

/** One live scene at a time. Switching styles releases the previous GPU resources. */
export function LandingScene({style, paused, opened, dusk}: {style: Exclude<HomeStyle, 'classic'>; paused: boolean; opened: boolean; dusk: boolean}) {
  const canvas = useRef<HTMLCanvasElement>(null), stage = useRef<HTMLDivElement>(null), art = useRef<HTMLDivElement>(null);
  const state = useRef({paused, opened});
  state.current = {paused, opened};
  const sync = useRef<() => void>(() => {});
  const [renderer, setRenderer] = useState('loading');
  useEffect(() => {sync.current();}, [paused, opened]);
  useEffect(() => {
    const element = stage.current, target = canvas.current;
    if (!element || !target) return;
    let disposed = false, scene: Scene | undefined, frame = 0, time = 0, last = 0, x = 0, y = 0, tx = 0, ty = 0, visible = true, failed = false;
    setRenderer('loading');
    const draw = () => {
      if (failed || disposed) return;
      try {scene?.render(time, x, y, state.current.opened);} catch {fail();}
    };
    const stop = () => {cancelAnimationFrame(frame); frame = 0;};
    const tick = (now: number) => {
      frame = 0;
      if (disposed || failed || state.current.paused || document.hidden || !visible) return;
      const dt = Math.max(0, Math.min(.04, (now - last) / 1000)); last = now; time += dt;
      const ease = 1 - Math.exp(-dt * 3); x += (tx - x) * ease; y += (ty - y) * ease;
      draw();
      if (!failed) frame = requestAnimationFrame(tick);
    };
    const start = () => {if (scene && !disposed && !failed && !frame && !state.current.paused && !document.hidden && visible) {last = performance.now(); frame = requestAnimationFrame(tick);}};
    function fail() {failed = true; stop(); if (!disposed) setRenderer('fallback');}
    const resize = () => {if (!scene) return; const box = element.getBoundingClientRect(); scene.resize(box.width, box.height); draw();};
    const update = () => {stop(); draw(); start();};
    sync.current = update;
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || state.current.paused) return;
      const box = element.getBoundingClientRect(); tx = (event.clientX - box.left) / box.width * 2 - 1; ty = (event.clientY - box.top) / box.height * 2 - 1;
    };
    const leave = () => {tx = ty = 0;};
    const lost = (event: Event) => {event.preventDefault(); fail();};
    const observer = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(entries => {visible = entries[0].isIntersecting; update();});
    observer.observe(element); intersection.observe(element);
    window.addEventListener('pointermove', move, {passive: true}); document.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', update); target.addEventListener('webglcontextlost', lost);
    async function load() {
      if (disposed) return;
      try {
        if (style === 'anime') {
          const context = target!.getContext('2d');
          if (!context) throw new Error('Canvas unavailable');
          let width = 0, height = 0;
          scene = {
            resize(w, h) {width = w; height = h; const dpr = Math.min(devicePixelRatio, 1.5); target!.width = w * dpr; target!.height = h * dpr; context!.setTransform(dpr, 0, 0, dpr, 0, 0);},
            render(t, px, py) {
              if (art.current) art.current.style.transform = `translate3d(${px*9+Math.sin(t*.095)*3}px,${py*5}px,0) scale(${1.025+Math.sin(t*.08)*.008})`;
              context!.clearRect(0, 0, width, height);
              for (let i = 0; i < 32; i++) {
                const r = .6 + i%4*.42, phase = i*1.71, posX = (i*73.37%100)/100*width+Math.sin(t*.22+phase)*18-px*r*7;
                const posY = (((i*37.71%100)/100*height-t*(2+i%5))%(height+80)+height+80)%(height+80)-40;
                const alpha = (.13+Math.sin(t*.8+phase)*.09)*Math.max(0, Math.min(1, posY/180));
                context!.beginPath(); context!.fillStyle = `rgba(95,156,181,${alpha})`; context!.arc(posX, posY, r, 0, Math.PI*2); context!.fill();
              }
            },
            dispose() {context.clearRect(0, 0, width, height);},
          };
        } else {
          const module = style === 'fly' ? await import('./scenes/fly-scene') : await import('./scenes/brand-scene');
          if (disposed) return;
          scene = module.createScene(target!);
        }
        if (disposed) {scene?.dispose(); return;}
        resize();
        if (!failed) setRenderer(style === 'anime' ? 'canvas' : 'webgl');
        start();
      } catch {fail();}
    }
    // A route can mount effects before its first paint. Keep the static scene
    // visible and let the destination paint before allocating a GPU context.
    let startupTimer: ReturnType<typeof setTimeout> | undefined;
    const startupFrame = requestAnimationFrame(() => {
      startupTimer = setTimeout(() => {void load();}, 0);
    });
    return () => {
      disposed = true; cancelAnimationFrame(startupFrame); clearTimeout(startupTimer); stop(); sync.current = () => {};
      observer.disconnect(); intersection.disconnect();
      window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', update); target.removeEventListener('webglcontextlost', lost);
      scene?.dispose();
    };
  }, [style]);
  return <div ref={stage} className={'hs-scene hs-scene--'+style} data-renderer={renderer} data-dusk={dusk} aria-hidden="true">
    {style === 'anime' ? <><div className="hs-anime-art" ref={art}><picture><source media="(max-width:600px)" srcSet="/media/home-styles/sea-breeze-daylight-960.webp"/><img src="/media/home-styles/sea-breeze-daylight.webp" alt="" width={1536} height={1024} fetchPriority="high"/></picture></div><div className="hs-anime-shade"/><div className="hs-sunlight"/><div className="hs-dusk"/></> : <picture className="hs-static"><source media="(max-width:600px)" srcSet={'/media/home-styles/'+(style === 'fly' ? 'fly' : 'git')+'-fallback-mobile.webp'}/><img src={'/media/home-styles/'+(style === 'fly' ? 'fly' : 'git')+'-fallback-desktop.webp'} alt=""/></picture>}
    <canvas ref={canvas}/>
  </div>;
}
