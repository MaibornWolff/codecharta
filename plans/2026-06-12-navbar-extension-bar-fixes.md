---
name: navbar-extension-bar-fixes
issue: none
state: complete
version: 1
---

## Goal

Four small UI fixes: move the file extension bar from the top to directly above the bottom bar, add small vertical dividers between Compare | 3D Print | Settings in the navbar, and point the CC logo link to https://codecharta.com/.

## Tasks

### 1. Move file extension bar above the bottom bar
- Fix the `cc-file-extension-bar` host above the bottom bar (`bottom: var(--cc-bottom-bar-height)`), full width, with `bg-base-100` background
- Publish `--cc-file-extension-bar-height` via ResizeObserver (same pattern as bottomBar)
- Remove extension bar from `--cc-bars-height` calculation in `codeMap.component.ts` (nav bar only now)
- Subtract `--cc-file-extension-bar-height` in sidebar explorer/inspector height calcs
- Raise metrics bar bottom offset by `--cc-file-extension-bar-height`
- Update `screenshot.service.ts`: extension bar height counts toward bottom exclusion, not top

### 2. Navbar dividers
- Add short centered vertical line (`w-px h-4 bg-base-300`) between mode toggle and 3D Print button
- Add the same line between 3D Print and Settings buttons

### 3. CC logo link
- Change `navBarLogo` href from GitHub to https://codecharta.com/, update title

## Steps

- [x] Complete Task 1: Move file extension bar above the bottom bar
- [x] Complete Task 2: Navbar dividers
- [x] Complete Task 3: CC logo link
- [x] Run affected unit tests

## Notes

- User chose: separate strip above the bottom bar (not merged into footer); short centered divider style (not full-height DaisyUI divider)
- Verified at runtime via Electron + Playwright against `ng serve`: bar adjacency, metrics bar/sidebar clearance, dividers, logo link, segment toggle, screenshot-to-file download, window resize
- Pre-existing (not from this change): at narrow widths with both sidebars open, the centered floating metrics bar slides under the sidebars; type error in colorBandRow.component.spec.ts
