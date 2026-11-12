import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(fs.readFileSync(new URL('../src/components/ui/GlassSwitch.tsx', import.meta.url), 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX},
}).outputText;
const items = [
  {id: 'resources', label: '资源', href: '/'},
  {id: 'community', label: '社区', href: '/community'},
  {id: 'blogs', label: '博客空间', href: '/blogs'},
];

// Drive the component's real hooks, DOM refs, observers and animation frames.
// Route commits are independent of clicks, as they are with a Next Link.
function runtime(initialValue = 'resources', initialItems = items) {
  const slots = [], frames = new Map(), timers = new Map(), observers = [];
  let cursor = 0, now = 100, nextId = 1, rerender = false, tree, mounted = true, ready;
  let props = {items: initialItems, value: initialValue, ariaLabel: '主导航'};
  let refs = [];
  const eventTarget = () => {
    const listeners = new Map();
    return {
      listeners,
      addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
      removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
      emit(type) { for (const fn of listeners.get(type) || []) fn(); },
      listenerCount() { return [...listeners.values()].reduce((total, values) => total + values.size, 0); },
    };
  };
  const window = eventTarget(), fonts = {...eventTarget(), ready: {then(fn) { ready = fn; }}}, document = {...eventTarget(), fonts, hidden: false};
  const preference = {...eventTarget(), matches: false};
  const boxes = new Map(initialItems.map((item, index) => [item.id, {x: 6 + index * 104, y: 4, width: 98, height: 36}]));
  const root = {
    dataset: {}, clientWidth: 324, clientHeight: 44, clientLeft: 1, clientTop: 1,
    style: {setProperty(name, value) { this[name] = value; }},
    getBoundingClientRect() { return {left: 10, top: 20, width: this.clientWidth + 2, height: this.clientHeight + 2}; },
  };
  const controls = new Map(), copies = new Map();
  const hook = initial => { const index = cursor++; return slots[index] ||= initial(); };
  const effect = (setup, deps, kind) => {
    const slot = hook(() => ({kind, deps: undefined, cleanup: undefined}));
    if (!slot.deps || deps.some((value, index) => !Object.is(value, slot.deps[index]))) {
      slot.pending = setup;
      slot.nextDeps = deps;
    }
  };
  const React = {
    createElement(type, nodeProps, ...children) {
      const {key, ...rest} = nodeProps;
      return {type, key, props: {...rest, children: children.length === 1 ? children[0] : children}};
    },
    useRef: value => hook(() => ({current: value})),
    useState: initial => {
      const slot = hook(() => ({value: initial}));
      return [slot.value, value => {
        const next = typeof value === 'function' ? value(slot.value) : value;
        if (!Object.is(slot.value, next)) { slot.value = next; rerender = true; }
      }];
    },
    useLayoutEffect: (setup, deps) => effect(setup, deps, 'layout'),
    useEffect: (setup, deps) => effect(setup, deps, 'passive'),
  };
  const jsx = (type, nodeProps, key) => ({type, props: nodeProps, key});
  const exports = {};
  vm.runInNewContext(source, {
    exports, performance: {now: () => now}, window, document, matchMedia: () => preference,
    requestAnimationFrame: fn => { const id = nextId++; frames.set(id, fn); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    setTimeout: fn => { const id = nextId++; timers.set(id, fn); return id; },
    clearTimeout: id => timers.delete(id),
    ResizeObserver: class {
      constructor(fn) { this.fn = fn; this.elements = new Set(); observers.push(this); }
      observe(element) { this.elements.add(element); }
      disconnect() { this.elements.clear(); }
    },
    require(name) {
      if (name === 'react') return React;
      if (name === 'react/jsx-runtime') return {jsx, jsxs: jsx};
      if (name === 'next/link') return {default: 'a'};
      if (name.endsWith('.css')) return {};
      throw Error(name);
    },
  });
  const assignRef = (ref, node) => { if (typeof ref === 'function') ref(node); else ref.current = node; };
  function attach(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(attach); return; }
    if (node.props?.ref) {
      let element = root;
      const collection = node.props.className === 'glass-switch__item' ? controls : node.props.className === 'glass-switch__copy-item' ? copies : null;
      if (collection) {
        if (!collection.has(node.key)) collection.set(node.key, {
          style: {},
          getBoundingClientRect() {
            const box = boxes.get(node.key);
            return {left: 11 + box.x, top: 21 + box.y, width: box.width, height: box.height};
          },
        });
        element = collection.get(node.key);
      }
      assignRef(node.props.ref, element);
      refs.push(node.props.ref);
    }
    attach(node.props?.children);
  }
  function runEffects(kind) {
    const pending = slots.filter(slot => slot.kind === kind && slot.pending);
    for (const slot of pending) slot.cleanup?.();
    for (const slot of pending) {
      slot.deps = slot.nextDeps;
      const setup = slot.pending;
      slot.pending = undefined;
      slot.cleanup = setup();
    }
  }
  function flush() {
    do {
      rerender = false;
      cursor = 0;
      for (const ref of refs) assignRef(ref, null);
      refs = [];
      tree = exports.GlassSwitch(props);
      attach(tree);
      runEffects('layout');
      runEffects('passive');
    } while (rerender && mounted);
  }
  const controlNodes = () => tree.props.children[0];
  const tick = elapsed => { now += elapsed; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now)); };
  flush();
  return {
    root, boxes, copies, frames, timers, observers, preference, window, document,
    x: () => Number.parseFloat(root.style['--glass-lens-x']),
    zoom: () => Number(root.style['--glass-lens-zoom']),
    nodes: controlNodes,
    render(nextProps) { props = {...props, ...nextProps}; flush(); },
    interact(id, handler, event = {}) {
      const node = id === null ? tree : controlNodes().find(node => node.key === id);
      node.props[handler]?.(event);
      if (rerender) flush();
    },
    click(id, overrides = {}) {
      const event = {button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...overrides};
      controlNodes().find(node => node.key === id).props.onClick(event);
      if (rerender) flush();
      return event;
    },
    tick,
    advance(elapsed) { const end = now + elapsed; while (now < end) tick(Math.min(16, end - now)); },
    resize() { for (const observer of observers) if (observer.elements.size) observer.fn(); },
    fontsReady() { ready?.(); },
    reduce(value) { preference.matches = value; preference.emit('change'); },
    expireIntent() { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()); if (rerender) flush(); },
    unmount() {
      mounted = false;
      for (const slot of slots) slot.cleanup?.();
      for (const ref of refs) assignRef(ref, null);
    },
  };
}

