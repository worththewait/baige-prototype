(() => {
"use strict";

const { navigation, smartToolGroups, findNavItem } = window.BaigeData;

const content = document.querySelector("#content");
const navRoot = document.querySelector("#navigation");
const breadcrumb = document.querySelector("#breadcrumbCurrent");
const appShell = document.querySelector(".app-shell");

const state = {
  activeId: "home",
  activeChild: "",
  expanded: new Set(["smart-tools"]),
  collapsed: false,
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

function renderNavigation() {
  navRoot.innerHTML = navigation.map((item) => {
    const active = item.id === state.activeId;
    const expanded = state.expanded.has(item.id);
    const childMarkup = item.children?.map((child) => `
      <button class="subnav-item ${state.activeChild === child && active ? "is-active" : ""}" data-child="${escapeHtml(child)}" data-parent="${item.id}" type="button">
        <span class="subnav-dot"></span><span>${escapeHtml(child)}</span>
      </button>`).join("") ?? "";
    return `
      <div class="nav-group ${active ? "is-current" : ""} ${expanded ? "is-expanded" : ""}">
        <button class="nav-item ${active ? "is-active" : ""}" data-nav="${item.id}" type="button" aria-expanded="${expanded}">
          <span class="nav-icon" aria-hidden="true">${item.icon}</span>
          <span class="nav-label">${escapeHtml(item.label)}</span>
          ${item.children ? `<span class="nav-chevron ${expanded ? "is-open" : ""}">⌄</span>` : ""}
        </button>
        ${item.children ? `<div class="subnav">${childMarkup}</div>` : ""}
      </div>`;
  }).join("");
}

function setPage(id, child = "") {
  const item = findNavItem(id);
  if (!item) return;
  state.activeId = id;
  state.activeChild = child;
  if (item.children) state.expanded.add(id);
  breadcrumb.textContent = child || item.label;
  renderNavigation();
  renderContent(item, child);
  document.querySelector("#contentScroll").scrollTop = 0;
}

function renderHome() {
  return `
    <section class="welcome-block">
      <div class="eyebrow"><span class="eyebrow-star">✦</span> 百舸数智工作空间</div>
      <h1>让知识与灵感，<span>顺流而行</span></h1>
      <p class="welcome-subtitle">你好，陈老师。今天想从哪里开始？</p>
      <div class="prompt-box">
        <textarea id="homePrompt" rows="2" placeholder="输入问题或描述你的任务…"></textarea>
        <div class="prompt-controls">
          <div class="mode-switch"><button class="mode-chip selected" type="button">◉ 通用问答</button><button class="mode-chip" type="button">▣ 知识库问答</button></div>
          <div class="prompt-actions"><button class="icon-button attach-button" title="添加附件" type="button">⌕</button><button class="send-button" id="sendPrompt" type="button" aria-label="发送">↑</button></div>
        </div>
      </div>
      <div class="quick-links"><button data-shortcut="writing">✎ <span>开始写作</span><b>→</b></button><button data-shortcut="knowledge">▣ <span>浏览知识库</span><b>→</b></button><button data-shortcut="smart-tools">✧ <span>探索智能工具</span><b>→</b></button></div>
    </section>
    <section class="home-lower">
      <div class="section-heading"><div><span class="section-kicker">QUICK ACCESS</span><h2>常用入口</h2></div><span class="muted-label">为你整理的工作起点</span></div>
      <div class="home-cards">
        ${[
          ["qa", "✳", "百舸问答", "围绕问题快速查找、梳理和分析", "#eaf0ff", "#426bdb"],
          ["knowledge", "▣", "知识库", "连接部门、行业与个人知识", "#e9f6f2", "#31977f"],
          ["smart-tools", "✧", "智能工具", "从翻译到创作，找到合适的工具", "#f2edff", "#8462dc"],
        ].map(([id, icon, title, desc, bg, color]) => `<button class="home-card" data-shortcut="${id}" type="button"><span class="home-card-icon" style="--icon-bg:${bg};--icon-color:${color}">${icon}</span><span class="home-card-text"><strong>${title}</strong><small>${desc}</small></span><span class="card-arrow">↗</span></button>`).join("")}
      </div>
    </section>
    <div class="home-footnote"><span class="footnote-mark">✦</span> 由百舸数智平台为你的工作提供灵感与助力</div>`;
}

function renderSmartTools() {
  return `
    <section class="page-heading smart-heading"><div><span class="section-kicker">SMART TOOLBOX</span><h1>智能工具</h1><p>为每一个想法，找到趁手的工具。</p></div><div class="tool-search"><span>⌕</span><input id="toolSearch" type="search" placeholder="搜索工具名称" aria-label="搜索工具名称"/><kbd>⌘ K</kbd></div></section>
    ${smartToolGroups.map((group) => group.featured ? `
      <section class="tool-section featured-section"><div class="section-heading compact"><h2>${group.title}</h2><span class="muted-label">精选入口</span></div><div class="featured-grid">${group.featured.map((tool) => `
        <button class="featured-card tone-${tool.tone}" data-tool="${escapeHtml(tool.name)}" type="button"><span class="featured-orbit orbit-one"></span><span class="featured-orbit orbit-two"></span><span class="featured-symbol">${tool.symbol}</span><span class="featured-copy"><small>百舸智能工具</small><strong>${tool.name}</strong><span>${tool.description}</span></span><span class="featured-arrow">↗</span></button>`).join("")}</div></section>` : `
      <section class="tool-section catalog-section"><div class="section-heading compact"><h2>${group.title}</h2><span class="muted-label">${String(group.tools.length).padStart(2, "0")} 个工具</span></div><div class="tool-grid">${group.tools.map((name, index) => `
        <button class="tool-card" data-tool="${escapeHtml(name)}" type="button"><span class="tool-card-icon icon-${index % 4}">${toolIcon(name)}</span><span class="tool-card-info"><strong>${escapeHtml(name)}</strong><small>${toolDescription(name)}</small></span><span class="tool-card-arrow">↗</span></button>`).join("")}</div></section>`).join("")}
    <div class="integration-note"><span class="note-sparkle">✦</span><span>工具持续接入中，更多能力即将开放</span></div>`;
}

function toolIcon(name) {
  if (name.includes("翻译")) return "文";
  if (name.includes("OCR")) return "识";
  if (name.includes("提示词")) return "✦";
  if (name.includes("思维")) return "⌘";
  if (name.includes("标准")) return "§";
  if (name.includes("PPT")) return "P";
  if (name.includes("公文")) return "▤";
  if (name.includes("文献")) return "阅";
  return "✎";
}

function toolDescription(name) {
  const descriptions = {
    "文档翻译": "面向文档的智能翻译能力",
    "文本翻译": "快速理解与翻译多语言文本",
    "OCR识别": "提取图片与扫描件中的文字",
    "提示词生成": "把想法整理成清晰有效的提示词",
    "标准编制、审校、分析工具": "辅助标准内容编制、审校与分析",
    "专业编写": "辅助撰写专业领域内容",
    "PPT生成": "将主题与提纲整理为演示文稿",
    "纠错校对": "检查错字、语病与表达问题",
    "文献伴读": "帮助梳理文献重点与脉络",
    "公文写作": "辅助公文起草与规范表达",
    "思维导图生成": "将复杂思路整理成清晰结构",
  };
  return descriptions[name] || "智能辅助，让工作更轻松";
}

function renderPlaceholder(title, parent) {
  return `
    <section class="placeholder-page">
      <div class="placeholder-topline"><span class="section-kicker">${escapeHtml(parent.toUpperCase())}</span><span class="placeholder-tag"><i></i> 能力接入中</span></div>
      <div class="placeholder-center"><div class="placeholder-art"><span class="art-ring ring-a"></span><span class="art-ring ring-b"></span><span class="art-core">✦</span><span class="art-orbit">·</span></div><span class="section-kicker">COMING SOON</span><h1>${escapeHtml(title)}</h1><p>正在集成</p><span class="placeholder-hint">相关能力接入后，将在这里为你呈现。</span><div class="placeholder-progress"><span></span></div><small>我们正在为你准备新的工作体验</small></div>
    </section>`;
}

function renderDetail(title, parent) {
  if (title === "全球鹰" || title === "智研通") return renderPlaceholder(title, parent);
  return renderPlaceholder(title, parent);
}

function renderContent(item, child = "") {
  if (item.id === "home") {
    content.innerHTML = renderHome();
    bindHomeControls();
    return;
  }
  if (item.view === "smart-tools" && !child) {
    content.innerHTML = renderSmartTools();
    bindToolControls();
    return;
  }
  const title = child || item.label;
  content.innerHTML = renderDetail(title, item.label);
}

function bindHomeControls() {
  document.querySelectorAll("[data-shortcut]").forEach((button) => button.addEventListener("click", () => setPage(button.dataset.shortcut)));
  document.querySelectorAll(".mode-chip").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".mode-chip").forEach((chip) => chip.classList.remove("selected"));
    button.classList.add("selected");
  }));
  document.querySelector("#sendPrompt")?.addEventListener("click", () => {
    const prompt = document.querySelector("#homePrompt").value.trim();
    if (!prompt) {
      document.querySelector("#homePrompt").focus();
      return;
    }
    setPage("qa", "通用对话");
  });
}

