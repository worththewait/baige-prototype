(() => {
  "use strict";
  const { icon, escapeHtml } = window.BaigeUI;
  const access = window.BaigeHomeAccess;
  const key = document.body.dataset.page;
  const section = window.BaigeDiscovery.sections[key];
  const title = document.querySelector("#discoverTitle");
  const desc = document.querySelector("#discoverDesc");
  const count = document.querySelector("#discoverCount");
  const tabs = document.querySelector("#discoverTabs");
  const grid = document.querySelector("#discoverGrid");
  let activeGroup = section.groups[0].id;

  title.textContent = section.title;
  desc.textContent = section.desc;

  const group = () => section.groups.find((item) => item.id === activeGroup) || section.groups[0];
  const stateOf = (item) => access.status(item.route, item.child || "");
  const stateLabel = (state) => ({ granted: "", locked: "需申请", pending: "待审批" })[state];

  function renderTabs() {
    tabs.innerHTML = section.groups.map((item) => `<button type="button" role="tab" data-group="${escapeHtml(item.id)}" aria-selected="${item.id === activeGroup}">${escapeHtml(item.label)}<span class="wb-tab-count">${item.items.length}</span></button>`).join("");  }

  function renderGrid() {
    const items = group().items;
    count.textContent = `${items.length} 项`;
    grid.innerHTML = items.map((item) => {
      const state = stateOf(item);
      const tag = stateLabel(state);
      return `<article class="wb-card" role="button" tabindex="0" data-open-route="${escapeHtml(item.route)}" data-open-child="${escapeHtml(item.child || "")}" aria-label="${escapeHtml(item.name)}，${tag || "打开"}">
        <div class="wb-card-top">
          <span class="wb-card-icon is-${escapeHtml(item.tint)}">${icon(item.icon)}</span>
          ${tag ? `<span class="wb-card-state is-${state}">${tag}</span>` : ""}
        </div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.desc)}</p>
        <div class="wb-card-foot">
          <span class="wb-card-meta">${escapeHtml(item.meta)}</span>
          <span class="wb-card-open">打开${icon("arrow")}</span>
        </div>
      </article>`;
    }).join("");
  }

  function render() {
    renderTabs();
    renderGrid();
  }

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-group]");
    if (!button) return;
    activeGroup = button.dataset.group;
    render();
  });

  function open(card) {
    access.navigate(card.dataset.openRoute, card.dataset.openChild || "", card);
  }

  grid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-open-route]");
    if (card) open(card);
  });
  grid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-open-route]");
    if (!card) return;
    event.preventDefault();
    open(card);
  });

  access.onChange(() => renderGrid());
  render();
  window.BaigePage.onActivate(() => {});
})();
