const FILTER_BAR_CLASS = "gmail-filter-buttons-bar";
const MAX_INLINE_BUTTONS = 4;

function getAccountIndex() {
  const match = location.pathname.match(/\/mail\/u\/(\d+)/);
  return match ? match[1] : "0";
}

function applyFilter(query) {
  const encoded = encodeURIComponent(query);
  const account = getAccountIndex();
  const nextUrl = `https://mail.google.com/mail/u/${account}/#search/${encoded}`;

  if (location.href === nextUrl) {
    location.reload();
    return;
  }

  location.assign(nextUrl);
}

function findToolbarHost() {
  const toolbar = document.querySelector('div[gh="tm"]') || document.querySelector('div[gh="mtb"]');
  if (!toolbar) return null;
  return toolbar.querySelector(".G-tF") || toolbar;
}

function closeFilterMenu() {
  document.querySelectorAll(".gmail-filter-menu").forEach((menu) => {
    menu.hidden = true;
  });
}

function positionMenu(menu, anchor) {
  const rect = anchor.getBoundingClientRect();
  const menuWidth = Math.max(220, menu.offsetWidth);
  const left = Math.min(rect.left, window.innerWidth - menuWidth - 8);
  menu.style.top = `${Math.round(rect.bottom + 4)}px`;
  menu.style.left = `${Math.max(8, Math.round(left))}px`;
}

function createFilterButton(filter, extraClass) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = extraClass ? `gmail-filter-button ${extraClass}` : "gmail-filter-button";
  btn.textContent = filter.name;
  btn.title = filter.query;
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeFilterMenu();
    applyFilter(filter.query);
  });
  return btn;
}

function createOverflowMenu(filters) {
  const wrap = document.createElement("div");
  wrap.className = "gmail-filter-more-wrap";

  const moreBtn = document.createElement("button");
  moreBtn.type = "button";
  moreBtn.className = "gmail-filter-button gmail-filter-more-btn";
  moreBtn.textContent = "More";
  moreBtn.setAttribute("aria-haspopup", "true");
  moreBtn.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.className = "gmail-filter-menu";
  menu.hidden = true;
  menu.setAttribute("role", "menu");

  filters.forEach((filter) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "gmail-filter-menu-item";
    item.setAttribute("role", "menuitem");
    item.textContent = filter.name;
    item.title = filter.query;
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeFilterMenu();
      applyFilter(filter.query);
    });
    menu.appendChild(item);
  });

  moreBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const willOpen = menu.hidden;
    closeFilterMenu();
    if (willOpen) {
      menu.hidden = false;
      moreBtn.setAttribute("aria-expanded", "true");
      positionMenu(menu, moreBtn);
    } else {
      moreBtn.setAttribute("aria-expanded", "false");
    }
  });

  wrap.appendChild(moreBtn);
  wrap.appendChild(menu);
  return wrap;
}

function insertBar(host, bar) {
  const pagination = host.querySelector(".ar5") ||
    host.querySelector('[aria-label*="Newer"]') ||
    host.querySelector('[data-tooltip*="Newer"]');
  const paginationGroup = pagination ? pagination.closest(".G-Ni") : null;
  if (paginationGroup && paginationGroup.parentElement === host) {
    host.insertBefore(bar, paginationGroup);
    return;
  }

  const groups = host.querySelectorAll(":scope > .G-Ni");
  if (groups.length >= 2) {
    groups[1].after(bar);
    return;
  }
  if (groups[0]) {
    groups[0].after(bar);
    return;
  }

  host.appendChild(bar);
}

function renderFilterBar(filters) {
  const host = findToolbarHost();
  if (!host) return false;

  const existing = host.querySelector(`.${FILTER_BAR_CLASS}`);
  if (existing) existing.remove();
  closeFilterMenu();

  const enabled = getEnabledFilters(filters);
  if (!enabled.length) return true;

  const bar = document.createElement("div");
  bar.className = FILTER_BAR_CLASS;

  if (enabled.length <= MAX_INLINE_BUTTONS) {
    enabled.forEach((filter) => bar.appendChild(createFilterButton(filter)));
  } else {
    enabled.slice(0, MAX_INLINE_BUTTONS - 1).forEach((filter) => {
      bar.appendChild(createFilterButton(filter));
    });
    bar.appendChild(createOverflowMenu(enabled.slice(MAX_INLINE_BUTTONS - 1)));
  }

  insertBar(host, bar);
  return true;
}

let cachedFilters = null;
let defaultsSeeded = false;

function loadAndRender() {
  if (cachedFilters) {
    renderFilterBar(cachedFilters);
    return;
  }

  chrome.storage.sync.get({ filters: [] }, (data) => {
    const filters = mergeWithDefaults(data.filters || []);
    cachedFilters = filters;
    renderFilterBar(filters);

    if (!defaultsSeeded) {
      defaultsSeeded = true;
      chrome.storage.sync.set({ filters });
    }
  });
}

function tryRender() {
  if (!findToolbarHost()) return;
  if (document.querySelector(`div[gh="tm"] .${FILTER_BAR_CLASS}, div[gh="mtb"] .${FILTER_BAR_CLASS}`)) {
    return;
  }
  loadAndRender();
}

document.addEventListener("click", (event) => {
  if (event.target.closest(".gmail-filter-more-wrap")) return;
  closeFilterMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeFilterMenu();
});

window.addEventListener("resize", closeFilterMenu);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" || !changes.filters) return;
  cachedFilters = mergeWithDefaults(changes.filters.newValue || []);
  renderFilterBar(cachedFilters);
});

const observer = new MutationObserver(() => {
  tryRender();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", tryRender);
} else {
  tryRender();
}
