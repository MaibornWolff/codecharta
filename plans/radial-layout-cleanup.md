---
name: Radial layout cleanup
issue: none
state: complete
version: 1
---

## Goal

Tidy up three rough edges of the sunburst and radial treemap before release: the open folder's own files in the radial
treemap look like sunburst slices next to squarified sub-folders, the area and colour settings offer options that do
nothing in radial layouts, and the folder values drop the own-scale group and gain `min`.

## Tasks

### 1. Radial treemap: the open folder's files as cells
- The centre's direct files are squarified together into one block covering their combined angle, from the centre
  radius out to the rim (nothing lies beyond them), instead of one full-band slice each
- Sub-folder wedges keep their angles; ordering stays largest first

### 2. Radial settings without 3D-only options
- Area card: no cog in radial layouts (margin, floor labels, invert area do nothing there)
- Colour popover: no folder overrides in radial layouts

### 3. Folder values: drop the own scale, add `min`
- Remove `share ÷ size` and `share of red` (unreleased, no migration) and the scale grouping in the value list
- Add `min` (its best file), useful when the colour range is inverted
- Values: sum, max, min, median, mean / file, avg / area (`avg / line` renamed: it is weighted by the area metric,
  which is only a line count when that metric is one)

### 4. Flickering radial charts on hover
- Hovering showed the path in the bottom bar, which grew it by 1 px, resized the chart and redrew it; the redraw
  dropped the hover, the bar shrank and the chart redrew again, twice per mouse move
- Reserve the path's line in the bottom bar; a redraw of the same centre and layout keeps the hover

## Steps

- [x] Complete Task 1: open folder's files as cells
- [x] Complete Task 2: radial settings without 3D-only options
- [x] Complete Task 3: folder values
- [x] Changelog, format:check, npm test, lint, tsc
- [x] Complete Task 4: flicker fixed, verified in Chromium (120 redraws per 60 mouse moves before, 0 after)

## Notes

- Decisions (2026-09-24): files as one full-depth block; area card without cog; no migration for the removed values
  because they were never released
- Values `max`/`min` are described as highest/lowest file instead of worst file, since inverted colours turn that round
- Verified: format:check, npm test (478 suites, coverage gate), lint, tsc; e2e not run (sandbox has macOS node_modules)
