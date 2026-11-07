#!/usr/bin/env python3
"""Build a metadata-only Skill index from pinned, reviewed source mappings.

Usage: python3 scripts/skill-import/build.py --evidence-file /tmp/evidence.json
       python3 scripts/skill-import/build.py --refresh

--refresh reads only the pinned text URLs in the manifest. It does not install
packages, execute upstream code, or save SKILL bodies to the repository.
"""
import argparse
import concurrent.futures
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'src/lib/skill-imports'
MANIFEST = json.loads((Path(__file__).with_name('vibeui-manifest.json')).read_text())
DATE = MANIFEST['verifiedAt']
COLLECTOR = {'name': 'VibeUI', 'url': 'https://vibeui.top/?lang=zh'}
COLLECTION_EVIDENCE = f"https://github.com/{MANIFEST['collectionRepo']}/blob/{MANIFEST['collectionCommit']}/{MANIFEST['collectionPath']}"
STYLE_REPO = 'AnxForever/stylekit-skill'
STYLE_COMMIT = '93b9c1de903a6c3f6f7944224b26d154b325e1eb'
KNOWN_COLLECTIONS = {'emilkowalski/skill', 'raintree-technology/apple-hig-skills', 'CloudAI-X/threejs-skills', 'ehmo/platform-design-skills', 'replicate/skills', 'ibelick/ui-skills'}

def blob(repo, commit, path):
    return f'https://github.com/{repo}/blob/{commit}/{path}' if commit and path else f'https://github.com/{repo}' if repo else ''

def frontmatter(text, key):
    if not text.startswith('---'): return ''
    header = text.split('---', 2)[1]
    match = re.search(r'^' + re.escape(key) + r':\s*([^\n]+)', header, re.M)
    return match.group(1).strip().strip('\"\'') if match else ''

def license_info(text):
    if 'Figma Developer Terms' in text: return 'Figma Developer Terms', 'custom'
    if 'GNU AFFERO GENERAL PUBLIC LICENSE' in text: return 'AGPL-3.0', 'verified'
    if 'Attribution 4.0 International' in text: return 'CC-BY-4.0', 'verified'
    if 'CC0 1.0 Universal' in text: return 'CC0-1.0', 'verified'
    if 'Apache License' in text and 'Version 2.0' in text: return 'Apache-2.0', 'verified'
    if 'MIT License' in text or 'Permission is hereby granted, free of charge' in text: return 'MIT', 'verified'
    if 'Redistribution and use in source and binary forms' in text: return 'BSD（以上游条款为准）', 'custom'
    if text: return '上游专用条款', 'custom'
    return '待核实', 'unverified'

def category(identifier):
    if re.search(r'gsap|motion|video|animation|animate|hyperframes|audio|music|gif|sora|speech|sprite|vfx|frame-', identifier): return 'motion'
    if re.search(r'test|debug|review|audit|quality|accessibility|smoke', identifier): return 'testing'
    if re.search(r'agent|skill-creator|find-skills|brainstorm|plugin|superpower|todo|plan|ralph', identifier): return 'agents'
    if re.search(r'doc|pdf|ppt|deck|slides|report|research|notes|finance|valuation|memo|readme|knowledge|meeting|weekly|okr|runbook|seo|copywriting|marketing', identifier): return 'knowledge'
    if re.search(r'code|deploy|react|nextjs|vue|tailwind|shadcn|frontend-dev|export|build|browser', identifier): return 'engineering'
    return 'design'

