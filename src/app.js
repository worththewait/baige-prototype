(() => {
  "use strict";
  const { navigation, tools, findNavItem } = window.BaigeData;
  const { icon, escapeHtml } = window.BaigeUI;
  const navRoot = document.querySelector("#navigation");
  const host = document.querySelector("#pageHost");
  const shell = document.querySelector(".app-shell");
  const state = { activeId: "home", activeChild: "", expanded: new Set() };
  // Keep each document mounted so its inputs and tool tabs survive menu changes.
  const pages = new Map();

  function renderNavigation() {
    navRoot.innerHTML = navigation.map((item, index) => {
      const active = state.activeId === item.id;
      const expanded = state.expanded.has(item.id);
      return `${index === 7 ? '<div class="nav-section-label">工具与平台</div>' : ""}<div class="nav-group">
        <button class="nav-item ${active ? "is-active" : ""}" data-nav="${item.id}" title="${item.label}" ${item.children ? `aria-expanded="${expanded}" aria-controls="sub-${item.id}"` : ""} ${active && !state.activeChild ? 'aria-current="page"' : ""}>
        ${icon(item.icon)}<span class="nav-label">${item.label}</span>${item.children ? `<span class="nav-chevron ${expanded ? "is-open" : ""}">${icon("chevron")}</span>` : ""}</button>
        ${item.children ? `<div class="subnav" id="sub-${item.id}" ${expanded ? "" : "hidden"}>${item.children.map((child) => `<button class="subnav-item ${active && state.activeChild === child ? "is-active" : ""}" data-parent="${item.id}" data-child="${escapeHtml(child)}">${child}</button>`).join("")}</div>` : ""}</div>`;
    }).join("");
  }

  function normalizeRoute(id, child = "") {
    const item = findNavItem(id);
    if (!item) return null;
    const allowed = id === "smart-tools" ? tools.some((tool) => tool.name === child) : item.children?.includes(child);
    return { id, child: typeof child === "string" && allowed ? child : "" };
  }

  function activateFrame(page) {
    if (!page.ready) return;
    page.element.contentWindow.postMessage({
      type: "baige:activate", pageId: state.activeId,
      child: state.activeChild, focusSearch: page.focusSearch,
    }, "*");
    page.focusSearch = false;
  }

  function setPage(id, child = "", { fromHistory = false, focusSearch = false } = {}) {
    const route = normalizeRoute(id, child);
    if (!route) return;
    const item = findNavItem(route.id);
    for (const [key, page] of pages) {
      if (key !== route.id && !page.element.hidden) {
        page.element.contentWindow.postMessage({ type: "baige:deactivate", pageId: key }, "*");
        page.element.hidden = true;
      }
    }
    state.activeId = route.id;
    state.activeChild = route.child;
    if (item.children) state.expanded.add(item.id);
    let page = pages.get(item.id);
    if (!page) {
      const frame = document.createElement("iframe");
      frame.className = "page-frame";
      frame.title = item.label;
      frame.src = `${item.file}${route.child ? `#${encodeURIComponent(route.child)}` : ""}`;
      page = { element: frame, ready: false, focusSearch: false };
      pages.set(item.id, page);
      host.append(frame);
    }
    page.focusSearch ||= focusSearch;
    page.element.hidden = false;
    document.title = `${route.child || item.label} · 百舸数智平台`;
    renderNavigation();
    activateFrame(page);
    const hash = `#${route.id}${route.child ? `/${encodeURIComponent(route.child)}` : ""}`;
    if (!fromHistory && location.hash !== hash) location.hash = hash;
  }

  // file:// documents have opaque origins. Accept messages only from the exact
  // child window registered for a known route, and validate every route value.
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (!message || typeof message !== "object") return;
    const page = pages.get(message.pageId);
    if (!page || event.source !== page.element.contentWindow) return;
    if (message.type === "baige:ready") {
      page.ready = true;
      if (message.pageId === state.activeId) activateFrame(page);
    } else if (message.type === "baige:navigate" && message.pageId === state.activeId) {
      setPage(message.id, message.child, { focusSearch: message.focusSearch === true });
    }
  });

  navRoot.addEventListener("click", (event) => {
    const child = event.target.closest("[data-child]");
    if (child) return setPage(child.dataset.parent, child.dataset.child);
    const button = event.target.closest("[data-nav]");
    if (!button) return;
    const item = findNavItem(button.dataset.nav);
    if (item.children) {
      shell.classList.remove("sidebar-collapsed");
      if (state.activeId !== item.id) return setPage(item.id);
      if (state.expanded.has(item.id)) state.expanded.delete(item.id);
      else state.expanded.add(item.id);
      renderNavigation();
    } else setPage(item.id);
  });
  document.querySelector("#collapseButton").innerHTML = icon("panel");
  document.querySelector("#collapseButton").addEventListener("click", () => {
    shell.classList.toggle("sidebar-collapsed");
  });
  document.querySelector(".brand").addEventListener("click", (event) => {
    event.preventDefault(); setPage("home");
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault(); setPage("smart-tools", "", { focusSearch: true });
    }
  });
  function readRoute() {
    try {
      const [id, ...parts] = location.hash.slice(1).split("/");
      return normalizeRoute(id, decodeURIComponent(parts.join("/"))) || { id: "home", child: "" };
    } catch { return { id: "home", child: "" }; }
  }
  window.addEventListener("hashchange", () => {
    const route = readRoute();
    if (route.id !== state.activeId || route.child !== state.activeChild) setPage(route.id, route.child, { fromHistory: true });
  });
  const route = readRoute();
  setPage(route.id, route.child, { fromHistory: true });
})();
