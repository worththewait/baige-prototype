(() => {
  "use strict";
  const { knowledgeLibraries, knowledgeScopes } = window.BaigeData;
  const { icon, escapeHtml: esc } = window.BaigeUI;
  const policy = window.BaigePermissions;
  const page = window.BaigePage;
  const data = window.BaigeConversationData;
  const store = window.BaigeConversationStore.create();
  const form = document.querySelector("#conversationForm");
  const prompt = document.querySelector("#conversationPrompt");
  const log = document.querySelector("#conversationLog");
  const dialog = document.querySelector("#knowledgeDialog");
  const workspace = document.querySelector("#conversationWorkspace");
  const history = document.querySelector("#conversationHistory");
  const historyToggle = document.querySelector("#toggleHistory");
  const state = { draft: new Set(), scope: "全部", query: "", batch: 0, historyQuery: "" };
  const current = () => store.current;
  const reader = window.BaigeSourceReader.create({ onOpen() { if (window.innerWidth < 1372) setHistory(false); }, onChange() { store.save(); renderStorageNote(); } });
  let restoringLog = false, scrollTimer;
  const batches = [
    [{ label: "梳理技术资料", prompt: "帮我梳理技术资料中的关键内容", icon: "file" }, { label: "搭建研究提纲", prompt: "如何组织一份研究报告的提纲？", icon: "branch" }, { label: "润色专业表达", prompt: "帮我润色文字，让表达更清晰", icon: "pen" }],
    [{ label: "提炼材料观点", prompt: "帮我总结这段材料的核心观点", icon: "file" }, { label: "比较技术方案", prompt: "如何比较两种技术方案？", icon: "chart" }, { label: "整理文献重点", prompt: "帮我列出文献阅读的关注重点", icon: "book" }],
  ];
  const availableLibraries = () => knowledgeLibraries.filter(library => policy.canUseKnowledge(library.id));
  function renderStorageNote() {
    document.querySelector("#historyStorageNote").textContent = store.persistent ? "会话保存在当前浏览器" : "浏览器无法保存，暂仅保留本次会话";
  }
  function saveCurrent() {
    current().prompt = prompt.value;
    if (!restoringLog && !log.hidden) current().chatScroll = log.scrollTop;
    reader.flush(); store.save(); renderStorageNote();
  }
  function setHistory(open, { focus = false } = {}) {
    if (open && reader.opened && window.innerWidth < 1372) reader.hide({ focus: false });
    history.hidden = !open;
    workspace.classList.toggle("has-history", open);
    historyToggle.setAttribute("aria-expanded", String(open));
    historyToggle.classList.toggle("is-active", open);
    if (focus) (open ? document.querySelector("#historySearch") : historyToggle).focus({ preventScroll: true });
  }
  function renderHistory() {
    const query = state.historyQuery.trim().toLocaleLowerCase();
    const sessions = store.list().filter(item => !query || `${item.title} ${item.messages.map(message => message.question).join(" ")}`.toLocaleLowerCase().includes(query));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const week = new Date(today); week.setDate(week.getDate() - 7);
    const groups = new Map();
    sessions.forEach(item => {
      const label = item.updatedAt >= +today ? "今天" : item.updatedAt >= +yesterday ? "昨天" : item.updatedAt >= +week ? "近 7 天" : "更早";
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(item);
    });
    document.querySelector("#historyList").innerHTML = [...groups].map(([label, items]) => `<section class="history-group"><h3>${label}</h3>${items.map(item => `<button type="button" class="history-item ${current().id === item.id ? "is-active" : ""}" data-conversation="${esc(item.id)}" ${current().id === item.id ? 'aria-current="true"' : ""} title="${esc(item.title)}"><span class="history-item-title">${icon("chat")}<span>${esc(item.title)}</span></span><span class="history-item-meta"><span>${item.messages.some(message => message.libraries.length) ? "知识问答" : "通用问答"}</span><time datetime="${new Date(item.updatedAt).toISOString()}">${new Date(item.updatedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })}</time></span></button>`).join("")}</section>`).join("") || `<div class="history-empty">${icon(query ? "search" : "history")}<h3>${query ? "没有找到相关会话" : "还没有历史会话"}</h3><p>${query ? "试试会话名称或提问中的关键词。" : "发送第一个问题后，会自动记录在这里。"}</p></div>`;
    history.querySelector("[data-open-example]").classList.toggle("is-active", Boolean(current().example));
    renderStorageNote();
  }
  function renderSuggestions() {
    document.querySelector("#suggestedQuestions").innerHTML = batches[state.batch].map(item => `<button class="suggested-question" type="button" data-question="${esc(item.prompt)}" title="${esc(item.prompt)}" aria-label="${esc(item.prompt)}">${icon(item.icon)}<span>${esc(item.label)}</span></button>`).join("");
  }
  function renderModes() {
    const session = current();
    session.selected = session.selected.filter(id => policy.canUseKnowledge(id));
    session.knowledge = Boolean(session.knowledge && session.selected.length);
    document.querySelector("#knowledgeModeHint").textContent = session.knowledge ? `已附加 ${session.selected.length} 个知识库，可随时更换资料范围。` : "选择“知识问答”，将知识库加入本次对话。";
    ["generalMode", "knowledgeMode"].forEach(id => {
      const active = id === "knowledgeMode" ? session.knowledge : !session.knowledge;
      const button = document.getElementById(id);
      button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active));
    });
    const root = document.querySelector("#selectedKnowledge");
    root.hidden = !session.knowledge;
    root.innerHTML = `<span class="knowledge-range-label">知识范围</span>${session.selected.map(id => {
      const library = knowledgeLibraries.find(item => item.id === id);
      return `<span class="knowledge-chip">${icon("book")}<span>${esc(library.name)}</span><button type="button" data-remove-knowledge="${esc(id)}" aria-label="移除${esc(library.name)}">${icon("close")}</button></span>`;
    }).join("")}<button class="text-button" type="button" data-change-knowledge>更换</button>`;
  }
  function renderSelectionCount() {
    document.querySelector("#knowledgeSelectionCount").textContent = `已选 ${state.draft.size} 个知识库`;
    document.querySelector("#confirmKnowledge").disabled = state.draft.size === 0;
  }
  function renderLibraryChoices() {
    document.querySelector("#knowledgeCategories").innerHTML = knowledgeScopes.map((scope, index) => `<button id="knowledge-scope-${index}" type="button" role="tab" tabindex="${scope === state.scope ? 0 : -1}" aria-controls="knowledgeChoices" aria-selected="${scope === state.scope}" data-knowledge-scope="${esc(scope)}">${scope === "全部" ? "全部" : scope.replace("知识库", "")}</button>`).join("");
    const libraries = availableLibraries().filter(library => (state.scope === "全部" || library.scope === state.scope) && library.name.toLowerCase().includes(state.query.toLowerCase().trim()));
    document.querySelector("#knowledgeChoices").setAttribute("aria-labelledby", `knowledge-scope-${knowledgeScopes.indexOf(state.scope)}`);
    document.querySelector("#knowledgeChoices").innerHTML = libraries.map(library => `<label class="knowledge-choice"><input type="checkbox" value="${esc(library.id)}" ${state.draft.has(library.id) ? "checked" : ""} />${icon("folder")}<span><strong>${esc(library.name)}</strong><small>${esc(library.description)}</small></span><span class="knowledge-choice-scope">${library.scope.replace("知识库", "")}</span></label>`).join("") || `<div class="knowledge-choice-empty"><h3>${availableLibraries().length ? "没有匹配的知识库" : "暂无可用的知识库"}</h3><p>${availableLibraries().length ? "换个名称试试，或切换知识范围。" : "获得知识库访问权限后，可在这里选择资料。"}</p>${!policy.canOpen("knowledge") ? '<button class="text-button" type="button" data-route="center">去功能中心申请</button>' : ""}</div>`;
    renderSelectionCount();
  }
  function chooseKnowledge() {
    state.draft = new Set(current().selected.filter(id => policy.canUseKnowledge(id)));
    state.query = ""; document.querySelector("#knowledgeSearch").value = "";
    renderLibraryChoices(); dialog.showModal(); document.querySelector("#knowledgeSearch").focus();
  }
  function inlineCitation(id) {
    const citation = data.citation(id), doc = citation && data.document(citation.documentId);
    return citation && doc ? `<button class="inline-citation" type="button" data-citation="${esc(id)}" aria-label="查看引用 ${citation.number}：${esc(doc.title)}，第 ${citation.page} 页" title="${esc(doc.title)} · 第 ${citation.page} 页">${citation.number}</button>` : "";
  }
  function renderAnswer(message) {
    if (!message.example || !Array.isArray(message.paragraphs)) return `<h2>正在集成</h2><p>问答能力接入后，回答将在这里连续展示。</p>${message.libraries.length ? `<small>本次选择：${esc(message.libraries.join("、"))}（示例知识库，尚未检索）</small>` : ""}`;
    const citations = (message.citationIds || []).map(id => data.citation(id)).filter(Boolean);
    return `<div class="answer-identity"><span>百舸</span><span class="answer-example-badge">示例回答</span></div>${message.paragraphs.map(paragraph => `<section class="answer-paragraph"><h3>${esc(paragraph.title)}</h3><p>${esc(paragraph.text)}${inlineCitation(paragraph.citationId)}</p></section>`).join("")}<section class="answer-sources" aria-label="本次回答参考资料"><div class="answer-sources-heading"><h4>参考资料 <span>${citations.length}</span></h4><span>点击核对原文</span></div><div class="answer-source-list">${citations.map(citation => {
      const doc = data.document(citation.documentId);
      return doc ? `<button class="answer-source" type="button" data-citation="${esc(citation.id)}" aria-label="打开${esc(doc.title)}，第 ${citation.page} 页"><span class="answer-source-number">${citation.number}</span><span class="answer-source-copy"><strong>${esc(doc.title)}</strong><span>${esc(doc.libraryName)} · 第 ${citation.page} 页</span></span>${icon("arrow")}</button>` : "";
    }).join("")}</div></section>`;
  }
  function renderMessages({ end = false } = {}) {
    const session = current(), hasMessages = Boolean(session.messages.length);
    document.querySelector(".conversation-page").classList.toggle("has-messages", hasMessages);
    log.hidden = !hasMessages;
    document.querySelector("#conversationWelcome").hidden = hasMessages;
    document.querySelector("#welcomeExample").hidden = hasMessages;
    document.querySelector("#conversationSubtitle").hidden = hasMessages;
    document.querySelector("#conversationTitle").textContent = hasMessages ? "百舸问答" : "今天，有什么可以帮你？";
    document.querySelector("#activeConversationLabel").textContent = hasMessages ? session.title : "百舸问答";
    log.innerHTML = `${session.example ? '<div class="conversation-demo-note">这是一个交互示例，可点击引用查看示例原文。</div>' : ""}${session.messages.map(message => `<article class="conversation-turn"><div class="user-message">${esc(message.question).replace(/\n/g, "<br />")}${message.attachments.length ? `<small>${icon("attach")}${esc(message.attachments.join("、"))}</small>` : ""}</div><div class="assistant-message"><span class="assistant-mark">${icon("chat")}</span><div class="assistant-body">${renderAnswer(message)}</div></div></article>`).join("")}`;
    reader.markActive();
    restoringLog = true;
    requestAnimationFrame(() => { log.scrollTop = end ? log.scrollHeight : (session.chatScroll || 0); restoringLog = false; });
    document.querySelector("#conversationFeedback").textContent = session.example ? "示例内容仅展示交互方式，未连接知识检索服务。" : hasMessages ? "原型演示：当前内容未发送至任何服务。" : "内容由人工智能生成，请结合实际资料核实。";
  }
  function renderAttachments() {
    const root = document.querySelector("#conversationAttachments");
    root.hidden = !current().attachments.length;
    root.innerHTML = current().attachments.map((name, index) => `<span>${icon("attach")}<span>${esc(name)}</span><button type="button" data-remove-attachment="${index}" aria-label="移除附件${esc(name)}">${icon("close")}</button></span>`).join("");
  }
  function updateSend() { document.querySelector("#sendQuestion").disabled = !policy.canOpen("home") || !prompt.value.trim(); }
  function loadCurrent() {
    if (dialog.open) dialog.close();
    state.draft = new Set(); state.scope = "全部"; state.query = "";
    prompt.value = current().prompt; document.querySelector("#attachmentInput").value = "";
    reader.bind(current()); renderModes(); renderAttachments(); renderMessages(); renderHistory(); updateSend();
  }
  function resetConversation() {
    saveCurrent(); store.fresh(); setHistory(false); loadCurrent(); prompt.focus();
  }
  historyToggle.addEventListener("click", () => setHistory(history.hidden, { focus: true }));
  document.querySelector("#closeHistory").addEventListener("click", () => setHistory(false, { focus: true }));
  document.querySelector("#newConversation").addEventListener("click", resetConversation);
  document.querySelector("#historySearch").addEventListener("input", event => { state.historyQuery = event.target.value; renderHistory(); });
  document.querySelector("#historyList").addEventListener("click", event => {
    const button = event.target.closest("[data-conversation]");
    if (!button || current().id === button.dataset.conversation) return;
    saveCurrent(); if (store.open(button.dataset.conversation)) loadCurrent();
  });
  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-example]")) { saveCurrent(); store.example(); loadCurrent(); }
    const citation = event.target.closest("[data-citation]");
    if (citation && !reader.show(citation.dataset.citation, citation)) document.querySelector("#conversationFeedback").textContent = "暂时无法打开这条引用，请选择其他资料。";
  });
  document.querySelector("#refreshQuestions").addEventListener("click", () => { state.batch = (state.batch + 1) % batches.length; renderSuggestions(); });
  document.querySelector("#generalMode").addEventListener("click", () => { current().knowledge = false; renderModes(); saveCurrent(); });
  document.querySelector("#knowledgeMode").addEventListener("click", chooseKnowledge);
  document.querySelector("#selectedKnowledge").addEventListener("click", event => {
    const remove = event.target.closest("[data-remove-knowledge]");
    if (remove) { current().selected = current().selected.filter(id => id !== remove.dataset.removeKnowledge); renderModes(); saveCurrent(); document.querySelector("#knowledgeMode").focus(); }
    if (event.target.closest("[data-change-knowledge]")) chooseKnowledge();
  });
  document.querySelector("#suggestedQuestions").addEventListener("click", event => {
    const button = event.target.closest("[data-question]");
    if (button) { prompt.value = button.dataset.question; updateSend(); saveCurrent(); prompt.focus(); }
  });
  document.querySelector("#knowledgeCategories").addEventListener("click", event => {
    const button = event.target.closest("[data-knowledge-scope]");
    if (button) { state.scope = button.dataset.knowledgeScope; renderLibraryChoices(); document.querySelector(`#knowledge-scope-${knowledgeScopes.indexOf(state.scope)}`).focus(); }
  });
  document.querySelector("#knowledgeCategories").addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); const index = knowledgeScopes.indexOf(state.scope);
    state.scope = knowledgeScopes[event.key === "Home" ? 0 : event.key === "End" ? knowledgeScopes.length - 1 : (index + (event.key === "ArrowLeft" ? -1 : 1) + knowledgeScopes.length) % knowledgeScopes.length];
    renderLibraryChoices(); document.querySelector(`#knowledge-scope-${knowledgeScopes.indexOf(state.scope)}`).focus();
  });
  document.querySelector("#knowledgeChoices").addEventListener("change", event => {
    const input = event.target.closest('input[type="checkbox"]');
    if (!input || !policy.canUseKnowledge(input.value)) return;
    if (input.checked) state.draft.add(input.value); else state.draft.delete(input.value); renderSelectionCount();
  });
  document.querySelector("#knowledgeSearch").addEventListener("input", event => { state.query = event.target.value; renderLibraryChoices(); });
  ["cancelKnowledge", "closeKnowledgeDialog"].forEach(id => document.getElementById(id).addEventListener("click", () => dialog.close()));
  document.querySelector("#confirmKnowledge").addEventListener("click", () => {
    if (!state.draft.size) return;
    current().selected = [...state.draft].filter(id => policy.canUseKnowledge(id)); current().knowledge = Boolean(current().selected.length);
    renderModes(); saveCurrent(); dialog.close(); prompt.focus();
  });
  dialog.addEventListener("click", event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
  document.querySelector("#addAttachment").addEventListener("click", () => document.querySelector("#attachmentInput").click());
  document.querySelector("#attachmentInput").addEventListener("change", event => {
    current().attachments = [...event.target.files].map(file => file.name); renderAttachments(); saveCurrent();
    document.querySelector("#conversationFeedback").textContent = "仅记录附件名称，文件未上传；重新打开后需重新选择文件。";
  });
  document.querySelector("#conversationAttachments").addEventListener("click", event => {
    const button = event.target.closest("[data-remove-attachment]");
    if (button) { current().attachments.splice(Number(button.dataset.removeAttachment), 1); renderAttachments(); saveCurrent(); }
  });
  prompt.addEventListener("input", () => { updateSend(); saveCurrent(); });
  prompt.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); } });
  form.addEventListener("submit", event => {
    event.preventDefault(); const question = prompt.value.trim(); if (!question || !policy.canOpen("home")) return;
    const session = current();
    session.messages.push({ id: `message-${Date.now()}-${session.messages.length}`, question, libraries: session.knowledge ? session.selected.map(id => knowledgeLibraries.find(library => library.id === id)?.name).filter(Boolean) : [], attachments: [...session.attachments] });
    if (session.messages.length === 1) session.title = question.replace(/\s+/g, " ").slice(0, 48);
    session.updatedAt = Date.now(); prompt.value = ""; session.prompt = ""; session.attachments = [];
    document.querySelector("#attachmentInput").value = ""; renderAttachments(); renderMessages({ end: true }); updateSend(); store.save(); renderHistory();
  });
  log.addEventListener("scroll", () => { if (restoringLog) return; current().chatScroll = log.scrollTop; clearTimeout(scrollTimer); scrollTimer = setTimeout(() => store.save(), 200); }, { passive: true });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || dialog.open || reader.expanded) return;
    if (reader.opened) { event.preventDefault(); reader.hide(); }
    else if (!history.hidden) { event.preventDefault(); setHistory(false, { focus: true }); }
  });
  window.addEventListener("resize", () => { if (window.innerWidth < 1372 && reader.opened && !history.hidden) setHistory(false); });
  window.addEventListener("pagehide", saveCurrent);
  page.onReset(resetConversation);
  page.onDeactivate(() => { saveCurrent(); if (dialog.open) dialog.close(); reader.suspend(); });
  renderSuggestions(); loadCurrent();
  page.onActivate(() => { prompt.disabled = !policy.canOpen("home"); renderModes(); reader.refresh(); updateSend(); });
})();
