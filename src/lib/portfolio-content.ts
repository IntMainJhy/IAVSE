/** IAVSE content for the unchanged RBP Portfolio composition. */
const copy = {
  zh: {
    greeting:'你好，这里是 IAVSE', title:['发现有用的，','分享你做过的。'],
    intro:'设计、知识、工具，还有把经验讲清楚的人。下一次创作，从这里开始。',
    templateAlt:'IAVSE 内置博客模板 · 虚构人物示例', explore:'探索资源', source:'获取源码', copied:'源码地址已复制', copySource:'复制 IAVSE 源码地址',
    projectTitle:'Discover IAVSE', projectIntro:'从一次发现，到一份分享。把有用的资源、做过的事和自己的作品放在一起。', more:'浏览全部资源',
    connect:'Let’s connect', connectBody:'发现值得留下的内容，也分享自己的实践。从一份资源、一篇文章或一个个人空间开始。', account:'我的账号', community:'社区', about:'关于 IAVSE', privacy:'隐私政策',
    resourcesTitle:'资源中心', resourcesIntro:'查看原始出处与使用许可。',
    blogsTitle:'Blog spaces', blogsIntro:'每一个主页，都是一个独立的世界。浏览公开空间，或从内置模板开始。',
  },
  en: {
    greeting:'Hello, this is IAVSE', title:['Discover & create.','Share & connect.'],
    intro:'Design, knowledge, tools, and people who explain what worked. Start your next project here.',
    templateAlt:'IAVSE built-in blog templates · fictional examples', explore:'Explore resources', source:'Get the source', copied:'Source URL copied', copySource:'Copy the IAVSE source URL',
    projectTitle:'Discover IAVSE', projectIntro:'From a useful discovery to something worth sharing. Resources, experience, and a place for your work.', more:'View all resources',
    connect:'Let’s connect', connectBody:'Keep what you discover and share what you have learned. Start with a resource, a post, or your own personal space.', account:'My account', community:'Community', about:'About IAVSE', privacy:'Privacy',
    resourcesTitle:'Resources', resourcesIntro:'Find original sources and usage licenses.',
    blogsTitle:'Blog spaces', blogsIntro:'Every homepage, a world of its own. Discover public spaces or begin with a built-in template.',
  },
  ja: {
    greeting:'こんにちは、IAVSE です', title:['見つけよう。','共有しよう。'],
    intro:'デザイン、知識、ツール、そして経験を伝える人。次の制作を、ここから。',
    templateAlt:'IAVSE 内蔵ブログテンプレート · 架空の人物', explore:'リソースを見る', source:'ソースコード', copied:'URL をコピーしました', copySource:'IAVSE のソース URL をコピー',
    projectTitle:'Discover IAVSE', projectIntro:'役立つ発見から、共有したい経験まで。リソースと作品、自分の言葉をひとつに。', more:'リソースをすべて見る',
    connect:'Let’s connect', connectBody:'役立つ内容を残し、自分の経験を共有。リソース、記事、自分だけのスペースから始めましょう。', account:'アカウント', community:'コミュニティ', about:'IAVSE について', privacy:'プライバシー',
    resourcesTitle:'リソース', resourcesIntro:'出典と利用ライセンスを確認できます。',
    blogsTitle:'Blog spaces', blogsIntro:'一つひとつのホームページに、その人の世界。公開スペースと内蔵テンプレートを見つけよう。',
  },
};
export const portfolioCopy=(locale='zh')=>copy[locale as keyof typeof copy]||copy.zh;

export function resourceImage(item:object):string{return 'image' in item&&typeof item.image==='string'?item.image:'/media/portfolio/lin-studio.webp';}
