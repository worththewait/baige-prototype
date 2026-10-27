(() => {
  "use strict";
  const { icon, escapeHtml: esc } = window.BaigeUI;
  const page = window.BaigePage;
  const access = window.BaigeHomeAccess;
  const entries = window.BaigeCatalog.entries;
  const state = { group: "knowledge", filter: "全部", query: "", available: false };
  const search = document.querySelector("#featureSearch");
  const groups = [{ id: "knowledge", name: "知识与研究" }, { id: "tools", name: "工具与平台" }];
  function render() {
    document.querySelector("#centerGroups").innerHTML = groups.map(group => `<button type="button" id="group-${group.id}" role="tab" aria-controls="featureResults" aria-selected="${state.group === group.id}" class="center-group" data-group="${group.id}">${group.name}</button>`).join("");
    const filters = state.group === "tools" ? ["全部", "文档处理", "写作创作", "研究辅助", "平台与数据"] : [];
    document.querySelector("#centerFilters").innerHTML = filters.map(name => `<button class="center-filter" type="button" data-filter="${name}" aria-pressed="${state.filter === name}">${name}</button>`).join("");
    const query = state.query.trim().toLowerCase();
    const matches = entries.filter(entry => {
      const inGroup = query || entry.group === state.group;
      const inCategory = query || state.filter === "全部" || (state.filter === "平台与数据" ? ["前沿工具", "平台与数据", "数据平台"].includes(entry.category) : entry.category === state.filter);
      return inGroup && inCategory && (!state.available || access.canOpen(entry.id, entry.child)) &&
        (!query || `${entry.name} ${entry.description} ${entry.parent} ${entry.category}`.toLowerCase().includes(query));
    });
    document.querySelector("#featureSearchSummary").textContent = query ? `全部功能中找到 ${matches.length} 项与“${state.query.trim()}”相关的功能` : `${groups.find(group => group.id === state.group).name} · ${matches.length} 项功能`;
    const root = document.querySelector("#featureResults");
    root.setAttribute("role", "tabpanel"); root.setAttribute("aria-labelledby", `group-${state.group}`);
    root.innerHTML = matches.map(entry => {
      const status = access.status(entry.id, entry.child);
      return `<article class="feature-card"><div class="feature-card-identity">${icon(entry.icon)}<h2>${esc(entry.name)}</h2>${status !== "granted" ? `<span class="feature-status">${status === "pending" ? "待审批" : "未开通"}</span>` : ""}</div><p>${esc(entry.description)}</p><div class="feature-card-footer"><span>${esc(entry.category)}</span><button type="button" class="feature-action" data-home-route="${entry.id}" data-home-child="${esc(entry.child)}" aria-label="${status === "granted" ? "进入" : status === "pending" ? "查看申请" : "申请使用"}${esc(entry.name)}">${status === "granted" ? "进入" : status === "pending" ? "查看申请" : "申请权限"}${icon(status === "granted" ? "arrow" : "plus")}</button></div></article>`;
    }).join("") || `<div class="center-empty">${icon("search")}<h2>没有找到匹配的功能</h2><p>可以更换关键词，或清除筛选后重新查找。</p><button type="button" class="secondary-button" data-reset>清除筛选</button></div>`;
  }
  document.addEventListener("click", event => {
    const group = event.target.closest("[data-group]");
    if (group) { state.group = group.dataset.group; state.filter = "全部"; render(); document.querySelector(`#group-${state.group}`).focus(); }
    const filter = event.target.closest("[data-filter]");
    if (filter) { state.filter = filter.dataset.filter; render(); [...document.querySelectorAll("[data-filter]")].find(button => button.dataset.filter === state.filter)?.focus(); }
    const action = event.target.closest("[data-home-route]");
    if (action) access.navigate(action.dataset.homeRoute, action.dataset.homeChild || "", action);
    if (event.target.closest("[data-reset]")) { state.query = ""; state.filter = "全部"; state.available = false; search.value = ""; document.querySelector("#availableOnly").checked = false; render(); search.focus(); }
  });
  search.addEventListener("input", () => { state.query = search.value; render(); });
  document.querySelector("#availableOnly").addEventListener("change", event => { state.available = event.target.checked; render(); });
  document.querySelector("#centerGroups").addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); state.group = event.key === "Home" ? "knowledge" : event.key === "End" ? "tools" : state.group === "knowledge" ? "tools" : "knowledge"; state.filter = "全部"; render(); document.querySelector(`#group-${state.group}`).focus();
  });
  access.onChange(render);
  page.onDeactivate(() => access.deactivate());
  page.onActivate(({ child, focusSearch }) => {
    if (groups.some(group => group.id === child)) { state.group = child; state.filter = "全部"; }
    render(); if (focusSearch) search.focus();
  });
})();
