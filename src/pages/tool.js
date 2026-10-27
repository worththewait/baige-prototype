(() => {
  "use strict";
  window.BaigePage.onActivate(({ child }) => {
    const tool = window.BaigeCatalog.get("smart-tools", child);
    document.querySelector("#toolTitle").textContent = tool?.name || "智能工具";
    document.querySelector("#toolDescription").textContent = tool?.description || "从功能中心选择一个工具开始。";
  });
})();
