const nameInput = document.getElementById('filterName');
const queryInput = document.getElementById('filterQuery');
const addBtn = document.getElementById('addFilter');
const listEl = document.getElementById('filterList');

function renderFilters(filters) {
  listEl.innerHTML = '';
  filters.forEach((f, idx) => {
    const div = document.createElement('div');
    div.className = 'filter-item';

    const info = document.createElement('div');
    const nameSpan = document.createElement('div');
    nameSpan.className = 'filter-name';
    nameSpan.textContent = f.name;
    const querySpan = document.createElement('div');
    querySpan.className = 'filter-query';
    querySpan.textContent = f.query;
    info.appendChild(nameSpan);
    info.appendChild(querySpan);

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '✕';
    del.addEventListener('click', () => deleteFilter(idx));

    div.appendChild(info);
    div.appendChild(del);
    listEl.appendChild(div);
  });
}

function loadFilters() {
  chrome.storage.sync.get({ filters: [] }, (data) => {
    renderFilters(data.filters);
  });
}

function saveFilters(filters) {
  chrome.storage.sync.set({ filters }, () => {
    renderFilters(filters);
  });
}

function addOrUpdateFilter() {
  const name = nameInput.value.trim();
  const query = queryInput.value.trim();
  if (!name || !query) return;

  chrome.storage.sync.get({ filters: [] }, (data) => {
    const filters = data.filters;
    const existingIndex = filters.findIndex(f => f.name === name);
    if (existingIndex >= 0) {
      filters[existingIndex].query = query;
    } else {
      filters.push({ name, query });
    }
    saveFilters(filters);
    nameInput.value = '';
    queryInput.value = '';
  });
}

function deleteFilter(index) {
  chrome.storage.sync.get({ filters: [] }, (data) => {
    const filters = data.filters;
    filters.splice(index, 1);
    saveFilters(filters);
  });
}

addBtn.addEventListener('click', addOrUpdateFilter);
document.addEventListener('DOMContentLoaded', loadFilters);
