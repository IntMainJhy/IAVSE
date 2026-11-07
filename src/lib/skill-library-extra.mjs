// Original editorial descriptions and example prompts; upstream skills are linked, not bundled.
export const extraSkillEntries=[
  {
    "id": "frontend-design",
    "name": "Frontend Design",
    "category": "design",
    "repo": "anthropics/skills",
    "skillPath": "skills/frontend-design/SKILL.md",
    "summary": "根据产品选择明确的视觉方向，细化排版、布局与界面实现，适合新建或重做前端。",
    "tags": [
      "UI",
      "Typography",
      "Frontend"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/frontend-design/LICENSE.txt",
    "featured": true,
    "recommendedFor": "为一个独立产品制作首页",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "canvas-design",
    "name": "Canvas Design",
    "category": "design",
    "repo": "anthropics/skills",
    "skillPath": "skills/canvas-design/SKILL.md",
    "summary": "用设计理念组织原创静态视觉，适合海报、封面与单页图形；输出 PNG 或 PDF。",
    "tags": [
      "Poster",
      "PNG",
      "PDF"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/canvas-design/LICENSE.txt",
    "featured": false,
    "recommendedFor": "为发布活动设计一张海报",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "theme-factory",
    "name": "Theme Factory",
    "category": "design",
    "repo": "anthropics/skills",
    "skillPath": "skills/theme-factory/SKILL.md",
    "summary": "为演示、文档与 HTML 页面应用成套配色和字体主题，适合统一多种交付物。",
    "tags": [
      "Themes",
      "Typography",
      "Design tokens"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/theme-factory/LICENSE.txt",
    "featured": false,
    "recommendedFor": "统一产品说明与演示文稿的主题",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "brand-guidelines",
    "name": "Anthropic Brand Guidelines",
    "category": "design",
    "repo": "anthropics/skills",
    "skillPath": "skills/brand-guidelines/SKILL.md",
    "summary": "应用 Anthropic 的公开品牌配色与字体规则，适合明确需要该品牌视觉的材料。",
    "tags": [
      "Anthropic",
      "Brand",
      "Typography"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/brand-guidelines/LICENSE.txt",
    "featured": false,
    "recommendedFor": "按指定品牌规范整理一页说明",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "webapp-testing",
    "name": "Webapp Testing",
    "category": "testing",
    "repo": "anthropics/skills",
    "skillPath": "skills/webapp-testing/SKILL.md",
    "summary": "使用 Playwright 操作本地网站、检查交互、浏览器日志与截图，适合验证真实用户流程。",
    "tags": [
      "Playwright",
      "Browser",
      "E2E"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/webapp-testing/LICENSE.txt",
    "featured": true,
    "recommendedFor": "验证搜索、筛选与详情返回的流程",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "mcp-builder",
    "name": "MCP Builder",
    "category": "engineering",
    "repo": "anthropics/skills",
    "skillPath": "skills/mcp-builder/SKILL.md",
    "summary": "设计连接外部 API 的 MCP 服务，整理工具接口、错误反馈与评估，支持 Python 和 TypeScript。",
    "tags": [
      "MCP",
      "Python",
      "TypeScript"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/mcp-builder/LICENSE.txt",
    "featured": true,
    "recommendedFor": "为只读知识库 API 建立 MCP 接口",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "skill-creator",
    "name": "Skill Creator",
    "category": "agents",
    "repo": "anthropics/skills",
    "skillPath": "skills/skill-creator/SKILL.md",
    "summary": "创建、改进并评估 Skill，用任务样例检查触发描述、指令与输出质量。",
    "tags": [
      "Skills",
      "Evaluation",
      "Workflow"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/skill-creator/LICENSE.txt",
    "featured": true,
    "recommendedFor": "把重复的代码审查流程整理为 Skill",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "docx",
    "name": "Word Documents",
    "category": "knowledge",
    "repo": "anthropics/skills",
    "skillPath": "skills/docx/SKILL.md",
    "summary": "读取、生成和修改 Word 文档，处理段落样式、表格、修订与交付版式。",
    "tags": [
      "DOCX",
      "Word",
      "Documents"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/docx/LICENSE.txt",
    "featured": false,
    "recommendedFor": "把产品说明整理成可交付的 Word 文档",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "pdf",
    "name": "PDF Toolkit",
    "category": "knowledge",
    "repo": "anthropics/skills",
    "skillPath": "skills/pdf/SKILL.md",
    "summary": "提取、合并、拆分和创建 PDF，也可处理扫描件 OCR 与表单，适合文档整理。",
    "tags": [
      "PDF",
      "OCR",
      "Forms"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/pdf/LICENSE.txt",
    "featured": false,
    "recommendedFor": "整理多份资料并生成可检索 PDF",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "pptx",
    "name": "Presentation Toolkit",
    "category": "knowledge",
    "repo": "anthropics/skills",
    "skillPath": "skills/pptx/SKILL.md",
    "summary": "创建和编辑演示文稿，处理模板、布局、备注与视觉检查，适合产品说明与汇报。",
    "tags": [
      "PPTX",
      "Slides",
      "Presentation"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/pptx/LICENSE.txt",
    "featured": false,
    "recommendedFor": "制作一份六页的产品介绍",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "xlsx",
    "name": "Spreadsheet Toolkit",
    "category": "knowledge",
    "repo": "anthropics/skills",
    "skillPath": "skills/xlsx/SKILL.md",
    "summary": "整理电子表格、公式与图表，创建可继续编辑的工作簿，并检查计算错误。",
    "tags": [
      "XLSX",
      "CSV",
      "Spreadsheet"
    ],
    "license": "Apache-2.0",
    "licensePath": "skills/xlsx/LICENSE.txt",
    "featured": false,
    "recommendedFor": "整理项目支出并制作月度汇总",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "web-design-guidelines",
    "name": "Web Design Guidelines",
    "category": "design",
    "repo": "vercel-labs/agent-skills",
    "skillPath": "skills/web-design-guidelines/SKILL.md",
    "summary": "按 Web Interface Guidelines 检查界面源码，整理可访问性、表单、动效和导航问题。",
    "tags": [
      "UI",
      "Accessibility",
      "Review"
    ],
    "license": "MIT",
    "licensePath": "skills/web-design-guidelines/SKILL.md",
    "featured": true,
    "recommendedFor": "审查资源目录的可访问性与交互",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "brainstorming",
    "name": "Brainstorming",
    "category": "agents",
    "repo": "obra/superpowers",
    "skillPath": "skills/brainstorming/SKILL.md",
    "summary": "把想法整理成目标、限制与可选方案，适合功能开发前澄清问题和确认设计。",
    "tags": [
      "Planning",
      "Requirements",
      "Design"
    ],
    "license": "MIT",
    "licensePath": "LICENSE",
    "featured": false,
    "recommendedFor": "梳理设计资源审核功能的范围",
    "verifiedAt": "2026-11-07"
  },
  {
    "id": "writing-plans",
    "name": "Writing Plans",
    "category": "agents",
    "repo": "obra/superpowers",
    "skillPath": "skills/writing-plans/SKILL.md",
    "summary": "把已明确的需求拆成可执行步骤、文件变更与验证点，适合多阶段工程任务。",
    "tags": [
      "Planning",
      "Implementation",
      "Verification"
    ],
    "license": "MIT",
    "licensePath": "LICENSE",
    "featured": false,
    "recommendedFor": "规划一个需要后台审核的资源目录",
    "verifiedAt": "2026-11-07"
  }
];
export const extraSkillDetails={
  "frontend-design": {
    "features": [
      "从用户、内容和品牌约束确定视觉取舍。",
      "把字体、色彩、布局与微交互落实到可运行代码。"
    ],
    "scenarios": "适合以下任务：为一个独立产品制作首页。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  },
  "canvas-design": {
    "features": [
      "先确定构图、视觉节奏与文字层级。",
      "制作原创图形并检查成品的裁切与可读性。"
    ],
    "scenarios": "适合以下任务：为发布活动设计一张海报。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  },
  "theme-factory": {
    "features": [
      "比较预设主题，并根据内容选择合适组合。",
      "把选定主题应用到多个页面或生成新的主题。"
    ],
    "scenarios": "适合以下任务：统一产品说明与演示文稿的主题。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  },
  "brand-guidelines": {
    "features": [
      "遵循该品牌的主色、辅助色与字体层级。",
      "区分品牌规则应用与自己的产品设计系统。"
    ],
    "scenarios": "适合以下任务：按指定品牌规范整理一页说明。",
    "requirements": "仅在明确需要 Anthropic 品牌视觉时使用；它不是通用的品牌生成器，也不授予商标使用权。"
  },
  "webapp-testing": {
    "features": [
      "用浏览器重现表单、导航和状态切换。",
      "把截图和日志作为问题证据，复测修复结果。"
    ],
    "scenarios": "适合以下任务：验证搜索、筛选与详情返回的流程。",
    "requirements": "需要可访问的测试站点、Python 与 Playwright 及其浏览器依赖；测试数据与账号应隔离。"
  },
  "mcp-builder": {
    "features": [
      "从使用任务出发确定工具粒度与参数。",
      "实现服务并用真实调用验证结果与错误路径。"
    ],
    "scenarios": "适合以下任务：为只读知识库 API 建立 MCP 接口。",
    "requirements": "需要目标 API 文档与测试权限，以及所选 Python 或 TypeScript 环境；凭证从环境变量读取。"
  },
  "skill-creator": {
    "features": [
      "把重复工作整理成有边界的技能与参考资源。",
      "比较有无技能的任务表现，并据结果调整。"
    ],
    "scenarios": "适合以下任务：把重复的代码审查流程整理为 Skill。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  },
  "docx": {
    "features": [
      "用文档结构与样式管理标题、正文和表格。",
      "修改已有文档后检查渲染结果与内容完整性。"
    ],
    "scenarios": "适合以下任务：把产品说明整理成可交付的 Word 文档。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  },
  "pdf": {
    "features": [
      "按页面和内容处理 PDF，保留来源顺序。",
      "区分文本 PDF 与扫描件，并选择提取或 OCR。"
    ],
    "scenarios": "适合以下任务：整理多份资料并生成可检索 PDF。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  },
  "pptx": {
    "features": [
      "把信息分解为逐页论点与可读的视觉层级。",
      "生成或修改幻灯片后检查溢出、对齐与素材。"
    ],
    "scenarios": "适合以下任务：制作一份六页的产品介绍。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  },
  "xlsx": {
    "features": [
      "清理表格结构，区分原始输入和计算字段。",
      "保留公式并复算，核对图表与数据来源。"
    ],
    "scenarios": "适合以下任务：整理项目支出并制作月度汇总。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  },
  "web-design-guidelines": {
    "features": [
      "获取当前规则，再针对指定文件检查。",
      "用文件位置与具体建议报告可操作的问题。"
    ],
    "scenarios": "适合以下任务：审查资源目录的可访问性与交互。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  },
  "brainstorming": {
    "features": [
      "读取项目背景，逐步厘清真正要解决的问题。",
      "比较少量方案与取舍，形成明确的设计说明。"
    ],
    "scenarios": "适合以下任务：梳理设计资源审核功能的范围。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  },
  "writing-plans": {
    "features": [
      "为每项任务标明实现范围、依赖与相关文件。",
      "把验证步骤与完成条件写入计划，减少遗漏。"
    ],
    "scenarios": "适合以下任务：规划一个需要后台审核的资源目录。",
    "requirements": "需要提供实际素材、目标和可用运行环境；安装 Skill 不会自动安装其脚本所需的依赖，使用前按原项目说明检查。"
  }
};
export const extraSkillUsage={
  "frontend-design": {
    "example": {
      "title": "为一个独立产品制作首页",
      "input": "任务目标：为一个独立产品制作首页。提供现有材料、参考和不能改变的约束。",
      "action": "从用户、内容和品牌约束确定视觉取舍。把字体、色彩、布局与微交互落实到可运行代码。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是为一个独立产品制作首页。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Frontend Design 完成以下任务：为一个独立产品制作首页。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。从用户、内容和品牌约束确定视觉取舍。把字体、色彩、布局与微交互落实到可运行代码。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Frontend Design 复查刚才的结果，目标仍是：为一个独立产品制作首页。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "canvas-design": {
    "example": {
      "title": "为发布活动设计一张海报",
      "input": "任务目标：为发布活动设计一张海报。提供现有材料、参考和不能改变的约束。",
      "action": "先确定构图、视觉节奏与文字层级。制作原创图形并检查成品的裁切与可读性。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是为发布活动设计一张海报。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Canvas Design 完成以下任务：为发布活动设计一张海报。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。先确定构图、视觉节奏与文字层级。制作原创图形并检查成品的裁切与可读性。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Canvas Design 复查刚才的结果，目标仍是：为发布活动设计一张海报。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "theme-factory": {
    "example": {
      "title": "统一产品说明与演示文稿的主题",
      "input": "任务目标：统一产品说明与演示文稿的主题。提供现有材料、参考和不能改变的约束。",
      "action": "比较预设主题，并根据内容选择合适组合。把选定主题应用到多个页面或生成新的主题。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是统一产品说明与演示文稿的主题。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Theme Factory 完成以下任务：统一产品说明与演示文稿的主题。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。比较预设主题，并根据内容选择合适组合。把选定主题应用到多个页面或生成新的主题。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Theme Factory 复查刚才的结果，目标仍是：统一产品说明与演示文稿的主题。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "brand-guidelines": {
    "example": {
      "title": "按指定品牌规范整理一页说明",
      "input": "任务目标：按指定品牌规范整理一页说明。提供现有材料、参考和不能改变的约束。",
      "action": "遵循该品牌的主色、辅助色与字体层级。区分品牌规则应用与自己的产品设计系统。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是按指定品牌规范整理一页说明。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Anthropic Brand Guidelines 完成以下任务：按指定品牌规范整理一页说明。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。遵循该品牌的主色、辅助色与字体层级。区分品牌规则应用与自己的产品设计系统。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Anthropic Brand Guidelines 复查刚才的结果，目标仍是：按指定品牌规范整理一页说明。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "webapp-testing": {
    "example": {
      "title": "验证搜索、筛选与详情返回的流程",
      "input": "任务目标：验证搜索、筛选与详情返回的流程。提供现有材料、参考和不能改变的约束。",
      "action": "用浏览器重现表单、导航和状态切换。把截图和日志作为问题证据，复测修复结果。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是验证搜索、筛选与详情返回的流程。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Webapp Testing 完成以下任务：验证搜索、筛选与详情返回的流程。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。用浏览器重现表单、导航和状态切换。把截图和日志作为问题证据，复测修复结果。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Webapp Testing 复查刚才的结果，目标仍是：验证搜索、筛选与详情返回的流程。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "mcp-builder": {
    "example": {
      "title": "为只读知识库 API 建立 MCP 接口",
      "input": "任务目标：为只读知识库 API 建立 MCP 接口。提供现有材料、参考和不能改变的约束。",
      "action": "从使用任务出发确定工具粒度与参数。实现服务并用真实调用验证结果与错误路径。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是为只读知识库 API 建立 MCP 接口。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 MCP Builder 完成以下任务：为只读知识库 API 建立 MCP 接口。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。从使用任务出发确定工具粒度与参数。实现服务并用真实调用验证结果与错误路径。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 MCP Builder 复查刚才的结果，目标仍是：为只读知识库 API 建立 MCP 接口。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "skill-creator": {
    "example": {
      "title": "把重复的代码审查流程整理为 Skill",
      "input": "任务目标：把重复的代码审查流程整理为 Skill。提供现有材料、参考和不能改变的约束。",
      "action": "把重复工作整理成有边界的技能与参考资源。比较有无技能的任务表现，并据结果调整。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是把重复的代码审查流程整理为 Skill。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Skill Creator 完成以下任务：把重复的代码审查流程整理为 Skill。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。把重复工作整理成有边界的技能与参考资源。比较有无技能的任务表现，并据结果调整。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Skill Creator 复查刚才的结果，目标仍是：把重复的代码审查流程整理为 Skill。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "docx": {
    "example": {
      "title": "把产品说明整理成可交付的 Word 文档",
      "input": "任务目标：把产品说明整理成可交付的 Word 文档。提供现有材料、参考和不能改变的约束。",
      "action": "用文档结构与样式管理标题、正文和表格。修改已有文档后检查渲染结果与内容完整性。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是把产品说明整理成可交付的 Word 文档。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Word Documents 完成以下任务：把产品说明整理成可交付的 Word 文档。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。用文档结构与样式管理标题、正文和表格。修改已有文档后检查渲染结果与内容完整性。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Word Documents 复查刚才的结果，目标仍是：把产品说明整理成可交付的 Word 文档。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "pdf": {
    "example": {
      "title": "整理多份资料并生成可检索 PDF",
      "input": "任务目标：整理多份资料并生成可检索 PDF。提供现有材料、参考和不能改变的约束。",
      "action": "按页面和内容处理 PDF，保留来源顺序。区分文本 PDF 与扫描件，并选择提取或 OCR。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是整理多份资料并生成可检索 PDF。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 PDF Toolkit 完成以下任务：整理多份资料并生成可检索 PDF。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。按页面和内容处理 PDF，保留来源顺序。区分文本 PDF 与扫描件，并选择提取或 OCR。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 PDF Toolkit 复查刚才的结果，目标仍是：整理多份资料并生成可检索 PDF。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "pptx": {
    "example": {
      "title": "制作一份六页的产品介绍",
      "input": "任务目标：制作一份六页的产品介绍。提供现有材料、参考和不能改变的约束。",
      "action": "把信息分解为逐页论点与可读的视觉层级。生成或修改幻灯片后检查溢出、对齐与素材。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是制作一份六页的产品介绍。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Presentation Toolkit 完成以下任务：制作一份六页的产品介绍。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。把信息分解为逐页论点与可读的视觉层级。生成或修改幻灯片后检查溢出、对齐与素材。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Presentation Toolkit 复查刚才的结果，目标仍是：制作一份六页的产品介绍。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "xlsx": {
    "example": {
      "title": "整理项目支出并制作月度汇总",
      "input": "任务目标：整理项目支出并制作月度汇总。提供现有材料、参考和不能改变的约束。",
      "action": "清理表格结构，区分原始输入和计算字段。保留公式并复算，核对图表与数据来源。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是整理项目支出并制作月度汇总。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Spreadsheet Toolkit 完成以下任务：整理项目支出并制作月度汇总。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。清理表格结构，区分原始输入和计算字段。保留公式并复算，核对图表与数据来源。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Spreadsheet Toolkit 复查刚才的结果，目标仍是：整理项目支出并制作月度汇总。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "web-design-guidelines": {
    "example": {
      "title": "审查资源目录的可访问性与交互",
      "input": "任务目标：审查资源目录的可访问性与交互。提供现有材料、参考和不能改变的约束。",
      "action": "获取当前规则，再针对指定文件检查。用文件位置与具体建议报告可操作的问题。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是审查资源目录的可访问性与交互。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Web Design Guidelines 完成以下任务：审查资源目录的可访问性与交互。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。获取当前规则，再针对指定文件检查。用文件位置与具体建议报告可操作的问题。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Web Design Guidelines 复查刚才的结果，目标仍是：审查资源目录的可访问性与交互。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "brainstorming": {
    "example": {
      "title": "梳理设计资源审核功能的范围",
      "input": "任务目标：梳理设计资源审核功能的范围。提供现有材料、参考和不能改变的约束。",
      "action": "读取项目背景，逐步厘清真正要解决的问题。比较少量方案与取舍，形成明确的设计说明。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是梳理设计资源审核功能的范围。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Brainstorming 完成以下任务：梳理设计资源审核功能的范围。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。读取项目背景，逐步厘清真正要解决的问题。比较少量方案与取舍，形成明确的设计说明。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Brainstorming 复查刚才的结果，目标仍是：梳理设计资源审核功能的范围。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  },
  "writing-plans": {
    "example": {
      "title": "规划一个需要后台审核的资源目录",
      "input": "任务目标：规划一个需要后台审核的资源目录。提供现有材料、参考和不能改变的约束。",
      "action": "为每项任务标明实现范围、依赖与相关文件。把验证步骤与完成条件写入计划，减少遗漏。",
      "output": "交付可审阅的结果、实际完成的检查与待确认项；目标是规划一个需要后台审核的资源目录。"
    },
    "prompts": [
      {
        "title": "开始任务",
        "text": "请使用 Writing Plans 完成以下任务：规划一个需要后台审核的资源目录。\n目标与材料：[填写目标、文件或项目路径]\n限制：[受众、技术栈、尺寸、格式或不可修改的内容]\n先检查已有资料和运行环境，再说明具体实现。为每项任务标明实现范围、依赖与相关文件。把验证步骤与完成条件写入计划，减少遗漏。\n交付可继续使用的成果，并说明实际验证结果；缺少数据时标注待补充，不虚构完成情况。"
      },
      {
        "title": "复查结果",
        "text": "请使用 Writing Plans 复查刚才的结果，目标仍是：规划一个需要后台审核的资源目录。按原始要求核对内容、结构、交互或文件完整性，区分实际问题与个人偏好。先修复影响使用的问题，保留已有正确结果。列出复查证据、实际执行的验证和未验证部分，不把预期结果当成事实。"
      }
    ]
  }
};
