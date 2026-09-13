const EXTENSION_VERSION = "1.5.0";

// Filter catalog semver, independent of the extension release:
//   MAJOR — removed/renamed built-ins or a reset of the default enabled set
//   MINOR — new built-in filters added; existing toggles are kept
//   PATCH — description or query wording only
const FILTER_CATALOG_VERSION = "2.0.0";

const DEFAULT_FILTERS = [
  {
    name: "Action Needed",
    query: "is:inbox -category:promotions -category:social -category:updates -category:forums",
    description: "Inbox mail outside Promotions, Social, Updates, and Forums — the messages that usually need a reply.",
    enabled: true,
    builtin: true,
    group: "standard"
  },
  {
    name: "Today",
    query: "newer_than:1d",
    description: "Messages received in the last 24 hours.",
    enabled: true,
    builtin: true,
    group: "standard"
  },
  {
    name: "This Week",
    query: "newer_than:7d",
    description: "Messages received in the last 7 days.",
    enabled: true,
    builtin: true,
    group: "standard"
  },
  {
    name: "User Labels",
    query: "has:userlabels in:inbox",
    description: "Inbox messages that already have one of your labels.",
    enabled: true,
    builtin: true,
    group: "standard"
  },
  {
    name: "Attachments",
    query: "has:attachment",
    description: "Any message that includes an attachment.",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Large Attachments",
    query: "has:attachment larger:10m",
    description: "Messages with attachments larger than 10 MB.",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Newsletters",
    query: "\"unsubscribe\" OR category:promotions",
    description: "Promotions and other mail that looks like a list or newsletter.",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Human Mail",
    query: "is:inbox -from:(no-reply@ noreply@ notifications@)",
    description: "Inbox mail that does not look like it came from an automated no-reply address.",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "No-Reply Senders",
    query: "from:(no-reply@ OR noreply@ OR notifications@)",
    description: "Mail from no-reply, noreply, or notifications-style addresses.",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Older Than 1 Year",
    query: "older_than:1y",
    description: "Messages older than one year — useful for cleanup.",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Unread in Labels",
    query: "has:userlabels is:unread",
    description: "Unread messages that already have a user label.",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Emails With Google Docs",
    query: "\"docs.google.com\"",
    description: "Messages that include a Google Docs link.",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Emails With Drive Links",
    query: "\"drive.google.com\"",
    description: "Messages that include a Google Drive link.",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Muted Threads",
    query: "is:muted",
    description: "Conversations you have muted in Gmail.",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Sent But No Reply Likely",
    query: "in:sent -category:promotions -category:social -from:(no-reply@ noreply@ notifications@)",
    description: "Sent mail excluding promotions, social, and automated senders — follow-ups you may still own.",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Unread + Not Promotions",
    query: "is:unread -category:promotions",
    description: "Unread mail outside the Promotions tab.",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Unread + Human Mail",
    query: "is:unread -from:(no-reply@ noreply@ notifications@)",
    description: "Unread mail that is not from a no-reply or notifications address.",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Emails With Calendar Links",
    query: "\"calendar\" OR \"schedule\" OR \"book a call\"",
    description: "Messages that mention a calendar, a schedule, or booking a call.",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Emails With PDF Attachments",
    query: "has:attachment filename:pdf",
    description: "Messages with a PDF attached.",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Emails With Images",
    query: "has:attachment filename:(jpg OR jpeg OR png)",
    description: "Messages with jpg, jpeg, or png attachments.",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "No Labels Applied",
    query: "-has:userlabels in:inbox",
    description: "Inbox messages that do not have any of your labels yet.",
    enabled: false,
    builtin: true,
    group: "power"
  }
];

const REMOVED_FILTERS = new Set([
  "Unread + Important",
  "Starred",
  "Drafts Needing Attention"
]);

const GROUP_ORDER = { custom: 0, standard: 1, power: 2 };

function parseSemver(version) {
  const parts = String(version || "0.0.0").split(".");
  return {
    major: parseInt(parts[0], 10) || 0,
    minor: parseInt(parts[1], 10) || 0,
    patch: parseInt(parts[2], 10) || 0
  };
}

function compareSemver(a, b) {
  const left = parseSemver(a);
  const right = parseSemver(b);
  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  return left.patch - right.patch;
}

function resolveStoredCatalogVersion(data) {
  if (data.filterCatalogVersion) return data.filterCatalogVersion;
  if (data.defaultsVersion) return `0.${data.defaultsVersion}.0`;
  return "0.0.0";
}

function getFilterDescription(filter) {
  const match = DEFAULT_FILTERS.find((item) => item.name === filter.name);
  return (match && match.description) || "";
}

function sortFilters(filters) {
  return [...filters].sort((a, b) => {
    if (!!a.enabled !== !!b.enabled) return a.enabled ? -1 : 1;
    return (GROUP_ORDER[a.group] ?? 9) - (GROUP_ORDER[b.group] ?? 9);
  });
}

function mergeWithDefaults(stored, options) {
  const resetBuiltinEnabled = !!(options && options.resetBuiltinEnabled);
  const filters = (Array.isArray(stored) ? stored : [])
    .filter((filter) => filter && !REMOVED_FILTERS.has(filter.name))
    .map((filter) => ({ ...filter }));
  const byName = new Map(filters.map((filter) => [filter.name, filter]));

  DEFAULT_FILTERS.forEach((def) => {
    const existing = byName.get(def.name);
    if (!existing) {
      filters.push({
        name: def.name,
        query: def.query,
        enabled: def.enabled,
        builtin: true,
        group: def.group
      });
      return;
    }

    existing.builtin = true;
    existing.group = existing.group || def.group;
    if (resetBuiltinEnabled || typeof existing.enabled !== "boolean") {
      existing.enabled = def.enabled;
    }
    if (!existing.query) {
      existing.query = def.query;
    }
  });

  filters.forEach((filter) => {
    if (typeof filter.enabled !== "boolean") {
      filter.enabled = true;
    }
    if (!filter.group) {
      filter.group = filter.builtin ? "standard" : "custom";
    }
  });

  return sortFilters(filters);
}

function getEnabledFilters(filters) {
  return (filters || []).filter((filter) => filter && filter.enabled && filter.query);
}

function persistFilterState(filters, callback) {
  chrome.storage.sync.set({
    filters,
    filterCatalogVersion: FILTER_CATALOG_VERSION
  }, () => {
    if (callback) callback(filters);
  });
}

function readManagedFilters(callback) {
  chrome.storage.sync.get({
    filters: [],
    defaultsVersion: 0,
    filterCatalogVersion: ""
  }, (data) => {
    const storedCatalog = resolveStoredCatalogVersion(data);
    const resetBuiltinEnabled = parseSemver(storedCatalog).major < parseSemver(FILTER_CATALOG_VERSION).major;
    const filters = mergeWithDefaults(data.filters || [], { resetBuiltinEnabled });
    if (storedCatalog !== FILTER_CATALOG_VERSION) {
      persistFilterState(filters, callback);
      return;
    }
    callback(filters);
  });
}