test('the lens travels right and left through route commits and unchanged observer/font measurements', () => {
  const r = runtime();
  assert.equal(r.x(), 6);
  assert.equal(r.click('blogs').defaultPrevented, false, 'the real link navigates immediately');
  assert.equal(r.nodes()[0].props['aria-current'], 'page', 'optimism does not announce an uncommitted route');
  r.advance(80);
  const outbound = r.x(), outboundFrame = [...r.frames.keys()][0];
  assert.ok(outbound > 6 && outbound < 214);
  assert.ok(r.zoom() > 1 && r.zoom() <= 1.15);
  r.resize(); r.fontsReady(); r.document.fonts.emit('loadingdone'); r.window.emit('resize');
  assert.equal([...r.frames.keys()][0], outboundFrame, 'unchanged layout delivery preserves the current frame');
  r.render({value: 'blogs'});
  assert.equal([...r.frames.keys()][0], outboundFrame, 'committing the optimistic destination preserves its motion');
  assert.equal(r.timers.size, 0);
  assert.equal(r.nodes()[2].props['aria-current'], 'page');
  r.advance(1000);
  assert.equal(r.x(), 214);
  assert.equal(r.zoom(), 1);
  r.click('resources'); r.advance(80);
  const inbound = r.x(), inboundFrame = [...r.frames.keys()][0];
  assert.ok(inbound < 214 && inbound > 6, 'the return trip visibly moves left');
  r.resize(); r.document.fonts.emit('loadingdone'); r.window.emit('resize');
  r.render({value: 'resources'});
  assert.equal([...r.frames.keys()][0], inboundFrame);
  r.advance(1000);
  assert.equal(r.x(), 6);
  assert.equal(r.root.dataset.moving, undefined);
  for (const value of ['community', 'blogs', 'community', 'resources']) {
    r.click(value); r.render({value});
    assert.equal(r.root.dataset.moving, 'true');
    r.advance(1000);
    assert.equal(r.x(), r.boxes.get(value).x);
  }
  r.unmount();
});

test('browser Back cannot revive an optimistic destination after its route has committed', () => {
  const r = runtime();
  r.click('blogs'); r.render({value: 'blogs'}); r.advance(1000);
  r.render({value: 'resources'});
  assert.equal(r.root.dataset.moving, 'true');
  r.advance(80);
  assert.ok(r.x() < 214, 'Back travels to the real route even within the former intent timeout');
  r.advance(1000);
  assert.equal(r.x(), 6);
  r.render({value: 'blogs'}); r.advance(1000);
  assert.equal(r.x(), 214, 'Forward also follows the route');
  r.unmount();
});

