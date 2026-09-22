---
name: Sunburst map layout (prototype)
issue: none
state: complete
version: 1
---

## Goal

Add "Sunburst" as a fourth map layout in the global configuration. When selected, the metric view shows an
ECharts sunburst of the folders instead of the 3D map, at most three rings deep, to test whether it is useful.

## Tasks

### 1. Layout option
- New `LayoutAlgorithm.Sunburst` value, accepted everywhere a layout is loaded (URL, IndexedDB, scenarios)
- 3D pipeline skips work while the sunburst is active

### 2. Sunburst data
- Folders and files; angle = area metric summed over the folder's files
- Files are leaves in the rings; clicking a file selects it without moving the centre
- Colour = the folder's summed colour value (as when hovering it), on the map's colour range unchanged, like a building
- Respects exclude/flatten/focus like the 3D map

### 3. Sunburst view
- ECharts sunburst component replacing the 3D canvas; three rings around the current centre; the sidebars float over it
- Click a folder: drill in and select it (inspector); click the centre: go up and select the parent
- Hover syncs with the explorer both ways; labels where they fit, tooltip with path, area and colour value
- Delta mode shows a notice instead

### 4. Surrounding UI
- Hide 3D-only controls (view cube, camera, height metric, labels, 3D print) while sunburst is active
- Screenshot captures the sunburst

## Steps

- [x] Complete Task 1: Layout option
- [x] Complete Task 2: Sunburst data
- [x] Complete Task 3: Sunburst view
- [x] Complete Task 4: Surrounding UI
- [x] All checks green (format, test, lint, tsc, e2e) and checked in the running app

## Notes

- Decisions from the Q&A: folders only, click = drill + select, hover syncs explorer, metrics bar/legend/extension
  bar/sidebars stay, delta out of scope, names + tooltip, 3D controls hidden, screenshot supported
- Revised after review: the colour went from an area-weighted average, over a range rescaled to the folders, to the
  plain summed value on the map's range; files were added as leaves. A height/colour link is ignored in the sunburst
- Rings shrink to the depth that exists below the centre (at most three), so shallow maps get wider, readable rings
- The centre follows the selection (a file centres on its folder); clearing the selection keeps the centre
- ECharts is only in lazy chunks (`@defer` + `sunburstRegistry.facade.ts`); the initial bundle grows by about 20 KB
- Verified: unit gate, lint, tsc, 94/94 e2e on local Chromium, manual run on the junit5 showcase map
- Review round (2026-09-22): going up uses the tree parent (merged chains), the 3D scene mirrors the store's
  selection after a mesh swap, exclude checks the store's selection, sunburst hover no longer drives the hidden 3D
  map, and in Sunburst every node menu offers Focus/Flatten but not Keep Highlight/marking. Shared chart registry,
  size observer, escapeHtml and test stub; e2e waits on `aria-busy` instead of a fixed delay
