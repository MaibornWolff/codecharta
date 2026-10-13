---
name: Dependency view release polish
issue: none
state: complete
version: unreleased
---

## Goal

Five changes to the dependency view of the visualization, asked for by a colleague before its release: a calmer
double click, shorter tooltips, panning with the right mouse button, fewer edge types shown by default and one
window for all edge style settings.

## Tasks

### 1. Double click opens the box only
- A single click selects the box, and so opens the inspector, only once no second click followed (about 250 ms)
- A double click opens or closes the box and leaves the inspector as it was

### 2. Tooltip names the box, not its path
- A folder or file is named by the last part of its path, a package by its last segment
- The other rows (level, cycles inside, double-click hint) stay

### 3. Pan with the right mouse button
- Dragging with the right button pans the whole graph, from anywhere, also from a box
- A right click that does not drag still opens the context menu of the box
- Space panning and dragging a box with the left button stay as they are

### 4. Edges shown: three types by default
- Default: in cycles, points upward, points upward and closes a cycle; plain dependencies are off
- A reset button in the Edges shown window brings the default back; a choice made stays saved

### 5. One window for the edge style
- Line thickness, width factor, what the line style shows and the reset move into the Edges drawn window
- The cog on the Edge style card and its own window go away
- Defaults stay combined, curved, by count, factor 1, edge type

### 6. Follow-ups
- The two reset buttons of the Edges shown window share one row and fill it
- Focusing a folder or leaving it keeps the boxes opened and moved; leaving it brings that folder into view
- The inspector of the metrics and the dependency view is resized by dragging its left edge, with one shared width
- A filled badge counts the cycles a closed box keeps to itself, an outlined one, on open boxes too, those it shares
  with files outside it; the tooltips of boxes and declarations name both

## Steps

- [x] Complete Task 1: Double click opens the box only
- [x] Complete Task 2: Tooltip names the box, not its path
- [x] Complete Task 3: Pan with the right mouse button
- [x] Complete Task 4: Edges shown: three types by default
- [x] Complete Task 5: One window for the edge style
- [x] Complete Task 6: Follow-ups
- [x] Changelog, format check, unit tests, lint, type check

## Notes

- Decided with Christian: wait briefly for the single click rather than open the inspector and take it back;
  default plus reset button for the shown edge types; tooltip keeps its extra rows.
- ECharts' own pan ignores the right button, so the right drag moves the shown window itself.
- Open: a map whose edge metric is not `dependencies` carries plain dependencies only, so with the new default it
  starts without edges until Dependency is ticked.
- Verified in Chromium on a build: double click, single click with the inspector, right drag, context menu, both
  windows of the bar, focus and unfocus, resizing the inspector. The one row of reset buttons was not looked at.
