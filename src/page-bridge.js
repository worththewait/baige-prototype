(() => {
  "use strict";
  const pageId = document.body.dataset.page;
  const embedded = window.parent !== window;
  const { findNavItem, tools } = window.BaigeData;
  let activate = () => {};
  let deactivate = () => {};

  function validChild(id, child) {
    if (typeof child !== "string") return "";
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

  function navigate(id, child = "", { focusSearch = false } = {}) {
    if (!findNavItem(id)) return;
    child = validChild(id, child);
    // Tool-tab closing needs synchronous activation of its neighbouring tab.
    if (id === pageId) show(child, focusSearch);
    if (embedded) {
      window.parent.postMessage({ type: "baige:navigate", pageId, id, child, focusSearch }, "*");
    } else if (id === pageId) {
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
  });
  window.addEventListener("hashchange", () => { if (!embedded) show(readChild()); });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-route], [data-shortcut]");
    if (button) navigate(button.dataset.route || button.dataset.shortcut, button.dataset.child || "");
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault(); navigate("smart-tools", "", { focusSearch: true });
    }
  });
  window.BaigeUI.hydrate();
  window.BaigePage = Object.freeze({
    pageId, navigate,
    onDeactivate(callback) { deactivate = callback; },
    onActivate(callback) {
      activate = callback;
      show(readChild());
      if (embedded) window.parent.postMessage({ type: "baige:ready", pageId }, "*");
    },
  });
})();