function bindToolControls() {
  document.querySelectorAll("[data-tool]").forEach((button) => button.addEventListener("click", () => setPage("smart-tools", button.dataset.tool)));
  const search = document.querySelector("#toolSearch");
  search?.addEventListener("input", () => {
    const query = search.value.trim().toLocaleLowerCase();
    document.querySelectorAll("[data-tool]").forEach((card) => {
      card.hidden = !card.dataset.tool.toLocaleLowerCase().includes(query);
    });
    document.querySelectorAll(".tool-section").forEach((section) => {
      section.hidden = ![...section.querySelectorAll("[data-tool]")].some((card) => !card.hidden);
    });
  });
}

navRoot.addEventListener("click", (event) => {
  const childButton = event.target.closest("[data-child]");
  if (childButton) {
    setPage(childButton.dataset.parent, childButton.dataset.child);
    return;
  }
  const navButton = event.target.closest("[data-nav]");
  if (!navButton) return;
  const id = navButton.dataset.nav;
  const item = findNavItem(id);
  if (item.children) {
    if (state.expanded.has(id) && state.activeId === id) {
      state.expanded.delete(id);
      renderNavigation();
      return;
    }
    state.expanded.add(id);
    setPage(id, item.view === "smart-tools" ? "" : "");
  } else {
    setPage(id);
  }
});

document.querySelector("#collapseButton").addEventListener("click", () => {
  state.collapsed = !state.collapsed;
  appShell.classList.toggle("sidebar-collapsed", state.collapsed);
  document.querySelector("#collapseButton").textContent = state.collapsed ? "›" : "‹";
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const search = document.querySelector("#toolSearch");
    if (search) search.focus();
    else setPage("smart-tools");
  }
});

renderNavigation();
renderContent(findNavItem("home"));
})();
