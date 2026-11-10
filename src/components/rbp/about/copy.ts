// IAVSE content only; layout and motion live in the upstream Portfolio components.
export type AboutLocale = 'zh' | 'en' | 'ja';
export function aboutLocale(locale = 'zh'): AboutLocale {
  return locale === 'en' || locale === 'ja' ? locale : 'zh';
}
const labels = {
  zh: { experience: '从发现到分享', education: '开始使用', skills: '在这里可以做什么', stack: '构建 IAVSE 的技术', less: '收起', more: (count: number) => `再看 ${count} 项`, reset: '重新排列技术栈' },
  en: { experience: 'From discovery to sharing', education: 'Getting started', skills: 'What you can do', stack: 'Built with', less: 'Show less', more: (count: number) => `Show ${count} more`, reset: 'Reset stack' },
  ja: { experience: '発見から共有へ', education: 'はじめの一歩', skills: 'ここでできること', stack: 'IAVSE を支える技術', less: '閉じる', more: (count: number) => `あと ${count} 件を見る`, reset: '技術スタックを並べ直す' },
};
export function aboutLabels(locale = 'zh') { return labels[aboutLocale(locale)]; }

const journeys = {
  zh: [
    ['资源发现', '设计、知识与工具', '浏览目录'],
    ['社区交流', '分享经验、参与讨论', '社区'],
    ['收藏与关注', '保存内容、关注成员', '持续发现'],
    ['博客模板', '选择内置页面模板', '个人空间'],
    ['可视化编辑', '调整内容与布局', '空间画布'],
    ['预览效果', '发布前检查页面', '预览'],
    ['发布作品', '按当前权限与流程公开', '发布'],
  ],
  en: [
    ['Resource discovery', 'Design, knowledge and tools', 'Directory'],
    ['Community', 'Share experience and discuss', 'Exchange'],
    ['Bookmarks & follows', 'Save content and follow members', 'Discover'],
    ['Blog templates', 'Choose a built-in page template', 'Your space'],
    ['Visual editing', 'Arrange content and layout', 'Canvas'],
    ['Preview', 'Check the page before publishing', 'Review'],
    ['Publishing', 'Use the current permission workflow', 'Share'],
  ],
  ja: [
    ['リソース発見', 'デザイン、知識、ツール', '一覧'],
    ['コミュニティ', '経験の共有と話し合い', '交流'],
    ['保存とフォロー', '内容を保存し、メンバーをフォロー', '発見'],
    ['ブログテンプレート', '内蔵テンプレートを選ぶ', 'スペース'],
    ['ビジュアル編集', '内容とレイアウトを調整', 'キャンバス'],
    ['プレビュー', '公開前にページを確認', '確認'],
    ['作品の公開', '現在の権限と手順に沿って公開', '共有'],
  ],
};
export function journeyEntries(locale = 'zh') {
  return journeys[aboutLocale(locale)].map(([company, role, period]) => ({ company, role, period, brand: '#0a0a0a' }));
}
const steps = {
  zh: [['浏览资源', '查看来源、许可与使用说明', '发现'], ['整理内容', '写下经验，或编辑自己的博客空间', '创作'], ['预览与发布', '检查效果，再按页面流程提交或公开', '分享']],
  en: [['Browse resources', 'Check sources, licenses and usage notes', 'Discover'], ['Shape your content', 'Write a post or edit your blog space', 'Create'], ['Preview & publish', 'Check the result and follow the page workflow', 'Share']],
  ja: [['リソースを見る', '出典、ライセンス、使い方を確認', '発見'], ['内容を整理する', '経験を書く、自分のブログを編集する', '制作'], ['確認して公開', 'プレビュー後、画面の手順に沿って公開', '共有']],
};
export function usageEntries(locale = 'zh') {
  return steps[aboutLocale(locale)].map(([school, degree, period]) => ({ school, degree, period }));
}
const features = {
  zh: ['UI 设计目录', 'AI Skills', '文档与知识', '网站与工具', '社区讨论', '收藏与关注', '博客模板', '可视化画布', '预览与发布'],
  en: ['UI Design Directory', 'AI Skills', 'Documentation', 'Websites & Tools', 'Community Discussion', 'Bookmarks & Follows', 'Blog Templates', 'Visual Canvas', 'Preview & Publish'],
  ja: ['UI デザイン一覧', 'AI Skills', 'ドキュメント', 'サイトとツール', 'コミュニティ', '保存とフォロー', 'ブログテンプレート', 'ビジュアル編集', '確認と公開'],
};
export function featureLabels(locale = 'zh') { return features[aboutLocale(locale)]; }