test('a delayed first frame and long tasks between frames cannot swallow visible travel in either direction', () => {
  const r = runtime();
  r.click('blogs');
  r.tick(1200);
  assert.equal(r.x(), 6, 'animation time starts when its first frame is delivered');
  assert.equal(r.root.dataset.moving, 'true');
  r.advance(96);
  const outbound = r.x();
  assert.ok(outbound > 6 && outbound < 214);
  r.tick(2000);
  assert.ok(r.x() > outbound && r.x() < 214, 'a long route task advances only a bounded motion step');
  assert.equal(r.root.dataset.moving, 'true');
  assert.ok(r.zoom() > 1 && r.zoom() <= 1.15);
  r.render({value: 'blogs'}); r.advance(1000);
  assert.equal(r.x(), 214);
  r.click('resources'); r.advance(96);
  const inbound = r.x();
  r.tick(2000);
  assert.ok(r.x() < inbound && r.x() > 6, 'the same protection applies to the return trip');
  assert.equal(r.root.dataset.moving, 'true');
  r.render({value: 'resources'}); r.advance(1000);
  assert.equal(r.x(), 6);
  assert.equal(r.zoom(), 1);
  r.unmount();
});

test('rapid interruptions start at the visible lens and selecting the current route cancels pending intent', () => {
  const r = runtime();
  r.click('blogs'); r.advance(80);
  const visible = r.x();
  r.click('community');
  assert.equal(r.x(), visible, 'a new destination does not snap before its first frame');
  assert.equal(r.frames.size, 1, 'the previous frame was cancelled');
  r.advance(80);
  assert.ok(r.x() > visible && r.x() < 110);
  const interrupted = r.x();
  r.click('resources');
  assert.equal(r.x(), interrupted);
  assert.equal(r.timers.size, 0, 'the already active route needs no pending timeout');
  r.advance(1000);
  assert.equal(r.x(), 6);
  r.click('blogs'); r.advance(80); r.expireIntent(); r.advance(1000);
  assert.equal(r.x(), 6, 'an unresolved navigation returns to the actual route');
  r.unmount();
});

test('real layout changes retarget an active journey and update the copied text boxes', () => {
  const r = runtime();
  r.click('blogs'); r.advance(80);
  const visible = r.x(), oldFrame = [...r.frames.keys()][0];
  Object.assign(r.boxes.get('blogs'), {x: 240, width: 112});
  r.root.clientWidth = 358;
  r.resize();
  assert.equal(r.x(), visible, 'responsive changes continue from the visible position');
  assert.notEqual([...r.frames.keys()][0], oldFrame);
  assert.equal(r.copies.get('blogs').style.left, '240px');
  assert.equal(r.copies.get('blogs').style.width, '112px');
  assert.equal(r.root.style['--glass-track-width'], '358px');
  r.advance(1000);
  assert.equal(r.x(), 240);
  assert.equal(r.root.style['--glass-lens-width'], '112px');
  Object.assign(r.boxes.get('blogs'), {x: 210, width: 96});
  r.window.emit('resize');
  assert.equal(r.x(), 210, 'idle responsive geometry settles immediately');
  assert.equal(r.frames.size, 0);
  r.render({value: 'blogs'});
  r.click('resources'); r.advance(80);
  const pendingFrame = [...r.frames.keys()][0];
  r.render({items: items.map(item => ({...item, label: `${item.label}导航`}))});
  r.resize();
  assert.equal([...r.frames.keys()][0], pendingFrame, 'an item update with unchanged boxes preserves travel');
  r.advance(1000);
  assert.equal(r.x(), 6);
  r.unmount();
});

