(() => {
  "use strict";
  const { navigation, tools } = window.BaigeData;
  const research = new Set(["qa", "knowledge", "writing", "library", "intel", "analysis"]);
  const descriptions = {
    home: "围绕问题展开交流，整理思路与资料。",
    knowledge: "统一查阅部门、行业、企业与个人知识。",
    writing: "从主题与提纲出发，组织专业内容。",
    library: "收集和查阅文献，找到所需的专业资料。",
    intel: "了解行业信息、前沿动态与研究线索。",
    analysis: "辅助梳理信息，形成清晰的研究思路。",
    digital: "了解与使用数智业务系统。",
    datasets: "探索专业领域的数据集与数据资源。",
    platform: "进入智能应用开发工作环境。",
    "智能问数": "通过自然语言提出问题，探索业务数据。",
    "全球鹰": "了解全球鹰的前沿信息与研究服务。",
    "智研通": "了解智研通的专业研究与资料服务。",
    "数据标注平台": "组织和开展数据标注工作。",
    "爬虫平台": "进入数据采集与资料整理工作环境。",
    "数据中台": "查阅与使用统一的数据服务。",
  };
  function keyFor(id, child = "") {
    if (id === "qa" && (!child || child === "对话")) return JSON.stringify(["home", ""]);
    return JSON.stringify([id, child]);
  }
  const entries = navigation.flatMap(item => {
    if (["home", "center"].includes(item.id)) return [];
    const group = research.has(item.id) ? "knowledge" : "tools";
    const make = (id, child, name, category, description, icon) => Object.freeze({
      id, child, name, group, category, description, icon,
      parent: item.label, key: keyFor(id, child),
    });
    if (item.id === "smart-tools") return tools.map(tool =>
      make(item.id, tool.name, tool.name, tool.group, tool.description, tool.icon));
    if (item.children) return item.children.map(child => child === "对话"
      ? make("home", "", child, item.label, descriptions.home, item.icon)
      : make(item.id, child, child, item.label, descriptions[child] || "相关能力正在集成。", item.icon));
    return [make(item.id, "", item.label, group === "knowledge" ? "知识与研究" : "平台与数据", descriptions[item.id], item.icon)];
  });
  const byKey = new Map(entries.map(entry => [entry.key, entry]));
  window.BaigeCatalog = Object.freeze({
    entries: Object.freeze(entries), keyFor,
    get: (id, child = "") => byKey.get(keyFor(id, child)),
    getByKey: key => byKey.get(key),
  });
})();
