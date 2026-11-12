---
name: Distribution bar: list the parts of "other"
state: complete
version: 1
---

## Goal

Hovering the "other" segment of the distribution bar opens a list above it with every extension folded into
"other". Each row highlights its buildings on hover and has its own right-click menu (Flatten/Show, Exclude).
Right-clicking the "other" segment itself still acts on all of them.

## Tasks

### 1. Extract the context menu (structural)
- Move Flatten/Show/Exclude menu, its outside-click/wheel/resize closing and the flattened state out of the
  segment into its own component, so segment and list rows share it
- Move the value formatting ("ts 12.00%") into a shared function

### 2. Others list (behavioural)
- Segment gets the `others` of the distribution; for "other" it opens the list above itself on mouse enter and
  closes it on mouse leave
- List stays open while one of its row menus is open; hidden while the segment's own menu is open
- Rows: colour swatch, extension, value (relative or absolute like the bar); hover highlights that extension
- Files without extension stay out of the list
- Long lists scroll (no tabindex, see Sonar S6845)

### 3. Changelog + gates
- Added entry in `visualization/CHANGELOG.md`
- format:check, npm test, lint, tsc; e2e for the bar if feasible

## Steps

- [x] Complete Task 1: Extract the context menu
- [x] Complete Task 2: Others list
- [x] Complete Task 3: Changelog + gates

## Notes

- e2e `fileExtensionBar.e2e.ts` with fixture `sample_with_small_extensions.cc.json` (no sample map has an "other")
- Decisions (asked 2026-11-12): popup list above, per-row highlight, no "None" row, stay on feature/test-clusters
