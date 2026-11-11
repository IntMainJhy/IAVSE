import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(fs.readFileSync(new URL('../src/components/ThemeToggle.tsx', import.meta.url), 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX},
}).outputText;

// Drive the real click handlers and external-store subscription. Mutation delivery
// and view-transition callbacks remain separate, as they are in the browser.
function runtime({locale = 'en', mode = 'light', reduced = false, transitions = false, server = false} = {}) {
  const slots = [], observers = [], mutations = new Set(), cookies = [], animations = [], properties = new Map();
  let cursor = 0, dirty = false, mounted = true, tree, renders = 0, rectReads = 0;
  const preference = {matches: reduced};
  const root = {
    dataset: new Proxy({colorMode: mode, colorPreference: mode}, {
      set(target, name, value) {
        if (target[name] !== value) mutations.add(name === 'colorMode' ? 'data-color-mode' : name);
        target[name] = value;
        return true;
      },
    }),
    style: {setProperty: (name, value) => properties.set(name, value)},
  };
  const document = {documentElement: root};
  Object.defineProperty(document, 'cookie', {get: () => cookies.at(-1) || '', set: value => cookies.push(value)});
  if (transitions) document.startViewTransition = apply => {
    let finish, fail;
    const finished = new Promise((resolve, reject) => {finish = resolve; fail = reject;});
    const transition = {finished, skipped: 0, commit: apply, finish, fail, skipTransition() {this.skipped++;}};
    animations.push(transition);
    return transition;
  };
  const hook = initial => slots[cursor++] ||= initial();
  const React = {
    useRef: value => hook(() => ({current: value})),
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
      const slot = hook(() => ({subscribe: null, cleanup: null, value: undefined}));
      if (server) return getServerSnapshot();
      slot.getSnapshot = getSnapshot;
      slot.value = getSnapshot();
      if (slot.subscribe !== subscribe) {
        slot.cleanup?.();
        slot.subscribe = subscribe;
        slot.cleanup = subscribe(() => {
          const next = slot.getSnapshot();
          if (!Object.is(next, slot.value)) {slot.value = next; dirty = true;}
        });
      }
      return slot.value;
    },
  };
  const jsx = (type, props) => ({type, props});
  const exports = {};
  vm.runInNewContext(source, {
    exports, document, innerWidth: 390, innerHeight: 844,
    matchMedia(query) {assert.match(query, /prefers-reduced-motion\s*:\s*reduce/); return preference;},
    MutationObserver: class {
      constructor(callback) {this.callback = callback; this.connected = false; observers.push(this);}
      observe(target, options) {this.target = target; this.options = options; this.connected = true;}
      disconnect() {this.connected = false;}
    },
    require(name) {
      if (name === 'react') return React;
      if (name === 'react/jsx-runtime') return {jsx, jsxs: jsx};
      if (name === 'lucide-react') return {Sun: 'sun-icon', Moon: 'moon-icon'};
      if (name === './LocaleProvider' || name === '@/components/LocaleProvider') return {useLocale: () => ({locale})};
      throw Error('Unexpected dependency: ' + name);
    },
  });
  const render = () => {cursor = 0; dirty = false; renders++; tree = exports.ThemeToggle();};
  render();
  return {
    root, document, cookies, animations, properties, preference, observers,
    get tree() {return tree;}, get renders() {return renders;}, get rectReads() {return rectReads;},
    click(box = {left: 314, top: 84, width: 40, height: 40}) {
      tree.props.onClick({currentTarget: {getBoundingClientRect() {rectReads++; return box;}}});
    },
    deliverMutations() {
      const records = [...mutations].map(attributeName => ({type: 'attributes', attributeName, target: root}));
      mutations.clear();
      for (const observer of observers) {
        if (observer.connected && records.some(record => observer.options.attributeFilter.includes(record.attributeName))) observer.callback(records);
      }
      if (mounted && dirty) render();
    },
    unmount() {mounted = false; for (const slot of slots) slot.cleanup?.();},
  };
}

const settle = async () => {await Promise.resolve(); await Promise.resolve(); await Promise.resolve();};
const saved = (r, mode) => {
  assert.equal(r.root.dataset.colorMode, mode);
  assert.equal(r.root.dataset.colorPreference, mode);
  assert.equal(r.cookies.at(-1), `site-color-mode=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`);
};

test('server markup has neutral localized labels without announcing an unresolved theme', () => {
  for (const [locale, label] of [['zh', '切换外观'], ['en', 'Toggle theme'], ['ja', 'テーマを切り替え']]) {
    const r = runtime({locale, mode: 'dark', server: true});
    assert.equal(r.tree.type, 'button');
    assert.equal(r.tree.props.type, 'button');
    assert.equal(r.tree.props['aria-label'], label);
    assert.equal(r.tree.props.title, label);
    assert.equal(r.tree.props['aria-pressed'], undefined);
    assert.equal(r.observers.length, 0);
    assert.equal(r.cookies.length, 0);
  }
});

