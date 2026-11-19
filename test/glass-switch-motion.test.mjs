import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseDocument} from 'htmlparser2';
import postcss from 'postcss';

const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const source = ts.transpileModule(read('src/components/ui/GlassSwitch.tsx'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX},
}).outputText;
const exports = {};
const modules = {'react/jsx-runtime': jsxRuntime, 'next/link': {default: 'a'}, '@/app/glass-controls.css': {}};
vm.runInNewContext(source, {exports, require: name => {
  assert.ok(name in modules, 'the stateless selector must not require hooks or browser facilities: ' + name);
  return modules[name];
}});
const {GlassSwitch} = exports;
const items = [
  {id: 'resources', label: '资源', href: '/', prefetch: false, scroll: false},
  {id: 'community', label: '社区', href: '/community', prefetch: true, scroll: true},
  {id: 'blogs', label: '博客空间', compactLabel: '博客', href: '/blogs'},
  {id: 'filter', label: '筛选'},
];
const render = (props = {}) => GlassSwitch({items, value: 'resources', ariaLabel: '内容范围', ...props});
const controls = tree => React.Children.toArray(tree.props.children);
const control = (tree, id) => controls(tree).find(node => node.key.endsWith('$' + id));
function click(node, overrides = {}) {
  const event = {button: 0, defaultPrevented: false, preventDefault() {this.defaultPrevented = true;}, ...overrides};
  node.props.onClick(event);
  return event;
}
function find(node, predicate) {
  const matches = [];
  if (predicate(node)) matches.push(node);
  for (const child of node.children || []) matches.push(...find(child, predicate));
  return matches;
}

test('the selector renders one labelled group containing real links and type=button controls', () => {
  const tree = render({className: 'catalog-options', size: 'compact'});
  assert.equal(tree.type, 'div');
  assert.equal(tree.props.role, 'group');
  assert.equal(tree.props['aria-label'], '内容范围');
  assert.equal(tree.props.className, 'glass-switch glass-switch--compact catalog-options');
  const nodes = controls(tree);
  assert.equal(nodes.length, items.length);
  assert.deepEqual(nodes.map(node => node.type), ['a', 'a', 'a', 'button']);
  assert.equal(nodes[0].props.href, '/');
  assert.equal(nodes[0].props.prefetch, false);
  assert.equal(nodes[0].props.scroll, false);
  assert.equal(nodes[1].props.prefetch, true);
  assert.equal(nodes[1].props.scroll, true);
  assert.equal(nodes[3].props.type, 'button', 'filters do not submit surrounding forms');
  assert.ok(nodes.every(node => node.props.className === 'glass-switch__item'));
  assert.equal(nodes[0].props['aria-current'], 'page');
  assert.equal(nodes[0].props['aria-pressed'], undefined);
  assert.equal(nodes[3].props['aria-current'], undefined);
  assert.equal(nodes[3].props['aria-pressed'], false);
});

test('ordinary primary clicks notify the caller without preventing native navigation or mutating selection', () => {
  const changed = [], tree = render({onValueChange: value => changed.push(value)});
  const linkEvent = click(control(tree, 'blogs'));
  const buttonEvent = click(control(tree, 'filter'));
  const keyboardEvent = click(control(tree, 'filter'), {detail: 0});
  assert.deepEqual(changed, ['blogs', 'filter', 'filter']);
  assert.equal(linkEvent.defaultPrevented, false);
  assert.equal(buttonEvent.defaultPrevented, false);
  assert.equal(keyboardEvent.defaultPrevented, false, 'native keyboard activation uses the same click callback');
  assert.equal(control(tree, 'resources').props['aria-current'], 'page', 'the route remains current until the caller changes value');
  assert.equal(control(tree, 'blogs').props['data-selected'], false);
  assert.equal(control(tree, 'filter').props['aria-pressed'], false);
  const next = render({value: 'filter'});
  assert.equal(control(next, 'filter').props['aria-pressed'], true);
  assert.equal(control(next, 'filter').props['data-selected'], true);
  assert.ok(controls(next).filter(node => node.type === 'a').every(node => node.props['aria-current'] === undefined));
});

test('modified, secondary and already prevented clicks retain their native behavior without notifying the caller', () => {
  const changed = [], tree = render({onValueChange: value => changed.push(value)});
  for (const id of ['blogs', 'filter']) {
    for (const overrides of [{ctrlKey: true}, {metaKey: true}, {shiftKey: true}, {altKey: true}, {button: 1}, {button: 2}, {defaultPrevented: true}]) {
      const event = click(control(tree, id), overrides);
      assert.equal(event.defaultPrevented, overrides.defaultPrevented === true);
    }
  }
  assert.deepEqual(changed, []);
});

