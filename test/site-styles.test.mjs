import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import postcss from 'postcss';
import ts from 'typescript';
import {HOME_STYLES, DEFAULT_HOME_STYLE, HOME_STYLE_COOKIE, normalizeHomeStyle, homeStyleColorMode} from '../src/lib/home-style.mjs';

const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const css = postcss.parse(read('src/app/site-styles.css'));
const declarations = rule => Object.fromEntries(rule.nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]));
function rulesMatching(selector) {
  const rules = [];
  css.walkRules(rule => {if (rule.selector.includes(selector)) rules.push(rule);});
  return rules;
}
function loadComponent(name, modules = {}, globals = {}) {
  const source = ts.transpileModule(read('src/components/landing/' + name + '.tsx'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX}}).outputText;
  const exports = {};
  vm.runInNewContext(source, {exports, ...globals, require: key => {
    assert.ok(key in modules, name + ' must not mount an unplanned dependency: ' + key);
    return modules[key];
  }});
  return exports;
}
const luminance = value => {
  const hex = value.length === 4 ? '#' + [...value.slice(1)].map(x => x + x).join('') : value;
  return [0, 2, 4].map(i => parseInt(hex.slice(1).slice(i, i + 2), 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
};
const contrast = (a, b) => {const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);};

test('legacy, absent and arbitrary preferences all resolve to the plain light website', () => {
  assert.deepEqual(HOME_STYLES, ['brand']);
  assert.equal(DEFAULT_HOME_STYLE, 'brand');
  const values = [...HOME_STYLES, 'fly', 'anime', 'classic', undefined, null, '', 'dark', 'find', 'constructor', '<style>'];
  for (const value of values) {
    assert.equal(normalizeHomeStyle(value), 'brand', String(value));
    for (const mode of [undefined, 'light', 'dark', 'system']) assert.equal(homeStyleColorMode(value, mode), 'light');
  }
});

test('the provider normalizes old initial state and compatibility selections before applying or saving them', () => {
  const effects = [], writes = [], cookies = new Map();
  const document = {documentElement: {dataset: {homeStyle: 'fly', siteStyle: 'fly', colorMode: 'dark', colorPreference: 'dark'}}};
  Object.defineProperty(document, 'cookie', {
    get: () => [...cookies].map(([key, value]) => key + '=' + value).join('; '),
    set: value => {const [key, item] = value.split(';')[0].split('='); cookies.set(key, item);}
  });
  const react = {
    createContext: value => ({Provider: 'context', value}),
    useContext: context => context.value,
    useEffect: effect => effects.push(effect),
    useState: initial => [typeof initial === 'function' ? initial() : initial, value => writes.push(value)]
  };
  const {HomeStyleProvider} = loadComponent('HomeStyleProvider', {
    react,
    'react/jsx-runtime': {jsx: (type, props) => ({type, props})},
    '@/lib/home-style.mjs': {DEFAULT_HOME_STYLE, HOME_STYLE_COOKIE, normalizeHomeStyle, homeStyleColorMode}
  }, {document});
  const rendered = HomeStyleProvider({initialStyle: 'anime', children: 'member content'});
  assert.equal(rendered.props.value.style, 'brand');
  assert.equal(rendered.props.children, 'member content');
  effects.forEach(effect => effect());
  assert.deepEqual(document.documentElement.dataset, {homeStyle: 'brand', siteStyle: 'brand', colorMode: 'light', colorPreference: 'light'});
  rendered.props.value.select('classic');
  assert.equal(cookies.get(HOME_STYLE_COOKIE), 'brand');
  assert.equal(cookies.get('site-color-mode'), 'light');
  assert.deepEqual(writes, ['brand', true]);
});

test('compatibility mounts expose no appearance menu and allocate no decorative atmosphere', () => {
  let opened = false;
  const {HomeStyleSwitcher} = loadComponent('HomeStyleSwitcher');
  const {SiteStyleAtmosphere} = loadComponent('SiteStyleAtmosphere');
  assert.equal(HomeStyleSwitcher({className: 'editor-control', onOpen: () => {opened = true;}}), null);
  assert.equal(SiteStyleAtmosphere(), null);
  assert.equal(opened, false);
});

test('one neutral role set provides readable text, system typography and solid surfaces', () => {
  const palettes = rulesMatching('[data-home-style]').filter(rule => '--iavse-canvas' in declarations(rule));
  assert.equal(palettes.length, 1, 'public roles have a single source');
  const roles = declarations(palettes[0]);
  assert.equal(roles['--iavse-canvas'], '#fff');
  assert.equal(roles['--iavse-background'], '#fff');
  assert.equal(roles['--iavse-muted'], '#f5f5f7');
  assert.equal(roles['--iavse-foreground'], '#1d1d1f');
  assert.equal(roles['--iavse-secondary'], '#6e6e73');
  assert.equal(roles['--iavse-border'], '#e5e5e7');
  for (const surface of ['--iavse-background', '--iavse-canvas', '--iavse-muted']) {
    for (const text of ['--iavse-foreground', '--iavse-secondary', '--iavse-subtle']) assert.ok(contrast(roles[surface], roles[text]) >= 4.5, text + ' on ' + surface);
  }
  assert.ok(contrast(roles['--iavse-focus'], roles['--iavse-background']) >= 3);
  assert.match(roles['--iavse-font'], /-apple-system/);
  assert.doesNotMatch(roles['--iavse-font'], /IAVSE Display|Songti|Georgia|(?:^|[, ])serif(?:$|[, ])/);
  for (const shadow of ['--iavse-shadow', '--iavse-shadow-hover', '--iavse-control-shadow']) assert.equal(roles[shadow], 'none');
  assert.equal(roles['color-scheme'], 'light');
});

test('shared application styling stops before authored documents, artboards and source previews', () => {
  const scopes = [];
  css.walkAtRules('scope', rule => scopes.push(rule));
  assert.ok(scopes.length > 0);
  for (const scope of scopes) {
    assert.match(scope.params, /^\(\.rbp-application\) to /);
    for (const boundary of ['.space-root', '.bd-block', '.bd-artboard', '.personal-homepage', '.blog-theme-content', '.react-flow__viewport', '.ProseMirror', '.document-prose', '.organic-prose', '.community-prose', '.design-card-preview', '.design-media', '.bt-preview', '.bl-preview', '.blog-template-preview']) assert.ok(scope.params.includes(boundary), boundary);
  }
  assert.doesNotMatch(read('src/app/site-styles.css'), /(?:^|\n)\s*(?:html[^\n{]*\s)?(?:img|canvas|iframe|\.space-root|\.bd-artboard|\.design-media)\s*\{/);
});

test('platform filters use opaque states and do not expose a blur or magnifying lens', () => {
  const filter = rulesMatching(':scope.rbp-application .glass-switch').find(rule => rule.selector === ':scope.rbp-application .glass-switch');
  assert.ok(filter);
  const roles = declarations(filter);
  assert.equal(roles.background, 'var(--iavse-muted)');
  assert.equal(roles['backdrop-filter'], 'none');
  assert.equal(roles['-webkit-backdrop-filter'], 'none');
  const lens = rulesMatching('.glass-switch__lens').find(rule => declarations(rule).display === 'none');
  assert.ok(lens, 'the obsolete decorative label layer is hidden');
  const selected = rulesMatching('[data-selected=true]').find(rule => declarations(rule).background === 'var(--iavse-background)');
  assert.ok(selected, 'selected options remain visible without a lens');
  css.walkDecls(decl => {
    if (decl.prop.endsWith('backdrop-filter')) assert.equal(decl.value, 'none');
    assert.doesNotMatch(decl.value, /url\(|gradient\(/, 'the public role sheet loads no decorative scene');
  });
});
