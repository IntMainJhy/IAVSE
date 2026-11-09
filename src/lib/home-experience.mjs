import {showcaseResources,showcaseSkills} from './product-showcase.mjs';

// Only small public excerpts reach the interactive homepage; full catalogs stay server-side.
export const homeResourceSelections=[
 ...showcaseResources.map(group=>({...group,items:group.items.slice(0,3)})),
 {id:'skills',label:'Skill',href:'/resources?type=skills',items:showcaseSkills.flatMap(group=>group.items).slice(0,3)}
].sort((a,b)=>['designs','skills','docs','resources'].indexOf(a.id)-['designs','skills','docs','resources'].indexOf(b.id));

export function homeCommunityPreview(read){
 try{
  const result=read();
  return {state:'ready',items:(Array.isArray(result?.items)?result.items:[]).filter(item=>item?.id&&item.title).slice(0,2).map(item=>({
   id:String(item.id),title:String(item.title).slice(0,100),summary:String(item.summary||'').slice(0,180),
   author:String(item.authorName||'').slice(0,80),category:String(item.category||'').slice(0,60),href:'/community/'+encodeURIComponent(item.id)
  }))};
 }catch{return{state:'unavailable',items:[]};}
}

const copy={
 zh:{
  title:['发现有用的，','分享你做过的。'],intro:'设计、知识、工具，还有把经验讲清楚的人。下一次创作，从 IAVSE 开始。',explore:'探索资源',community:'去社区聊聊',
  tabs:{designs:'UI 设计',skills:'Skill',docs:'文档',resources:'网站与工具'},search:'搜索精选',searchLabel:'在本组精选中搜索',searchPlaceholder:'名称、关键词或用途',clear:'清空搜索',selection:'目录精选',all:'浏览完整目录',details:'查看详情',visit:'访问网站',emptyTitle:'这组精选里还没有匹配项。',emptyBody:'换个关键词，或到完整目录继续找。',source:'来源 / 许可',
  communityTitle:['把经验写下来，','让讨论接着发生。'],communityBody:'遇到的问题、试过的工具、做成的作品，都可以成为一份分享。在评论里继续讨论，把有用的内容留在收藏里。',write:'写一份分享',feed:'浏览社区',recent:'最近的公开分享',emptyCommunity:'第一份经验，可能就来自你。',emptyCommunityBody:'社区暂时还没有公开分享。可以从一个解决过的问题，或一次工具的使用体验写起。',unavailable:'暂时无法读取公开分享。',unavailableBody:'你可以直接进入社区，查看最新内容。',communityLinks:['分享实践','参与讨论','收藏与关注'],
  spaceTitle:['让作品和文字，','有个自己的地方。'],spaceBody:'用空间里现成的模板，整理介绍、作品与经历。调整内容和布局，预览后再发布。',spaceAction:'探索博客空间',create:'创建我的空间',templateLabel:'选择内置模板示例',templateNames:['阅读型','履历型'],templateNote:'虚构人物 · 网站内置模板的真实截图',openTemplate:'打开完整示例',spaceFeatures:['个人介绍、作品与文章，集中呈现。','模板与画布，按自己的内容调整。'],
  closeTitle:'你的下一次发现，\n也可以成为别人的起点。',closeBody:'先找一份有用的资源，或分享一件你刚刚做过的事。',
  questions:[['这里的资源怎么使用？','打开资源详情，查看原始来源、项目仓库和各自的使用说明。第三方资源分别适用其原始许可。'],['分享会直接公开吗？','投稿、审核和公开状态以社区实际流程及页面提示为准。草稿不会在首页展示。'],['博客空间展示的是真实模板吗？','是。这里的示例由空间编辑器使用的内置模板渲染，示例人物为虚构。可以打开完整示例，再到自己的空间中选择模板。']]
 },
 en:{
  title:['Find something useful.','Share what you made.'],intro:'Design, knowledge, tools, and people who explain what worked. Start your next project with IAVSE.',explore:'Explore resources',community:'Visit the community',
  tabs:{designs:'UI design',skills:'Skills',docs:'Documentation',resources:'Websites & tools'},search:'Search selections',searchLabel:'Search this selection',searchPlaceholder:'Name, keyword, or purpose',clear:'Clear search',selection:'From the directory',all:'Browse the full directory',details:'View details',visit:'Visit website',emptyTitle:'No matches in this selection.',emptyBody:'Try another keyword, or explore the full directory.',source:'Source / license',
  communityTitle:['Write down what worked.','Keep the conversation going.'],communityBody:'A problem you solved, a tool you tried, or something you made can become a useful post. Continue in the comments and bookmark what matters.',write:'Write a post',feed:'Browse the community',recent:'Recent public posts',emptyCommunity:'The first experience could be yours.',emptyCommunityBody:'There are no public posts yet. Start with a problem you solved or a tool you have tried.',unavailable:'Public posts are temporarily unavailable.',unavailableBody:'Open the community to find the latest posts.',communityLinks:['Share your process','Join a discussion','Bookmark & follow'],
  spaceTitle:['A place for your work.','And your words.'],spaceBody:'Use the space editor’s built-in templates to arrange your introduction, work, and experience. Adjust the layout, preview it, then publish.',spaceAction:'Explore blog spaces',create:'Create my space',templateLabel:'Choose a built-in template example',templateNames:['Editorial','Résumé'],templateNote:'Fictional creators · Actual built-in template screenshots',openTemplate:'Open the full example',spaceFeatures:['Your introduction, projects, and writing together.','Templates and a canvas shaped around your content.'],
  closeTitle:'Your next discovery\ncould help someone else begin.',closeBody:'Find a useful resource, or share something you have just made.',
  questions:[['How can I use these resources?','Open the detail page for the original source, repository, and usage notes. Each third-party resource retains its own license.'],['Are posts published immediately?','Submission, review, and publication follow the community’s current workflow and page guidance. Drafts never appear on the homepage.'],['Are these actual blog templates?','Yes. The examples use the same built-in templates as the space editor, with fictional sample content. Open an example, then choose a template in your own space.']]
 },
 ja:{
  title:['役立つものを見つける。','作ったものを共有する。'],intro:'デザイン、知識、ツール、そして経験を伝える人。次の制作を IAVSE から。',explore:'リソースを探す',community:'コミュニティへ',
  tabs:{designs:'UI デザイン',skills:'Skill',docs:'ドキュメント',resources:'サイトとツール'},search:'ピックアップを検索',searchLabel:'このピックアップを検索',searchPlaceholder:'名前、キーワード、用途',clear:'検索をクリア',selection:'ディレクトリから',all:'すべてのリソースを見る',details:'詳細を見る',visit:'サイトを開く',emptyTitle:'一致する項目がありません。',emptyBody:'別のキーワードか、完全なディレクトリをお試しください。',source:'出典 / ライセンス',
  communityTitle:['試したことを書き留める。','そこから会話が始まる。'],communityBody:'解決した問題、試したツール、制作したものを共有。コメントで話を続け、役立つ内容をブックマークできます。',write:'投稿を書く',feed:'コミュニティを見る',recent:'最近の公開投稿',emptyCommunity:'最初の経験は、あなたから。',emptyCommunityBody:'公開投稿はまだありません。解決した問題や、使ってみたツールから書き始めてみませんか。',unavailable:'公開投稿を読み込めません。',unavailableBody:'コミュニティで最新の内容をご覧ください。',communityLinks:['制作の過程を共有','話し合いに参加','保存とフォロー'],
  spaceTitle:['作品と言葉に、','自分だけの場所を。'],spaceBody:'内蔵テンプレートで自己紹介、作品、経歴を整理。内容とレイアウトを調整し、プレビューしてから公開できます。',spaceAction:'ブログスペースを見る',create:'自分のスペースを作る',templateLabel:'内蔵テンプレートの例を選択',templateNames:['読みもの','履歴書'],templateNote:'架空の人物 · 内蔵テンプレートの実際の画面',openTemplate:'完全な例を開く',spaceFeatures:['自己紹介、作品、記事をひとつに。','内容に合わせてテンプレートとキャンバスを調整。'],
  closeTitle:'あなたの次の発見が、\n誰かの始まりになる。',closeBody:'役立つリソースを探すか、制作したものを共有しましょう。',
  questions:[['リソースはどう使えますか？','詳細ページで原典、リポジトリ、利用方法を確認できます。第三者のリソースにはそれぞれのライセンスが適用されます。'],['投稿はすぐに公開されますか？','投稿、審査、公開は現在のコミュニティの手順と画面の案内に従います。下書きはホームページに表示されません。'],['実際のブログテンプレートですか？','はい。スペース編集画面と同じ内蔵テンプレートを使用した架空の人物の例です。完全な例を開き、自分のスペースでテンプレートを選べます。']]
 }
};
export const homeExperienceCopy=(locale='zh')=>copy[locale]||copy.zh;

const spatialCopy={
 zh:{label:'产品空间',chapters:['资源发现','社区交流','博客空间'],descriptions:['设计、知识与工具，找到下一次创作的起点。','分享做过的事，在讨论中交换经验。','选择真正的内置模板，整理作品、文章与经历。'],previous:'上一个产品空间',next:'下一个产品空间'},
 en:{label:'Product spaces',chapters:['Discover resources','Community','Blog spaces'],descriptions:['Design, knowledge, and tools for your next project.','Share what you made and exchange experience.','Actual built-in templates for your work, writing, and experience.'],previous:'Previous product space',next:'Next product space'},
 ja:{label:'プロダクトスペース',chapters:['リソース発見','コミュニティ','ブログスペース'],descriptions:['次の制作に役立つデザイン、知識、ツール。','制作したことを共有し、経験を交換する。','実際の内蔵テンプレートで作品、文章、経歴を整理。'],previous:'前のプロダクトスペース',next:'次のプロダクトスペース'}
};
export const homeSpatialCopy=(locale='zh')=>spatialCopy[locale]||spatialCopy.zh;
