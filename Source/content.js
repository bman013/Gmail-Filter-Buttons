const FILTER_BAR_CLASS = "gmail-filter-buttons-bar";

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
  document.querySelectorAll(".gmail-filter-addon-btn").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
  });
}

function positionMenu(menu, anchor) {
  const rect = anchor.getBoundingClientRect();
  const menuWidth = Math.max(240, menu.offsetWidth);
  const left = Math.min(rect.left, window.innerWidth - menuWidth - 8);
  menu.style.top = `${Math.round(rect.bottom + 6)}px`;
  menu.style.left = `${Math.max(8, Math.round(left))}px`;
}

function createAddonDropdown(filters) {
  const wrap = document.createElement("div");
  wrap.className = "gmail-filter-addon-wrap";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "gmail-filter-addon-btn";
  btn.setAttribute("aria-haspopup", "true");
  btn.setAttribute("aria-expanded", "false");
  btn.title = "Gmail Filter Buttons";

  const icon = document.createElement("span");
  icon.className = "gmail-filter-addon-icon";
  icon.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "gmail-filter-addon-label";
  label.textContent = "Additional Filters";

  const caret = document.createElement("span");
  caret.className = "gmail-filter-addon-caret";
  caret.setAttribute("aria-hidden", "true");

  btn.appendChild(icon);
  btn.appendChild(label);
  btn.appendChild(caret);

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

  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const willOpen = menu.hidden;
    closeFilterMenu();
    if (willOpen) {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      positionMenu(menu, btn);
    }
  });

  wrap.appendChild(btn);
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
  document.querySelectorAll(`.${FILTER_BAR_CLASS}`).forEach((el) => el.remove());
  closeFilterMenu();

  const host = findToolbarHost();
  if (!host) return false;

  const enabled = getEnabledFilters(filters);
  if (!enabled.length) return true;

  const bar = document.createElement("div");
  bar.className = `G-Ni ${FILTER_BAR_CLASS}`;
  bar.appendChild(createAddonDropdown(enabled));
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
  if (event.target.closest(".gmail-filter-addon-wrap")) return;
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
