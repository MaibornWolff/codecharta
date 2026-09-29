---
name: Dependency view: folder hover, edge styles, dragging boxes
issue: -
state: complete
version: -
---

## Goal

Hovering a folder shows only the dependencies crossing its border; an edge-style switch lets readers compare
four ways of drawing edges; boxes can be dragged within their folder and put back with a reset.

## Tasks

### 1. Folder hover
- A hovered box's edges are those with exactly one end inside it; nothing dims when there are none (root)

### 2. Edge styles
- Switch in the toolbox: Curved (today), Spread (curves, ports spread along the side by where the other end
  is), Upward aside (spread, upward edges swing out on the right), Straight (spread, straight lines, a slight
  arc for dependencies running both ways, as in DependaCharta)
- View state, not persisted

### 3. Dragging boxes
- Drag a file or closed folder anywhere, an open folder by its header; the root and empty space still pan
- A box stays inside its folder: the folder grows to hold it, as compound nodes do; everything inside a
  moved folder moves with it; edges follow
- Reset layout button; a new project or focus starts unmoved

## Steps

- [x] Complete Task 1: Folder hover
- [x] Complete Task 2: Edge styles
- [x] Complete Task 3: Dragging boxes

## Notes

- Upward edges not red (reported): checked on visualization/app with and without tests; every edge drawn
  upward carries the upward flag, with all folders open and in the first look. The edge was red but painted
  under the grey ones sharing its corridor, fixed by painting edges by severity (5ae29f6d2)
- Clamping a box to its folder's inner area left it almost no room, since the layout packs folders tightly,
  and none at all as a folder's only child; the folder grows instead
- A press on a draggable box marks the zrender event `__ecRoamConsumed`, the flag ECharts' pan checks; the
  chart's own mousedown handlers run before the pan's. Internal to ECharts, covered by a browser check only
- Edge styles verified in a production build; dragging verified by unit tests only, the browser check could
  not run this session