def summary(identifier, name, kind):
    if kind == 'reference': return '保留原目录的来源线索；尚未确认与原收录名称对应的独立 Skill，请先查看上游说明。'
    if kind == 'collection': return '多个相关 Skill 的上游合集入口。可在原仓库选择具体模块；合集按一项列出，不重复计算其内部文件。'
    overrides = {
      'gsap-core': '编写 GSAP 补间动画，组织目标、缓动与动画参数。',
      'gsap-timeline': '用时间轴安排多个动画的先后、重叠和播放控制。',
      'gsap-react': '在 React 生命周期内组织 GSAP 动画与清理逻辑。',
      'gsap-scrolltrigger': '把滚动位置与动画进度、触发时机联系起来。',
      'gsap-performance': '检查动画的渲染成本与常见性能问题。',
      'gsap-frameworks': '在不同前端框架中管理动画实例和组件生命周期。',
      'gsap-plugins': '查询 GSAP 插件的注册方式与适用场景。',
      'gsap-utils': '使用 GSAP 的数值、范围和集合辅助方法。',
      'theme-factory': '为文档、演示和网页选择一致的颜色与字体主题。',
      'brand-guidelines': '应用 Anthropic 的品牌视觉规范；品牌标识的使用仍须遵守其要求。',
      'canvas-design': '组织静态画面的构图、排版和视觉层次。',
      'frontend-design': '把视觉方向转化为前端界面的布局、字体与交互细节。',
      'ui-ux-pro-max': '查阅界面设计参考，将视觉风格与组件实现联系起来。',
      'impeccable': '检查和调整前端界面的视觉层次、排版、交互与一致性。',
      'brainstorming': '在实现之前梳理目标、约束和方案选择。',
      'writing-skills': '组织可复用的 Skill 指令，并检查其触发范围与可验证性。',
      'copywriting': '围绕页面目标安排文案的信息顺序与行动提示。',
      'find-skills': '查找适合当前任务的代理 Skill 与原始发布位置。',
      'web-design-guidelines': '依据 Web Interface Guidelines 检查界面代码的可访问性、交互与呈现细节。',
      'twitter-automation': '通过 inference.sh 的接口组织 X 平台操作；功能权限与服务条件以上游说明为准。',
      'competitive-ads-extractor': '整理竞品广告资料，支持后续分析与内容对比。',
      'domain-name-brainstormer': '围绕项目需求构思域名候选，并组织进一步核查。',
      'seo-audit': '检查网站与搜索展示有关的问题，并整理改进建议。',
      'design-md': '整理可供后续界面实现使用的设计系统说明。',
      'screenshot': '按明确的捕获目标获取屏幕或应用界面的截图。',
      'speech': '将文本组织为语音生成任务，并检查输出需求。',
      'imagegen': '组织图片生成或编辑请求，保留任务所需的输入与输出约束。',
    }
    if identifier in overrides: return overrides[identifier]
    if 'figma-' in identifier: return '围绕 Figma 设计文件开展 ' + name.replace('Figma ', '') + ' 工作；使用受 Figma Developer Terms 约束。'
    if re.search(r'ppt|deck|slides|presentation', identifier): return '组织演示内容的章节、页面编排与展示节奏；具体模板和依赖见上游文档。'
    if re.search(r'video|hyperframes|motion|animation|vfx|frame-', identifier): return '为 ' + name + ' 场景组织画面、时序与动效制作步骤。'
    if re.search(r'pdf|docx|doc-|report|notes|runbook|okr|weekly', identifier): return '将 ' + name + ' 场景中的信息整理为可阅读、可交付的文档结构。'
    if re.search(r'test|debug|audit|review|quality', identifier): return '针对 ' + name + ' 的工作环节检查输出、定位问题并整理复核结果。'
    if re.search(r'fal-|venice-|imagen|image|poster', identifier): return '组织 ' + name + ' 的媒体处理流程；模型、接口和素材条件以上游说明为准。'
    if re.search(r'plugin|od-|build|code|export|deploy|import|patch|token-map|handoff', identifier): return '提供 ' + name + ' 的操作步骤与交付约束，适用环境请查看具体 Skill 文件。'
    return '收录 ' + name + ' 的上游工作指引；输入要求、适用环境与具体操作见原始 Skill 文件。'

