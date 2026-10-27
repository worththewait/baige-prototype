(() => {
"use strict";
const tools = [
 {name:"文档翻译",group:"文档处理",icon:"translate",description:"翻译完整文档，保留原文结构与专业表达。"},
 {name:"文本翻译",group:"文档处理",icon:"translate",description:"处理中外文段落，理解跨语言资料。"},
 {name:"OCR识别",group:"文档处理",icon:"scan",description:"将图片、扫描件中的文字转为可编辑内容。"},
 {name:"纠错校对",group:"文档处理",icon:"check",description:"检查错别字、语病与标点，完善文本表达。"},
 {name:"提示词生成",group:"写作创作",icon:"chat",description:"明确任务、角色与要求，组织有效的提示词。"},
 {name:"专业编写",group:"写作创作",icon:"pen",description:"围绕专业主题，辅助搭建框架与撰写内容。"},
 {name:"公文写作",group:"写作创作",icon:"file",description:"规范公文结构与措辞，辅助起草日常材料。"},
 {name:"PPT生成",group:"写作创作",icon:"slides",description:"将主题与提纲整理为逻辑清晰的演示文稿。"},
 {name:"文献伴读",group:"研究辅助",icon:"book",description:"梳理文献重点，理解研究方法与核心结论。"},
 {name:"思维导图生成",group:"研究辅助",icon:"branch",description:"展开主题与关联，让研究思路形成清晰结构。"},
 {name:"标准编制",group:"研究辅助",icon:"standard",description:"辅助整理标准结构、编制内容与条款。"},
 {name:"专利编制",group:"研究辅助",icon:"file",description:"辅助梳理专利技术方案与申请材料，形成编制思路。"}
];
const navigation = [
 {id:"home",file:"pages/home.html",label:"新对话",icon:"chat"},
 {id:"center",file:"pages/center.html",label:"功能中心",icon:"grid"},
 {id:"qa",file:"pages/qa.html",label:"百舸问答",icon:"chat",children:["对话","智能问数"]},
 {id:"knowledge",file:"pages/knowledge.html",label:"知识库",icon:"book"},
 {id:"writing",file:"pages/writing.html",label:"百舸写作",icon:"pen"},
 {id:"library",file:"pages/library.html",label:"百舸文库",icon:"file"},
 {id:"intel",file:"pages/intel.html",label:"百舸情报",icon:"globe"},
 {id:"analysis",file:"pages/analysis.html",label:"百舸分析",icon:"chart"},
 {id:"smart-tools",file:"pages/smart-tools.html",label:"智能工具",icon:"grid"},
 {id:"frontier",file:"pages/frontier.html",label:"前沿工具",icon:"compass",children:["全球鹰","智研通"]},
 {id:"digital",file:"pages/digital.html",label:"数智系统",icon:"layers"},
 {id:"datasets",file:"pages/datasets.html",label:"高质量数据集",icon:"database"},
 {id:"platform",file:"pages/platform.html",label:"智能开发平台",icon:"code"},
 {id:"data-platform",file:"pages/data-platform.html",label:"数据平台",icon:"server",children:["数据标注平台","爬虫平台","数据中台"]}
];
const knowledgeScopes = ["全部","部门知识库","行业知识库","个人知识库","企业知识库"];
// Sample names for the selection prototype. No documents or retrieval service are connected.
const knowledgeLibraries = [
 {id:"enterprise-main",name:"企业知识库",scope:"企业知识库",description:"企业资料与日常知识"},
 {id:"enterprise-writing",name:"写作素材",scope:"企业知识库",description:"常用写作材料与表达参考"},
 {id:"enterprise-qa",name:"问答知识库",scope:"企业知识库",description:"常见问题与业务资料"},
 {id:"industry-ship",name:"船舶行业资料",scope:"行业知识库",description:"行业研究与技术资料"},
 {id:"industry-standard",name:"标准规范资料",scope:"行业知识库",description:"标准与规范参考资料"},
 {id:"department-project",name:"部门项目资料",scope:"部门知识库",description:"部门项目与研究材料"},
 {id:"department-research",name:"研究报告资料",scope:"部门知识库",description:"研究报告与专题材料"},
 {id:"personal-notes",name:"我的研究笔记",scope:"个人知识库",description:"个人整理的阅读与研究笔记"},
 {id:"personal-saved",name:"个人收藏资料",scope:"个人知识库",description:"个人收藏与整理的资料"}
];
const findNavItem = id => navigation.find(item=>item.id===id);
// Prototype permissions only. A denied parent also denies its children.
const permissions = {
 routes: {},
 children: {
  qa: {"智能问数": false},
  frontier: {"智研通": false},
  "smart-tools": {"标准编制": false}
 }
};
const childNames = id => id === "smart-tools" ? tools.map(tool => tool.name) : (findNavItem(id)?.children || []);
function canOpen(id, child = "") {
 if (!findNavItem(id) || permissions.routes[id] === false) return false;
 if (id === "home") return permissions.routes.qa !== false && permissions.children.qa?.["对话"] !== false;
 const names = childNames(id);
 if (child) return names.includes(child) && permissions.children[id]?.[child] !== false;
 return names.length ? names.some(name => canOpen(id, name)) : true;
}
function accessSummary(id) {
 const names = childNames(id);
 const granted = names.filter(name => canOpen(id, name)).length;
 return { total: names.length, granted,
  label: !granted ? "暂未开通" : granted === names.length ? "全部已开通" : `已开通 ${granted}/${names.length}` };
}
function canUseKnowledge(id) {
 return canOpen("knowledge") && knowledgeLibraries.some(library => library.id === id) && permissions.libraries?.[id] !== false;
}
window.BaigeData = Object.freeze({navigation,tools,knowledgeScopes,knowledgeLibraries,findNavItem});
window.BaigePermissions = Object.freeze({canOpen,canUseKnowledge,childNames,summary:accessSummary});
})();
