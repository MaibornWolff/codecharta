---
name: Layout tab on the metrics bar
issue: none
state: complete
version: 1
---

## Goal

Move the map layout choice out of the Settings dialog onto a small tab on the metrics bar's top edge (concept F of
the layout switcher designs), so the layout can be changed next to the map without growing the bar.

## Tasks

### 1. Layout tab
- Tab riding on the bar's top-left edge: "Layout" label, layout icon, layout name, caret; bar size unchanged
- Opens a popover (settings popover shell) with the four layouts as a 2×2 grid of tiles: icon, name, one-line description
- "Maximum TreeMap Files" slider only while TreeMapStreet is picked
- Stays in place when Sunburst hides Height, Edges and Labels

### 2. Remove the Settings dialog entry
- Drop the Map Layout selection from the Global Configuration dialog; Reset global settings still resets layout and file limit
- Remove what becomes unused (component, store/facade methods)

### 3. Tests, changelog, visual check
- Unit specs for the tab, updated dialog/bar specs; e2e helper that switched layouts through the dialog uses the tab
- CHANGELOG entry under Changed
- Build, screenshot the running app and compare against the F mockup

## Steps

- [x] Complete Task 1: Layout tab
- [x] Complete Task 2: Remove the Settings dialog entry
- [x] Complete Task 3: Tests, changelog, visual check
- [x] All checks green (format, test, lint, tsc, e2e)

## Notes

- Decisions (Q&A): remove from Settings; scenarios do not save the layout in this change; no L shortcut; the tab shows
  the name only
- User docs moved the Map Layout section from Settings to the Metrics page (`#layout`); the Settings screenshot still
  shows the old dropdown
- Verified: unit gate, tsc, depcruise, style lint, knip, Biome, 100/100 e2e on local Chromium, and screenshots of the
  built app (closed tab, picker with TreeMapStreet file limit, Sunburst with the reduced bar) matching the F mockup
- The tab sits outside the bar's measured height, so it can overlap about 16 px of the map floor above the bar
