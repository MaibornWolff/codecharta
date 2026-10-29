---
name: Local source production-ready
state: complete
version: 1
---

## Goal

Turn the local-source PoC (show source, open in VS Code, local folder per map) into a production-grade feature:
switched on deliberately, hidden wherever the browser cannot or may not open folders, measured per browser case,
covered by e2e tests, and announced in the changelog.

## Tasks

### 1. Global setting
- "Open local source files" in the Settings dialog, off by default; saved sessions get it through a migration
- Off hides every local-source entry: context menu items, the folder line and right-click menu in the map selector

### 2. Availability
- Hidden up front where detectable: no folder API (Firefox, Safari, mobile, no https) or CodeCharta embedded in a
  frame of another origin
- Blocked only when tried (company policy): the first block hides the entries for the session and says why once
- Folders found once are kept in memory, so a session reads each saved handle only once

### 3. Measurements
- Unit matrix of the browser cases: Chromium, desktop app, Firefox/Safari, no https, foreign frame, same-origin
  frame, blocked by policy, cancelled picker
- e2e in Chromium with a stand-in folder: setting off/on, show source, open in VS Code, wrong folder, map selector,
  blocked; plus the folder screenshot and the hover setting

### 4. Changelog
- Entries for local source, folder screenshot and hover setting

## Steps

- [x] Complete Task 1: Global setting
- [x] Complete Task 2: Availability
- [x] Complete Task 3: Measurements
- [x] Complete Task 4: Changelog

## Notes

- Decisions: hide where known, session-wide after a block; setting off by default; unit matrix + Chromium e2e; no
  size limit for shown files
- Not measurable here: reading a saved folder handle back after a reload crashes this sandbox's Chromium (plain JS
  repro without CodeCharta), so persistence across reloads stays a manual check
- Verified: unit suite with coverage gate, tsc, ngc, lint, format, both ccsh gates, full e2e suite in Chromium
  (121 tests, 7 new for local source, 2 new for the dependency view)
