import Link from 'next/link';
import {Icon} from './Icons';
import {ProductStoryMotion} from './ProductStoryMotion';
import '@/app/blog-space-product.css';

const copy = {
 zh: {
  title: '你的积累，\n值得有自己的地方。',
  intro: '用一个链接分享你的作品、文章和履历。',
  spaceLabel: '博客空间', create: '创建我的空间', guide: '阅读空间指南',
  homeTitle: '个人主页，\n也是你的作品集。', homeBody: '放上自我介绍和联系方式。',
  roles: [
   {title: '作品集', body: '用图片和链接展示项目。'},
   {title: '长文与随笔', body: '发表文章，记录创作过程。'},
   {title: '资源分享', body: '附上文件或链接，注明来源与许可。'},
   {title: '在线履历', body: '整理经历与技能，也可附简历 PDF。'},
  ],
  editorTitle: '像布置书桌一样，\n布置你的页面。',
  editorFeatures: [
   {title: '选择模板', body: '调整配色、字体和栏目。'},
   {title: '拖动图层', body: '移动、排序或隐藏内容。'},
   {title: '预览版面', body: '检查电脑、平板和手机布局。'},
  ],
  editorCaption: '画布编辑器 · 图层与版面', publicCaption: '发布后的个人主页', close: '从今天的一个想法，写起。',
  publishTitle: '从草稿到发布',
  steps: [
   {title: '保存草稿', body: '普通成员的主页草稿仅自己可见，保存后不会替换已经公开的页面。'},
   {title: '发布前检查', body: '核对公开信息和图文使用权，并确认社区规则。'},
   {title: '发布内容', body: '主页、作品与资源由作者手动发布后公开。文章以提交时的版本送审，审核通过后公开。'},
  ],
  visibilityTitle: '管理主页可见性',
  visibilityBody: '关闭“允许在平台中发现我的博客”，即可保留公开链接而不进入平台目录。也可在发布设置中下线主页。',
  faqTitle: '常见问题',
  faqs: [
   {q: '建主页需要写代码吗？', a: '不需要。选择内置模板，在画布上直接编辑即可。'},
   {q: '画廊里的主页能直接套用吗？', a: '画廊供浏览参考，可直接套用的版式以内置模板库为准。'},
  ],
 },
 en: {
  title: 'Make room\nfor what you make.',
  intro: 'Share your work, writing and résumé with one link.',
  spaceLabel: 'Blog spaces', create: 'Create my space', guide: 'Read the space guide',
  homeTitle: 'Your profile.\nYour body of work.', homeBody: 'Introduce yourself and add contact links.',
  roles: [
   {title: 'Portfolio', body: 'Show projects with images and links.'},
   {title: 'Articles and notes', body: 'Publish essays and notes about your work.'},
   {title: 'Shared resources', body: 'Share files or links with their sources and licenses.'},
   {title: 'Online résumé', body: 'List your experience and skills, or attach a résumé PDF.'},
  ],
  editorTitle: 'A canvas to\nmake yourself at home.',
  editorFeatures: [
   {title: 'Choose a template', body: 'Set colors, type and sections.'},
   {title: 'Arrange layers', body: 'Drag, reorder or hide content.'},
   {title: 'Preview the layout', body: 'Check desktop, tablet and phone views.'},
  ],
  editorCaption: 'Canvas editor · layers and layout', publicCaption: 'The published homepage', close: 'Start with something on your mind.',
  publishTitle: 'From draft to publication',
  steps: [
   {title: 'Save a draft', body: 'For regular members, homepage drafts stay private. Saving keeps the published page intact.'},
   {title: 'Check before publishing', body: 'Review public details and usage rights, then confirm the community rules.'},
   {title: 'Publish', body: 'Authors publish homepages, projects and resources manually. Articles go live after reviewers approve the submitted version.'},
  ],
  visibilityTitle: 'Homepage visibility',
  visibilityBody: 'Turn off “List my blog on the platform” to keep a public link outside the directory. Use publish settings to take the homepage offline.',
  faqTitle: 'Common questions',
  faqs: [
   {q: 'Do I need to code?', a: 'No. Choose a built-in template and edit directly on the canvas.'},
   {q: 'Can I use a gallery page as my template?', a: 'Browse the gallery for ideas. Choose a layout from the editor’s built-in template library to apply it.'},
  ],
 },
 ja: {
  title: '積み重ねたものに、\n自分だけの場所を。',
  intro: '作品、記事、経歴を一つのリンクで共有できます。',
  spaceLabel: 'ブログスペース', create: '自分のスペースを作る', guide: 'スペースガイドを読む',
  homeTitle: 'プロフィールも、\nポートフォリオも。', homeBody: '自己紹介と連絡先を掲載できます。',
  roles: [
   {title: 'ポートフォリオ', body: '画像とリンクで作品を紹介。'},
   {title: '記事とノート', body: '記事を公開し、制作過程を記録。'},
   {title: 'リソース共有', body: '出典とライセンスを添えて資料やリンクを共有。'},
   {title: 'オンライン履歴書', body: '経歴とスキルをまとめ、履歴書 PDF も添付できます。'},
  ],
  editorTitle: '机を整えるように、\nページを整える。',
  editorFeatures: [
   {title: 'テンプレートを選ぶ', body: '配色、書体、項目を調整。'},
   {title: 'レイヤーを整理', body: '移動、並べ替え、非表示に対応。'},
   {title: '表示を確認', body: 'パソコン、タブレット、スマホでプレビュー。'},
  ],
  editorCaption: 'キャンバス編集 · レイヤーと配置', publicCaption: '公開後のホームページ', close: '今日のアイデアから、はじめよう。',
  publishTitle: '下書きから公開まで',
  steps: [
   {title: '下書きを保存', body: '一般メンバーの下書きは本人だけが閲覧できます。保存しても公開中のページは変わりません。'},
   {title: '公開前の確認', body: '公開する情報と画像などの利用権を確認し、コミュニティルールに同意します。'},
   {title: '公開する', body: 'ホームページ、作品、リソースは作者が手動で公開します。記事は提出時の版を審査し、承認後に公開します。'},
  ],
  visibilityTitle: '公開範囲の設定',
  visibilityBody: 'ブログの一覧掲載をオフにしても、公開リンクは使えます。公開設定からホームページを非公開にもできます。',
  faqTitle: 'よくある質問',
  faqs: [
   {q: 'コードを書く必要はありますか？', a: '不要です。内蔵テンプレートを選び、キャンバスで編集できます。'},
   {q: 'ギャラリーのページをテンプレートにできますか？', a: 'ギャラリーは作例集です。適用するレイアウトは編集画面の内蔵テンプレートから選べます。'},
  ],
 },
};

