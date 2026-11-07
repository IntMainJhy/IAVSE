#!/usr/bin/env node
/** Import the official, MIT-licensed StyleKit catalog without executing its code. */
import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const origin = 'https://www.stylekit.top';
const repository = 'https://github.com/AnxForever/stylekit';
const revision = '38058485388d237745ccf58c6750c2ec661a72f4';
const verifiedAt = '2026-11-08';
const licenseUrl = `${repository}/blob/${revision}/LICENSE`;
const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  if (!process.argv[i].startsWith('--') || !process.argv[i + 1]) throw new Error('Expected --name value');
  args.set(process.argv[i].slice(2), process.argv[i + 1]);
}
if (!args.has('source')) throw new Error('Usage: node scripts/design-import/stylekit.mjs --source /path/to/stylekit [--catalog catalog.json --index index.json]');
const source = resolve(args.get('source'));
const actualRevision = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (actualRevision !== revision) throw new Error(`Expected reviewed revision ${revision}; received ${actualRevision}. Review new source and update the importer before importing.`);
const mit = await readFile(resolve(source, 'LICENSE'), 'utf8');
if (!mit.includes('MIT License') || !mit.includes('Copyright (c) 2026 AnxForever')) throw new Error('Unexpected source license');
const snapshotBytes = await readFile(resolve(root, 'scripts/design-import/stylekit-source.json.gz'));
const snapshot = JSON.parse(gunzipSync(snapshotBytes).toString('utf8'));
const cc0 = await readFile(resolve(root, 'scripts/design-import/stylekit-simple-icons-CC0.txt'), 'utf8');

async function jsonInput(flag, path) {
  if (args.has(flag)) return JSON.parse(await readFile(resolve(args.get(flag)), 'utf8'));
  if (!snapshot[flag]) throw new Error(`Missing reviewed snapshot for ${origin}${path}`);
  return snapshot[flag];
}
const [catalog, index] = await Promise.all([
  jsonInput('catalog', '/api/styles/all.json'),
  jsonInput('index', '/api/styles'),
]);
if (catalog.license !== 'MIT' || catalog.total !== 149 || index.total !== 149) throw new Error('Catalog or license changed; review before import');
const bySlug = new Map(index.styles.map(entry => [entry.slug, entry]));
if (bySlug.size !== 149 || catalog.styles.length !== 149) throw new Error('Incomplete catalog');

