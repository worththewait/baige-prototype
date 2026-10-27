(() => {
  "use strict";
  const { knowledgeScopes, knowledgeLibraries } = window.BaigeData;
  const { escapeHtml: esc, icon } = window.BaigeUI;
  const state = { scope: "全部", query: "" };
  const root = document.querySelector("#knowledgeScopes");
  root.innerHTML = knowledgeScopes.map(scope => `<button class="category-tab ${scope === "全部" ? "is-active" : ""}" type="button" data-knowledge="${esc(scope)}" aria-pressed="${scope === "全部"}">${esc(scope)}</button>`).join("");
  function render() {
    const libraries = knowledgeLibraries.filter(library => window.BaigePermissions.canUseKnowledge(library.id) &&
      (state.scope === "全部" || library.scope === state.scope) && library.name.toLowerCase().includes(state.query.trim().toLowerCase()));
    document.querySelector("#knowledgeTitle").textContent = state.scope === "全部" ? "全部知识库" : state.scope;
    document.querySelector("#knowledgeLibraryCount").textContent = `${libraries.length} 个知识库`;
    document.querySelector("#knowledgeResources").innerHTML = libraries.map(library => `<article class="knowledge-resource">${icon("folder")}<div><h3>${esc(library.name)}</h3><p>${esc(library.description)}</p><small>${library.scope.replace("知识库", "")} · 示例</small></div></article>`).join("") || '<div class="center-empty"><h2>没有匹配的知识库</h2><p>试试其他名称或知识范围。</p></div>';
  }
  root.addEventListener("click", event => {
    const button = event.target.closest("[data-knowledge]"); if (!button) return;
    state.scope = button.dataset.knowledge;
    root.querySelectorAll("button").forEach(item => { item.classList.toggle("is-active", item === button); item.setAttribute("aria-pressed", String(item === button)); });
    render();
  });
  document.querySelector("#knowledgeLibrarySearch").addEventListener("input", event => { state.query = event.target.value; render(); });
  window.BaigePage.onActivate(render);
})();
