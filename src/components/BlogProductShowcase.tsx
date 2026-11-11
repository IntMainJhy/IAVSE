import Link from 'next/link';
import {Icon} from './Icons';
import '@/app/blog-space-product.css';

const copy = {
 zh: {
  title:'让作品与想法，\n有自己的主页。',
  intro:'博客空间把个人介绍、作品、文章和资源放在同一个地址。用可视化画布组织你的主页，让第一次来访的人认识你，也让持续积累的内容有处可寻。',
  create:'创建我的空间', guide:'阅读空间指南',
  homeTitle:'个人主页', homeBody:'从一句自我介绍开始，把作品、经历与联系方式连成一个完整的你。', homeAddress:'一个可以分享的主页地址',
  roles:[
   {title:'作品集',body:'展示项目与创作，用介绍、配图和链接说明你做了什么。'},
   {title:'长文与随笔',body:'为完整的文章保留阅读空间，也把持续思考留在自己的主页。'},
   {title:'资源分享',body:'整理有用的链接或文件，写清用途、来源与使用许可。'},
   {title:'在线履历',body:'组织经历、技能和自定义栏目，也可以提供公开的简历 PDF。'},
  ],
  editorTitle:'内容由你写，\n版面由你安排。',
  editorBody:'在页面上直接改文字，拖动栏目调整位置。图片、文字、链接按钮与贴纸可以加入画布，给内容留出合适的位置。',
  editorFeatures:[
   {title:'从内置模板起步',body:'先选页面排版与外观，再调整颜色、字体和栏目样式。'},
   {title:'按内容整理图层',body:'选择、移动、隐藏或排列栏目；撤销与重做让调整有回头路。'},
   {title:'换个屏幕，再看一遍',body:'切换电脑、平板与手机预览，检查桌面布局与小屏幕的阅读顺序。'},
  ],
  diagramCaption:'画布结构示意，非交互编辑器。实际功能与可用模板以编辑器为准。',
  diagram:{canvas:'空间画布',draft:'草稿',layers:'内容图层',about:'关于我',projects:'作品与项目',writing:'文字与思考',style:'样式',type:'字体',color:'颜色',layout:'布局',preview:'预览',devices:'电脑 · 平板 · 手机'},
  publishTitle:'准备好了，\n再让它被看见。',
  publishBody:'草稿与公开版本各有自己的位置。你可以继续修改，再主动决定何时发布下一版。',
  steps:[
   {title:'先保存草稿',body:'普通成员保存的主页草稿仅自己可见，不会替换已经公开的页面。'},
   {title:'预览并核对',body:'检查不同屏幕的效果、公开的个人信息，以及内容和图片的使用权；发布前需确认社区规则。'},
   {title:'手动提交发布',body:'主页、作品与资源由作者手动发布后公开；文章会固定提交的版本，审核通过后公开。'},
  ],
  privateLabel:'工作中的草稿',privateNote:'继续编辑',publishLabel:'手动发布',publicLabel:'已公开的版本',publicNote:'保留本次发布的内容',reviewNote:'文章经审核后公开',
  visibilityTitle:'公开与被发现，分别由你选择。',
  visibilityBody:'可以关闭“允许在平台中发现我的博客”，保留公开链接而不进入平台目录。想暂停公开时，可在发布设置中暂时下线主页。',
  faqTitle:'开始前，你可能还想知道',
  faqs:[
   {q:'需要先会写代码吗？',a:'使用内置模板与画布编辑不需要编写代码。你可以在画布中编辑文字、上传图片，调整栏目和样式，再预览与发布。'},
   {q:'画廊里的主页，都能作为模板直接套用吗？',a:'画廊包含真实公开空间与标明虚构人物的原创主页示例。它们展示不同的表达方式；编辑器中可直接使用的模板，以内置模板库为准。'},
  ],
  closeTitle:'从一段介绍，开始你的空间。',
  closeBody:'先写下你希望被认识的部分，版面与内容可以慢慢完善。',
 },
 en: {
  title:'A home for what\nyou make and think.',
  intro:'Bring your introduction, projects, writing and resources together at one address. Arrange your homepage on a visual canvas, so new visitors can get to know you and returning readers can find your work.',
  create:'Create my space', guide:'Read the space guide',
  homeTitle:'Your personal homepage',homeBody:'Start with an introduction. Connect your work, experience and contact links in one place that feels like you.',homeAddress:'One homepage address to share',
  roles:[
   {title:'Portfolio',body:'Present projects and creative work with descriptions, images and links that explain what you made.'},
   {title:'Articles and notes',body:'Give longer pieces room to be read, and keep your ongoing thinking connected to your homepage.'},
   {title:'Shared resources',body:'Collect useful links or files with their purpose, source and usage license.'},
   {title:'Online résumé',body:'Organise experience, skills and custom sections. You can also share a public résumé PDF.'},
  ],
  editorTitle:'Write the content.\nArrange the page.',
  editorBody:'Edit text directly on the page and drag sections into place. Add images, text, link buttons and stickers to give each part of your work the space it needs.',
  editorFeatures:[
   {title:'Begin with a built-in template',body:'Choose a page layout and appearance, then adjust colors, type and section styles.'},
   {title:'Organise your content in layers',body:'Select, move, hide or arrange sections. Undo and redo help you revisit a change.'},
   {title:'See it on another screen',body:'Preview desktop, tablet and mobile views to check your layout and the reading order on smaller screens.'},
  ],
  diagramCaption:'Canvas structure illustration, not an interactive editor. Available features and templates are shown in the editor.',
  diagram:{canvas:'Space canvas',draft:'Draft',layers:'Content layers',about:'About me',projects:'Projects',writing:'Writing',style:'Style',type:'Type',color:'Color',layout:'Layout',preview:'Preview',devices:'Desktop · Tablet · Mobile'},
  publishTitle:'Publish when\nyou are ready.',
  publishBody:'Your draft and published page are separate versions. Keep working, then choose when to share the next version.',
  steps:[
   {title:'Save a draft first',body:'For regular members, saved homepage drafts stay private and do not replace the published page.'},
   {title:'Preview and check',body:'Check different screen sizes, personal information, and rights to your content and images. Confirm the community rules before publishing.'},
   {title:'Submit to publish',body:'Homepages, projects and resources become public when their author publishes them. Articles submit a fixed version for review and become public after approval.'},
  ],
  privateLabel:'Your working draft',privateNote:'Keep editing',publishLabel:'Publish manually',publicLabel:'The published version',publicNote:'Keeps the content you published',reviewNote:'Articles are reviewed before publication',
  visibilityTitle:'Choose whether people can discover it, too.',
  visibilityBody:'Turn off “List my blog on the platform” to keep a public link without appearing in the platform directory. You can take your homepage offline in publish settings when you want to pause public access.',
  faqTitle:'Before you begin',
  faqs:[
   {q:'Do I need to know how to code?',a:'Built-in templates and the visual canvas work without code. Edit text, upload images, adjust sections and styles, then preview and publish.'},
   {q:'Can every homepage in the gallery be applied as a template?',a:'The gallery includes real public spaces and original homepage examples labeled as fictional. They show different ways to present work. Templates you can apply are those available in the editor’s built-in library.'},
  ],
  closeTitle:'Begin with a few words about you.',
  closeBody:'Start with what you want to share. Your content and layout can grow from there.',
 },
 ja: {
  title:'作品も、言葉も。\n自分の場所へ。',
  intro:'自己紹介、作品、記事、リソースを一つのアドレスに。ビジュアルキャンバスでホームページを整え、初めての人には自分を知ってもらい、何度も訪れる人には積み重ねた内容を届けられます。',
  create:'自分のスペースを作る',guide:'スペースガイドを読む',
  homeTitle:'自分のホームページ',homeBody:'自己紹介から始めて、作品、経験、連絡先を一つにつなぎます。',homeAddress:'共有できるホームページアドレス',
  roles:[
   {title:'ポートフォリオ',body:'プロジェクトや作品に説明、画像、リンクを添えて、何を作ったのかを伝えます。'},
   {title:'記事とノート',body:'長い文章を落ち着いて読める場所を用意し、考え続けていることをホームページに残します。'},
   {title:'リソースの共有',body:'役立つリンクやファイルを、用途、出典、利用ライセンスとともに整理します。'},
   {title:'オンライン履歴書',body:'経験、スキル、独自の項目を整理。公開する履歴書 PDF も用意できます。'},
  ],
  editorTitle:'内容を書いて、\n自分らしく並べる。',
  editorBody:'ページ上の文字を直接編集し、項目をドラッグして配置。画像、テキスト、リンクボタン、ステッカーを加え、内容に合う余白を作れます。',
  editorFeatures:[
   {title:'内蔵テンプレートから始める',body:'ページの配置と外観を選び、色、書体、項目のスタイルを調整できます。'},
   {title:'内容をレイヤーで整理する',body:'項目を選択、移動、非表示、整列。元に戻す・やり直す操作で変更を見直せます。'},
   {title:'画面を変えて確認する',body:'パソコン、タブレット、スマートフォンのプレビューで、配置と小さな画面の読み順を確認できます。'},
  ],
  diagramCaption:'キャンバス構造の説明図です。操作はできません。利用できる機能とテンプレートは編集画面で確認できます。',
  diagram:{canvas:'スペースキャンバス',draft:'下書き',layers:'内容レイヤー',about:'自己紹介',projects:'作品とプロジェクト',writing:'記事とノート',style:'スタイル',type:'書体',color:'色',layout:'配置',preview:'プレビュー',devices:'パソコン · タブレット · スマホ'},
  publishTitle:'準備ができたら、\n公開する。',
  publishBody:'下書きと公開中のページは別のバージョンです。編集を続けながら、次の内容を共有するタイミングを選べます。',
  steps:[
   {title:'まず下書きを保存',body:'一般メンバーのホームページの下書きは非公開です。保存しても公開中のページは置き換わりません。'},
   {title:'プレビューして確認',body:'画面ごとの表示、個人情報、内容と画像の利用権を確認し、公開前にコミュニティルールへ同意します。'},
   {title:'自分で公開を申請',body:'ホームページ、作品、リソースは作者の公開操作で公開されます。記事は提出時のバージョンが審査され、承認後に公開されます。'},
  ],
  privateLabel:'編集中の下書き',privateNote:'編集を続ける',publishLabel:'自分で公開',publicLabel:'公開中のバージョン',publicNote:'公開した内容をそのまま保持',reviewNote:'記事は審査・承認後に公開',
  visibilityTitle:'公開と、一覧への掲載は別の選択。',
  visibilityBody:'「プラットフォームにブログを掲載する」をオフにすると、公開リンクを保ちながら一覧から外せます。公開を休みたいときは、公開設定からホームページを一時的に非公開にできます。',
  faqTitle:'始める前に',
  faqs:[
   {q:'コードを書く必要はありますか？',a:'内蔵テンプレートとキャンバス編集は、コードを書かずに使えます。文字の編集、画像のアップロード、項目やスタイルの調整を行い、プレビューして公開できます。'},
   {q:'ギャラリーのすべてのページをテンプレートとして使えますか？',a:'ギャラリーには実際の公開スペースと、架空の人物と明記されたオリジナルホームページの例があります。表現の参考としてご覧ください。適用できるテンプレートは、編集画面の内蔵ライブラリにあるものです。'},
  ],
  closeTitle:'短い自己紹介から、始めよう。',
  closeBody:'伝えたいことを少しずつ。内容もレイアウトも、あとから育てていけます。',
 },
};

