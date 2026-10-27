(() => {
  "use strict";
  const greeting = document.querySelector("#homeGreeting");
  const tabs = document.querySelector("#sceneTabs");
  const form = document.querySelector("#wbComposer");
  const prompt = document.querySelector("#wbPrompt");
  const hint = document.querySelector("#wbHint");
  const attach = document.querySelector("#attachChip");
  const placeholders = {
    qa: "输入问题，或描述你需要完成的工作…",
    writing: "描述要写的主题、对象与篇幅…",
    analysis: "说明要分析的数据与希望得到的结论…",
  };

  const hour = new Date().getHours();
  greeting.textContent = hour < 6 ? "夜深了" : hour < 12 ? "上午好" : hour < 18 ? "下午好" : "晚上好";

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scene]");
    if (!button) return;
    tabs.querySelectorAll("[data-scene]").forEach((item) => {
      item.setAttribute("aria-selected", String(item === button));
    });
    prompt.placeholder = placeholders[button.dataset.scene] || placeholders.qa;
    hint.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!prompt.value.trim()) {
      hint.textContent = "请先输入问题或任务描述。";
      prompt.focus();
      return;
    }
    hint.textContent = "任务已记录，当前为原型演示，执行能力正在集成。";
  });

  attach.addEventListener("click", () => {
    hint.textContent = "原型暂不支持上传附件，接入后可在此选择文件。";
  });

  window.BaigePage.onActivate(() => {});
})();