test('reduced motion, backgrounding and unmount settle or clean up every scheduled callback', () => {
  const r = runtime();
  r.click('blogs'); r.advance(80); r.reduce(true);
  assert.equal(r.frames.size, 0);
  assert.equal(r.root.dataset.moving, undefined);
  assert.equal(r.x(), 214);
  assert.equal(r.zoom(), 1);
  r.render({value: 'blogs'});
  r.click('resources');
  assert.equal(r.x(), 6);
  assert.equal(r.frames.size, 0);
  r.render({value: 'resources'}); r.reduce(false);
  r.click('blogs'); r.advance(80);
  r.document.hidden = true; r.document.emit('visibilitychange');
  assert.equal(r.x(), 214);
  assert.equal(r.frames.size, 0);
  r.document.hidden = false;
  r.click('community');
  assert.equal(r.frames.size, 1);
  assert.equal(r.timers.size, 1);
  r.unmount();
  assert.equal(r.frames.size, 0);
  assert.equal(r.timers.size, 0);
  assert.equal(r.window.listenerCount(), 0);
  assert.equal(r.document.listenerCount(), 0);
  assert.equal(r.document.fonts.listenerCount(), 0);
  assert.equal(r.preference.listenerCount(), 0);
  assert.ok(r.observers.every(observer => observer.elements.size === 0));
  r.fontsReady();
  assert.equal(r.frames.size, 0, 'a late font promise cannot restart an unmounted component');
});

test('missing routes, modified clicks, disabled controls and button aria state remain independent of the lens', () => {
  const r = runtime(null, [...items, {id: 'disabled', label: '不可用', href: '/disabled', disabled: true}, {id: 'filter', label: '筛选'}]);
  assert.equal(r.root.dataset.lensReady, undefined);
  r.render({value: 'resources'});
  assert.equal(r.root.dataset.lensReady, 'true');
  assert.equal(r.x(), 6);
  for (const overrides of [{ctrlKey: true}, {metaKey: true}, {shiftKey: true}, {altKey: true}, {button: 1}, {defaultPrevented: true}]) {
    r.click('blogs', overrides);
    assert.equal(r.frames.size, 0);
    assert.equal(r.timers.size, 0);
  }
  assert.equal(r.click('disabled').defaultPrevented, true);
  const disabled = r.nodes().find(node => node.key === 'disabled');
  assert.equal(disabled.props['aria-disabled'], true);
  assert.equal(disabled.props.tabIndex, -1);
  let changed;
  r.render({onValueChange: value => { changed = value; }});
  r.click('filter');
  assert.equal(changed, 'filter');
  assert.equal(r.nodes().find(node => node.key === 'filter').props['aria-pressed'], false);
  r.render({value: 'filter'}); r.advance(1000);
  assert.equal(r.nodes().find(node => node.key === 'filter').props['aria-pressed'], true);
  r.unmount();
});

test('entry links preview on hover and keyboard focus without changing the current route', () => {
  const r = runtime(null);
  r.interact('resources', 'onPointerEnter', {pointerType: 'mouse'});
  assert.equal(r.root.dataset.lensReady, undefined, 'other switches keep their existing behavior');
  r.render({previewLinks: true});
  r.interact('resources', 'onPointerEnter', {pointerType: 'touch'});
  assert.equal(r.root.dataset.lensReady, undefined, 'touch does not latch a hover preview');
  r.interact('resources', 'onPointerDown', {pointerType: 'touch', isPrimary: true, button: 0});
  assert.equal(r.root.dataset.lensReady, 'true', 'a primary touch shows feedback before release');
  assert.equal(r.nodes().find(node => node.key === 'resources').props['data-pressed'], true);
  r.interact('resources', 'onPointerCancel');
  assert.equal(r.nodes().find(node => node.key === 'resources').props['data-pressed'], undefined);
  assert.equal(r.root.dataset.lensReady, undefined, 'scrolling can cancel the press before navigation');
  r.interact('resources', 'onPointerEnter', {pointerType: 'mouse'});
  assert.equal(r.root.dataset.lensReady, 'true');
  assert.equal(r.x(), r.boxes.get('resources').x);
  r.interact('community', 'onPointerEnter', {pointerType: 'mouse'});
  r.advance(80);
  assert.ok(r.x() > r.boxes.get('resources').x && r.x() < r.boxes.get('community').x);
  assert.ok(r.zoom() > 1);
  r.interact(null, 'onPointerLeave', {pointerType: 'mouse'});
  assert.equal(r.root.dataset.lensReady, undefined);
  r.interact('community', 'onFocus', {currentTarget: {matches: selector => selector === ':focus-visible'}});
  assert.equal(r.root.dataset.lensReady, 'true');
  assert.equal(r.x(), r.boxes.get('community').x);
  assert.ok(r.nodes().every(node => node.props['aria-current'] === undefined));
  assert.equal(r.timers.size, 0, 'a preview never starts navigation');
  r.interact('community', 'onBlur');
  assert.equal(r.root.dataset.lensReady, undefined);
  r.unmount();
});
