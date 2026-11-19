// Skills installed and selected by the site owner. Original editorial copy; pinned upstream packages retain their own notices.
export const creatorSkills=[
  {
    "id": "hallmark",
    "name": "Hallmark",
    "category": "design",
    "repo": "Nutlope/hallmark",
    "skillPath": "skills/hallmark/SKILL.md",
    "license": "MIT",
    "licensePath": "LICENSE",
    "summary": "从页面结构到字体、配色与交互，建立有辨识度的网站，并检查常见的模板化设计问题。",
    "tags": [
      "UI",
      "Web design",
      "Review"
    ],
    "featured": true,
    "featuredRank": 0,
    "recommendedFor": "这次 IAVSE 界面改版用到的设计审查与细节打磨工具。",
    "verifiedAt": "2026-11-19",
    "commit": "04977e15f3dfd6ee4b74c887dac3eb52665d6c92",
    "sourceUrl": "https://github.com/Nutlope/hallmark/blob/04977e15f3dfd6ee4b74c887dac3eb52665d6c92/skills/hallmark/SKILL.md",
    "licenseUrl": "https://github.com/Nutlope/hallmark/blob/04977e15f3dfd6ee4b74c887dac3eb52665d6c92/LICENSE",
    "packageDownload": "/skills/creator/hallmark.zip",
    "features": [
      "从真实内容与品牌约束出发，选择页面结构、视觉主题和组件细节。",
      "结合代码检查与浏览器审查，核对焦点、响应式布局和动态效果。"
    ],
    "scenarios": "适合新建网站、明确要求的页面改版，或给已有界面做设计审查。",
    "requirements": "需要可运行的前端项目。静态检查使用 Node.js，浏览器检查还需要 Chrome 与原项目说明的运行依赖。",
    "example": {
      "title": "为资源目录建立统一视觉",
      "input": "现有页面、真实资源与品牌配色。",
      "action": "先审查结构和控件，再调整排版、响应式布局与交互反馈。",
      "output": "一套可运行的页面，以及可以复查的设计检查结果。"
    },
    "prompts": [
      {
        "title": "改进现有页面",
        "text": "使用 Hallmark 改进 [页面路径]。\n保留真实内容、原有链接和业务行为，沿用 [品牌配色]。先检查层级、留白和操作反馈，再完成响应式调整，最后用浏览器验证结果。"
      },
      {
        "title": "审查界面细节",
        "text": "请用 Hallmark 审查刚完成的页面，重点检查按钮和输入框的状态、键盘焦点、手机布局以及减少动态效果设置。列出具体问题的位置和最小修复方案，不更改已确认的品牌方向。"
      }
    ]
  },
  {
    "id": "stageshow",
    "name": "Stageshow",
    "category": "motion",
    "repo": "benjitaylor/skills",
    "skillPath": "stageshow/SKILL.md",
    "license": "MIT",
    "licensePath": "stageshow/LICENSE",
    "summary": "用 React 制作产品界面插图与鼠标演示，把一次清晰的交互放进首页、功能卡片或产品介绍。",
    "tags": [
      "React",
      "Animation",
      "Product demo"
    ],
    "featured": true,
    "featuredRank": 1,
    "recommendedFor": "适合把产品功能做成小而精的可交互展示。",
    "verifiedAt": "2026-11-19",
    "commit": "299140fafd08df55a9c234e610c3f64af3f45531",
    "sourceUrl": "https://github.com/benjitaylor/skills/blob/299140fafd08df55a9c234e610c3f64af3f45531/stageshow/SKILL.md",
    "licenseUrl": "https://github.com/benjitaylor/skills/blob/299140fafd08df55a9c234e610c3f64af3f45531/stageshow/LICENSE",
    "packageDownload": "/skills/creator/stageshow.zip",
    "features": [
      "提供产品画面、设备框架、鼠标轨迹与状态变化的可复用组件。",
      "从示例开始构图，再通过截图和录制检查节奏、裁切与最终画面。"
    ],
    "scenarios": "适合官网功能插图、鼠标操作演示、产品卡片和短循环动画。",
    "requirements": "需要 React 与 CSS 环境；运行示例、录制和截图时，按上游说明安装 Node.js 依赖与浏览器工具。",
    "example": {
      "title": "演示一次资源收藏",
      "input": "资源卡片的外观，以及点击收藏前后的两个状态。",
      "action": "让鼠标移向收藏按钮，点击后在原位置给出状态反馈。",
      "output": "可嵌入功能介绍的 React 演示组件。"
    },
    "prompts": [
      {
        "title": "制作功能演示",
        "text": "用 Stageshow 为 [产品功能] 制作一个 React 演示。\n使用现有配色，围绕一次真实操作安排三到五个节拍，保持主次清晰。给手机设计单独的紧凑布局，检查裁切并提供减少动态效果的静态状态。"
      },
      {
        "title": "打磨演示节奏",
        "text": "请检查刚才的产品演示，找出动作缺少原因、信息密度过高或停留时间不足的地方。优先修复最影响理解的一处，保留已有品牌与内容，然后重新截图和录制确认结果。"
      }
    ]
  },
  {
    "id": "dimensional-drawing",
    "name": "Dimensional Drawing",
    "category": "design",
    "repo": "enesozturk/dimensional-drawing",
    "skillPath": "skills/dimensional-drawing/SKILL.md",
    "license": "MIT",
    "licensePath": "LICENSE",
    "summary": "把组件的间距、圆角、尺寸与层级画成单页技术图，让界面细节可以被测量和交接。",
    "tags": [
      "SVG",
      "Design specs",
      "Handoff"
    ],
    "featured": true,
    "featuredRank": 2,
    "recommendedFor": "把设计细节讲清楚，适合组件标注和前端交接。",
    "verifiedAt": "2026-11-19",
    "commit": "5c457437c8c83524308aad3b7443e81adcc13153",
    "sourceUrl": "https://github.com/enesozturk/dimensional-drawing/blob/5c457437c8c83524308aad3b7443e81adcc13153/skills/dimensional-drawing/SKILL.md",
    "licenseUrl": "https://github.com/enesozturk/dimensional-drawing/blob/5c457437c8c83524308aad3b7443e81adcc13153/LICENSE",
    "packageDownload": "/skills/creator/dimensional-drawing.zip",
    "features": [
      "从真实源码或页面测量尺寸，使用变量和公式标注结构。",
      "输出单文件 HTML 与 SVG 图纸，包含平面、层级、局部细节与变量表。"
    ],
    "scenarios": "适合组件尺寸标注、设计规格说明和实现一致性检查。",
    "requirements": "提供组件源码、可访问页面或参考图；缺少的尺寸必须标为待确认，不能凭空补数值。",
    "example": {
      "title": "标注一个搜索组件",
      "input": "搜索框源码，以及桌面和手机上的实际布局。",
      "action": "测量边距、输入区、按钮、圆角和焦点范围，整理变量与公式。",
      "output": "一张可在浏览器打开的黑白规格图。"
    },
    "prompts": [
      {
        "title": "生成组件规格图",
        "text": "请用 dimensional-drawing 为 [组件路径] 生成规格图。\n读取真实实现，测量间距、圆角、尺寸和图层结构，用变量表解释每一个标注。只使用黑白与灰色，未知数值保留待确认，检查图纸是否有重叠。"
      },
      {
        "title": "核对尺寸关系",
        "text": "请复查刚才的组件规格图，确认所有尺寸代码都出现在变量表里，公式能与组件总尺寸对应。列出源码中没有定义、仍需确认的值，并检查手机布局是否需要单独的视图。"
      }
    ]
  },
  {
    "id": "brand-identity",
    "name": "Brand Identity",
    "category": "design",
    "repo": "fatihaydost/brand-identity-skill",
    "skillPath": "skills/brand-identity/SKILL.md",
    "license": "MIT",
    "licensePath": "LICENSE",
    "summary": "把 Logo、字体与配色作为同一个品牌系统设计，比较方案后交付标志文件、设计令牌与品牌规范。",
    "tags": [
      "Brand",
      "Typography",
      "Colour"
    ],
    "featured": true,
    "featuredRank": 3,
    "recommendedFor": "适合为产品统一品牌表达，也能单独整理配色或字体。",
    "verifiedAt": "2026-11-19",
    "commit": "af7ba40fe067b8b4aaeb2af90ed6c8996d014791",
    "sourceUrl": "https://github.com/fatihaydost/brand-identity-skill/blob/af7ba40fe067b8b4aaeb2af90ed6c8996d014791/skills/brand-identity/SKILL.md",
    "licenseUrl": "https://github.com/fatihaydost/brand-identity-skill/blob/af7ba40fe067b8b4aaeb2af90ed6c8996d014791/LICENSE",
    "packageDownload": "/skills/creator/brand-identity.zip",
    "features": [
      "围绕同一个视觉想法同时设计标志、字体和配色，并比较不同方向。",
      "检查对比度、字形覆盖和小尺寸标志，生成所选方案的品牌资料。"
    ],
    "scenarios": "适合新品牌、已有品牌更新，以及 Logo、字体或配色的单项设计。",
    "requirements": "需要品牌简介、使用语言与保留素材；测量和导出脚本依赖 Python 及上游说明的工具。字体、图片与商标权利分别核对。",
    "example": {
      "title": "为创作工具整理品牌方向",
      "input": "产品定位、现有标志、参考配色和使用语言。",
      "action": "明确保留与更新的部分，比较方案并测量可读性，再选择一个方向。",
      "output": "所选方向的 Logo 文件、配色、字体与品牌规范。"
    },
    "prompts": [
      {
        "title": "设计品牌方案",
        "text": "用 brand-identity 为 [产品名称] 整理品牌方案。\n保留 [现有素材]，参考 [配色方向]，使用语言为 [语言]。把标志、字体和颜色作为一个系统比较，说明各方案差异，测量可读性后让我选择，再导出规范。"
      },
      {
        "title": "检查品牌一致性",
        "text": "请检查现有品牌在网站上的应用，核对配色角色、标题与正文的字体层级，以及小尺寸 Logo 的可辨识性。保留确认过的素材，给出可测量的问题与修改建议，不自行替换品牌方向。"
      }
    ]
  }
];
export const creatorSkillDetails=Object.fromEntries(creatorSkills.map(({id,features,scenarios,requirements})=>[id,{features,scenarios,requirements}]));
export const creatorSkillUsage=Object.fromEntries(creatorSkills.map(({id,example,prompts})=>[id,{example,prompts}]));
