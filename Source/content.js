function getSearchUrl(query) {
  const encoded = encodeURIComponent(query);
  return `https://mail.google.com/mail/u/0/#search/${encoded}`;
}

function createButtons(filters) {
  const toolbar = document.querySelector('header') ||
                  document.querySelector('div[role="banner"]') ||
                  document.querySelector('div[gh="tm"]');

  if (!toolbar) return;
  if (toolbar.querySelector('.gmail-filter-buttons-bar')) return;

  const bar = document.createElement('div');
  bar.className = 'gmail-filter-buttons-bar';

  filters.forEach(filter => {
    const btn = document.createElement('button');
    btn.className = 'gmail-filter-button';
    btn.textContent = filter.name;
    btn.addEventListener('click', () => {
      window.location.href = getSearchUrl(filter.query);
    });
    bar.appendChild(btn);
  });

  toolbar.appendChild(bar);
}

function initButtons() {
  chrome.storage.sync.get({ filters: [] }, (data) => {
    const filters = data.filters || [];
    if (!filters.length) return;
    createButtons(filters);
  });
}

let initialized = false;

function tryInit() {
  if (initialized) return;
  const toolbar = document.querySelector('header') ||
                  document.querySelector('div[role="banner"]') ||
                  document.querySelector('div[gh="tm"]');
  if (toolbar) {
    initialized = true;
    initButtons();
  }
}

const observer = new MutationObserver(() => {
  tryInit();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

document.addEventListener('DOMContentLoaded', tryInit);
setTimeout(tryInit, 3000);
