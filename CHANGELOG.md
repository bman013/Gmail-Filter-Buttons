# Changelog

All notable changes to Gmail Filter Buttons are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

Extension version (`manifest.json`) and filter catalog version can move independently. See the README for how those numbers are bumped.

## [1.5.0] - 2026-09-22

First GitHub release of the extension.

### Added
- Semantic versions for the Chrome extension (`1.5.0`) and the built-in filter catalog (`2.0.0`)
- Descriptions on every built-in filter
- Project README with install/use steps, filter reference, and Chrome Web Store listing copy
- Author link to [bman013](https://github.com/bman013) in the popup and docs
- This changelog

### Changed
- Filter catalog updates now migrate with semver: major resets default on/off flags, minor adds new built-ins without wiping toggles

## [1.4.0] - 2026-09-13

### Added
- Enabled filters are listed first in the popup

### Changed
- Popup uses a single scrollbar and more horizontal padding
- Default enabled set is Action Needed, Today, This Week, and User Labels

### Removed
- Built-in filters: Unread + Important, Starred, Drafts Needing Attention

## [1.3.0] - 2026-09-13

### Fixed
- Additional Filters stays on the Gmail toolbar after a search is applied, instead of overlapping the message list

## [1.2.0] - 2026-09-13

### Changed
- Replaced the row of pills with a single blue **Additional Filters** dropdown
- Button is styled so it reads as an add-on, not a native Gmail control

### Added
- Author credit: Brodie Carter (bman013)

## [1.1.0] - 2026-09-13

### Added
- Built-in Gmail search shortcuts (standard and power-user)
- On/off toggles in the popup
- Custom filters that can be added, edited, and deleted
- Filter buttons injected into Gmail’s list toolbar

## [1.0.0] - 2026-09-13

### Added
- Initial Manifest V3 scaffold: popup, content script, storage, and packaged zip

[1.5.0]: https://github.com/bman013/Gmail-Filter-Buttons/releases/tag/v1.5.0
[1.4.0]: https://github.com/bman013/Gmail-Filter-Buttons/releases/tag/v1.5.0
[1.3.0]: https://github.com/bman013/Gmail-Filter-Buttons/releases/tag/v1.5.0
[1.2.0]: https://github.com/bman013/Gmail-Filter-Buttons/releases/tag/v1.5.0
[1.1.0]: https://github.com/bman013/Gmail-Filter-Buttons/releases/tag/v1.5.0
[1.0.0]: https://github.com/bman013/Gmail-Filter-Buttons/releases/tag/v1.5.0
