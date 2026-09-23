---
name: Radial treemap map layout
issue: none
state: complete
version: 1
---

## Goal

Add "Radial TreeMap" as a fifth map layout (after Ideas/radial-tree-map.png): concentric bands around the current
folder, one band per folder level, where each folder's wedge is filled with a squarified treemap of its direct
children. It shares the sunburst's host, navigation and surrounding UI.

## Tasks

### 1. Make the sunburst plumbing layout-neutral (structural, no behaviour change)
- `renderer/sunburst` → `renderer/radialMap`: chart host, registry, tree, colouring and component get neutral names;
  the sunburst option builder stays sunburst-specific
- `features/sunburst` → `features/radialMap` (map component, stores, selectors)
- `isSunburstLayout` gate → `isRadialLayout`; context-menu origin `"sunburst"` → `"radialMap"`

### 2. Geometry (pure, TDD)
- Angles: each node's share of its parent's angle, largest first (ties by path), so every node keeps the angle it
  has in the sunburst
- Band k (k = 1..3, one per folder level below the centre) holds the nodes at depth k as wedges: a thin header strip
  at the inner edge shows the node itself, the rest is a squarified treemap of its direct children, laid out in
  arc length × band width and mapped back to angle × radius (area-preserving)
- A file next to the centre fills its wedge; deeper files show once, as a cell in their parent's wedge
- A child's cell in band k does not line up with its own wedge in band k+1 (squarify stacks cells radially); the thick
  wedge borders line up across bands

### 3. Radial treemap chart
- ECharts custom series of sectors, drawn by the shared host (click, hover, right-click, highlight, screenshot)
- Centre disc as in the sunburst: label, click to go up
- Hover highlights every item of the hovered node (its header and its cell)

### 4. Layout option and surrounding UI
- `LayoutAlgorithm.RadialTreeMap`, description, glyph; the radial-layout gate covers both layouts
- Delta notice and screenshot subject no longer say "sunburst"

## Steps

- [x] Complete Task 1: layout-neutral plumbing (own commit)
- [x] Complete Task 2: geometry
- [x] Complete Task 3: radial treemap chart
- [x] Complete Task 4: layout option and surrounding UI
- [x] Changelog, e2e, all checks green (format, test, lint, tsc, e2e)

## Notes

- Decisions from the Q&A: d3 layout + ECharts rendering, one band per level, direct children as cells, navigation
  like the sunburst, implement on a branch
- Alternative not taken: stretch each child across its parent's full angular span (aligns cells with the next band,
  but loses the squarified cells)
- Angles are computed directly (a share of the parent's angle) instead of `d3.partition`: it only needs four levels,
  and d3-hierarchy's squarify does the cells
- Each node is one ECharts data item whose group holds all its pieces (header, cell, outline), so hover and the
  explorer highlight every piece of a node, and a click anywhere reports that node
- ECharts keeps an element's earlier settings when a redraw reuses it, so every element sets `silent` explicitly
  (a reused outline left its cell unclickable after stepping in and out)
- Hovering with the pointer does not dim the other nodes in either radial layout (hover from the explorer does);
  this was already so for the sunburst and is left as it is
- Verified: format, unit gate (466 suites), lint, tsc, 103/103 e2e on local bundled Chromium, and the chart looked at
  on the sample maps
