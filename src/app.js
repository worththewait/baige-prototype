(() => {
  "use strict";
  const { findNavItem } = window.BaigeData;
  const { icon, escapeHtml: esc } = window.BaigeUI;
  const catalog = window.BaigeCatalog;
  const policy = window.BaigePermissions;
  const workspace = window.BaigeWorkspace.create();
  const nav = document.querySelector("#navigation");
  const list = document.querySelector("#workspaceFunctions");
  const host = document.querySelector("#pageHost");
  const pages = new Map();
  const state = { key: "", id: "", child: "" };
  let statusTimer;
  function notify(text) {
    const status = document.querySelector("#shellStatus");
    clearTimeout(statusTimer); status.textContent = text; status.hidden = false;
    statusTimer = setTimeout(() => { status.hidden = true; }, 3800);
  }
  function normalize(id, child = "") {
    if (typeof id !== "string" || typeof child !== "string") return null;
    if (id === "qa" && (!child || child === "对话")) return { id: "home", child: "" };
    if (id === "smart-tools" && !child) return { id: "center", child: "tools" };
    if (!findNavItem(id)) return null;
    if (id === "center") return { id, child: ["knowledge", "tools"].includes(child) ? child : "" };
    if (id === "home" || id === "knowledge") return child ? null : { id, child: "" };
    if (!child) return { id, child: policy.childNames(id).find(name => policy.canOpen(id, name)) || "" };
    return catalog.get(id, child) ? { id, child } : null;
  }
  const frameKey = route => catalog.keyFor(route.id, route.id === "center" ? "" : route.child);
  function renderNavigation() {
    nav.innerHTML = `${policy.canOpen("home") ? `<button class="nav-item new-conversation" data-new-conversation type="button" title="新对话">${icon("newchat")}<span class="nav-label">新对话</span></button>` : ""}
      <button class="nav-item ${state.id === "center" ? "is-active" : ""}" data-main-nav="center" type="button" ${state.id === "center" ? 'aria-current="page"' : ""} title="功能中心">${icon("grid")}<span class="nav-label">功能中心</span></button>
      ${policy.canOpen("knowledge") ? `<button class="nav-item ${state.id === "knowledge" ? "is-active" : ""}" data-main-nav="knowledge" type="button" ${state.id === "knowledge" ? 'aria-current="page"' : ""} title="知识库">${icon("book")}<span class="nav-label">知识库</span></button>` : ""}`;
    const top = list.scrollTop;
    list.innerHTML = workspace.items().map(entry => {
      const pinned = workspace.isPinned(entry.key);
      return `<div class="workspace-function ${state.key === entry.key ? "is-active" : ""}"><button class="workspace-function-open" type="button" data-workspace-open="${esc(entry.key)}" title="${esc(entry.name)}" ${state.key === entry.key ? 'aria-current="page"' : ""}>${icon(entry.icon)}<span>${esc(entry.name)}</span></button><button class="workspace-pin ${pinned ? "is-pinned" : ""}" type="button" data-workspace-pin="${esc(entry.key)}" aria-pressed="${pinned}" aria-label="${pinned ? "取消固定" : "固定"}${esc(entry.name)}" title="${pinned ? "取消固定" : "固定到工作区"}">${icon("pin")}</button></div>`;
    }).join("") || '<div class="workspace-first-run"><p>把需要的功能放在手边。</p><button class="text-button" type="button" data-add-workspace>浏览功能<span aria-hidden="true"> →</span></button></div>';
    list.scrollTop = top;
  }
  function activate(page) {
    if (!page?.ready || state.key !== page.key) return;
    const target = page.element.contentWindow;
    target.postMessage({ type: "baige:activate", pageId: page.id, child: state.child, focusSearch: page.focusSearch }, "*");
    page.focusSearch = false;
    target.postMessage({ type: "baige:workspace", pageId: page.id, available: Boolean(page.entry), pinned: workspace.isPinned(page.key) }, "*");
    if (page.reset) { target.postMessage({ type: "baige:reset", pageId: page.id }, "*"); page.reset = false; }
  }
  function setPage(id, child = "", options = {}) {
    const route = normalize(id, child);
    if (!route) return;
    if (!policy.canOpen(route.id, route.child)) {
      notify("暂无该功能权限，可在功能中心申请开通。");
      return setPage("center", "", { track: false });
    }
    const key = frameKey(route);
    const entry = catalog.get(route.id, route.child);
    if (options.track ?? !["home", "center", "knowledge"].includes(route.id)) {
      if (entry) workspace.open(entry.key);
    }
    for (const page of pages.values()) {
      if (page.key !== key && !page.element.hidden) {
        page.element.contentWindow.postMessage({ type: "baige:deactivate", pageId: page.id }, "*");
        page.element.hidden = true;
      }
    }
    state.key = key; state.id = route.id; state.child = route.child;
    let page = pages.get(key);
    if (!page) {
      const element = document.createElement("iframe");
      element.className = "page-frame"; element.title = entry?.name || findNavItem(route.id).label;
      const file = route.id === "smart-tools" ? "pages/tool.html" : findNavItem(route.id).file;
      element.src = `${file}${route.child ? `#${encodeURIComponent(route.child)}` : ""}`;
      page = { key, id: route.id, child: route.child, entry, element, ready: false };
      pages.set(key, page); host.append(element);
    }
    page.focusSearch = options.focusSearch === true;
    page.reset ||= options.newConversation === true;
    page.element.hidden = false;
    document.title = `${entry?.name || findNavItem(route.id).label} · 百舸数智平台`;
    renderNavigation(); activate(page);
    const hash = `#${route.id}${route.child ? `/${encodeURIComponent(route.child)}` : ""}`;
    if (!options.fromHistory && location.hash !== hash) location.hash = hash;
  }
  function pin(key) {
    workspace.togglePin(key); renderNavigation(); activate(pages.get(state.key));
    if (!workspace.persistent) notify("浏览器无法保存固定设置，当前固定仅在本次打开有效。");
  }
  window.addEventListener("message", event => {
    const message = event.data;
    if (!message || typeof message !== "object") return;
    // Local files have opaque origins: verify the exact mounted child window.
    const page = [...pages.values()].find(page => event.source === page.element.contentWindow && message.pageId === page.id);
    if (!page) return;
    if (message.type === "baige:ready") { page.ready = true; activate(page); }
    else if (page.key === state.key && message.type === "baige:navigate") {
      setPage(message.id, message.child ?? "", { track: true, focusSearch: message.focusSearch === true, newConversation: message.newConversation === true });
    } else if (page.key === state.key && message.type === "baige:pin" && page.entry) pin(page.key);
  });
  nav.addEventListener("click", event => {
    if (event.target.closest("[data-new-conversation]")) return setPage("home", "", { track: false, newConversation: true });
    const button = event.target.closest("[data-main-nav]");
    if (button) setPage(button.dataset.mainNav, "", { track: false });
  });
  list.addEventListener("click", event => {
    const button = event.target.closest("[data-workspace-pin]");
    if (button) {
      const key = button.dataset.workspacePin; pin(key);
      [...list.querySelectorAll("[data-workspace-pin]")].find(item => item.dataset.workspacePin === key)?.focus({ preventScroll: true });
      return;
    }
    const open = event.target.closest("[data-workspace-open]");
    const entry = open && catalog.getByKey(open.dataset.workspaceOpen);
    if (entry) setPage(entry.id, entry.child, { track: true });
    if (event.target.closest("[data-add-workspace]")) setPage("center", "tools", { track: false });
  });
  document.querySelector("#addWorkspaceFunction").innerHTML = icon("plus");
  document.querySelector("#addWorkspaceFunction").addEventListener("click", () => setPage("center", "", { track: false }));
  document.querySelector("#collapseButton").innerHTML = icon("panel");
  document.querySelector("#collapseButton").addEventListener("click", () => document.querySelector(".app-shell").classList.toggle("sidebar-collapsed"));
  document.querySelector(".brand").addEventListener("click", event => { event.preventDefault(); setPage("home", "", { track: false }); });
  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault(); setPage("center", "", { track: false, focusSearch: true });
    }
  });
  function readRoute() {
    try {
      const [id, ...parts] = location.hash.slice(1).split("/");
      return normalize(id, decodeURIComponent(parts.join("/"))) || { id: "home", child: "" };
    } catch { return { id: "home", child: "" }; }
  }
  window.addEventListener("hashchange", () => {
    const route = readRoute();
    if (frameKey(route) !== state.key || route.child !== state.child) setPage(route.id, route.child, { fromHistory: true });
  });
  const route = readRoute();
  setPage(route.id, route.child, { fromHistory: true });
})();
