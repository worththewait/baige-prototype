(() => {
  "use strict";
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  // One outline icon vocabulary shared by navigation, tools and controls.
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10H3Z M9 20v-7h6v7"/>',
    chat: '<path d="M20 4H4v13h4v4l5-4h7Z M8 9h8 M8 12h5"/>',
    book: '<path d="M12 5v15 M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1Z"/>',
    pen: '<path d="m14 5 5 5 M4 20l5-1L21 7l-5-5L4 14Z M3 22h18"/>',
    file: '<path d="M5 2h9l5 5v15H5Z M14 2v6h5 M9 12h6 M9 16h6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    chart: '<path d="M4 3v17h17 M8 15v-5 M13 15V6 M18 15v-7"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
    layers: '<path d="m2 7 10-5 10 5-10 5Z M2 12l10 5 10-5 M2 17l10 5 10-5"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5 M4 12c0 4 16 4 16 0"/>',
    code: '<path d="m7 6-5 6 5 6 M17 6l5 6-5 6 M14 3l-4 18"/>',
    server: '<rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/><path d="M6 6h1 M6 17h1 M11 6h7 M11 17h7"/>',
    translate: '<path d="M3 5h12 M9 2v3 M6 5c0 5 4 8 8 10 M12 5c0 5-4 8-9 10 M14 21l4-10 4 10 M15 18h6"/>',
    scan: '<path d="M8 3H3v5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M7 8h10 M7 12h10 M7 16h7"/>',
    check: '<path d="m4 12 5 5L20 6 M3 22h18"/>',
    slides: '<rect x="3" y="3" width="18" height="13" rx="1"/><path d="M12 16v5 M7 22l5-3 5 3 M7 8h10 M7 11h5"/>',
    branch: '<rect x="3" y="9" width="6" height="6" rx="1"/><path d="M9 12h4 M13 5v14 M13 5h4 M13 19h4"/><rect x="17" y="2" width="5" height="6" rx="1"/><rect x="17" y="16" width="5" height="6" rx="1"/>',
    standard: '<path d="M5 2h14v20H5Z M8 7h8 M8 11h8 m0 5-3 3-2-2"/>',
    arrow: '<path d="M4 12h15 m-6-6 6 6-6 6"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    menu: '<path d="M4 6h16 M4 12h16 M4 18h16"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M9 4v16"/>',
    close: '<path d="m6 6 12 12 M18 6 6 18"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    back: '<path d="M20 12H4 m6-6-6 6 6 6"/>',
  };
  const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
  function hydrate(root = document) {
    root.querySelectorAll("[data-icon]").forEach((node) => {
      node.outerHTML = icon(node.dataset.icon);
    });
  }
  window.BaigeUI = Object.freeze({ icon, escapeHtml, hydrate });
})();
