---
name: Dependency view spike (levelized structure map)
issue: -
state: complete
version: -
---

## Goal

A third view, next to Metric and Domain, that draws the dependency lens's physical graph as a levelized
structure map: folders as nested boxes, children in rows by level that wrap to keep each box near a target
aspect ratio (design 22), file edges typed by `isCyclic`/`isPointingUpwards`.

## Tasks

### 1. Lens: levels and availability
- `dependencyLevelsSelector` merges the visible files' `dependencyLevels`, prefixed like the edges in a
  partial selection
- `hasDependencyDataSelector`, `isLoadedFileSetWithoutDependencyLensSelector`

### 2. Renderer: pure layout and edge projection (`renderer/dependencyGraph/`)
- Visible tree: only nodes with a level or leveled descendants; expanded/collapsed folders
- Levelized layout: rows by level (highest on top), wrapping chosen by aspect ratio
- Edge projection: endpoints lifted to their visible representative, weight = count, flags OR-ed,
  edge type derived from the two flags; edge filter (none / all / cycles / feedback)
- Initial expansion within a node budget

### 3. Renderer: ECharts host
- Custom series on a cartesian grid, pan + zoom via inside data zoom, labels stay readable
- Click selects, double-click or the toggle expands/collapses, hover shows a node's edges, right-click
  opens the node context menu, tooltip on edges

### 4. Feature + view
- `features/dependencyMap/`: read/write stores, selectors composing lens + render model + shared view,
  toolbox (edge filter, reset view)
- `views/dependencyView/`, route `/dependencies`, nav tab only with dependency data, redirect with a toast
  otherwise, spinner and view readiness

### 5. Wrap-up
- CHANGELOG entry, all checks green

## Steps

- [x] Complete Task 1: Lens
- [x] Complete Task 2: Layout and edge projection
- [x] Complete Task 3: ECharts host
- [x] Complete Task 4: Feature + view
- [x] Complete Task 5: Wrap-up

## Notes

- Decisions (asked): new view; pan/zoom, expand/collapse, hover + filter, shared selection; aspect-ratio
  wrapping; all edges by default; tab only with dependency data; no sidebar explorer in the spike
- Expansion state is view state held by the feature, not persisted
- Wrapping: a row keeps up to six nodes before the aspect ratio (16:10) decides; the ratio alone stacked even
  two files into a column, since a node box is 4:1
- Paint order: open folders, level bands, edges, then files and closed folders on top, so an edge never
  takes a click meant for a box; ECharts' built-in hover is off because it lifted an open folder over its
  children
- Double click is taken from the browser's `dblclick` on the container: the redraw after the first click's
  selection made ECharts lose the second click
- Verified in a production build (headless Chromium) on the TypeScript sample and on this repo's own
  visualization (971 files, 2784 edges): first look, hover, filter, zoom, pan, reset, open/close

## Follow-ups

- A closed folder hides the cycles and upward edges inside it (the Upward filter then looks clean): mark it
- Many levels with few nodes each still make a tall, narrow root
- Sidebar explorer, screenshot button, e2e test

