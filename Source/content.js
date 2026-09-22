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

function isVisible(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return rect.width > 8 &&
    rect.height > 8 &&
    style.visibility !== "hidden" &&
    style.display !== "none";
}

function findToolbarRoot() {
  const nodes = [
    ...document.querySelectorAll('div[gh="tm"]'),
    ...document.querySelectorAll('div[gh="mtb"]'),
    ...document.querySelectorAll("div.G-atb")
  ];

  const visible = nodes.filter(isVisible);
  if (!visible.length) return null;

  visible.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return visible[0];
}

function findToolbarHost() {
  const root = findToolbarRoot();
  if (!root) return null;

  const inner = [...root.querySelectorAll(".G-tF")].find((el) => {
    const rect = el.getBoundingClientRect();
    return isVisible(el) && rect.height > 20 && rect.height < 80;
  });

  return inner || root;
}

function findIconCluster(host) {
  const refresh = host.querySelector('[act="20"], [data-tooltip="Refresh"], [aria-label="Refresh"]');
  if (refresh && refresh.parentElement) return refresh.parentElement;

  const more = host.querySelector('[act="22"], [data-tooltip="More"], [aria-label="More"]');
  if (more && more.parentElement) return more.parentElement;

  const icons = [...host.querySelectorAll(".T-I")];
  if (icons.length) return icons[0].parentElement;

  const groups = [...host.querySelectorAll(":scope > .G-Ni")].filter((group) => {
    return !group.querySelector(".ar5") && !group.classList.contains("G-aE");
  });
  return groups[1] || groups[0] || null;
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
  const cluster = findIconCluster(host);
  if (cluster) {
    cluster.appendChild(bar);
    return;
  }

  const pagination = host.querySelector(".ar5") ||
    host.querySelector('[aria-label*="Newer"]') ||
    host.querySelector('[data-tooltip*="Newer"]');
  const paginationGroup = pagination ? pagination.closest(".G-Ni") : null;
  if (paginationGroup && paginationGroup.parentElement === host) {
    host.insertBefore(bar, paginationGroup);
    return;
  }

  host.appendChild(bar);
}

function isBarInToolbar() {
  const host = findToolbarHost();
  const bar = document.querySelector(`.${FILTER_BAR_CLASS}`);
  if (!host || !bar || !host.contains(bar) || !isVisible(bar)) return false;

  const ref = host.querySelector(".T-I") || host.querySelector(".G-Ni") || host;
  return Math.abs(bar.getBoundingClientRect().top - ref.getBoundingClientRect().top) <= 18;
}

function renderFilterBar(filters) {
  document.querySelectorAll(`.${FILTER_BAR_CLASS}`).forEach((el) => el.remove());
  closeFilterMenu();

  const host = findToolbarHost();
  if (!host) return false;

  const enabled = getEnabledFilters(filters);
  if (!enabled.length) return true;

  const bar = document.createElement("div");
  bar.className = FILTER_BAR_CLASS;
  bar.appendChild(createAddonDropdown(enabled));
  insertBar(host, bar);
  return true;
}

let cachedFilters = null;

function loadAndRender() {
  if (cachedFilters) {
    renderFilterBar(cachedFilters);
    return;
  }

  readManagedFilters((filters) => {
    cachedFilters = filters;
    renderFilterBar(filters);
  });
}

function tryRender() {
  if (!findToolbarHost()) return;
  if (isBarInToolbar()) return;
  loadAndRender();
}

let renderScheduled = false;
function scheduleTryRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    tryRender();
  });
}

document.addEventListener("click", (event) => {
  if (event.target.closest(".gmail-filter-addon-wrap")) return;
  closeFilterMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeFilterMenu();
});

window.addEventListener("resize", closeFilterMenu);
window.addEventListener("hashchange", () => scheduleTryRender());
window.addEventListener("popstate", () => scheduleTryRender());

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" || !changes.filters) return;
  cachedFilters = mergeWithDefaults(changes.filters.newValue || []);
  renderFilterBar(cachedFilters);
});

const observer = new MutationObserver(() => {
  scheduleTryRender();
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