type ProductCopy = typeof copy.zh;

function CanvasIllustration({c}:{c:ProductCopy}) {
 const d=c.diagram;
 return <figure className="bsp-canvas-figure">
  <div className="bsp-canvas-illustration" aria-hidden="true">
   <div className="bsp-canvas-top"><span><Icon name="grid"/>{d.canvas}</span><span className="bsp-draft-label">{d.draft}</span></div>
   <div className="bsp-canvas-body">
    <div className="bsp-layer-list"><span>{d.layers}</span><div className="bsp-layer-selected"><Icon name="user"/>{d.about}</div><div><Icon name="folder"/>{d.projects}</div><div><Icon name="text"/>{d.writing}</div><i/><Icon name="plus"/></div>
    <div className="bsp-artboard-ground"><div className="bsp-artboard">
     <div className="bsp-paper-intro"><span className="bsp-paper-portrait"/><strong>{d.about}</strong><i/><i/></div>
     <div className="bsp-selected-section"><span className="bsp-selection-label">{d.projects}</span><div className="bsp-paper-work"><span/><span/></div><i/><i/><span className="bsp-selection-handle"/><span className="bsp-selection-cursor"><Icon name="cursor"/></span></div>
     <div className="bsp-paper-writing"><span>{d.writing}</span><i/><i/><i/></div>
    </div><div className="bsp-canvas-dock"><Icon name="cursor"/><Icon name="hand"/><span>75%</span><Icon name="fit"/></div></div>
    <div className="bsp-style-panel"><span>{d.style}</span><div>{d.type}<strong>Aa</strong></div><div>{d.color}<span className="bsp-color-samples"><i/><i/><i/></span></div><div>{d.layout}<span className="bsp-layout-sample"><i/><i/><i/></span></div></div>
   </div>
   <div className="bsp-canvas-bottom"><span><Icon name="eye"/>{d.preview}</span><span>{d.devices}</span></div>
  </div>
  <figcaption>{c.diagramCaption}</figcaption>
 </figure>;
}