// These URLs identify inspirations explicitly named in the upstream source.
// They are not claims that StyleKit's implementation belongs to those brands.
const references = {
  'notion-style': [['Notion · 设计灵感', 'https://www.notion.com/']],
  'stripe-style': [['Stripe · 设计灵感', 'https://stripe.com/']],
  'apple-style': [['Apple · 设计灵感', 'https://www.apple.com/']],
  'macos-vibrancy': [['Apple macOS · 设计灵感', 'https://www.apple.com/macos/']],
  'material-design': [['Google Material Design · 原设计系统', 'https://m3.material.io/']],
  'fluent-design': [['Microsoft Fluent · 原设计系统', 'https://fluent2.microsoft.design/']],
  'liquid-glass': [['Apple Human Interface Guidelines · 原设计语言', 'https://developer.apple.com/design/human-interface-guidelines/']],
  'github-style': [['GitHub Primer · 原设计系统', 'https://primer.style/']],
  'linear-style': [['Linear · 设计灵感', 'https://linear.app/']],
  'shopify-clean': [['Shopify · 设计灵感', 'https://www.shopify.com/']],
  'distill-style': [['Distill · 排版原型', 'https://distill.pub/']],
  'studio-bold': [['Pentagram · 设计灵感', 'https://www.pentagram.com/'], ['IDEO · 设计灵感', 'https://www.ideo.com/']],
  'launch-keynote': [['Apple · 产品发布页灵感', 'https://www.apple.com/']],
  'ghibli-style': [['Studio Ghibli · 风格灵感', 'https://www.ghibli.jp/']],
  'kinetic-typography': [['Studio Dumbar · 动态排印灵感', 'https://studiodumbar.com/']],
  'scrollytelling': [['The New York Times · 叙事灵感', 'https://www.nytimes.com/interactive/'], ['The Pudding · 叙事灵感', 'https://pudding.cool/'], ['Reuters Graphics · 叙事灵感', 'https://www.reuters.com/graphics/']],
  'luxe-lookbook': [['Celine · 品牌风格灵感', 'https://www.celine.com/'], ['The Row · 品牌风格灵感', 'https://www.therow.com/'], ['Jacquemus · 品牌风格灵感', 'https://www.jacquemus.com/']],
  'immersive-photo': [['Apple · 产品摄影灵感', 'https://www.apple.com/']],
  'quantized-line-field': [['Simple Icons · 图标路径原来源（CC0）', 'https://github.com/simple-icons/simple-icons/tree/develop/icons'], ['Apple · 标志所属品牌', 'https://www.apple.com/'], ['Google · 标志所属品牌', 'https://www.google.com/'], ['Tesla · 标志所属品牌', 'https://www.tesla.com/']],
};
const categories = {
  'developer-terminal': '开发工具', 'github-style': '开发工具', 'linear-style': '开发工具',
  'notion-style': '设计生产', 'studio-bold': '设计生产', 'gallery-dark': '设计生产', 'horizontal-gallery': '设计生产',
  'stripe-style': '金融加密',
  'corporate-clean': '企业消费', 'shopify-clean': '企业消费', 'luxury-retail': '企业消费', 'fresh-market': '企业消费',
  'dashboard-layout': '分析仪表', 'warm-dashboard': '分析仪表', 'data-dense': '分析仪表', 'sci-fi-hud': '分析仪表',
  'hero-fullscreen': '落地页', 'cinematic-video-hero': '落地页', 'launch-keynote': '落地页', 'luxe-lookbook': '落地页',
};
const categoryNames = { minimal: '极简风格', modern: '现代风格', retro: '复古风格', expressive: '表现风格' };
const tagNames = { 'high-contrast': '高对比', responsive: '响应式', 'brand-inspired': '品牌灵感', animated: '动态', colorful: '多彩', dark: '深色', 'light': '浅色' };
const output = resolve(root, 'public/design-imports/stylekit');
await mkdir(output, { recursive: true });
await mkdir(resolve(root, 'src/lib/design-imports'), { recursive: true });
await writeFile(resolve(output, 'LICENSE.txt'), mit);
await writeFile(resolve(output, 'SIMPLE-ICONS-CC0.txt'), cc0);
const seen = new Set();
const assets = [];
const entries = [];
for (const style of catalog.styles) {
  const slug = style.slug;
  if (!/^[a-z0-9-]+$/.test(slug) || seen.has(slug)) throw new Error(`Invalid or repeated slug: ${slug}`);
  seen.add(slug);
  const brief = bySlug.get(slug);
  if (!brief) throw new Error(`Missing index entry: ${slug}`);
  // All 149 designs have original vector covers. Prefer these over the three
  // alternate photographic JPEG covers; no remote images/fonts are imported.
  const cover = `/styles/${slug}.svg`;
  const coverPath = resolve(source, 'public', cover.slice(1));
  const data = await readFile(coverPath);
  const svg = data.toString('utf8');
  if (!svg.includes('<svg') || /<(?:script|image|foreignObject)\b/i.test(svg) || /(?:href|src)\s*=\s*["'](?:https?:|data:|javascript:)/i.test(svg)) throw new Error(`Unsafe or externally dependent cover: ${slug}`);
  // Every catalog item must have an upstream interactive implementation.
  await stat(resolve(source, 'app/styles', slug, 'showcase/page.tsx'));
  const filename = `${slug}${extname(cover)}`;
  await copyFile(coverPath, resolve(output, filename));
  const page = `${origin}/zh/styles/${slug}`;
  const referenceUrls = (references[slug] || []).map(([name, url]) => ({ name, url }));
  const palette = [...new Set([style.colors.primary, style.colors.secondary, ...(style.colors.accent || [])].filter(Boolean))];
  const nativeTokens = style.tokens || {};
  const note = referenceUrls.length
    ? '模板、封面与设计规则来自 StyleKit 开源仓库；原品牌、设计系统或素材来源另列于参考链接。这是 StyleKit 的风格实现，不代表参考品牌的官方模板或授权。'
    : '模板、封面与设计规则来自 StyleKit 官方目录及 MIT 开源仓库；当前来源文件未声明独立的第三方模板作者。';
  const attribution = `来源：StyleKit / ${style.name}\n${page}\n开源实现：${repository}/tree/${revision}\n${referenceUrls.map(item => `${item.name}：${item.url}`).join('\n')}\n\n${mit.trim()}`;
  const extraNotice = slug === 'quantized-line-field'
    ? `\n\n图标路径来源：Simple Icons（CC0 1.0）。https://github.com/simple-icons/simple-icons/tree/develop/icons\nApple、Google、Tesla 标志与名称属于相应品牌；CC0 不授予商标使用权。\n\n${cc0.trim()}`
    : '';
  const rules = style.rules || {};
  const specification = [
    `# ${style.name} / ${style.nameEn}`, style.description,
    `## 色板\n${palette.join(' · ')}`,
    `## 建议做法\n${(rules.do || []).map(value => `- ${value}`).join('\n')}`,
    `## 避免做法\n${(rules.dont || []).map(value => `- ${value}`).join('\n')}`,
    `## 原始设计变量\n\`\`\`json\n${JSON.stringify(nativeTokens, null, 2)}\n\`\`\``,
    `## 来源与许可\n${attribution}${extraNotice}`,
  ].join('\n\n');
  const prompt = `${rules.aiRules || rules.aiRulesEn || ''}\n\n## 来源与许可（随副本保留）\n${attribution}${extraNotice}`;
  entries.push({
    id: `stylekit-${slug}`, slug: `stylekit-${slug}`, title: style.name, summary: style.description,
    category: categories[slug] || '通用',
    tags: [...new Set(['StyleKit', style.styleType === 'layout' ? '布局' : '视觉风格', categoryNames[style.category] || style.category, ...(style.tags || []).map(tag => tagNames[tag] || tag), ...(style.keywords || []).slice(0, 5)])].filter(Boolean),
    palette, typography: [nativeTokens.typography?.heading, nativeTokens.typography?.body].filter(Boolean).join(' · '),
    layout: style.styleType === 'layout' ? style.name : `${categoryNames[style.category] || style.category} · ${style.name}`,
    motion: [nativeTokens.interaction?.transition, nativeTokens.interaction?.hoverTranslate, nativeTokens.interaction?.active].filter(Boolean).join(' · '),
    source: { name: 'StyleKit', url: page }, collection: { name: 'StyleKit', url: `${origin}/zh/styles` },
    previewUrl: `${page}/showcase`, websiteUrl: `${page}/showcase`, image: `/design-imports/stylekit/${filename}`,
    license: { name: 'MIT', url: licenseUrl, status: 'verified' },
    provenance: { verifiedAt, evidenceUrl: `${repository}/blob/${revision}/lib/styles/${slug}.ts`, note },
    referenceUrls, prompt, specification, verifiedAt, external: true,
    sourceSlug: slug, sourceCategory: style.category, styleType: style.styleType,
  });
  assets.push({ slug, file: filename, sourceUrl: `${origin}${cover}`, repositoryUrl: `${repository}/blob/${revision}/public${cover}`, sha256: createHash('sha256').update(data).digest('hex'), bytes: data.length, indexCover: brief.cover });
}
if (entries.length !== 149 || entries.filter(item => item.styleType === 'layout').length !== 18) throw new Error('Unexpected catalog composition');
await writeFile(resolve(root, 'src/lib/design-imports/stylekit.json'), `${JSON.stringify(entries, null, 2)}\n`);
await writeFile(resolve(output, 'provenance.json'), `${JSON.stringify({ collection: 'StyleKit', verifiedAt, revision, catalogUrl: `${origin}/api/styles/all.json`, indexUrl: `${origin}/api/styles`, snapshotSha256: createHash('sha256').update(snapshotBytes).digest('hex'), license: 'MIT', licenseUrl, count: entries.length, assets }, null, 2)}\n`);
console.log(`Imported ${entries.length} StyleKit designs (131 visual styles + 18 layouts), ${assets.reduce((sum, asset) => sum + asset.bytes, 0)} bytes of self-contained SVG covers.`);
