---
name: Distribution bar lists what falls under "other"
issue: none
state: complete
version: 1
---

## Goal

Hovering the "other" segment of the distribution bar opens a list of the extensions grouped into it. Each row
highlights its buildings on hover and can be flattened, shown or excluded via right-click, like a bar segment.

## Tasks

### 1. Extract the extension context menu (structural)
- Move the Flatten/Show/Exclude menu out of the bar segment into its own component, so segments and list rows
  share it

### 2. "Other" popover
- The bar passes the grouped extensions (others, plus "None" when it was merged into "other") to the "other"
  segment
- Hovering the segment opens a popover above it, right-aligned, kept open while hovered or a row menu is open
- Header row "All others" with the total opens the bulk menu; each extension row highlights its buildings on
  hover and opens the menu on right-click; "None" is listed without actions
- Values follow the bar's relative/absolute toggle

### 3. Changelog
- Entry under Added in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Extract the extension context menu
- [x] Complete Task 2: "Other" popover
- [x] Complete Task 3: Changelog
- [x] Run format:check, tests, lint, tsc

## Notes

- The "other" segment's own right-click still flattens/excludes all grouped extensions at once
- Not checked in a real browser: the sandbox has macOS-only native modules and no browser