def fetch_documents():
    targets = set()
    for row in MANIFEST['entries']:
        if row['disposition'] == 'excluded' or not row['commit']: continue
        for key in ['path', 'licensePath', 'readmePath']:
            if row[key]: targets.add((row['repo'], row['commit'], row[key]))
    for path in ['SKILL.md', 'LICENSE', 'README.md']:
        targets.add((STYLE_REPO, STYLE_COMMIT, path))
    def fetch(target):
        repo, commit, path = target
        url = f'https://raw.githubusercontent.com/{repo}/{commit}/{path}'
        result = {'repo': repo, 'commit': commit, 'path': path, 'url': url}
        try:
            text = subprocess.check_output(['curl', '--fail', '--silent', '--show-error', '--max-time', '30', url], stderr=subprocess.PIPE).decode()
            return {**result, 'ok': True, 'text': text, 'sha256': hashlib.sha256(text.encode()).hexdigest()}
        except (subprocess.CalledProcessError, UnicodeError):
            return {**result, 'ok': False, 'error': 'pinned source could not be read'}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        return list(executor.map(fetch, sorted(targets)))

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--evidence-file', type=Path)
    parser.add_argument('--refresh', action='store_true')
    args = parser.parse_args()
    if not args.refresh and not args.evidence_file:
        parser.error('provide --evidence-file or --refresh; source text is not stored in this repository')
    docs = fetch_documents() if args.refresh else json.loads(args.evidence_file.read_text())
    evidence = {(d['repo'], d['commit'], d['path']): d for d in docs if d.get('ok')}
    def document(row, key):
        return evidence.get((row['repo'], row['commit'], row.get(key, '')), {})
    grouped = {}
    audit_rows = []
    for row in MANIFEST['entries']:
        audit = {key: value for key, value in row.items() if key not in ['tags', 'readmePath', 'licensePath']}
        if row['disposition'] == 'excluded':
            audit['catalogId'] = None; audit_rows.append(audit); continue
        verified = bool(row['path'] and document(row, 'path')) and row['disposition'] in ['verified', 'collection-member']
        is_collection = not verified and row['repo'] in KNOWN_COLLECTIONS and bool(document(row, 'readmePath'))
        kind = 'single' if verified else 'collection' if is_collection else 'reference'
        key = (row['repo'] or row['collectedSourceUrl'], row['path'] if verified else kind)
        if key in grouped:
            entry = grouped[key]
            entry['collectionEntries'].append(row['collectionEntryId'])
            audit['disposition'] = 'duplicate' if verified and row['disposition'] == 'verified' else row['disposition']
            if audit['disposition'] == 'duplicate': audit['reason'] = '与已有条目指向同一仓库、固定版本和 Skill 文件，合并显示。'
            audit['catalogKind'] = entry['kind']
            if entry['kind'] == 'collection':
                audit['disposition'] = 'collection-member'
                audit['reason'] = '与已有上游 Skill 合集入口合并；没有虚构同名的独立 Skill。'
            audit['catalogId'] = entry['id']; audit_rows.append(audit); continue
        text = document(row, 'path').get('text', '') if verified else ''
        upstream_name = frontmatter(text, 'name')
        if row['repo'] == 'op7418/NanoBanana-PPT-Skills' and verified: upstream_name = 'ppt-generator-pro'
        if not upstream_name and verified:
            upstream_name = row['path'].split('/')[-2] if '/' in row['path'] else row['repo'].split('/')[-1]
        entry_id = 'vibeui-' + (row['collectionEntryId'].removeprefix('od-') if verified else re.sub(r'[^a-z0-9]+', '-', (row['repo'] or row['collectionEntryId']).lower()).strip('-') + ('' if verified else '-' + kind))
        if any(e['id'] == entry_id for e in grouped.values()): entry_id += '-' + hashlib.sha256(str(key).encode()).hexdigest()[:6]
        name = row['collectionEntryName'] if verified else row['repo'].split('/')[-1] if row['repo'] else row['collectionEntryName']
        if row['disposition'] == 'collection-member': name = upstream_name
        if kind == 'collection':
            name = {'emilkowalski/skill':'Emil Kowalski Skills','raintree-technology/apple-hig-skills':'Apple HIG Skills','ehmo/platform-design-skills':'Platform Design Skills','replicate/skills':'Replicate Skills','CloudAI-X/threejs-skills':'Three.js Skills','ibelick/ui-skills':'UI Skills'}[row['repo']] + ' · 合集'
        if kind == 'reference': name += ' · 待核实来源'
        license_document = document(row, 'licensePath')
        license_id, license_status = license_info(license_document.get('text', ''))
        declaration = frontmatter(text, 'license')
        license_scope = 'skill-directory' if '/' in row['licensePath'] else 'repository'
        license_note = '记录该 Skill 目录或所属仓库公布的条款；不代表其中外部素材、商标和服务均获相同授权。'
        license_url = blob(row['repo'], row['commit'], row['licensePath']) if license_document else ''
        if not license_document:
            readme = document(row, 'readmePath').get('text', '')
            readme_url = blob(row['repo'], row['commit'], row['readmePath'])
            if 'Permission is hereby granted, free of charge' in readme and 'THE SOFTWARE IS PROVIDED' in readme:
                license_id, license_status, license_scope, license_url = 'MIT', 'verified', 'readme-license-text', readme_url
                license_note = '上游 README 包含完整 MIT 许可文本；外部素材与服务仍须分别核对。'
            elif re.search(r'(?:##[^\n]*(?:License|许可证)[\s\S]{0,150}MIT|License[-:]\s*MIT)', readme, re.I):
                license_id, license_status, license_scope, license_url = 'MIT', 'custom', 'readme-declaration', readme_url
                license_note = '上游 README 声明 MIT；本次没有读到对应的许可证全文，仅记录声明并保留来源索引。'
            elif 'This repository is licensed under the Apache License 2.0' in readme:
                license_id, license_status, license_scope, license_url = 'Apache-2.0（仓库声明）', 'custom', 'readme-declaration', readme_url
                license_note = 'README 声明仓库采用 Apache-2.0，同时指出各 Skill 可能有不同许可；此条目的独立许可尚未确认。'
        if declaration in ['MIT', 'Apache-2.0', 'CC-BY-4.0', 'AGPL-3.0'] and declaration != license_id:
            license_id = declaration + '（文件声明；仓库许可另见来源）'
            license_status = 'custom'; license_scope = 'file-declaration'
            license_note = 'Skill 文件声明与仓库许可证不同；仅提供来源索引，不判定两者的适用范围。'
        source_url = blob(row['repo'], row['commit'], row['path'] if verified else row['readmePath']) or row['collectedSourceUrl']
        entry = {
          'id': entry_id, 'slug': entry_id, 'name': name,
          'category': category(upstream_name or row['collectionEntryId']),
          'repo': row['repo'], 'commit': row['commit'], 'upstreamSkillName': upstream_name,
          'path': row['path'].rsplit('/', 1)[0] if verified and '/' in row['path'] else '',
          'skillFile': row['path'] if verified else '', 'sourceUrl': source_url,
          'source': {'name': row['repo'] or 'TypeUI', 'url': f"https://github.com/{row['repo']}" if row['repo'] else row['collectedSourceUrl']},
          'collection': COLLECTOR, 'collectionEntries': [row['collectionEntryId']],
          'tags': [kind == 'collection' and 'Skill 合集' or kind == 'reference' and '待核实' or '上游索引', category(upstream_name or row['collectionEntryId'])],
          'summary': summary(upstream_name or row['collectionEntryId'].removeprefix('od-'), name, kind),
          'license': license_id, 'licenseUrl': license_url,
          'licenseStatus': license_status, 'licenseScope': license_scope, 'licenseNote': license_note,
          'sourceStatus': 'verified' if verified or is_collection else 'unverified',
          'provenance': {'verifiedAt': DATE, 'evidenceUrl': source_url, 'collectionEvidenceUrl': COLLECTION_EVIDENCE, 'note': row['reason'] if not is_collection else '已核实仓库的 Skill 合集入口；没有把合集中的每个模块伪装成原目录的独立收录项。'},
          'tools': [], 'installUrl': blob(row['repo'], row['commit'], row['readmePath']) or source_url,
          'installCommand': '', 'kind': kind,
        }
        grouped[key] = entry
        audit['catalogId'] = entry_id; audit['catalogKind'] = kind
        if is_collection:
            audit['disposition'] = 'collection'
            audit['reason'] = '已核实上游 README 的 Skill 合集入口；不将合集名称解释为一个不存在的同名 Skill 文件。'
        audit_rows.append(audit)
    # StyleKit is ONE package, regardless of the number of styles its API serves.
    sr = {'repo': STYLE_REPO, 'commit': STYLE_COMMIT, 'path': 'SKILL.md', 'readmePath': 'README.md', 'licensePath': 'LICENSE'}
    for key in ['path', 'readmePath', 'licensePath']:
        if not document(sr, key): raise SystemExit('StyleKit pinned source is unreadable; abort without overwriting outputs')
    command = 'npx skills@latest add AnxForever/stylekit-skill'
    if command not in document(sr, 'readmePath')['text']: raise SystemExit('StyleKit install command was not found in README')
    style_url = blob(STYLE_REPO, STYLE_COMMIT, 'SKILL.md')
    style = {
      'id':'stylekit', 'slug':'stylekit', 'name':'StyleKit', 'category':'design', 'repo':STYLE_REPO, 'commit':STYLE_COMMIT,
      'upstreamSkillName':'stylekit', 'path':'', 'skillFile':'SKILL.md', 'sourceUrl':style_url,
      'source':{'name':STYLE_REPO,'url':f'https://github.com/{STYLE_REPO}'},
      'collection':{'name':'StyleKit','url':'https://www.stylekit.top/zh/styles'}, 'collectionEntries':['stylekit-official-skill'],
      'tags':['风格规范','界面审查','设计系统'], 'summary':'读取 StyleKit 的风格规格，再结合项目的框架与组件实现界面、调整视觉或检查一致性。一个 Skill 对应整个风格目录；脚本需要 Python 3.10+。',
      'license':'MIT','licenseUrl':blob(STYLE_REPO,STYLE_COMMIT,'LICENSE'),'licenseStatus':'verified','licenseScope':'repository',
      'licenseNote':'Skill 仓库以 MIT 发布；所引用的外部组件、模板、品牌与素材须分别核对原始条款。', 'sourceStatus':'verified',
      'provenance':{'verifiedAt':DATE,'evidenceUrl':blob(STYLE_REPO,STYLE_COMMIT,'README.md'),'collectionEvidenceUrl':'https://github.com/AnxForever/stylekit/blob/38058485388d237745ccf58c6750c2ec661a72f4/README.md','note':'StyleKit 主仓库 README 直接链接此独立 Skill 仓库，名称、许可与安装指令已核实。'},
      'tools':[], 'installUrl':blob(STYLE_REPO,STYLE_COMMIT,'README.md'), 'installCommand':command, 'kind':'single',
    }
    all_entries = list(grouped.values())
    references = [r for r in all_entries if r['kind'] == 'reference']
    catalog = [r for r in all_entries if r['kind'] != 'reference']
    assert len(audit_rows) == 341 and len({r['collectionEntryId'] for r in audit_rows}) == 341
    assert len({r['id'] for r in catalog}) == len(catalog)
    assert all(not r['installCommand'] for r in catalog)
    counts = {name:sum(r['kind'] == name for r in all_entries) for name in ['single','collection','reference']}
    audit = {'verifiedAt': DATE, 'collectionEvidenceUrl': COLLECTION_EVIDENCE, 'inputCount':341, 'catalogCount':len(catalog), 'referenceCount':len(references), 'counts':counts, 'entries':audit_rows}
    # Only hashes, paths and extracted factual metadata are published; never upstream prompt bodies.
    records = [{'repo':d['repo'],'commit':d['commit'],'path':d['path'],'url':blob(d['repo'],d['commit'],d['path']),'sha256':hashlib.sha256(d['text'].encode()).hexdigest()} for d in docs if d.get('ok')]
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, data in [('vibeui.json',catalog),('vibeui-references.json',references),('stylekit.json',[style]),('vibeui-audit.json',audit),('evidence.json',{'verifiedAt':DATE,'documents':records})]:
        (OUT / filename).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'vibeui':len(catalog),**counts,'stylekit':1,'auditRows':341,'excluded':sum(r['catalogId'] is None for r in audit_rows),'verifiedDocuments':len(records)},ensure_ascii=False))

if __name__ == '__main__': main()