/** Independently authored product introduction. Member discovery stays in the gallery. */
export function BlogProductShowcase({locale}:{locale:string}) {
 const c=locale==='en'?copy.en:locale==='ja'?copy.ja:copy.zh;
 return <div className="blog-space-product" data-blog-space-product data-product-locale={locale} data-rbp-reveal-scope>
  <ProductStoryMotion scope="[data-blog-space-product]" revision={locale}/>
  <section className="bsp-intro" id="blog-space-product" aria-labelledby="blog-product-title">
   <header className="bsp-intro-heading" data-rbp-reveal-group>
    <span className="bsp-eyebrow" data-rbp-reveal-item>IAVSE · {c.spaceLabel}</span>
    <h2 id="blog-product-title" data-rbp-reveal-item>{c.title}</h2>
    <p data-rbp-reveal-item>{c.intro}</p>
    <div className="bsp-actions" data-rbp-reveal-item><Link className="bsp-primary" href="/workspace/blog">{c.create}</Link><Link className="bsp-text-link" href="/docs/showcase">{c.guide}</Link></div>
   </header>
   <div className="bsp-writing-art" data-story-art><img src="/media/product-story/writing.webp" srcSet="/media/product-story/writing-960.webp 960w, /media/product-story/writing.webp 1536w" sizes="(max-width: 900px) 100vw, 90vw" alt="" width={1536} height={1024} loading="lazy" decoding="async"/></div>
  </section>

  <section className="bsp-editor" aria-labelledby="blog-space-editor-title">
   <header className="bsp-editor-copy" data-rbp-reveal-group><h2 id="blog-space-editor-title" data-rbp-reveal-item>{c.editorTitle}</h2><dl className="bsp-editor-features">{c.editorFeatures.map(feature=><div key={feature.title} data-rbp-reveal-item><dt>{feature.title}</dt><dd>{feature.body}</dd></div>)}</dl></header>
   <figure className="bsp-product-capture"><picture><source media="(max-width: 600px)" srcSet="/media/product-story/editor-compact.webp" width={640} height={620}/><img src="/media/product-story/editor.webp" alt={c.editorCaption} width={2035} height={964} loading="lazy" decoding="async"/></picture><figcaption>{c.editorCaption}</figcaption></figure>
  </section>

  <section className="bsp-collection" aria-labelledby="blog-space-collection-title">
   <header className="bsp-collection-copy" data-rbp-reveal-group><h2 id="blog-space-collection-title" data-rbp-reveal-item>{c.homeTitle}</h2><p data-rbp-reveal-item>{c.homeBody}</p></header>
   <figure className="bsp-product-capture"><img src="/media/product-story/published.webp" alt={c.publicCaption} width={2035} height={964} loading="lazy" decoding="async"/><figcaption>{c.publicCaption}</figcaption></figure>
   <dl className="bsp-content-roles" data-rbp-reveal-group>{c.roles.map(role=><div key={role.title} data-rbp-reveal-item><dt>{role.title}</dt><dd>{role.body}</dd></div>)}</dl>
  </section>

  <section className="bsp-publishing" aria-labelledby="blog-space-publish-title">
   <h2 id="blog-space-publish-title" data-rbp-reveal-item>{c.publishTitle}</h2>
   <ol className="bsp-publish-steps" data-rbp-reveal-group>{c.steps.map((step,index)=><li key={step.title} data-rbp-reveal-item><span className="bsp-step-number" aria-hidden="true">0{index+1}</span><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol>
   <aside className="bsp-visibility" data-rbp-reveal-item><Icon name="settings"/><div><h3>{c.visibilityTitle}</h3><p>{c.visibilityBody}</p></div></aside>
  </section>

  <section className="bsp-faq" aria-labelledby="blog-space-faq-title" data-rbp-reveal-group><h2 id="blog-space-faq-title" data-rbp-reveal-item>{c.faqTitle}</h2><div>{c.faqs.map(faq=><details key={faq.q} data-rbp-reveal-item><summary>{faq.q}<Icon name="plus"/></summary><p>{faq.a}</p></details>)}</div></section>

  <footer className="bsp-close" data-rbp-reveal-group><p data-rbp-reveal-item>{c.close}</p><div className="bsp-actions" data-rbp-reveal-item>
   <Link className="bsp-primary" href="/workspace/blog">{c.create}</Link><Link className="bsp-text-link" href="/docs/showcase">{c.guide}</Link>
  </div></footer>
 </div>;
}
