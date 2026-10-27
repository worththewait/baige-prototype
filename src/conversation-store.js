/* Browser-local conversation state. No messages or attachments are sent to a service. */
(() => {
  "use strict";
  const STORAGE_KEY = "baige.conversations.v1";
  function blank() {
    return { id: window.crypto?.randomUUID?.() || `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`, title: "新对话", createdAt: Date.now(), updatedAt: Date.now(), knowledge: false, selected: [], prompt: "", attachments: [], messages: [], chatScroll: 0, reader: null };
  }
  function validSession(value) {
    return value && typeof value.id === "string" && typeof value.title === "string" && Number.isFinite(value.updatedAt) && Array.isArray(value.messages) && value.messages.every(message => message && typeof message.question === "string" && Array.isArray(message.libraries) && message.libraries.every(name => typeof name === "string") && Array.isArray(message.attachments) && message.attachments.every(name => typeof name === "string")) && Array.isArray(value.selected) && value.selected.every(id => typeof id === "string") && typeof value.prompt === "string" && Array.isArray(value.attachments) && value.attachments.every(name => typeof name === "string");
  }
  function normalizeSession(value) {
    const source = value.reader;
    const reader = source && typeof source === "object" && window.BaigeConversationData.citation(source.citationId) ? {
      citationId: source.citationId, page: Number(source.page) || 1, zoom: Number(source.zoom) || 100,
      positions: source.positions && typeof source.positions === "object" && !Array.isArray(source.positions) ? source.positions : {}
    } : null;
    return { ...blank(), id: value.id, title: value.title, createdAt: Number(value.createdAt) || value.updatedAt,
      updatedAt: value.updatedAt, example: value.id === "citation-example-v1", knowledge: value.knowledge === true,
      selected: value.selected, prompt: value.prompt, attachments: value.attachments,
      chatScroll: Math.max(0, Number(value.chatScroll) || 0), reader,
      messages: value.messages.map(message => message.example && message.id === "example-answer" && value.id === "citation-example-v1" ? window.BaigeConversationData.exampleSession().messages[0] : { id: String(message.id || ""), question: message.question, libraries: message.libraries, attachments: message.attachments }) };
  }
  function create() {
    let sessions = [], current = blank(), persistent = true;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.version === 1) {
        sessions = Array.isArray(saved.sessions) ? saved.sessions.filter(validSession).map(normalizeSession) : [];
        current = sessions.find(item => item.id === saved.activeId) || (validSession(saved.draft) ? normalizeSession(saved.draft) : blank());
      }
    } catch { persistent = false; }
    function save() {
      if (current.messages.length && !sessions.some(item => item.id === current.id)) sessions.push(current);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sessions, activeId: current.id, draft: current.messages.length ? null : current })); persistent = true; }
      catch { persistent = false; }
    }
    return {
      get current() { return current; }, get persistent() { return persistent; },
      list() { return sessions.filter(item => item.messages.length && !item.example).sort((a, b) => b.updatedAt - a.updatedAt); },
      save,
      fresh() { save(); current = blank(); save(); return current; },
      open(id) { const item = sessions.find(item => item.id === id); if (!item) return null; save(); current = item; save(); return current; },
      example() { save(); current = sessions.find(item => item.id === "citation-example-v1") || window.BaigeConversationData.exampleSession(); save(); return current; }
    };
  }
  window.BaigeConversationStore = Object.freeze({ create });
})();