test('resolved theme exposes localized next-action labels and a truthful pressed state', () => {
  const labels = {
    zh: ['切换深色外观', '切换浅色外观'],
    en: ['Switch to dark theme', 'Switch to light theme'],
    ja: ['ダークテーマに切り替え', 'ライトテーマに切り替え'],
  };
  for (const [locale, actions] of Object.entries(labels)) for (const mode of ['light', 'dark']) {
    const r = runtime({locale, mode});
    assert.equal(r.tree.props['aria-label'], actions[Number(mode === 'dark')]);
    assert.equal(r.tree.props.title, r.tree.props['aria-label']);
    assert.equal(r.tree.props['aria-pressed'], mode === 'dark');
    for (const icon of r.tree.props.children) assert.equal(String(icon.props['aria-hidden']), 'true');
    r.unmount();
  }
});

test('clicks persist both appearance values and reverse the live document state before a rerender', () => {
  const r = runtime();
  r.click(); saved(r, 'dark');
  assert.equal(r.tree.props['aria-pressed'], false, 'mutation delivery has not updated the rendered store yet');
  r.click(); saved(r, 'light');
  assert.equal(r.cookies.length, 2, 'each activation stores exactly one preference');
  r.click(); r.deliverMutations(); saved(r, 'dark');
  assert.equal(r.tree.props['aria-pressed'], true);
  assert.equal(r.tree.props['aria-label'], 'Switch to light theme');
  assert.equal(r.rectReads, 0, 'unsupported view transitions do not need layout measurements');
  r.unmount();
});

test('reduced motion applies immediately even when view transitions are supported', () => {
  const r = runtime({mode: 'dark', reduced: true, transitions: true});
  r.click(); r.deliverMutations(); saved(r, 'light');
  assert.equal(r.animations.length, 0);
  assert.equal(r.rectReads, 0);
  assert.equal(r.properties.size, 0);
  assert.equal(r.root.dataset.themeAnim, undefined);
  assert.equal(r.tree.props['aria-pressed'], false);
  r.unmount();
});

test('external appearance changes update the control and unmount releases its observer', () => {
  const r = runtime({locale: 'zh'});
  r.root.dataset.colorMode = 'dark';
  r.deliverMutations();
  assert.equal(r.tree.props['aria-pressed'], true);
  assert.equal(r.tree.props['aria-label'], '切换浅色外观');
  assert.equal(r.cookies.length, 0, 'observing another control does not rewrite its preference');
  r.unmount();
  assert.ok(r.observers.every(observer => !observer.connected));
  const renders = r.renders;
  r.root.dataset.colorMode = 'light'; r.deliverMutations();
  assert.equal(r.renders, renders);
});

test('supported view transitions originate at the control and clean up after completion or rejection', async () => {
  for (const fail of [false, true]) {
    const r = runtime({transitions: true});
    r.click();
    assert.equal(r.root.dataset.colorMode, 'light', 'the browser controls when the theme callback commits');
    assert.equal(r.animations.length, 1);
    assert.equal(r.properties.get('--theme-cx'), '334px');
    assert.equal(r.properties.get('--theme-cy'), '104px');
    assert.equal(Number.parseFloat(r.properties.get('--theme-r')), Math.hypot(334, 740));
    assert.equal(r.root.dataset.themeAnim, '1');
    const transition = r.animations[0];
    transition.commit(); r.deliverMutations(); saved(r, 'dark');
    assert.equal(r.tree.props['aria-pressed'], true);
    if (fail) transition.fail(Error('Animation interrupted')); else transition.finish();
    await settle();
    assert.equal(r.root.dataset.themeAnim, undefined);
    r.unmount();
  }
});

test('rapid activations skip the old transition without letting its completion clear the new animation', async () => {
  const r = runtime({transitions: true});
  r.click(); const first = r.animations[0]; first.commit(); r.deliverMutations();
  r.click(); const second = r.animations[1];
  assert.equal(first.skipped, 1);
  second.commit(); r.deliverMutations(); saved(r, 'light');
  assert.equal(r.tree.props['aria-pressed'], false);
  first.finish(); await settle();
  assert.equal(r.root.dataset.themeAnim, '1', 'an older transition cannot erase the active transition marker');
  second.finish(); await settle();
  assert.equal(r.root.dataset.themeAnim, undefined);
  assert.equal(r.cookies.length, 2);
  r.unmount();
});

test('two activations before either callback commits preserve the latest intent in either callback order', async () => {
  for (const newestFirst of [false, true]) {
    const r = runtime({transitions: true});
    r.click(); r.click();
    const [first, second] = r.animations;
    assert.equal(first.skipped, 1);
    assert.equal(r.root.dataset.colorMode, 'light');
    assert.equal(r.cookies.length, 0, 'both browser callbacks are still pending');
    for (const transition of newestFirst ? [second, first] : [first, second]) {
      transition.commit(); r.deliverMutations();
      assert.equal(r.root.dataset.colorMode, 'light', 'an obsolete dark request cannot override the second activation');
      assert.equal(r.root.dataset.colorPreference, 'light');
    }
    saved(r, 'light');
    assert.equal(r.cookies.length, 1, 'only the current request persists a preference');
    assert.equal(r.tree.props['aria-pressed'], false);
    first.finish(); await settle();
    assert.equal(r.root.dataset.themeAnim, '1');
    second.finish(); await settle();
    assert.equal(r.root.dataset.themeAnim, undefined);
    r.click(); const third = r.animations[2]; third.commit(); r.deliverMutations(); saved(r, 'dark');
    third.finish(); await settle();
    assert.equal(r.tree.props['aria-pressed'], true, 'the next activation starts from the settled theme');
    r.unmount();
  }
});
