(() => {
  "use strict";
  const { icon, escapeHtml: esc } = window.BaigeUI;
  const data = window.BaigeConversationData;
  const policy = window.BaigePermissions;
  function create({ onOpen = () => {}, onChange = () => {} } = {}) {
    const panel = document.querySelector("#sourcePanel");
    const reader = document.querySelector("#sourceReader");
    const viewport = document.querySelector("#sourceViewport");
    const paper = document.querySelector("#sourcePaper");
    const dialog = document.querySelector("#expandedSourceDialog");
    const toggle = document.querySelector("#toggleSource");
    let session, opened = false, expanded = false, returnFocus, restoring = false, restoreFrame;
    const currentCitation = () => data.citation(session?.reader?.citationId);
    const currentDocument = () => data.document(currentCitation()?.documentId);
    const positionKey = () => `${currentDocument()?.id}:${session?.reader?.page}:${expanded ? "expanded" : "compact"}`;
    function rememberPosition() {
      if (!session?.reader || restoring) return;
      session.reader.positions ||= {};
      session.reader.positions[positionKey()] = { top: viewport.scrollTop, left: viewport.scrollLeft };
    }
    function sync() {
      panel.hidden = !opened || expanded;
      toggle.hidden = !currentCitation();
      toggle.setAttribute("aria-expanded", String(opened));
      toggle.classList.toggle("is-active", opened);
      document.querySelectorAll("[data-citation]").forEach(button => button.classList.toggle("is-current", opened && button.dataset.citation === currentCitation()?.id));
      document.querySelector("#conversationWorkspace").classList.toggle("has-source", opened && !expanded);
      const button = document.querySelector("#expandSource");
      button.innerHTML = icon(expanded ? "shrink" : "expand");
      button.setAttribute("aria-label", expanded ? "收起展开阅读" : "展开阅读");
      button.title = expanded ? "收起展开阅读" : "展开阅读";
    }
    function restorePosition(locate) {
      cancelAnimationFrame(restoreFrame);
      restoring = true;
      restoreFrame = requestAnimationFrame(() => {
        const target = locate && paper.querySelector("[data-cited-section]");
        const position = session?.reader?.positions?.[positionKey()];
        viewport.scrollTop = target ? Math.max(0, viewport.scrollTop + target.getBoundingClientRect().top - viewport.getBoundingClientRect().top - 22) : (Number(position?.top) || 0);
        viewport.scrollLeft = position?.left || 0;
        restoring = false;
      });
    }
    function render({ locate = false } = {}) {
      const citation = currentCitation(), doc = currentDocument();
      if (!citation || !doc) { opened = false; sync(); return; }
      const view = session.reader;
      view.page = Math.max(1, Math.min(doc.pages.length, Number(view.page) || citation.page));
      view.zoom = Math.max(80, Math.min(150, Number(view.zoom) || 100));
      const allowed = policy.canUseKnowledge(doc.libraryId);
      document.querySelector("#sourceDocumentTitle").textContent = doc.title;
      document.querySelector("#sourceDocumentMeta").textContent = `${doc.libraryName} · 示例文档`;
      document.querySelector("#sourceControls").hidden = !allowed;
      const select = document.querySelector("#sourcePageSelect");
      select.innerHTML = doc.pages.map((_, index) => `<option value="${index + 1}" ${view.page === index + 1 ? "selected" : ""}>${index + 1} / ${doc.pages.length} 页</option>`).join("");
      document.querySelector("#previousSourcePage").disabled = view.page === 1;
      document.querySelector("#nextSourcePage").disabled = view.page === doc.pages.length;
      document.querySelector("#zoomOutSource").disabled = view.zoom <= 80;
      document.querySelector("#zoomInSource").disabled = view.zoom >= 150;
      document.querySelector("#sourceZoomLabel").textContent = `${view.zoom}%`;
      document.querySelector("#sourcePageCount").textContent = allowed ? `第 ${view.page} / ${doc.pages.length} 页` : "暂无访问权限";
      const page = doc.pages[view.page - 1];
      const located = view.page === citation.page && page.sections.some(section => section.id === citation.sectionId && section.text.includes(citation.quote));
      const location = document.querySelector("#sourceLocation");
      location.innerHTML = !allowed ? `${icon("lock")}<span>暂无该资料的访问权限</span>` : located ? `${icon("check")}<span>已定位引用 [${citation.number}] · 第 ${citation.page} 页</span>` : `${icon("file")}<span>${view.page !== citation.page ? `引用位于第 ${citation.page} 页` : "暂未定位到引用段落"}</span><button type="button" id="returnToCitation">返回引用</button>`;
      paper.style.setProperty("--reader-scale", view.zoom / 100);
      paper.classList.toggle("is-unavailable", !allowed);
      paper.innerHTML = allowed ? `<div class="paper-running-header"><span>百舸 · 示例资料</span><span>${String(view.page).padStart(2, "0")}</span></div><h4>${esc(page.title)}</h4>${page.sections.map(section => `<section class="paper-section ${located && section.id === citation.sectionId ? "is-cited" : ""}" ${located && section.id === citation.sectionId ? 'data-cited-section="true"' : ""}><h5>${esc(section.title)}</h5><p>${esc(section.text)}</p>${located && section.id === citation.sectionId ? `<span class="paper-citation-label">引用 [${citation.number}]</span>` : ""}</section>`).join("")}<div class="paper-endnote">本文为交互演示编写，无真实业务文档。</div>` : `<div class="source-denied">${icon("lock")}<h4>暂无该资料权限</h4><p>获得访问权限后，可在这里查看原文。</p><button class="secondary-button" type="button" data-route="center">去功能中心申请权限${icon("arrow")}</button></div>`;
      sync(); restorePosition(locate);
    }
    function collapseExpanded(focus = false) {
      if (!expanded) return;
      rememberPosition(); expanded = false;
      if (dialog.open) dialog.close();
      panel.append(reader); sync(); restorePosition(false);
      if (focus) document.querySelector("#expandSource").focus({ preventScroll: true });
    }
    function hide({ focus = true } = {}) {
      rememberPosition(); collapseExpanded(); opened = false; sync(); onChange();
      if (focus) (returnFocus?.isConnected ? returnFocus : toggle).focus({ preventScroll: true });
    }
    function show(citationId, opener) {
      const citation = data.citation(citationId);
      if (!session || !citation || !data.document(citation.documentId)) return false;
      rememberPosition();
      const old = session.reader;
      session.reader = { citationId, page: citation.page, zoom: old?.zoom || 100, positions: old?.positions || {} };
      returnFocus = opener || toggle; opened = true; onOpen(); render({ locate: true }); onChange();
      if (opener?.matches(":focus-visible")) requestAnimationFrame(() => { if (opened) viewport.focus({ preventScroll: true }); });
      return true;
    }
    function changePage(page) {
      if (!session?.reader) return;
      rememberPosition(); session.reader.page = page; render(); onChange();
    }
    document.querySelector("#closeSource").addEventListener("click", () => hide());
    toggle.addEventListener("click", () => {
      if (opened) hide({ focus: false });
      else if (currentCitation()) { opened = true; returnFocus = toggle; onOpen(); render(); }
    });
    document.querySelector("#expandSource").addEventListener("click", () => {
      if (expanded) { collapseExpanded(true); return; }
      rememberPosition(); expanded = true; dialog.append(reader); dialog.showModal(); sync(); restorePosition(session.reader.page === currentCitation().page);
    });
    dialog.addEventListener("cancel", event => { event.preventDefault(); collapseExpanded(true); });
    dialog.addEventListener("click", event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) collapseExpanded(true); } });
    document.querySelector("#sourcePageSelect").addEventListener("change", event => changePage(Number(event.target.value)));
    document.querySelector("#previousSourcePage").addEventListener("click", () => changePage(session.reader.page - 1));
    document.querySelector("#nextSourcePage").addEventListener("click", () => changePage(session.reader.page + 1));
    document.querySelector("#sourceLocation").addEventListener("click", event => {
      if (event.target.closest("#returnToCitation")) { session.reader.page = currentCitation().page; render({ locate: true }); onChange(); }
    });
    ["zoomOutSource", "zoomInSource"].forEach(id => document.getElementById(id).addEventListener("click", () => {
      rememberPosition(); session.reader.zoom = Math.max(80, Math.min(150, session.reader.zoom + (id === "zoomInSource" ? 10 : -10))); render(); onChange();
    }));
    let saveTimer;
    viewport.addEventListener("scroll", () => { rememberPosition(); clearTimeout(saveTimer); saveTimer = setTimeout(onChange, 200); }, { passive: true });
    return {
      get opened() { return opened; }, get expanded() { return expanded; }, show, hide,
      bind(next) { rememberPosition(); collapseExpanded(); cancelAnimationFrame(restoreFrame); restoring = false; session = next; opened = false; sync(); },
      flush() { rememberPosition(); clearTimeout(saveTimer); },
      suspend() { collapseExpanded(); },
      markActive() { sync(); },
      refresh() { if (opened) render(); }
    };
  }
  window.BaigeSourceReader = Object.freeze({ create });
})();
