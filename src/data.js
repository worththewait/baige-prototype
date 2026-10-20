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
 {name:"专利分析",group:"研究辅助",icon:"chart",description:"辅助梳理专利信息与技术发展脉络。"}
];
const navigation = [
 {id:"home",file:"pages/home.html",label:"首页",icon:"home"},
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
const findNavItem = id => navigation.find(item=>item.id===id);
window.BaigeData = Object.freeze({navigation,tools,knowledgeScopes,findNavItem});
})();
