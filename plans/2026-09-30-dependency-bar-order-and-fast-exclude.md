---
name: Reorder the dependency bar, move the graph buttons into it and speed up excluding in the dependency view
issue: -
state: complete
version: -
---

## Goal

The dependency bar reads like the other views' bars: edges shown, edge style (with the line thickness inside it), the
edge metric last, then the graph's buttons. Excluding in the dependency view no longer holds a long spinner.

## Tasks

### 1. Bar order and one edge style card
- Order: Edges shown → Edge style → Edge metric
- One "Edge style" card whose popover is sectioned like the color settings: style row with the chosen style's hint and
  the side-middle toggle, line thickness row with the width factor, a reset button

### 2. Graph buttons in the bar
- Reset layout (only once boxes were dragged), show the whole graph and Unfocus (only while focused) move from the
  graph's top-right corner to the end of the dependency bar

### 3. Fast exclude in the dependency view
- Only the metrics view waits for an exclusion's heavy dispatch; the dependency and domain views show no spinner for it
- The hidden metrics view is marked stale by changes it misses, so it redraws on return (was left outdated)

### 4. Verify and commit
- Unit suite, type check, format check, lint, e2e for the dependency view; changelog entry; commit per task

## Steps

- [x] Complete Task 1: Bar order and one edge style card
- [x] Complete Task 2: Graph buttons in the bar
- [x] Complete Task 3: Fast exclude in the dependency view
- [x] Complete Task 4: Verify and commit

## Notes

- The fit button reaches the graph through `DependencyMapViewStore.requestFit()` instead of the template reference
- Measured on a 29k-file map: the exclusion cost ~240 ms of selectors plus a fixed 400 ms spinner hold; the graph
  redraw itself is negligible. Remaining cost: accumulated tree, explorer tree clone, node/edge metric data, rule counts
