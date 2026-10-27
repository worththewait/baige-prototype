(() => {
  "use strict";
  const pageId = document.body.dataset.page;
  const embedded = window.parent !== window;
  const { findNavItem, tools } = window.BaigeData;
  let activate = () => {};
  let deactivate = () => {};
  let reset = () => {};

  function validChild(id, child) {
    if (typeof child !== "string") return "";
    if (id === "center") return ["knowledge", "tools"].includes(child) ? child : "";
    const allowed = id === "smart-tools" ? tools.some((tool) => tool.name === child) : findNavItem(id)?.children?.includes(child);
    return allowed ? child : "";
  }
  function readChild() {
    try { return validChild(pageId, decodeURIComponent(location.hash.slice(1))); }
    catch { return ""; }
  }
  function show(child, focusSearch = false) {
    child = validChild(pageId, child);
    document.title = `${child || findNavItem(pageId).label} · 百舸数智平台`;
    activate({ child, focusSearch });
  }

  function navigate(id, child = "", { focusSearch = false, newConversation = false } = {}) {
    if (!findNavItem(id)) return;
    child = validChild(id, child);
    // Tool-tab closing needs synchronous activation of its neighbouring tab.
    if (embedded) {
      window.parent.postMessage({ type: "baige:navigate", pageId, id, child, focusSearch, newConversation }, "*");
    } else if (id === pageId) {
      show(child, focusSearch);
      const hash = child ? `#${encodeURIComponent(child)}` : "";
      if (location.hash !== hash) location.hash = hash;
    } else {
      location.href = `../index.html#${id}${child ? `/${encodeURIComponent(child)}` : ""}`;
    }
  }

  window.addEventListener("message", (event) => {
    if (!embedded || event.source !== window.parent) return;
    const message = event.data;
    if (!message || message.pageId !== pageId) return;
    if (message.type === "baige:activate") show(message.child, message.focusSearch === true);
    else if (message.type === "baige:deactivate") deactivate();
    else if (message.type === "baige:reset") reset();
    else if (message.type === "baige:workspace" && !["home", "center"].includes(pageId)) {
      const header = document.querySelector(".page-header");
      if (!header) return;
      let button = header.querySelector("[data-pin-current]");
      if (!button && message.available) {
        button = document.createElement("button");
        button.type = "button"; button.className = "secondary-button page-pin-action";
        button.dataset.pinCurrent = "";
        button.addEventListener("click", () => window.parent.postMessage({ type: "baige:pin", pageId }, "*"));
        header.append(button);
      }
      if (button) {
        button.hidden = !message.available;
        button.setAttribute("aria-pressed", String(message.pinned === true));
        button.innerHTML = `${window.BaigeUI.icon("pin")}<span>${message.pinned ? "已固定" : "固定到工作区"}</span>`;
        button.title = message.pinned ? "取消固定" : "下次打开时保留该功能入口";
      }
    }
  });
  window.addEventListener("hashchange", () => { if (!embedded) show(readChild()); });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-route], [data-shortcut]");
    if (button) navigate(button.dataset.route || button.dataset.shortcut, button.dataset.child || "");
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault(); navigate("center", "", { focusSearch: true });
    }
  });
  window.BaigeUI.hydrate();
  window.BaigePage = Object.freeze({
    pageId, navigate,
    onDeactivate(callback) { deactivate = callback; },
    onReset(callback) { reset = callback; },
    onActivate(callback) {
      activate = callback;
      show(readChild());
      if (embedded) window.parent.postMessage({ type: "baige:ready", pageId }, "*");
    },
  });
})();
