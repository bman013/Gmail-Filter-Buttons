const DEFAULT_FILTERS = [
  {
    name: "Action Needed",
    query: "is:inbox -category:promotions -category:social -category:updates -category:forums",
    enabled: true,
    builtin: true,
    group: "standard"
  },
  {
    name: "Unread + Important",
    query: "is:unread is:important",
    enabled: true,
    builtin: true,
    group: "standard"
  },
  {
    name: "Starred",
    query: "is:starred",
    enabled: true,
    builtin: true,
    group: "standard"
  },
  {
    name: "Attachments",
    query: "has:attachment",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Large Attachments",
    query: "has:attachment larger:10m",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Newsletters",
    query: "\"unsubscribe\" OR category:promotions",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Human Mail",
    query: "is:inbox -from:(no-reply@ noreply@ notifications@)",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "No-Reply Senders",
    query: "from:(no-reply@ OR noreply@ OR notifications@)",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Older Than 1 Year",
    query: "older_than:1y",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Today",
    query: "newer_than:1d",
    enabled: true,
    builtin: true,
    group: "standard"
  },
  {
    name: "This Week",
    query: "newer_than:7d",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "User Labels",
    query: "has:userlabels in:inbox",
    enabled: false,
    builtin: true,
    group: "standard"
  },
  {
    name: "Unread in Labels",
    query: "has:userlabels is:unread",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Emails With Google Docs",
    query: "\"docs.google.com\"",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Emails With Drive Links",
    query: "\"drive.google.com\"",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Muted Threads",
    query: "is:muted",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Drafts Needing Attention",
    query: "in:drafts",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Sent But No Reply Likely",
    query: "in:sent -category:promotions -category:social -from:(no-reply@ noreply@ notifications@)",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Unread + Not Promotions",
    query: "is:unread -category:promotions",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Unread + Human Mail",
    query: "is:unread -from:(no-reply@ noreply@ notifications@)",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Emails With Calendar Links",
    query: "\"calendar\" OR \"schedule\" OR \"book a call\"",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Emails With PDF Attachments",
    query: "has:attachment filename:pdf",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "Emails With Images",
    query: "has:attachment filename:(jpg OR jpeg OR png)",
    enabled: false,
    builtin: true,
    group: "power"
  },
  {
    name: "No Labels Applied",
    query: "-has:userlabels in:inbox",
    enabled: false,
    builtin: true,
    group: "power"
  }
];

function mergeWithDefaults(stored) {
  const filters = Array.isArray(stored) ? stored.map((filter) => ({ ...filter })) : [];
  const byName = new Map(filters.map((filter) => [filter.name, filter]));

  DEFAULT_FILTERS.forEach((def) => {
    const existing = byName.get(def.name);
    if (!existing) {
      filters.push({ ...def });
      return;
    }

    existing.builtin = true;
    existing.group = existing.group || def.group;
    if (typeof existing.enabled !== "boolean") {
      existing.enabled = true;
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

  return filters;
}

function getEnabledFilters(filters) {
  return (filters || []).filter((filter) => filter && filter.enabled && filter.query);
}
