(() => {
  "use strict";
  // 发现页数据：知识与研究 / 工具与平台。route 指向既有页面，child 指向页内条目。
  const sections = {
    "discover-knowledge": {
      title: "知识与研究",
      desc: "面向问答、写作与研究工作，选择一位专家、一项技能，或连接一个知识源。",
      groups: [
        {
          id: "expert", label: "专家", icon: "teal",
          items: [
            { name: "百舸问答", desc: "围绕问题展开对话，辅助梳理资料与思路。", icon: "chat", route: "qa", child: "对话", meta: "问答", tint: "teal" },
            { name: "百舸写作", desc: "从主题与框架出发，组织专业表达与日常材料。", icon: "pen", route: "writing", meta: "写作", tint: "blue" },
            { name: "百舸文库", desc: "集中查阅公共属性的标准、报告、文献与书籍。", icon: "file", route: "library", meta: "资料", tint: "amber" },
            { name: "百舸情报", desc: "关注研究领域与行业信息，形成持续跟踪。", icon: "globe", route: "intel", meta: "情报", tint: "purple" },
            { name: "百舸分析", desc: "围绕分析任务组织资料，形成结构化结论。", icon: "chart", route: "analysis", meta: "分析", tint: "teal" },
            { name: "知识库", desc: "统一查阅部门、行业、个人与企业知识。", icon: "book", route: "knowledge", meta: "知识", tint: "blue" },
          ],
        },
        {
          id: "skill", label: "技能", icon: "purple",
          items: [
            { name: "文献伴读", desc: "梳理文献重点，理解研究方法与核心结论。", icon: "book", route: "smart-tools", child: "文献伴读", meta: "研究辅助", tint: "purple" },
            { name: "思维导图生成", desc: "展开主题与关联，让研究思路形成清晰结构。", icon: "branch", route: "smart-tools", child: "思维导图生成", meta: "研究辅助", tint: "teal" },
            { name: "标准编制", desc: "辅助整理标准结构、编制内容与条款。", icon: "standard", route: "smart-tools", child: "标准编制", meta: "研究辅助", tint: "amber" },
            { name: "专利编制", desc: "梳理专利技术方案与申请材料，形成编制思路。", icon: "file", route: "smart-tools", child: "专利编制", meta: "研究辅助", tint: "blue" },
            { name: "专业编写", desc: "围绕专业主题，辅助搭建框架与撰写内容。", icon: "pen", route: "smart-tools", child: "专业编写", meta: "写作创作", tint: "purple" },
            { name: "公文写作", desc: "规范公文结构与措辞，辅助起草日常材料。", icon: "file", route: "smart-tools", child: "公文写作", meta: "写作创作", tint: "teal" },
          ],
        },
        {
          id: "connector", label: "连接器", icon: "blue",
          items: [
            { name: "部门知识库", desc: "接入本部门沉淀的项目资料、规范与经验。", icon: "layers", route: "knowledge", meta: "知识源", tint: "blue" },
            { name: "行业知识库", desc: "接入船舶行业公开标准、报告与文献资源。", icon: "globe", route: "knowledge", meta: "知识源", tint: "teal" },
            { name: "个人知识库", desc: "管理个人上传与收藏的资料，仅本人可见。", icon: "file", route: "knowledge", meta: "知识源", tint: "amber" },
            { name: "企业知识库", desc: "接入企业级主题集合与批量问答能力。", icon: "database", route: "knowledge", meta: "知识源", tint: "purple" },
          ],
        },
      ],
    },
    "discover-tools": {
      title: "工具与平台",
      desc: "按任务选择技能，或进入平台完成数据、开发与系统层面的工作。",
      groups: [
        {
          id: "skill", label: "技能", icon: "purple",
          items: [
            { name: "文档翻译", desc: "翻译完整文档，保留原文结构与专业表达。", icon: "translate", route: "smart-tools", child: "文档翻译", meta: "文档处理", tint: "teal" },
            { name: "文本翻译", desc: "处理中外文段落，理解跨语言资料。", icon: "translate", route: "smart-tools", child: "文本翻译", meta: "文档处理", tint: "blue" },
            { name: "OCR识别", desc: "将图片、扫描件中的文字转为可编辑内容。", icon: "scan", route: "smart-tools", child: "OCR识别", meta: "文档处理", tint: "amber" },
            { name: "纠错校对", desc: "检查错别字、语病与标点，完善文本表达。", icon: "check", route: "smart-tools", child: "纠错校对", meta: "文档处理", tint: "purple" },
            { name: "提示词生成", desc: "明确任务、角色与要求，组织有效的提示词。", icon: "chat", route: "smart-tools", child: "提示词生成", meta: "写作创作", tint: "teal" },
            { name: "PPT生成", desc: "将主题与提纲整理为逻辑清晰的演示文稿。", icon: "slides", route: "smart-tools", child: "PPT生成", meta: "写作创作", tint: "blue" },
          ],
        },
        {
          id: "platform", label: "平台", icon: "blue",
          items: [
            { name: "智能工具", desc: "12 项工具的工作区，可同时打开多个页签。", icon: "grid", route: "smart-tools", meta: "工具目录", tint: "purple" },
            { name: "前沿工具", desc: "全球鹰与智研通，面向研究前沿的信息入口。", icon: "compass", route: "frontier", meta: "研究", tint: "teal" },
            { name: "高质量数据集", desc: "船海全链条八大数据集，可查阅规模与资质。", icon: "database", route: "datasets", meta: "数据", tint: "blue" },
            { name: "数智系统", desc: "查看数智系统方向的能力与使用场景。", icon: "layers", route: "digital", meta: "系统", tint: "amber" },
            { name: "智能开发平台", desc: "面向智能能力的开发、编排与管理。", icon: "code", route: "platform", meta: "开发", tint: "purple" },
          ],
        },
        {
          id: "connector", label: "连接器", icon: "teal",
          items: [
            { name: "数据平台", desc: "汇集数据标注、采集与管理的统一入口。", icon: "server", route: "data-platform", meta: "数据源", tint: "blue" },
            { name: "数据标注平台", desc: "组织数据标注任务，管理标注与质检流程。", icon: "check", route: "data-platform", child: "数据标注平台", meta: "数据源", tint: "teal" },
            { name: "爬虫平台", desc: "面向公开数据的采集任务与调度。", icon: "globe", route: "data-platform", child: "爬虫平台", meta: "数据源", tint: "amber" },
            { name: "数据中台", desc: "集中管理与使用治理后的数据资产。", icon: "database", route: "data-platform", child: "数据中台", meta: "数据源", tint: "purple" },
          ],
        },
      ],
    },
  };
  window.BaigeDiscovery = Object.freeze({ sections });
})();