/** Independently authored product introduction. Member discovery stays in the gallery. */
export function BlogProductShowcase({locale}:{locale:string}) {
 const c=locale==='en'?copy.en:locale==='ja'?copy.ja:copy.zh;
 return <div className="blog-space-product" data-blog-space-product data-product-locale={locale} data-rbp-reveal-scope>
  <section className="bsp-intro" id="blog-space-product" aria-labelledby="blog-product-title">
   <div className="bsp-intro-heading" data-rbp-reveal-group><h2 id="blog-product-title" data-rbp-reveal-item>{c.title}</h2><div><p data-rbp-reveal-item>{c.intro}</p><div className="bsp-actions" data-rbp-reveal-item><Link className="bsp-primary" href="/workspace/blog">{c.create}<Icon name="plus"/></Link><Link className="bsp-text-link" href="/docs/showcase">{c.guide}</Link></div></div></div>
   <div className="bsp-content-map" data-rbp-reveal-group>
    <div className="bsp-home-role" data-rbp-reveal-item><Icon name="home"/><h3>{c.homeTitle}</h3><p>{c.homeBody}</p><span><Icon name="link"/>{c.homeAddress}</span></div>
    <dl className="bsp-content-roles">{c.roles.map(role=><div key={role.title} data-rbp-reveal-item><dt>{role.title}</dt><dd>{role.body}</dd></div>)}</dl>
   </div>
  </section>

  <section className="bsp-editor" aria-labelledby="blog-space-editor-title">
   <CanvasIllustration c={c}/>
   <div className="bsp-editor-copy" data-rbp-reveal-group><h2 id="blog-space-editor-title" data-rbp-reveal-item>{c.editorTitle}</h2><p data-rbp-reveal-item>{c.editorBody}</p><dl className="bsp-editor-features" data-rbp-reveal-group>{c.editorFeatures.map(feature=><div key={feature.title} data-rbp-reveal-item><dt>{feature.title}</dt><dd>{feature.body}</dd></div>)}</dl></div>
  </section>

  <section className="bsp-publishing" aria-labelledby="blog-space-publish-title">
   <div className="bsp-publishing-heading" data-rbp-reveal-group><h2 id="blog-space-publish-title" data-rbp-reveal-item>{c.publishTitle}</h2><p data-rbp-reveal-item>{c.publishBody}</p></div>
   <div className="bsp-publishing-content">
    <ol className="bsp-publish-steps" data-rbp-reveal-group>{c.steps.map((step,index)=><li key={step.title} data-rbp-reveal-item><span className="bsp-step-number" aria-hidden="true">{index+1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>
    <div className="bsp-version-diagram" role="img" aria-label={`${c.privateLabel}，${c.publishLabel}，${c.publicLabel}。${c.reviewNote}`}>
     <div className="bsp-version-draft"><span><Icon name="lock"/>{c.privateLabel}</span><div className="bsp-version-lines"><i/><i/><i/></div><small>{c.privateNote}</small></div>
     <div className="bsp-version-bridge"><Icon name="arrow"/><span>{c.publishLabel}</span></div>
     <div className="bsp-version-public"><span><Icon name="eye"/>{c.publicLabel}</span><div className="bsp-version-lines"><i/><i/><i/></div><small>{c.publicNote}</small></div>
     <p>{c.reviewNote}</p>
    </div>
   </div>
   <aside className="bsp-visibility" data-rbp-reveal-item><Icon name="settings"/><div><h3>{c.visibilityTitle}</h3><p>{c.visibilityBody}</p></div></aside>
  </section>

  <section className="bsp-faq" aria-labelledby="blog-space-faq-title" data-rbp-reveal-group><h2 id="blog-space-faq-title" data-rbp-reveal-item>{c.faqTitle}</h2><div>{c.faqs.map(faq=><details key={faq.q} data-rbp-reveal-item><summary>{faq.q}<Icon name="plus"/></summary><p>{faq.a}</p></details>)}</div></section>

  <section className="bsp-close" aria-labelledby="blog-space-start-title" data-rbp-reveal-group><h2 id="blog-space-start-title" data-rbp-reveal-item>{c.closeTitle}</h2><p data-rbp-reveal-item>{c.closeBody}</p><div className="bsp-actions" data-rbp-reveal-item><Link className="bsp-primary" href="/workspace/blog">{c.create}<Icon name="plus"/></Link><Link className="bsp-text-link" href="/docs/showcase">{c.guide}</Link></div></section>
 </div>;
}
