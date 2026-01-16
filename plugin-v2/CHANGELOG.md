# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2026-01-16

### Feature
增加来自 https://bgagricola.gamewiki.jp/ 的评价指标

## [0.2.1] - 2026-01-15

### Fixed
- Fixed issue where cards with only statistics data (no tier information) were not displaying stats badges

## [0.2.0] - 2026-01-14

### Added
- In-page search modal as fallback for side panel
  - Click the floating search button to open modal directly
  - Works on all browsers without side panel API limitations
- Click card overlay to search
  - Clicking tier badges now opens search modal with card pre-filled
  - Reuses existing search functionality
- Configurable tooltip toggle
  - Added `ENABLE_TOOLTIPS` constant in code (default: off)
  - Set to `true` to re-enable hover tooltips on badges

### Changed
- Card overlay now floats at 50% height of card (centered)
- Card overlay uses transparent gradient background
- Card overlay displays as single row with stats badge on right
- Tier badges now show only tier value (no label)
- Improved modal animation with smoother transitions
  - Backdrop fades in first
  - Modal slides down with cubic-bezier easing
  - No more flash/flicker on open

### Fixed
- Development mode now properly copies JSON data files
- Added `predev` script to copy `cards.json` and `authors.json` to dev build

## [0.1.0] - 2026-01-13

### Added
- Initial release of Agricola Tutor
- Card tier badges display on Board Game Arena cards
  - Support for 白兔 (Baitu), EN, and Chen tier systems
  - Color-coded badges based on tier level
- Statistics display from Lumin's data
  - PWR (Play Win Rate)
  - ADP (Average Draft Position)
  - APR (Average Play Round)
  - Draw Play Rate
- Side panel search functionality
  - Search by card number, Chinese name, or English name
  - Expandable card results with full details
- Expert commentary tooltips
  - Hover over tier badges to see expert comments
- Multi-language support
  - English (default)
  - Chinese (中文)
- Floating search button on BGA pages
- Keyboard shortcut (Ctrl/Cmd + Shift + F) to open search

### Credits
- **Plugin creator:** Ender
- **Statistics:** Lumin
- **Tier providers:** Yuxiao_Huang, Chen233, Mark Hartnady
- **Special thanks:** Henry, smile3000, 暧晖
