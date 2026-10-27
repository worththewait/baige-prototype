(() => {
  "use strict";

  const { navigation, tools, knowledgeScopes } = window.BaigeData;
  const { icon, escapeHtml } = window.BaigeUI;
  const page = window.BaigePage;

  // Homepage copy lives here; route names and child lists stay in data.js.
  const profiles = {
    qa: { summary: "围绕问题展开对话，探索信息与数据。", detail: "从一个问题开始梳理思路，进入对话或智能问数，继续完成具体任务。" },
    knowledge: { summary: "把常用知识汇集到一个入口。", detail: "集中查阅部门、行业、个人与企业知识，帮助团队更快找到所需资料。" },
    writing: { summary: "从主题与框架出发组织专业表达。", detail: "面向日常材料与专业内容，了解百舸写作所支持的工作方向。" },
    library: { summary: "集中了解与查阅文库资源。", detail: "面向资料收集与阅读场景，进入百舸文库了解后续能力。" },
    intel: { summary: "关注研究领域与行业信息。", detail: "从情报入口了解与研究工作相关的信息，具体内容将持续集成。" },
    analysis: { summary: "让资料分析有清晰的工作入口。", detail: "围绕分析任务组织相关能力，具体内容将持续集成。" },
    "smart-tools": { summary: "翻译、识别、写作与研究辅助工具。", detail: "按文档处理、写作创作、研究辅助查找工具；打开多个工具时可通过页签切换。" },
    frontier: { summary: "了解全球鹰与智研通。", detail: "探索前沿工具的用途，选择具体功能查看内容与当前集成进度。" },
    digital: { summary: "查看数智系统相关入口。", detail: "集中了解数智系统方向的能力与使用场景，具体内容将持续集成。" },
    datasets: { summary: "船海全链条八大数据集，可直接查阅。", detail: "查看船海产业、标准、质量、科技成果等八大数据集，了解数据规模、资质与服务对象。" },
    platform: { summary: "面向智能能力的开发与管理。", detail: "了解智能开发平台提供的工作入口，具体内容将持续集成。" },
    "data-platform": { summary: "汇集数据标注、采集与管理入口。", detail: "通过数据标注平台、爬虫平台和数据中台进入对应的工作场景。" },
  };
  // Prototype descriptions; keep unprovided capabilities explicitly pending.
  const childDescriptions = {
    qa: {
      "对话": "围绕问题展开交流，辅助梳理资料与思路。",
      "智能问数": "通过自然语言提出数据问题，相关能力正在集成。",
    },
    frontier: {
      "全球鹰": "全球鹰相关内容与服务入口，正在集成。",
      "智研通": "智研通相关内容与服务入口，正在集成。",
    },
    "data-platform": {
      "数据标注平台": "组织数据标注任务，相关能力正在集成。",
      "爬虫平台": "面向数据采集任务，相关能力正在集成。",
      "数据中台": "集中管理与使用数据，相关能力正在集成。",
    },
  };
  const groups = [
    { id: "knowledge-research", label: "知识与研究", ids: ["qa", "knowledge", "writing", "library", "intel", "analysis"] },
    { id: "tools-platforms", label: "工具与平台", ids: ["smart-tools", "frontier", "digital", "datasets", "platform", "data-platform"] },
  ];
  const access = window.BaigeHomeAccess;
  const groupSwitch = document.querySelector("#featureGroups");
  const results = document.querySelector("#featureResults");
  const search = document.querySelector("#featureSearch");
  const clearSearch = document.querySelector("#featureClear");
  const availableOnly = document.querySelector("#availableOnly");
  const searchSummary = document.querySelector("#featureSearchSummary");
  let selectedGroup = "all";
  let beforeSearch = null;
  const expandedCards = new Set();
  const cardScrollPositions = new Map();

  const navItem = (id) => navigation.find((item) => item.id === id);
  const routeAttrs = (id, child = "") => `data-home-route="${escapeHtml(id)}" data-home-child="${escapeHtml(child)}"`;
  const isShown = (id, child = "") => !availableOnly.checked || access.canOpen(id, child);
  const statusLabel = (id, child = "") => ({ granted: "", locked: "需申请", pending: "待审批" }[access.status(id, child)]);
  function statusMarkup(id, child = "") {
    const label = statusLabel(id, child);
    return label ? `<span class="home-access-tag${label === "待审批" ? " is-pending" : ""}">${label}</span>` : "";
  }
  function actionLabel(id, child = "") {
    return ({ granted: "进入功能", locked: "申请权限", pending: "查看申请" })[access.status(id, child)];
  }
  function moduleMatches(item, query) {
    // A query naming only a hidden child must not surface an unrelated available child.
    if (availableOnly.checked && query && item.children?.some((name) => name.toLowerCase().includes(query)) &&
        !item.children.some((name) => isShown(item.id, name) && name.toLowerCase().includes(query))) return false;
    return [item.label, profiles[item.id].summary, profiles[item.id].detail, ...(item.children || []),
      ...(item.id === "knowledge" ? knowledgeScopes : [])].join(" ").toLowerCase().includes(query);
  }
  function toolMatches(tool, query) {
    return [tool.name, tool.description, tool.group].join(" ").toLowerCase().includes(query);
  }
  function renderChild(item, name, index) {
    const state = access.status(item.id, name);
    const label = { granted: "已开通", locked: "未开通", pending: "待审批" }[state];
    const action = state === "granted" ? "进入" : actionLabel(item.id, name);
    const description = childDescriptions[item.id]?.[name] || "相关功能正在集成，使用说明待补充。";
    return `<div class="home-child-row" style="--child-delay:${Math.min(index, 4) * 24}ms">
      <div class="home-child-heading"><strong>${escapeHtml(name)}</strong><span class="home-child-status is-${state}">${label}</span></div>
      <p>${escapeHtml(description)}</p>
      <button class="home-module-action" type="button" ${routeAttrs(item.id, name)} aria-label="${escapeHtml(name)}，${action}">${action}${icon("arrow")}</button>
    </div>`;
  }
  function renderModule(item) {
    const hasChildren = Boolean(item.children?.length);
    const opened = hasChildren && expandedCards.has(item.id);
    const childLinks = (item.children || []).filter((name) => isShown(item.id, name));
    const summary = access.summary(item.id);
    return `<article class="home-module-card${opened ? " is-details" : ""}" data-module-card="${item.id}">
      <div class="home-card-overview" ${opened ? 'inert aria-hidden="true"' : ''}>
        <div class="home-module-heading"><span class="home-module-icon">${icon(item.icon)}</span><h4>${escapeHtml(item.label)}</h4>${hasChildren ? "" : statusMarkup(item.id)}</div>
        <p class="home-module-description">${escapeHtml(profiles[item.id].summary)}</p>
        ${item.id === "knowledge" ? `<p class="home-module-scopes">${knowledgeScopes.filter((scope) => scope !== "全部").map((scope) => escapeHtml(scope.replace("知识库", ""))).join(" · ")}知识</p>` : ""}
        <div class="home-module-footer">${hasChildren ? `<span class="home-module-summary" title="共 ${summary.total} 项功能">${summary.label}</span>` : ""}${hasChildren ?
          `<button class="home-details-toggle" type="button" data-card-open="${item.id}" aria-expanded="${opened}" aria-controls="cardDetails-${item.id}" aria-label="${escapeHtml(item.label)}，查看详情">查看详情${icon("arrow")}</button>` :
          `<button class="home-module-action" type="button" ${routeAttrs(item.id)} aria-label="${escapeHtml(item.label)}，${actionLabel(item.id)}">${actionLabel(item.id)}${icon("arrow")}</button>`}
        </div>
      </div>
      ${hasChildren ? `<section class="home-card-details" id="cardDetails-${item.id}" aria-labelledby="cardDetailsTitle-${item.id}" ${opened ? "" : 'inert aria-hidden="true"'}>
        <div class="home-card-details-head"><button class="home-card-back" type="button" data-card-close="${item.id}" aria-label="返回${escapeHtml(item.label)}介绍">${icon("back")}</button><h4 id="cardDetailsTitle-${item.id}">${escapeHtml(item.label)}</h4><span>${childLinks.length} 项功能</span></div>
        <div class="home-module-children" data-card-scroll="${item.id}" role="region" aria-label="${escapeHtml(item.label)}子功能列表" tabindex="0">${childLinks.map((name, index) => renderChild(item, name, index)).join("")}</div>
      </section>` : ""}
    </article>`;
  }

  // Switch existing panes in place: their dimensions, scroll and sibling cards stay stable.
  function setCardExpanded(id, expanded) {
    const card = [...results.querySelectorAll("[data-module-card]")].find((node) => node.dataset.moduleCard === id);
    if (!card) return;
    const overview = card.querySelector(".home-card-overview");
    const details = card.querySelector(".home-card-details");
    if (!details) return;
    if (expanded) expandedCards.add(id);
    else expandedCards.delete(id);
    const active = expanded ? details : overview;
    const inactive = expanded ? overview : details;
    active.inert = false;
    active.removeAttribute("aria-hidden");
    card.classList.toggle("is-details", expanded);
    card.classList.toggle("is-opening", expanded);
    card.querySelector("[data-card-open]").setAttribute("aria-expanded", String(expanded));
    // Move focus before hiding its previous pane from assistive technology.
    active.querySelector("button").focus({ preventScroll: true });
    inactive.inert = true;
    inactive.setAttribute("aria-hidden", "true");
  }
  function renderToolButton(tool) {
    return `<button class="home-discovery-tool" type="button" ${routeAttrs("smart-tools", tool.name)} aria-label="${escapeHtml(tool.name)}，${actionLabel("smart-tools", tool.name)}">
      <span class="home-discovery-icon">${icon(tool.icon)}</span>
      <span class="home-discovery-copy"><span class="home-tool-name"><strong>${escapeHtml(tool.name)}</strong>${statusMarkup("smart-tools", tool.name)}</span><small>${escapeHtml(tool.description)}</small></span>${icon("arrow")}
    </button>`;
  }
  function renderToolCatalog(shownTools, query) {
    if (!shownTools.length) return "";
    const categories = [...new Set(shownTools.map((tool) => tool.group))];
    const content = query ? `<div class="home-search-tool-list">${shownTools.map(renderToolButton).join("")}</div>` :
      `<div class="home-tool-groups">${categories.map((group) => `<section class="home-tool-group"><h4>${escapeHtml(group)}</h4><div class="home-tool-items">${shownTools.filter((tool) => tool.group === group).map(renderToolButton).join("")}</div></section>`).join("")}</div>`;
    return `<section class="home-tool-catalog" aria-labelledby="homeToolsTitle">
      <div class="home-catalog-heading"><div><h3 id="homeToolsTitle">智能工具<span>已开通 ${access.summary("smart-tools").granted}/${access.summary("smart-tools").total}</span></h3><p>找到具体工具，直接开始一项任务。</p></div>
        ${access.canOpen("smart-tools") ? `<button class="home-inline-action" type="button" ${routeAttrs("smart-tools")}>进入工具工作区${icon("arrow")}</button>` : ""}
      </div>${content}
    </section>`;
  }
  function renderDirectory(focusGroup = null) {
    results.querySelectorAll("[data-card-scroll]").forEach((node) => cardScrollPositions.set(node.dataset.cardScroll, node.scrollTop));
    const query = search.value.trim().toLowerCase();
    const active = query ? "all" : selectedGroup;
    clearSearch.hidden = !search.value;
    groupSwitch.innerHTML = [{ id: "all", label: "全部功能" }, ...groups].map((group) => `<button class="home-group-button" type="button" data-feature-group="${group.id}" aria-pressed="${group.id === active}">${escapeHtml(group.label)}</button>`).join("");
    let moduleCount = 0;
    let toolCount = 0;
    results.innerHTML = groups.filter((group) => active === "all" || group.id === active).map((group) => {
      const items = group.ids.filter((id) => id !== "smart-tools").map(navItem).filter((item) => moduleMatches(item, query) && isShown(item.id));
      const matchingTools = group.id === "tools-platforms" ? tools.filter((tool) => isShown("smart-tools", tool.name) && (toolMatches(tool, query) || "智能工具".includes(query))) : [];
      const smartMatch = group.id === "tools-platforms" && matchingTools.length > 0;
      if (!items.length && !smartMatch) return "";
      moduleCount += items.length + (smartMatch ? 1 : 0);
      toolCount += matchingTools.length;
      return `<section class="home-function-group" aria-labelledby="${group.id}Title">
        <div class="home-category-heading"><h3 id="${group.id}Title">${escapeHtml(group.label)}</h3><span>${group.id === "knowledge-research" ? "问答、知识与专业研究" : "资料处理与专业平台"}</span></div>
        ${renderToolCatalog(matchingTools, query)}
        ${items.length ? `${smartMatch ? '<h4 class="home-platform-heading">平台入口</h4>' : ''}<div class="home-module-grid">${items.map(renderModule).join("")}</div>` : ""}
      </section>`;
    }).join("");
    searchSummary.textContent = query ? `找到 ${moduleCount} 项功能${toolCount ? `、${toolCount} 个工具` : ""}` : availableOnly.checked ? "当前仅显示已开通的功能与工具" : "所有功能均可在这里了解，未开通项可申请权限";
    if (!moduleCount) results.innerHTML = `<div class="home-feature-empty">${icon("search")}<h3>没有找到匹配的功能</h3><p>试试“翻译”“写作”等关键词，或重置筛选条件。</p><button type="button" data-reset-directory>重置筛选</button></div>`;
    results.querySelectorAll("[data-card-scroll]").forEach((node) => { node.scrollTop = cardScrollPositions.get(node.dataset.cardScroll) || 0; });
    if (focusGroup) [...groupSwitch.querySelectorAll("button")].find((button) => button.dataset.featureGroup === focusGroup)?.focus({ preventScroll: true });
  }

  function updateSearch() {
    const hasQuery = Boolean(search.value.trim());
    if (hasQuery && beforeSearch === null) beforeSearch = selectedGroup;
    else if (!hasQuery && beforeSearch !== null) { selectedGroup = beforeSearch; beforeSearch = null; }
    renderDirectory();
  }
  function clearQuery() { search.value = ""; updateSearch(); search.focus({ preventScroll: true }); }
  groupSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-feature-group]");
    if (!button) return;
    selectedGroup = button.dataset.featureGroup;
    search.value = "";
    beforeSearch = null;
    renderDirectory(selectedGroup);
  });
  search.addEventListener("input", updateSearch);
  search.addEventListener("keydown", (event) => { if (event.key === "Escape" && search.value) { event.preventDefault(); clearQuery(); } });
  clearSearch.addEventListener("click", clearQuery);
  availableOnly.addEventListener("change", () => renderDirectory());
  document.addEventListener("click", (event) => {
    const open = event.target.closest("[data-card-open]");
    if (open) return setCardExpanded(open.dataset.cardOpen, true);
    const close = event.target.closest("[data-card-close]");
    if (close) return setCardExpanded(close.dataset.cardClose, false);
    const button = event.target.closest("[data-home-route]");
    if (button) access.navigate(button.dataset.homeRoute, button.dataset.homeChild || "", button);
    if (event.target.closest("[data-reset-directory]")) {
      search.value = ""; selectedGroup = "all"; beforeSearch = null; availableOnly.checked = false;
      renderDirectory(); search.focus({ preventScroll: true });
    }
  });
  results.addEventListener("keydown", (event) => {
    const card = event.target.closest(".home-module-card.is-details");
    if (event.key === "Escape" && card) {
      event.preventDefault();
      setCardExpanded(card.dataset.moduleCard, false);
    }
  });
  results.addEventListener("animationend", (event) => {
    if (event.animationName === "home-card-light") event.target.closest(".home-module-card")?.classList.remove("is-opening");
  });
  access.onChange(() => renderDirectory());
  renderDirectory();
  page.onDeactivate(() => access.deactivate());
  page.onActivate(() => {});
})();