test('disabled links leave keyboard order and cannot navigate; disabled buttons keep native semantics', () => {
  const changed = [], tree = render({items: [{id: 'locked-link', label: '链接不可用', href: '/locked', disabled: true}, {id: 'locked-button', label: '按钮不可用', disabled: true}], value: null, onValueChange: value => changed.push(value)});
  const link = control(tree, 'locked-link'), button = control(tree, 'locked-button');
  assert.equal(link.type, 'a');
  assert.equal(link.props['aria-disabled'], true);
  assert.equal(link.props.tabIndex, -1);
  assert.equal(button.type, 'button');
  assert.equal(button.props.disabled, true);
  for (const node of [link, button]) for (const overrides of [{}, {ctrlKey: true}, {metaKey: true}, {button: 1}]) assert.equal(click(node, overrides).defaultPrevented, true);
  assert.deepEqual(changed, []);
  const enabled = control(render(), 'blogs');
  assert.equal(enabled.props['aria-disabled'], undefined);
  assert.equal(enabled.props.tabIndex, undefined);
});

test('compact text retains the full accessible name without a duplicate decorative label tree', () => {
  const html = renderToStaticMarkup(render({items: items.map(({prefetch, scroll, ...item}) => item)})), document = parseDocument(html);
  const blog = find(document, node => node.name === 'a' && node.attribs.href === '/blogs')[0];
  assert.equal(blog.attribs['aria-label'], '博客空间');
  const full = find(blog, node => node.attribs?.class === 'glass-switch__full-label');
  const compact = find(blog, node => node.attribs?.class === 'glass-switch__compact-label');
  assert.equal(full.length, 1);
  assert.equal(compact.length, 1);
  assert.equal(compact[0].attribs['aria-hidden'], 'true');
  assert.equal(find(document, node => /glass-switch__(?:lens|countertrack|magnification|copy-item)/.test(node.attribs?.class || '')).length, 0);
  assert.equal(find(document, node => node.name === 'a' || node.name === 'button').length, items.length);
  const sheet = postcss.parse(read('src/app/glass-controls.css'));
  const mobile = sheet.nodes.find(node => node.type === 'atrule' && node.name === 'media');
  const props = selector => {let result; mobile.walkRules(selector, rule => {result = Object.fromEntries(rule.nodes.map(node => [node.prop, node.value]));}); return result;};
  assert.equal(props('.glass-switch__full-label').display, 'none');
  assert.equal(props('.glass-switch__compact-label').display, 'inline');
});

test('selection follows current props across null values, route commits, Back and Forward', () => {
  for (const value of [null, 'missing', 'resources', 'blogs', 'community', 'resources', 'blogs']) {
    const tree = render({value, previewLinks: true});
    for (const item of items) {
      const node = control(tree, item.id), selected = value === item.id;
      assert.equal(node.props['data-selected'], selected);
      if (item.href) assert.equal(node.props['aria-current'], selected ? 'page' : undefined);
      else assert.equal(node.props['aria-pressed'], selected);
      for (const handler of ['onPointerEnter', 'onPointerDown', 'onPointerLeave', 'onFocus', 'onBlur']) assert.equal(node.props[handler], undefined);
    }
    assert.equal(tree.props.ref, undefined);
  }
  assert.equal(controls(render({items: [], value: null})).length, 0);
});

test('the shared stylesheet contains only solid selection controls and no header or motion treatment', () => {
  const css = read('src/app/glass-controls.css'), sheet = postcss.parse(css);
  assert.doesNotMatch(css, /iavse-header|backdrop-filter|gradient\(|glass-switch__(?:lens|copy-item|magnification)|@font-face/);
  sheet.walkDecls(decl => assert.doesNotMatch(decl.prop, /animation|transition|transform|will-change/));
  let selected;
  sheet.walkRules(rule => {if (rule.selector.includes('[data-selected=true]')) selected = Object.fromEntries(rule.nodes.map(node => [node.prop, node.value]));});
  assert.equal(selected.background, 'var(--iavse-background, #fff)');
  assert.equal(selected.color, 'var(--iavse-foreground, #1d1d1f)');
  assert.doesNotMatch(source, /requestAnimationFrame|ResizeObserver|setTimeout|useState|useEffect|useLayoutEffect|useRef|document|window/);
});
