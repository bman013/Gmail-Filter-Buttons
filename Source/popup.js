const nameInput = document.getElementById("filterName");
const queryInput = document.getElementById("filterQuery");
const addBtn = document.getElementById("addFilter");
const listEl = document.getElementById("filterList");

const SECTIONS = [
  { group: "custom", title: "Custom filters" },
  { group: "standard", title: "Default filters" },
  { group: "power", title: "Power user filters" }
];

function renderFilterItem(filter, index) {
  const div = document.createElement("div");
  div.className = "filter-item";

  const info = document.createElement("div");
  info.className = "filter-info";
  const nameSpan = document.createElement("div");
  nameSpan.className = "filter-name";
  nameSpan.textContent = filter.name;
  const querySpan = document.createElement("div");
  querySpan.className = "filter-query";
  querySpan.textContent = filter.query;
  info.appendChild(nameSpan);
  info.appendChild(querySpan);
  info.addEventListener("click", () => {
    nameInput.value = filter.name;
    queryInput.value = filter.query;
    nameInput.focus();
  });

  const actions = document.createElement("div");
  actions.className = "filter-actions";

  const toggle = document.createElement("label");
  toggle.className = "toggle";
  toggle.title = filter.enabled ? "Shown in Gmail" : "Hidden in Gmail";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!filter.enabled;
  checkbox.addEventListener("change", () => toggleFilter(index, checkbox.checked));
  toggle.appendChild(checkbox);

  actions.appendChild(toggle);

  if (!filter.builtin) {
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "✕";
    del.title = "Delete custom filter";
    del.addEventListener("click", () => deleteFilter(index));
    actions.appendChild(del);
  }

  div.appendChild(info);
  div.appendChild(actions);
  listEl.appendChild(div);
}

function renderSection(title, items) {
  if (!items.length) return;
  const heading = document.createElement("div");
  heading.className = "filter-section-title";
  heading.textContent = title;
  listEl.appendChild(heading);
  items.forEach(({ filter, index }) => renderFilterItem(filter, index));
}

function renderFilters(filters) {
  listEl.innerHTML = "";
  const indexed = filters.map((filter, index) => ({ filter, index }));
  const enabled = indexed.filter(({ filter }) => filter.enabled);
  const disabled = indexed.filter(({ filter }) => !filter.enabled);

  renderSection("Enabled", enabled);
  SECTIONS.forEach((section) => {
    renderSection(section.title, disabled.filter(({ filter }) => filter.group === section.group));
  });
}

function withFilters(mutator) {
  readManagedFilters((filters) => mutator(filters));
}

function saveFilters(filters) {
  const next = sortFilters(filters);
  chrome.storage.sync.set({ filters: next, defaultsVersion: DEFAULTS_VERSION }, () => {
    renderFilters(next);
  });
}

function loadFilters() {
  readManagedFilters((filters) => {
    renderFilters(filters);
  });
}

function addOrUpdateFilter() {
  const name = nameInput.value.trim();
  const query = queryInput.value.trim();
  if (!name || !query) return;

  withFilters((filters) => {
    const existingIndex = filters.findIndex((filter) => filter.name === name);
    if (existingIndex >= 0) {
      filters[existingIndex].query = query;
      filters[existingIndex].enabled = true;
    } else {
      filters.push({
        name,
        query,
        enabled: true,
        builtin: false,
        group: "custom"
      });
    }
    saveFilters(filters);
    nameInput.value = "";
    queryInput.value = "";
  });
}

function toggleFilter(index, enabled) {
  withFilters((filters) => {
    if (!filters[index]) return;
    filters[index].enabled = enabled;
    saveFilters(filters);
  });
}

function deleteFilter(index) {
  withFilters((filters) => {
    if (!filters[index] || filters[index].builtin) return;
    filters.splice(index, 1);
    saveFilters(filters);
  });
}

addBtn.addEventListener("click", addOrUpdateFilter);
nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addOrUpdateFilter();
});
queryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addOrUpdateFilter();
});
loadFilters();
