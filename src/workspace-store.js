(() => {
  "use strict";
  const storageKey = "baige.workspace.pins.v1";
  function create(options = {}) {
    const catalog = window.BaigeCatalog;
    const policy = window.BaigePermissions;
    let storage = options.storage;
    if (!("storage" in options)) {
      try { storage = window.localStorage; } catch { storage = null; }
    }
    let persistent = Boolean(storage);
    const allowed = key => {
      const entry = catalog.getByKey(key);
      return Boolean(entry && policy.canOpen(entry.id, entry.child));
    };
    let pinned = [];
    let raw;
    try { raw = storage?.getItem(storageKey); }
    catch { persistent = false; }
    try {
      const parsed = JSON.parse(raw || "[]");
      if (Array.isArray(parsed)) pinned = [...new Set(parsed.filter(key => typeof key === "string" && allowed(key)))];
    } catch { /* A malformed saved value is an empty workspace, not a startup error. */ }
    let opened = [...pinned];
    const persist = () => {
      try {
        if (!storage) throw new Error("Storage unavailable");
        storage.setItem(storageKey, JSON.stringify(pinned));
      } catch { persistent = false; }
    };
    return Object.freeze({
      get persistent() { return persistent; },
      items() {
        return [...pinned, ...opened.filter(key => !pinned.includes(key))]
          .filter(allowed).map(key => catalog.getByKey(key));
      },
      isPinned: key => pinned.includes(key) && allowed(key),
      open(key) {
        if (!allowed(key)) return false;
        if (!opened.includes(key)) opened.push(key);
        return true;
      },
      togglePin(key) {
        if (!allowed(key)) return false;
        if (!opened.includes(key)) opened.push(key);
        pinned = pinned.includes(key) ? pinned.filter(item => item !== key) : [...pinned, key];
        persist();
        return pinned.includes(key);
      },
    });
  }
  window.BaigeWorkspace = Object.freeze({ create });
})();
