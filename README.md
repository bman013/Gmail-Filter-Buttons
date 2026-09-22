# Gmail Filter Buttons

A Chrome extension that adds an **Additional Filters** menu to the Gmail toolbar. Save the Gmail searches you already use, turn them on or off, and run them in one click.

Author: [Brodie Carter](https://github.com/bman013) ([bman013](https://github.com/bman013))

**Current release:** [1.5.0](CHANGELOG.md) · **Filter catalog:** 2.0.0

---

## What it provides

- An **Additional Filters** dropdown on Gmail’s list toolbar (next to select / refresh), including after you run a search
- 21 built-in search shortcuts for inbox triage, attachments, newsletters, and follow-ups
- On/off toggles so only the views you want appear in the menu
- Custom filters: add your own label + Gmail search query, edit them, or delete them
- Settings synced through Chrome (`storage.sync`) so they follow you across browsers where you are signed in

The extension never sends your mail to a third-party server. It only injects the toolbar control on `mail.google.com` and stores your filter list locally in Chrome.

---

## How to use it

### Install (unpacked)

1. Download or clone this repo, or unzip `Output/gmail-filter-buttons.zip`
2. Open `chrome://extensions`
3. Turn on **Developer mode**
4. Click **Load unpacked** and choose the folder that contains `manifest.json` (`Source/` or the unzipped zip)
5. Open [Gmail](https://mail.google.com) and reload the tab

### Run a filter

1. In Gmail, find the blue **Additional Filters** button on the toolbar
2. Click it and pick a saved search
3. Gmail opens that search for the account you are already viewing (`/mail/u/0`, `/mail/u/1`, and so on)

### Choose which filters appear

1. Click the extension icon in Chrome to open the popup
2. Enabled filters sit at the top and are the ones shown in Gmail
3. Tick or untick a filter to show or hide it
4. Built-in filters can be hidden; they cannot be deleted

### Add your own

1. In the popup, enter a **button label** (for example `Receipts`)
2. Enter a **Gmail search query** (for example `filename:pdf subject:receipt`)
3. Click **Add / Update Filter**
4. Using an existing label updates that filter’s query and turns it on
5. Custom filters can be removed with ✕

Click a filter name in the list to load it back into the form for editing.

---

## Built-in filters

Four are on by default: **Action Needed**, **Today**, **This Week**, and **User Labels**.

### Default filters

| Filter | Gmail query | What it does |
| --- | --- | --- |
| Action Needed | `is:inbox -category:promotions -category:social -category:updates -category:forums` | Inbox mail outside Promotions, Social, Updates, and Forums — the messages that usually need a reply. |
| Today | `newer_than:1d` | Messages received in the last 24 hours. |
| This Week | `newer_than:7d` | Messages received in the last 7 days. |
| User Labels | `has:userlabels in:inbox` | Inbox messages that already have one of your labels. |
| Attachments | `has:attachment` | Any message that includes an attachment. |
| Large Attachments | `has:attachment larger:10m` | Messages with attachments larger than 10 MB. |
| Newsletters | `"unsubscribe" OR category:promotions` | Promotions and other mail that looks like a list or newsletter. |
| Human Mail | `is:inbox -from:(no-reply@ noreply@ notifications@)` | Inbox mail that does not look like it came from an automated no-reply address. |
| No-Reply Senders | `from:(no-reply@ OR noreply@ OR notifications@)` | Mail from no-reply, noreply, or notifications-style addresses. |
| Older Than 1 Year | `older_than:1y` | Messages older than one year — useful for cleanup. |

### Power user filters

| Filter | Gmail query | What it does |
| --- | --- | --- |
| Unread in Labels | `has:userlabels is:unread` | Unread messages that already have a user label. |
| Emails With Google Docs | `"docs.google.com"` | Messages that include a Google Docs link. |
| Emails With Drive Links | `"drive.google.com"` | Messages that include a Google Drive link. |
| Muted Threads | `is:muted` | Conversations you have muted in Gmail. |
| Sent But No Reply Likely | `in:sent -category:promotions -category:social -from:(no-reply@ noreply@ notifications@)` | Sent mail excluding promotions, social, and automated senders — follow-ups you may still own. |
| Unread + Not Promotions | `is:unread -category:promotions` | Unread mail outside the Promotions tab. |
| Unread + Human Mail | `is:unread -from:(no-reply@ noreply@ notifications@)` | Unread mail that is not from a no-reply or notifications address. |
| Emails With Calendar Links | `"calendar" OR "schedule" OR "book a call"` | Messages that mention a calendar, a schedule, or booking a call. |
| Emails With PDF Attachments | `has:attachment filename:pdf` | Messages with a PDF attached. |
| Emails With Images | `has:attachment filename:(jpg OR jpeg OR png)` | Messages with jpg, jpeg, or png attachments. |
| No Labels Applied | `-has:userlabels in:inbox` | Inbox messages that do not have any of your labels yet. |

---

## Versioning

The project uses two [semver](https://semver.org/) numbers so extension releases and the shipped filter list can move independently.

### Extension version (`1.5.0`)

Shown in the Chrome Web Store, `manifest.json`, and the popup footer.

| Part | When to bump |
| --- | --- |
| **MAJOR** | Breaking change to install, permissions, or how filters are stored |
| **MINOR** | New user-facing capability (toolbar behavior, popup features) |
| **PATCH** | Fixes and copy changes that do not change behavior |

Chrome’s `version` field is `MAJOR.MINOR.PATCH` (for example `1.5.0`), which is more flexible than a single increment such as `1.4`.

### Filter catalog version (`2.0.0`)

Stored as `filterCatalogVersion`. Controls how built-in filters are merged into existing installs.

| Part | When to bump | What happens on update |
| --- | --- | --- |
| **MAJOR** | Built-ins are removed/renamed, or the default enabled set changes | Missing filters are added; default on/off flags are reset |
| **MINOR** | New built-in filters are added | New filters are added; your toggles stay as they are |
| **PATCH** | Descriptions or query wording only | Catalog id is saved; toggles stay as they are |

Older installs that only had an integer `defaultsVersion` are treated as `0.x.0` and migrated automatically.

### Release history

See [CHANGELOG.md](CHANGELOG.md) for the full list.

| Version | Notes |
| --- | --- |
| [1.5.0](CHANGELOG.md#150---2026-09-22) | Semver, docs, and Chrome Web Store listing |
| [1.4.0](CHANGELOG.md#140---2026-09-13) | Popup cleanup; default enabled set |
| [1.3.0](CHANGELOG.md#130---2026-09-13) | Toolbar placement after Gmail search |
| [1.2.0](CHANGELOG.md#120---2026-09-13) | Additional Filters dropdown |
| [1.1.0](CHANGELOG.md#110---2026-09-13) | Built-in filters and on/off toggles |
| [1.0.0](CHANGELOG.md#100---2026-09-13) | Initial Manifest V3 scaffold |

---

## Chrome Web Store listing

Copy these fields when you upload the package (`Output/gmail-filter-buttons.zip` or a zip of `Source/`).

### Short description

Pin your favorite Gmail searches to an Additional Filters menu in the toolbar. Toggle built-in views or add your own.

### About

Gmail Filter Buttons puts your most-used Gmail searches one click away.

After you install it, a blue **Additional Filters** button appears on the Gmail toolbar — the same row as select and refresh. Open it and jump straight to views like mail that needs a reply, messages from today, this week’s inbox, or threads you have already labeled. Twenty-one built-in searches ship with the add-on. Four are turned on to start; the rest stay available in the popup so you can enable them when you need them.

You stay in control of the menu. Open the extension popup to turn filters on or off, add your own label and Gmail query, or update a saved search. Custom filters can be deleted; built-in ones can only be hidden. Your list is stored with Chrome sync.

The add-on only runs on Gmail and does not upload your mail. It applies official Gmail search syntax (`is:inbox`, `has:attachment`, `newer_than:1d`, and so on), so the results are the same as typing that query yourself.

Built by [Brodie Carter](https://github.com/bman013) ([bman013](https://github.com/bman013)).

### Store privacy / permissions note

- **storage** — saves your filter names, queries, and on/off state
- **Host permission for mail.google.com** — draws the Additional Filters button on the Gmail toolbar

---

## Repository layout

```
Source/     Unpacked extension (load this folder in Chrome)
Output/     Packaged zip for sharing or store upload
```

---

## License and author

Created by [Brodie Carter](https://github.com/bman013). Source and issues live in this repository.
