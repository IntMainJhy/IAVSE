const copy={
 zh:{
  title:'你的空间，\n由你编排。',
  intro:'在画布上安排文字与作品，选择自己的样式，再发布为一个可以分享的主页。',
  canvasTitle:'在画布上，直接排版。',
  canvasBody:'拖动文字，修改内容与颜色。试着调整，再用撤销回到上一步。',
  canvasHint:'这里是本地交互示例，改动仅在此演示中生效。',
  looksTitle:'为你的内容，\n选择一种呈现。',
  looksBody:'六种布局、八种外观。为作品集、个人履历和内容专栏，选择合适的排版与气质。',
  publishTitle:'预览完成，\n把主页分享出去。',
  publishBody:'草稿和公开版本分开保存。预览你的页面，确认后发布，再分享主页链接。',
  publishAction:'查看示例主页',
  create:'创建我的空间',
  finalTitle:'下一页，\n写你自己。',
  finalBody:'把作品、经历和想法放进自己的主页。从第一段文字开始。',
  directoryTitle:'创作者空间',
  directoryCount:'{0} 个公开空间',
  lookLabels:['作品集','个人履历','内容专栏']
 },
 en:{
  title:'Your space.\nArranged your way.',
  intro:'Place your words and work on the canvas. Choose a style, then publish a homepage you can share.',
  canvasTitle:'Arrange it on the canvas.',
  canvasBody:'Drag text, rewrite it, or change its color. Undo a change and try another arrangement.',
  canvasHint:'This is a local canvas example. Changes stay in this demo.',
  looksTitle:'Find the right look\nfor your content.',
  looksBody:'Choose from six layouts and eight visual styles for your portfolio, résumé, or writing.',
  publishTitle:'Preview your page.\nThen share it.',
  publishBody:'Drafts stay separate from the published page. Check your preview, publish your changes, and share your homepage link.',
  publishAction:'Open example homepage',
  create:'Create my space',
  finalTitle:'Your next page.\nMake it yours.',
  finalBody:'Give your work, experience, and ideas a homepage. Start with the first line.',
  directoryTitle:'Creator spaces',
  directoryCount:'Public spaces · {0}',
  lookLabels:['Portfolio','Résumé','Writing']
 },
 ja:{
  title:'あなたのスペースを、\n自分らしく組み立てる。',
  intro:'キャンバスに言葉と作品を配置し、好きなスタイルを選ぶ。ホームページとして公開して、一つのリンクで共有できます。',
  canvasTitle:'文字の配置を、その場で試す。',
  canvasBody:'文字をドラッグし、内容や色を変更できます。元に戻して、別の配置も試せます。',
  canvasHint:'このキャンバスは操作デモです。変更はこのデモ内にだけ反映されます。',
  looksTitle:'コンテンツに合う、\nあなたらしい見せ方。',
  looksBody:'6 種類のレイアウトと 8 種類のスタイル。作品集やプロフィール、記事に合う見せ方を選べます。',
  publishTitle:'プレビューで確かめて、\nページを共有する。',
  publishBody:'下書きと公開中のページは別に保存されます。プレビューで確認し、変更を公開してからホームページのリンクを共有できます。',
  publishAction:'サンプルページを見る',
  create:'自分のスペースを作る',
  finalTitle:'次のページに、\nあなた自身を。',
  finalBody:'作品や経験、考えを自分のホームページへ。最初の一文から始めてみてください。',
  directoryTitle:'クリエイターのスペース',
  directoryCount:'{0} 件の公開スペース',
  lookLabels:['ポートフォリオ','プロフィール','記事・コラム']
 }
};

export const blogProductCopy=(locale='zh')=>copy[locale]||copy.zh;
